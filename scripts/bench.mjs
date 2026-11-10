#!/usr/bin/env node
// 번역 엔진 속도·품질 비교: Gemini API(무료 등급) vs claude -p
// 확장과 같은 프롬프트(core/prompts.js)로 같은 예시를 보내고, 첫 글자·완성 시간과 결과를 나란히 보여준다.
//
//   GEMINI_API_KEY=... npm run bench
//   GEMINI_API_KEY=... npm run bench -- --models gemini-3.5-flash-lite --no-claude
//
// 옵션
//   --models a,b        Gemini 모델 (기본: gemini-3.5-flash-lite,gemini-3.8-flash)
//   --thinking m=level  모델별 thinkingLevel (기본: flash-lite=minimal, 그 외=low — 각 모델이 허용하는 가장 낮은 단계)
//   --claude <model>    claude -p 모델 (기본 haiku) / --no-claude 로 끔. 본인 구독 사용량을 씀(요청 10건 정도)
//   --only word|text    한쪽만
//   --repeat N          예시마다 N번 (속도 편차 보기)
//   --gap ms            같은 Gemini 모델 요청 사이 최소 간격 (기본: 무료 등급 RPM에 맞춰 자동)
//   --out file.json     결과 저장
//   --cold              Gemini 연결을 미리 열지 않고 측정 (기본은 미리 열어 둠 — Chrome에서 계속 쓰는 상황)
//
// 무료 등급 한도(2026-11-10, AI Studio 화면): Flash-Lite 15 RPM / 500 RPD, Flash 5 RPM / 20 RPD
// → Flash는 한 번 돌릴 때마다 하루 한도의 절반쯤을 씀. API 키는 출력·저장하지 않음
import { execSync } from 'node:child_process';
import fs from 'node:fs';

globalThis.__EDITION__ = { name: 'bench', defaults: {} }; // core/settings.js가 빌드 시 치환되는 값을 기대함
const { buildPrompt, tidyWordAnswer } = await import('../core/prompts.js');
const { ClaudePool } = await import('../native-host/claude-pool.mjs');

/* ───────── 옵션 ───────── */
const argv = process.argv.slice(2);
const opt = (name, def) => { const i = argv.indexOf('--' + name); return i >= 0 ? argv[i + 1] : def; };
const MODELS = opt('models', 'gemini-3.5-flash-lite,gemini-3.8-flash').split(',').map((s) => s.trim()).filter(Boolean);
const CLAUDE_MODEL = argv.includes('--no-claude') ? null : opt('claude', 'haiku');
const ONLY = opt('only', null);
const REPEAT = Math.max(1, Number(opt('repeat', 1)));
const OUT = opt('out', null);
const API_BASE = process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com';
const KEY = process.env.GEMINI_API_KEY;

const thinkingOverrides = Object.fromEntries((opt('thinking', '') || '').split(',').filter(Boolean).map((p) => p.split('=')));
const thinkingOf = (m) => thinkingOverrides[m] || (/flash-lite/.test(m) ? 'minimal' : 'low');
const FREE_RPM = (m) => (/flash-lite/.test(m) ? 15 : 5); // 모르는 모델은 보수적으로 5
const gapOf = (m) => Number(opt('gap', '')) || Math.ceil(60000 / FREE_RPM(m)) + 300;

if (MODELS.length && !KEY) {
  console.error('GEMINI_API_KEY 환경변수가 없습니다. 예: GEMINI_API_KEY=... npm run bench');
  process.exit(1);
}

