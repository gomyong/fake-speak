// scripts/migrate.mjs
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// .env.local 로드
const envPath = path.resolve('.env.local');
let envUrl = '';
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/DATABASE_URL=([^\n\r]+)/);
  if (match) envUrl = match[1].trim();
}

const databaseUrl = process.env.DATABASE_URL || envUrl;

if (!databaseUrl) {
  console.error('DATABASE_URL is not set in environment or .env.local');
  process.exit(1);
}

async function runMigration() {
  console.log('Connecting to Neon PostgreSQL...');
  const sql = neon(databaseUrl);

  const schemaPath = path.resolve('lib/db/schema.sql');
  const ddl = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema.sql DDL on Neon DB...');

  // DDL 기본 실행 (확장, 테이블, 인덱스)
  await sql`CREATE EXTENSION IF NOT EXISTS vector;`;
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

  await sql`
    CREATE TABLE IF NOT EXISTS user_learning_profiles (
      user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      target_exam VARCHAR(20) NOT NULL DEFAULT 'IELTS',
      current_band_estimate NUMERIC(3, 1) DEFAULT 6.0,
      weak_grammar_patterns TEXT[] DEFAULT ARRAY['conditional_type_3', 'concession_clauses'],
      frequent_filler_words TEXT[] DEFAULT ARRAY['like', 'you know', 'actually'],
      type_token_ratio NUMERIC(4, 3) DEFAULT 0.550,
      total_speaking_seconds INTEGER DEFAULT 0,
      current_streak_days INTEGER DEFAULT 1,
      last_studied_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS question_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      exam_type VARCHAR(20) NOT NULL,
      part_or_question VARCHAR(30) NOT NULL,
      domain_category VARCHAR(50) NOT NULL,
      sub_topic VARCHAR(100) NOT NULL,
      cognitive_level SMALLINT NOT NULL DEFAULT 1,
      question_text TEXT NOT NULL,
      embedding vector(768) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_question_history_embedding 
    ON question_history 
    USING hnsw (embedding vector_cosine_ops);
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS evaluation_sessions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES user_learning_profiles(user_id) ON DELETE CASCADE,
      question_id UUID REFERENCES question_history(id),
      exam_type VARCHAR(20) NOT NULL,
      part_or_question VARCHAR(30) NOT NULL,
      question_text TEXT NOT NULL,
      transcript TEXT NOT NULL,
      overall_band NUMERIC(3, 1) NOT NULL,
      scores_json JSONB NOT NULL,
      weaknesses TEXT[] NOT NULL,
      lexical_enhancements JSONB NOT NULL,
      model_answer TEXT NOT NULL,
      audio_storage_key VARCHAR(100),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  const functionQuery = `
CREATE OR REPLACE FUNCTION match_question_similarity(
    query_embedding vector(768),
    match_threshold float,
    days_window int
)
RETURNS TABLE (
    id UUID,
    question_text TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qh.id,
        qh.question_text,
        1 - (qh.embedding <=> query_embedding) AS similarity
    FROM question_history qh
    WHERE qh.created_at >= (NOW() - (days_window || ' days')::INTERVAL)
      AND (1 - (qh.embedding <=> query_embedding)) >= match_threshold
    ORDER BY similarity DESC
    LIMIT 1;
END;
$$;
  `;

  console.log('Registering match_question_similarity function...');
  await sql(functionQuery);
  console.log('Neon database migration completed successfully!');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
