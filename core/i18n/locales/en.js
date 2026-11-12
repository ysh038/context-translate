// 화면 문구: English
// 왼쪽은 코드·HTML에 적힌 한국어 문구(키), 오른쪽이 이 언어로 보여 줄 글. {이름} 자리는 그대로 둔다.
// 쓰는 곳별로 나눠 export한다 — 번들에는 그 화면이 쓰는 묶음만 들어간다 (core/i18n/*.js 가 모음)

// 팝업·설정 페이지 (src/popup.html, src/options.html과 그 스크립트, core/의 공용 문구)
export const pages = {
  // 팝업
  '마우스 오버 번역': 'Hover translation',
  '드래그 번역': 'Drag translation',
  '이 언어로 번역': 'Translate into',
  '로 번역': 'Translate into', // 한국어: [한국어 ▾] 로 번역 / 영어: Translate into [한국어 ▾] (순서는 ui.css에서 바꿈)
  '설정 열기': 'Open settings',
  '모델': 'Model',
  '모델 · {list}': 'Model · {list}',
  '마우스 오버': 'Hover',
  '드래그': 'Drag',
  '⚠ {reason} 설정을 확인하세요.': '⚠ {reason} Check the settings.',
  '오버 {h} · 드래그 {sel}': 'Hover {h} · Drag {sel}',
  '이전에 고른 모델': 'Previously selected model',
  '확장 백그라운드 응답 없음': 'No response from the extension background',

  // 설정 페이지
  'Context Translate · 설정': 'Context Translate · Settings',
  '바꾸면 바로 저장돼요': 'Changes are saved right away',
  '번역 엔진': 'Translation engine',
  '드래그(선택)': 'Drag (selection)',
  '사용 가능': 'Ready',
  '알 수 없음': 'Unknown',
  'API 키는 이 브라우저에만 저장돼요.': 'Your API key is stored only in this browser.',
  'API 키': 'API key',
  '보기': 'Show',
  '숨기기': 'Hide',
  '연결 테스트': 'Test connection',
  'API 키가 저장되어 있습니다.': 'An API key is saved.',
  'API 키를 먼저 입력하세요.': 'Enter an API key first.',
  '확인 중…': 'Checking…',
  '연결 성공 · API 키가 유효합니다.': 'Connected · the API key is valid.',
  '실패: {message}': 'Failed: {message}',
  '언어': 'Language',
  '이미 그 언어라면 대신': 'If already in that language, use',
  '원문 언어는 자동으로 알아내요. 어떤 언어로 번역할지는 툴바 팝업에서도 바꿀 수 있어요.':
    'The source language is detected automatically. You can also change the language to translate into from the toolbar popup.',
  '화면 언어': 'Display language',
  '메뉴와 안내 문구에 쓰는 언어예요': 'The language of menus and messages',
  '브라우저 언어 따르기': 'Follow the browser language',
  '사용하기': 'Enable',
  'Alt+Shift+H로 켜고 끌 수 있어요': 'Toggle with Alt+Shift+H',
  '언제 번역할까요?': 'When to translate',
  '마우스를 올리고 잠시 멈추면': 'When the mouse rests on a word',
  'Alt(⌥) 누른 채로 올리면': 'When hovering while holding Alt (⌥)',
  'Shift 누른 채로 올리면': 'When hovering while holding Shift',
  'Ctrl 누른 채로 올리면': 'When hovering while holding Ctrl',
  '⌘ / Win 누른 채로 올리면': 'When hovering while holding ⌘ / Win',
  '기다리는 시간': 'Wait time',
  '마우스를 멈춘 뒤 번역을 시작하기까지': 'How long the mouse rests before translating',
  '다른 뜻도 함께 보기': 'Show other meanings too',
  '끄면 조금 더 빨라요': 'Turning this off is slightly faster',
  '드래그하면': 'When you select text',
  '바로 번역': 'Translate right away',
  '문맥 반영': 'Context',
  '앞뒤 문맥을 얼마나 함께 보낼까요?': 'How much surrounding context to send',
  '보내지 않음 — 가장 빠름, 다의어 오역 가능': 'None — fastest, may mistranslate ambiguous words',
  '해당 문장 — 권장 (속도 차이 거의 없음)': 'The sentence — recommended (almost no speed difference)',
  '앞뒤 ±350자 — 문맥 최대, 약간 느려질 수 있음': '±350 characters around — most context, may be slightly slower',
  '문맥은 입력으로만 들어가서 속도에 주는 영향이 작아요. 속도는 주로 모델과 번역 결과 길이에 달려 있어요.':
    'Context is only input, so it has little effect on speed. Speed depends mostly on the model and the length of the translation.',
  '번역해 보기': 'Try it',
  '드래그 번역 엔진으로 번역해요.': 'Uses the drag translation engine.',
  '캐시된 결과 · {who}': 'Cached result · {who}',
  '첫 글자 {ttft}ms · 전체 {ms}ms · {who}': 'First character {ttft}ms · total {ms}ms · {who}',
  '저장했어요': 'Saved',

  // fix-skip-target-language 브랜치에서 바뀌는 문구 (머지되면 바로 쓰이도록 미리 넣어 둠)
  '번역 안 함': 'Don’t translate',
  '이미 그 언어인 단어는 건너뛰기': 'Skip words already in that language',
  "예: 한국어로 번역 중이면 한글로만 된 단어. 끄면 올렸을 때도 '대신' 고른 언어로 번역해요":
    'e.g. words written only in Hangul when translating into Korean. If off, hovering translates them into the “instead” language',
  '버튼이 뜨고, 눌러야 번역 — 필요할 때만 번역': 'Show a button and translate when you press it — only when needed',
  '이미 {lang} 글자로만 된 글이라 번역하지 않아요.': 'This text is already written only in {lang} script, so it isn’t translated.'
};

