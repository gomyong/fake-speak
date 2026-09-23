// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export function getGeminiClient(): GoogleGenerativeAI | null {
  return genAI;
}

// 주력 AI 모델: Gemini 2.0 Flash (초저지연 실시간 추론 및 채점)
export const GEMINI_FLASH_MODEL = 'gemini-2.0-flash';
export const GEMINI_EMBEDDING_MODEL = 'text-embedding-004';

// 텍스트 임베딩 생성 함수 (768차원 벡터)
export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!genAI) {
    console.warn('GEMINI_API_KEY is not set. Skipping embedding generation.');
    return null;
  }

  try {
    const model = genAI.getGenerativeModel({ model: GEMINI_EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}
