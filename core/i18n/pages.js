// 팝업·설정 페이지 문구 (src/popup.html, src/options.html과 그 스크립트, core/의 공용 문구)
// provider마다 다른 문구(엔진 이름·모델 설명·오류)는 providers/<id>.js 안에 있다
export default {
  en: {
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
    '번역할 언어로 된 단어는 건너뛰기': 'Skip words already in the target language',
    '예: 한국어로 번역 중이면 한글 단어': 'e.g. Korean words when translating into Korean',
    '다른 뜻도 함께 보기': 'Show other meanings too',
    '끄면 조금 더 빨라요': 'Turning this off is slightly faster',
    '드래그하면': 'When you select text',
    '바로 번역': 'Translate right away',
    '[번역] 버튼을 눌러야 번역': 'Translate only when you press the [Translate] button',
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
  }
};
