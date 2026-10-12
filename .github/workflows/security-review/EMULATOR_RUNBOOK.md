# NINELABOR Firestore 후보 규칙 검증 안내

**아직 실제 권한 검증이 완료된 규칙이 아닙니다. 운영 Firebase에 게시하지 마세요.**

## 준비
- Node.js, Java, Firebase CLI (`npm install -g firebase-tools`)가 필요합니다.
- Firebase 프로젝트에 로그인할 필요 없이 `demo-ninelabor` 로컬 프로젝트로 시험할 수 있습니다.
- 실제 고객정보를 에뮬레이터에 입력하지 마세요.

## 명령 (프로젝트 루트에서)

```bash
node security-review/check-candidate.cjs
```

**주의:** 기존 `scripts/test-maternity-security-rules.cjs`는 자체적으로 `demo-no-project` 프로젝트 ID를 사용합니다. 따라서 그대로 실행하면 에뮬레이터 프로젝트 ID가 달라 검증이 실패할 수 있습니다. 다음처럼 실행할 때에는 테스트 스크립트의 PROJECT_ID와 CLI의 `--project`를 같은 값(`demo-no-project`)으로 맞춰야 합니다.

```bash
firebase emulators:exec --project demo-no-project --config security-review/firebase.emulator.json 'node scripts/test-maternity-security-rules.cjs'
```

이 기존 테스트는 과거 보안 요구사항을 대상으로 작성되어 후보 규칙과 충돌하는 경우가 있을 수 있습니다. 실패 항목은 규칙과 테스트 기대값을 각각 조사해야 하며, **무조건 테스트 기대값에 맞춰 규칙을 약화하면 안 됩니다.**

## 확인할 사항
- 회사 A/B 및 지점 A/B 간 문서 열람·수정 차단
- 관리자 초기 생성 절차 및 권한 부여
- 근로자 소속·사용자 ID 변경 차단
- 모성보호 타인 사건 생성 및 차감 원장 생성·수정
- 급여명세서·메시지·파일 메타데이터 접근 차단
- 정상 업무 시나리오 허용 여부

정적 검사 통과만으로 Firestore 규칙 컴파일·실제 접근 차단이 입증되지는 않습니다.
