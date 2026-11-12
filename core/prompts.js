// LLM 계열 provider(anthropic-api, claude-cli, …)가 공유하는 프롬프트
//
// 시스템 프롬프트에는 언어를 넣지 않고, 답할 언어는 user 메시지 끝에 붙인다.
// → claude-cli의 대기 프로세스는 (모델, 시스템 프롬프트)마다 하나씩 띄우므로
//   언어를 바꿔도 이미 띄워 둔 프로세스를 그대로 쓴다 (언어별로 프로세스가 늘지 않음)
import { langName, fallbackOf, scriptKnown, onlyTargetScript, targetShare } from './settings.js';

const SYSTEM_WORD = [
  `You are an instant pop-up dictionary inside a web browser. The user pointed at a word on a page.`,
  `Answer in the language named on the "Answer in:" line of the message.`,
  `The target word is marked with ⟦ ⟧ in the context. Use the context to pick the right sense.`,
  ``,
  `Output format (plain text, no markdown, no preamble, no quotes):`,
  `Line 1: the meaning that fits THIS context — short and natural (1–8 words), then the part of speech in parentheses. If the word is inflected, add the base form (e.g. "ran → run"). If it is part of a phrasal verb or idiom in the context, translate the whole expression and show it.`
];

const SYSTEM_TEXT = [
  `You are a translation engine embedded in a web browser.`,
  `Translate the text inside <text> into the language named in <target_language>.`,
  `Prefer natural, idiomatic phrasing over word-for-word translation, but stay faithful to the meaning.`,
  `Use <context> (if given) only to resolve ambiguous words and tone — do not translate the context itself.`,
  `Preserve line breaks, numbers, code, URLs and proper nouns.`,
  `Output ONLY the translation. No notes, no quotes, no preamble.`
].join('\n');

// 단어 답 형식 바로잡기.
// Haiku가 다의어(예: fine — 명사·형용사·동사)에서 품사를 1줄 끝이 아니라 2줄 맨 앞에 쓰는 경우가 잦음
//   "벌금\n명사 · 좋은 · 미세한"  →  "벌금 (명사)\n좋은 · 미세한"
// 2026-11-10 실측: 원래 프롬프트에서 fine 3/3 발생. 프롬프트 문구를 바꾸거나 예시를 넣으면 다른 단어가
// 더 망가져서(혼잣말 출력, 엉뚱한 답 언어) 프롬프트는 그대로 두고 여기서 고친다
const POS_WORDS = '명사|동사|형용사|부사|대명사|전치사|접속사|감탄사|' +
  'noun|verb|adjective|adverb|pronoun|preposition|conjunction|interjection|名詞|動詞|形容詞|副詞';
const POS_ONLY = new RegExp(`^\\(?\\s*(${POS_WORDS})\\s*\\)?$`, 'i');
const POS_SUFFIX = new RegExp(`\\s*\\((?:${POS_WORDS})\\)$`, 'i');

export function tidyWordAnswer(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2 || /\)$/.test(lines[0])) return text; // 이미 "뜻 (품사)" 형식
  const parts = lines[1].split('·').map((x) => x.trim()).filter(Boolean);
  const m = parts[0]?.match(POS_ONLY);
  if (!m) return text;
  lines[0] = `${lines[0]} (${m[1]})`;
  const rest = parts.slice(1).map((x) => x.replace(POS_SUFFIX, '')); // "좋은 (형용사)" → "좋은"
  lines.splice(1, 1, ...(rest.length ? [rest.join(' · ')] : []));
  return lines.join('\n');
}

