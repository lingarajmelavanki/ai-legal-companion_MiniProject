'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { DocumentItem, AnalysisResult, ChatMessage, Language } from '@/lib/types';
import { 
  Scale, FileText, AlertTriangle, ShieldCheck, 
  HelpCircle, Globe, Download, Send, RefreshCw, 
  ArrowRight, Search, CheckCircle2, ChevronRight, 
  AlertCircle, BookOpen, Layers, MessageSquare, ExternalLink
} from 'lucide-react';

export default function AnalysisStudioPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = Number(params.id);

  const { user, loading: authLoading, demoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'obligations' | 'risks' | 'missing' | 'unclear' | 'chat'>('summary');
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);
  const [docSearch, setDocSearch] = useState('');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Load document and existing analysis
  const loadData = async () => {
    try {
      setLoading(true);
      const doc = await api.getDocument(documentId);
      setDocument(doc);

      // Check if analysis exists, else trigger it
      try {
        const existingAnalysis = await api.getAnalysis(documentId);
        setAnalysis(existingAnalysis);
      } catch {
        // Auto-trigger analysis if not yet run
        await triggerAnalysis();
      }

      // Load chat history
      try {
        const history = await api.getChatHistory(documentId);
        setChatMessages(history.messages);
      } catch (e) {
        // chat history empty
      }
    } catch (e) {
      console.error('Failed to load document data', e);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setAnalyzing(true);
    try {
      const result = await api.analyzeDocument(documentId);
      setAnalysis(result);
    } catch (e) {
      console.error('Analysis failed', e);
    } finally {
      setAnalyzing(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      demoLogin().then(() => loadData());
    } else if (user) {
      loadData();
    }
  }, [documentId, user, authLoading]);

  // Navigate directly from finding to clause on left pane
  const scrollToClause = (chunkIndexOrPage: number) => {
    setActiveHighlightId(chunkIndexOrPage);
    const element = document?.chunks?.[chunkIndexOrPage] 
      ? window.document.getElementById(`chunk-${chunkIndexOrPage}`)
      : window.document.getElementById(`chunk-0`);

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim() || sendingChat) return;

    const query = inputQuery.trim();
    setInputQuery('');
    setSendingChat(true);

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      language: language,
      content: query,
      citations: [],
      created_at: new Date().toISOString()
    };
    setChatMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.sendChatMessage(documentId, query, language);
      setChatMessages(prev => [...prev, res]);
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (e) {
      alert('Failed to get answer from AI Assistant');
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <Scale className="w-10 h-10 text-[#B77B50] animate-pulse" />
        <h3 className="font-serif text-xl font-bold text-[#173D32]">Opening AI Document Studio...</h3>
        <p className="text-xs text-[#77766E]">Extracting coordinates, clauses, and legal findings</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4">
        <h3 className="font-serif text-2xl font-bold text-[#173D32]">Document Not Found</h3>
        <Link href="/dashboard" className="text-xs text-[#B77B50] underline font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Top Editorial Breadcrumb & Action Header */}
      <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-paper-sm">
        <div>
          <div className="flex items-center space-x-2 text-xs">
            <Link href="/dashboard" className="text-[#77766E] hover:text-[#173D32]">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-[#D8D0C3]" />
            <span className="font-bold text-[#173D32]">{document.category}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#173D32] mt-1">
            {document.title}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {analysis && (
            <span className={`text-xs uppercase font-bold tracking-wider px-3 py-1 rounded ${
              analysis.overall_risk_level === 'High'
                ? 'bg-[#FDF1F1] text-[#992E2E] border border-[#E8B2B2]'
                : analysis.overall_risk_level === 'Elevated'
                ? 'bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1]'
                : 'bg-[#EEF7F2] text-[#1E5E45] border border-[#A3D4BE]'
            }`}>
              Risk Profile: {analysis.overall_risk_level}
            </span>
          )}

          <button
            onClick={triggerAnalysis}
            disabled={analyzing}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#D8D0C3] rounded text-xs font-medium flex items-center space-x-1"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Auditing...' : 'Re-Analyze'}</span>
          </button>

          <button
            type="button"
            onClick={() => api.downloadReport(document.id).catch(() => alert('Failed to download PDF report'))}
            className="px-3 py-1.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-semibold flex items-center space-x-1 shadow-paper-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#B77B50]" />
            <span>Download PDF Brief</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (5 cols): Original Document Clause Preview */}
        <div className="lg:col-span-5 bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg shadow-paper-sm overflow-hidden flex flex-col h-[calc(100vh-210px)] min-h-[600px]">
          <div className="p-3 border-b border-[#D8D0C3] bg-[#FBF8F3] flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-[#173D32]" />
              <span className="font-serif text-sm font-bold text-[#173D32]">Original Contract Passage</span>
            </div>
            <span className="text-[11px] text-[#77766E] font-mono">
              {document.chunks?.length || 0} Clauses Extracted
            </span>
          </div>

          {/* Search inside Document */}
          <div className="p-2 border-b border-[#D8D0C3] bg-[#FAF6F0]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#77766E] absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search raw contract text..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-xs text-[#252B29] focus:outline-none focus:border-[#173D32]"
              />
            </div>
          </div>

          {/* Scrollable Clause Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-serif text-sm text-[#252B29] leading-relaxed">
            {document.chunks && document.chunks.length > 0 ? (
              document.chunks
                .filter(chunk => !docSearch || chunk.content.toLowerCase().includes(docSearch.toLowerCase()))
                .map((chunk, idx) => (
                  <div
                    key={chunk.id}
                    id={`chunk-${idx}`}
                    className={`p-3.5 rounded border transition-all ${
                      activeHighlightId === idx
                        ? 'border-[#B77B50] bg-[#FFFBF5] ring-2 ring-[#B77B50]/30 shadow-sm'
                        : 'border-[#D8D0C3]/80 bg-[#FFFFFF] hover:border-[#B77B50]/60'
                    }`}
                  >
                    <div className="flex justify-between items-center pb-1.5 mb-2 border-b border-[#D8D0C3]/50">
                      <span className="font-sans font-semibold text-xs text-[#173D32]">
                        {chunk.clause_heading || `Clause ${idx + 1}`}
                      </span>
                      <span className="text-[10px] font-sans text-[#77766E] bg-[#FAF6F0] px-1.5 py-0.5 rounded border border-[#D8D0C3]">
                        Page {chunk.page_number}
                      </span>
                    </div>
                    <p className="whitespace-pre-line text-xs font-sans text-[#252B29] leading-relaxed">
                      {chunk.content}
                    </p>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center text-xs text-[#77766E]">
                No clause text available for preview.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): AI Studio Insights, Obligations, Risks, Missing Clauses, Chat */}
        <div className="lg:col-span-7 bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg shadow-paper-sm overflow-hidden flex flex-col h-[calc(100vh-210px)] min-h-[600px]">
          {/* Navigation Tabs Header */}
          <div className="border-b border-[#D8D0C3] bg-[#FBF8F3] px-3 pt-2 flex items-center justify-between overflow-x-auto">
            <div className="flex space-x-1 text-xs">
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'border-[#173D32] text-[#173D32] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#173D32]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('obligations')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'obligations'
                    ? 'border-[#173D32] text-[#173D32] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#173D32]'
                }`}
              >
                Obligations ({analysis?.key_obligations?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('risks')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center space-x-1 ${
                  activeTab === 'risks'
                    ? 'border-[#992E2E] text-[#992E2E] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#992E2E]'
                }`}
              >
                <span>Risks</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FDF1F1] text-[#992E2E] font-bold">
                  {analysis?.risks?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('missing')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center space-x-1 ${
                  activeTab === 'missing'
                    ? 'border-[#B77B50] text-[#B77B50] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#B77B50]'
                }`}
              >
                <span>Missing</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#FAF6F0] text-[#B77B50] font-bold">
                  {analysis?.missing_clauses?.length || 0}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('unclear')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'unclear'
                    ? 'border-[#173D32] text-[#173D32] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#173D32]'
                }`}
              >
                Confusing Legalese
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-2 border-b-2 font-medium transition-colors flex items-center space-x-1 ${
                  activeTab === 'chat'
                    ? 'border-[#173D32] text-[#173D32] font-semibold'
                    : 'border-transparent text-[#77766E] hover:text-[#173D32]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Guidance</span>
              </button>
            </div>

            {/* Language Switcher Pill inside Studio */}
            <div className="hidden sm:flex items-center space-x-1 text-[11px] bg-[#EAE1D1] px-1 py-0.5 rounded border border-[#D8D0C3]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-1.5 py-0.5 rounded ${language === 'kn' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-1.5 py-0.5 rounded ${language === 'hi' ? 'bg-[#173D32] text-[#FFFFFF]' : 'text-[#77766E]'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* 1. OVERVIEW & PLAIN-LANGUAGE SUMMARY */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] border border-[#D8D0C3] p-5 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-semibold text-[#B77B50] tracking-wider">
                      Plain-Language Explanation
                    </span>
                    <span className="text-[11px] text-[#77766E]">
                      Language: {language === 'kn' ? 'ಕನ್ನಡ (Kannada)' : language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                    </span>
                  </div>
                  <p className="text-sm text-[#252B29] leading-relaxed font-serif">
                    {language === 'kn'
                      ? (analysis?.summary_kn || analysis?.summary_en)
                      : language === 'hi'
                      ? (analysis?.summary_hi || analysis?.summary_en)
                      : analysis?.summary_en}
                  </p>
                </div>

                {/* Suggested Questions */}
                {analysis?.suggested_questions && analysis.suggested_questions.length > 0 && (
                  <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-4 rounded-lg space-y-3">
                    <h4 className="font-serif text-sm font-bold text-[#173D32] flex items-center space-x-1.5">
                      <HelpCircle className="w-4 h-4 text-[#B77B50]" />
                      <span>Suggested Questions for Citizen Review</span>
                    </h4>
                    <div className="space-y-2">
                      {analysis.suggested_questions.map((q, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveTab('chat');
                            setInputQuery(q);
                          }}
                          className="cursor-pointer text-xs bg-[#FFFFFF] hover:bg-[#FBF8F3] border border-[#D8D0C3] p-2.5 rounded text-[#252B29] flex items-center justify-between group transition-colors"
                        >
                          <span>{q}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#B77B50] group-hover:translate-x-1 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. OBLIGATIONS & RIGHTS */}
            {activeTab === 'obligations' && (
              <div className="space-y-6">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#173D32] mb-3">
                    Contractual Obligations & Deadlines
                  </h4>
                  <div className="space-y-3">
                    {analysis?.key_obligations?.map((ob, idx) => (
                      <div key={idx} className="bg-[#FFFFFF] border border-[#D8D0C3] p-3.5 rounded text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[#173D32] uppercase tracking-wider">{ob.party}</span>
                          {ob.deadline && (
                            <span className="px-2 py-0.5 rounded bg-[#FAF6F0] text-[#77766E] border border-[#D8D0C3]">
                              {ob.deadline}
                            </span>
                          )}
                        </div>
                        <p className="text-[#252B29] font-medium">{ob.obligation}</p>
                        {ob.consequence && (
                          <p className="text-[11px] text-[#992E2E]">
                            <strong>Consequence of Default:</strong> {ob.consequence}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {analysis?.party_rights && analysis.party_rights.length > 0 && (
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#173D32] mb-3">
                      Explicit Party Rights
                    </h4>
                    <div className="space-y-3">
                      {analysis.party_rights.map((r, idx) => (
                        <div key={idx} className="bg-[#FFFFFF] border border-[#D8D0C3] p-3.5 rounded text-xs space-y-1">
                          <span className="font-bold text-[#315D49] uppercase tracking-wider">{r.party}</span>
                          <p className="text-[#252B29]">{r.right}</p>
                          {r.condition && (
                            <p className="text-[11px] text-[#77766E]">
                              <em>Condition:</em> {r.condition}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. RISKS WITH DIRECT CLAUSE NAVIGATION */}
            {activeTab === 'risks' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#D8D0C3]">
                  <span className="text-xs text-[#77766E]">
                    Identified {analysis?.risks?.length || 0} contractual risks requiring citizen review
                  </span>
                  <Link
                    href={`/risks/${document.id}`}
                    className="text-xs font-semibold text-[#992E2E] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Full Risk Center</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {analysis?.risks?.map((risk) => (
                  <div
                    key={risk.id}
                    className="bg-[#FFFFFF] border border-[#E8B2B2] p-4 rounded-lg space-y-3 shadow-xs hover:border-[#992E2E] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
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

                      {/* Direct jump to clause button */}
                      <button
                        onClick={() => scrollToClause(risk.page_number - 1)}
                        className="text-[11px] font-semibold text-[#B77B50] hover:text-[#173D32] underline flex items-center space-x-1"
                      >
                        <span>View Passage</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <h4 className="font-serif text-sm font-bold text-[#173D32]">
                      {risk.clause_reference}
                    </h4>

                    {/* Multilingual Explanation */}
                    <p className="text-xs text-[#252B29] leading-relaxed">
                      {language === 'kn'
                        ? (risk.explanation_kn || risk.explanation_en)
                        : language === 'hi'
                        ? (risk.explanation_hi || risk.explanation_en)
                        : risk.explanation_en}
                    </p>

                    <div className="bg-[#FAF6F0] p-2.5 rounded border border-[#D8D0C3] text-[11px] space-y-1">
                      <strong className="text-[#173D32]">Legal Rationale: </strong>
                      <span className="text-[#77766E]">{risk.legal_rationale}</span>
                    </div>

                    {risk.questions_to_ask && risk.questions_to_ask.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[11px] font-semibold text-[#173D32] block mb-1">
                          Questions to ask a lawyer or landlord/employer:
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-[#77766E] space-y-0.5">
                          {risk.questions_to_ask.map((q, i) => (
                            <li key={i}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 4. MISSING CLAUSES */}
            {activeTab === 'missing' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-[#D8D0C3]">
                  <span className="text-xs text-[#77766E]">
                    Audited against standard protective checklists for {document.category}
                  </span>
                  <Link
                    href={`/missing-clauses/${document.id}`}
                    className="text-xs font-semibold text-[#B77B50] hover:underline flex items-center space-x-1"
                  >
                    <span>Open Checklist View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                {analysis?.missing_clauses?.map((mc) => (
                  <div
                    key={mc.id}
                    className="bg-[#FFFFFF] border border-[#D8D0C3] p-4 rounded-lg space-y-2.5"
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="font-serif text-sm font-bold text-[#173D32]">
                        {mc.clause_name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1]">
                        {mc.status}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-[#77766E]">
                      <span><strong>Type:</strong> {mc.clause_type}</span>
                      <span>•</span>
                      <span><strong>Importance:</strong> {mc.importance_level}</span>
                    </div>

                    <p className="text-xs text-[#252B29] leading-relaxed">
                      {language === 'kn'
                        ? (mc.why_it_matters_kn || mc.why_it_matters_en)
                        : language === 'hi'
                        ? (mc.why_it_matters_hi || mc.why_it_matters_en)
                        : mc.why_it_matters_en}
                    </p>

                    {mc.recommended_standard_language && (
                      <div className="bg-[#FAF6F0] p-3 rounded border border-[#D8D0C3] text-[11px] space-y-1">
                        <strong className="text-[#173D32]">Recommended Protective Language to Insert:</strong>
                        <p className="font-serif italic text-[#252B29]">"{mc.recommended_standard_language}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 5. UNCLEAR LANGUAGE */}
            {activeTab === 'unclear' && (
              <div className="space-y-4">
                <span className="text-xs text-[#77766E] block pb-2 border-b border-[#D8D0C3]">
                  Detected ambiguous or one-sided legal terminology in this agreement
                </span>

                {analysis?.unclear_terms && analysis.unclear_terms.length > 0 ? (
                  analysis.unclear_terms.map((item, idx) => (
                    <div key={idx} className="bg-[#FFFFFF] border border-[#D8D0C3] p-4 rounded-lg space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-[#992E2E] bg-[#FDF1F1] px-2 py-0.5 rounded border border-[#E8B2B2]">
                          "{item.term}"
                        </span>
                      </div>
                      <p className="text-xs italic text-[#77766E] bg-[#FAF6F0] p-2 rounded border border-[#D8D0C3]/60">
                        Context: "...{item.context}..."
                      </p>
                      <p className="text-xs text-[#252B29]">
                        <strong>Why it's risky: </strong>{item.why_unclear}
                      </p>
                      <p className="text-xs text-[#315D49]">
                        <strong>Suggested Fix: </strong>{item.suggested_clarification}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-[#77766E]">
                    No severe ambiguous phrases detected.
                  </div>
                )}
              </div>
            )}

            {/* 6. INTERACTIVE MULTILINGUAL GROUNDED CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full space-y-3">
                <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px]">
                  {chatMessages.length === 0 ? (
                    <div className="p-8 text-center space-y-2 text-[#77766E]">
                      <MessageSquare className="w-8 h-8 text-[#B77B50] mx-auto opacity-70" />
                      <h4 className="font-serif text-base font-bold text-[#173D32]">Ask LEXORA About This Document</h4>
                      <p className="text-xs max-w-sm mx-auto">
                        Ask any question in English, Kannada, or Hindi. Every answer is strictly grounded in this document with clause citations.
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => (
                      <div
                        key={msg.id || i}
                        className={`p-3.5 rounded-lg text-xs space-y-2 ${
                          msg.role === 'user'
                            ? 'bg-[#173D32] text-[#FFFFFF] ml-8'
                            : 'bg-[#FFFFFF] border border-[#D8D0C3] text-[#252B29] mr-4 shadow-xs'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-75">
                          <span className="font-semibold uppercase tracking-wider">
                            {msg.role === 'user' ? 'You' : 'LEXORA Companion'}
                          </span>
                          <span>{msg.language.toUpperCase()}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</p>

                        {/* Citations */}
                        {msg.citations && msg.citations.length > 0 && (
                          <div className="pt-2 border-t border-[#D8D0C3]/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-[#B77B50] block">
                              Supporting Document Citations:
                            </span>
                            <div className="space-y-1">
                              {msg.citations.map((c, idx) => (
                                <div
                                  key={idx}
                                  onClick={() => scrollToClause(c.page_number - 1)}
                                  className="cursor-pointer bg-[#FAF6F0] hover:bg-[#FBF8F3] p-1.5 rounded border border-[#D8D0C3] flex items-center justify-between text-[10px] text-[#173D32]"
                                >
                                  <span>
                                    <strong>Page {c.page_number}:</strong> {c.clause_heading}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-[#B77B50]" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendChat} className="flex gap-2 pt-2 border-t border-[#D8D0C3]">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder={
                      language === 'kn'
                        ? 'ದಾಖಲೆಯ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಕೇಳಿ...'
                        : language === 'hi'
                        ? 'दस्तावेज़ के बारे में प्रश्न पूछें...'
                        : 'Ask a question about this contract...'
                    }
                    className="flex-1 px-3 py-2 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-xs text-[#252B29] focus:outline-none focus:border-[#173D32]"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || sendingChat}
                    className="px-4 py-2 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-semibold disabled:opacity-50 transition-colors flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5 text-[#B77B50]" />
                    <span>{sendingChat ? 'Thinking...' : 'Ask'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
