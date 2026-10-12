import React, { useEffect, useState } from 'react';
import { Company, Worker } from '../../types';
import { firmService } from '../../services/firmService';
import { messageService } from '../../services/messageService';
import { dataRequestService } from '../../services/dataRequestService';
import { useAuth } from '../../contexts/AuthContext';
import { getSubscriptionEntitlement, isCompanyTabVisible } from '../../utils/subscriptionEntitlement';
import { InquiriesView } from './common/InquiriesView';
import { MaternityView } from './maternity/MaternityView';
import { PricingView } from './pricing/PricingView';
import { DataRequestsView } from './requests/DataRequestsView';
import { DocumentsView } from './documents/DocumentsView';
import { MessagesView } from './messages/MessagesView';
import { PayrollView } from './payroll/PayrollView';
import { PayslipsView } from './payroll/PayslipsView';
import { OvertimeView } from './payroll/OvertimeView';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { ModulePlaceholder } from './common/ModulePlaceholder';
import {
  Building2,
  Users,
  DollarSign,
  Receipt,
  CalendarCheck,
  Clock,
  HeartHandshake,
  MessageSquare,
  FileCheck,
  FolderOpen,
  Tag,
  LayoutDashboard,
  Plus,
  MoreVertical,
  CheckCircle2,
  ArrowRight,
  Bell,
  AlertCircle,
  LucideIcon,
  Mail,
  Lock,
} from 'lucide-react';

type CompanyMenuTab =
  | 'dashboard'
  | 'workers'
  | 'payroll'
  | 'payslips'
  | 'attendance'
  | 'overtime'
  | 'maternity'
  | 'inquiries'
  | 'data-submissions'
  | 'messages'
  | 'documents'
  | 'company-info'
  | 'plan';

interface TabItem {
  key: CompanyMenuTab;
  label: string;
  icon: LucideIcon;
}

