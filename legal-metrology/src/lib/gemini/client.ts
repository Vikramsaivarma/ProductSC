import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. Gemini features will not work.');
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export function getGeminiModel(modelName: string = 'gemini-3.6-flash') {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }
  return genAI.getGenerativeModel({ model: modelName });
}