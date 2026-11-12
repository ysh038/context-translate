// 화면 문구: Deutsch
// 왼쪽은 코드·HTML에 적힌 한국어 문구(키), 오른쪽이 이 언어로 보여 줄 글. {이름} 자리는 그대로 둔다. (구성은 en.js와 같음)

// 팝업·설정 페이지
export const pages = {
  '마우스 오버 번역': 'Hover-Übersetzung',
  '드래그 번역': 'Auswahl-Übersetzung',
  '이 언어로 번역': 'Übersetzen in',
  '로 번역': 'Übersetzen in',
  '설정 열기': 'Einstellungen öffnen',
  '모델': 'Modell',
  '모델 · {list}': 'Modell · {list}',
  '마우스 오버': 'Hover',
  '드래그': 'Auswahl',
  '⚠ {reason} 설정을 확인하세요.': '⚠ {reason} Bitte Einstellungen prüfen.',
  '오버 {h} · 드래그 {sel}': 'Hover {h} · Auswahl {sel}',
  '이전에 고른 모델': 'Zuvor gewähltes Modell',
  '확장 백그라운드 응답 없음': 'Keine Antwort vom Hintergrund der Erweiterung',
  'Context Translate · 설정': 'Context Translate · Einstellungen',
  '바꾸면 바로 저장돼요': 'Änderungen werden sofort gespeichert',
  '번역 엔진': 'Übersetzungs-Engine',
  '드래그(선택)': 'Auswahl (Ziehen)',
  '사용 가능': 'Bereit',
  '알 수 없음': 'Unbekannt',
  'API 키는 이 브라우저에만 저장돼요.': 'Der API-Schlüssel wird nur in diesem Browser gespeichert.',
  'API 키': 'API-Schlüssel',
  '보기': 'Anzeigen',
  '숨기기': 'Verbergen',
  '연결 테스트': 'Verbindung testen',
  'API 키가 저장되어 있습니다.': 'Ein API-Schlüssel ist gespeichert.',
  'API 키를 먼저 입력하세요.': 'Bitte zuerst einen API-Schlüssel eingeben.',
  '확인 중…': 'Wird geprüft…',
  '연결 성공 · API 키가 유효합니다.': 'Verbunden · der API-Schlüssel ist gültig.',
  '실패: {message}': 'Fehlgeschlagen: {message}',
  '언어': 'Sprache',
  '이미 그 언어라면 대신': 'Falls schon in dieser Sprache, stattdessen',
  '원문 언어는 자동으로 알아내요. 어떤 언어로 번역할지는 툴바 팝업에서도 바꿀 수 있어요.':
    'Die Ausgangssprache wird automatisch erkannt. Die Zielsprache lässt sich auch im Popup der Symbolleiste ändern.',
  '화면 언어': 'Anzeigesprache',
  '메뉴와 안내 문구에 쓰는 언어예요': 'Die Sprache der Menüs und Meldungen',
  '브라우저 언어 따르기': 'Browsersprache verwenden',
  '사용하기': 'Aktivieren',
  'Alt+Shift+H로 켜고 끌 수 있어요': 'Mit Alt+Shift+H ein- und ausschalten',
  '언제 번역할까요?': 'Wann übersetzen',
  '마우스를 올리고 잠시 멈추면': 'Wenn die Maus kurz auf einem Wort ruht',
  'Alt(⌥) 누른 채로 올리면': 'Beim Überfahren mit gedrückter Alt-Taste (⌥)',
  'Shift 누른 채로 올리면': 'Beim Überfahren mit gedrückter Shift-Taste',
  'Ctrl 누른 채로 올리면': 'Beim Überfahren mit gedrückter Strg-Taste',
  '⌘ / Win 누른 채로 올리면': 'Beim Überfahren mit gedrückter ⌘- / Win-Taste',
  '기다리는 시간': 'Wartezeit',
  '마우스를 멈춘 뒤 번역을 시작하기까지': 'Wie lange die Maus ruht, bevor übersetzt wird',
  '다른 뜻도 함께 보기': 'Auch andere Bedeutungen anzeigen',
  '끄면 조금 더 빨라요': 'Ausgeschaltet etwas schneller',
  '드래그하면': 'Beim Markieren von Text',
  '바로 번역': 'Sofort übersetzen',
  '문맥 반영': 'Kontext',
  '앞뒤 문맥을 얼마나 함께 보낼까요?': 'Wie viel Kontext mitgesendet wird',
  '보내지 않음 — 가장 빠름, 다의어 오역 가능': 'Keiner — am schnellsten, mehrdeutige Wörter können falsch übersetzt werden',
  '해당 문장 — 권장 (속도 차이 거의 없음)': 'Der Satz — empfohlen (kaum Geschwindigkeitsunterschied)',
  '앞뒤 ±350자 — 문맥 최대, 약간 느려질 수 있음': '±350 Zeichen ringsum — am meisten Kontext, kann etwas langsamer sein',
  '문맥은 입력으로만 들어가서 속도에 주는 영향이 작아요. 속도는 주로 모델과 번역 결과 길이에 달려 있어요.':
    'Kontext ist nur Eingabe und wirkt sich daher kaum auf die Geschwindigkeit aus. Die Geschwindigkeit hängt vor allem vom Modell und von der Länge der Übersetzung ab.',
  '번역해 보기': 'Ausprobieren',
  '드래그 번역 엔진으로 번역해요.': 'Verwendet die Engine der Auswahl-Übersetzung.',
  '캐시된 결과 · {who}': 'Ergebnis aus dem Cache · {who}',
  '첫 글자 {ttft}ms · 전체 {ms}ms · {who}': 'Erstes Zeichen {ttft}ms · gesamt {ms}ms · {who}',
  '저장했어요': 'Gespeichert',
  '번역 안 함': 'Nicht übersetzen',
  '이미 그 언어인 단어는 건너뛰기': 'Wörter überspringen, die schon in dieser Sprache sind',
  '예: 한국어로 번역 중이면 한글로만 된 단어. 끄면 올렸을 때도 \'대신\' 고른 언어로 번역해요':
    'z. B. Wörter nur in Hangul beim Übersetzen ins Koreanische. Ausgeschaltet werden sie beim Überfahren in die unter „stattdessen“ gewählte Sprache übersetzt',
  '버튼이 뜨고, 눌러야 번역 — 필요할 때만 번역': 'Schaltfläche anzeigen und per Klick übersetzen — nur bei Bedarf',
  '이미 {lang} 글자로만 된 글이라 번역하지 않아요.': 'Dieser Text besteht bereits nur aus {lang}-Schriftzeichen und wird daher nicht übersetzt.'
};

