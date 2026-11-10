// 프롬프트·답 정리 단위 테스트 (빠름, 외부 호출 없음)
globalThis.__EDITION__ = { name: 'test', defaults: {} };
const { buildPrompt, tidyWordAnswer } = await import('../core/prompts.js');

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
const S = { targetLang: 'ko', fallbackLang: 'en', showAlternatives: true };
for (const mode of ['word', 'text']) {
  const a = buildPrompt({ mode, text: 'x' }, S), b = buildPrompt({ mode, text: 'x' }, { ...S, targetLang: 'ja' });
  check(`${mode}: system prompt independent of target language`, a.system === b.system);
  check(`${mode}: target language in user message`, a.user.includes('Korean') && b.user.includes('Japanese'));
}
check('word user message starts with "Word:" (fake claude relies on it)', buildPrompt({ mode: 'word', text: 'bank' }, S).user.startsWith('Word: bank'));

console.log(failed ? `\n${failed} failed` : '\nall passed');
process.exit(failed ? 1 : 0);
