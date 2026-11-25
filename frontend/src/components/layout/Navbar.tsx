'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { Scale, FileText, ShieldAlert, Sparkles, LogIn, LogOut, Globe, User } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, demoLogin } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-[#F3EBDD]/95 backdrop-blur-sm border-b border-[#D8D0C3] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Editorial Typography */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded bg-[#173D32] flex items-center justify-center text-[#F3EBDD] shadow-sm transition-transform group-hover:scale-105">
              <Scale className="w-5 h-5 text-[#B77B50]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#173D32]">
                LEXORA
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest text-[#B77B50] font-semibold border-l border-[#D8D0C3] pl-2">
                Legal Intelligence
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-sm font-medium">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname === '/' ? 'text-[#173D32] font-semibold bg-[#EAE1D1]' : 'text-[#77766E] hover:text-[#173D32]'
              }`}
            >
              {t('navHome')}
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith('/dashboard') ? 'text-[#173D32] font-semibold bg-[#EAE1D1]' : 'text-[#77766E] hover:text-[#173D32]'
              }`}
            >
              {t('navDashboard')}
            </Link>
            <Link
              href="/upload"
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname === '/upload' ? 'text-[#173D32] font-semibold bg-[#EAE1D1]' : 'text-[#77766E] hover:text-[#173D32]'
              }`}
            >
              {t('navUpload')}
            </Link>
          </nav>

          {/* Right Actions: Language Switcher & Auth */}
          <div className="flex items-center space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#EAE1D1] rounded border border-[#D8D0C3] p-0.5 text-xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded transition-all ${
                  language === 'en'
                    ? 'bg-[#173D32] text-[#FFFFFF] font-medium shadow-xs'
                    : 'text-[#77766E] hover:text-[#173D32]'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('kn')}
                className={`px-2 py-1 rounded transition-all ${
                  language === 'kn'
                    ? 'bg-[#173D32] text-[#FFFFFF] font-medium shadow-xs'
                    : 'text-[#77766E] hover:text-[#173D32]'
                }`}
                title="ಕನ್ನಡ (Kannada)"
              >
                ಕನ್ನಡ
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 rounded transition-all ${
                  language === 'hi'
                    ? 'bg-[#173D32] text-[#FFFFFF] font-medium shadow-xs'
                    : 'text-[#77766E] hover:text-[#173D32]'
                }`}
                title="हिन्दी (Hindi)"
              >
                हिन्दी
              </button>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="hidden sm:flex items-center space-x-1.5 text-xs text-[#173D32] bg-[#FAF6F0] px-2.5 py-1.5 rounded border border-[#D8D0C3]"
                >
                  <User className="w-3.5 h-3.5 text-[#B77B50]" />
                  <span className="font-medium max-w-[120px] truncate">{user.full_name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-1.5 text-[#77766E] hover:text-[#992E2E] rounded transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => demoLogin()}
                  className="text-xs bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#B77B50]/50 px-2.5 py-1.5 rounded font-medium transition-colors"
                  title="Quick 1-Click Evaluator Login"
                >
                  Quick Demo
                </button>
                <Link
                  href="/auth"
                  className="text-xs bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] px-3 py-1.5 rounded font-medium transition-colors flex items-center space-x-1 shadow-sm"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
