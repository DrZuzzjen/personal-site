// Shared interfaces for AI Agents

export interface SalesFields {
  name: string | null;
  email: string | null;
  projectType: string | null;
  budget: string | null;
  timeline: string | null;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ExtractionResult {
  fields: SalesFields;
  confidence: number; // 0-100
  extractedFrom: number; // Number of messages analyzed
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  missingFields: string[];
  confidence: number; // 0-100
}

export interface EmailPayload {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  timeline: string;
  conversationHistory: Message[];
  timestamp: string;
  source: 'MSN Messenger Chat' | 'Website Form';
}