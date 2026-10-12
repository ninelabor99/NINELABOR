# UI 6-C: 추가근무 출근부 모바일 목록

- 대상: `src/components/dashboard/payroll/OvertimeView.tsx`
- 모바일(<768px): 기존 filteredRecords 기반 카드형 추가근무 목록. 날짜, 시간, 구분, 근로자, 부서·직책, 메모 및 합계 제공.
- 기존 수정·삭제 핸들러 재사용, WORKER에게 관리 버튼 미표시.
- 데스크톱(>=768px): 기존 표 유지.
- 변경하지 않음: Firestore 쿼리, 급여 계산, 승인 정책, 인증, 데이터 구조.
- 미구현: 일반 출퇴근 달력/휴가 신청 화면 리디자인, 실제 Firebase·브라우저 통합 테스트.
- 검사: check-typescript-syntax 125/125, check-local-imports 420개, offline security 9/9.
