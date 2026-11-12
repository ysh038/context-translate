// native host 단위 테스트 — 가짜 claude(tests/fake-claude.mjs)로 프로토콜·대기 프로세스·취소·오류 처리 검증
// 실행: npm run test:host
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { leakedPrompt, maybeLeakStart, safePrefix } from '../native-host/leak-guard.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FAKE = path.join(ROOT, 'tests', 'fake-claude.mjs');
fs.chmodSync(FAKE, 0o755);
const SP = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-host-'));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const check = (name, ok, extra = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !extra ? '' : `  (${extra})`)); if (!ok) failed++; };

function startHost(claudeBin, fakeLog) {
  const proc = spawn(process.execPath, [path.join(ROOT, 'native-host', 'host.mjs')], {
    env: { ...process.env, CTT_CLAUDE_BIN: claudeBin, CTT_HOST_LOG: '0', FAKE_CLAUDE_LOG: fakeLog || '' },
    stdio: ['pipe', 'pipe', 'inherit']
  });
  const msgs = [];
  let buf = Buffer.alloc(0);
  proc.stdout.on('data', (c) => {
    buf = Buffer.concat([buf, c]);
    while (buf.length >= 4) {
      const n = buf.readUInt32LE(0);
      if (buf.length < 4 + n) break;
      msgs.push({ ...JSON.parse(buf.subarray(4, 4 + n).toString('utf8')), at: Date.now() });
      buf = buf.subarray(4 + n);
    }
  });
  const send = (m) => {
    const b = Buffer.from(JSON.stringify(m)); const h = Buffer.alloc(4); h.writeUInt32LE(b.length, 0);
    proc.stdin.write(Buffer.concat([h, b]));
  };
  const waitFor = async (pred, ms = 5000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { const m = msgs.find(pred); if (m) return m; await sleep(20); }
    return null;
  };
  const exited = new Promise((r) => proc.on('exit', r));
  return { proc, msgs, send, waitFor, exited };
}

const readLog = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)) : []);
const JOB = { model: 'haiku', system: 'Test system prompt' };

