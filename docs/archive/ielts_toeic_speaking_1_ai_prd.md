# Product Requirement Document (PRD)

## Project Name: SpeakWise AI

### — Google Antigravity & Gemini 기반 1인 맞춤형 시험 대비 AI 스피킹 웹앱 (Neon + IndexedDB Edition)

## 1. 프로젝트 개요 및 배경 (Executive Summary)

### 1.1 배경 및 문제 정의

* **기존 상용 앱(스픽, 듀오링고 등)의 한계**:

  * **주제 및 패턴의 얕은 반복**: 랜덤 출제를 표방하지만 실제로는 고정된 질문 템플릿(취미, 주말 계획, 여행 등)만 맴돌며, 심층적인 학술/시사 아젠다로 확장되지 못함.

  * **난이도 정체(Plateau)**: 학습자의 실력이 올라가도 동일한 난이도의 단문 답변 질문만 반복 제공되어, 고득점(IELTS Band 7.5+ / 토익 스피킹 180점+)에 필수적인 추상적 사고와 복합 문장 구사 훈련이 불가능함.

  * **시험 규격의 불일치**: IELTS 대면 인터뷰(Part 1\~3 시간 배분) 및 토익 스피킹 11개 문항의 엄격한 타이머(준비 30초/발화 45초 등) 제약을 정밀하게 시뮬레이션하지 못함.

* **1인 학습자의 솔루션 정의**:

  * **반복 제로 & 지속적 난이도 상향**: 과거 출제된 질문 벡터를 추적하여 주제 중복을 수학적으로 배제하고, 사용자 숙련도에 맞춰 질문의 인지 복잡도(Cognitive Load)를 점진적으로 높임.

  * **시험관 페르소나 + 즉각적 공인 루브릭 채점**: 발화 즉시 IELTS 공식 4대 기준(FC, LR, GRA, PR) 및 토익스피킹 척도에 따라 정량 분석 및 모범 교정본(Native Revision) 제공.

  * **비용 \$0 제로 인프라 최적화**: Supabase 무료 할당량 소진에 구애받지 않고, Neon Serverless Postgres(`pgvector`)와 브라우저 로컬 **IndexedDB**를 결합하여 인프라 비용 \$0, 네트워크 대기시간 0ms를 달성.

  * **Less but better UI**: 화면 중앙의 마이크, 고정밀 타이머, 교정 피드백에만 집중하는 미니멀 PWA.

### 1.2 제품 비전 (North Star)

> **"어제 다뤘던 주제와 문장 구조는 절대 반복하지 않는다. 나의 언어적 한계를 매일 한 걸음씩 넓혀주는 공인 시험관 페르소나 AI 연구소."**

## 2. 동적 아젠다 생성 및 적응형 난이도 엔진 (Anti-Repetition & Adaptive Engine)

상용 앱의 고질병인 '주제 고갈'과 '난이도 정체'를 극복하기 위한 SpeakWise AI의 4대 핵심 지능 엔진입니다.

```
[사용자 발화 수집 (Next.js)] 
       │
       ├─► [IndexedDB: 오디오 Blob 로컬 저장 (0ms 레이턴시, 트래픽 $0)]
       │
       ▼
[Evaluator Agent: 어휘/문법/Band 분석]
       │
       ├─► Neon pgvector: 과거 출제 질문 임베딩 적재 (text-embedding-004)
       ├─► Neon DB: 어휘 다양성 지수(TTR) & 문법 취약점 업데이트
       │
       ▼
[Topic Curator Agent]
       ├─► 1. 토픽 온톨로지 매트릭스 (미탐색 영역 우선 배정)
       ├─► 2. 코사인 유사도 검증 ($cos(\theta) < 0.72$ 통과 필터)
       ├─► 3. 인지 복잡도 사다리 (사용자 Band 맞춤형 질문 고도화)
       └─► 4. 취약 문형 강제 유도 (Syntactic Gap Injection)
       │
       ▼
[Examiner Agent: 다음 세션 질문 출제]

```

### 2.1 다차원 토픽 온톨로지 & 탐색-활용 (Exploration-Exploitation)

단순 무작위 추출을 전면 금지하고, 8대 대분류와 64개 중분류, 그리고 256개 심층 쟁점으로 구성된 온톨로지 트리를 구축합니다.

