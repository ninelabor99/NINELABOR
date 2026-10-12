# NINELABOR GitHub 통합소스 보안 검토 (2026-10-12)

## 포함 사항
- 원본 `firestore.rules`는 **변경하지 않음**.
- `security-review/firestore.rules.candidate`에 이전 수정 초안을 별도로 포함.
- `.github/workflows/verify.yml` 등 GitHub 업로드 파일 포함 확인.

## 실제 실행한 검사
- `npm run check:syntax`: 125개 파싱, 구문 오류 0
- `npm run check:imports`: 100개 소스, 420개 import 정상
- `npm run check:security:offline`: 원본 규칙 9/9 통과, 수정 초안 임시 적용 후에도 9/9 통과
- `node scripts/test-maternity-security-rules.cjs`: Firestore Emulator(127.0.0.1:8085) 미실행으로 ECONNREFUSED, **테스트 실패/미검증**

## 반드시 남은 검증
1. Firebase CLI를 설치하고 Firestore Emulator에서 후보 규칙 컴파일 및 권한 테스트.
2. ADMIN/ATTORNEY/COMPANY/WORKER, 회사 A/B, 지점 A/B의 허용·차단 매트릭스 확인.
3. 기존 코드의 생성·수정 필드와 후보 규칙 충돌 여부 검증.
4. 권한 상승·타사 급여·근로자·모성보호·메시지·첨부파일 접근 테스트.
5. 테스트 통과 후에만 후보를 `firestore.rules`로 승격하여 GitHub 커밋 및 Firebase 배포.

## 주의
- 이 ZIP은 **배포용 확정본이 아니라 통합 검토본**입니다.
- 현재 Firebase 콘솔의 `allow read, write: if false` 규칙은 유지하세요.
- GitHub 전체 소스 교체/재업로드도 지금은 필요하지 않습니다.
- 이전 수정 초안은 3개 영역만 변경했으며 전체 규칙 안전성을 입증하지 않습니다.
