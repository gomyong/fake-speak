# FAKE_SPEAK 통합 제품 및 기술 명세서 (Product & Technical Specification)

> **문서 버전**: v2.2.0 (Verified & Synchronized)  
> **최종 갱신일**: 2026-09-23  
> **공식 저장소**: [https://github.com/gomyong/fake-speak.git](https://github.com/gomyong/fake-speak.git)  
> **상태**: 실제 코드베이스(`main` 브랜치)와 100% 일치하도록 검증 및 동기화 완료

---

## 1. 프로젝트 개요 (Executive Summary)

**FAKE_SPEAK**는 IELTS 및 TOEIC Speaking 수험생을 위한 **AI 실전 모의고사 시뮬레이터**이자 **6단계 체화 스피킹 훈련소(Training Lab)**를 통합한 고성능 웹 애플리케이션입니다.

### 1.1 핵심 가치 및 듀얼 트랙 구조
1. **실전 모의고사 (Exam Simulation)**:
   - IELTS(Part 1, 2, 3) 및 TOEIC Speaking(Q1~Q11)의 공식 시험 규격(타이머, 오디오 신호음, 무음성 방어 로직)을 100% 재현.
   - 시험관 공식 4대 루브릭(Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation) 기반 채점.
2. **파트별 훈련소 (Training Lab)**:
   - 단순히 점수만 확인하는 것을 넘어 실제 발화 능력을 향상시키는 **6단계 체화 학습 파이프라인**:
     - `청크(Chunking) 분석` $\rightarrow$ `쉐도잉(Shadowing) & WPM 진단` $\rightarrow$ `블라인드 리콜(Blind Recall)` $\rightarrow$ `PREP 논리 빌더` $\rightarrow$ `3단계 패러프레이징` $\rightarrow$ `표현 치환(Substitution Drill)`.
3. **5대 상용 서비스 수준 학습 시스템**:
   - **3단계 패러프레이징 사다리**: Good(5.5) $\rightarrow$ Better(6.5) $\rightarrow$ Native(7.5+) 실시간 문장 업그레이드.
   - **실시간 정량 스피킹 지표**: WPM(말하기 속도), 필러 워드(um, like 등) 감지 배지, 어휘 다양성(TTR) 및 유의어 칩.
   - **PREP 논리 프레임워크 빌더**: Point $\rightarrow$ Reason $\rightarrow$ Example $\rightarrow$ Point 4단 구조화 스피치 구성.
   - **AI 면접관 돌발 꼬리 질문**: 실시간 반론/압박 질문 생성 및 시간 벌기(Buying-time) 담화 표지어 가이드.
   - **에빙하우스 망각곡선 취약 청크 오답노트(SRS)**: 75% 미만 일치 청크 자동 수집 및 1분 퀵 복습 플래시카드.
4. **Boro UI 디자인 시스템**:
   - Warm Gallery(`#fcf8f8`), Matte Black(`#080909`), Electric Blue(`#0050d7`), 24px 부드러운 곡률(`rounded-3xl`), 헤어라인 보더 적용.

---

## 2. 기술 스택 및 개발 환경 (Tech Stack)

| 계층 | 기술 / 라이브러리 | 버전 | 설명 및 역할 |
| :--- | :--- | :--- | :--- |
| **Language** | **TypeScript** | `^5.0.0` | 클라이언트 및 서버 전체 엄격한 정적 타입 검사 |
| **Framework** | **Next.js** | `^15.1.7` | App Router 기반 하이브리드(SSR / SSG / Route Handlers) 렌더링 |
| **UI Library** | **React** | `^19.0.0` | 최신 훅 기반 리액티브 상태 관리 |
| **Styling** | **Tailwind CSS** | `^3.4.1` | Boro UI 디자인 토큰 및 반응형 유틸리티 클래스 |
| **Icons** | **Lucide React** | `^1.16.0` | 미니멀 라인 아이콘 |
| **AI LLM** | **Google Gemini 2.0 Flash** | `gemini-2.0-flash` | 초저지연 공식 루브릭 채점, 패러프레이징, 꼬리 질문 생성 |
| **AI Embedding**| **Text-Embedding-004** | `text-embedding-004` | 질문 및 답변 768차원 벡터 임베딩 생성 |
| **Database** | **Neon PostgreSQL** | Serverless | 클라우드 관계형 DB |
| **Vector Engine**| **pgvector** | `0.7+` | 768차원 코사인 거리 기반 HNSW 인덱스 및 유사도 검색 |
| **Local Storage**| **Dexie.js (IndexedDB)** | `^4.0.11` | 사용자 원본 음성 Blob 및 로컬 평가 기록 영속화 (트래픽 $0) |
| **Speech STT** | **Web Speech API** | `SpeechRecognition` | 실시간 사용자 음성 텍스트 변환 (`event.resultIndex` 기반 중복 방지) |
| **Speech TTS** | **Web Speech API** | `SpeechSynthesis` | 원어민 발음 재생 및 속도 제어 (0.8x / 1.0x / 1.2x) |
| **Audio Capture**| **MediaRecorder API** | Native Browser | 마이크 음성 캡처 및 Blob URL 생성 |
| **Sound Synthesis**| **Web Audio API** | `OscillatorNode` | 880Hz / 440Hz 실전 시험 규격 비프음 합성 |

---

## 3. 실제 데이터베이스 스키마 (`lib/db/schema.sql`)

Neon Serverless PostgreSQL에서 실제 운용 중인 테이블과 함수 시그니처입니다:

```sql
-- 1. pgvector 및 uuid 확장 활성화
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

-- 코사인 거리 기반 HNSW 인덱스 (초고속 유사도 검색)
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

-- 5. 코사인 유사도 0.72 미만 고유 질문 검증 함수 (최근 N일 윈도우)
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

---

## 4. 백엔드 API 엔드포인트 명세

### 4.1 `POST /api/evaluate`
공식 루브릭 채점 및 상세 피드백 엔드포인트입니다.

- **요청 바디 (`application/json`)**:
  ```json
  {
    "examType": "IELTS" | "TOEIC",
    "partOrQuestion": "IELTS_PART_1" | "TOEIC_Q11" | string,
    "questionText": "string",
    "transcript": "string",
    "durationSeconds": 45
  }
  ```
- **응답 바디 (`application/json`)**:
  ```json
  {
    "scores": {
      "fluency_and_coherence": { "band": 6.5, "justification": "string" },
      "lexical_resource": { "band": 7.0, "justification": "string" },
      "grammatical_range_accuracy": { "band": 6.0, "justification": "string" },
      "pronunciation_estimate": { "band": 6.5, "justification": "string" },
      "overall_band": 6.5
    },
    "critical_weaknesses": ["string"],
    "lexical_enhancements": [
      { "original": "a lot of people think", "upgraded": "a substantial portion of society advocates" }
    ],
    "model_answer_band_8_5": "string",
    "suggested_next_focus": "string",
    "is_fallback": false
  }
  ```
- **보호 정책**:
  - 발화 단어가 3단어 미만이거나 8자 미만인 경우 즉시 **Band 0.0** 및 마이크 점검 안내 반환.
  - Gemini API 호출 실패 시 `is_fallback: true`로 설정되어 UI 상단에 임시 로컬 분석 알림 배너가 표시됨.

### 4.2 `POST /api/curator`
수험자의 현재 밴드, 취약 문형, 이전 출제 이력을 고려하여 다음 문제를 선정/생성하는 엔드포인트입니다.

- **요청 바디 (`CuratorRequest`)**:
  ```json
  {
    "examType": "IELTS" | "TOEIC",
    "partOrQuestion": "IELTS_PART_2",
    "currentBandEstimate": 6.5,
    "weakGrammarPatterns": ["concession_clauses", "conditional_type_3"],
    "recentTopics": ["topic_tech_01"]
  }
  ```
- **응답 바디 (`CuratedQuestion`)**:
  ```json
  {
    "questionId": "q_172000000_abc123",
    "domainId": "technology_ai",
    "domainName": "기술 및 인공지능",
    "subTopicId": "generative_models",
    "subTopicTitle": "생성형 언어 모델의 사회적 영향",
    "cognitiveLevel": 2,
    "questionText": "Describe an artificial intelligence technology that has significantly influenced your lifestyle.",
    "cueCardPoints": ["What the situation is", "When you first encountered it", "..."],
    "preparationSeconds": 60,
    "responseSeconds": 120,
    "syntacticGapPrompt": "Try using concession clauses like 'Although...' or 'Notwithstanding...'"
  }
  ```
- **시맨틱 중복 방지 로직**:
  - Gemini 2.0 Flash로 질문을 동적 생성하고 768차원 임베딩을 산출.
  - `match_question_similarity`를 통해 코사인 유사도 0.75 이상 충돌 시 최대 3회 재시도 루프를 수행.
  - 최종 결정된 질문과 **정확히 일치하는 임베딩**을 Neon `question_history`에 아카이브.

### 4.3 `POST /api/train/paraphrase`
수험자의 문장을 3단계 고득점 문장으로 변환하는 엔드포인트입니다.

- **요청 바디**: `{ "text": "...", "questionText": "...", "examType": "IELTS" }`
- **응답 바디**:
  - `tiers.level1_good`: Band 5.5~6.0 (기초 문법 교정 중심)
  - `tiers.level2_better`: Band 6.5~7.0 (복문 & 고득점 연결사)
  - `tiers.level3_native`: Band 7.5~8.5+ (원어민 관용구 & 고급 Collocation)

### 4.4 `POST /api/train/followup`
사용자 답변의 논리적 헛점을 짚는 돌발 꼬리 질문 생성 엔드포인트입니다.

- **응답 바디**: `followupQuestion`, `followupQuestionKo`, `examinerIntent`, `buyingTimePhrases` (시간 벌기용 담화 표지어), `modelResponseHint`.

---

## 5. 핵심 컴포넌트 및 클라이언트 아키텍처

### 5.1 오디오 & STT 엔진
- **`lib/audio/useSpeechRecognition.ts`**:
  - `continuous: true`, `interimResults: true` 환경에서 `event.resultIndex`부터 순회하여 **이전 문장이 중복 누적되는 버그를 완벽히 해결**.
  - 컴포넌트 언마운트 시 `shouldListenRef.current = false` 및 `recognition.abort()`를 호출하여 백그라운드 누수 방지.
- **`components/exam/ExamTimer.tsx`**:
  - Web Worker 기반 정밀 카운트다운 타이머.
  - `isMuted` 상태를 `useRef`로 관리하여 **음소거 버튼을 눌러도 타이머가 리셋되지 않음**.
  - 카운트다운 시작 시 단 1회 시작 비프음 재생 (`hasPlayedStartBeepRef`).

### 5.2 발화 분석 & SRS 오답노트
- **`lib/ai/speechAnalytics.ts` & `SpeechAnalyticsCard.tsx`**:
  - **WPM (Words Per Minute)**: 실시간 발화 속도 산출 및 적정 범위(120~150 WPM) 진단.
  - **필러 워드 카운터**: `um`, `uh`, `like`, `you know` 등 12종 추임새 감지 및 붉은 배지 하이라이트.
  - **어휘 다양성 (TTR)**: 고유 단어 비율 평가 및 과다 중복 어휘에 대한 Band 7.5+ 대체 유의어 칩 제공.
- **`lib/db/weakChunkStore.ts` & `WeakChunkReviewModal.tsx`**:
  - 쉐도잉/블라인드 리콜 일치율 75% 미만 청크 자동 수집.
  - **SuperMemo / Leitner 5단계 알고리즘** 기반 망각곡선 복습 주기(0일 $\rightarrow$ 1일 $\rightarrow$ 3일 $\rightarrow$ 7일 $\rightarrow$ 14일 $\rightarrow$ 마스터).
  - 홈 화면 상단 알림 배너 및 1분 퀵 복습 플래시카드 모달 제공.

---

## 6. 프로젝트 디렉토리 맵

```
/Users/mac/Documents/영어공부앱
├── app/
│   ├── api/
│   │   ├── curator/route.ts          # pgvector 기반 문제 선정/생성 엔드포인트
│   │   ├── evaluate/route.ts         # Gemini 2.0 Flash 공식 루브릭 채점 엔드포인트
│   │   └── train/
│   │       ├── followup/route.ts     # AI 면접관 꼬리 질문 생성 엔드포인트
│   │       └── paraphrase/route.ts   # 3단계 패러프레이징 변환 엔드포인트
│   ├── exam/
│   │   ├── ielts/page.tsx            # IELTS 실전 모의고사 (Part 1~3)
│   │   └── toeic/page.tsx            # TOEIC Speaking 실전 모의고사 (Q1~Q11)
│   ├── train/
│   │   ├── ielts/page.tsx            # IELTS 6단계 파트별 훈련소
│   │   └── toeic/page.tsx            # TOEIC 6단계 파트별 훈련소
│   ├── report/[id]/page.tsx          # 모의고사 완료 상세 성적표
│   ├── globals.css                   # Boro UI 글로벌 스타일 & Tailwind 디렉티브
│   ├── layout.tsx                    # 전역 레이아웃 및 폰트 설정
│   └── page.tsx                      # 메인 홈 (대시보드 / 모드 전환 / SRS 복습 배너)
├── components/
│   ├── dashboard/
│   │   └── StreakCalendar.tsx        # 학습 스트릭 잔디 캘린더
│   ├── exam/
│   │   ├── ExamHeader.tsx            # 시험 헤더 및 진행률
│   │   ├── ExamTimer.tsx             # 규격 타이머, 비프음 제어, Mute 버튼 (isMutedRef 적용)
│   │   └── MicrophoneButton.tsx      # 마이크 입력 및 녹음 시각화
│   ├── feedback/
│   │   ├── AudioReviewPlayer.tsx     # 내 발화 다시 듣기 오디오 플레이어
│   │   └── EvaluationReport.tsx      # 공식 루브릭 점수 및 AI 피드백 뷰어 (폴백 배너 포함)
│   └── training/
│       ├── ChunkViewer.tsx           # Step 1: 청크 분할 및 TTS 청취
│       ├── ShadowingPlayer.tsx       # Step 2: 실시간 쉐도잉 & 단어 일치율
│       ├── BlindRecallRecorder.tsx   # Step 3: 가림막 블라인드 스피킹 & AI 대조
│       ├── PrepFrameworkBuilder.tsx  # Step 4: PREP 4단 논리 구조화 스피치 빌더
│       ├── ParaphrasingLadder.tsx    # Step 5: 3단계 패러프레이징 사다리
│       ├── SubstitutionDrill.tsx     # Step 6: 나만의 경험 표현 치환 훈련
│       ├── SpeechAnalyticsCard.tsx   # WPM, 필러 워드, 어휘 다양성(TTR) 대시보드
│       ├── FollowUpInterviewer.tsx   # AI 면접관 돌발 꼬리 질문 및 스톨링 가이드
│       └── WeakChunkReviewModal.tsx  # 1분 퀵 복습 에빙하우스 망각곡선 플래시카드
├── docs/
│   └── archive/
│       └── ielts_toeic_speaking_1_ai_prd.md  # 레거시 PRD 아카이브
├── lib/
│   ├── ai/
│   │   ├── gemini.ts                 # Gemini 2.0 Flash 및 임베딩 클라이언트
│   │   ├── curator.ts                # 문제 선정, Gemini 동적 생성 및 중복 방지
│   │   ├── evaluator.ts              # 공식 루브릭 채점 및 휴리스틱 폴백 엔진
│   │   └── speechAnalytics.ts        # WPM, 필러 정규식, TTR, 고득점 유의어 매핑
│   ├── audio/
│   │   ├── soundEffects.ts           # Web Audio 880Hz/440Hz 비프 신호음 합성기
│   │   ├── useAudioRecorder.ts       # MediaRecorder 오디오 녹음 훅
│   │   ├── useSpeechRecognition.ts   # Web Speech API STT 훅 (resultIndex 중복 방지)
│   │   └── useTextToSpeech.ts        # Web Speech API TTS 훅
│   ├── constants/
│   │   ├── curriculum.ts             # IELTS/TOEIC 파트별 문장, 청크, 전략 데이터셋
│   │   └── topics.ts                 # 모의고사 출제 문항 데이터
│   └── db/
│       ├── localAudioStore.ts        # IndexedDB 오디오 Blob 및 실측 발화 시간 저장소
│       ├── neon.ts                   # Neon Serverless PostgreSQL 클라이언트
│       ├── schema.sql                # DB 스키마 및 pgvector 함수 정의
│       └── weakChunkStore.ts         # 에빙하우스 망각곡선(SRS) 취약 청크 관리자
├── package.json                      # Next.js 15.1.7, React 19 의존성 정의
├── SPECIFICATION.md                  # 본 명세서
└── README.md                         # 리포지토리 메인 안내 문서
```