* **8대 대분류**:

  1. 환경 & 지속가능성 (Ecology, Climate Policy, Circular Economy)

  2. 기술 & 윤리 (AI, Automation, Bioethics, Surveillance)

  3. 도시 & 사회 구조 (Urban Planning, Gentrification, Demographic Shift)

  4. 경제 & 소비 문화 (Gig Economy, Fast Fashion, Universal Basic Income)

  5. 교육 & 지식 습득 (Pedagogy, Digital Literacy, Standardized Testing)

  6. 예술, 미디어 & 문화유산 (Cultural Appropriation, Digital Art, Media Monopolies)

  7. 심리 & 인간관계 (Loneliness Epidemic, Social Fabric, Mental Well-being)

  8. 글로벌 거버넌스 & 법 (International Treaties, Space Law, Digital Rights)

* **탐색 페널티 알고리즘**:

  * 각 주제 노드는 `last_tested_at`(최근 출제일)과 `exposure_count`(노출 횟수)를 갖습니다.

  * 최근 14일 이내에 다룬 세부 주제는 가중치 페널티를 부여받아 출제 확률이 0에 수렴하며, 한 번도 다루지 않은 미탐색(Unexplored) 도메인에 우선순위가 주어집니다.

### 2.2 Neon pgvector 기반 시맨틱 중복 제거 (Semantic Deduplication)

동일한 주제어라도 표현만 바꿔서 출제되는 유사 질문(예: "Describe your favorite park" vs "Talk about a green space you enjoy")을 원천 필터링합니다.

* 질문 생성 시 Gemini Text Embedding API(`text-embedding-004`)를 통해 768차원 벡터를 생성합니다.

* Neon의 `pgvector` 확장을 활용하여 최근 60일간 출제된 질문 벡터와의 코사인 유사도를 연산합니다:
  

  $$
  \text{Cosine Similarity} = \frac{\mathbf{A} \cdot \mathbf{B}}{\Vert{}\mathbf{A}\Vert{} \Vert{}\mathbf{B}\Vert{}}
  $$

* **필터링 임계치**:

  * $\text{Similarity} \ge 0.72$: 중복 판정 $\rightarrow$ Topic Curator Agent가 즉각 Reject 후 새로운 아젠다로 재생성.

  * $\text{Similarity} < 0.72$: 고유 질문 승인 $\rightarrow$ 출제 확정.

### 2.3 인지 복잡도 사다리 (Cognitive Load & Adaptive Ladder)

사용자의 현재 실력(Band Score)에 안주하지 않고 상위 레벨로 이끄는 3단계 심화 사다리 모델을 적용합니다.

| 레벨 | 질문 성격 | 요구 사고 역량 | 질문 예시 | 
 | ----- | ----- | ----- | ----- | 
| **Level 1: Descriptive** (Band 5.5 - 6.0) | 사실 묘사, 개인적 경험 나열 | 단순 시제 일치, 일상 어휘 | *"Describe a library or bookstore you visited recently."* | 
| **Level 2: Comparative & Analytical** (Band 6.5 - 7.0) | 두 개념의 대조, 트렌드 분석, 인과관계 규명 | 복문 구조, 접속부사 활용 | *"How has the fundamental purpose of public libraries evolved in the era of ubiquitous digital content?"* | 
| **Level 3: Counterfactual & Speculative** (Band 7.5 - 9.0) | 가설적 상황 평가, 철학적/윤리적 딜레마, 상충 가치 판단 | 가정법 혼합 시제, 도치, 추상적 학술 어휘 | *"Were governments to entirely defund physical libraries in favor of centralized AI knowledge repositories, what subtle sociological consequences might arise?"* | 

* **동적 승급 트리거**: 사용자가 특정 파트에서 2회 연속 Band 7.0 이상의 유창성과 어휘력을 보이면, 에이전트는 다음 질문을 Level 3(가정법/상충 가치 평가)로 강제 상향합니다.

### 2.4 취약 문법 및 어휘 편식 파괴 (Syntactic Gap Injection)

* **어휘 편식 감지**: Evaluator Agent가 사용자의 발화에서 특정 접속사(e.g., "Also", "Because")나 형용사(e.g., "good", "important", "difficult")의 과다 반복 빈도를 측정합니다.

* **질문 프롬프트 제약 주입**:

  * 예: 사용자가 양보절(`Although`, `Despite`)과 혼합 가정법을 기피하는 경향이 있다면, 다음 질문 생성 프롬프트에 유도 제약을 주입합니다.

  * *Prompt Injection: "Generate a controversial question regarding environmental regulations versus economic survival that naturally necessitates a concession clause (e.g., 'Even if...', 'Notwithstanding...') to answer effectively."*

