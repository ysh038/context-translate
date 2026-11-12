// claude -p 프로세스 풀 — 개인용 전용
//
// 방식: (모델, 시스템 프롬프트)별로 대기 프로세스를 미리 띄워 두고, 요청 1개 = 프로세스 1개.
//   답(assistant 이벤트)이 오면 즉시 결과를 돌려주고 프로세스를 종료 → 새 대기 프로세스를 띄움.
//   - 대화가 쌓이지 않음 (매 요청이 깨끗한 문맥)
//   - 취소 = 프로세스 종료
//   - 답 이후의 post_turn_summary(추가 모델 호출, ~1.5s)를 기다리지 않고 발생도 안 시킴
// 실측(2026-11-05, haiku): 대기 프로세스 사용 시 첫 글자 0.7~1.1s / 완성 1.2~1.5s
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { leakedPrompt, maybeLeakStart, safePrefix } from './leak-guard.mjs';

const SPARES_PER_KEY = 1;          // 키별로 미리 띄워 둘 대기 프로세스 수
const MAX_KEYS = 4;                // 대기 프로세스를 유지할 (모델, 프롬프트) 조합 수
const SPARE_IDLE_MS = 15 * 60e3;   // 이 시간 동안 안 쓰면 대기 프로세스 정리
const IDLE_TIMEOUT_MS = 45e3;     // 이 시간 동안 claude 출력이 전혀 없으면 실패 (긴 텍스트는 오래 걸려도 계속 출력이 옴)
const MAX_TRIES = 3;               // 답에 claude가 붙인 내용이 새어 나오면 다시 시도 (처음 포함 이 횟수까지)

// claude에 넘기는 환경 변수.
// CLAUDE_CODE_MODEL_CAPABILITIES=-mid_conv_system:
//   `--system-prompt`를 줘도 Claude Code는 환경 정보(# Environment … 작업 폴더·플랫폼)·모델 이름·날짜를 요청에 붙이는데,
//   기본값에서는 이것이 **번역할 글 뒤**에 system 역할 메시지로 온다 → 모델이 마지막에 본 그 글을 번역 대상으로 착각
//   (Haiku, 아주 짧고 제목 같은 글에서 실제 발생. 안 새더라도 번역 앞에 "# "를 붙이곤 함).
//   이 기능을 끄면 같은 내용이 번역할 글 **앞**에 <system-reminder>로 들어가고, 번역할 글이 요청의 맨 끝에 온다.
//   2026-11-12 실측(claude 2.1.303, 가짜 API 서버로 요청 본문 확인 + 실제 호출): 같은 입력 5건 중 1건 샘 → 짧은 글 19건 중 0건.
//   --help에 없는 변수라 claude 버전이 바뀌면 안 먹을 수 있다(그러면 예전 위치로 돌아갈 뿐) → leak-guard.mjs의 출력 검사가 마지막 방어선.
//   붙는 내용을 아예 없애는 옵션·환경 변수는 찾지 못함 (--bare는 OAuth를 읽지 않아 쓸 수 없음).
export function claudeEnv(env = process.env) {
  return {
    ...env,
    CLAUDE_CODE_ENTRYPOINT: 'context-translate',
    CLAUDE_CODE_MODEL_CAPABILITIES: [env.CLAUDE_CODE_MODEL_CAPABILITIES, '-mid_conv_system'].filter(Boolean).join(';')
  };
}

export function claudeArgs({ model, system }) {
  return [
    '-p',
    '--model', model,
    '--system-prompt', system,
    '--tools', '',
    '--strict-mcp-config',
    '--setting-sources', '',
    '--no-session-persistence',
    '--disable-slash-commands',
    '--no-chrome',
    '--input-format', 'stream-json',
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages'
  ];
}

const keyOf = ({ model, system }) => createHash('sha1').update(model + '\0' + system).digest('hex').slice(0, 12);

class Worker {
  constructor(pool, job) {
    this.pool = pool;
    this.key = keyOf(job);
    this.job = { model: job.model, system: job.system };
    this.state = 'idle';           // idle | busy | dead
    this.createdAt = Date.now();
    this.req = null;
    this.buf = '';
    this.stderr = '';
    this.text = '';
    this.proc = spawn(pool.claudeBin, claudeArgs(job), {
      cwd: pool.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: claudeEnv()
    });
    this.proc.stdout.setEncoding('utf8');
    this.proc.stdout.on('data', (d) => this.onData(d));
    this.proc.stderr.setEncoding('utf8');
    this.proc.stderr.on('data', (d) => { this.stderr = (this.stderr + d).slice(-2000); });
    this.proc.stdin.on('error', () => {});
    this.proc.on('error', (e) => this.onExit(null, e));
    this.proc.on('exit', (code) => this.onExit(code));
  }

