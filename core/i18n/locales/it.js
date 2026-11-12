// 화면 문구: Italiano
// 왼쪽은 코드·HTML에 적힌 한국어 문구(키), 오른쪽이 이 언어로 보여 줄 글. {이름} 자리는 그대로 둔다. (구성은 en.js와 같음)

// 팝업·설정 페이지
export const pages = {
  '마우스 오버 번역': 'Traduci al passaggio',
  '드래그 번역': 'Traduci la selezione',
  '이 언어로 번역': 'Traduci in',
  '로 번역': 'Traduci in',
  '설정 열기': 'Apri impostazioni',
  '모델': 'Modello',
  '모델 · {list}': 'Modello · {list}',
  '마우스 오버': 'Passaggio',
  '드래그': 'Selezione',
  '⚠ {reason} 설정을 확인하세요.': '⚠ {reason} Controlla le impostazioni.',
  '오버 {h} · 드래그 {sel}': 'Passaggio {h} · Selezione {sel}',
  '이전에 고른 모델': 'Modello scelto in precedenza',
  '확장 백그라운드 응답 없음': 'Nessuna risposta dal processo in background dell’estensione',
  'Context Translate · 설정': 'Context Translate · Impostazioni',
  '바꾸면 바로 저장돼요': 'Le modifiche vengono salvate subito',
  '번역 엔진': 'Motore di traduzione',
  '드래그(선택)': 'Selezione (trascinamento)',
  '사용 가능': 'Disponibile',
  '알 수 없음': 'Sconosciuto',
  'API 키는 이 브라우저에만 저장돼요.': 'La chiave API viene salvata solo in questo browser.',
  'API 키': 'Chiave API',
  '보기': 'Mostra',
  '숨기기': 'Nascondi',
  '연결 테스트': 'Prova connessione',
  'API 키가 저장되어 있습니다.': 'È salvata una chiave API.',
  'API 키를 먼저 입력하세요.': 'Inserisci prima una chiave API.',
  '확인 중…': 'Verifica in corso…',
  '연결 성공 · API 키가 유효합니다.': 'Connessione riuscita · la chiave API è valida.',
  '실패: {message}': 'Operazione non riuscita: {message}',
  '언어': 'Lingua',
  '이미 그 언어라면 대신': 'Se è già in quella lingua, usa',
  '원문 언어는 자동으로 알아내요. 어떤 언어로 번역할지는 툴바 팝업에서도 바꿀 수 있어요.':
    'La lingua di origine viene rilevata automaticamente. Puoi cambiare la lingua di destinazione anche dal popup della barra degli strumenti.',
  '화면 언어': 'Lingua dell’interfaccia',
  '메뉴와 안내 문구에 쓰는 언어예요': 'La lingua di menu e messaggi',
  '브라우저 언어 따르기': 'Segui la lingua del browser',
  '사용하기': 'Attiva',
  'Alt+Shift+H로 켜고 끌 수 있어요': 'Attiva o disattiva con Alt+Shift+H',
  '언제 번역할까요?': 'Quando tradurre',
  '마우스를 올리고 잠시 멈추면': 'Quando il mouse si ferma su una parola',
  'Alt(⌥) 누른 채로 올리면': 'Al passaggio tenendo premuto Alt (⌥)',
  'Shift 누른 채로 올리면': 'Al passaggio tenendo premuto Shift',
  'Ctrl 누른 채로 올리면': 'Al passaggio tenendo premuto Ctrl',
  '⌘ / Win 누른 채로 올리면': 'Al passaggio tenendo premuto ⌘ / Win',
  '기다리는 시간': 'Tempo di attesa',
  '마우스를 멈춘 뒤 번역을 시작하기까지': 'Da quando il mouse si ferma a quando inizia la traduzione',
  '다른 뜻도 함께 보기': 'Mostra anche altri significati',
  '끄면 조금 더 빨라요': 'Disattivandolo è un po’ più veloce',
  '드래그하면': 'Quando selezioni del testo',
  '바로 번역': 'Traduci subito',
  '문맥 반영': 'Contesto',
  '앞뒤 문맥을 얼마나 함께 보낼까요?': 'Quanto contesto inviare',
  '보내지 않음 — 가장 빠름, 다의어 오역 가능': 'Nessuno — il più veloce, può sbagliare le parole ambigue',
  '해당 문장 — 권장 (속도 차이 거의 없음)': 'La frase — consigliato (quasi nessuna differenza di velocità)',
  '앞뒤 ±350자 — 문맥 최대, 약간 느려질 수 있음': '±350 caratteri intorno — massimo contesto, può essere un po’ più lento',
  '문맥은 입력으로만 들어가서 속도에 주는 영향이 작아요. 속도는 주로 모델과 번역 결과 길이에 달려 있어요.':
    'Il contesto viene inviato solo come input, quindi incide poco sulla velocità. La velocità dipende soprattutto dal modello e dalla lunghezza della traduzione.',
  '번역해 보기': 'Prova',
  '드래그 번역 엔진으로 번역해요.': 'Usa il motore della traduzione della selezione.',
  '캐시된 결과 · {who}': 'Risultato dalla cache · {who}',
  '첫 글자 {ttft}ms · 전체 {ms}ms · {who}': 'Primo carattere {ttft}ms · totale {ms}ms · {who}',
  '저장했어요': 'Salvato',
  '번역 안 함': 'Non tradurre',
  '이미 그 언어인 단어는 건너뛰기': 'Salta le parole già in quella lingua',
  '예: 한국어로 번역 중이면 한글로만 된 단어. 끄면 올렸을 때도 \'대신\' 고른 언어로 번역해요':
    'es. le parole scritte solo in hangul quando traduci in coreano. Se disattivato, al passaggio vengono tradotte nella lingua scelta in «usa»',
  '버튼이 뜨고, 눌러야 번역 — 필요할 때만 번역': 'Mostra un pulsante e traduci quando lo premi — solo quando serve',
  '이미 {lang} 글자로만 된 글이라 번역하지 않아요.': 'Questo testo è già scritto solo in caratteri {lang}, quindi non viene tradotto.'
};