## 3. 공인 시험 체계 및 평가 루브릭 매핑

### 3.1 IELTS Speaking 모듈 규격

| 파트 | 진행 방식 및 시간 | Examiner Agent 역할 | 평가 중점 | 
 | ----- | ----- | ----- | ----- | 
| **Part 1: Intro & Interview** (4\~5분) | 친숙한 일상/사회적 주제 질의응답 (문항당 준비 0초 / 답변 30\~45초) | 자연스러운 티키타카 및 라포 형성, 답변 길이에 맞춘 적절한 인터럽트 | 발화 즉시성, 기본 시제 정확도 | 
| **Part 2: Long Turn (Cue Card)** (3\~4분) | 1개 큐카드 주제에 대해 **1분 준비(메모)** 후 **2분간 독백 스피킹** | 1분 준비 타이머 알림, 2분 발화 타이머 엄격 제어 (2분 도달 시 자동 컷) | 담화 일관성(Coherence), 장문 전개력 | 
| **Part 3: Discussion** (4\~5분) | Part 2와 연계된 고난도 추상적/사회적 쟁점 토론 (문항당 답변 45\~60초) | 사용자의 논리적 맹점을 파고드는 반론(Counter-argument) 질문 제시 | 비판적 사고, C1/C2급 학술 어휘, 논리적 반박 | 

#### IELTS 4대 공식 평가 루브릭 (0.0 \~ 9.0 Band)

1. **Fluency and Coherence (FC, 유창성과 결속성)**: 발화 속도, 망설임(Hesitation)의 성격(언어 탐색 vs 아이디어 구상), 담화 표지어(Discourse Markers)의 적절성.

2. **Lexical Resource (LR, 어휘 다양성)**: 주제 특화 어휘(Topic-specific vocabulary), 연어(Collocations), 숙어적 표현(Idiomaticity)의 유연한 사용 및 오용 분석.

3. **Grammatical Range and Accuracy (GRA, 문법적 범위와 정확도)**: 단문/중문/복문의 비율, 복합 시제, 수동태, 관계사절 활용도 및 체계적 에러 빈도.

4. **Pronunciation (PR, 발음과 억양)**: STT 신뢰도 점수 및 음운 변이, 강세(Stress), 억양(Intonation) 지표 추론.

### 3.2 TOEIC Speaking 모듈 규격

| 문항 | 유형 | 준비 시간 | 답변 시간 | 평가 기준 | 
 | ----- | ----- | ----- | ----- | ----- | 
| **Q1\~Q2** | 문장 읽기 (Read a text aloud) | 45초 | 45초 | 발음(Pronunciation), 억양과 강세(Intonation & Stress) | 
| **Q3\~Q4** | 사진 묘사 (Describe a picture) | 45초 | 30초 | 위치 전치사, 현재진행형, 디테일 묘사 어휘 | 
| **Q5\~Q7** | 듣고 질문에 답하기 (Respond to questions) | 문항당 3초 | Q5, Q6: 15초 / Q7: 30초 | 즉각적 질문 의도 파악, 핵심 답변 완성도 | 
| **Q8\~Q10** | 제공된 정보를 보고 질문에 답하기 (Respond using info) | 45초 (지문 파악) | Q8, Q9: 15초 / Q10: 30초 | 일정표/송장 정보 정확도, 시간/조건 전치사 | 
| **Q11** | 의견 제시하기 (Express an opinion) | 45초 | 60초 | 논리적 근거 2가지 제시, 일관성 및 완결성 | 

## 4. 시스템 아키텍처 및 Google Antigravity 에이전트 설계

### 4.1 시스템 구성도

```
[Client: Next.js 15 PWA]
  │ ├─ Web Audio API / AudioWorklet (고음질 녹음)
  │ ├─ Dexie.js / IndexedDB (User Voice Audio Blob 로컬 영구 저장, 트래픽 $0)
  │ └─ Web Worker Timer (백그라운드 스로틀링 방지 초정밀 시험 시계)
  │
  ▼
[Edge Runtime / API Routes]
  │
  ▼
[Google Antigravity Agent Runtime]
  ├── [Topic Curator Agent] ◄──► [Neon Serverless Postgres: pgvector 768d]
  ├── [Examiner Persona Agent] ◄──► [Gemini 1.5 Pro: 시험관 인터랙션]
  └── [Evaluator Agent] ◄──► [Gemini 1.5 Flash: JSON 구조화 루브릭 평가]
  │
  ▼
[Persistence Layer: Neon Database]
  ├── User Learning Profile (Band 이력, 취약 문형, TTR 지표)
  ├── Question Embeddings (코사인 유사도 중복 검증용 아카이브)
  └── Structured Evaluation Feedback & Native Rewrites

```

