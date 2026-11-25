'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { DocumentItem, AnalysisResult, RiskFinding } from '@/lib/types';
import { 
  AlertTriangle, ShieldAlert, ArrowLeft, ArrowRight, 
  ExternalLink, Download, CheckCircle2, Filter
} from 'lucide-react';

export default function RiskCenterPage() {
  const params = useParams();
  const documentId = Number(params.id);

  const { user, loading: authLoading, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!user && !authLoading) {
          await demoLogin();
        }
        const doc = await api.getDocument(documentId);
        setDocument(doc);
        const res = await api.getAnalysis(documentId);
        setAnalysis(res);
      } catch (e) {
        console.error('Failed to load risk center', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId, user, authLoading]);

  const filteredRisks = analysis?.risks?.filter(r => {
    return severityFilter === 'All' || r.severity === severityFilter;
  }) || [];

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-[#992E2E] animate-pulse" />
        <h3 className="font-serif text-xl font-bold text-[#173D32]">Auditing Contractual Risks...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb & Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#D8D0C3] gap-4">
        <div>
          <Link
            href={`/studio/${documentId}`}
            className="text-xs text-[#77766E] hover:text-[#173D32] flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Split-Screen Studio</span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#992E2E] font-semibold">Evidence-Grounded Center</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
            Risk Detection Center
          </h1>
          <p className="text-sm text-[#77766E] mt-1">
            Comprehensive audit of potential contractual liabilities, penalty traps, and unfair restraints for: <strong>{document?.title}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Language Switcher */}
          <div className="flex items-center space-x-1 text-xs bg-[#EAE1D1] px-1 py-0.5 rounded border border-[#D8D0C3]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded ${language === 'en' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('kn')}
              className={`px-2 py-1 rounded ${language === 'kn' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
            >
              ಕನ್ನಡ
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded ${language === 'hi' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
            >
              हिन्दी
            </button>
          </div>

          <button
            type="button"
            onClick={() => api.downloadReport(documentId).catch(() => alert('Failed to download PDF report'))}
            className="px-3 py-1.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-semibold flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5 text-[#B77B50]" />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-[#77766E] font-semibold flex items-center mr-2">
          <Filter className="w-3.5 h-3.5 mr-1" />
          Filter Severity:
        </span>
        {['All', 'High', 'Medium', 'Low'].map(sev => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded transition-colors ${
              severityFilter === sev
                ? 'bg-[#173D32] text-[#FFFFFF] font-bold'
                : 'bg-[#FAF6F0] text-[#77766E] border border-[#D8D0C3] hover:text-[#173D32]'
            }`}
          >
            {sev} ({sev === 'All' ? analysis?.risks?.length || 0 : analysis?.risks?.filter(r => r.severity === sev).length || 0})
          </button>
        ))}
      </div>

      {/* Risk Finding Cards */}
      <div className="space-y-6">
        {filteredRisks.length === 0 ? (
          <div className="p-12 text-center bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg">
            <CheckCircle2 className="w-10 h-10 text-[#1E5E45] mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-[#173D32]">No Matching Risks in this Category</h3>
            <p className="text-xs text-[#77766E]">This contract does not exhibit flags matching the selected severity filter.</p>
          </div>
        ) : (
          filteredRisks.map((risk) => (
            <div
              key={risk.id}
              className="bg-[#FAF6F0] border border-[#E8B2B2] p-6 rounded-lg shadow-paper-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#D8D0C3] gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                    risk.severity === 'High'
                      ? 'bg-[#FDF1F1] text-[#992E2E] border border-[#E8B2B2]'
                      : risk.severity === 'Medium'
                      ? 'bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1]'
                      : 'bg-[#EEF7F2] text-[#1E5E45] border border-[#A3D4BE]'
                  }`}>
                    {risk.severity} Severity
                  </span>
                  <span className="text-xs font-semibold text-[#173D32]">{risk.category}</span>
                </div>
                <span className="text-xs text-[#77766E] font-mono bg-[#FFFFFF] px-2 py-0.5 rounded border border-[#D8D0C3]">
                  {risk.clause_reference}
                </span>
              </div>

              {/* Verbatim Excerpt */}
              <div className="bg-[#FFFFFF] p-3.5 rounded border border-[#D8D0C3]">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#77766E] block mb-1">
                  Original Document Clause Excerpt:
                </span>
                <p className="font-serif text-xs text-[#252B29] leading-relaxed italic">
                  "{risk.original_text}"
                </p>
              </div>

              {/* Plain-Language Citizen Explanation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#173D32] uppercase tracking-wider">
                  Citizen Impact & Plain-Language Explanation:
                </span>
                <p className="text-sm text-[#252B29] leading-relaxed">
                  {language === 'kn'
                    ? (risk.explanation_kn || risk.explanation_en)
                    : language === 'hi'
                    ? (risk.explanation_hi || risk.explanation_en)
                    : risk.explanation_en}
                </p>
              </div>

              {/* Legal Rationale */}
              <div className="bg-[#EAE1D1]/60 p-3.5 rounded border border-[#D8D0C3] text-xs text-[#252B29] space-y-1">
                <strong className="text-[#173D32]">Reason for Identifying This Risk: </strong>
                <p className="text-[#77766E]">{risk.legal_rationale}</p>
              </div>

              {/* Questions for Professional Legal Review */}
              {risk.questions_to_ask && risk.questions_to_ask.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-[#173D32] uppercase tracking-wider block mb-2">
                    Suggested Questions for Lawyer or Counterparty:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {risk.questions_to_ask.map((q, i) => (
                      <div key={i} className="bg-[#FFFFFF] p-2.5 rounded border border-[#D8D0C3] text-xs text-[#252B29]">
                        • {q}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
