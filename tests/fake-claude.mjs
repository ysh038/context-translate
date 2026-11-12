#!/usr/bin/env node
// 테스트용 가짜 claude — `claude -p --input-format stream-json --output-format stream-json …` 출력 형식을 흉내
// (실제 출력 예시는 2026-11-05 claude 2.1.303 기준)
// 입력 내용에 따라:  'SLOW' → 응답 3초 지연 / 'SLOWTEXT' → 4초 / 'AUTHFAIL' → 로그인 안 됨 오류 / 'THINK' → 텍스트 전에 thinking만 든 assistant 이벤트
//                   'LEAKONCE' → 같은 요청의 첫 번째 답만 번역 대신 환경 정보(실제 claude가 프롬프트에 붙이는 내용)를 출력 / 'LEAKALWAYS' → 매번
//                   'ECHO' → <text> 안의 글을 그대로 출력
//                   'LEAKMAIL' → 첫 번째 답만 계정 이메일이 든 문장을 한국어로 출력 (FAKE_CLAUDE_LOG가 있어야 "첫 번째"를 셀 수 있음)
// FAKE_CLAUDE_LOG=<file> 이면 프로세스 시작/메시지/종료를 JSON 줄로 기록
import fs from 'node:fs';

const args = process.argv.slice(2);
const LOG = process.env.FAKE_CLAUDE_LOG;
const log = (o) => { if (LOG) fs.appendFileSync(LOG, JSON.stringify({ pid: process.pid, t: Date.now(), ...o }) + '\n'); };
const out = (o) => process.stdout.write(JSON.stringify(o) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// host가 꼭 넘겨야 하는 옵션 확인
const need = [['--tools', ''], ['--setting-sources', ''], ['--input-format', 'stream-json'], ['--output-format', 'stream-json']];
for (const [flag, val] of need) {
  const i = args.indexOf(flag);
  if (i < 0 || args[i + 1] !== val) { process.stderr.write(`fake-claude: missing ${flag} ${val}\n`); process.exit(2); }
}
for (const flag of ['-p', '--system-prompt', '--model', '--include-partial-messages', '--no-session-persistence']) {
  if (!args.includes(flag)) { process.stderr.write(`fake-claude: missing ${flag}\n`); process.exit(2); }
}

log({ event: 'start', model: args[args.indexOf('--model') + 1], capabilities: process.env.CLAUDE_CODE_MODEL_CAPABILITIES || '' });
process.on('SIGTERM', () => { log({ event: 'exit', signal: 'SIGTERM' }); process.exit(0); });

let buf = '';
let busy = Promise.resolve();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (d) => {
  buf += d;
  let i;
  while ((i = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!line.trim()) continue;
    const msg = JSON.parse(line);
    busy = busy.then(() => answer(msg.message.content));
  }
});
process.stdin.on('end', () => busy.then(() => { log({ event: 'exit', signal: 'eof' }); process.exit(0); }));

// 실제 claude 2.1.303이 붙이는 환경 정보 (작업 폴더는 실제 값)
const ENV_BLOCK = `# Environment\nYou have been invoked in the following environment: \n - Primary working directory: ${process.cwd()}\n - Is a git repository: false\n - Platform: darwin\n - Shell: zsh`;
const seenBefore = (content) => (LOG && fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [])
  .filter((e) => e.event === 'msg' && e.content === content).length;

async function answer(content) {
  const nth = seenBefore(content); // 같은 내용의 요청을 몇 번 받았나 (host가 다시 시도하면 늘어남)
  log({ event: 'msg', word: content.startsWith('Word:'), model: args[args.indexOf('--model') + 1], content }); // 테스트 검증용
  const sid = 'fake-session';
  out({ type: 'system', subtype: 'init', session_id: sid, tools: [], model: 'claude-haiku-fake', apiKeySource: 'none' });
  out({ type: 'system', subtype: 'status', status: 'requesting', session_id: sid });
  if (content.includes('AUTHFAIL')) {
    out({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: 'Not logged in · Please run /login' }] }, error: 'authentication_failed', session_id: sid });
    out({ type: 'result', subtype: 'success', is_error: true, result: 'Not logged in · Please run /login', session_id: sid });
    return;
  }
  await sleep(content.includes('SLOWTEXT') ? 4000 : content.includes('SLOW') ? 3000 : 60);
  if (content.includes('THINK')) { // 실제 Haiku 5.5: thinking 블록용 assistant 이벤트가 텍스트보다 먼저 옴
    out({ type: 'stream_event', event: { type: 'content_block_start', index: 0, content_block: { type: 'thinking', thinking: '' } }, session_id: sid });
    out({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'thinking', thinking: '', signature: 'x' }] }, session_id: sid });
    await sleep(100);
  }
  const text = content.includes('LEAKALWAYS') || (content.includes('LEAKONCE') && nth === 0) ? ENV_BLOCK
    : content.includes('ECHO') ? content.match(/<text>([\s\S]*)<\/text>/)[1]
    : content.includes('LEAKMAIL') && nth === 0 ? '사용자의 이메일 주소는 someone@example.com 입니다. 작성자 표시에만 사용하세요.'
    : content.startsWith('Word:') ? '강둑 (명사)\n은행 · 둑 · 비축'
    : content.includes('FLIPALWAYS') ? 'This sentence is mostly Korean and only one word is English.' // 다른 언어로 뒤집힌 답 흉내
      : '그녀는 강둑에 앉아 배들이 떠내려가는 것을 지켜보았다.';
  out({ type: 'stream_event', event: { type: 'message_start', message: { model: 'claude-haiku-fake', content: [] } }, session_id: sid });
  out({ type: 'stream_event', event: { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } }, session_id: sid });
  for (const part of text.match(/.{1,4}/gs)) {
    out({ type: 'stream_event', event: { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: part } }, session_id: sid });
    await sleep(15);
  }
  out({ type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text }] }, session_id: sid });
  out({ type: 'stream_event', event: { type: 'message_stop' }, session_id: sid });
  out({ type: 'rate_limit_event', rate_limit_info: { status: 'allowed', rateLimitType: 'five_hour' } });
  await sleep(1500); // 실제 claude의 post_turn_summary 지연 흉내 — host는 이걸 기다리면 안 됨
  out({ type: 'system', subtype: 'post_turn_summary', session_id: sid });
  out({ type: 'result', subtype: 'success', is_error: false, result: text, session_id: sid });
}
