// providers/chrome-builtin.js 문구
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 여기서는 이 묶음(chromeBuiltin)만 모은다 → 번들에 필요한 문구만 들어간다
import { chromeBuiltin as en } from './locales/en.js';
import { chromeBuiltin as ja } from './locales/ja.js';
import { chromeBuiltin as zhCN } from './locales/zh-CN.js';
import { chromeBuiltin as zhTW } from './locales/zh-TW.js';
import { chromeBuiltin as es } from './locales/es.js';
import { chromeBuiltin as fr } from './locales/fr.js';
import { chromeBuiltin as de } from './locales/de.js';
import { chromeBuiltin as it } from './locales/it.js';
import { chromeBuiltin as pt } from './locales/pt.js';
import { chromeBuiltin as ru } from './locales/ru.js';

export default { en, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, es, fr, de, it, pt, ru };