// 툴팁 (src/content.js)
export const content = {
  '번역': 'Traduci',
  '복사': 'Copia',
  '복사됨': 'Copiato',
  '닫기 (Esc)': 'Chiudi (Esc)',
  '설정 열기': 'Apri impostazioni',
  '선택 번역': 'Selezione',
  '화면 고정 켜짐 — 번역창이 항상 이 자리에 뜹니다 (끌어서 위치 변경)\n누르면 해제: 글자 옆에 뜨기':
    'Fissato — le traduzioni compaiono sempre qui (trascina per spostare)\nFai clic per sbloccare: mostra accanto al testo',
  '화면에 고정 — 다음 번역부터 이 자리에 뜨게 하기\n(지금: 글자 옆에 뜸)': 'Fissa sullo schermo — mostra qui le prossime traduzioni\n(ora: accanto al testo)',
  '요청 후 지난 시간': 'Tempo trascorso dalla richiesta',
  '⏳ 오래 걸리고 있어요 — 번역이 이어서 나오는 중이에요': '⏳ Ci vuole un po’ — la traduzione sta ancora arrivando',
  '⏳ 응답이 많이 늦어지고 있어요… (Esc로 닫기)': '⏳ La risposta è molto lenta… (Esc per chiudere)',
  '⏳ 오래 걸리고 있어요…': '⏳ Ci vuole un po’…',
  '확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해 주세요.': 'L’estensione è stata aggiornata. Ricarica la pagina.',
  '\n(마우스를 멈춘 뒤 대기 {sec}s는 별도)': '\n(esclusi i {sec}s di attesa dopo che il mouse si è fermato)',
  '캐시': 'cache',
  '이전 결과 재사용': 'Riutilizzato un risultato precedente',
  '요청 → 완료 {total}': 'Richiesta → completata {total}',
  ' (첫 글자 {first})': ' (primo carattere {first})',
  '선택한 텍스트가 너무 깁니다 ({n}자).\n{max}자 이하로 나눠서 선택해 주세요.': 'La selezione è troppo lunga ({n} caratteri).\nSeleziona al massimo {max} caratteri alla volta.'
};

