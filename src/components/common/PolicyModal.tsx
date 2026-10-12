import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { POLICY_DOCUMENTS, POLICY_SECTIONS } from '../../config/policies';
import { ShieldCheck, X, FileText, CheckCircle, ExternalLink } from 'lucide-react';

interface PolicyModalProps {
  initialPolicyId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  initialPolicyId = 'terms-of-service',
  isOpen,
  onClose,
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialPolicyId);

  useEffect(() => {
    if (isOpen) setSelectedId(initialPolicyId);
  }, [initialPolicyId, isOpen]);

  if (!isOpen) return null;

  const currentPolicy =
    POLICY_DOCUMENTS.find((p) => p.id === selectedId || p.type === selectedId) ||
    POLICY_DOCUMENTS[0];

  const modalNode = (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto border border-slate-200 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs">
              9
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  노무법인 나인 정책 및 약관 센터
                </h3>
                <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                  {currentPolicy.version}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                투명하고 안전한 기업용 온라인 노무관리 서비스 이용 규정입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Policy List Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 p-3 overflow-y-auto space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              약관 및 정책 목록
            </div>
            {POLICY_DOCUMENTS.map((doc) => {
              const isSelected = doc.id === currentPolicy.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedId(doc.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition ${
                    isSelected
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{doc.title}</span>
                  {doc.required && (
                    <span
                      className={`text-[9px] px-1 py-0.5 rounded font-bold ${
                        isSelected ? 'bg-slate-800 text-slate-200' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      필수
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Policy Text Viewer */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    currentPolicy.required
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {currentPolicy.required ? '필수 동의 규정' : '운영 및 이용 정책'}
                </span>
                <span className="text-xs text-slate-400">
                  최종 개정일: {currentPolicy.lastUpdated}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-2">{currentPolicy.title}</h2>
              <div className="mt-2 rounded-xl bg-blue-50/70 p-3 text-xs text-blue-900 border border-blue-100 leading-relaxed">
                <strong>요약:</strong> {currentPolicy.summary}
              </div>
            </div>

            {/* Policy-specific content; never reuse the terms text for unrelated policies. */}
            <div className="space-y-5 text-sm text-slate-700 leading-7">
              {(POLICY_SECTIONS[currentPolicy.id] || []).map((section) => (
                <section key={section.heading} className="space-y-2">
                  <h4 className="font-bold text-slate-900">{section.heading}</h4>
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </section>
              ))}
              <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                이 내용은 서비스 화면 검토용 안내문입니다. 정식 약관·개인정보처리방침은 실제 운영 정보와 법률 검토를 거쳐 확정해야 합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-3 bg-slate-50">
          <span className="text-[11px] text-slate-500">
            노무법인 나인 사업자 등록 및 정책 문의: contact@ninelabor.kr
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
};
