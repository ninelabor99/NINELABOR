# NINELABOR 신규 환경 구축 안내 (10-B)

## 현재 상황
기존 GitHub·Netlify·Google AI Studio 프로젝트가 삭제되었으므로 새 저장소와 배포 환경이 필요합니다. 이 ZIP은 **소스코드**이며 운영 배포 완료본이 아닙니다.

## 배포 전에 반드시 확인
1. 새 **비공개 GitHub 저장소** 생성. ZIP을 풀어 소스 파일을 업로드하며 `.env`, 서비스 계정 JSON, 개인키를 절대 업로드하지 않습니다.
2. 별도 개발 환경에서 Node/npm 설치 후 `npm install`, `npm run lint`, `npm run build`를 실행하고 오류를 수정합니다. 현재 환경에서는 npm 설치가 시간 초과되어 실제 빌드가 미검증입니다.
3. `server.ts`는 **Express API 서버**입니다. `vite build`가 성공해도 Netlify 정적 호스팅만으로 `/api` 경로가 동작하지 않습니다. Express 서버를 실행할 별도 서버 환경(또는 적절한 서버리스 전환)이 필요합니다.
4. 새 Firebase 프로젝트를 생성하거나 실제 접근 가능한 기존 Firebase 프로젝트를 연결합니다. Firebase Auth, Firestore 규칙, Storage 활성화와 규칙을 점검합니다.
5. 서버 환경변수 `FIREBASE_SERVICE_ACCOUNT_KEY`, `RRN_ENCRYPTION_KEY`, 필요 시 `GEMINI_API_KEY` 등을 **서버 비밀 설정**에만 보관합니다. 프런트엔드 빌드에 서버 비밀키를 주입하지 않습니다.
6. 관리자·기업·근로자 테스트 계정을 사용하여 권한, 기업별 데이터 격리, 급여명세서 접근, 파일 업로드/다운로드를 검증합니다. 실 개인정보 대신 가상 데이터를 사용합니다.
7. PG 결제는 실제 계약·심사·연동 및 검증 전까지 비활성 상태를 유지합니다.

## 로컬 확인 명령
```bash
npm install
npm run lint
npm run build
node scripts/check-fresh-deployment.cjs
node scripts/check-typescript-syntax.cjs
node scripts/check-local-imports.cjs
node scripts/run-offline-security-checks.cjs
```

## 주의
오프라인 정적 검사 통과는 실서비스 보안·배포 준비 완료를 의미하지 않습니다. 운영 배포 전 Firebase Emulator 또는 격리된 테스트 프로젝트에서 통합 테스트가 필요합니다.