  run(req) {
    this.state = 'busy';
    this.req = req;
    this.text = '';
    req.startedAt ??= Date.now(); // 다시 시도하는 요청은 처음 시작한 때부터 잰다
    this.armTimeout();
    this.proc.stdin.write(JSON.stringify({ type: 'user', message: { role: 'user', content: req.user } }) + '\n');
  }

  armTimeout() {
    const req = this.req; if (!req) return;
    clearTimeout(req.timer);
    req.timer = setTimeout(() => this.fail('TIMEOUT', `claude가 ${IDLE_TIMEOUT_MS / 1000}초 동안 응답하지 않습니다.`), IDLE_TIMEOUT_MS);
  }

  onData(d) {
    this.buf += d;
    let i;
    while ((i = this.buf.indexOf('\n')) >= 0) {
      const line = this.buf.slice(0, i).trim();
      this.buf = this.buf.slice(i + 1);
      if (!line || !(this.req || this.draining)) continue;
      let e;
      try { e = JSON.parse(line); } catch { continue; }
      this.onEvent(e);
    }
  }

  onEvent(e) {
    if (e.type === 'rate_limit_event') {
      this.pool.emit({ type: 'rate_limit', info: e.rate_limit_info });
      if (this.draining) this.kill();
      return;
    }
    const req = this.req;
    if (!req) return;
    this.armTimeout();
    if (e.type === 'stream_event') {
      const ev = e.event;
      if (ev?.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
        this.text += ev.delta.text;
        if (this.leaked(this.text)) return this.retryLeak();
        if (maybeLeakStart(this.text)) return; // 새는 답의 첫머리일 수 있음 — 다음 글자를 보고 정함
        const full = safePrefix(this.text);
        if (!full || full === req.shown) return;
        if (!req.ttft) req.ttft = Date.now() - req.startedAt;
        req.shown = full;
        this.pool.emit({ type: 'delta', id: req.id, full });
      }
    } else if (e.type === 'assistant') {
      const text = (e.message?.content || []).filter((c) => c.type === 'text').map((c) => c.text).join('');
      if (e.error) return this.fail(String(e.error).toUpperCase(), text || String(e.error));
      // claude는 content block마다 assistant 이벤트를 보냄 — thinking만 든 이벤트에서 끝내면 빈 번역이 됨 (Haiku 5.5에서 실제 발생)
      if (!(e.message?.content || []).some((c) => c.type === 'text')) return;
      if (this.leaked(text || this.text)) return this.retryLeak();
      this.finish(text || this.text);
    } else if (e.type === 'result' && e.is_error) {
      this.fail('RESULT_ERROR', typeof e.result === 'string' ? e.result : 'claude 실행 오류');
    }
  }

  // 번역 대신 claude가 프롬프트에 붙인 내용(환경 정보·system-reminder·계정 이메일)이 나왔는가 — leak-guard.mjs
  leaked(text) {
    return leakedPrompt(text, this.req.user, { cwd: this.pool.realCwd });
  }

  // 새어 나온 답은 버리고(이 프로세스 종료) 새 프로세스로 다시 시도
  retryLeak() {
    const req = this.req; if (!req) return;
    this.req = null;
    clearTimeout(req.timer);
    this.kill();
    this.pool.retryLeaked(req, this.job);
  }

  finish(text) {
    const req = this.req; if (!req) return;
    this.req = null;
    clearTimeout(req.timer);
    const ms = Date.now() - req.startedAt;
    this.pool.emit({ type: 'done', id: req.id, text, ttft: req.ttft || ms, ms });
    this.pool.onWorkerDone(this, req, { ok: true, ms, ttft: req.ttft || ms });
    // 답 직후 오는 rate_limit_event(구독 한도 정보)만 받고 종료 — post_turn_summary(추가 모델 호출)는 기다리지 않음
    this.draining = true;
    this.drainTimer = setTimeout(() => this.kill(), 300);
  }

  fail(code, message) {
    const req = this.req; if (!req) return;
    this.req = null;
    clearTimeout(req.timer);
    this.pool.emit({ type: 'error', id: req.id, code, message });
    this.pool.onWorkerDone(this, req, { ok: false, code });
    this.kill();
  }

  kill() {
    clearTimeout(this.drainTimer);
    this.draining = false;
    if (this.state === 'dead') return;
    this.state = 'dead';
    try { this.proc.kill('SIGTERM'); } catch {}
  }

  onExit(code, err) {
    const wasDead = this.state === 'dead';
    this.state = 'dead';
    this.pool.forget(this);
    if (this.req) {
      const detail = err ? err.message : (this.stderr.trim().split('\n').pop() || `exit ${code}`);
      this.fail(err?.code === 'ENOENT' ? 'NO_CLAUDE' : 'EXIT', err?.code === 'ENOENT'
        ? `claude 실행 파일을 찾을 수 없습니다: ${this.pool.claudeBin}`
        : `claude가 비정상 종료되었습니다: ${detail}`);
    } else if (!wasDead) {
      this.pool.log(`spare exited (${code}) ${this.stderr.trim().split('\n').pop() || ''}`);
    }
  }
}

