export interface PolicyDocument {
  id: string;
  type: string;
  title: string;
  version: string;
  required: boolean;
  summary: string;
  lastUpdated: string;
}

export const CURRENT_TERMS_VERSION = 'v1.0.0';

export const POLICY_DOCUMENTS: PolicyDocument[] = [
  {
    id: 'terms-of-service',
    type: 'TERMS_OF_SERVICE',
    title: '서비스 이용약관',
    version: CURRENT_TERMS_VERSION,
    required: true,
    summary: '노무법인 나인 온라인 노무관리 서비스 이용에 관한 권리와 의무 및 기본 운영 규정입니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'privacy-collection',
    type: 'PRIVACY_COLLECTION',
    title: '개인정보 수집·이용 동의',
    version: CURRENT_TERMS_VERSION,
    required: true,
    summary: '회원가입, 기업 및 근로자 노무관리, 본인 확인을 위한 최소한의 개인정보 수집 및 처리 동의입니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'marketing-consent',
    type: 'MARKETING_CONSENT',
    title: '선택적 마케팅 정보 수신 동의',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '노동법 개정 안내, 신규 노무 컨설팅 세미나 및 프로모션 안내 수신 동의입니다 (미동의 시에도 가입 가능).',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'privacy-policy',
    type: 'PRIVACY_POLICY',
    title: '개인정보처리방침',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '개인정보보호법에 의거하여 고객의 소중한 개인정보를 안전하게 처리하고 보호하기 위한 방침입니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'paid-service-terms',
    type: 'PAID_SERVICE_TERMS',
    title: '유료서비스 이용 안내',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '오프라인 계약·결제 확인 후 관리자가 이용 플랜과 기간을 지정하는 운영 안내입니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'refund-policy',
    type: 'REFUND_POLICY',
    title: '취소·환불정책',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '오프라인 계약에 따른 취소·환불 조건은 개별 계약 및 적용 법령에 따라 안내합니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'subscription-cancellation',
    type: 'SUBSCRIPTION_CANCELLATION',
    title: '서비스 이용 종료 안내',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '자동결제 없이 운영되는 플랜의 종료·변경 및 잔여 이용기간에 관한 안내입니다.',
    lastUpdated: '2026-03-01',
  },
  {
    id: 'withdrawal-policy',
    type: 'WITHDRAWAL_POLICY',
    title: '회원탈퇴 및 서비스 이용종료 정책',
    version: CURRENT_TERMS_VERSION,
    required: false,
    summary: '계정 탈퇴 시 소속 기업 데이터 격리, 법정 보존 서류 관리 및 서비스 이용 종료 절차입니다.',
    lastUpdated: '2026-03-01',
  },
];


