// 프롬프트·답 정리 단위 테스트 (빠름, 외부 호출 없음)
globalThis.__EDITION__ = { name: 'test', defaults: {} };
const { buildPrompt, tidyWordAnswer, mostlyTarget, wrongLanguage } = await import('../core/prompts.js');
const { DEFAULTS, fallbackOf, onlyTargetScript } = await import('../core/settings.js');

let failed = 0;
const check = (name, ok, extra = '') => { console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : '  ' + extra}`); if (!ok) failed++; };
const eq = (name, got, want) => check(name, got === want, JSON.stringify({ got, want }));

// tidyWordAnswer: 2026-11-10 실제 Haiku 출력들
eq('pos on line 2 moves to line 1', tidyWordAnswer('벌금\n명사 · 좋은 · 미세한 · 괜찮은'), '벌금 (명사)\n좋은 · 미세한 · 괜찮은');
eq('parenthesized pos + pos suffixes on alternatives', tidyWordAnswer('벌금\n(명사) · 고운 (형용사) · 좋은 (형용사)'), '벌금 (명사)\n고운 · 좋은');
eq('pos-only line 2 is dropped', tidyWordAnswer('벌금\n명사'), '벌금 (명사)');
eq('english pos', tidyWordAnswer('stomach\nnoun · ship · pear'), 'stomach (noun)\nship · pear');
eq('already well-formed is untouched', tidyWordAnswer('강둑 (명사)\n은행 · 제방'), '강둑 (명사)\n은행 · 제방');
eq('line 2 starting with a real meaning is untouched', tidyWordAnswer('강변\n은행 · 둑'), '강변\n은행 · 둑');
eq('single line is untouched', tidyWordAnswer('벌금'), '벌금');
eq('partial stream (pos not finished) is untouched', tidyWordAnswer('벌금\n명'), '벌금\n명');

// buildPrompt: 언어는 user에만, 시스템 프롬프트는 언어와 무관 (대기 프로세스 재사용)
const S = { targetLang: 'ko', fallbackLang: 'none', showAlternatives: true };
for (const mode of ['word', 'text']) {
  const a = buildPrompt({ mode, text: 'x' }, S), b = buildPrompt({ mode, text: 'x' }, { ...S, targetLang: 'ja' });
  check(`${mode}: system prompt independent of target language`, a.system === b.system);
  check(`${mode}: target language in user message`, a.user.includes('Korean') && b.user.includes('Japanese'));
}
check('word user message starts with "Word:" (fake claude relies on it)', buildPrompt({ mode: 'word', text: 'bank' }, S).user.startsWith('Word: bank'));

// onlyTargetScript: 글자가 모두 결과 언어 문자일 때만 true (숫자·문장부호·이모지는 글자가 아님)
const only = (name, text, lang, want) => eq(`onlyTargetScript ${name}`, onlyTargetScript(text, lang), want);
only('pure hangul sentence', '한국어 문장은 무시되어야 합니다.', 'ko', true);
only('hangul + digits/punctuation/emoji', '2026년 11월 12일 (수) 오전 9:30 👍', 'ko', true);
only('decomposed hangul (NFD, macOS 파일 이름 등)', '한글'.normalize('NFD'), 'ko', true);
only('hangul + latin is mixed', 'React 컴포넌트를 만들어요', 'ko', false);
only('hangul + hanja is mixed', '대한민국(大韓民國)', 'ko', false);
only('english only', 'river bank', 'ko', false);
only('no letters at all', '12:30 → 45%', 'ko', false);
only('japanese: kana + kanji + ー', 'コーヒーを飲みます。東京', 'ja', true);
only('japanese: kanji only could be chinese', '東京', 'ja', false);
only('chinese: han only', '我喜欢喝咖啡。', 'zh-CN', true);
only('chinese target, japanese text is mixed', 'コーヒーを飲みます', 'zh-CN', false);
only('cyrillic', 'Привет, мир!', 'ru', true);
only('latin-script target cannot be detected', 'Hello world', 'en', false);

// fallbackOf: 기본값은 번역 안 함
eq('default fallbackLang is none', DEFAULTS.fallbackLang, 'none');
eq('fallbackOf none → null', fallbackOf({ targetLang: 'ko', fallbackLang: 'none' }), null);
eq('fallbackOf same as target → null', fallbackOf({ targetLang: 'ko', fallbackLang: 'ko' }), null);
eq('fallbackOf chosen language', fallbackOf({ targetLang: 'ko', fallbackLang: 'en' }), 'en');

// buildPrompt: 답할 언어
const user = (mode, text, s) => buildPrompt({ mode, text }, { showAlternatives: true, ...s }).user;
check('word: plain "Answer in: Korean" by default', user('word', 'bank', S).endsWith('\nAnswer in: Korean'));
check('text: plain target language by default', user('text', 'a b', S).endsWith('<target_language>Korean</target_language>'));
check('mixed text goes to the target language even with a fallback', user('text', 'React 컴포넌트를 만들어요', { targetLang: 'ko', fallbackLang: 'en' }).endsWith('<target_language>Korean</target_language>'));
check('fallback chosen: pure target-script text goes to the fallback', user('text', '한국어 문장입니다', { targetLang: 'ko', fallbackLang: 'en' }).endsWith('<target_language>English</target_language>'));
check('fallback chosen: pure target-script word goes to the fallback', user('word', '강둑', { targetLang: 'ko', fallbackLang: 'en' }).endsWith('\nAnswer in: English'));
check('latin target without fallback: no condition', user('word', 'bank', { targetLang: 'en', fallbackLang: 'none' }).endsWith('\nAnswer in: English'));
check('latin target with fallback: the model decides', user('word', 'bank', { targetLang: 'en', fallbackLang: 'ko' }).endsWith('\nAnswer in: English (if the word itself is already English, answer in Korean instead)')
  && user('text', 'a b', { targetLang: 'en', fallbackLang: 'ko' }).endsWith('<target_language>English (if the text is already English, translate it into Korean instead)</target_language>'));

// 이미 상당 부분이 결과 언어인 섞인 글: 문맥 없이 보내고, 답이 다른 언어로 뒤집혔는지 검사
const KO = { targetLang: 'ko', fallbackLang: 'none', showAlternatives: true };
const mixedText = 'How AI Text Watermarking Works의 설명처럼, 이 방식은 편향된 동전을 여러 번 던지는 것과 유사함\nLLM은 다음 토큰을 선택함';
const mixedReq = { mode: 'text', text: mixedText, context: '앞 문장. ⟦How AI Text Watermarking Works의 설명처럼⟧', title: 't' };
check('mostlyTarget: mostly korean with english phrases', mostlyTarget(mixedReq, KO));
check('mostlyTarget: english sentence with one korean word is not', !mostlyTarget({ mode: 'text', text: 'The 김치 at this restaurant is surprisingly good.' }, KO));
check('mostlyTarget: pure english / pure korean / word mode / latin target are not',
  !mostlyTarget({ mode: 'text', text: 'river bank' }, KO) && !mostlyTarget({ mode: 'text', text: '한국어 문장' }, KO)
  && !mostlyTarget({ mode: 'word', text: 'API를' }, KO) && !mostlyTarget({ mode: 'text', text: mixedText }, { ...KO, targetLang: 'en' }));
check('mostly-target text: context is dropped, prompt otherwise the same', !buildPrompt(mixedReq, KO).user.includes('<context>')
  && buildPrompt(mixedReq, KO).user === `<text>${mixedText}</text>\n<target_language>Korean</target_language>`
  && buildPrompt(mixedReq, KO).system === buildPrompt({ mode: 'text', text: 'x' }, KO).system);
check('other text keeps its context', buildPrompt({ mode: 'text', text: 'river bank', context: 'on the ⟦river bank⟧ today' }, KO).user.startsWith('<context>'));
check('wrongLanguage: answer flipped to english', wrongLanguage(mixedReq, KO, 'As explained in "How AI Text Watermarking Works," this method is similar to tossing a biased coin.'));
check('wrongLanguage: half flipped (first sentence english)', wrongLanguage(mixedReq, KO, 'As explained in How AI Text Watermarking Works, this method is similar to tossing a biased coin many times to statistically determine whether it is biased.\nLLM은 다음 토큰을 선택함'));
check('wrongLanguage: korean answer keeping the english title is fine', !wrongLanguage(mixedReq, KO, '이 방식은 "How AI Text Watermarking Works"의 설명처럼, 편향된 동전을 여러 번 던지는 것과 비슷함\nLLM은 다음 토큰을 선택함'));
check('wrongLanguage: never for ordinary requests', !wrongLanguage({ mode: 'text', text: 'React, Vue, Svelte' }, KO, 'React, Vue, Svelte'));

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
