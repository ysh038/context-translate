// 툴팁(content script) 문구 — 모든 페이지에 들어가는 스크립트라 여기에는 툴팁에 쓰는 것만 둔다
export default {
  en: {
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
  }
};