### 4.2 스토리지 전략: Neon + IndexedDB 하이브리드 아키텍처

기존 클라우드 오브젝트 스토리지(S3, Supabase Storage 등)의 무료 한도 및 트래픽 과금 위험을 완전히 해소하기 위해 1인용 앱에 가장 이상적인 하이브리드 저장 방식을 채택합니다.

1. **텍스트 & 벡터 데이터 (Neon Serverless Postgres)**:

   * 시험 세션 기록, 출제된 질문 텍스트, 768차원 질문 임베딩 벡터, Gemini 평가 결과 JSON, 학습 연속일(Streak) 정보를 저장합니다.

   * Neon 무료 티어(0.5GB)만으로도 10만 건 이상의 세션 및 벡터 데이터를 영구 보관할 수 있습니다.

2. **오디오 녹음 데이터 (Browser IndexedDB via Dexie.js)**:

   * 수험생의 실제 발화 음성(`audio/webm` 또는 `audio/mp4` Blob)은 **브라우저 로컬 저장소인 IndexedDB**에 직접 저장합니다.

   * **장점**:

     * 클라우드 스토리지 전송 트래픽 \$0, 스토리지 용량 과금 $0.

     * 로컬 디스크 I/O로 동작하므로 복습 시 오디오 로딩 딜레이 0ms.

     * 외부 클라우드에 내 목소리가 업로드되지 않는 완벽한 프라이버시 보장.

     * 모바일 PWA 환경에서도 1GB 이상의 음성 녹음 데이터 보관 가능(Quota 한도 내).

### 4.3 Antigravity 멀티 에이전트 파이프라인

1. **Orchestrator Agent**:

   * 시험 모드(IELTS vs TOEIC)의 상태 머신(State Machine) 총괄.

   * 타이머 이벤트(준비 완료, 발화 시간 종료) 수신 시 다음 스테이지로 강제 전이.

2. **Topic Curator Agent**:

   * 사용자의 `user_learning_profile`을 조회하여 최근 빈출 주제를 배제하고 온톨로지에서 새로운 쟁점을 선택.

   * Neon `pgvector` 코사인 유사도 검사($\text{Similarity} < 0.72$) 통과 후 최종 질문 확정.

3. **Examiner Persona Agent (Gemini 1.5 Pro)**:

   * 엄격하고 전문적인 원어민 시험관 페르소나 유지. 불필요한 감정적 추임새 배제.

   * 수험생의 발화 수준에 맞춰 파생 질문(Follow-up Question)을 동적으로 전개.

4. **Evaluator Agent (Gemini 1.5 Flash)**:

   * 수험생의 발화 전문(STT Transcript)을 입력받아 즉각적인 구조적 채점 리포트 발행.

   * 반드시 **JSON 스키마**로 파싱하여 클라이언트에 구조화된 카드 UI로 렌더링.

### 4.4 Evaluator Agent 시스템 프롬프트 명세 (JSON Schema Enforced)

```
You are an elite, certified IELTS Speaking Senior Examiner.
Evaluate the candidate's transcript strictly against the official IELTS 9-band descriptors.

[CANDIDATE TRANSCRIPT]
{{candidate_transcript}}

[TARGET PART & QUESTION]
{{current_question}}

[OUTPUT FORMAT SPECIFICATION]
Return ONLY a valid JSON object matching this schema:
{
  "scores": {
    "fluency_and_coherence": { "band": 6.5, "justification": "..." },
    "lexical_resource": { "band": 6.0, "justification": "..." },
    "grammatical_range_accuracy": { "band": 6.0, "justification": "..." },
    "pronunciation_estimate": { "band": 6.5, "justification": "..." },
    "overall_band": 6.5
  },
  "critical_weaknesses": [
    "Over-reliance on 'I think' and 'more and more'",
    "Failure to execute third conditional clause correctly"
  ],
  "lexical_enhancements": [
    { 
      "original": "a lot of cars cause pollution", 
      "upgraded": "the proliferation of private vehicles exacerbates environmental degradation" 
    }
  ],
  "model_answer_band_8_5": "...",
  "suggested_next_focus": "Practice concession clauses (e.g., Albeit, Notwithstanding)"
}

```

## 5. 기술 스택 및 개발 스펙 (Tech Stack & Specifications)