// 이미 상당 부분이 결과 언어인 섞인 글 (예: 한국어 문장에 영어 제목·용어가 섞임. 결과 언어 글자가 30% 이상).
// 이런 글을 "한국어로 번역"시키면 모델이 할 일이 거의 없어서 반대로 영어로 옮겨 버리곤 한다
// (2026-11-12 실측, Haiku: 17번 중 5번. 문맥을 함께 보내면 문단을 빼먹거나 더 자주 뒤집힘. Opus는 뒤집지 않았음).
// 프롬프트로 막아 보려 했지만 더 나빴다 — 시스템 프롬프트에 "이미 결과 언어인 부분은 그대로" 규칙을 넣거나
// user 메시지에 <note>를 붙이면 Haiku가 혼잣말을 덧붙이거나 claude -p가 붙인 환경 정보를 번역해 내놓음.
// 그래서 프롬프트는 그대로 두고 코드로 막는다:
//   1) 이런 글에는 문맥을 보내지 않는다
//   2) 답이 다른 언어로 나오면 wrongLanguage()로 걸러 background가 다시 시도한다 (모두 3번까지)
const MIXED_MIN = 0.3;
export function mostlyTarget(req, s) {
  if (req.mode !== 'text') return false;
  const share = targetShare(req.text, s.targetLang);
  return share !== null && share >= MIXED_MIN && share < 1;
}

// mostlyTarget 글의 답이 다른 언어로 뒤집혔는가: 결과 언어 글자 비율이 원문의 절반에도 못 미치면 그렇다고 본다
// (제대로 된 답은 원문과 비슷하거나 더 높다. 고유명사가 그대로 남는 정도로는 걸리지 않음)
export function wrongLanguage(req, s, answer) {
  if (!mostlyTarget(req, s)) return false;
  return (targetShare(answer, s.targetLang) ?? 0) < targetShare(req.text, s.targetLang) * 0.5;
}

/**
 * @param {import('./provider.js').TranslateRequest} req
 * @param {object} s 설정
 * @returns {{ system: string, user: string, maxTokens: number }}
 */
export function buildPrompt(req, s) {
  // 답할 언어. 기본은 결과 언어 하나뿐 (글이 이미 그 언어인지는 묻지 않는다 — 그런 글은 content.js가 보내지 않음).
  // "이미 그 언어라면 대신"(fallbackLang)을 골랐을 때만:
  //   문자로 알아볼 수 있는 언어(한글 등) → 글자가 모두 그 문자면 여기서 대신 언어로 정함
  //   라틴 문자 언어 → 알아볼 수 없으니 예전처럼 모델에게 맡김
  const T = langName(s.targetLang);
  const fb = fallbackOf(s);
  const F = fb && langName(fb);
  const known = scriptKnown(s.targetLang);
  const A = F && known && onlyTargetScript(req.text, s.targetLang) ? F : T;
  const ask = (what, verb) => (F && !known ? ` (if the ${what} is already ${T}, ${verb} ${F} instead)` : '');
  const title = req.title ? `\nPage title: ${req.title}` : '';

  if (req.mode === 'word') {
    const system = [
      ...SYSTEM_WORD,
      s.showAlternatives
        ? `Line 2: only if the word has other common, clearly different meanings — up to 3, separated by " · ". Otherwise omit the line.`
        : `Output only Line 1.`,
      `Be extremely brief.`
    ].join('\n');
    const user = `Word: ${req.text}${req.context ? `\nContext: ${req.context}` : ''}${title}` +
      `\nAnswer in: ${A}${ask('word itself', 'answer in')}`;
    return { system, user, maxTokens: s.showAlternatives ? 160 : 80 };
  }

  // 문장/구간 번역
  const context = mostlyTarget(req, s) ? '' : req.context;
  const user = (context ? `<context>${context}</context>${title ? `\n<page_title>${req.title}</page_title>` : ''}\n` : '') +
    `<text>${req.text}</text>\n` +
    `<target_language>${A}${ask('text', 'translate it into')}</target_language>`;
  const maxTokens = Math.min(32000, Math.max(256, Math.ceil(req.text.length * 2.5))); // 긴 선택도 잘리지 않게
  return { system: SYSTEM_TEXT, user, maxTokens };
}
