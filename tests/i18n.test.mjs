// 화면 언어(core/i18n.js) 단위 테스트 + 사전 점검 (빠름, 외부 호출 없음)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.__EDITION__ = { name: 'test', defaults: {}, nativeHost: 'test' };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { t, setUiLang, uiLang, resolveUiLang, retranslate, addMessages, messagesOf, UI_LANGS } = await import('../core/i18n.js');
const pages = (await import('../core/i18n/pages.js')).default;
const content = (await import('../core/i18n/content.js')).default;
addMessages(pages);
addMessages(content);
addMessages((await import('../core/i18n/engine.js')).default);
// provider는 불러오면 자기 문구를 등록한다
for (const f of fs.readdirSync(path.join(ROOT, 'providers'))) if (f.endsWith('.js')) await import(`../providers/${f}`);

let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + extra}`); if (!ok) failed++; };
const eq = (name, got, want) => check(name, got === want, JSON.stringify({ got, want }));

// 기본은 브라우저 언어. 문구가 없는 언어의 브라우저는 영어. 직접 고르면 그 언어
eq('auto + Korean browser → ko', resolveUiLang('auto', 'ko-KR'), 'ko');
eq('auto + English browser → en', resolveUiLang('auto', 'en-US'), 'en');
eq('auto + Japanese browser → ja', resolveUiLang('auto', 'ja'), 'ja');
eq('auto + pt-BR → pt', resolveUiLang('auto', 'pt-BR'), 'pt');
eq('auto + es-419 → es', resolveUiLang('auto', 'es-419'), 'es');
eq('auto + zh-CN → Simplified', resolveUiLang('auto', 'zh-CN'), 'zh-CN');
eq('auto + zh (no region) → Simplified', resolveUiLang('auto', 'zh'), 'zh-CN');
eq('auto + zh-TW → Traditional', resolveUiLang('auto', 'zh-TW'), 'zh-TW');
eq('auto + zh-HK → Traditional', resolveUiLang('auto', 'zh_HK'), 'zh-TW');
eq('auto + language without messages → en', resolveUiLang('auto', 'vi'), 'en');
eq('explicit zh-TW', resolveUiLang('zh-TW', 'ko'), 'zh-TW');
eq('auto + unknown browser language → en', resolveUiLang('auto', ''), 'en');
eq('explicit choice wins over the browser language', resolveUiLang('ko', 'en-US'), 'ko');
eq('unknown saved value falls back to auto', resolveUiLang('xx', 'ko'), 'ko');

setUiLang('ko');
eq('Korean: text as written', t('설정 열기'), '설정 열기');
eq('Korean: values filled in', t('실패: {message}', { message: 'x' }), '실패: x');
setUiLang('en');
eq('uiLang() reports the language in use', uiLang(), 'en');
eq('English: looked up', t('설정 열기'), 'Open settings');
eq('English: values filled in', t('실패: {message}', { message: 'x' }), 'Failed: x');
eq('missing entry falls back to Korean', t('사전에 없는 문구 {n}', { n: 1 }), '사전에 없는 문구 1');
addMessages({ en: { '영어에만 있는 문구': 'English only' } });
setUiLang('ja');
eq('Japanese: looked up', t('설정 열기'), '設定を開く');
eq('entry missing in a language falls back to English', t('영어에만 있는 문구'), 'English only');
setUiLang('en');

// native host가 한국어로 보낸 문장 → 현재 언어로
const HOST = ['claude가 {n}초 동안 응답하지 않습니다.', 'claude 실행 파일을 찾을 수 없습니다: {path}'];
eq('retranslate: template with a value', retranslate('claude가 45초 동안 응답하지 않습니다.', HOST), 'claude has not responded for 45 seconds.');
eq('retranslate: path kept as is', retranslate('claude 실행 파일을 찾을 수 없습니다: /usr/local/bin/claude (x)', HOST), 'Could not find the claude executable: /usr/local/bin/claude (x)');
eq('retranslate: unknown text unchanged', retranslate('something else', HOST), 'something else');
setUiLang('ko');
eq('retranslate: Korean stays Korean', retranslate('claude가 45초 동안 응답하지 않습니다.', HOST), 'claude가 45초 동안 응답하지 않습니다.');

// 문구 점검: 모든 화면 언어에 문구가 있고, 영어와 같은 문구를 빠짐없이 갖고 있는가
const locales = fs.readdirSync(path.join(ROOT, 'core/i18n/locales')).map((f) => f.replace(/\.js$/, '')).sort();
eq('one locale file per display language (except Korean)', locales.join(','), Object.keys(UI_LANGS).filter((x) => x !== 'ko').sort().join(','));
const en = await import('../core/i18n/locales/en.js');
for (const l of locales) {
  const mod = await import(`../core/i18n/locales/${l}.js`);
  const diff = [];
  for (const part of Object.keys(en)) {
    const a = Object.keys(en[part]), b = Object.keys(mod[part] || {});
    for (const k of a) if (!b.includes(k)) diff.push(`${part}: missing ${k}`);
    for (const k of b) if (!a.includes(k)) diff.push(`${part}: extra ${k}`);
  }
  check(`${l}: same entries as English`, diff.length === 0 && Object.keys(mod).join() === Object.keys(en).join(), JSON.stringify(diff.slice(0, 5)));
  check(`${l}: registered for pages and tooltip`, pages[l] === mod.pages && content[l] === mod.content);
  check(`${l}: "(으)로 번역" label is not empty and has no Hangul`, !!mod.pages['로 번역'] && !/[가-힣]/.test(Object.values(mod.pages).join('') + Object.values(mod.content).join('')));
}

// {이름} 자리가 번역에도 그대로 있는가
const holes = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',');
for (const l of Object.keys(UI_LANGS).filter((x) => x !== 'ko')) {
  const m = messagesOf(l);
  const bad = Object.entries(m).filter(([k, v]) => holes(k) !== holes(v)).map(([k]) => k);
  check(`${l}: placeholders match in every entry (${Object.keys(m).length} entries)`, Object.keys(m).length > 0 && bad.length === 0, JSON.stringify(bad));

  // 코드에서 t('…') / tr('…')로 쓰는 한국어 문구가 모두 사전에 있는가
  const missing = [];
  for (const dir of ['src', 'core', 'providers']) {
    for (const f of fs.readdirSync(path.join(ROOT, dir))) {
      if (!f.endsWith('.js')) continue;
      const src = fs.readFileSync(path.join(ROOT, dir, f), 'utf8');
      for (const [, raw] of src.matchAll(/\b(?:t|tr)\(\s*'((?:[^'\\]|\\.)*)'/g)) {
        const key = raw.replace(/\\n/g, '\n').replace(/\\'/g, "'");
        if (/[가-힣]/.test(key) && !(key in m)) missing.push(`${dir}/${f}: ${key}`);
      }
    }
  }
  check(`${l}: every t('…') text in the code has an entry`, missing.length === 0, JSON.stringify(missing));
}

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
