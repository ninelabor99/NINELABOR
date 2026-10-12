# UI 개편 4단계: 로그인·회원가입 약관 표시 정합성

## 실제 변경
- `src/config/policies.ts`: 8종 정책 각각의 고유한 섹션·안내 내용 분리. 화면 검토용 문안이며 정식 법률 약관 확정 전 검토 필요.
- `src/components/common/PolicyModal.tsx`: 정책별 고유 본문 렌더링, 열 때 선택한 정책 ID 동기화. 동일한 이용약관 내용이 모든 정책에 표시되던 문제 수정.
- `src/components/auth/RegisterModal.tsx`: 필수 개인정보 수집·이용 동의 전문보기 ID 수정, 선택 마케팅 동의 전문보기 ID 수정.

## 보존
- Firebase Auth/Firestore, 가입 요청 페이로드, 회원 역할, 가입 데이터 처리, 서버 API, 급여 및 근태 기능 수정하지 않음.

## 확인 결과
- TypeScript/TSX syntax: 125개, 오류 0
- Local imports: 419개 경로 정상
- Offline security checks: 9/9 통과
- 실제 npm build, 브라우저 로그인/회원가입, Firebase 인증·Firestore 저장은 검증하지 않음 (node_modules 미설치, Firebase 연결 환경 없음).

## 남은 작업
- 실제 법률 약관 전문 확정 및 운영 정보 대입.
- 회원가입 오류는 실제 Firebase 오류 코드·규칙·배포 환경을 확인해야 재현 및 수정 가능. 이번 작업에서 해결됐다고 주장하지 않음.
- 가입 화면의 전체 디자인 재구성은 별도 세부 단계로 진행.