// 툴팁 (src/content.js)
export const content = {
  '번역': 'Übersetzen',
  '복사': 'Kopieren',
  '복사됨': 'Kopiert',
  '닫기 (Esc)': 'Schließen (Esc)',
  '설정 열기': 'Einstellungen öffnen',
  '선택 번역': 'Auswahl',
  '화면 고정 켜짐 — 번역창이 항상 이 자리에 뜹니다 (끌어서 위치 변경)\n누르면 해제: 글자 옆에 뜨기':
    'Angeheftet — Übersetzungen erscheinen immer hier (zum Verschieben ziehen)\nKlicken zum Lösen: neben dem Text anzeigen',
  '화면에 고정 — 다음 번역부터 이 자리에 뜨게 하기\n(지금: 글자 옆에 뜸)': 'Am Bildschirm anheften — künftige Übersetzungen hier anzeigen\n(derzeit: neben dem Text)',
  '요청 후 지난 시간': 'Zeit seit der Anfrage',
  '⏳ 오래 걸리고 있어요 — 번역이 이어서 나오는 중이에요': '⏳ Dauert etwas länger — die Übersetzung kommt noch',
  '⏳ 응답이 많이 늦어지고 있어요… (Esc로 닫기)': '⏳ Die Antwort ist sehr langsam… (Esc zum Schließen)',
  '⏳ 오래 걸리고 있어요…': '⏳ Dauert etwas länger…',
  '확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해 주세요.': 'Die Erweiterung wurde aktualisiert. Bitte die Seite neu laden.',
  '\n(마우스를 멈춘 뒤 대기 {sec}s는 별도)': '\n(ohne die {sec}s Wartezeit nach dem Stillstand der Maus)',
  '캐시': 'Cache',
  '이전 결과 재사용': 'Früheres Ergebnis wiederverwendet',
  '요청 → 완료 {total}': 'Anfrage → fertig {total}',
  ' (첫 글자 {first})': ' (erstes Zeichen {first})',
  '선택한 텍스트가 너무 깁니다 ({n}자).\n{max}자 이하로 나눠서 선택해 주세요.': 'Die Auswahl ist zu lang ({n} Zeichen).\nBitte höchstens {max} Zeichen auf einmal markieren.'
};

