'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { 
  Scale, FileText, AlertTriangle, ShieldCheck, 
  HelpCircle, Globe2, ArrowRight, CheckCircle2, 
  FileSearch, Sparkles, BookOpen, Layers
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleQuickSample = async (sampleId: number) => {
    try {
      if (!user) {
        await demoLogin();
      }
      const doc = await api.loadSampleDocument(sampleId);
      router.push(`/studio/${doc.id}`);
    } catch (e) {
      console.error('Failed to load sample', e);
      router.push('/dashboard');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Editorial Masthead / Header Bar */}
      <section className="border-b border-[#D8D0C3] bg-[#EAE1D1]/60 py-2.5 text-center text-xs tracking-widest uppercase font-semibold text-[#B77B50]">
        <span>Volume I • Citizen Legal Intelligence • Multilingual Clarity for Ordinary People</span>
      </section>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 bg-[#FAF6F0] border border-[#B77B50]/40 rounded-full px-4 py-1.5 text-xs text-[#173D32] shadow-xs">
          <Scale className="w-3.5 h-3.5 text-[#B77B50]" />
          <span className="font-medium tracking-wide">
            {language === 'kn' ? 'ನಾಗರಿಕರ ಎಐ ಕಾನೂನು ಸಹಾಯಕ' : language === 'hi' ? 'नागरिकों का एआई कानूनी साथी' : 'AI Legal Intelligence for Citizens'}
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#173D32] tracking-tight leading-[1.12]">
          {language === 'kn' ? (
            <>ಕಾನೂನು ಎಲ್ಲರಿಗೂ ರಚಿತವಾಗಿದೆ.<br/><span className="text-[#B77B50] italic">ಈಗ ನೀವು ಅದನ್ನು ಸುಲಭವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಬಹುದು.</span></>
          ) : language === 'hi' ? (
            <>कानून सभी के लिए बनाया गया था।<br/><span className="text-[#B77B50] italic">अब आप इसे वास्तव में समझ सकते हैं।</span></>
          ) : (
            <>The Law Was Written for Everyone.<br/><span className="text-[#B77B50] italic font-normal">Now You Can Actually Understand It.</span></>
          )}
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#77766E] leading-relaxed">
          {language === 'kn' ? (
            'ಬಾಡಿಗೆ ಒಪ್ಪಂದಗಳು, ಉದ್ಯೋಗ ಪತ್ರಗಳು ಅಥವಾ ವ್ಯಾಪಾರ ಒಪ್ಪಂದಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ. ಕಠಿಣ ಷರತ್ತುಗಳನ್ನು ಸರಳ ಕನ್ನಡಕ್ಕೆ ಭಾಷಾಂತರಿಸಿ, ಅಪಾಯಕಾರಿ ನಿಯಮಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಿ ಮತ್ತು ಎಐ ಸಹಾಯಕರೊಂದಿಗೆ ಚರ್ಚಿಸಿ.'
          ) : language === 'hi' ? (
            'किराया अनुबंध, रोजगार पत्र या व्यावसायिक दस्तावेज अपलोड करें। छिपे हुए जोखिमों की पहचान करें, लापता सुरक्षात्मक खंड खोजें और हिंदी में सीधे एआई से सवाल पूछें।'
          ) : (
            'Upload complex rental agreements, employment bonds, and service contracts. Receive simplified plain-language explanations, pinpoint predatory clauses, audit missing legal protections, and ask questions in English, Kannada, and Hindi.'
          )}
        </p>

        {/* CTA Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/upload"
            className="w-full sm:w-auto px-7 py-3.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded font-medium text-sm transition-all shadow-paper-sm flex items-center justify-center space-x-2 group"
          >
            <span>Analyze Your Document</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#B77B50]" />
          </Link>
          <button
            onClick={() => handleQuickSample(1)}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#B77B50] rounded font-medium text-sm transition-all shadow-paper-sm flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-[#B77B50]" />
            <span>Try Sample Rental Agreement</span>
          </button>
        </div>

        {/* Language Pill Row */}
        <div className="pt-3 flex items-center justify-center space-x-4 text-xs text-[#77766E]">
          <span className="flex items-center space-x-1">
            <Globe2 className="w-3.5 h-3.5 text-[#B77B50]" />
            <span>Supported Dialects:</span>
          </span>
          <button onClick={() => setLanguage('en')} className={`underline hover:text-[#173D32] ${language === 'en' ? 'font-bold text-[#173D32]' : ''}`}>English</button>
          <span>•</span>
          <button onClick={() => setLanguage('kn')} className={`underline hover:text-[#173D32] ${language === 'kn' ? 'font-bold text-[#173D32]' : ''}`}>ಕನ್ನಡ (Kannada)</button>
          <span>•</span>
          <button onClick={() => setLanguage('hi')} className={`underline hover:text-[#173D32] ${language === 'hi' ? 'font-bold text-[#173D32]' : ''}`}>हिन्दी (Hindi)</button>
        </div>
      </section>

      {/* Synthetic Demonstration Quick Picks */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg p-6 sm:p-8 shadow-paper-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#D8D0C3] gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Immediate Demonstration</span>
              <h3 className="font-serif text-2xl font-bold text-[#173D32]">Test Real-World Problematic Documents</h3>
              <p className="text-sm text-[#77766E] mt-1">
                Explore pre-loaded authentic contracts containing harsh clauses, unfair bonds, and missing safeguards.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#173D32] hover:text-[#B77B50] flex items-center space-x-1"
            >
              <span>View All In Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {/* Sample 1: Rental */}
            <div 
              onClick={() => handleQuickSample(1)}
              className="cursor-pointer bg-[#FBF8F3] hover:bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] p-5 rounded transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9E641B] bg-[#FEF7EE] px-2 py-0.5 rounded border border-[#E8CBA1]">
                    Rental & Tenancy
                  </span>
                  <span className="text-xs text-[#992E2E] font-medium flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    High Risk
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 group-hover:text-[#B77B50] transition-colors">
                  Residential Tenancy Agreement (Bengaluru)
                </h4>
                <p className="text-xs text-[#77766E] mt-2 line-clamp-3 leading-relaxed">
                  Contains harsh 11-month lock-in, total deposit forfeiture, unrestricted landlord entry, and 24% late penalty interest.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D8D0C3]/60 flex items-center justify-between text-xs font-medium text-[#173D32]">
                <span>Load in Analysis Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#B77B50]" />
              </div>
            </div>

            {/* Sample 2: Employment */}
            <div 
              onClick={() => handleQuickSample(2)}
              className="cursor-pointer bg-[#FBF8F3] hover:bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] p-5 rounded transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#173D32] bg-[#E2EAE6] px-2 py-0.5 rounded border border-[#B8AE9F]">
                    Employment
                  </span>
                  <span className="text-xs text-[#992E2E] font-medium flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Onerous Bond
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 group-hover:text-[#B77B50] transition-colors">
                  Software Engineer Service Bond & Contract
                </h4>
                <p className="text-xs text-[#77766E] mt-2 line-clamp-3 leading-relaxed">
                  Mandatory 3-year service bond with ₹5 Lakh liquidated penalty, 2-year post-termination non-compete, and 24/7 on-call duty.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D8D0C3]/60 flex items-center justify-between text-xs font-medium text-[#173D32]">
                <span>Load in Analysis Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#B77B50]" />
              </div>
            </div>

            {/* Sample 3: NDA */}
            <div 
              onClick={() => handleQuickSample(3)}
              className="cursor-pointer bg-[#FBF8F3] hover:bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] p-5 rounded transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B77B50] bg-[#EBDCCF] px-2 py-0.5 rounded border border-[#B77B50]/40">
                    Commercial NDA
                  </span>
                  <span className="text-xs text-[#9E641B] font-medium flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Missing Clauses
                  </span>
                </div>
                <h4 className="font-serif text-lg font-bold text-[#173D32] mt-3 group-hover:text-[#B77B50] transition-colors">
                  Mutual Non-Disclosure Agreement
                </h4>
                <p className="text-xs text-[#77766E] mt-2 line-clamp-3 leading-relaxed">
                  Lacks standard public domain exceptions, imposes perpetual indefinite confidentiality, and omits return/destruction protocols.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-[#D8D0C3]/60 flex items-center justify-between text-xs font-medium text-[#173D32]">
                <span>Load in Analysis Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#B77B50]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 3-Stage Editorial Pipeline */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">The Architecture of Clarity</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
            How LEXORA Protects Ordinary Citizens
          </h2>
          <p className="text-sm text-[#77766E] max-w-xl mx-auto">
            A methodical document intelligence pipeline designed to reveal hidden contractual exposures before you sign.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-[#FAF6F0] p-6 rounded border border-[#D8D0C3] space-y-4">
            <div className="w-10 h-10 rounded bg-[#173D32] text-[#F3EBDD] font-serif text-xl font-bold flex items-center justify-center">
              1
            </div>
            <h3 className="font-serif text-xl font-bold text-[#173D32]">Ingest & Extract</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Upload PDF, Word document, or scanned image. Advanced parsing cleans formatting and extracts clause boundaries with page coordinate tracking.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-[#FAF6F0] p-6 rounded border border-[#D8D0C3] space-y-4">
            <div className="w-10 h-10 rounded bg-[#315D49] text-[#F3EBDD] font-serif text-xl font-bold flex items-center justify-center">
              2
            </div>
            <h3 className="font-serif text-xl font-bold text-[#173D32]">Audit & Diagnose</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Deep legal heuristics evaluate severe risks (forfeitures, non-competes, one-sided indemnity) and audit missing statutory safeguards against standard checklists.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#FAF6F0] p-6 rounded border border-[#D8D0C3] space-y-4">
            <div className="w-10 h-10 rounded bg-[#B77B50] text-[#FFFFFF] font-serif text-xl font-bold flex items-center justify-center">
              3
            </div>
            <h3 className="font-serif text-xl font-bold text-[#173D32]">Interactive Studio</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Review findings in an interactive split-screen studio. Click any risk finding to jump directly to the passage, converse in your regional language, and export a formal PDF brief.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Comprehensive Capabilities</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
            Built with Editorial Rigor, Not Generic AI Hype
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded space-y-4">
            <div className="w-10 h-10 rounded bg-[#E2EAE6] flex items-center justify-center text-[#173D32]">
              <FileSearch className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#173D32]">Evidence-Grounded Risk Detection</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              LEXORA never outputs arbitrary or hallucinated risk scores. Every finding links explicitly to the exact page number, quotes the clause verbatim, explains the legal rationale in plain language, and suggests specific questions to ask an advocate.
            </p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded space-y-4">
            <div className="w-10 h-10 rounded bg-[#EBDCCF] flex items-center justify-center text-[#B77B50]">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#173D32]">Missing-Clause Checklist Audit</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Contracts are dangerous not just for what they say, but for what they omit. LEXORA compares your document against category-specific standards (e.g. 24-hour inspection notice, security deposit refund deadlines, IP carve-outs, PoSH policies).
            </p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded space-y-4">
            <div className="w-10 h-10 rounded bg-[#E2EAE6] flex items-center justify-center text-[#173D32]">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#173D32]">Multilingual Native Equality</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Legal rights shouldn't depend on English fluency. LEXORA renders simplified summaries, key obligations, and interactive conversational Q&A natively in English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).
            </p>
          </div>

          <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded space-y-4">
            <div className="w-10 h-10 rounded bg-[#EBDCCF] flex items-center justify-center text-[#B77B50]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#173D32]">Downloadable Executive Legal Briefs</h3>
            <p className="text-sm text-[#77766E] leading-relaxed">
              Generate a polished, editorial PDF analysis brief with clean typography, tables of obligations, risk breakdown matrices, and suggested negotiation questions ready for your attorney or counterparty.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="bg-[#EAE1D1]/70 border border-[#D8D0C3] rounded-lg p-8 space-y-4">
          <ShieldCheck className="w-10 h-10 text-[#173D32] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#173D32]">Citizen Privacy & Ethical Safeguards</h3>
          <p className="text-sm text-[#77766E] max-w-xl mx-auto leading-relaxed">
            Legal documents often contain highly sensitive personal and financial information. LEXORA enforces strict user-level data isolation, allows instant document deletion, and does not sell or distribute citizen documents to third parties.
          </p>
          <div className="pt-2">
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 text-sm font-semibold text-[#173D32] hover:text-[#B77B50]"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