/* ───────── 예시 (⟦ ⟧ = 마우스를 올린 단어, 확장이 보내는 문맥 형식과 같음) ───────── */
const S = { targetLang: 'ko', fallbackLang: 'en', showAlternatives: true };
const word = (text, context, note) => ({ mode: 'word', text, context, note });
const CASES = [
  word('run', 'I need to ⟦run⟧ a quick errand before the meeting.', '볼일을 보다 (달리다 X)'),
  word('bank', 'She sat on the ⟦bank⟧ of the river and watched the boats drift by.', '강둑 (은행 X)'),
  word('fine', 'He had to pay a ⟦fine⟧ for parking in the wrong spot.', '벌금'),
  word('address', 'We need to ⟦address⟧ this issue before the release.', '다루다/해결하다'),
  word('pitched', 'The startup ⟦pitched⟧ its idea to investors last week.', '제안·발표하다, 원형 pitch'),
  word('배', '점심을 많이 먹어서 ⟦배⟧가 부르다.', '한국어 → 영어: stomach'),
  word('引き出し', '書類は机の⟦引き出し⟧に入れておいた。', '일본어 → 한국어: 서랍'),
  { mode: 'text', note: '일반 문장', text: "The new policy will take effect next month, but critics say it doesn't go far enough." },
  { mode: 'text', note: '관용 표현', text: "Let's not beat around the bush — the project is way behind schedule and we're running out of runway." },
  { mode: 'text', note: '긴 단락 (~600자)', text:
    'Caching is one of those ideas that sounds trivial until you try to get it right. The hard part is rarely storing the data; ' +
    'it is deciding when the stored copy stops being true. A cache that is too eager to expire throws away most of its benefit, ' +
    'while one that holds on too long quietly serves stale answers that nobody notices until a customer does. Most teams end up ' +
    'with a mix of short time-to-live values for volatile data and explicit invalidation for anything that users can edit directly.' }
].filter((c) => !ONLY || c.mode === ONLY);

/* ───────── Gemini (generateContent 스트리밍) ───────── */
async function gemini(model, req) {
  const { system, user, maxTokens } = buildPrompt(req, S);
  const t0 = performance.now();
  try {
    return await geminiStream(model, system, user, maxTokens, t0);
  } catch (e) { // 연결 실패·시간 초과도 결과로 남기고 다음 예시로 진행
    const c = e.cause?.code || e.cause?.errors?.[0]?.code || e.name;
    return { error: `네트워크 오류 (${c}): ${e.message}`, ms: Math.round(performance.now() - t0) };
  }
}