/** 정책별 안내 내용. 운영 정책의 법률 검토 및 실제 사업자 정보 확정 전 공개 시 확인 필요. */
export const POLICY_SECTIONS: Record<string, { heading: string; paragraphs: string[] }[]> = {
  'terms-of-service': [
    { heading: '서비스 이용 및 계정', paragraphs: ['노무법인 나인은 기업 회원과 근로자 회원에게 온라인 노무관리 업무공간을 제공합니다.', '회원은 본인의 계정을 안전하게 관리해야 하며, 다른 회원 또는 기업의 정보에 접근해서는 안 됩니다.'] },
    { heading: '회원별 이용 권한', paragraphs: ['기업 회원은 소속 기업에 허용된 업무를, 근로자 회원은 본인에게 허용된 정보를 이용할 수 있습니다.', '구독 플랜 및 계약에 따라 이용 가능한 메뉴와 서비스 범위가 달라질 수 있습니다.'] },
    { heading: '서비스 변경 및 문의', paragraphs: ['서비스 점검이나 관련 법령 변경에 따라 기능 및 운영 정책이 조정될 수 있습니다.', '유료 계약, 이용 종료 및 환불 조건은 별도의 안내와 개별 계약을 확인해 주세요.'] },
  ],
  'privacy-collection': [
    { heading: '수집·이용 목적', paragraphs: ['회원가입 및 본인 식별, 계정 관리, 소속 기업 확인과 노무관리 서비스 제공을 위해 개인정보를 이용합니다.'] },
    { heading: '수집 항목', paragraphs: ['가입 유형에 따라 이름, 이메일, 연락처, 소속 기업, 부서 및 직책 등 가입 화면에 입력한 정보를 수집합니다.', '급여·근태 업무에 필요한 추가 정보는 해당 업무에서 별도 안내 및 권한에 따라 처리합니다.'] },
    { heading: '동의 및 보유', paragraphs: ['필수 수집·이용 동의를 거부할 수 있으나 회원가입이 제한될 수 있습니다.', '보유 기간은 개인정보처리방침과 관련 법령에 따른 보존 의무를 따릅니다.'] },
  ],
  'marketing-consent': [
    { heading: '선택 동의 대상', paragraphs: ['법령 개정 소식, 노무 관련 행사 및 서비스 소식 등 선택적 안내를 받기 위한 동의입니다.'] },
    { heading: '수신 항목 및 철회', paragraphs: ['회원이 제공한 이메일 등 선택한 연락 수단으로 안내할 수 있습니다.', '동의하지 않아도 회원가입과 기본 서비스 이용에 불이익이 없으며, 이후 수신 동의를 철회할 수 있습니다.'] },
  ],
  'privacy-policy': [
    { heading: '개인정보 처리 원칙', paragraphs: ['노무법인 나인은 회원 식별, 기업·근로자 관리, 업무 처리 및 문의 응대를 위해 필요한 개인정보를 처리합니다.', '회원별 접근 권한을 구분하고 기업 간 업무 데이터가 섞이지 않도록 관리합니다.'] },
    { heading: '보관 및 안전성 확보', paragraphs: ['개인정보는 이용 목적과 관계 법령에서 정한 기간 동안 보관하고, 보존 기간이 종료되면 적절한 방법으로 파기합니다.', '민감한 식별정보 및 급여 관련 정보에는 별도 접근 통제와 보호조치를 적용합니다.'] },
    { heading: '정보주체의 권리', paragraphs: ['회원은 관계 법령에 따라 개인정보 열람·정정·삭제·처리정지 등을 요청할 수 있습니다.', '실제 공개 전 개인정보 보호책임자, 연락처, 위탁처리 현황과 세부 보유기간을 확인하여 정식 방침으로 보완해야 합니다.'] },
  ],
  'paid-service-terms': [
    { heading: '유료 서비스 범위', paragraphs: ['구독형 노무관리 서비스, 급여 아웃소싱, 기업맞춤형 서비스는 계약 범위와 플랜에 따라 제공됩니다.'] },
    { heading: '이용 개시 및 결제', paragraphs: ['실제 결제 방식, 이용 개시일과 제공 범위는 계약 및 결제 안내에서 확인해야 합니다.', '현재 온라인 결제 연동이 완료되지 않았으므로 화면에 표시된 상품이 자동 결제되는 것은 아닙니다.'] },
  ],
  'refund-policy': [
    { heading: '취소 및 환불 신청', paragraphs: ['계약 취소나 환불을 원하는 경우 계약 담당자에게 신청해 주세요.', '서비스 개시 여부, 제공된 업무의 범위, 개별 계약 조건과 적용 법령에 따라 처리됩니다.'] },
    { heading: '유의 사항', paragraphs: ['구체적인 환불 산정 기준은 체결한 계약서 및 최종 고지된 환불정책을 우선 확인해야 합니다.', '정식 운영 전 상품별 환불 기준과 신청 경로를 별도로 확정해야 합니다.'] },
  ],
  'subscription-cancellation': [
    { heading: '플랜 변경 및 종료', paragraphs: ['플랜 변경과 서비스 종료는 계약 담당자를 통해 신청할 수 있습니다.', '이용 종료일, 잔여 이용기간, 데이터 열람 범위는 계약과 운영 정책에 따라 안내됩니다.'] },
    { heading: '자동결제 안내', paragraphs: ['현재 자동결제 기능은 연동되어 있지 않습니다. 결제 기능 도입 시 별도의 사전 안내가 필요합니다.'] },
  ],
  'withdrawal-policy': [
    { heading: '회원탈퇴 신청', paragraphs: ['회원탈퇴는 서비스 운영자에게 신청할 수 있으며, 본인 확인과 소속 관계 확인 후 처리됩니다.'] },
    { heading: '데이터 처리', paragraphs: ['탈퇴하더라도 근로계약, 임금대장 등 관계 법령상 보존 의무가 있는 자료는 정해진 기간 동안 보관될 수 있습니다.', '탈퇴에 따른 접근 제한과 기업 소유 업무자료의 처리 방식은 계정 유형 및 계약 관계에 따라 달라집니다.'] },
  ],
};