// 툴팁 (src/content.js) — 모든 페이지에 들어가는 스크립트라 툴팁에 쓰는 것만
export const content = {
  '번역': 'Translate',
  '복사': 'Copy',
  '복사됨': 'Copied',
  '닫기 (Esc)': 'Close (Esc)',
  '설정 열기': 'Open settings',
  '선택 번역': 'Selection',
  '화면 고정 켜짐 — 번역창이 항상 이 자리에 뜹니다 (끌어서 위치 변경)\n누르면 해제: 글자 옆에 뜨기':
    'Pinned — translations always appear here (drag to move)\nClick to unpin: show next to the text',
  '화면에 고정 — 다음 번역부터 이 자리에 뜨게 하기\n(지금: 글자 옆에 뜸)':
    'Pin to screen — show translations here from now on\n(now: next to the text)',
  '요청 후 지난 시간': 'Time since the request',
  '⏳ 오래 걸리고 있어요 — 번역이 이어서 나오는 중이에요': '⏳ Taking a while — the translation is still coming',
  '⏳ 응답이 많이 늦어지고 있어요… (Esc로 닫기)': '⏳ The response is very slow… (Esc to close)',
  '⏳ 오래 걸리고 있어요…': '⏳ Taking a while…',
  '확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해 주세요.': 'The extension was updated. Please reload the page.',
  '\n(마우스를 멈춘 뒤 대기 {sec}s는 별도)': '\n(not counting the {sec}s wait after the mouse stops)',
  '캐시': 'cached',
  '이전 결과 재사용': 'Reused an earlier result',
  '요청 → 완료 {total}': 'Request → done {total}',
  ' (첫 글자 {first})': ' (first character {first})',
  '선택한 텍스트가 너무 깁니다 ({n}자).\n{max}자 이하로 나눠서 선택해 주세요.':
    'The selection is too long ({n} characters).\nPlease select {max} characters or fewer at a time.'
};