async function geminiStream(model, system, user, maxTokens, t0) {
  const res = await fetch(`${API_BASE}/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    signal: AbortSignal.timeout(45000), // 확장의 무응답 시간 초과와 같은 45초
    headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      // max_output_tokens에는 생각(thought) 토큰도 포함되므로 여유를 둠
      generationConfig: { maxOutputTokens: maxTokens + 1024, thinkingConfig: { thinkingLevel: thinkingOf(model).toUpperCase() } }
    })
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    let msg = body; try { msg = JSON.parse(body).error?.message || body; } catch {}
    return { error: `HTTP ${res.status}: ${String(msg).slice(0, 200)}`, ms: Math.round(performance.now() - t0) };
  }
  let text = '', ttft = null, usage = null, finish = null, buf = '';
  const dec = new TextDecoder();
  for await (const chunk of res.body) {
    buf += dec.decode(chunk, { stream: true });
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line.startsWith('data:')) continue;
      let ev; try { ev = JSON.parse(line.slice(5)); } catch { continue; }
      const cand = ev.candidates?.[0];
      for (const p of cand?.content?.parts || []) {
        if (p.thought || !p.text) continue;
        if (ttft == null) ttft = performance.now() - t0;
        text += p.text;
      }
      if (cand?.finishReason) finish = cand.finishReason;
      if (ev.usageMetadata) usage = ev.usageMetadata;
    }
  }
  const ms = performance.now() - t0;
  return {
    text: text.trim(), ttft: Math.round(ttft ?? ms), ms: Math.round(ms), finish,
    tokens: usage && { in: usage.promptTokenCount, out: usage.candidatesTokenCount, thought: usage.thoughtsTokenCount || 0 }
  };
}

/* ───────── claude -p (확장과 같은 대기 프로세스 풀) ───────── */
let pool = null;
const waiting = new Map();
function claudeBin() {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  try { return execSync('command -v claude', { encoding: 'utf8', shell: '/bin/zsh' }).trim(); } catch { return null; }
}
async function startClaude() {
  const bin = claudeBin();
  if (!bin) { console.error('claude를 찾지 못해 claude 비교는 건너뜁니다 (--no-claude로 끌 수 있음)'); return false; }
  pool = new ClaudePool({
    claudeBin: bin,
    emit: (m) => {
      const w = waiting.get(m.id);
      if (!w || (m.type !== 'done' && m.type !== 'error')) return;
      waiting.delete(m.id);
      w(m.type === 'done' ? { text: m.text.trim(), ttft: m.ttft, ms: m.ms } : { error: `${m.code}: ${m.message}` });
    }
  });
  // 확장처럼 단어용·문장용 대기 프로세스를 미리 띄워 둠 (시동 시간은 측정에서 제외)
  for (const mode of ['word', 'text']) pool.warm({ model: CLAUDE_MODEL, system: buildPrompt({ mode, text: '' }, S).system });
  await sleep(2500);
  return true;
}
let seq = 0;
function claude(req) {
  const { system, user } = buildPrompt(req, S);
  const id = 'b' + (++seq);
  return new Promise((resolve) => {
    waiting.set(id, resolve);
    pool.translate({ id, model: CLAUDE_MODEL, system, user });
  });
}

/* ───────── 실행 ───────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const lastCall = new Map();
async function paced(model, fn) { // 무료 등급 RPM을 넘지 않도록 같은 모델 요청 간격 유지
  const wait = (lastCall.get(model) || 0) + gapOf(model) - Date.now();
  if (wait > 0) await sleep(wait);
  lastCall.set(model, Date.now());
  return fn();
}

// 한도 초과(429)가 한 번 나면 그 모델은 이후 요청을 보내지 않음 (Flash 무료는 하루 20회라 금방 참)
const exhausted = new Set();
// Node fetch는 쉬는 연결을 ~4초 뒤 닫아서, 요청 간격(4~12초) 때문에 매번 새 TLS 연결 비용이 들어감.
// 확장(Chrome)은 연결을 훨씬 오래 유지하므로, 측정 직전에 모델 정보 조회(GET, 생성 한도와 무관)로 연결을 열어 둠.
// --cold 를 주면 이 과정 없이 측정 (오랜만에 번역할 때에 가까움)
const COLD = argv.includes('--cold');
async function preconnect(m) {
  const t0 = performance.now();
  try {
    const r = await fetch(`${API_BASE}/v1beta/models/${m}`, { headers: { 'x-goog-api-key': KEY }, signal: AbortSignal.timeout(15000) });
    await r.arrayBuffer();
    return { ok: r.ok, status: r.status, ms: Math.round(performance.now() - t0) };
  } catch (e) { return { ok: false, status: e.cause?.code || e.name, ms: Math.round(performance.now() - t0) }; }
}
async function runGemini(m, req) {
  if (exhausted.has(m)) return { error: '건너뜀 — 앞에서 한도 초과(429)' };
  const r = await paced(m, async () => {
    const pc = COLD ? null : await preconnect(m);
    const out = await gemini(m, req);
    return pc ? { ...out, connectMs: pc.ms } : out;
  });
  if (r.error?.startsWith('HTTP 429')) exhausted.add(m);
  return r;
}
const engines = [...MODELS.map((m) => ({ name: m, run: (req) => runGemini(m, req) }))];
if (CLAUDE_MODEL && await startClaude()) engines.push({ name: `claude -p ${CLAUDE_MODEL}`, run: (req) => claude(req) });

const total = CASES.length * REPEAT;
console.log(`예시 ${CASES.length}개 × ${REPEAT}회 · 엔진: ${engines.map((e) => e.name).join(', ')}`);
for (const m of MODELS) console.log(`  ${m}: thinkingLevel=${thinkingOf(m)}, 요청 ${total}건, 간격 ${(gapOf(m) / 1000).toFixed(1)}s (무료 ${FREE_RPM(m)} RPM)`);
// 시작 전 연결·모델 이름 확인 (생성 요청이 아니라 한도를 쓰지 않음)
for (const m of MODELS) {
  const pc = await preconnect(m);
  console.log(`  ${m}: 연결 확인 ${pc.ok ? 'OK' : '실패 ' + pc.status} (${(pc.ms / 1000).toFixed(2)}s)`);
}
console.log(COLD ? '  --cold: 매 요청 새 연결로 측정' : '  매 요청 직전에 연결을 열어 두고 측정 (Chrome에서 계속 쓰는 상황)');
console.log('');

const results = [];
for (const c of CASES) {
  const label = c.mode === 'word' ? `[단어] ${c.text} — 기대: ${c.note}` : `[문장] ${c.note}`;
  console.log('━'.repeat(60) + '\n' + label + (c.mode === 'text' && c.text.length < 200 ? `\n  ${c.text}` : ''));
  for (let r = 0; r < REPEAT; r++) {
    // 엔진들을 동시에 보내면 서로 영향이 없어 시간이 줄어듦 (Gemini는 모델별로 간격 유지)
    const outs = await Promise.all(engines.map(async (e) => {
      const o = { engine: e.name, ...(await e.run(c)) };
      if (c.mode === 'word' && o.text) { // 확장(background)과 같은 형식 정리 — 사용자에게 보이는 결과로 비교
        const t = tidyWordAnswer(o.text);
        if (t !== o.text) { o.raw = o.text; o.text = t; o.tidied = true; }
      }
      return o;
    }));
    for (const o of outs) {
      results.push({ case: c.note, mode: c.mode, word: c.mode === 'word' ? c.text : undefined, rep: r, ...o });
      const meta = o.error ? '오류' : `첫 글자 ${(o.ttft / 1000).toFixed(2)}s · 완성 ${(o.ms / 1000).toFixed(2)}s` +
        (o.tokens ? ` · 토큰 in ${o.tokens.in}/out ${o.tokens.out}/생각 ${o.tokens.thought}` : '') +
        (o.finish && o.finish !== 'STOP' ? ` · finish=${o.finish}` : '') +
        (o.connectMs != null ? ` · (연결 준비 ${(o.connectMs / 1000).toFixed(2)}s, 측정 제외)` : '') +
        (o.tidied ? ' · 형식 정리됨' : '');
      const body = o.error || (c.mode === 'text' && o.text.length > 160 ? o.text.slice(0, 160) + '…' : o.text);
      console.log(`\n  ▸ ${o.engine}${REPEAT > 1 ? ` #${r + 1}` : ''}  (${meta})\n    ${body.replace(/\n/g, '\n    ')}`);
    }
  }
  console.log('');
}

/* ───────── 단어 형식 검사 ─────────
   통과: 1~2줄, 1줄이 "(품사…)"로 끝남, 2줄이 품사만/품사로 시작하지 않음, 혼잣말·설명 없음 */
const POS = /^\(?\s*(명사|동사|형용사|부사|대명사|전치사|접속사|감탄사|noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|名詞|動詞|形容詞|副詞)\s*\)?$/i;
function formatOk(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 1 || lines.length > (S.showAlternatives ? 2 : 1)) return false;
  if (!/\([^()]+\)$/.test(lines[0])) return false;
  if (lines[1] && POS.test(lines[1].split(' · ')[0].trim())) return false;
  return !/\b(wait|line \d|correction|answer in|format)\b|입니다\.|의미입니다/i.test(text);
}
for (const r of results) if (r.mode === 'word' && !r.error) r.formatOk = formatOk(r.text);

/* ───────── 요약 ───────── */
const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
const fmt = (v) => (v == null ? '-' : (v / 1000).toFixed(2) + 's');
console.log('━'.repeat(60) + '\n요약 (중앙값)\n');
console.log('엔진'.padEnd(26) + '단어 첫글자  단어 완성   문장 완성   오류   단어 형식');
for (const e of engines) {
  const rs = results.filter((x) => x.engine === e.name);
  const ok = rs.filter((x) => !x.error);
  const w = ok.filter((x) => x.mode === 'word'), t = ok.filter((x) => x.mode === 'text');
  console.log(e.name.padEnd(26) + [median(w.map((x) => x.ttft)), median(w.map((x) => x.ms)), median(t.map((x) => x.ms))]
    .map((v) => fmt(v).padEnd(12)).join('') + `${rs.length - ok.length}/${rs.length}`.padEnd(7) + (w.length ? `${w.filter((x) => x.formatOk).length}/${w.length}` : '-'));
  const bad = w.filter((x) => !x.formatOk);
  if (bad.length) console.log('  형식 어긋남: ' + bad.map((x) => x.word).join(', '));
}
console.log('\n※ 시간은 이 Mac에서 API까지 왕복 포함. 확장에서는 내부 통신이 0.1초 안팎 더해짐');

if (OUT) { fs.writeFileSync(OUT, JSON.stringify({ at: new Date().toISOString(), models: MODELS, claude: CLAUDE_MODEL, results }, null, 2)); console.log(`결과 저장: ${OUT}`); }
pool?.shutdown();
process.exit(0);
