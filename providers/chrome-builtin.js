// Chrome 내장 Translator API (무료·즉시, 직역) — 1단계에서 구현
// TODO(1단계): Translator API가 서비스워커에서 안 되면 offscreen document 또는 content script에서 호출
import { ProviderError } from '../core/provider.js';
import { t, addMessages } from '../core/i18n.js';
import messages from '../core/i18n/chrome-builtin.js';

export default {
  id: 'chrome-builtin',
  label: 'Chrome 내장 번역 (무료·직역)',
  async available() {
    return { ok: false, reason: t('Chrome 내장 번역은 아직 준비 중입니다 (1단계).') };
  },
  async translate() {
    throw new ProviderError(t('Chrome 내장 번역은 아직 준비 중입니다 (1단계).'), { code: 'NOT_IMPLEMENTED', needsSetup: true });
  }
};

// 화면 문구 등록. label·hint·help는 보여 주는 쪽(팝업·설정·background)에서 현재 화면 언어로 바꾼다
addMessages(messages);