try {
  // 0) 출력 검사 (leak-guard.mjs) — claude가 붙인 내용의 흔적
  const SRC = '<context>워터마킹 설명</context>\n<text>How AI Text Watermarking Works\nLLM</text>\n<target_language>Korean</target_language>';
  const leak = (a, src = SRC, o) => leakedPrompt(a, src, o);
  check('guard: normal translations pass', !leak('AI 텍스트 워터마킹은 어떻게 작동하는가\nLLM') && !leak('How AI Text Watermarking Works\nLLM') && !leak('강둑 (명사)\n은행 · 둑') && !leak(''));
  check('guard: environment block (verbatim)', leak('# Environment\nYou have been invoked in the following environment: \n - Primary working directory: /private/var/folders/x/T/ctt-claude-sqEC2z'));
  check('guard: environment block translated to Korean (path survives)', leak('# 환경\n다음 환경에서 호출되었습니다:\n - 기본 작업 디렉터리: /private/var/folders/x/T/ctt-claude-sqEC2z\n - 플랫폼: darwin'));
  check('guard: custom working folder path', leak('작업 폴더: /Users/me/empty-folder-for-claude', SRC, { cwd: '/Users/me/empty-folder-for-claude' }) && !leak('작업 폴더: /Users/me/elsewhere', SRC, { cwd: '/Users/me/empty-folder-for-claude' }));
  check('guard: system-reminder tag (also mangled)', leak('<system-reminder>\nAs you answer') && leak('<\\~system-reminder>'));
  check('guard: account email, also when translated', leak('# userEmail\nThe user\'s email address is a@b.co') && leak('사용자의 이메일 주소는 someone@example.com 입니다.'));
  check('guard: email is caught as soon as "@" arrives; a trailing word or path is never streamed before it is complete',
    leak('사용자의 이메일 주소는 someone@') && safePrefix('사용자의 이메일 주소는 some') === '사용자의 이메일 주소는 ' && safePrefix('강둑 · 은행') === '강둑 · 은행' && safePrefix('the river bank.') === 'the river ' &&
    safePrefix('작업 디렉터리: /private/var/folders/x/T/ctt') === '작업 디렉터리: ');
  check('guard: model identity line translated', leak('Haiku 5.5라는 모델로 구동됩니다. 정확한 모델 ID는 claude-haiku-5-5입니다.'));
  check('guard: OS version line translated', leak(`OS 버전: ${os.type()} ${os.release()}`));
  check('guard: markers and emails already in the source are fine',
    !leak('문의는 help@example.com 으로', '<text>Contact help@example.com</text>') && !leak('문의: help@example.com.', '<text>Contact: help@example.com.</text>') &&
    !leak('문의는 help@', '<text>Contact help@example.com</text>') && !leak('@someone 님이 말했다', '<text>@someone said</text>') &&
    !leak('<system-reminder> 태그는 userEmail을 담는다', '<text>The <system-reminder> tag carries userEmail</text>') &&
    !leak('# Environment\n설정', '<text># Environment\nSettings</text>'));
  check('guard: holds back only a possible leak opening', maybeLeakStart('#') && maybeLeakStart('# Env') && maybeLeakStart('<system-rem') &&
    !maybeLeakStart('# 제목') && !maybeLeakStart('AI') && !maybeLeakStart('') && !maybeLeakStart('# Environment'));

  // 1) 정상 흐름
  const LOG = path.join(SP, 'fake.log');
  const h = startHost(FAKE, LOG);
  h.send({ type: 'ping' });
  const pong = await h.waitFor((m) => m.type === 'pong');
  check('ping → pong ok', pong?.ok === true && pong.version >= 1);

  const t0 = Date.now();
  h.send({ type: 'translate', id: 'a', ...JOB, user: 'Word: bank\nContext: the ⟦bank⟧ of the river' });
  const done = await h.waitFor((m) => m.type === 'done' && m.id === 'a');
  check('translate streams deltas then done', h.msgs.some((m) => m.type === 'delta' && m.id === 'a') && done?.text.startsWith('강둑'));
  check('done does not wait for post_turn_summary', done && done.at - t0 < 1400, done && `${done.at - t0}ms`);
  check('rate limit info forwarded', !!(await h.waitFor((m) => m.type === 'rate_limit', 500)));

  // 첫 요청 뒤 같은 (모델, 프롬프트)용 대기 프로세스가 미리 떠 있어야 함
  await sleep(300);
  const tSend = Date.now();
  h.send({ type: 'translate', id: 'b', ...JOB, user: 'Word: river' });
  await h.waitFor((m) => m.type === 'done' && m.id === 'b');
  const log1 = readLog(LOG);
  const msgB = log1.filter((e) => e.event === 'msg').pop();
  const startB = log1.find((e) => e.event === 'start' && e.pid === msgB?.pid);
  check('second request uses pre-spawned process', startB && startB.t < tSend);
  check('finished process is terminated', log1.some((e) => e.event === 'exit' && e.pid === msgB?.pid) ||
    (await sleep(300), readLog(LOG).some((e) => e.event === 'exit' && e.pid === msgB?.pid)));
  check('one process per request (no conversation reuse)', new Set(log1.filter((e) => e.event === 'msg').map((e) => e.pid)).size === 2);

  // warm: 다른 프롬프트용 대기 프로세스
  const before = readLog(LOG).filter((e) => e.event === 'start').length;
  h.send({ type: 'warm', jobs: [{ model: 'haiku', system: 'Another prompt' }] });
  await sleep(400);
  check('warm spawns a spare', readLog(LOG).filter((e) => e.event === 'start').length === before + 1);

  // 취소: 진행 중인 프로세스 종료, done 안 옴
  h.send({ type: 'translate', id: 'c', ...JOB, user: 'SLOW text' });
  await sleep(300);
  const msgC = readLog(LOG).filter((e) => e.event === 'msg').pop();
  h.send({ type: 'cancel', id: 'c' });
  await sleep(400);
  check('cancel kills the running process', readLog(LOG).some((e) => e.event === 'exit' && e.pid === msgC?.pid));
  check('cancelled request gets no done', !(await h.waitFor((m) => m.id === 'c' && m.type === 'done', 600)));

  // 출력이 계속 오면 오래 걸려도 시간 초과 아님 (idle timeout) — SLOW는 3초 지연 후 정상 응답
  h.send({ type: 'translate', id: 's', ...JOB, user: 'SLOW but fine' });
  check('slow but progressing request completes', !!(await h.waitFor((m) => m.id === 's' && m.type === 'done', 6000)));

  // thinking만 든 assistant 이벤트가 먼저 와도 빈 결과로 끝나면 안 됨
  h.send({ type: 'translate', id: 't', ...JOB, user: 'Word: THINK' });
  const doneT = await h.waitFor((m) => m.id === 't' && m.type === 'done');
  check('thinking-only assistant event does not end with empty text', doneT?.text.startsWith('강둑'), JSON.stringify(doneT));

  // 로그인 안 됨
  h.send({ type: 'translate', id: 'd', ...JOB, user: 'AUTHFAIL' });
  const errD = await h.waitFor((m) => m.id === 'd' && m.type === 'error');
  check('auth failure reported as error', errD && /AUTH/i.test(errD.code) && /login/i.test(errD.message));

  // claude가 프롬프트에 붙인 내용(환경 정보 등)이 번역 대신 나오면: 화면에 내보내지 않고 다시 시도
  check('claude gets the env that moves attached context before the text',
    readLog(LOG).filter((e) => e.event === 'start').every((e) => /(^|;)-mid_conv_system$/.test(e.capabilities)));
  const nMsg = () => readLog(LOG).filter((e) => e.event === 'msg').length;
  let n0 = nMsg();
  h.send({ type: 'translate', id: 'k1', ...JOB, user: '<text>LEAKONCE title</text>' });
  const doneK1 = await h.waitFor((m) => m.id === 'k1' && m.type === 'done');
  check('leaked answer is retried and the retry is returned', doneK1?.text.startsWith('그녀는') && nMsg() === n0 + 2, `${JSON.stringify(doneK1?.text)} msgs=${nMsg() - n0}`);
  const shown = (id) => h.msgs.filter((m) => m.id === id && (m.type === 'delta' || m.type === 'done')).map((m) => m.full ?? m.text);
  check('nothing of the leaked answer reaches the extension', !shown('k1').some((t) => /Environment|working directory|ctt-claude|^#/.test(t)), JSON.stringify(shown('k1').slice(0, 4)));

  n0 = nMsg();
  h.send({ type: 'translate', id: 'k2', ...JOB, user: '<text>LEAKMAIL title</text>' });
  const doneK2 = await h.waitFor((m) => m.id === 'k2' && m.type === 'done');
  const k2 = shown('k2');
  check('answer with an email not in the source is cut off, cleared and retried',
    doneK2?.text.startsWith('그녀는') && nMsg() === n0 + 2 && !k2.some((t) => /@|some/.test(t)) && k2.includes(''), JSON.stringify(k2.slice(0, 6)));

  n0 = nMsg();
  h.send({ type: 'translate', id: 'k3', ...JOB, user: '<text>LEAKALWAYS title</text>' });
  const errK3 = await h.waitFor((m) => m.id === 'k3' && m.type === 'error');
  check('leak on every try → error LEAK after 3 tries, no done', errK3?.code === 'LEAK' && nMsg() === n0 + 3 && !h.msgs.some((m) => m.id === 'k3' && m.type === 'done'), `${errK3?.code} msgs=${nMsg() - n0}`);

  // 원문에 같은 내용이 있으면(Claude Code를 다루는 글) 새어 나온 것으로 치지 않음
  h.send({ type: 'translate', id: 'k4', ...JOB, user: '<text>ECHO\n# Environment\nYou have been invoked in the following environment:\n - Primary working directory: /tmp/ctt-claude-abc</text>' });
  const doneK4 = await h.waitFor((m) => m.id === 'k4' && (m.type === 'done' || m.type === 'error'));
  check('same markers in the source text are not treated as a leak', doneK4?.type === 'done' && doneK4.text.includes('# Environment\nYou have been invoked'), JSON.stringify(doneK4));

  // 동시 요청 2개 (hover + 드래그)
  h.send({ type: 'translate', id: 'e1', ...JOB, user: 'Word: one' });
  h.send({ type: 'translate', id: 'e2', model: 'haiku', system: 'Another prompt', user: '<text>two</text>' });
  const [e1, e2] = await Promise.all([h.waitFor((m) => m.id === 'e1' && m.type === 'done'), h.waitFor((m) => m.id === 'e2' && m.type === 'done')]);
  check('concurrent requests both complete', !!(e1 && e2));

  // Chrome이 포트를 닫으면(stdin 종료) host 종료 + 자식 정리
  h.proc.stdin.end();
  const code = await Promise.race([h.exited, sleep(3000).then(() => 'timeout')]);
  await sleep(300);
  const final = readLog(LOG);
  const alive = final.filter((e) => e.event === 'start').map((e) => e.pid).filter((pid) => !final.some((x) => x.event === 'exit' && x.pid === pid));
  check('host exits on stdin close and cleans up children', code === 0 && alive.length === 0, `code=${code} alive=${alive}`);

  // 2) claude 실행 파일 없음
  const h2 = startHost(path.join(SP, 'no-such-claude'));
  h2.send({ type: 'ping' });
  const pong2 = await h2.waitFor((m) => m.type === 'pong');
  check('missing claude → pong ok:false with reason', pong2 && pong2.ok === false && /host:install/.test(pong2.reason));
  h2.send({ type: 'translate', id: 'x', ...JOB, user: 'hi' });
  const err2 = await h2.waitFor((m) => m.id === 'x' && m.type === 'error');
  check('missing claude → translate error NO_CLAUDE', err2?.code === 'NO_CLAUDE');
  h2.proc.stdin.end();
  await h2.exited;

  // 3) 설치 스크립트 — 임시 HOME에 설치 후, 저장소 밖으로 복사된 host가 단독으로 동작하는지
  const HOME = path.join(SP, 'home');
  const AS = path.join(HOME, 'Library', 'Application Support');
  fs.mkdirSync(path.join(AS, 'Google', 'Chrome'), { recursive: true });
  const inst = spawn(process.execPath, [path.join(ROOT, 'native-host', 'install.mjs')], { env: { ...process.env, HOME }, stdio: 'pipe' });
  let instOut = ''; inst.stdout.on('data', (d) => instOut += d); inst.stderr.on('data', (d) => instOut += d);
  const instCode = await new Promise((r) => inst.on('exit', r));
  const mfPath = path.join(AS, 'Google', 'Chrome', 'NativeMessagingHosts', 'dev.claude_tooltip_translate.cli.json');
  const mf = fs.existsSync(mfPath) && JSON.parse(fs.readFileSync(mfPath, 'utf8'));
  check('install writes host manifest for Chrome', instCode === 0 && mf && mf.allowed_origins[0].startsWith('chrome-extension://'), instOut);
  check('installed host lives outside the repo', mf && mf.path.startsWith(AS) && !mf.path.startsWith(ROOT));
  const run = spawn(mf.path, [], { stdio: ['pipe', 'pipe', 'inherit'], env: { PATH: '/usr/bin:/bin', HOME } }); // Chrome처럼 최소 환경
  const pingBody = Buffer.from(JSON.stringify({ type: 'ping' })); const ph = Buffer.alloc(4); ph.writeUInt32LE(pingBody.length, 0);
  run.stdin.write(Buffer.concat([ph, pingBody]));
  const reply = await new Promise((r) => { let b = Buffer.alloc(0); run.stdout.on('data', (c) => { b = Buffer.concat([b, c]); if (b.length >= 4 && b.length >= 4 + b.readUInt32LE(0)) r(JSON.parse(b.subarray(4, 4 + b.readUInt32LE(0)).toString())); }); setTimeout(() => r(null), 4000); });
  run.stdin.end();
  check('installed run.sh answers ping with minimal env', reply?.type === 'pong' && typeof reply.ok === 'boolean', JSON.stringify(reply));
} catch (e) {
  console.error(e); failed++;
} finally {
  fs.rmSync(SP, { recursive: true, force: true });
  console.log(failed ? `\n${failed} failed` : '\nall passed');
  process.exit(failed ? 1 : 0);
}
