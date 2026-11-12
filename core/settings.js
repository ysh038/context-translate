// 공용 설정 (background / options / popup / content 에서 import)
// __EDITION__ 은 빌드 시 editions/<name>.json 내용으로 치환된다 (scripts/build.mjs)
export const EDITION = __EDITION__;

export const DEFAULTS = {
  apiKey: '',
  model: 'claude-haiku-5-5',      // anthropic-api 모델 (최신 세대만 선택지로 제공)
  targetLang: 'ko',
  fallbackLang: 'none',      // 결과 언어 글자로만 된 글을 만났을 때: 'none' = 번역 안 함, 언어 코드 = 그 언어로 번역
  hoverEnabled: true,
  hoverModifier: 'none',     // none | alt | shift | ctrl | meta
  hoverDelay: 450,           // ms, 마우스를 멈추고 기다리는 시간
  hoverSkipTarget: true,     // fallbackLang을 골랐을 때만 의미 있음: 결과 언어 글자로만 된 단어는 hover에서 건너뛰기
  hoverEngine: 'anthropic-api',     // 마우스 오버 번역에 쓸 provider id
  selectionEnabled: true,
  selectionMode: 'button',   // button(기본: 드래그하면 버튼이 뜨고, 눌러야 번역) | auto(드래그하면 바로 번역)
  selectionEngine: 'anthropic-api', // 드래그(선택) 번역에 쓸 provider id
  contextMode: 'sentence',   // none | sentence | paragraph
  showAlternatives: true,    // 단어 번역 시 다른 뜻 표시
  tipPinned: null,           // 📌 화면 고정 위치 {x, y} (viewport px). null이면 글자 옆에 표시
  apiBase: 'https://api.anthropic.com', // UI에 노출 안 된 테스트용 오버라이드
  ...EDITION.defaults
};

// content script가 읽는 키 (API 키 등 민감한 값은 content script로 가져가지 않는다)
export const CONTENT_KEYS = ['hoverEnabled', 'hoverModifier', 'hoverDelay', 'hoverSkipTarget',
  'selectionEnabled', 'selectionMode', 'contextMode', 'targetLang', 'fallbackLang', 'tipPinned'];

export const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

export const LANGS = {
  ko: { label: '한국어', en: 'Korean' },
  en: { label: 'English', en: 'English' },
  ja: { label: '日本語', en: 'Japanese' },
  'zh-CN': { label: '中文(简体)', en: 'Simplified Chinese' },
  'zh-TW': { label: '中文(繁體)', en: 'Traditional Chinese' },
  es: { label: 'Español', en: 'Spanish' },
  fr: { label: 'Français', en: 'French' },
  de: { label: 'Deutsch', en: 'German' },
  it: { label: 'Italiano', en: 'Italian' },
  pt: { label: 'Português', en: 'Portuguese' },
  nl: { label: 'Nederlands', en: 'Dutch' },
  pl: { label: 'Polski', en: 'Polish' },
  tr: { label: 'Türkçe', en: 'Turkish' },
  ru: { label: 'Русский', en: 'Russian' },
  uk: { label: 'Українська', en: 'Ukrainian' },
  vi: { label: 'Tiếng Việt', en: 'Vietnamese' },
  th: { label: 'ไทย', en: 'Thai' },
  id: { label: 'Bahasa Indonesia', en: 'Indonesian' },
  hi: { label: 'हिन्दी', en: 'Hindi' },
  ar: { label: 'العربية', en: 'Arabic' }
};

export const langName = (code) => (LANGS[code] || LANGS.ko).en;

// 결과 언어 글자로만 된 글을 대신 번역할 언어. 없으면(null) 그런 글은 번역하지 않는다
// (기본값 'none'. 결과 언어와 같은 언어를 골라도 번역할 게 없으므로 null)
export const fallbackOf = (s) =>
  s.fallbackLang && s.fallbackLang !== 'none' && s.fallbackLang !== s.targetLang ? s.fallbackLang : null;

// 문자 종류로 알아볼 수 있는 결과 언어. 라틴 문자 언어끼리는 글자만으로 구분할 수 없어 여기 없다
//   own: 그 언어 글자 / must: 이 글자가 하나는 있어야 그 언어로 본다 (한자만 있으면 일본어인지 중국어인지 모름)
const SCRIPTS = {
  ko: { own: /\p{scx=Hangul}/u },
  ja: { own: /[\p{scx=Hiragana}\p{scx=Katakana}\p{scx=Han}]/u, must: /[\p{scx=Hiragana}\p{scx=Katakana}]/u },
  'zh-CN': { own: /\p{scx=Han}/u },
  'zh-TW': { own: /\p{scx=Han}/u },
  ru: { own: /\p{scx=Cyrillic}/u },
  uk: { own: /\p{scx=Cyrillic}/u },
  th: { own: /\p{scx=Thai}/u },
  hi: { own: /\p{scx=Devanagari}/u },
  ar: { own: /\p{scx=Arabic}/u }
};
const LETTER = /\p{L}/u;

export const scriptKnown = (lang) => lang in SCRIPTS;

// 글자가 모두 그 언어 문자인가 (예: ko — 한글로만 된 글). 숫자·문장부호·공백·이모지는 글자로 치지 않는다.
// 다른 글자가 하나라도 섞여 있으면(예: "React 컴포넌트", "韓國") false → 통째로 결과 언어로 번역한다
export function onlyTargetScript(text, lang) {
  const sc = SCRIPTS[lang];
  if (!sc) return false;
  let seen = false, must = !sc.must;
  for (const ch of text) {
    if (!LETTER.test(ch)) continue;
    if (!sc.own.test(ch)) return false;
    seen = true;
    if (!must && sc.must.test(ch)) must = true;
  }
  return seen && must;
}

// 글자 가운데 결과 언어 문자의 비율 (0~1). 문자로 알아볼 수 없는 언어이거나 글자가 없으면 null
export function targetShare(text, lang) {
  const sc = SCRIPTS[lang];
  if (!sc) return null;
  let own = 0, all = 0;
  for (const ch of text) {
    if (!LETTER.test(ch)) continue;
    all++;
    if (sc.own.test(ch)) own++;
  }
  return all ? own / all : null;
}
