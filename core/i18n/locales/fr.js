// 화면 문구: Français
// 왼쪽은 코드·HTML에 적힌 한국어 문구(키), 오른쪽이 이 언어로 보여 줄 글. {이름} 자리는 그대로 둔다. (구성은 en.js와 같음)

// 팝업·설정 페이지
export const pages = {
  '마우스 오버 번역': 'Traduction au survol',
  '드래그 번역': 'Traduction par sélection',
  '이 언어로 번역': 'Traduire en',
  '로 번역': 'Traduire en',
  '설정 열기': 'Ouvrir les réglages',
  '모델': 'Modèle',
  '모델 · {list}': 'Modèle · {list}',
  '마우스 오버': 'Survol',
  '드래그': 'Sélection',
  '⚠ {reason} 설정을 확인하세요.': '⚠ {reason} Vérifiez les réglages.',
  '오버 {h} · 드래그 {sel}': 'Survol {h} · Sélection {sel}',
  '이전에 고른 모델': 'Modèle choisi précédemment',
  '확장 백그라운드 응답 없음': 'L’arrière-plan de l’extension ne répond pas',
  'Context Translate · 설정': 'Context Translate · Réglages',
  '바꾸면 바로 저장돼요': 'Les changements sont enregistrés immédiatement',
  '번역 엔진': 'Moteur de traduction',
  '드래그(선택)': 'Sélection (glisser)',
  '사용 가능': 'Disponible',
  '알 수 없음': 'Inconnu',
  'API 키는 이 브라우저에만 저장돼요.': 'La clé API est enregistrée uniquement dans ce navigateur.',
  'API 키': 'Clé API',
  '보기': 'Afficher',
  '숨기기': 'Masquer',
  '연결 테스트': 'Tester la connexion',
  'API 키가 저장되어 있습니다.': 'Une clé API est enregistrée.',
  'API 키를 먼저 입력하세요.': 'Saisissez d’abord une clé API.',
  '확인 중…': 'Vérification…',
  '연결 성공 · API 키가 유효합니다.': 'Connexion réussie · la clé API est valide.',
  '실패: {message}': 'Échec : {message}',
  '언어': 'Langue',
  '이미 그 언어라면 대신': 'Si le texte est déjà dans cette langue, utiliser',
  '원문 언어는 자동으로 알아내요. 어떤 언어로 번역할지는 툴바 팝업에서도 바꿀 수 있어요.':
    'La langue source est détectée automatiquement. Vous pouvez aussi changer la langue cible depuis la fenêtre de la barre d’outils.',
  '화면 언어': 'Langue de l’interface',
  '메뉴와 안내 문구에 쓰는 언어예요': 'La langue des menus et des messages',
  '브라우저 언어 따르기': 'Suivre la langue du navigateur',
  '사용하기': 'Activer',
  'Alt+Shift+H로 켜고 끌 수 있어요': 'Activez ou désactivez avec Alt+Shift+H',
  '언제 번역할까요?': 'Quand traduire',
  '마우스를 올리고 잠시 멈추면': 'Quand la souris s’arrête sur un mot',
  'Alt(⌥) 누른 채로 올리면': 'Au survol en maintenant Alt (⌥)',
  'Shift 누른 채로 올리면': 'Au survol en maintenant Shift',
  'Ctrl 누른 채로 올리면': 'Au survol en maintenant Ctrl',
  '⌘ / Win 누른 채로 올리면': 'Au survol en maintenant ⌘ / Win',
  '기다리는 시간': 'Délai d’attente',
  '마우스를 멈춘 뒤 번역을 시작하기까지': 'Entre l’arrêt de la souris et le début de la traduction',
  '다른 뜻도 함께 보기': 'Afficher aussi les autres sens',
  '끄면 조금 더 빨라요': 'Un peu plus rapide si désactivé',
  '드래그하면': 'Quand vous sélectionnez du texte',
  '바로 번역': 'Traduire immédiatement',
  '문맥 반영': 'Contexte',
  '앞뒤 문맥을 얼마나 함께 보낼까요?': 'Quelle quantité de contexte envoyer',
  '보내지 않음 — 가장 빠름, 다의어 오역 가능': 'Aucun — le plus rapide, risque d’erreur sur les mots ambigus',
  '해당 문장 — 권장 (속도 차이 거의 없음)': 'La phrase — recommandé (presque aucune différence de vitesse)',
  '앞뒤 ±350자 — 문맥 최대, 약간 느려질 수 있음': '±350 caractères autour — contexte maximal, peut être un peu plus lent',
  '문맥은 입력으로만 들어가서 속도에 주는 영향이 작아요. 속도는 주로 모델과 번역 결과 길이에 달려 있어요.':
    'Le contexte n’est envoyé qu’en entrée, il influe donc peu sur la vitesse. La vitesse dépend surtout du modèle et de la longueur de la traduction.',
  '번역해 보기': 'Essayer',
  '드래그 번역 엔진으로 번역해요.': 'Utilise le moteur de traduction par sélection.',
  '캐시된 결과 · {who}': 'Résultat en cache · {who}',
  '첫 글자 {ttft}ms · 전체 {ms}ms · {who}': 'Premier caractère {ttft}ms · total {ms}ms · {who}',
  '저장했어요': 'Enregistré',
  '번역 안 함': 'Ne pas traduire',
  '이미 그 언어인 단어는 건너뛰기': 'Ignorer les mots déjà dans cette langue',
  '예: 한국어로 번역 중이면 한글로만 된 단어. 끄면 올렸을 때도 \'대신\' 고른 언어로 번역해요':
    'p. ex. les mots écrits uniquement en hangul quand on traduit en coréen. Si désactivé, le survol les traduit dans la langue choisie sous « utiliser »',
  '버튼이 뜨고, 눌러야 번역 — 필요할 때만 번역': 'Afficher un bouton et traduire au clic — seulement si besoin',
  '이미 {lang} 글자로만 된 글이라 번역하지 않아요.': 'Ce texte est déjà écrit uniquement en caractères {lang}, il n’est donc pas traduit.'
};

