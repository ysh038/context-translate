import { DEFAULTS } from '../core/settings.js';
import { engineFor } from '../core/engines.js';
import { ProviderError } from '../core/provider.js';
import { cacheGet, cacheSet } from '../core/cache.js';
import { tidyWordAnswer, mostlyTarget, wrongLanguage } from '../core/prompts.js';
import { t, initUiLang, addMessages } from '../core/i18n.js';
import messages from '../core/i18n/engine.js';

// 화면 언어 (오류·엔진 이름 문구). 서비스워커가 다시 뜰 때마다 설정을 읽고, 바뀌면 따라간다
addMessages(messages);
const uiReady = initUiLang();

/* ───────────── 콘텐츠 스크립트와 통신 (port 1개 = 요청 1개) ─────────────
 * 요청: { source: 'hover'|'selection', mode: 'word'|'text', text, context?, title? }
 * 응답: { type: 'delta', full } … { type: 'done', text, cached?, ttft?, ms?, engine, model? }
 *       또는 { type: 'error', code, message, needsSetup? }
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'translate') return;
  const ctrl = new AbortController();
  let alive = true;
  port.onDisconnect.addListener(() => { alive = false; ctrl.abort(); });
  const post = (m) => { if (alive) try { port.postMessage(m); } catch {} };

  port.onMessage.addListener(async (req) => {
    const [s] = await Promise.all([chrome.storage.local.get(DEFAULTS), uiReady]);
    const provider = engineFor(req.source, s);
    const engine = t(provider.label);
    const model = provider.describe?.(s) || '';

    const av = await provider.available(s).catch((e) => ({ ok: false, reason: e.message }));
    if (!av.ok) return post({ type: 'error', code: 'NOT_READY', needsSetup: true, message: av.reason });

    const req2 = { mode: req.mode, text: req.text, context: req.context || '', title: req.title || '' };
    const key = [provider.id, provider.cacheTag?.(s) ?? '', req2.mode, s.targetLang, s.fallbackLang, s.showAlternatives,
      req2.text, req2.context, req2.title].join('\u0001');
    const hit = await cacheGet(key);
    if (hit) return post({ type: 'done', text: hit, cached: true, engine, model });

    const t0 = performance.now();
    let ttft = 0, lastPost = 0;
    const tidy = (t) => (req2.mode === 'word' ? tidyWordAnswer(t) : t); // 스트리밍 중에도 같은 형식으로 보이게
    // 이미 상당 부분이 결과 언어인 섞인 글은 모델이 가끔 다른 언어(영어)로 뒤집어 번역한다 → 다 받은 뒤 검사해서
    // 뒤집혔으면 다시 시도하고(모두 3번까지), 그래도 그러면 보여주지 않는다. 검사 전에는 글자를 내보내지 않음(영어가 떴다 바뀌지 않게)
    const guard = mostlyTarget(req2, s);
    const run = () => provider.translate(req2, {
      signal: ctrl.signal,
      settings: s,
      onDelta: (full) => {
        const now = performance.now();
        if (!ttft) ttft = now - t0;
        if (!guard && now - lastPost > 30) { lastPost = now; post({ type: 'delta', full: tidy(full) }); } // 너무 잦은 렌더 방지
      }
    });
    try {
      let text = await run();
      for (let tries = 1; guard && wrongLanguage(req2, s, text); tries++) {
        if (tries >= 3) throw new ProviderError(t('번역이 다른 언어로 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.'), { code: 'WRONG_LANG' });
        text = await run();
      }
      const out = tidy(text.trim());
      if (out) cacheSet(key, out);
      const ms = performance.now() - t0;
      post({ type: 'done', text: out, ttft: Math.round(ttft || ms), ms: Math.round(ms), engine, model });
    } catch (e) {
      if (e?.name === 'AbortError' || ctrl.signal.aborted) return;
      if (e instanceof ProviderError) post({ type: 'error', code: e.code, message: e.message, needsSetup: e.needsSetup });
      else post({ type: 'error', code: 'ERR', message: e?.message || String(e) });
    }
  });
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'openOptions') chrome.runtime.openOptionsPage();
  if (msg?.type === 'engineStatus') {
    // 엔진 상태 확인은 항상 여기(background)에서 — claude-cli는 이때 새 설정(모델)용 대기 프로세스도 띄움
    (async () => {
      const [s] = await Promise.all([chrome.storage.local.get(DEFAULTS), uiReady]);
      const out = {};
      for (const src of ['hover', 'selection']) {
        const p = engineFor(src, s);
        out[src] = { id: p.id, ...(await p.available(s).catch((e) => ({ ok: false, reason: e.message }))) };
      }
      sendResponse(out);
    })();
    return true; // 비동기 응답
  }
});

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== 'toggle-hover') return;
  const { hoverEnabled } = await chrome.storage.local.get({ hoverEnabled: DEFAULTS.hoverEnabled });
  await chrome.storage.local.set({ hoverEnabled: !hoverEnabled });
  updateBadge(!hoverEnabled);
});

function updateBadge(hoverOn) {
  chrome.action.setBadgeText({ text: hoverOn ? '' : 'OFF' });
  chrome.action.setBadgeBackgroundColor({ color: '#888' });
}
chrome.storage.onChanged.addListener((ch, area) => {
  if (area === 'local' && ch.hoverEnabled) updateBadge(ch.hoverEnabled.newValue);
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  const s = await chrome.storage.local.get(DEFAULTS);
  updateBadge(s.hoverEnabled);
  if (reason === 'install') {
    const ready = await Promise.all(['hover', 'selection'].map((src) => engineFor(src, s).available(s)))
      .then((r) => r.every((x) => x.ok)).catch(() => false);
    if (!ready) chrome.runtime.openOptionsPage();
  }
});
chrome.runtime.onStartup.addListener(async () => {
  const s = await chrome.storage.local.get(DEFAULTS);
  updateBadge(s.hoverEnabled);
});
