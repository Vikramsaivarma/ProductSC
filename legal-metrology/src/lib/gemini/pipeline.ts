'use server';

import type { Part, GenerateContentRequest } from '@google/generative-ai';
import { getGeminiModel } from './client';
import { EXTRACTION_PROMPT, FONT_ANALYSIS_PROMPT, SUGGESTIONS_PROMPT } from './prompts';
import {
  ExtractionResponseSchema,
  FontAnalysisResponseSchema,
  SuggestionsResponseSchema,
  GEMINI_SCHEMAS,
} from './schemas';
import { trackUsage } from './usage';
import type { StructuredDeclarations, FontAnalysis } from '@/types/domain';

interface PipelineInput {
  imageUrls: string[];
  packageWeightBucket: string;
}

interface PipelineResult {
  structured: StructuredDeclarations | null;
  fontAnalysis: FontAnalysis | null;
  suggestions: Record<string, string>;
  tokensUsed: number;
}

const MODEL_NAME = 'gemini-2.0-flash-exp';
const TOTAL_TIMEOUT_MS = 55_000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;

async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = MAX_RETRIES,
  baseDelay: number = BASE_DELAY_MS,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

async function fetchImageAsParts(url: string): Promise<Part[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const mimeType = res.headers.get('content-type') || 'image/jpeg';
  return [{ inlineData: { mimeType, data: base64 } }];
}

function buildRequest(
  systemInstruction: string,
  userParts: Part[],
  generationConfig: GenerateContentRequest['generationConfig'],
): GenerateContentRequest {
  return {
    contents: [{ role: 'user', parts: userParts }],
    systemInstruction,
    generationConfig,
  };
}

async function runExtraction(
  imageParts: Part[],
  signal: AbortSignal,
): Promise<{ result: StructuredDeclarations; tokens: number }> {
  const model = getGeminiModel(MODEL_NAME);
  const request = buildRequest(EXTRACTION_PROMPT, imageParts, {
    temperature: 0.1,
    responseMimeType: 'application/json',
    responseSchema: GEMINI_SCHEMAS.EXTRACTION,
  });

  const result = await withRetry(() =>
    model.generateContent(request, { signal }),
  );

  const text = result.response.text();
  const parsed = JSON.parse(text);
  const validated = ExtractionResponseSchema.parse(parsed);

  let tokens = 0;
  const usageMetadata = result.response.usageMetadata;
  if (usageMetadata) {
    const inputTokens = usageMetadata.promptTokenCount ?? 0;
    const outputTokens = usageMetadata.candidatesTokenCount ?? 0;
    tokens = inputTokens + outputTokens;
    await trackUsage({
      action: 'gemini_extraction',
      model: MODEL_NAME,
      inputTokens,
      outputTokens,
    }).catch(() => {});
  }

  return { result: validated as unknown as StructuredDeclarations, tokens };
}

async function runFontAnalysis(
  imageParts: Part[],
  packageWeightBucket: string,
  signal: AbortSignal,
): Promise<{ result: FontAnalysis; tokens: number } | null> {
  const model = getGeminiModel(MODEL_NAME);
  const userParts: Part[] = [
    ...imageParts,
    { text: `Package weight bucket: ${packageWeightBucket}\n\nAnalyze the font sizes and legibility of all mandatory declaration text visible in the package images above.` },
  ];

  const request = buildRequest(FONT_ANALYSIS_PROMPT, userParts, {
    temperature: 0.2,
    responseMimeType: 'application/json',
    responseSchema: GEMINI_SCHEMAS.FONT_ANALYSIS,
  });

  const result = await withRetry(() =>
    model.generateContent(request, { signal }),
  );

  const text = result.response.text();
  const parsed = JSON.parse(text);
  const validated = FontAnalysisResponseSchema.parse(parsed);

  let tokens = 0;
  const usageMetadata = result.response.usageMetadata;
  if (usageMetadata) {
    const inputTokens = usageMetadata.promptTokenCount ?? 0;
    const outputTokens = usageMetadata.candidatesTokenCount ?? 0;
    tokens = inputTokens + outputTokens;
    await trackUsage({
      action: 'gemini_font_analysis',
      model: MODEL_NAME,
      inputTokens,
      outputTokens,
    }).catch(() => {});
  }

  return { result: validated as unknown as FontAnalysis, tokens };
}

