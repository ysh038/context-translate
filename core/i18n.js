// 화면(UI) 언어 — 팝업·설정 페이지·툴팁·오류 문구
// 한국어 문구가 원문(키)이고, 다른 언어는 그 언어의 문구 목록에서 찾아 바꾼다. 없으면 영어, 영어에도 없으면 한국어 그대로.
//   t('설정 열기')                         → 'Open settings'
//   t('실패: {message}', { message })    → 값은 {이름} 자리에 끼워 넣는다
// 기본은 브라우저 언어를 따른다(설정 uiLang = 'auto'). 문구가 없는 언어의 브라우저는 영어.
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 쓰는 쪽이 필요한 묶음만 addMessages로 등록한다
// (core/i18n/pages.js·content.js·<provider>.js) — content script에는 툴팁 문구만,
// store 빌드에는 개인용 전용 provider의 문구가 들어가지 않는다.

// 화면 언어로 고를 수 있는 것 (문구 파일이 있는 언어). 이름은 그 언어로 적는다
export const UI_LANGS = {
  ko: '한국어', en: 'English', ja: '日本語', 'zh-CN': '中文(简体)', 'zh-TW': '中文(繁體)',
  es: 'Español', fr: 'Français', de: 'Deutsch', it: 'Italiano', pt: 'Português', ru: 'Русский'
};
const SOURCE = 'ko';   // 코드에 적힌 문구의 언어
const FALLBACK = 'en'; // 문구가 없는 브라우저 언어일 때, 그리고 어떤 언어에 문구 하나가 빠졌을 때

const dict = {};
let lang = SOURCE;
let pref = 'auto';

/** { en: { '한국어 문구': 'English text', … }, … } */
export function addMessages(byLang) {
  for (const [l, m] of Object.entries(byLang)) dict[l] = Object.assign(dict[l] || {}, m);
}

const browserLang = () => {
  try { return globalThis.chrome?.i18n?.getUILanguage?.() || globalThis.navigator?.language || ''; } catch { return ''; }
};

/** 설정값('auto' | 언어 코드) → 실제로 쓸 화면 언어 */
export function resolveUiLang(p = 'auto', browser = browserLang()) {
  if (p && p !== 'auto' && p in UI_LANGS) return p;
  const tag = String(browser).toLowerCase().replace(/_/g, '-'); // 예: ko, en-US, zh-TW, pt-BR, es-419
  const base = tag.split('-')[0];
  if (base === 'zh') return /-(tw|hk|mo|hant)\b/.test(tag) ? 'zh-TW' : 'zh-CN'; // 번체: 대만·홍콩·마카오
  return base in UI_LANGS ? base : FALLBACK;
}

/** 등록된 사전 (테스트용) */
export const messagesOf = (l) => dict[l] || {};

export function setUiLang(p) { pref = p || 'auto'; lang = resolveUiLang(pref); return lang; }
export const uiLang = () => lang;

const fill = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s);

export function t(s, vars) {
  return fill(lang === SOURCE ? s : dict[lang]?.[s] ?? dict[FALLBACK]?.[s] ?? s, vars);
}

/**
 * 이미 한국어로 완성돼서 온 문장(native host가 보낸 오류 등)을 현재 언어로 바꾼다.
 * templates의 문구와 맞춰 보고({이름} 자리는 아무 값), 맞는 것이 있으면 그 값으로 다시 만든다. 없으면 그대로.
 */
export function retranslate(message, templates) {
  if (lang === SOURCE || typeof message !== 'string') return message;
  for (const tpl of templates) {
    const names = [];
    const re = new RegExp('^' + tpl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\{(\w+)\\\}/g, (_, k) => { names.push(k); return '([\\s\\S]*?)'; }) + '$');
    const m = re.exec(message);
    if (m) return t(tpl, Object.fromEntries(names.map((k, i) => [k, m[i + 1]])));
  }
  return message;
}