// providers/anthropic-api.js
export const anthropicApi = {
  'Claude API (API 키)': 'Claude API (API key)',
  '빠름 · 저렴 (권장)': 'Fast · cheap (recommended)',
  '더 자연스러운 번역': 'More natural translation',
  '가장 정확 · 비쌈': 'Most accurate · expensive',
  'Claude API 키가 설정되지 않았습니다.': 'The Claude API key is not set.',
  'API 키가 유효하지 않습니다. 설정에서 확인해 주세요.': 'The API key is not valid. Please check it in settings.',
  '이 API 키로는 접근 권한이 없습니다.': 'This API key does not have access.',
  '모델을 찾을 수 없습니다: {model}\n설정에서 모델을 다시 선택해 주세요.': 'Model not found: {model}\nPlease choose the model again in settings.',
  '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.': 'Rate limit exceeded. Please try again in a moment.',
  'Anthropic 서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.': 'Anthropic servers are overloaded. Please try again in a moment.',
  'Anthropic 서버 오류 ({status})': 'Anthropic server error ({status})',
  '네트워크 오류: API에 연결할 수 없습니다.': 'Network error: could not reach the API.'
};

// providers/chrome-builtin.js
export const chromeBuiltin = {
  'Chrome 내장 번역 (무료·직역)': 'Chrome built-in translation (free · literal)',
  'Chrome 내장 번역은 아직 준비 중입니다 (1단계).': 'Chrome built-in translation is not ready yet.'
};

// providers/claude-cli.js — 개인용 빌드 전용 (store 번들에는 들어가지 않는다)
export const claudeCli = {
  'Claude Code 구독 (claude -p)': 'Claude Code subscription (claude -p)',
  '빠름 · 구독 사용량 적음 (권장)': 'Fast · light on subscription usage (recommended)',
  '더 자연스러운 번역': 'More natural translation',
  '가장 정확 · 구독 사용량 많음': 'Most accurate · heavy on subscription usage',
  '처음 한 번 터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행해야 합니다. 본인 Claude 구독으로 claude -p를 호출합니다.':
    'Run npm run host:install once in a terminal from the project folder. It calls claude -p with your own Claude subscription.',
  'claude -p 중계 프로그램이 설치되지 않았습니다.\n터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행한 뒤, 확장을 새로고침해 주세요.':
    'The claude -p helper is not installed.\nIn a terminal, go to the project folder and run npm run host:install, then reload the extension.',
  '중계 프로그램이 이 확장을 허용하지 않습니다(확장 ID 불일치).\nnpm run build:personal 후 npm run host:install 을 다시 실행해 주세요.':
    'The helper does not allow this extension (extension ID mismatch).\nRun npm run build:personal and then npm run host:install again.',
  '중계 프로그램을 시작하지 못했습니다.\nnpm run host:install 을 다시 실행해 주세요.':
    'Could not start the helper.\nPlease run npm run host:install again.',
  'claude -p 중계 프로그램 연결이 끊겼습니다: {raw}\nnpm run host:install 을 다시 실행해 보세요.\n로그: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)':
    'Lost the connection to the claude -p helper: {raw}\nTry running npm run host:install again.\nLogs: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)',
  'claude 실행 파일을 찾을 수 없습니다: {path}\n터미널에서 npm run host:install 을 다시 실행해 주세요.':
    'Could not find the claude executable: {path}\nPlease run npm run host:install again in a terminal.',
  'claude 실행 파일을 찾을 수 없습니다: {path}': 'Could not find the claude executable: {path}',
  'claude가 {n}초 동안 응답하지 않습니다.': 'claude has not responded for {n} seconds.',
  'claude가 비정상 종료되었습니다: {detail}': 'claude exited unexpectedly: {detail}',
  'claude 실행 오류': 'claude failed to run',
  '번역 대신 엉뚱한 내용이 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'Something other than a translation came back, so it wasn’t shown.\nPlease try again.',
  'Claude Code에 로그인되어 있지 않습니다.\n터미널에서 claude 를 실행해 로그인해 주세요.':
    'You are not logged in to Claude Code.\nRun claude in a terminal and log in.',
  'Claude 구독 사용 한도에 도달했습니다.\n{message}': 'You have reached your Claude subscription usage limit.\n{message}',
  'claude -p 오류: {message}': 'claude -p error: {message}'
};

// background 공용 문구 (엔진과 상관없는 오류) — src/background.js
export const engine = {
  '번역이 다른 언어로 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'The translation came out in the wrong language, so it wasn’t shown.\nPlease try again.'
};
