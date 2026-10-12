# 10-C: 신규 GitHub 저장소 이전 전 소스 안전 점검

## 실제 변경
- `scripts/check-source-export-safety.cjs`: 소스 ZIP을 GitHub에 옮기기 전 비밀 환경파일·서비스 계정 파일·빌드 산출물 포함 여부 및 필수 구성 검사. 파일명만 출력하며 키 값은 출력하지 않음.
- `.gitignore`: 개인키, 서비스 계정 파일, Firebase/Netlify 로컬 폴더 제외 규칙 추가.
- `package.json`: `npm run check:source-export` 명령 추가.

## 검증 한계
- 이 검사는 정적 파일 존재 여부를 확인하며 파일 내부의 모든 비밀값을 찾아내는 종합 비밀정보 검사는 아님.
- npm 의존성이 설치되지 않은 상태에서는 `npm run build`, `npm run lint` 통과 여부를 검증할 수 없음.
- Firebase/Auth/Firestore/Storage, Express API, 실제 브라우저는 별도 테스트가 필요함.

## 사용자 다음 단계
- 최신 ZIP을 별도 보관한 뒤 신규 비공개 GitHub 저장소에 압축 해제된 소스만 올리기.
- 새 Firebase 프로젝트 설정과 서버 API 배포 구성을 확인한 뒤 테스트 환경에서만 연결하기.
- 운영 전 `npm install`, `npm run lint`, `npm run build`, `npm run check:source-export` 실행.
