import React from 'react';
import Link from 'next/link';
import { Scale, ShieldCheck, HeartHandshake, BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#FAF6F0] border-t border-[#D8D0C3] mt-20 text-[#252B29]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-[#173D32] flex items-center justify-center text-[#B77B50]">
                <Scale className="w-4 h-4" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#173D32]">
                LEXORA
              </span>
            </div>
            <p className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">
              Understand Your Rights. Understand Your Documents.
            </p>
            <p className="text-sm text-[#77766E] max-w-md leading-relaxed">
              An advanced AI legal companion crafted for ordinary citizens. Transforming dense legal jargon 
              into transparent plain-language explanations, detecting hidden contractual risks, uncovering missing 
              statutory safeguards, and bridging regional linguistic barriers in English, Kannada, and Hindi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#173D32]">Capabilities</h4>
            <ul className="space-y-2 text-sm text-[#77766E]">
              <li><Link href="/upload" className="hover:text-[#173D32] transition-colors">Document Simplifier</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#173D32] transition-colors">Risk Detection Studio</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#173D32] transition-colors">Missing-Clause Checker</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#173D32] transition-colors">Multilingual RAG Assistant</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#173D32] transition-colors">Downloadable Legal Briefs</Link></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3">
            <h4 className="font-serif text-base font-semibold text-[#173D32]">Citizen Trust</h4>
            <div className="space-y-2.5 text-xs text-[#77766E]">
              <div className="flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-[#315D49] shrink-0 mt-0.5" />
                <span>Zero permanent document storage without user consent. Complete user data isolation.</span>
              </div>
              <div className="flex items-start space-x-2">
                <BookOpen className="w-4 h-4 text-[#B77B50] shrink-0 mt-0.5" />
                <span>Evidence-grounded citations. No hallucinated legal clauses or statutes.</span>
              </div>
              <div className="flex items-start space-x-2">
                <HeartHandshake className="w-4 h-4 text-[#173D32] shrink-0 mt-0.5" />
                <span>Multilingual equality across English, Kannada (ಕನ್ನಡ), and Hindi (हिन्दी).</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className="mt-10 pt-6 border-t border-[#D8D0C3]/80">
          <div className="bg-[#EAE1D1]/60 p-4 rounded border border-[#D8D0C3] text-xs text-[#77766E] leading-relaxed">
            <strong className="text-[#173D32] font-semibold">LEGAL SAFETY NOTICE & DISCLAIMER: </strong>
            LEXORA is an educational legal information assistant developed to demystify complex contract language. 
            LEXORA does not provide formal legal advice, establish attorney-client privilege, or make determinations on the 
            statutory validity or invalidity of any agreement. Findings represent potential contractual risks requiring 
            professional review. Citizens are strongly encouraged to consult an authorized legal advocate or bar-certified attorney 
            before signing or executing legally binding instruments.
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-[#77766E]">
            <p>© {new Date().getFullYear()} LEXORA. Built for Citizen Legal Empowerment.</p>
            <p className="mt-2 sm:mt-0 font-serif italic text-[#B77B50]">
              Empowering Citizens Through Document Intelligence
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