### 5.1 계층별 기술 스택 명세

| 계층 | 기술 스택 | 선정 이유 | 
 | ----- | ----- | ----- | 
| **Frontend** | **Next.js 15 (App Router)** + Tailwind CSS + shadcn/ui | 빠른 PWA 구축, Server Actions 지원, 초경량 컴포넌트 아키텍처 | 
| **Mobile PWA** | `next-pwa` + Web App Manifest | 앱스토어 심사 및 수수료 없이 모바일 홈 화면 추가로 100% 네이티브 경험 제공 | 
| **Client Audio Storage** | **Dexie.js (IndexedDB Wrapper)** | 발화 음성 Blob을 로컬에 영구 보관. 트래픽 \$0, 무지연 즉시 재생 보장 | 
| **Audio Processing** | **Web Audio API** + AudioWorklet + Web Worker Timer | 모바일 백그라운드 탭에서도 밀리지 않는 정확한 시험 타이머 및 음질 보정 | 
| **STT Engine** | **Web Speech API** (기본) / Whisper Cloud (옵션) | 무료 기본 탑재 STT로 비용 제로화, 모바일 브라우저 네이티브 가속 | 
| **Cloud Database** | **Neon (Serverless Postgres + pgvector)** | Supabase 대체 1순위. 완전 관리형 Postgres, pgvector 기본 내장, Scale-to-Zero 지원 | 
| **AI LLM Engine** | **Gemini 1.5 Pro & Gemini 1.5 Flash** | 시험관 대화(Pro의 고지능 심층 반론) 및 채점(Flash의 초고속 JSON 파싱) 분업화 | 
| **Embedding Engine** | **Google text-embedding-004** | 768차원 고밀도 시맨틱 임베딩. 코사인 유사도 기반 중복 질문 원천 필터링 | 
| **Agent Framework** | **Google Antigravity Agent Runtime** | 멀티 에이전트 상태 머신 및 오케스트레이션 파이프라인 관리 | 
| **Hosting & Deploy** | **Vercel Hobby Tier** | Next.js 최적화 배포, Neon 원클릭 환경 변수 바인딩, \$0 무료 호스팅 | 

## 6. 데이터베이스 스키마 및 클라이언트 스토리지 설계

### 6.1 Neon Serverless PostgreSQL DDL 스키마

Neon 대시보드의 SQL Editor에 즉시 실행할 수 있는 DDL입니다.

```
-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 사용자 학습 프로필 테이블 (취약점 및 레벨 추적)
CREATE TABLE user_learning_profiles (
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
CREATE TABLE question_history (
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
CREATE INDEX idx_question_history_embedding 
ON question_history 
USING hnsw (embedding vector_cosine_ops);

-- 4. 시험 세션 및 채점 피드백 테이블
CREATE TABLE evaluation_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES user_learning_profiles(user_id) ON DELETE CASCADE,
    question_id UUID REFERENCES question_history(id),
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

```

### 6.2 클라이언트 IndexedDB 스키마 (Dexie.js)

클라이언트 브라우저 로컬에 오디오 파일을 저장하는 구조입니다.

```
// lib/db/localAudioStore.ts
import Dexie, { Table } from 'dexie';

export interface LocalAudioRecord {
  id?: number;
  session_uuid: string; // Neon evaluation_sessions.id 와 매핑
  question_id: string;
  audio_blob: Blob;     // 원본 음성 녹음 파일 (audio/webm)
  mime_type: string;
  duration_seconds: number;
  recorded_at: Date;
}

export class SpeakWiseLocalDatabase extends Dexie {
  audioRecords!: Table<LocalAudioRecord, number>;

  constructor() {
    super('SpeakWiseLocalDB');
    this.version(1).stores({
      audioRecords: '++id, session_uuid, question_id, recorded_at'
    });
  }
}

export const localDB = new SpeakWiseLocalDatabase();

```

## 7. 월간 인프라 비용 및 개발 일정 (Budget & Roadmap)

### 7.1 월간 예상 운영 비용 (1인 사용 기준)

| 리소스 | 서비스 및 플랜 | 산출 근거 | 월 비용 | 
 | ----- | ----- | ----- | ----- | 