const COMPANY_TABS: TabItem[] = [
  { key: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { key: 'workers', label: '근로자 관리', icon: Users },
  { key: 'payroll', label: '급여', icon: DollarSign },
  { key: 'payslips', label: '급여명세서', icon: Receipt },
  { key: 'overtime', label: '근태·추가근무', icon: CalendarCheck },
  { key: 'maternity', label: '모성보호', icon: HeartHandshake },
  { key: 'inquiries', label: '노무 문의', icon: MessageSquare },
  { key: 'data-submissions', label: '자료요청', icon: FileCheck },
  { key: 'messages', label: '메시지함', icon: Mail },
  { key: 'documents', label: '문서', icon: FolderOpen },
  { key: 'company-info', label: '회사정보', icon: Building2 },
  { key: 'plan', label: '이용중인 플랜', icon: Tag },
];

export const CompanyView: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<CompanyMenuTab>('dashboard');
  const [company, setCompany] = useState<Company | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [workerSearch, setWorkerSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(0);
  const [pendingDataRequests, setPendingDataRequests] = useState<number | null>(null);

  // Display-only filtering; company-scoped worker loading and permissions remain unchanged.
  const visibleWorkers = workers.filter(worker =>
    [worker.name, worker.department, worker.position].some(value =>
      (value || '').toLocaleLowerCase().includes(workerSearch.trim().toLocaleLowerCase())
    )
  );

  // New Worker Modal State (Only 1 primary action button exists for adding a worker)
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    department: '',
    position: '',
    joinDate: '',
    phone: '',
    email: '',
  });
  const [isSubmittingWorker, setIsSubmittingWorker] = useState(false);

  const fetchCompanyData = async () => {
    if (!userProfile?.companyId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const comp = await firmService.getCompanyById(userProfile.companyId);
      setCompany(comp);
      setPendingDataRequests(null);
      try {
        const requests = await dataRequestService.getDataRequestsByCompany(userProfile.companyId);
        setPendingDataRequests(requests.filter(request => ['REQUESTED', 'REVISION_REQUESTED'].includes(request.status)).length);
      } catch (requestError) {
        console.warn('Failed to load pending requests', requestError);
      }
      if (comp) {
        const workerList = await firmService.getWorkersByCompany(comp.id);
        setWorkers(workerList);
      }

      // Check unread messages for company
      if (currentUser?.uid) {
        try {
          const [compMsgs, reads] = await Promise.all([
            messageService.getMessagesByCompany(userProfile.companyId),
            messageService.getReadsForUser({
              userId: currentUser.uid,
              role: 'COMPANY',
              companyId: userProfile.companyId,
            }),
          ]);
          const readSet = new Set((reads || []).map((r) => r.messageId));
          const unread = (compMsgs || []).filter(
            (m) => m.senderRole === 'ADMIN' && !readSet.has(m.id)
          ).length;
          setUnreadMessageCount(unread);
        } catch (msgErr) {
          console.warn('Failed to load unread messages count:', msgErr);
        }
      }
    } catch (err) {
      console.error('Failed to fetch company data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [userProfile?.companyId]);

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !newWorker.name.trim()) return;

    try {
      setIsSubmittingWorker(true);
      await firmService.createWorker({
        companyId: company.id,
        name: newWorker.name.trim(),
        department: newWorker.department.trim(),
        position: newWorker.position.trim(),
        joinDate: newWorker.joinDate,
        phone: newWorker.phone.trim(),
        email: newWorker.email.trim(),
        status: 'active',
      });

      setNewWorker({
        name: '',
        department: '',
        position: '',
        joinDate: '',
        phone: '',
        email: '',
      });
      setIsWorkerModalOpen(false);
      const list = await firmService.getWorkersByCompany(company.id);
      setWorkers(list);
    } catch (err) {
      console.error('Failed to add worker', err);
    } finally {
      setIsSubmittingWorker(false);
    }
  };

  // [R2-8 2/4-B-④] companies/{companyId}.subscription 기반 중앙 권한 판정
  const entitlement = getSubscriptionEntitlement(company);

  // 활성 플랜 및 권한에 따라 노출할 메뉴 탭 필터링
  const visibleTabs = COMPANY_TABS.filter((tab) => isCompanyTabVisible(tab.key, company));
  const mobilePrimaryTabs = visibleTabs.filter(tab => (['dashboard', 'workers', 'overtime', 'payroll', 'messages'] as CompanyMenuTab[]).includes(tab.key));

  // If company is not yet connected to this company user
  if (!userProfile?.companyId && !loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
        <Building2 className="mx-auto h-12 w-12 text-blue-600" />
        <h2 className="mt-4 text-xl font-bold text-slate-900">소속 기업 정보 확인 중</h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          기업 회원 전용 통합 노무실을 이용하시려면 소속 기업 정보가 연결되어 있어야 합니다.
          회원가입 시 등록하신 사업자 정보를 기반으로 관리자 확인 절차가 진행 중이거나 매칭이 완료되지 않았습니다.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={() => fetchCompanyData()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nine-company-workspace space-y-6">
      {/* Top Header */}
      <div className="nine-company-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              기업 회원 업무공간
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200">
              {company?.companyName || '우리 회사'}
            </span>
            {entitlement.displayStatus === 'ACTIVE' ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                {entitlement.activePlanCode} 플랜 (정상 이용 중)
              </span>
            ) : entitlement.displayStatus === 'PERIOD_EXPIRED' ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200" title={`종료일: ${entitlement.endDate}`}>
                이용기간 만료 ({entitlement.rawPlanCode})
              </span>
            ) : entitlement.displayStatus === 'BEFORE_START' ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200" title={`시작일: ${entitlement.startDate}`}>
                이용 시작 전 ({entitlement.rawPlanCode})
              </span>
            ) : entitlement.displayStatus === 'PENDING' ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                {entitlement.rawPlanCode} 플랜 승인 대기
              </span>
            ) : entitlement.displayStatus === 'EXPIRED' ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                구독 만료 ({entitlement.rawPlanCode})
              </span>
            ) : entitlement.displayStatus === 'CANCELLED' ? (
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-200">
                구독 해지 ({entitlement.rawPlanCode})
              </span>
            ) : (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                구독 미설정
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            우리회사 노무실
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {company?.companyName} 전담 인사노무 관리 | 사업자등록번호: {company?.businessNumber}
          </p>
        </div>

        {activeTab === 'workers' && isCompanyTabVisible('workers', company) && (
          <button
            onClick={() => setIsWorkerModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm hover:bg-slate-800 transition"
          >
            <Plus className="h-4 w-4" />
            직원 등록
          </button>
        )}
      </div>

      {/* Tabs Navigation Bar */}
      <div aria-label="회사 업무 전체 메뉴" className="nine-company-tabs flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-700 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.key === 'workers' && workers.length > 0 && (
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full">
                  {workers.length}
                </span>
              )}
              {tab.key === 'messages' && unreadMessageCount > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-bold shadow-xs">
                  {unreadMessageCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile primary navigation: existing tabs only; plan entitlement already filtered. */}
      <nav aria-label="회사 모바일 주요 메뉴" className="nine-portal-mobile-nav md:hidden">
        {mobilePrimaryTabs.map(tab => {
          const Icon = tab.icon;
          return <button key={tab.key} type="button" aria-current={activeTab === tab.key ? 'page' : undefined} onClick={() => setActiveTab(tab.key)} className={`nine-portal-mobile-nav-item ${activeTab === tab.key ? 'is-active' : ''}`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{tab.key === 'dashboard' ? '홈' : tab.key === 'workers' ? '근로자' : tab.key === 'overtime' ? '근태' : tab.key === 'payroll' ? '급여' : '메시지'}</span>
          </button>;
        })}
      </nav>

      {/* [R2-8 2/4-B-⑤] 직접 접근 차단 가드 (Direct Access Guard) */}
      {!isCompanyTabVisible(activeTab, company) ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-lg font-bold text-slate-900">
            이 기능은 현재 이용 중인 플랜에 포함되어 있지 않습니다.
          </h2>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed">
            해당 업무 메뉴는 상위 플랜에서 제공되는 기능입니다. 요금제를 확인하시고 플랜 변경을 진행해 주세요.
          </p>
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => setActiveTab('plan')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              요금제 확인
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Tab 1: 대시보드 (핵심 요약 6개 항목) */}
          {activeTab === 'dashboard' && (
        <div className="nine-company-dashboard space-y-6">
          <div className="nine-company-summary grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. 처리 필요한 업무 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">처리 필요한 업무</span>
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">확인 필요</span>
                  <span className="text-xs text-slate-400">건 대기중</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  추가근무 메뉴에서 승인 대기 건을 확인하세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('overtime')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 2. 최근 요청 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">최근 노무 문의</span>
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">확인 필요</span>
                  <span className="text-xs text-slate-400">건 진행중</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  노무 문의 메뉴에서 진행 상태를 확인하세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('inquiries')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 3. 급여 관련 상태 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">급여 관련 상태</span>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900">급여 관리</span>
                  <span className="text-xs text-slate-400">명세서 연동</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  등록 근로자 {workers.length}명 · 급여 메뉴에서 상태 확인
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 4. 모성보호 진행 업무 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">모성보호 진행 업무</span>
                  <HeartHandshake className="h-4 w-4 text-rose-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">확인 필요</span>
                  <span className="text-xs text-slate-400">명 신청</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  모성보호 메뉴에서 진행 업무를 확인하세요.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('maternity')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 5. 제출 필요한 자료 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">제출 필요한 자료</span>
                  <FileCheck className="h-4 w-4 text-amber-500" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">{pendingDataRequests === null ? '확인 필요' : pendingDataRequests}</span>
                  <span className="text-xs text-slate-400">건 요청 대기</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  노무사에서 요청한 증빙 서류 제출함입니다.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('data-submissions')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* 6. 이용중인 플랜 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">이용중인 플랜</span>
                  <Tag className="h-4 w-4 text-purple-600" />
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-slate-900">
                    {entitlement.isActive
                      ? entitlement.activePlanCode === 'FREE'
                        ? '무료 플랜 (FREE)'
                        : entitlement.activePlanCode === 'BASIC'
                        ? '베이직 (BASIC)'
                        : entitlement.activePlanCode === 'STANDARD'
                        ? '스탠다드 (STANDARD)'
                        : entitlement.activePlanCode === 'OUTSOURCING'
                        ? '급여 아웃소싱'
                        : entitlement.activePlanCode === 'CUSTOM'
                        ? '기업 맞춤형 (CUSTOM)'
                        : entitlement.activePlanCode
                      : '구독 미설정'}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      entitlement.isActive
                        ? 'text-emerald-600'
                        : entitlement.status === 'PENDING'
                        ? 'text-amber-600'
                        : entitlement.status === 'EXPIRED'
                        ? 'text-rose-600'
                        : entitlement.status === 'CANCELLED'
                        ? 'text-slate-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {entitlement.isActive
                      ? '활성'
                      : entitlement.status === 'PENDING'
                      ? '대기중'
                      : entitlement.status === 'EXPIRED'
                      ? '만료됨'
                      : entitlement.status === 'CANCELLED'
                      ? '해지됨'
                      : '미설정'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {entitlement.isActive
                    ? entitlement.activePlanCode === 'FREE'
                      ? '기본 인사노무 시스템 무료 이용'
                      : entitlement.activePlanCode === 'BASIC'
                      ? '기본 노무관리 + 자료요청 + 문서관리'
                      : entitlement.activePlanCode === 'STANDARD'
                      ? '정기 노무자문 + 1:1 노무 문의'
                      : entitlement.activePlanCode === 'OUTSOURCING'
                      ? '전문 공인노무사 위탁 급여산정 및 4대보험 대행'
                      : '기업 규모와 특성에 맞춘 맞춤형 컨설팅'
                    : '전담 노무사를 통해 맞춤형 요금제를 설정할 수 있습니다.'}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setActiveTab('plan')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900"
                >
                  전체보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 최근 알림 카드 */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900">최근 알림</h3>
              </div>
              <span className="text-[11px] text-slate-400">안내</span>
            </div>
            <div className="mt-3 text-xs text-slate-600 py-1">
              우리회사 노무실에 오신 것을 환영합니다. 직원 명부 및 노무 자문 서비스를 이용하실 수 있습니다.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 근로자 관리 */}
      {activeTab === 'workers' && (
        <section className="nine-company-workers overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs" aria-label="근로자 명부">
          <div className="nine-workers-toolbar">
            <div>
              <h2 className="text-base font-bold text-slate-900">근로자 관리</h2>
              <p className="mt-1 text-xs text-slate-500">소속 근로자 {workers.length}명 · 회사별 명부</p>
            </div>
            <label className="nine-workers-search">
              <span className="sr-only">근로자 이름, 부서, 직급 검색</span>
              <input type="search" value={workerSearch} onChange={event => setWorkerSearch(event.target.value)}
                placeholder="이름·부서·직급 검색" aria-label="근로자 이름, 부서, 직급 검색" />
            </label>
          </div>
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">직원 명부를 불러오는 중입니다...</div>
          ) : workers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-800">등록된 직원이 없습니다</h3>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                상단의 '직원 등록' 버튼을 눌러 첫 근로자를 등록하세요.
              </p>
            </div>
          ) : visibleWorkers.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500" role="status">검색 결과가 없습니다.</p>
          ) : (
            <>
            <div className="nine-worker-mobile-list md:hidden">
              {visibleWorkers.map(worker => (
                <article key={worker.id} className="nine-worker-mobile-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-900">{worker.name}</h3>
                      <p className="mt-1 text-xs text-slate-500">{[worker.department, worker.position].filter(Boolean).join(' · ') || '부서·직급 미등록'}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${worker.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {worker.status === 'active' ? '재직' : worker.status}
                    </span>
                  </div>
                  <dl className="nine-worker-mobile-details">
                    <div><dt>연락처</dt><dd className="break-all">{worker.phone || worker.email || '-'}</dd></div>
                    <div><dt>입사일</dt><dd>{worker.joinDate || '-'}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto" role="region" aria-label="근로자 명부 표" tabIndex={0}>
              <table className="nine-company-worker-table w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                  <tr>
                    <th className="py-3 px-4">성명</th>
                    <th className="py-3 px-4">부서</th>
                    <th className="py-3 px-4">직급</th>
                    <th className="py-3 px-4">연락처</th>
                    <th className="py-3 px-4">입사일</th>
                    <th className="py-3 px-4">상태</th>
                    <th className="py-3 px-4 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visibleWorkers.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-medium text-slate-900">{w.name}</td>
                      <td className="py-3.5 px-4 text-slate-600">{w.department || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{w.position || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{w.phone || w.email || '-'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{w.joinDate || '-'}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium ${
                            w.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.status === 'active' ? '재직' : w.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => alert(`근로자 ID: ${w.id}`)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          title="상세"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
        </section>
      )}

      {/* Tab 3: 급여 */}
      {activeTab === 'payroll' && (
        <ErrorBoundary fallbackTitle="급여 관리 화면 로딩 오류">
          <PayrollView role="COMPANY" companyId={company?.id} />
        </ErrorBoundary>
      )}

      {/* Tab 4: 급여명세서 */}
      {activeTab === 'payslips' && (
        <ErrorBoundary fallbackTitle="급여명세서 화면 로딩 오류">
          <PayslipsView role="COMPANY" companyId={company?.id} />
        </ErrorBoundary>
      )}

      {/* Tab 5: 근태·추가근무 (통합) */}
      {(activeTab === 'overtime' || activeTab === 'attendance') && (
        <ErrorBoundary fallbackTitle="근태·추가근무 관리 화면 로딩 오류">
          <OvertimeView
            role="COMPANY"
            companyId={company?.id}
            title="근태·추가근무 관리"
            description="월별 근로자별 근태 및 추가근무(연장·휴일근무) 실적을 통합 관리하며, 급여관리와 직접 연동됩니다."
          />
        </ErrorBoundary>
      )}

      {/* Tab 7: 모성보호 */}
      {activeTab === 'maternity' && (
        <ErrorBoundary fallbackTitle="모성보호 업무 화면 로딩 오류">
          <MaternityView role="COMPANY" companyId={company?.id || userProfile?.companyId || ''} />
        </ErrorBoundary>
      )}

      {/* Tab 8: 노무 문의 */}
      {activeTab === 'inquiries' && (
        <InquiriesView
          role="COMPANY"
          title="노무 자문 질의"
          description="인사노무 관련 법률 질의를 전담 공인노무사에게 문의하고 답변을 확인합니다."
        />
      )}

      {/* Tab 9: 자료 제출 */}
      {activeTab === 'data-submissions' && (
        <DataRequestsView role="COMPANY" companyId={company?.id || userProfile?.companyId || undefined} />
      )}

      {/* Tab 10: 메시지함 (R2-6 1/3-A 메시지함 기반 구조) */}
      {activeTab === 'messages' && (
        <ErrorBoundary fallbackTitle="메시지함 화면 로딩 오류">
          <MessagesView
            role="COMPANY"
            companyId={company?.id || userProfile?.companyId || undefined}
            onUnreadCountChange={setUnreadMessageCount}
          />
        </ErrorBoundary>
      )}

      {/* Tab 11: 문서 */}
      {activeTab === 'documents' && (
        <DocumentsView role="COMPANY" companyId={company?.id || userProfile?.companyId || undefined} />
      )}

      {/* Tab 11: 회사정보 (데이터 출처: users/{uid}.companyId -> companies/{companyId}) */}
      {activeTab === 'company-info' && (
        <div className="space-y-4 max-w-3xl">
          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-800 border-t-transparent mb-3" />
              <p className="text-xs text-slate-500">회사 정보를 불러오는 중입니다...</p>
            </div>
          ) : company ? (
            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-7">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-base font-bold text-slate-900">소속 기업 기본 정보</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    등록된 사업장 정보를 확인할 수 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    {company.status === 'active' ? '이용 중' : company.status}
                  </span>
                  <button
                    onClick={() => fetchCompanyData()}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50 transition"
                  >
                    새로고침
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2 sm:gap-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">회사명 (상호)</span>
                  <span className="font-bold text-slate-900 text-sm">{company.companyName}</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">사업자등록번호</span>
                  <span className="break-all font-mono text-sm font-semibold text-slate-800">{company.businessNumber}</span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">대표자명</span>
                  <span className="font-medium text-slate-800">
                    {company.representativeName || userProfile?.displayName || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">대표 연락처</span>
                  <span className="font-medium text-slate-800">
                    {company.contactPhone || userProfile?.phone || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">담당자 이메일</span>
                  <span className="break-all font-medium text-slate-800">
                    {company.contactEmail || userProfile?.email || '-'}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 sm:col-span-2">
                  <span className="text-slate-400 block text-[11px] mb-1 font-medium">사업장 주소</span>
                  <span className="font-medium text-slate-800">
                    {company.address || '주소 등록 준비 중 (노무사에게 정보 변경 요청 가능)'}
                  </span>
                </div>

              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-900 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-blue-950">회사 기본 정보 변경 안내</p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    사업자등록번호, 법인명 등 주요 세무·노무 정보의 변경은 전담 공인노무사 확인 후 안전하게 반영됩니다.
                    정보 변경이 필요하신 경우 [노무 문의] 탭을 통해 변경 요청을 남겨주시면 신속히 반영해 드립니다.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-bold text-slate-900">회사 정보 조회 중</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                회원 프로필에 등록된 소속 기업 식별자(ID: <span className="font-mono font-bold text-slate-800">{userProfile?.companyId || '미등록'}</span>, 기업명: <span className="font-bold text-slate-800">{userProfile?.companyName || '미등록'}</span>)의 세부정보를 불러오는 중입니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => fetchCompanyData()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                >
                  회사 정보 다시 불러오기
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 12: 이용중인 플랜 (Canonical Pricing View) */}
      {activeTab === 'plan' && <PricingView />}
        </>
      )}

      {/* Single Modal for Adding Worker */}
      {isWorkerModalOpen && (
        <div className="nine-workspace-modal fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="nine-workspace-dialog w-full max-w-md rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">직원 등록</h3>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddWorker} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  성명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 김민수"
                  value={newWorker.name}
                  onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">부서</label>
                  <input
                    type="text"
                    placeholder="경영지원팀"
                    value={newWorker.department}
                    onChange={(e) => setNewWorker({ ...newWorker, department: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">직급 / 직책</label>
                  <input
                    type="text"
                    placeholder="팀장"
                    value={newWorker.position}
                    onChange={(e) => setNewWorker({ ...newWorker, position: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">입사일자</label>
                <input
                  type="date"
                  value={newWorker.joinDate}
                  onChange={(e) => setNewWorker({ ...newWorker, joinDate: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">휴대전화번호</label>
                  <input
                    type="text"
                    placeholder="010-0000-0000"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">이메일</label>
                  <input
                    type="email"
                    placeholder="worker@company.com"
                    value={newWorker.email}
                    onChange={(e) => setNewWorker({ ...newWorker, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWorker}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmittingWorker ? '등록 중...' : '직원 등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
