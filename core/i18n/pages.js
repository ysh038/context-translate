// 팝업·설정 페이지 문구
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 여기서는 이 묶음(pages)만 모은다 → 번들에 필요한 문구만 들어간다
import { pages as en } from './locales/en.js';
import { pages as ja } from './locales/ja.js';
import { pages as zhCN } from './locales/zh-CN.js';
import { pages as zhTW } from './locales/zh-TW.js';
import { pages as es } from './locales/es.js';
import { pages as fr } from './locales/fr.js';
import { pages as de } from './locales/de.js';
import { pages as it } from './locales/it.js';
import { pages as pt } from './locales/pt.js';
import { pages as ru } from './locales/ru.js';

export default { en, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, es, fr, de, it, pt, ru };