// providers/anthropic-api.js
export const anthropicApi = {
  'Claude API (API 키)': 'Claude API (API-Schlüssel)',
  '빠름 · 저렴 (권장)': 'Schnell · günstig (empfohlen)',
  '더 자연스러운 번역': 'Natürlichere Übersetzung',
  '가장 정확 · 비쌈': 'Am genauesten · teuer',
  'Claude API 키가 설정되지 않았습니다.': 'Der Claude-API-Schlüssel ist nicht eingerichtet.',
  'API 키가 유효하지 않습니다. 설정에서 확인해 주세요.': 'Der API-Schlüssel ist ungültig. Bitte in den Einstellungen prüfen.',
  '이 API 키로는 접근 권한이 없습니다.': 'Dieser API-Schlüssel hat keinen Zugriff.',
  '모델을 찾을 수 없습니다: {model}\n설정에서 모델을 다시 선택해 주세요.': 'Modell nicht gefunden: {model}\nBitte das Modell in den Einstellungen neu wählen.',
  '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.': 'Anfragelimit überschritten. Bitte gleich noch einmal versuchen.',
  'Anthropic 서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.': 'Die Anthropic-Server sind überlastet. Bitte gleich noch einmal versuchen.',
  'Anthropic 서버 오류 ({status})': 'Anthropic-Serverfehler ({status})',
  '네트워크 오류: API에 연결할 수 없습니다.': 'Netzwerkfehler: Die API ist nicht erreichbar.'
};

// providers/chrome-builtin.js
export const chromeBuiltin = {
  'Chrome 내장 번역 (무료·직역)': 'In Chrome integrierte Übersetzung (kostenlos · wörtlich)',
  'Chrome 내장 번역은 아직 준비 중입니다 (1단계).': 'Die in Chrome integrierte Übersetzung ist noch nicht verfügbar.'
};

// providers/claude-cli.js — 개인용 빌드 전용
export const claudeCli = {
  'Claude Code 구독 (claude -p)': 'Claude-Code-Abo (claude -p)',
  '빠름 · 구독 사용량 적음 (권장)': 'Schnell · geringer Abo-Verbrauch (empfohlen)',
  '더 자연스러운 번역': 'Natürlichere Übersetzung',
  '가장 정확 · 구독 사용량 많음': 'Am genauesten · hoher Abo-Verbrauch',
  '처음 한 번 터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행해야 합니다. 본인 Claude 구독으로 claude -p를 호출합니다.':
    'Einmalig npm run host:install in einem Terminal im Projektordner ausführen. Die Erweiterung ruft claude -p mit Ihrem eigenen Claude-Abo auf.',
  'claude -p 중계 프로그램이 설치되지 않았습니다.\n터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행한 뒤, 확장을 새로고침해 주세요.':
    'Das Hilfsprogramm für claude -p ist nicht installiert.\nIm Terminal in den Projektordner wechseln, npm run host:install ausführen und die Erweiterung neu laden.',
  '중계 프로그램이 이 확장을 허용하지 않습니다(확장 ID 불일치).\nnpm run build:personal 후 npm run host:install 을 다시 실행해 주세요.':
    'Das Hilfsprogramm lässt diese Erweiterung nicht zu (Erweiterungs-ID stimmt nicht überein).\nnpm run build:personal und danach erneut npm run host:install ausführen.',
  '중계 프로그램을 시작하지 못했습니다.\nnpm run host:install 을 다시 실행해 주세요.':
    'Das Hilfsprogramm konnte nicht gestartet werden.\nBitte npm run host:install erneut ausführen.',
  'claude -p 중계 프로그램 연결이 끊겼습니다: {raw}\nnpm run host:install 을 다시 실행해 보세요.\n로그: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)':
    'Verbindung zum Hilfsprogramm für claude -p verloren: {raw}\nBitte npm run host:install erneut ausführen.\nProtokolle: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)',
  'claude 실행 파일을 찾을 수 없습니다: {path}\n터미널에서 npm run host:install 을 다시 실행해 주세요.':
    'Die ausführbare Datei claude wurde nicht gefunden: {path}\nBitte npm run host:install erneut in einem Terminal ausführen.',
  'claude 실행 파일을 찾을 수 없습니다: {path}': 'Die ausführbare Datei claude wurde nicht gefunden: {path}',
  'claude가 {n}초 동안 응답하지 않습니다.': 'claude antwortet seit {n} Sekunden nicht.',
  'claude가 비정상 종료되었습니다: {detail}': 'claude wurde unerwartet beendet: {detail}',
  'claude 실행 오류': 'claude konnte nicht ausgeführt werden',
  '번역 대신 엉뚱한 내용이 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'Statt einer Übersetzung kam etwas anderes zurück und wurde daher nicht angezeigt.\nBitte noch einmal versuchen.',
  'Claude Code에 로그인되어 있지 않습니다.\n터미널에서 claude 를 실행해 로그인해 주세요.':
    'Sie sind nicht bei Claude Code angemeldet.\nclaude in einem Terminal ausführen und anmelden.',
  'Claude 구독 사용 한도에 도달했습니다.\n{message}': 'Das Nutzungslimit Ihres Claude-Abos ist erreicht.\n{message}',
  'claude -p 오류: {message}': 'claude -p Fehler: {message}'
};

// background 공용 문구 (엔진과 상관없는 오류) — src/background.js
export const engine = {
  '번역이 다른 언어로 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'Die Übersetzung kam in einer anderen Sprache und wurde daher nicht angezeigt.\nBitte noch einmal versuchen.'
};