// 툴팁 (src/content.js)
export const content = {
  '번역': 'Traduire',
  '복사': 'Copier',
  '복사됨': 'Copié',
  '닫기 (Esc)': 'Fermer (Échap)',
  '설정 열기': 'Ouvrir les réglages',
  '선택 번역': 'Sélection',
  '화면 고정 켜짐 — 번역창이 항상 이 자리에 뜹니다 (끌어서 위치 변경)\n누르면 해제: 글자 옆에 뜨기':
    'Épinglé — les traductions s’affichent toujours ici (faites glisser pour déplacer)\nCliquez pour détacher : afficher près du texte',
  '화면에 고정 — 다음 번역부터 이 자리에 뜨게 하기\n(지금: 글자 옆에 뜸)': 'Épingler à l’écran — afficher ici les prochaines traductions\n(actuellement : près du texte)',
  '요청 후 지난 시간': 'Temps écoulé depuis la requête',
  '⏳ 오래 걸리고 있어요 — 번역이 이어서 나오는 중이에요': '⏳ C’est un peu long — la traduction continue d’arriver',
  '⏳ 응답이 많이 늦어지고 있어요… (Esc로 닫기)': '⏳ La réponse est très lente… (Échap pour fermer)',
  '⏳ 오래 걸리고 있어요…': '⏳ C’est un peu long…',
  '확장 프로그램이 업데이트되었습니다. 페이지를 새로고침해 주세요.': 'L’extension a été mise à jour. Veuillez recharger la page.',
  '\n(마우스를 멈춘 뒤 대기 {sec}s는 별도)': '\n(sans compter les {sec}s d’attente après l’arrêt de la souris)',
  '캐시': 'cache',
  '이전 결과 재사용': 'Résultat précédent réutilisé',
  '요청 → 완료 {total}': 'Requête → terminé {total}',
  ' (첫 글자 {first})': ' (premier caractère {first})',
  '선택한 텍스트가 너무 깁니다 ({n}자).\n{max}자 이하로 나눠서 선택해 주세요.':
    'La sélection est trop longue ({n} caractères).\nSélectionnez {max} caractères ou moins à la fois.'
};

// providers/anthropic-api.js
export const anthropicApi = {
  'Claude API (API 키)': 'Claude API (clé API)',
  '빠름 · 저렴 (권장)': 'Rapide · économique (recommandé)',
  '더 자연스러운 번역': 'Traduction plus naturelle',
  '가장 정확 · 비쌈': 'Le plus précis · coûteux',
  'Claude API 키가 설정되지 않았습니다.': 'La clé API Claude n’est pas configurée.',
  'API 키가 유효하지 않습니다. 설정에서 확인해 주세요.': 'La clé API n’est pas valide. Vérifiez-la dans les réglages.',
  '이 API 키로는 접근 권한이 없습니다.': 'Cette clé API n’a pas les droits d’accès.',
  '모델을 찾을 수 없습니다: {model}\n설정에서 모델을 다시 선택해 주세요.': 'Modèle introuvable : {model}\nChoisissez à nouveau le modèle dans les réglages.',
  '요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.': 'Limite de requêtes dépassée. Réessayez dans un instant.',
  'Anthropic 서버가 과부하 상태입니다. 잠시 후 다시 시도해 주세요.': 'Les serveurs d’Anthropic sont surchargés. Réessayez dans un instant.',
  'Anthropic 서버 오류 ({status})': 'Erreur du serveur Anthropic ({status})',
  '네트워크 오류: API에 연결할 수 없습니다.': 'Erreur réseau : impossible de joindre l’API.'
};

