import { DocumentItem, AnalysisResult, ChatMessage, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('lexora_token');
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

export const api = {
  // Auth
  async demoLogin(): Promise<{ access_token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexora_token', data.access_token);
      localStorage.setItem('lexora_user', JSON.stringify({ id: data.user_id, email: data.email, full_name: data.full_name }));
    }
    return {
      access_token: data.access_token,
      user: { id: data.user_id, email: data.email, full_name: data.full_name }
    };
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Login failed');
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexora_token', data.access_token);
      localStorage.setItem('lexora_user', JSON.stringify({ id: data.user_id, email: data.email, full_name: data.full_name }));
    }
    return data;
  },

  async register(email: string, password: string, full_name: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Registration failed');
    const data = await res.json();
    if (typeof window !== 'undefined') {
      localStorage.setItem('lexora_token', data.access_token);
      localStorage.setItem('lexora_user', JSON.stringify({ id: data.user_id, email: data.email, full_name: data.full_name }));
    }
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Not authenticated');
    return res.json();
  },

  // Documents
  async listDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents/`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getDocument(id: number): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Document not found');
    return res.json();
  },

  async uploadDocument(file: File, category?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) formData.append('category', category);

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Upload failed');
    return res.json();
  },

  async loadSampleDocument(sampleId: number): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE}/documents/load-sample/${sampleId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load sample document');
    return res.json();
  },

  async deleteDocument(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  // Analysis
  async analyzeDocument(id: number): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/analysis/${id}/analyze`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Analysis failed');
    return res.json();
  },

  async getAnalysis(id: number): Promise<AnalysisResult> {
    const res = await fetch(`${API_BASE}/analysis/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Analysis not ready');
    return res.json();
  },

  // Chat
  async sendChatMessage(documentId: number, message: string, language: string = 'en'): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/chat/${documentId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ message, language }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  async getChatHistory(documentId: number): Promise<{ document_id: number; messages: ChatMessage[] }> {
    const res = await fetch(`${API_BASE}/chat/${documentId}/history`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to fetch chat history');
    return res.json();
  },

  // Reports
  async generateReport(documentId: number): Promise<{ download_url: string }> {
    const res = await fetch(`${API_BASE}/reports/${documentId}/generate`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },

  getReportDownloadUrl(documentId: number): string {
    return `${API_BASE}/reports/${documentId}/download`;
  }
};
