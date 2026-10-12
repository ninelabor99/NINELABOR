# 8-D 관리자 문의 및 구독 신청 반응형 보완

## 실제 변경
- `src/components/dashboard/common/InquiriesView.tsx`: 기존 필터링된 문의 목록을 모바일 카드로 표시하고, PC 테이블은 유지. 문의 상세 버튼은 기존 `handleOpenDetail` 연결. 상세 팝업 동적 뷰포트/스크롤 보완.
- `src/components/dashboard/admin/AdminSubscriptionsView.tsx`: 기존 구독 변경 신청 목록(레거시 화면)에 모바일 카드와 기존 심사 팝업 연결. **주의: 이 레거시 신청 화면은 현재 `LEGACY_REQUESTS_ENABLED = false`이므로 기본 화면에서는 노출되지 않음.** 구독 신청 기능을 새로 활성화하지 않았으며 결제 기능도 추가하지 않음.
- 서비스/Firebase/RBAC/급여 상태 전환 로직 변경 없음.

## 검증
- TypeScript/TSX 구문 검사: 125개 파싱, 오류 0
- 로컬 import 검사: 420개 정상
- 오프라인 보안 검사: 9/9 통과
- 실제 브라우저, Firebase, E2E, 빌드: 미검증

## 미완료
- 관리자 메시지함, 자료요청, 구독관리 활성 화면의 전면 디자인
- 관리자 전체 업무 화면의 디자인 통일 및 실기기 테스트
