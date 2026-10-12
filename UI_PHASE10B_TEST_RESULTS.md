# 10-B 테스트 결과

## scripts/check-fresh-deployment.cjs
종료 코드: 0
```
PASS Git ignore protects .env
PASS Git ignore protects dependencies
PASS Git ignore protects build output
PASS Frontend build command exists
PASS Express API server exists
PASS Firebase service account documented
PASS RRN encryption key documented
PASS Local env file is not bundled
PASS Private service account file is not bundled
9/9 checks passed (static only)

```

## scripts/check-typescript-syntax.cjs
종료 코드: 0
```
Parsed 125 JS/TS/TSX files; syntax errors: 0. Compiler: 5.8.3

```

## scripts/check-local-imports.cjs
종료 코드: 0
```
Checked 100 source files and 420 local imports.
All statically detected local imports resolved.

```

## scripts/run-offline-security-checks.cjs
종료 코드: 0
```
PASS 지부 권한 정책
PASS 6차 API 연결 정적 검사
PASS 7차 데이터 검증
PASS 8차 데이터 검증
PASS 9차 Firestore 규칙 정적 검사
PASS 10차 지부 규칙 정적 검사
PASS 급여 보안 정적 검사
PASS 관리자 목록 보안 정적 검사
PASS 근로자·기업 격리 정적 검사

결과: 9/9개 검사 스크립트 통과
주의: 정적/오프라인 검사만 수행. Firebase Emulator, 전체 빌드 및 실서비스 보안 검증을 대체하지 않음.

```

## scripts/check-ui-phase10-qa.cjs
종료 코드: 0
```
PASS Google login prevents duplicate clicks
PASS Google login pending always resets
PASS Google button disabled while pending
PASS Google login error announced
PASS Workspace scope attached
PASS Worker tabs horizontally scroll
PASS Company tabs horizontally scroll
PASS Mobile font size avoids zoom
PASS Reduced motion supported
PASS Mobile safe area supported
10/10 checks passed (static only)

```

## scripts/test-phase157-164-ui.cjs
종료 코드: 0
```
oses aria-current
PASS account menu exposes expanded state
PASS official English brand in navigation
PASS official English brand in public website
PASS public website does not use SaaS label
PASS screen errors isolated with ErrorBoundary
PASS boundary does not expose raw error message in UI
PASS error boundary supports retry
PASS portal uses existing PortalShell
PASS public website uses existing PublicWebsite
14 UI integration assertions; PASSED

```

