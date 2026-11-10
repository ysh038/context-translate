// LLM 계열 provider(anthropic-api, claude-cli, …)가 공유하는 프롬프트
//
// 시스템 프롬프트에는 언어를 넣지 않고, 목표 언어는 user 메시지 끝에 붙인다.
// → claude-cli의 대기 프로세스는 (모델, 시스템 프롬프트)마다 하나씩 띄우므로
//   언어를 바꿔도 이미 띄워 둔 프로세스를 그대로 쓴다 (언어별로 프로세스가 늘지 않음)
import { langName, fallbackOf } from './settings.js';

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

/**
 * @param {import('./provider.js').TranslateRequest} req
 * @param {object} s 설정
 * @returns {{ system: string, user: string, maxTokens: number }}
 */
export function buildPrompt(req, s) {
  const T = langName(s.targetLang);
  const F = langName(fallbackOf(s));
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
      `\nAnswer in: ${T} (if the word itself is already ${T}, answer in ${F} instead)`;
    return { system, user, maxTokens: s.showAlternatives ? 160 : 80 };
  }

  // 문장/구간 번역
  const user = (req.context ? `<context>${req.context}</context>${title ? `\n<page_title>${req.title}</page_title>` : ''}\n` : '') +
    `<text>${req.text}</text>\n` +
    `<target_language>${T} (if the text is already ${T}, translate it into ${F} instead)</target_language>`;
  const maxTokens = Math.min(32000, Math.max(256, Math.ceil(req.text.length * 2.5))); // 긴 선택도 잘리지 않게
  return { system: SYSTEM_TEXT, user, maxTokens };
}