export class ClaudePool {
  /**
   * @param {object} o
   * @param {string} o.claudeBin  claude 실행 파일 절대 경로
   * @param {(msg: object) => void} o.emit  확장으로 보낼 메시지
   * @param {(s: string) => void} [o.log]
   * @param {string} [o.cwd]      claude 작업 디렉터리 (프로젝트 CLAUDE.md 등을 읽지 않도록 빈 폴더)
   */
  constructor({ claudeBin, emit, log = () => {}, cwd }) {
    this.claudeBin = claudeBin;
    this.emit = emit;
    this.log = log;
    this.cwd = cwd || fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-claude-'));
    try { this.realCwd = fs.realpathSync(this.cwd); } catch { this.realCwd = this.cwd; } // claude가 환경 정보에 적는 경로 (/var → /private/var)
    this.spares = new Map();   // key → { job, workers: Worker[], lastUsed }
    this.active = new Map();   // request id → Worker
    this.stats = { requests: 0, errors: 0 };
    this.sweeper = setInterval(() => this.sweep(), 60e3);
    this.sweeper.unref?.();
  }

  /** 대기 프로세스 미리 띄우기 */
  warm(job) {
    const k = keyOf(job);
    let slot = this.spares.get(k);
    if (!slot) {
      slot = { job: { model: job.model, system: job.system }, workers: [], lastUsed: Date.now() };
      this.spares.set(k, slot);
      this.evictKeys();
    }
    slot.workers = slot.workers.filter((w) => w.state === 'idle');
    while (slot.workers.length < SPARES_PER_KEY) slot.workers.push(new Worker(this, slot.job));
  }

  translate({ id, model, system, user }) {
    this.stats.requests++;
    this.start({ id, user, tries: 1 }, { model, system });
  }

  // 대기 프로세스가 있으면 그것으로, 없으면 새로 띄워 요청을 보낸다
  start(req, job) {
    const k = keyOf(job);
    const slot = this.spares.get(k);
    let w = slot?.workers.find((x) => x.state === 'idle');
    req.warm = !!w;
    if (w) slot.workers.splice(slot.workers.indexOf(w), 1);
    else w = new Worker(this, job);
    this.active.set(req.id, w);
    w.run(req);
    this.warm(job); // 다음 요청용 대기 프로세스 보충
    this.spares.get(k).lastUsed = Date.now();
  }

  // 답에 claude가 붙인 내용이 새어 나옴 → 다시 시도, MAX_TRIES번 모두 그러면 오류 (번역 텍스트는 로그에 남기지 않음)
  retryLeaked(req, job) {
    this.active.delete(req.id);
    this.log(`req leak try=${req.tries}/${MAX_TRIES} after ${Date.now() - req.startedAt}ms`);
    if (req.shown) { req.shown = ''; this.emit({ type: 'delta', id: req.id, full: '' }); } // 이미 보여 준 글자 지우기
    if (req.tries >= MAX_TRIES) {
      this.stats.errors++;
      return this.emit({ type: 'error', id: req.id, code: 'LEAK', message: '번역 대신 엉뚱한 내용이 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.' });
    }
    req.tries++;
    req.ttft = 0;
    this.start(req, job);
  }

  cancel(id) {
    const w = this.active.get(id);
    if (!w) return;
    this.active.delete(id);
    if (w.req) { clearTimeout(w.req.timer); this.log(`req cancel after ${Date.now() - w.req.startedAt}ms`); w.req = null; }
    w.kill();
  }

  onWorkerDone(w, req, info) {
    this.active.delete(req.id);
    if (!info.ok) this.stats.errors++;
    this.log(`req ${info.ok ? 'ok' : 'fail ' + info.code} warm=${req.warm} ttft=${info.ttft ?? '-'} ms=${info.ms ?? '-'}`);
  }

  forget(w) {
    const slot = this.spares.get(w.key);
    if (slot) slot.workers = slot.workers.filter((x) => x !== w);
  }

  evictKeys() {
    while (this.spares.size > MAX_KEYS) {
      const [oldK, oldest] = [...this.spares.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
      oldest.workers.forEach((w) => w.kill());
      this.spares.delete(oldK);
    }
  }

  sweep() {
    const now = Date.now();
    for (const [k, slot] of this.spares) {
      if (now - slot.lastUsed > SPARE_IDLE_MS) { slot.workers.forEach((w) => w.kill()); this.spares.delete(k); }
    }
  }

  shutdown() {
    clearInterval(this.sweeper);
    for (const slot of this.spares.values()) slot.workers.forEach((w) => w.kill());
    for (const w of this.active.values()) w.kill();
  }
}
