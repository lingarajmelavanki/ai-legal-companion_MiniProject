'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Scale, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const { login, register, demoLogin } = useAuth();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await demoLogin();
      router.push('/dashboard');
    } catch (err: any) {
      setError('Quick Demo login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded-lg shadow-paper-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded bg-[#173D32] flex items-center justify-center text-[#B77B50] mx-auto mb-2">
            <Scale className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#173D32]">
            {isRegister ? 'Create Citizen Account' : 'Sign In to LEXORA'}
          </h2>
          <p className="text-xs text-[#77766E]">
            {isRegister 
              ? 'Join citizens understanding their legal contracts transparently' 
              : 'Access your analyzed documents, risk audits, and legal history'}
          </p>
        </div>

        {/* 1-Click Demo Banner */}
        <div className="bg-[#EAE1D1]/60 border border-[#B77B50]/30 rounded p-3 text-center space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B77B50]">Evaluator Quick Access</span>
          <button
            type="button"
            onClick={handleDemo}
            disabled={submitting}
            className="w-full py-2 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-medium transition-colors flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B77B50]" />
            <span>Instant 1-Click Demo Evaluation</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#FDF1F1] border border-[#E8B2B2] rounded text-xs text-[#992E2E] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-[#173D32] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ananya Sharma"
                className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-sm text-[#252B29] focus:outline-none focus:border-[#173D32]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#173D32] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="citizen@example.com"
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-sm text-[#252B29] focus:outline-none focus:border-[#173D32]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#173D32] uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-sm text-[#252B29] focus:outline-none focus:border-[#173D32]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-[#B77B50] hover:bg-[#9E643B] text-[#FFFFFF] rounded text-sm font-semibold transition-colors shadow-paper-sm flex items-center justify-center space-x-1.5"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{submitting ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}</span>
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="pt-2 text-center text-xs text-[#77766E]">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="font-semibold text-[#173D32] underline hover:text-[#B77B50]"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="font-semibold text-[#173D32] underline hover:text-[#B77B50]"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
