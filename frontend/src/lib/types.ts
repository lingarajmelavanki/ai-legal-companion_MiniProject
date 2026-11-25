export type Language = 'en' | 'kn' | 'hi';

export interface User {
  id: number;
  email: string;
  full_name: string;
}

export interface DocumentChunk {
  id: number;
  chunk_index: number;
  page_number: number;
  clause_heading?: string;
  content: string;
  cleaned_content: string;
}

export interface DocumentItem {
  id: number;
  title: string;
  filename: string;
  file_type: string;
  file_size: number;
  category: string;
  status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
  page_count: number;
  ocr_applied: number;
  created_at: string;
  updated_at: string;
  chunks?: DocumentChunk[];
}

export interface ObligationItem {
  party: string;
  obligation: string;
  deadline?: string;
  consequence?: string;
}

export interface PartyRightItem {
  party: string;
  right: string;
  condition?: string;
}

export interface UnclearTermItem {
  term: string;
  context: string;
  why_unclear: string;
  suggested_clarification: string;
}

export interface RiskFinding {
  id: number;
  clause_reference: string;
  page_number: number;
  original_text: string;
  severity: 'High' | 'Medium' | 'Low';
  category: string;
  explanation_en: string;
  explanation_kn?: string;
  explanation_hi?: string;
  legal_rationale: string;
  questions_to_ask: string[];
  created_at: string;
}

export interface MissingClauseFinding {
  id: number;
  clause_name: string;
  status: 'Absent' | 'Incomplete' | 'Ambiguous';
  clause_type: string;
  importance_level: 'Critical' | 'High' | 'Moderate';
  why_it_matters_en: string;
  why_it_matters_kn?: string;
  why_it_matters_hi?: string;
  recommended_standard_language?: string;
  created_at: string;
}

export interface AnalysisResult {
  id: number;
  document_id: number;
  summary_en: string;
  summary_kn?: string;
  summary_hi?: string;
  overall_risk_level: 'Low' | 'Moderate' | 'Elevated' | 'High';
  key_obligations: ObligationItem[];
  party_rights: PartyRightItem[];
  unclear_terms: UnclearTermItem[];
  suggested_questions: string[];
  risks: RiskFinding[];
  missing_clauses: MissingClauseFinding[];
  created_at: string;
}

export interface CitationItem {
  page_number: number;
  clause_heading?: string;
  snippet: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  language: Language;
  content: string;
  citations: CitationItem[];
  created_at: string;
}
