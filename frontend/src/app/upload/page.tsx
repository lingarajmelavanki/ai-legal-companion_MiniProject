'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, 
  Sparkles, ArrowRight, ShieldCheck, FileCheck, Layers
} from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { user, demoLogin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setError(null);
    const validExtensions = ['.pdf', '.docx', '.doc', '.txt', '.png', '.jpg', '.jpeg'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(ext)) {
      setError(`Unsupported file type: ${ext}. Please upload a PDF, DOCX, TXT, or Image document.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25 MB safety limit.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setError(null);
    setUploading(true);
    setProgress(15);
    setStatusMessage('Reading document structure & coordinates...');

    try {
      if (!user) {
        await demoLogin();
      }

      setProgress(40);
      setStatusMessage('Extracting text and identifying clause boundaries...');
      
      const doc = await api.uploadDocument(selectedFile, category || undefined);
      
      setProgress(80);
      setStatusMessage('Classifying document category & indexing searchable chunks...');

      setTimeout(() => {
        setProgress(100);
        setStatusMessage('Complete! Navigating to AI Analysis Studio...');
        setTimeout(() => {
          router.push(`/studio/${doc.id}`);
        }, 500);
      }, 500);

    } catch (err: any) {
      setError(err.message || 'Failed to upload and process document.');
      setUploading(false);
    }
  };

  const handleLoadSample = async (sampleId: number) => {
    setUploading(true);
    setError(null);
    setProgress(30);
    setStatusMessage('Loading synthetic legal document...');
    try {
      if (!user) {
        await demoLogin();
      }
      setProgress(75);
      setStatusMessage('Analyzing contractual terms...');
      const doc = await api.loadSampleDocument(sampleId);
      setProgress(100);
      router.push(`/studio/${doc.id}`);
    } catch (e: any) {
      setError('Failed to load sample document.');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Document Workspace</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#173D32]">
          Upload Citizen Legal Document
        </h1>
        <p className="text-sm text-[#77766E] max-w-lg mx-auto">
          Submit any contract, lease, bond, or legal notice to receive plain-language simplification, risk auditing, and missing clause diagnosis.
        </p>
      </div>

      {/* Main Drag & Drop Zone */}
      <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-8 rounded-lg shadow-paper-sm space-y-6">
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-[#173D32] bg-[#E2EAE6]/50'
              : selectedFile
              ? 'border-[#315D49] bg-[#FAF6F0]'
              : 'border-[#D8D0C3] hover:border-[#B77B50] bg-[#FFFFFF]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
            className="hidden"
          />

          {selectedFile ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded bg-[#EEF7F2] text-[#1E5E45] border border-[#A3D4BE] flex items-center justify-center mx-auto">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-[#173D32]">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-[#77766E]">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another file to replace
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded bg-[#EAE1D1] text-[#173D32] flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6 text-[#B77B50]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#173D32]">
                  Drag and drop your legal document here
                </h4>
                <p className="text-xs text-[#77766E] mt-1">
                  or browse files from your computer (PDF, Word DOCX, TXT, PNG, JPG up to 25MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Optional Category Override */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#173D32] uppercase tracking-wider mb-1">
              Document Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#FFFFFF] border border-[#D8D0C3] rounded text-xs text-[#252B29] focus:outline-none focus:border-[#173D32]"
            >
              <option value="">Auto-Detect via AI</option>
              <option value="Rental / Lease Agreement">Rental / Lease Agreement</option>
              <option value="Employment Contract">Employment Contract & Service Bond</option>
              <option value="Non-Disclosure Agreement (NDA)">Non-Disclosure Agreement (NDA)</option>
              <option value="Consumer Loan Agreement">Consumer Loan Agreement</option>
              <option value="Freelance / Service Agreement">Freelance / Service Agreement</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleUploadSubmit}
              disabled={!selectedFile || uploading}
              className={`w-full py-2.5 px-4 rounded text-xs font-semibold transition-all shadow-paper-sm flex items-center justify-center space-x-1.5 ${
                !selectedFile || uploading
                  ? 'bg-[#D8D0C3] text-[#77766E] cursor-not-allowed'
                  : 'bg-[#173D32] hover:bg-[#315D49] text-[#FFFFFF]'
              }`}
            >
              <span>{uploading ? 'Processing Document...' : 'Proceed to Document Studio'}</span>
              <ArrowRight className="w-4 h-4 text-[#B77B50]" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Status */}
        {uploading && (
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-[#173D32] font-medium">
              <span>{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#EAE1D1] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#173D32] transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#FDF1F1] border border-[#E8B2B2] rounded text-xs text-[#992E2E] flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Synthetic Document Demo Selector */}
      <div className="bg-[#FAF6F0] border border-[#D8D0C3] p-6 rounded-lg space-y-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B77B50] font-semibold">Immediate Evaluator Testing</span>
          <h3 className="font-serif text-xl font-bold text-[#173D32]">Don't have a document handy?</h3>
          <p className="text-xs text-[#77766E] mt-0.5">
            Load one of our curated synthetic legal contracts containing realistic pitfalls and missing protections:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <button
            onClick={() => handleLoadSample(1)}
            disabled={uploading}
            className="text-left p-4 bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] rounded transition-all group"
          >
            <span className="text-[10px] uppercase font-semibold text-[#9E641B] block">Rental</span>
            <h5 className="font-serif text-sm font-bold text-[#173D32] mt-1 group-hover:text-[#B77B50]">
              Bengaluru Lease Agreement
            </h5>
            <p className="text-[11px] text-[#77766E] mt-1 line-clamp-2">
              Forfeiture of deposit, lock-in period, 24% late penalty interest.
            </p>
          </button>

          <button
            onClick={() => handleLoadSample(2)}
            disabled={uploading}
            className="text-left p-4 bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] rounded transition-all group"
          >
            <span className="text-[10px] uppercase font-semibold text-[#173D32] block">Employment</span>
            <h5 className="font-serif text-sm font-bold text-[#173D32] mt-1 group-hover:text-[#B77B50]">
              Software Engineer Bond
            </h5>
            <p className="text-[11px] text-[#77766E] mt-1 line-clamp-2">
              3-year bond with ₹5 Lakh liquidated penalty and 2-year non-compete.
            </p>
          </button>

          <button
            onClick={() => handleLoadSample(3)}
            disabled={uploading}
            className="text-left p-4 bg-[#FFFFFF] border border-[#D8D0C3] hover:border-[#B77B50] rounded transition-all group"
          >
            <span className="text-[10px] uppercase font-semibold text-[#B77B50] block">Commercial NDA</span>
            <h5 className="font-serif text-sm font-bold text-[#173D32] mt-1 group-hover:text-[#B77B50]">
              Mutual NDA Agreement
            </h5>
            <p className="text-[11px] text-[#77766E] mt-1 line-clamp-2">
              Perpetual confidentiality with missing public domain exclusions.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