async function runSuggestions(
  violations: Record<string, string>,
  signal: AbortSignal,
): Promise<{ result: Record<string, string>; tokens: number }> {
  if (Object.keys(violations).length === 0) return { result: {}, tokens: 0 };

  const model = getGeminiModel(MODEL_NAME);
  const userParts: Part[] = [{ text: JSON.stringify(violations) }];

  const request = buildRequest(SUGGESTIONS_PROMPT, userParts, {
    temperature: 0.3,
    responseMimeType: 'application/json',
    responseSchema: GEMINI_SCHEMAS.SUGGESTIONS,
  });

  const result = await withRetry(() =>
    model.generateContent(request, { signal }),
  );

  const text = result.response.text();
  const parsed = JSON.parse(text);
  const validated = SuggestionsResponseSchema.parse(parsed);

  let tokens = 0;
  const usageMetadata = result.response.usageMetadata;
  if (usageMetadata) {
    const inputTokens = usageMetadata.promptTokenCount ?? 0;
    const outputTokens = usageMetadata.candidatesTokenCount ?? 0;
    tokens = inputTokens + outputTokens;
    await trackUsage({
      action: 'gemini_suggestions',
      model: MODEL_NAME,
      inputTokens,
      outputTokens,
    }).catch(() => {});
  }

  return { result: validated, tokens };
}

export async function runAnalysisPipeline(
  input: PipelineInput,
): Promise<PipelineResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TOTAL_TIMEOUT_MS);
  const signal = controller.signal;

  let totalTokensUsed = 0;

  try {
    const imagePartsArrays = await Promise.all(
      input.imageUrls.map((url) => fetchImageAsParts(url)),
    );
    const imageParts = imagePartsArrays.flat();

    const [extractionOutcome, fontAnalysisOutcome] = await Promise.all([
      runExtraction(imageParts, signal).catch((err) => {
        console.error('Extraction call failed:', err);
        throw err;
      }),
      runFontAnalysis(imageParts, input.packageWeightBucket, signal).catch(
        (err) => {
          console.warn('Font analysis call failed, continuing without it:', err);
          return null;
        },
      ),
    ]);

    const extractionResult = extractionOutcome.result;
    totalTokensUsed += extractionOutcome.tokens;

    let fontAnalysisResult: FontAnalysis | null = null;
    if (fontAnalysisOutcome) {
      fontAnalysisResult = fontAnalysisOutcome.result;
      totalTokensUsed += fontAnalysisOutcome.tokens;
    }

    const violationMap: Record<string, string> = {};
    if (extractionResult.suspicious_elements.length > 0) {
      extractionResult.suspicious_elements.forEach((el, i) => {
        violationMap[`suspicious_${i}`] = el;
      });
    }

    const missingFields = [
      'manufacturer_name', 'manufacturer_address', 'common_or_generic_name',
      'net_quantity', 'mrp', 'mfg_date', 'consumer_care', 'country_of_origin',
    ] as const;

    for (const field of missingFields) {
      if (extractionResult[field] === null) {
        violationMap[field] = `Missing mandatory declaration: ${field.replace(/_/g, ' ')}`;
      }
    }

    let suggestionsResult: Record<string, string> = {};
    if (Object.keys(violationMap).length > 0) {
      const suggestionsOutcome = await runSuggestions(violationMap, signal).catch(
        (err) => {
          console.warn('Suggestions call failed, returning empty:', err);
          return { result: {}, tokens: 0 };
        },
      );
      suggestionsResult = suggestionsOutcome.result;
      totalTokensUsed += suggestionsOutcome.tokens;
    }

    return {
      structured: extractionResult,
      fontAnalysis: fontAnalysisResult,
      suggestions: suggestionsResult,
      tokensUsed: totalTokensUsed,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
