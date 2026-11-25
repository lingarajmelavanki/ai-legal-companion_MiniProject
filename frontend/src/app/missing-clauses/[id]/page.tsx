'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { DocumentItem, AnalysisResult, MissingClauseFinding } from '@/lib/types';
import { 
  CheckCircle2, AlertCircle, ArrowLeft, Download, 
  Layers, Copy, Check, ExternalLink, ShieldCheck
} from 'lucide-react';

export default function MissingClausesPage() {
  const params = useParams();
  const documentId = Number(params.id);

  const { user, loading: authLoading, demoLogin } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

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
        console.error('Failed to load missing clauses', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [documentId, user, authLoading]);

  const copyLanguage = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Layers className="w-10 h-10 text-[#B77B50] animate-pulse" />
        <h3 className="font-serif text-xl font-bold text-[#173D32]">Auditing Missing Protective Clauses...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#D8D0C3] gap-4">
        <div>
          <Link
            href={`/studio/${documentId}`}
            className="text-xs text-[#77766E] hover:text-[#173D32] flex items-center space-x-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Split-Screen Studio</span>
          </Link>
          <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Contractual Gap Analysis</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
            Missing-Clause Diagnostic
          </h1>
          <p className="text-sm text-[#77766E] mt-1">
            Checklist comparison for: <strong>{document?.title}</strong> ({document?.category})
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

      {/* Info Banner */}
      <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-5 rounded-lg flex items-start space-x-3 text-xs text-[#77766E] leading-relaxed">
        <ShieldCheck className="w-5 h-5 text-[#173D32] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#173D32] font-semibold">Why Missing Clauses Matter: </strong>
          Standard contracts provided by companies or landlords are often intentionally drafted with omissions. 
          When a dispute occurs, the absence of clear notice rules, deposit refund timelines, or maintenance divisions 
          deprives the citizen of written legal protection. Review the recommended clauses below and request their insertion before signing.
        </div>
      </div>

      {/* Missing Clause Cards */}
      <div className="space-y-6">
        {analysis?.missing_clauses && analysis.missing_clauses.length > 0 ? (
          analysis.missing_clauses.map((mc) => (
            <div
              key={mc.id}
              className="bg-[#FAF6F0] border border-[#D8D0C3] p-6 rounded-lg shadow-paper-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#D8D0C3] gap-2">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1] mr-2">
                    {mc.status} from document
                  </span>
                  <span className="text-xs font-bold text-[#173D32]">{mc.clause_type}</span>
                  <h3 className="font-serif text-lg font-bold text-[#173D32] mt-1">
                    {mc.clause_name}
                  </h3>
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                  mc.importance_level === 'Critical'
                    ? 'bg-[#FDF1F1] text-[#992E2E] border border-[#E8B2B2]'
                    : 'bg-[#FAF6F0] text-[#B77B50] border border-[#B77B50]/40'
                }`}>
                  {mc.importance_level} Importance
                </span>
              </div>

              {/* Multilingual Explanation */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#173D32] uppercase tracking-wider">
                  Why You Need This Protection:
                </span>
                <p className="text-sm text-[#252B29] leading-relaxed">
                  {language === 'kn'
                    ? (mc.why_it_matters_kn || mc.why_it_matters_en)
                    : language === 'hi'
                    ? (mc.why_it_matters_hi || mc.why_it_matters_en)
                    : mc.why_it_matters_en}
                </p>
              </div>

              {/* Recommended Boilerplate Language to Insert */}
              {mc.recommended_standard_language && (
                <div className="bg-[#FFFFFF] p-4 rounded border border-[#D8D0C3] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#173D32] uppercase tracking-wider">
                      Recommended Standard Clause to Insert:
                    </span>
                    <button
                      onClick={() => copyLanguage(mc.recommended_standard_language!, mc.id)}
                      className="text-xs text-[#B77B50] hover:text-[#173D32] font-semibold flex items-center space-x-1"
                    >
                      {copiedId === mc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#1E5E45]" />
                          <span className="text-[#1E5E45]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Clause</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-serif text-xs text-[#252B29] italic leading-relaxed bg-[#FAF6F0] p-3 rounded border border-[#D8D0C3]/60">
                    "{mc.recommended_standard_language}"
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg">
            <CheckCircle2 className="w-10 h-10 text-[#1E5E45] mx-auto mb-2" />
            <h3 className="font-serif text-lg font-bold text-[#173D32]">Checklist Complete</h3>
            <p className="text-xs text-[#77766E]">This contract satisfies all major baseline statutory protective clauses for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