// providers/anthropic-api.js
export const anthropicApi = {
  'Claude API (API 키)': 'Claude API (chiave API)',
  '빠름 · 저렴 (권장)': 'Veloce · economico (consigliato)',
  '더 자연스러운 번역': 'Traduzione più naturale',
  '가장 정확 · 비쌈': 'Il più preciso · costoso',
  'Claude API 키가 설정되지 않았습니다.': 'La chiave API di Claude non è impostata.',
  'API 키가 유효하지 않습니다. 설정에서 확인해 주세요.': 'La chiave API non è valida. Controllala nelle impostazioni.',
  '이 API 키로는 접근 권한이 없습니다.': 'Questa chiave API non ha i permessi di accesso.',
  '모델을 찾을 수 없습니다: {model}\n설정에서 모델을 다시 선택해 주세요.': 'Modello non trovato: {model}\nScegli di nuovo il modello nelle impostazioni.',
  '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.': 'Limite di richieste superato. Riprova tra poco.',
  'Anthropic 서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.': 'I server di Anthropic sono sovraccarichi. Riprova tra poco.',
  'Anthropic 서버 오류 ({status})': 'Errore del server Anthropic ({status})',
  '네트워크 오류: API에 연결할 수 없습니다.': 'Errore di rete: impossibile raggiungere l’API.'
};

// providers/chrome-builtin.js
export const chromeBuiltin = {
  'Chrome 내장 번역 (무료·직역)': 'Traduzione integrata di Chrome (gratuita · letterale)',
  'Chrome 내장 번역은 아직 준비 중입니다 (1단계).': 'La traduzione integrata di Chrome non è ancora pronta.'
};

// providers/claude-cli.js — 개인용 빌드 전용
export const claudeCli = {
  'Claude Code 구독 (claude -p)': 'Abbonamento Claude Code (claude -p)',
  '빠름 · 구독 사용량 적음 (권장)': 'Veloce · consuma poco l’abbonamento (consigliato)',
  '더 자연스러운 번역': 'Traduzione più naturale',
  '가장 정확 · 구독 사용량 많음': 'Il più preciso · consuma molto l’abbonamento',
  '처음 한 번 터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행해야 합니다. 본인 Claude 구독으로 claude -p를 호출합니다.':
    'Esegui una volta npm run host:install in un terminale dalla cartella del progetto. L’estensione chiama claude -p con il tuo abbonamento Claude.',
  'claude -p 중계 프로그램이 설치되지 않았습니다.\n터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행한 뒤, 확장을 새로고침해 주세요.':
    'Il programma di supporto per claude -p non è installato.\nIn un terminale vai nella cartella del progetto, esegui npm run host:install e ricarica l’estensione.',
  '중계 프로그램이 이 확장을 허용하지 않습니다(확장 ID 불일치).\nnpm run build:personal 후 npm run host:install 을 다시 실행해 주세요.':
    'Il programma di supporto non consente questa estensione (ID dell’estensione non corrispondente).\nEsegui npm run build:personal e poi di nuovo npm run host:install.',
  '중계 프로그램을 시작하지 못했습니다.\nnpm run host:install 을 다시 실행해 주세요.': 'Impossibile avviare il programma di supporto.\nEsegui di nuovo npm run host:install.',
  'claude -p 중계 프로그램 연결이 끊겼습니다: {raw}\nnpm run host:install 을 다시 실행해 보세요.\n로그: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)':
    'Connessione persa con il programma di supporto per claude -p: {raw}\nProva a eseguire di nuovo npm run host:install.\nLog: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)',
  'claude 실행 파일을 찾을 수 없습니다: {path}\n터미널에서 npm run host:install 을 다시 실행해 주세요.':
    'Eseguibile claude non trovato: {path}\nEsegui di nuovo npm run host:install in un terminale.',
  'claude 실행 파일을 찾을 수 없습니다: {path}': 'Eseguibile claude non trovato: {path}',
  'claude가 {n}초 동안 응답하지 않습니다.': 'claude non risponde da {n} secondi.',
  'claude가 비정상 종료되었습니다: {detail}': 'claude si è chiuso in modo imprevisto: {detail}',
  'claude 실행 오류': 'Errore nell’esecuzione di claude',
  '번역 대신 엉뚱한 내용이 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'Il risultato non era una traduzione, quindi non è stato mostrato.\nRiprova.',
  'Claude Code에 로그인되어 있지 않습니다.\n터미널에서 claude 를 실행해 로그인해 주세요.':
    'Non hai effettuato l’accesso a Claude Code.\nEsegui claude in un terminale ed effettua l’accesso.',
  'Claude 구독 사용 한도에 도달했습니다.\n{message}': 'Hai raggiunto il limite di utilizzo del tuo abbonamento Claude.\n{message}',
  'claude -p 오류: {message}': 'Errore claude -p: {message}'
};

// background 공용 문구 (엔진과 상관없는 오류) — src/background.js
export const engine = {
  '번역이 다른 언어로 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'La traduzione è uscita in un’altra lingua, quindi non è stata mostrata.\nRiprova.'
};
