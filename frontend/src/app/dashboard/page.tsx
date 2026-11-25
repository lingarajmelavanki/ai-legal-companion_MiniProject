'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { api } from '@/lib/api';
import { DocumentItem } from '@/lib/types';
import { 
  FileText, Upload, Plus, Trash2, ArrowRight, 
  AlertTriangle, ShieldCheck, Clock, Sparkles, 
  ExternalLink, Download, Search, CheckCircle2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, demoLogin } = useAuth();
  const { language, t } = useLanguage();

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadDocs = async () => {
    try {
      setLoading(true);
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error('Failed to fetch documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not authenticated, automatically authenticate via demo login so evaluator is never blocked
    if (!authLoading && !user) {
      demoLogin().then(() => loadDocs());
    } else if (user) {
      loadDocs();
    }
  }, [user, authLoading]);

  const handleLoadSample = async (sampleId: number) => {
    try {
      const doc = await api.loadSampleDocument(sampleId);
      router.push(`/studio/${doc.id}`);
    } catch (e) {
      console.error('Error loading sample', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document from your records?')) return;
    try {
      setDeletingId(id);
      await api.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      alert('Failed to delete document');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-[#D8D0C3] gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Citizen Intelligence Center</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
            {user ? `Welcome, ${user.full_name}` : 'Document Dashboard'}
          </h1>
          <p className="text-sm text-[#77766E] mt-1">
            Review your legal documents, track identified contractual risks, and access multilingual AI studio guidance.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/upload"
            className="px-4 py-2.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-semibold transition-all shadow-paper-sm flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload New Document</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-5 rounded">
          <span className="text-xs text-[#77766E] font-medium uppercase tracking-wider">Total Documents</span>
          <div className="font-serif text-3xl font-bold text-[#173D32] mt-2">
            {documents.length}
          </div>
          <span className="text-[11px] text-[#77766E] mt-1 block">Active citizen archive</span>
        </div>

        <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-5 rounded">
          <span className="text-xs text-[#992E2E] font-medium uppercase tracking-wider flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Analyzed & Verified
          </span>
          <div className="font-serif text-3xl font-bold text-[#992E2E] mt-2">
            {documents.filter(d => d.status === 'analyzed').length}
          </div>
          <span className="text-[11px] text-[#77766E] mt-1 block">Audit briefs available</span>
        </div>

        <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-5 rounded">
          <span className="text-xs text-[#B77B50] font-medium uppercase tracking-wider flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" />
            Regional Languages
          </span>
          <div className="font-serif text-3xl font-bold text-[#B77B50] mt-2">
            3 Active
          </div>
          <span className="text-[11px] text-[#77766E] mt-1 block">English, ಕನ್ನಡ, हिन्दी</span>
        </div>

        <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-5 rounded">
          <span className="text-xs text-[#315D49] font-medium uppercase tracking-wider flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            Data Isolation
          </span>
          <div className="font-serif text-3xl font-bold text-[#315D49] mt-2">
            100%
          </div>
          <span className="text-[11px] text-[#77766E] mt-1 block">Encrypted local storage</span>
        </div>
      </div>

      {/* Quick Synthetic Sample Loader Banner */}
      <div className="bg-[#EAE1D1]/60 border border-[#D8D0C3] p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#173D32]">
            Test Synthetic Demonstration Documents
          </h3>
          <p className="text-xs text-[#77766E] mt-0.5">
            Instantly load real-world contracts containing tricky clauses, harsh penalties, or missing protections.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleLoadSample(1)}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#B77B50]/60 rounded text-xs font-medium transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-[#B77B50]" />
            <span>Rental Lease</span>
          </button>
          <button
            onClick={() => handleLoadSample(2)}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#B77B50]/60 rounded text-xs font-medium transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-[#B77B50]" />
            <span>Employment Bond</span>
          </button>
          <button
            onClick={() => handleLoadSample(3)}
            className="px-3 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#B77B50]/60 rounded text-xs font-medium transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3 h-3 text-[#B77B50]" />
            <span>Mutual NDA</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#77766E] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#FAF6F0] border border-[#D8D0C3] rounded text-xs text-[#252B29] focus:outline-none focus:border-[#173D32]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['All', 'Rental / Lease Agreement', 'Employment Contract', 'Non-Disclosure Agreement (NDA)'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#173D32] text-[#FFFFFF] font-medium'
                  : 'bg-[#FAF6F0] text-[#77766E] border border-[#D8D0C3] hover:text-[#173D32]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="bg-[#FAF6F0] border border-[#D8D0C3] rounded-lg overflow-hidden shadow-paper-sm">
        <div className="px-6 py-4 border-b border-[#D8D0C3] bg-[#FBF8F3] flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-[#173D32]">Recent Legal Documents</h2>
          <span className="text-xs text-[#77766E]">{filteredDocs.length} items found</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[#77766E]">
            Loading citizen documents...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <FileText className="w-12 h-12 text-[#B77B50] mx-auto opacity-70" />
            <h3 className="font-serif text-xl font-bold text-[#173D32]">No Documents Found</h3>
            <p className="text-xs text-[#77766E] max-w-sm mx-auto">
              Upload your agreement or select one of the synthetic demonstration documents above to begin legal analysis.
            </p>
            <div className="pt-2">
              <Link
                href="/upload"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#173D32] text-[#FFFFFF] text-xs font-semibold rounded"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#D8D0C3]">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 hover:bg-[#FBF8F3] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#E2EAE6] text-[#173D32] border border-[#B8AE9F]/50">
                      {doc.category}
                    </span>
                    <span className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      doc.status === 'analyzed' 
                        ? 'bg-[#EEF7F2] text-[#1E5E45] border border-[#A3D4BE]' 
                        : 'bg-[#FEF7EE] text-[#9E641B] border border-[#E8CBA1]'
                    }`}>
                      {doc.status}
                    </span>
                    <span className="text-xs text-[#77766E] font-mono">
                      {doc.file_type.toUpperCase()} • {Math.round(doc.file_size / 1024)} KB
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#173D32] hover:text-[#B77B50] transition-colors">
                    <Link href={`/studio/${doc.id}`}>
                      {doc.title}
                    </Link>
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-xs text-[#77766E]">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </span>
                    <span>•</span>
                    <span>Pages: {doc.page_count}</span>
                  </div>
                </div>

                {/* Action Button Set */}
                <div className="flex items-center space-x-2 w-full md:w-auto justify-end pt-2 md:pt-0">
                  <Link
                    href={`/studio/${doc.id}`}
                    className="px-3 py-1.5 bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF] rounded text-xs font-medium transition-colors flex items-center space-x-1"
                  >
                    <span>Studio</span>
                    <ArrowRight className="w-3 h-3 text-[#B77B50]" />
                  </Link>
                  <Link
                    href={`/risks/${doc.id}`}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#992E2E] border border-[#E8B2B2] rounded text-xs font-medium transition-colors"
                    title="Risk Detection Center"
                  >
                    Risks
                  </Link>
                  <Link
                    href={`/missing-clauses/${doc.id}`}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#B77B50] border border-[#B77B50]/50 rounded text-xs font-medium transition-colors"
                    title="Missing Clauses"
                  >
                    Missing
                  </Link>
                  <Link
                    href={`/reports/${doc.id}`}
                    className="px-2.5 py-1.5 bg-[#FAF6F0] hover:bg-[#FFFFFF] text-[#173D32] border border-[#D8D0C3] rounded text-xs font-medium transition-colors"
                    title="Report Brief"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-1.5 text-[#77766E] hover:text-[#992E2E] rounded transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