/**
 * 저장된 설정(uiLang)을 읽어 화면 언어를 정하고, 설정이 바뀌면 따라간다.
 * 읽기 전에도 브라우저 언어로 바로 동작한다 (기본값이 'auto'라서 대부분 그대로 맞음).
 * @param {(lang: string) => void} [onChange] 언어가 실제로 바뀌었을 때
 */
export function initUiLang(onChange) {
  setUiLang('auto');
  const apply = (p) => { const before = lang; if (setUiLang(p) !== before) onChange?.(lang); };
  try {
    chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.uiLang) apply(ch.uiLang.newValue); });
    return chrome.storage.local.get({ uiLang: 'auto' }).then((v) => { apply(v.uiLang); return lang; }, () => lang);
  } catch { return Promise.resolve(lang); }
}

/* ───────────── DOM 문구 바꾸기 ─────────────
 * HTML에 한국어로 적힌 글자(text node)와 title·aria-label·placeholder·alt를 현재 언어로 바꾼다.
 * 문구 전체가 사전의 키와 같을 때만 바뀐다 (값을 끼워 넣는 문구는 코드에서 t()로).
 * translate="no" 안쪽은 건드리지 않는다 — 번역 결과·언어 이름처럼 UI 문구가 아닌 글.
 * 원문을 기억해 두므로 언어가 바뀐 뒤 다시 불러도 된다.
 */
const ATTRS = ['title', 'aria-label', 'placeholder', 'alt'];
const memo = new WeakMap(); // 노드 → { src: 한국어 원문, out: 마지막으로 넣은 글 } (요소는 속성 이름별)

function convert(rec, cur) {
  if (!rec.src || cur !== rec.out) rec.src = cur; // 코드가 새 문구를 넣었으면 그것이 새 원문
  const trimmed = rec.src.trim();
  rec.out = trimmed ? rec.src.replace(trimmed, t(trimmed)) : rec.src;
  return rec.out;
}

const skipped = (el) => !!el?.closest?.('[translate="no"]');

function localizeText(n) {
  if (!/\S/.test(n.data) || skipped(n.parentElement)) return;
  let rec = memo.get(n);
  if (!rec) memo.set(n, (rec = {}));
  const out = convert(rec, n.data);
  if (out !== n.data) n.data = out;
}

function localizeAttrs(el) {
  if (skipped(el)) return;
  for (const a of ATTRS) {
    const cur = el.getAttribute(a);
    if (!cur) continue;
    let recs = memo.get(el);
    if (!recs) memo.set(el, (recs = {}));
    const out = convert((recs[a] ||= {}), cur);
    if (out !== cur) el.setAttribute(a, out);
  }
}

export function localizeDom(root) {
  if (root.nodeType === 3) return localizeText(root);
  if (root.nodeType === 1) localizeAttrs(root);
  const doc = root.ownerDocument || root;
  const w = doc.createTreeWalker(root, 5 /* SHOW_ELEMENT | SHOW_TEXT */);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (n.nodeType === 3) localizeText(n); else localizeAttrs(n);
  }
}

/** 페이지 전체를 현재 언어로 (언어가 바뀐 뒤 다시 불러도 된다). <html lang>도 맞춘다 — ui.css가 어순에 쓴다 */
export function localizePage(doc = document) {
  doc.documentElement.lang = lang;
  localizeDom(doc.documentElement);
}

/** 페이지 전체를 현재 언어로 바꾸고, 나중에 코드가 넣는 문구도 계속 바꾼다 (팝업·설정 페이지용) */
export function watchDom(doc = document) {
  localizePage(doc);
  new MutationObserver((list) => {
    for (const m of list) {
      if (m.type === 'characterData') localizeText(m.target);
      else if (m.type === 'attributes') localizeAttrs(m.target);
      else for (const n of m.addedNodes) if (n.nodeType === 1 || n.nodeType === 3) localizeDom(n);
    }
  }).observe(doc.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
