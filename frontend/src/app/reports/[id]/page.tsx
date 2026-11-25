'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { DocumentItem, AnalysisResult } from '@/lib/types';
import { 
  Download, Printer, ArrowLeft, Scale, 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';

export default function ReportPage() {
  const params = useParams();
  const documentId = Number(params.id);

  const { user, loading: authLoading, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error('Failed to load report', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId, user, authLoading]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Scale className="w-10 h-10 text-[#B77B50] animate-pulse" />
        <h3 className="font-serif text-xl font-bold text-[#173D32]">Assembling Executive Legal Brief...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Action Header (Hidden during Print) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[#D8D0C3] gap-4">
        <Link
          href={`/studio/${documentId}`}
          className="text-xs text-[#77766E] hover:text-[#173D32] flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Analysis Studio</span>
        </Link>

        <div className="flex items-center space-x-3">
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
            onClick={handlePrint}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#D8D0C3] rounded text-xs font-semibold flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print View</span>
          </button>

          <a
            href={api.getReportDownloadUrl(documentId)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-semibold flex items-center space-x-1.5 shadow-paper-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#B77B50]" />
            <span>Download PDF Report</span>
          </a>
        </div>
      </div>

      {/* Formal Printable Document Brief Container */}
      <div className="bg-[#FFFFFF] border border-[#D8D0C3] p-8 sm:p-12 rounded-lg shadow-paper-sm space-y-8 font-sans">
        {/* Masthead */}
        <div className="border-b-2 border-[#173D32] pb-6 flex justify-between items-start">
          <div>
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#B77B50] block">
              LEXORA CITIZEN LEGAL INTELLIGENCE BRIEF
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32] mt-1">
              Executive Contract Analysis: {document?.title}
            </h1>
            <p className="text-xs text-[#77766E] mt-1">
              Category: <strong>{document?.category}</strong> • Date Generated: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block text-xs uppercase font-bold tracking-wider px-3 py-1 rounded ${
              analysis?.overall_risk_level === 'High'
                ? 'bg-[#FDF1F1] text-[#992E2E] border border-[#E8B2B2]'
                : analysis?.overall_risk_level === 'Elevated'
                ? 'bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1]'
                : 'bg-[#EEF7F2] text-[#1E5E45] border border-[#A3D4BE]'
            }`}>
              Risk: {analysis?.overall_risk_level}
            </span>
          </div>
        </div>

        {/* 1. Executive Plain-Language Summary */}
        <section className="space-y-3">
          <h2 className="font-serif text-lg font-bold text-[#173D32] border-b border-[#D8D0C3] pb-1">
            1. Executive Plain-Language Summary
          </h2>
          <p className="font-serif text-sm text-[#252B29] leading-relaxed">
            {language === 'kn'
              ? (analysis?.summary_kn || analysis?.summary_en)
              : language === 'hi'
              ? (analysis?.summary_hi || analysis?.summary_en)
              : analysis?.summary_en}
          </p>
        </section>

        {/* 2. Critical Obligations & Deadlines */}
        {analysis?.key_obligations && analysis.key_obligations.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#173D32] border-b border-[#D8D0C3] pb-1">
              2. Critical Obligations & Deadlines
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#D8D0C3]">
                <thead className="bg-[#173D32] text-[#FFFFFF]">
                  <tr>
                    <th className="p-2.5 font-semibold">Party</th>
                    <th className="p-2.5 font-semibold">Core Obligation</th>
                    <th className="p-2.5 font-semibold">Deadline</th>
                    <th className="p-2.5 font-semibold">Consequence of Default</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8D0C3]">
                  {analysis.key_obligations.map((ob, i) => (
                    <tr key={i} className="hover:bg-[#FAF6F0]">
                      <td className="p-2.5 font-bold text-[#173D32] align-top">{ob.party}</td>
                      <td className="p-2.5 text-[#252B29] align-top">{ob.obligation}</td>
                      <td className="p-2.5 text-[#77766E] align-top">{ob.deadline || 'N/A'}</td>
                      <td className="p-2.5 text-[#992E2E] align-top">{ob.consequence || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 3. Potential Risk Findings */}
        {analysis?.risks && analysis.risks.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#173D32] border-b border-[#D8D0C3] pb-1">
              3. Potential Contractual Risks & Legal Evidence
            </h2>
            <div className="space-y-4">
              {analysis.risks.map((risk) => (
                <div key={risk.id} className="p-4 bg-[#FAF6F0] border border-[#E8B2B2] rounded space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#992E2E] uppercase">
                      [{risk.severity} Severity] {risk.category}
                    </span>
                    <span className="text-[#77766E] font-mono">{risk.clause_reference}</span>
                  </div>
                  <p className="text-xs text-[#252B29]">
                    <strong>Citizen Impact: </strong>
                    {language === 'kn' ? (risk.explanation_kn || risk.explanation_en) : language === 'hi' ? (risk.explanation_hi || risk.explanation_en) : risk.explanation_en}
                  </p>
                  <p className="text-[11px] text-[#77766E]">
                    <em>Legal Rationale:</em> {risk.legal_rationale}
                  </p>
                  {risk.questions_to_ask && (
                    <div className="text-[11px] text-[#173D32] pt-1">
                      <strong>Questions to Ask:</strong> {risk.questions_to_ask.join(' | ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 4. Missing Clauses */}
        {analysis?.missing_clauses && analysis.missing_clauses.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-serif text-lg font-bold text-[#173D32] border-b border-[#D8D0C3] pb-1">
              4. Missing or Incomplete Statutory Safeguards
            </h2>
            <div className="space-y-3">
              {analysis.missing_clauses.map((mc) => (
                <div key={mc.id} className="p-3 bg-[#FAF6F0] border border-[#D8D0C3] rounded text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#173D32]">{mc.clause_name}</span>
                    <span className="text-[10px] text-[#B77B50] uppercase font-semibold">
                      {mc.clause_type} • [{mc.importance_level}]
                    </span>
                  </div>
                  <p className="text-[#252B29]">
                    {language === 'kn' ? (mc.why_it_matters_kn || mc.why_it_matters_en) : language === 'hi' ? (mc.why_it_matters_hi || mc.why_it_matters_en) : mc.why_it_matters_en}
                  </p>
                  {mc.recommended_standard_language && (
                    <p className="font-serif text-[11px] text-[#77766E] italic bg-[#FFFFFF] p-2 rounded border border-[#D8D0C3]">
                      "{mc.recommended_standard_language}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Legal Disclaimer Footer */}
        <div className="pt-6 border-t border-[#D8D0C3] text-[10px] text-[#77766E] leading-relaxed">
          <strong className="text-[#173D32]">LEGAL SAFETY NOTICE & DISCLAIMER: </strong>
          This document intelligence brief is generated by LEXORA as an educational legal information assistant. 
          It does not establish that a document is legally valid or invalid, nor does it substitute for qualified legal advice. 
          Always consult an authorized attorney before signing binding legal instruments.
        </div>
      </div>
    </div>
  );
}