| **메인 DB & pgvector** | **Neon (Free Tier)** | 0.5GB 스토리지, Scale-to-Zero. 1인 텍스트/벡터 데이터로는 평생 무제한급 | **\$0** | 
| **음성 파일 저장소** | **Browser IndexedDB** | 사용자 기기 로컬 디바이스 저장소 활용 (클라우드 송수신 트래픽 0원) | **\$0** | 
| **LLM & 에이전트** | **Gemini 1.5 Flash / Pro** | Google AI Studio Free Tier (분당 15 RPM 무료 제공으로 1인 충분) | **\$0** | 
| **임베딩 API** | **text-embedding-004** | 일일 1,500회 무료 임베딩 요청 지원 | **\$0** | 
| **프론트엔드 호스팅** | **Vercel (Hobby Tier)** | PWA 정적 빌드 및 Edge Server Actions 무료 호스팅 | **\$0** | 
| **음성인식(STT)** | **Web Speech API** | 브라우저 내장 하드웨어 가속 음성 인식 엔진 사용 | **\$0** | 
| **총합계 (Total)** | **모든 인프라 Free Tier 완벽 조합** | **월 추가 지출 0원 (완전 무료)** | **\$0 / 월** | 

*고품질 클라우드 음성 합성(Google Cloud Neural TTS) 옵션을 적용할 경우에도 월 \$1.00 내외로 해결됩니다.*

### 7.2 4주 개발 로드맵 (Vibe Coding Milestone)

```
[Week 1: Neon DB & AI 에이전트 엔진]
  ├─ Neon Postgres 인스턴스 생성 및 pgvector DDL 마이그레이션
  ├─ Topic Curator Agent: 온톨로지 매트릭스 + pgvector 중복 방지 필터 구축
  └─ Evaluator Agent: Gemini 1.5 Flash 기반 JSON 스키마 검증기 완성

[Week 2: Next.js 미니멀 PWA & 오디오 엔진]
  ├─ Next.js 15 PWA 기본 보일러플레이트 구축 (Tailwind + shadcn/ui)
  ├─ Web Audio API + AudioWorklet 고음질 녹음 모듈 구현
  └─ Dexie.js 기반 IndexedDB 로컬 오디오 Blob 저장/재생 파이프라인 연동

[Week 3: 시험 규격 상태 머신 & 인터랙션 구현]
  ├─ IELTS 모드: Part 1~3 시퀀스 및 Part 2 (1분 준비 / 2분 발화) 타이머 동기화
  ├─ TOEIC 모드: 11문항별 비프음(Beep) 알림 및 제한시간 자동 전이 상태 머신
  └─ Web Worker 기반 백그라운드 타이머 구현 (모바일 화면 잠금/탭 전환 대응)

[Week 4: 실전 도그푸딩, UI 폴리싱 및 배포]
  ├─ Vercel 원클릭 배포 및 모바일 기기(iOS Safari / Android Chrome) PWA 설치
  ├─ 실제 모의고사 5회분 연속 스피킹 테스트 및 채점 피드백 튜닝
  └─ Streak 잔디심기 캘린더 및 취약 표현 복습 카드 UI 완성

```

## 8. 모바일 웹 브라우저 엣지 케이스 및 대응 전략

1. **iOS Safari의 오디오 자동 재생 제한(Autoplay Restriction)**:

   * **원인**: iOS 정책상 사용자 인터랙션(터치/클릭) 없이 백그라운드나 API 콜백에서 오디오(TTS, 비프음)를 자동 재생할 수 없음.

   * **해결책**: 시험 시작(`Start Exam`) 버튼을 누르는 최초 제스처 시점에 빈 오디오 버퍼(`silent audio buffer`)를 1회 재생하여 `AudioContext`를 `running` 상태로 영구 잠금 해제(Unlock).

2. **모바일 탭 비활성화 시 JavaScript 타이머 스로틀링(Throttling)**:

   * **원인**: 브라우저가 백그라운드로 전환되면 배터리 절약을 위해 `setInterval`/`setTimeout` 주기를 1,000ms 이상으로 강제 지연시켜 시험 타이머 오차 발생.

   * **해결책**: 메인 스레드 대신 브라우저 백그라운드에서도 정밀 클럭을 유지하는 **Dedicated Web Worker**를 생성하여 초 단위 타이머 이벤트를 수신.

3. **STT 연결 끊김 및 네트워크 불안정**:

   * **원인**: Web Speech API가 긴 무음 상태에서 예기치 않게 세션을 종료하는 현상.

   * **해결책**: AudioWorklet의 VAD(Voice Activity Detection)로 발화 여부를 모니터링하고, 시험 답변 시간 종료 플래그가 발생하기 전까지 STT 인스턴스가 꺼지면 자동으로 `recognition.start()`를 재호출(Re-bind)하는 자동 복구 로직 장착.