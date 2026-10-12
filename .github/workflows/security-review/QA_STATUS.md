# Firestore 후보 규칙 QA 상태 (2026-10-12)

- 원본 `firestore.rules` **변경하지 않음**.
- 후보 `security-review/firestore.rules.candidate` 역시 이전 수정 초안과 동일.
- 신규 구조 회귀 검사 10개 추가 및 실행.
- Firebase CLI 미설치, npm 레지스트리 DNS 접근 불가(`EAI_AGAIN`)로 에뮬레이터 구동 및 규칙 컴파일 **미완료**.
- 실서비스 Firebase 설정 및 규칙 게시 **미진행**.
- 신규 `firebase.emulator.json`은 로컬 검증 전용이며 운영 배포 설정이 아님.
- 검증 없이 후보 규칙을 운영용으로 승격하지 말 것.
