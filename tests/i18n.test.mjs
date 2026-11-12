// 화면 언어(core/i18n.js) 단위 테스트 + 사전 점검 (빠름, 외부 호출 없음)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.__EDITION__ = { name: 'test', defaults: {}, nativeHost: 'test' };
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { t, setUiLang, uiLang, resolveUiLang, retranslate, addMessages, messagesOf, UI_LANGS } = await import('../core/i18n.js');
addMessages((await import('../core/i18n/pages.js')).default);
addMessages((await import('../core/i18n/content.js')).default);
// provider는 불러오면 자기 문구를 등록한다
for (const f of fs.readdirSync(path.join(ROOT, 'providers'))) if (f.endsWith('.js')) await import(`../providers/${f}`);

let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + extra}`); if (!ok) failed++; };
const eq = (name, got, want) => check(name, got === want, JSON.stringify({ got, want }));

// 기본은 브라우저 언어: 한국어 브라우저 → 한국어, 그 밖에는 영어. 직접 고르면 그 언어
eq('auto + Korean browser → ko', resolveUiLang('auto', 'ko-KR'), 'ko');
eq('auto + English browser → en', resolveUiLang('auto', 'en-US'), 'en');
eq('auto + other browser language → en', resolveUiLang('auto', 'ja'), 'en');
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

// native host가 한국어로 보낸 문장 → 현재 언어로
const HOST = ['claude가 {n}초 동안 응답하지 않습니다.', 'claude 실행 파일을 찾을 수 없습니다: {path}'];
eq('retranslate: template with a value', retranslate('claude가 45초 동안 응답하지 않습니다.', HOST), 'claude has not responded for 45 seconds.');
eq('retranslate: path kept as is', retranslate('claude 실행 파일을 찾을 수 없습니다: /usr/local/bin/claude (x)', HOST), 'Could not find the claude executable: /usr/local/bin/claude (x)');
eq('retranslate: unknown text unchanged', retranslate('something else', HOST), 'something else');
setUiLang('ko');
eq('retranslate: Korean stays Korean', retranslate('claude가 45초 동안 응답하지 않습니다.', HOST), 'claude가 45초 동안 응답하지 않습니다.');

// 사전 점검: {이름} 자리가 번역에도 그대로 있는가
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