// providers/chrome-builtin.js
export const chromeBuiltin = {
  'Chrome 내장 번역 (무료·직역)': 'Traduction intégrée de Chrome (gratuite · littérale)',
  'Chrome 내장 번역은 아직 준비 중입니다 (1단계).': 'La traduction intégrée de Chrome n’est pas encore prête.'
};

// providers/claude-cli.js — 개인용 빌드 전용
export const claudeCli = {
  'Claude Code 구독 (claude -p)': 'Abonnement Claude Code (claude -p)',
  '빠름 · 구독 사용량 적음 (권장)': 'Rapide · consomme peu l’abonnement (recommandé)',
  '더 자연스러운 번역': 'Traduction plus naturelle',
  '가장 정확 · 구독 사용량 많음': 'Le plus précis · consomme beaucoup l’abonnement',
  '처음 한 번 터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행해야 합니다. 본인 Claude 구독으로 claude -p를 호출합니다.':
    'Exécutez une fois npm run host:install dans un terminal depuis le dossier du projet. L’extension appelle claude -p avec votre propre abonnement Claude.',
  'claude -p 중계 프로그램이 설치되지 않았습니다.\n터미널에서 프로젝트 폴더로 이동해 npm run host:install 을 실행한 뒤, 확장을 새로고침해 주세요.':
    'Le programme relais de claude -p n’est pas installé.\nDans un terminal, allez dans le dossier du projet, exécutez npm run host:install, puis rechargez l’extension.',
  '중계 프로그램이 이 확장을 허용하지 않습니다(확장 ID 불일치).\nnpm run build:personal 후 npm run host:install 을 다시 실행해 주세요.':
    'Le programme relais n’autorise pas cette extension (ID d’extension différent).\nExécutez npm run build:personal puis à nouveau npm run host:install.',
  '중계 프로그램을 시작하지 못했습니다.\nnpm run host:install 을 다시 실행해 주세요.': 'Impossible de démarrer le programme relais.\nExécutez à nouveau npm run host:install.',
  'claude -p 중계 프로그램 연결이 끊겼습니다: {raw}\nnpm run host:install 을 다시 실행해 보세요.\n로그: ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)':
    'Connexion perdue avec le programme relais de claude -p : {raw}\nEssayez d’exécuter à nouveau npm run host:install.\nJournaux : ~/Library/Logs/claude-tooltip-translate/ (host.log, host.stderr.log)',
  'claude 실행 파일을 찾을 수 없습니다: {path}\n터미널에서 npm run host:install 을 다시 실행해 주세요.':
    'Exécutable claude introuvable : {path}\nExécutez à nouveau npm run host:install dans un terminal.',
  'claude 실행 파일을 찾을 수 없습니다: {path}': 'Exécutable claude introuvable : {path}',
  'claude가 {n}초 동안 응답하지 않습니다.': 'claude ne répond pas depuis {n} secondes.',
  'claude가 비정상 종료되었습니다: {detail}': 'claude s’est arrêté de façon inattendue : {detail}',
  'claude 실행 오류': 'Échec de l’exécution de claude',
  'Claude Code에 로그인되어 있지 않습니다.\n터미널에서 claude 를 실행해 로그인해 주세요.':
    'Vous n’êtes pas connecté à Claude Code.\nExécutez claude dans un terminal et connectez-vous.',
  'Claude 구독 사용 한도에 도달했습니다.\n{message}': 'Vous avez atteint la limite d’utilisation de votre abonnement Claude.\n{message}',
  'claude -p 오류: {message}': 'Erreur claude -p : {message}'
};

// background 공용 문구 (엔진과 상관없는 오류) — src/background.js
export const engine = {
  '번역이 다른 언어로 나와서 표시하지 않았어요.\n한 번 더 시도해 보세요.':
    'La traduction est sortie dans une autre langue, elle n’a donc pas été affichée.\nVeuillez réessayer.'
};
