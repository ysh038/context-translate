// providers/anthropic-api.js 문구 (엔진 이름·모델 설명·오류)
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 여기서는 이 묶음(anthropicApi)만 모은다 → 번들에 필요한 문구만 들어간다
import { anthropicApi as en } from './locales/en.js';
import { anthropicApi as ja } from './locales/ja.js';
import { anthropicApi as zhCN } from './locales/zh-CN.js';
import { anthropicApi as zhTW } from './locales/zh-TW.js';
import { anthropicApi as es } from './locales/es.js';
import { anthropicApi as fr } from './locales/fr.js';
import { anthropicApi as de } from './locales/de.js';
import { anthropicApi as it } from './locales/it.js';
import { anthropicApi as pt } from './locales/pt.js';
import { anthropicApi as ru } from './locales/ru.js';

export default { en, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, es, fr, de, it, pt, ru };
