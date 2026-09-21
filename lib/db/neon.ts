// lib/db/neon.ts
import { Pool, neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL || '';

export function hasNeonDatabase(): boolean {
  return Boolean(databaseUrl && databaseUrl.startsWith('postgres'));
}

export function getNeonSql() {
  if (!hasNeonDatabase()) return null;
  return neon(databaseUrl);
}

// 768차원 질문 임베딩과 유사한 기존 출제 질문 검색 (코사인 유사도 >= threshold)
export async function findSimilarQuestions(
  embedding: number[],
  matchThreshold: number = 0.72,
  daysWindow: number = 60
): Promise<Array<{ id: string; question_text: string; similarity: number }>> {
  if (!hasNeonDatabase()) {
    return [];
  }

  try {
    const sql = getNeonSql();
    if (!sql) return [];

    const vectorStr = `[${embedding.join(',')}]`;
    const rows = await sql`
      SELECT 
        qh.id,
        qh.question_text,
        1 - (qh.embedding <=> ${vectorStr}::vector) AS similarity
      FROM question_history qh
      WHERE qh.created_at >= (NOW() - (${daysWindow} || ' days')::INTERVAL)
        AND (1 - (qh.embedding <=> ${vectorStr}::vector)) >= ${matchThreshold}
      ORDER BY similarity DESC
      LIMIT 1;
    `;

    return rows.map((r: any) => ({
      id: r.id,
      question_text: r.question_text,
      similarity: Number(r.similarity),
    }));
  } catch (error) {
    console.warn('Neon similarity check failed, falling back to local:', error);
    return [];
  }
}

// 출제된 질문과 임베딩 저장
export async function saveQuestionToHistory(params: {
  examType: string;
  partOrQuestion: string;
  domainCategory: string;
  subTopic: string;
  cognitiveLevel: number;
  questionText: string;
  embedding: number[];
}): Promise<string | null> {
  if (!hasNeonDatabase()) return null;

  try {
    const sql = getNeonSql();
    if (!sql) return null;

    const vectorStr = `[${params.embedding.join(',')}]`;
    const rows = await sql`
      INSERT INTO question_history (
        exam_type,
        part_or_question,
        domain_category,
        sub_topic,
        cognitive_level,
        question_text,
        embedding
      ) VALUES (
        ${params.examType},
        ${params.partOrQuestion},
        ${params.domainCategory},
        ${params.subTopic},
        ${params.cognitiveLevel},
        ${params.questionText},
        ${vectorStr}::vector
      )
      RETURNING id;
    `;

    return rows[0]?.id || null;
  } catch (error) {
    console.warn('Failed to save question to Neon history:', error);
    return null;
  }
}
