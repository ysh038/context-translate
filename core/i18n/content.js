// 툴팁(content script) 문구 — 모든 페이지에 들어가는 스크립트라 툴팁에 쓰는 것만
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 여기서는 이 묶음(content)만 모은다 → 번들에 필요한 문구만 들어간다
import { content as en } from './locales/en.js';
import { content as ja } from './locales/ja.js';
import { content as zhCN } from './locales/zh-CN.js';
import { content as zhTW } from './locales/zh-TW.js';
import { content as es } from './locales/es.js';
import { content as fr } from './locales/fr.js';
import { content as de } from './locales/de.js';
import { content as it } from './locales/it.js';
import { content as pt } from './locales/pt.js';
import { content as ru } from './locales/ru.js';

export default { en, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, es, fr, de, it, pt, ru };
