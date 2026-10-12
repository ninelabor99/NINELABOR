# GitHub Actions에서 Firestore 실제 규칙 테스트

이 패키지의 `.github/workflows/firestore-emulator-qa.yml`을 GitHub 저장소에 반영하면 GitHub Actions에서 **후보 규칙**을 Firestore Emulator로 테스트합니다.

1. GitHub 저장소 `ninelabor99/NINELABOR`의 `.github/workflows/` 폴더에 `firestore-emulator-qa.yml`을 추가합니다.
2. `security-review/` 폴더의 `firebase.emulator.json`, `firestore.rules.candidate`, `check-candidate.cjs` 파일이 GitHub에 있는지 확인합니다.
3. `scripts/test-maternity-security-rules.cjs` 파일이 있는지 확인합니다.
4. GitHub 상단 `Actions` → `Firestore candidate emulator QA` → `Run workflow`를 누릅니다.
5. 테스트 로그에서 `Candidate structural checks`와 `Run real Firestore emulator authorization tests` 결과를 확인합니다.

**주의**: 이 대화 환경에서는 npm 네트워크 접근 실패로 GitHub Actions/Emulator 실제 실행 결과를 확인하지 못했습니다. 워크플로 자체도 GitHub에서 아직 실행되지 않았습니다. 기존 테스트는 모성보호에 초점이 맞춰져 있으며 전체 기업 격리/급여/스토리지/관리자 검증을 대신하지 않습니다. 실패 시 로그를 전달하여 규칙과 테스트를 함께 분석해야 합니다. 운영 Firebase에 후보 규칙을 게시하지 마세요.
