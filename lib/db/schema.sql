-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 사용자 학습 프로필 테이블 (취약점 및 레벨 추적)
CREATE TABLE IF NOT EXISTS user_learning_profiles (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_exam VARCHAR(20) NOT NULL DEFAULT 'IELTS', -- 'IELTS' or 'TOEIC'
    current_band_estimate NUMERIC(3, 1) DEFAULT 6.0,
    weak_grammar_patterns TEXT[] DEFAULT ARRAY['conditional_type_3', 'concession_clauses'],
    frequent_filler_words TEXT[] DEFAULT ARRAY['like', 'you know', 'actually'],
    type_token_ratio NUMERIC(4, 3) DEFAULT 0.550,
    total_speaking_seconds INTEGER DEFAULT 0,
    current_streak_days INTEGER DEFAULT 1,
    last_studied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 출제 질문 및 임베딩 아카이브 (중복 방지용)
CREATE TABLE IF NOT EXISTS question_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_type VARCHAR(20) NOT NULL, -- 'IELTS' or 'TOEIC'
    part_or_question VARCHAR(30) NOT NULL, -- 'IELTS_PART_2', 'TOEIC_Q11' 등
    domain_category VARCHAR(50) NOT NULL, -- 8대 도메인
    sub_topic VARCHAR(100) NOT NULL,
    cognitive_level SMALLINT NOT NULL DEFAULT 1, -- 1: Descriptive, 2: Comparative, 3: Speculative
    question_text TEXT NOT NULL,
    embedding vector(768) NOT NULL, -- Gemini text-embedding-004
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 코사인 거리 기반 HNSW 인덱스 생성 (초고속 유사도 검색)
CREATE INDEX IF NOT EXISTS idx_question_history_embedding 
ON question_history 
USING hnsw (embedding vector_cosine_ops);

-- 4. 시험 세션 및 채점 피드백 테이블
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
    audio_storage_key VARCHAR(100), -- IndexedDB의 로컬 audio_record_id 매핑 키
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 코사인 유사도 0.72 미만 고유 질문 검증 함수
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
