# UI 개편 6-D — 회사 대표 급여대장 모바일 화면

- `src/components/dashboard/payroll/PayrollView.tsx`: 모바일 근로자별 급여 카드(상태, 지급/공제/실수령액, 경고, 상세 이동) 추가.
- PC 기존 상세 급여대장 표 유지. 모바일 상세 버튼은 기존 `handleOpenDetail`에 연결.
- 기존 급여 저장/확정/취소/지급완료 및 Firestore 서비스, 회사별 필터링 로직 미수정.
- 실제 브라우저 및 Firebase 연동 검증은 별도 필요.
