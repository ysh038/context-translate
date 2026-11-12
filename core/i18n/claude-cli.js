// providers/claude-cli.js 문구 — 개인용 빌드 전용 (store 번들에는 들어가지 않는다)
// 언어별 문구는 core/i18n/locales/<언어>.js 에 있고, 여기서는 이 묶음(claudeCli)만 모은다 → 번들에 필요한 문구만 들어간다
import { claudeCli as en } from './locales/en.js';
import { claudeCli as ja } from './locales/ja.js';
import { claudeCli as zhCN } from './locales/zh-CN.js';
import { claudeCli as zhTW } from './locales/zh-TW.js';
import { claudeCli as es } from './locales/es.js';
import { claudeCli as fr } from './locales/fr.js';
import { claudeCli as de } from './locales/de.js';
import { claudeCli as it } from './locales/it.js';
import { claudeCli as pt } from './locales/pt.js';
import { claudeCli as ru } from './locales/ru.js';

export default { en, ja, 'zh-CN': zhCN, 'zh-TW': zhTW, es, fr, de, it, pt, ru };
