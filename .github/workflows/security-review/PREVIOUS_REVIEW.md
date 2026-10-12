# NINELABOR Firestore 보안 규칙 수정 초안 (배포 전 검증 필요)

대상: 사용자가 업로드한 `firestore.rules.txt` (1597줄, 마지막 빈 줄 포함)
산출물: `firestore.rules` (수정 초안), 원본은 변경하지 않음.

## 수정 내용
1. `workers/{workerId}` 기업 담당자의 update에서 `companyId`, `userId`, `employeeId` 불변 검증을 추가했습니다. 기존 회사 식별 및 구독 요건은 유지했습니다.
2. `maternity_cases/{caseId}` 근로자 create에 본인 `employeeId`와 `companyId`, `createdById` 일치 검증을 추가했습니다. 기업 담당자 update에는 `employeeId`, `createdById` 불변 검증을 추가했습니다.
3. `maternity_deductions/{deductionId}` create에서 존재하지 않는 기존 `resource.data` 참조를 제거하고 `request.resource.data` 기준으로 분기 및 기업 소유권을 확인하도록 했습니다. update는 회사 식별자와 지점 태그 불변 검증을 추가했습니다.

## 미해결 / 후속 점검 사항
- `workers` create 시 사용자 식별자 및 지점 태그 검증, 회사 담당자의 민감 필드 변경 가능 범위, delete 정책을 별도 설계해야 합니다.
- `maternity_cases` 기업 담당자 create/update 필드 허용 목록 및 민감정보 보호를 강화해야 합니다.
- `maternity_deductions` 원장 수정/삭제는 실제로 서버 전용이어야 하는지 확인이 필요합니다. 현재 ADMIN SDK는 규칙을 우회하므로 클라이언트의 관리자 권한과 별도입니다.
- `isAdmin()`은 `admins/{uid}`와 `users/{uid}`의 서버 신뢰 가능한 초기 생성이 필요합니다. 클라이언트에서 임의로 ADMIN 프로필을 만들지 마세요.
- Firestore 보안 규칙의 `list`는 필터가 아닙니다. 모든 쿼리의 조건이 규칙의 제한을 충족하는지 앱과 함께 테스트해야 합니다.
- 회사별/지점별 분리, 급여, 모성보호, 메시지, 첨부파일, 공개 디렉터리 등 전체 권한 매트릭스에 대한 에뮬레이터 테스트가 필요합니다.

## 검증 수준
- 완료: 업로드 원본과 수정 파일의 텍스트 차이 비교, 중괄호 개수 일치, 변경 위치 확인.
- 미실시: Firebase CLI 규칙 컴파일, Firebase Emulator 접근권한 테스트, 실제 앱 호환성 테스트, Firebase 배포.
- 판정: **배포 승인 전 단계**. 실제 서비스나 Firebase 콘솔에 바로 게시하지 마세요.

## 다음 단계
1. GitHub 저장소의 최신 전체 소스 ZIP 또는 규칙 테스트 코드를 확보합니다.
2. Firebase CLI/Emulator에서 규칙을 컴파일하고 사용자별 허용/차단 회귀 테스트를 수행합니다.
3. 검증된 최종 규칙을 GitHub에 커밋하고 Firebase에 배포합니다.
