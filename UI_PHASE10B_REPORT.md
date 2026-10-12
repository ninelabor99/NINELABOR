# 10-B 실제 점검 및 신규 구축 준비

- 기존 10단계 통합소스 기반으로 신규 구축 가이드 추가.
- `scripts/check-fresh-deployment.cjs`에 배포 전 정적 계약 9개 추가.
- Express API 서버가 포함되어 있어 Netlify 정적 배포만으로 기능을 제공할 수 없음을 명시.
- npm install 시도는 시간 초과로 실패: 전체 lint/build 미검증.
- 기존 UI/권한/급여 기능의 실행 로직은 변경하지 않음.
