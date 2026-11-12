// claude -p가 프롬프트에 붙이는 내용이 번역 대신 답으로 나왔는지 검사 — 개인용 전용
//
// `--system-prompt`로 시스템 프롬프트를 바꿔도 Claude Code는 요청마다 이런 것을 덧붙인다 (claude 2.1.303에서 확인):
//   - 환경 정보: "# Environment / You have been invoked in the following environment: …" (작업 폴더, 플랫폼, OS 버전, 임시 폴더 경로)
//   - 모델 이름·모델 ID, 오늘 날짜
//   - <system-reminder> … # userEmail  The user's email address is … (로그인한 계정 이메일)
// 번역할 글이 아주 짧고 제목처럼 생기면 Haiku가 그 글 대신 이 내용을 그대로 출력하거나 번역해 내놓는 일이 있다
// (2026-11-12 실측: `How AI Text Watermarking Works\nLLM` + 한국어 문맥 → 5번 중 1~4번).
// 붙는 위치는 claude-pool.mjs의 CLAUDE_ENV로 번역할 글 앞으로 옮겨 두었지만(그러면 거의 안 샘) 내용 자체는 없앨 수 없어서,
// 답에 그 흔적이 있으면 여기서 걸러 claude-pool이 다시 시도한다.
import os from 'node:os';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 번역해서 내놓아도 대개 그대로 남는 것들(태그·경로·식별자·버전) 위주. 원문(번역할 글·문맥)에 같은 것이 있으면 흔적으로 치지 않는다
// — Claude Code를 다루는 글을 번역하는 경우
const MARKS = [
  /system-reminder/i,
  [/^#{1,3} ?Environment\s*$/mi, /#{1,3} ?Environment/i], // [답에서 찾을 모양, 원문에 있으면 봐줄 모양]
  /invoked in the following environment/i,
  /Primary working directory/i,
  /Scratchpad directory/i,
  /ctt-claude-/,                                   // 풀이 만드는 빈 작업 폴더 이름 (경로는 번역해도 그대로 남음)
  /userEmail/,
  /user's email address is/i,
  /Claude Code attached this context/i,
  /exact model ID/i,
  /\bclaude-(?:haiku|sonnet|opus|fable|mythos)-\d/i, // "The exact model ID is claude-haiku-5-5"
  new RegExp(esc(`${os.type()} ${os.release()}`))  // "OS Version: Darwin 25.5.0"
];
// 이메일 주소 (스트리밍 중이라 "name@"까지만 온 것도 포함 — 주소가 다 나오기 전에 끊는다)
const EMAIL = /[\w.+-]+@[\w.-]*/g;

/**
 * @param {string} answer  모델이 낸 답 (스트리밍 중이면 지금까지 받은 부분)
 * @param {string} source  보낸 user 메시지 (번역할 글 + 문맥)
 * @param {object} [o]
 * @param {string} [o.cwd] claude를 실행한 작업 폴더
 */
export function leakedPrompt(answer, source = '', { cwd } = {}) {
  if (!answer) return false;
  if (MARKS.some((m) => { const [re, inSource] = Array.isArray(m) ? m : [m, m]; return re.test(answer) && !inSource.test(source); })) return true;
  if (cwd && cwd.length >= 12 && answer.includes(cwd) && !source.includes(cwd)) return true;
  // 원문에 없는 이메일 주소가 답에 생겼다 → 계정 이메일이 샌 것 (번역이 없던 주소를 만들어 낼 일은 없음)
  const src = source.toLowerCase();
  return (answer.match(EMAIL) || []).some((m) => !src.includes(m.toLowerCase().replace(/[.-]+$/, ''))); // 문장 끝 마침표는 떼고 비교
}

// 새는 답은 대개 이렇게 시작한다 — 받은 글자가 아직 이 첫머리의 일부일 뿐이면 화면에 내보내지 않고 기다린다
// (다음 글자에서 흔적으로 확인되면 그대로 버리고 다시 시도 → 툴팁에 잠깐이라도 보이지 않게)
const OPENERS = ['# Environment', '<system-reminder>'];
export function maybeLeakStart(answer) {
  const t = answer.trimStart();
  return t.length > 0 && OPENERS.some((o) => t.length < o.length && o.startsWith(t));
}

// 스트리밍 중 화면에 내보낼 부분: 끝에 걸린 영문·숫자·기호 덩어리(공백 없이 이어진 ASCII)는 다음 공백·다른 글자가 올 때까지 미룬다
// → 경로("/private/var/…/ctt-claude-…")나 이메일("name@…")은 덩어리가 끝나야 나가는데, 그 전에 흔적으로 걸려 버려진다.
// 한글 등은 그대로 바로 나가고, 영어 답은 낱말 하나만큼 늦게 보일 뿐. 완성본(done)에는 영향 없음
export const safePrefix = (answer) => answer.replace(/[!-~]+$/, '');
