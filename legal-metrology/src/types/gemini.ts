import { StructuredDeclarations, FontAnalysis } from './domain';

export interface ExtractionResponse {
  structured: StructuredDeclarations;
  raw_text: string;
}

export interface FontAnalysisResponse {
  font_analysis: FontAnalysis;
}

export interface SuggestionsResponse {
  suggestions: Record<string, string>;
}

export interface GeminiError {
  message: string;
  code?: string;
  status?: number;
}