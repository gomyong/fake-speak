# FAKE_SPEAK 통합 기능 및 기술 명세서 (Full Product & Technical Specification)

> **문서 버전**: v2.1.0  
> **최종 갱신일**: 2026-09-23  
> **프로젝트 저장소**: [https://github.com/gomyong/fake-speak.git](https://github.com/gomyong/fake-speak.git)  
> **작성 기준**: 프로젝트 초기 설계부터 현재 구현된 전 기능(모의고사 + 파트별 훈련소 + 5대 상용 스피킹 학습 시스템) 총망라

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1 서비스 정의
**FAKE_SPEAK**는 IELTS 및 TOEIC Speaking 수험생을 위한 **AI 기반 실전 모의고사 시뮬레이터이자 6단계 체화 스피킹 훈련소(Training Lab)**입니다.

### 1.2 핵심 개발 철학
1. **듀얼 트랙 시스템 (Dual-Track)**:
   - **실전 모의고사 (Exam Simulation)**: 실제 시험과 100% 동일한 규격 타이머, 오디오 신호음(비프음), 무음성 방어 로직, 공식 4대 루브릭 채점 제공.
   - **파트별 훈련소 (Training Lab)**: 단순히 점수만 주는 것을 넘어, 영어가 입에서 튀어나오도록 훈련시키는 6단계 체화 파이프라인 제공.
2. **상용 서비스 수준의 완성도 (Commercial-Grade)**:
   - 스픽(Speak), ELSA Speak, 링글(Ringle)의 검증된 학습 메커니즘을 벤치마킹하여 **3단계 패러프레이징, 정량적 발화 지표(WPM/필러/어휘 다양성), PREP 논리 빌더, AI 꼬리 질문, 에빙하우스 망각곡선(SRS)**을 유기적으로 통합.
3. **Boro UI 미니멀리즘 디자인 시스템**:
   - 따뜻한 갤러리 감성의 Warm Gallery(`#fcf8f8`), 무광 블랙(`#080909`), 일렉트릭 블루(`#0050d7`), 24px 부드러운 곡률(`rounded-3xl`), 헤어라인 보더 적용.

---

## 2. 기술 스택 및 개발 환경 (Tech Stack)

| 구분 | 기술 / 라이브러리 | 버전 / 상세 | 역할 및 용도 |
| :--- | :--- | :--- | :--- |
| **언어 (Language)** | **TypeScript** | `v5.x` | 클라이언트 및 서버 전체 타입 안정성 보장 |
| **코어 프레임워크** | **Next.js** | `v15.5.25` | App Router 기반 SSR/SSG 및 API Route Handlers |
| **UI 라이브러리** | **React** | `v19.x` | 최신 훅 기반 리액티브 UI 구성 |
| **스타일링** | **Tailwind CSS** | `v3.4` | Boro UI 디자인 토큰 및 반응형 유틸리티 클래스 |
| **아이콘** | **Lucide React** | 최신 | 미니멀 라인 아이콘 시스템 |
| **AI / LLM 엔진** | **Google Gemini 2.0 Flash** | `gemini-2.0-flash` | 실시간 스피킹 채점, 3단계 패러프레이징, AI 꼬리 질문 생성 |
| **AI 임베딩** | **Text-Embedding-004** | `text-embedding-004` | 768차원 질문 및 답변 벡터 임베딩 생성 |
| **데이터베이스** | **Neon PostgreSQL** | Serverless | 클라우드 관계형 DB |
| **벡터 확장** | **pgvector** | `0.7+` | 768차원 코사인 유사도 검색 (`match_question_similarity`) |
| **음성 합성 (TTS)** | **Web Speech API** | `SpeechSynthesis` | 원어민 발음 재생, 속도 제어(0.8x / 1.0x / 1.2x) |
| **음성 인식 (STT)** | **Web Speech API** | `SpeechRecognition` | 실시간 사용자 발화 텍스트 변환 및 Interim 표시 |
| **오디오 캡처** | **MediaRecorder API** | Web Audio API | 마이크 음성 캡처, 녹음 Blob 생성 및 오디오 재생 |
| **사운드 효과** | **Web Audio Context** | OscillatorNode | 880Hz / 440Hz 실전 시험용 비프음 합성 |
| **로컬 스토리지** | **LocalStorage & IndexedDB** | Web Storage | 망각곡선 취약 청크(SRS) 저장, 오디오 Blob 영속화 |

---

## 3. 시스템 아키텍처 및 데이터 흐름도

```mermaid
flowchart TD
    subgraph Client ["Client (Browser - Next.js 15 / React 19)"]
        UI["Boro UI Component Layer"]
        STT["Web Speech STT (SpeechRecognition)"]
        TTS["Web Speech TTS (SpeechSynthesis)"]
        AudioRec["MediaRecorder (User Voice Blob)"]
        BeepEngine["Web Audio Oscillator (Beep Signals)"]
        SRSStore["WeakChunkStore (LocalStorage/IndexedDB)"]
        AnalyticsEngine["speechAnalytics.ts (WPM / Fillers / TTR)"]
    end

    subgraph Server ["Next.js Serverless Route Handlers"]
        EvalAPI["/api/evaluate"]
        ParaAPI["/api/train/paraphrase"]
        FollowAPI["/api/train/followup"]
        CuratorAPI["/api/curator"]
    end

    subgraph AI_Engine ["Google Cloud AI"]
        GeminiFlash["Gemini 2.0 Flash (Fast Reasoning)"]
        Embedding["text-embedding-004 (768-dim)"]
    end

    subgraph Database ["Neon Serverless DB"]
        Postgres["PostgreSQL Tables"]
        PgVector["pgvector Extension (Cosine Distance)"]
    end

    %% Client Interactions
    UI --> STT
    UI --> TTS
    UI --> AudioRec
    UI --> BeepEngine
    AudioRec --> AnalyticsEngine
    AnalyticsEngine --> UI

    %% Server Calls
    UI -->|POST Transcript & Rubrics| EvalAPI
    UI -->|POST Candidate Text| ParaAPI
    UI -->|POST Answer Context| FollowAPI
    UI -->|Weak Chunks (<75%)| SRSStore

    %% AI Integrations
    EvalAPI --> GeminiFlash
    ParaAPI --> GeminiFlash
    FollowAPI --> GeminiFlash
    CuratorAPI --> Embedding

    %% Database Integrations
    CuratorAPI --> PgVector
    EvalAPI --> Postgres
```

---

## 4. 전체 기능 상세 명세

### 4.1 실전 모의고사 모듈 (Exam Simulation)

실제 시험장 환경을 동일하게 재현하여 실전 압박감을 극복하도록 설계된 시뮬레이터입니다.

#### ① IELTS Speaking 시뮬레이터 (`/exam/ielts`)
- **Part 1 (개인 인터뷰)**: 일상 주제(고향, 취미, 학업/직업 등) 4~5개 질문 질의응답.
- **Part 2 (Long Turn Cue Card)**: 
  - 1분 준비 시간(메모 타이머) $\rightarrow$ 2분 연속 발화 타이머 자동 전환.
  - 전환 시점 정확한 880Hz 비프 신호음 발생.
- **Part 3 (심층 토론)**: Part 2 주제와 연계된 추상적/사회적 심층 토론.
- **무음성/단답 방어 로직**:
  - 발화 단어가 3개 미만이거나 음성이 감지되지 않을 경우 무조건 **Band 0.0**을 부여하고 *"마이크 연결 상태를 확인하고 명확하게 발화해 주세요"* 경고 표시.
- **채점 기준**: IELTS 공식 4대 루브릭 기반 0.0 ~ 9.0 밴드 산출.
  - `Fluency and Coherence (유창성과 일관성)`
  - `Lexical Resource (어휘 다양성)`
  - `Grammatical Range and Accuracy (문법적 범위와 정확도)`
  - `Pronunciation Estimate (발음 및 억양 명확도)`

#### ② TOEIC Speaking 시뮬레이터 (`/exam/toeic`)
- **전 11문항 공식 포맷 자동 전환**:
  - Q1-Q2 (문장 읽기): 45초 준비 / 45초 발화
  - Q3-Q4 (사진 묘사): 45초 준비 / 30초 발화
  - Q5-Q7 (듣고 질문에 답하기): 3초 준비 / 15초(Q5, Q6), 30초(Q7) 발화
  - Q8-Q10 (제공된 정보 보고 답하기): 45초 지문 읽기 / 3초 준비 / 15초(Q8, Q9), 30초(Q10) 발화
  - Q11 (의견 제시하기): 45초 준비 / 60초 발화
- **타이머 & 오디오 제어**:
  - 카운트다운 시작 시 단 1회 비프음 재생 (`hasPlayedStartBeepRef` 잠금).
  - 사용자가 효과음을 끌 수 있는 **음소거(Mute) 토글 스위치** 탑재.

---

### 4.2 파트별 훈련소 모듈 (Training Lab)

시험 전 발화 능력 자체를 비약적으로 상승시키는 6단계 체화 훈련 시스템입니다.

#### [Step 1] Chunking & 모범 답변 분석 (`ChunkViewer.tsx`)
- 문장을 의미 단위(청크)로 쪼개어 시각적으로 배치.
- 청크별 개별 TTS 음성 청취 (속도: 0.8x / 1.0x / 1.2x 조절).
- 핵심 표현(Key Chunks) 하이라이트 및 한국어 1:1 매칭 해설 제공.

#### [Step 2] 쉐도잉 훈련 (`ShadowingPlayer.tsx`)
- 원어민 음성을 재생하고 0.4초 후 마이크를 활성화하여 즉시 따라 말하는 훈련.
- 발화 중인 단어와 일치하는 원문 단어가 실시간으로 초록색으로 하이라이트.
- 녹음 완료 즉시 모범 답변과의 **단어 일치율(정확도 %)** 산출.
- **SRS 자동 연동**: 일치율이 75% 미만인 경우, 해당 문장의 핵심 청크가 `WeakChunkStore`에 자동 저장.

#### [Step 3] 블라인드 리콜 (`BlindRecallRecorder.tsx`)
- 스크립트를 보지 않고 기억에 의존하여 말하는 인출 훈련(Retrieval Practice).
- 3단계 가림 모드 지원:
  - **완전 가리기(Full Blind)**: 한국어 의미만 보고 영문 전체 발화.
  - **빈칸 힌트(Cloze)**: 핵심 청크 위치에 `[한국어 힌트]` 빈칸 제공.
  - **답변 보기(Show)**: 전체 스크립트 노출.
- 발화 후 정답 원문과 1:1 대조 및 Gemini 맞춤 피드백 제공.

#### [Step 4] PREP 논리 프레임워크 빌더 (`PrepFrameworkBuilder.tsx`)
- IELTS Part 3 및 토익스피킹 Q11(의견 제시)을 위한 4단계 구조화 스피치 구성기:
  - **P (Point, 결론/주장)**: *"To begin with, I strongly advocate that..."*
  - **R (Reason, 근거/이유)**: *"The fundamental rationale behind this is that..."*
  - **E (Example, 구체적 사례)**: *"For instance, in my personal experience..."*
  - **P (Point, 요약/재강조)**: *"Consequently, it is evident that..."*
- 각 단계별 추천 시작 어구(Sentence Starters) 칩 클릭 시 즉시 삽입.
- 단계별 마이크 녹음 및 실시간 STT.
- 4단계 완료 시 전체 스피치를 하나로 결합하고 **Gemini가 논리 일관성(Coherence) 종합 검증**.

#### [Step 5] 3단계 패러프레이징 사다리 (`ParaphrasingLadder.tsx`)
- 사용자의 발화 문장을 AI가 3개 티어로 실시간 업그레이드:
  - **Level 1 (Good - Band 5.5~6.0)**: 기초 문법 교정 중심의 명확한 전달.
  - **Level 2 (Better - Band 6.5~7.0)**: 복문, 종속절, 논리적 연결사(Discourse Markers)가 적용된 고득점형.
  - **Level 3 (Native / Idiomatic - Band 7.5~8.5+)**: 원어민 관용구, 세련된 Collocation, 풍부한 어휘가 가미된 최상위형.
- 각 티어별 원어민 TTS 듣기 지원.
- **"이 문장으로 쉐도잉 훈련하기"** 클릭 시 Step 2(Shadowing)로 즉시 전송되어 반복 훈련.
- 점수 상승 포인트 및 사용된 패턴 태그 제공.

#### [Step 6] 표현 치환 훈련 (`SubstitutionDrill.tsx`)
- 모범 답변의 문장 뼈대(Framework)는 유지하되, 핵심 단어(예: 기술 $\rightarrow$ 대중교통, 공원 $\rightarrow$ 재래시장)를 자신의 실제 경험으로 교체하여 발화하는 순발력 훈련.

---

### 4.3 AI 실시간 음성 분석 엔진 (`SpeechAnalyticsCard.tsx` / `speechAnalytics.ts`)

녹음 완료 즉시 발화 데이터를 음향학적/언어학적으로 분석하는 대시보드입니다.

1. **말하기 속도 (WPM, Words Per Minute)**:
   - `wpm = (단어수 / 발화시간(초)) * 60`
   - 게이지 바 및 5단계 상태 판정: `TOO_SLOW` (<85), `SLIGHTLY_SLOW` (85~115), `OPTIMAL` (115~155), `FAST` (155~175), `TOO_FAST` (>175).
   - IELTS/토익스피킹 이상적 속도(120~150 WPM) 가이드 제공.
2. **필러 워드 (Filler Words, 불필요한 추임새) 카운터**:
   - `um`, `uh`, `er`, `ah`, `like`, `you know`, `i mean`, `basically`, `actually`, `sort of`, `kind of` 감지.
   - 발화 텍스트에 붉은색 배지 하이라이트 및 총 감지 횟수, 발화 대비 비율(%) 산출.
3. **어휘 다양성 지수 (TTR: Type-Token Ratio)**:
   - `TTR = 고유 단어 수 / 전체 단어 수`
   - 어휘 풍부도 평가 (`LIMITED` / `MODERATE` / `RICH` / `EXCEPTIONAL`).
   - 과도하게 중복 사용된 기초 어휘(`good`, `bad`, `think`, `very`, `important`, `many`, `make`, `big`, `people` 등)를 추출하고, **Band 7.5+ 추천 유의어 칩(Synonym Chips)**을 제공하여 탭 한 번으로 적용 지원.

---

### 4.4 AI 면접관의 돌발 꼬리 질문 (`FollowUpInterviewer.tsx` / `/api/train/followup`)

- **기능**: 사용자의 발화 내용을 분석하여 실제 시험관처럼 논리적 허점을 짚거나 반대 관점을 묻는 돌발 꼬리 질문 1개를 즉석 생성.
- **오디오 자동 재생**: 꼬리 질문이 생성되면 TTS로 자동 음성 재생.
- **시간 벌기 (Buying-Time) 담화 표지어 가이드**:
  - 갑작스러운 질문에 당황하지 않고 3초를 벌 수 있는 실전 표현 칩 제공 (클릭 시 발음 청취).
  - 예: *"Well, that is certainly a compelling counter-argument, but from where I stand..."*
- **즉흥 답변 (Spontaneous Speaking) 녹음 & AI 평가**:
  - 즉시 녹음 $\rightarrow$ 순발력과 논리 방어력에 대한 AI 피드백 제공.

---

### 4.5 에빙하우스 망각곡선 취약 청크 오답노트 (`weakChunkStore.ts` / `WeakChunkReviewModal.tsx`)

- **작동 원리 (SuperMemo / Leitner 5단계 알고리즘)**:
  - 훈련 중 일치율 75% 미만인 청크가 자동으로 로컬 영속 스토어에 등록.
  - 복습 주기: 당일(Lv.0) $\rightarrow$ 1일 후(Lv.1) $\rightarrow$ 3일 후(Lv.2) $\rightarrow$ 7일 후(Lv.3) $\rightarrow$ 14일 후(Lv.4) $\rightarrow$ 마스터(Lv.5).
  - 복습 시 80% 이상 일치하면 다음 레벨로 승급, 실패 시 레벨 0으로 초기화.
- **사용자 경험 (UX)**:
  - 대시보드 및 훈련소 상단에 **"오늘 복습할 취약 청크 N개 대기 중"** 알림 배너 노출.
  - **[1분 퀵 복습 시작]** 탭 시 플래시카드 모달 실행 $\rightarrow$ 오디오 듣기 $\rightarrow$ 마이크 발화 $\rightarrow$ 일치율 채점 $\rightarrow$ 주기 자동 갱신.

---

## 5. 데이터베이스 스키마 및 백엔드 API 명세

### 5.1 데이터베이스 스키마 (`lib/db/schema.sql`)

```sql
-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 문제 및 큐카드 테이블 (768차원 임베딩)
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(64) PRIMARY KEY,
  exam_type VARCHAR(16) NOT NULL, -- 'IELTS' | 'TOEIC'
  section VARCHAR(32) NOT NULL,   -- 'PART_1', 'PART_2', 'Q3', 'Q11' 등
  topic VARCHAR(128) NOT NULL,
  question_text TEXT NOT NULL,
  strategy_tip TEXT,
  model_answer TEXT,
  embedding vector(768),          -- text-embedding-004
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 코사인 유사도 기반 문제 매칭 함수
CREATE OR REPLACE FUNCTION match_question_similarity (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id VARCHAR(64),
  exam_type VARCHAR(16),
  section VARCHAR(32),
  question_text TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.id,
    q.exam_type,
    q.section,
    q.question_text,
    1 - (q.embedding <=> query_embedding) AS similarity
  FROM questions q
  WHERE 1 - (q.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
```

---

### 5.2 백엔드 API 엔드포인트 명세

| 엔드포인트 | 메서드 | 요청 바디 (JSON) | 응답 데이터 (JSON) | 비고 |
| :--- | :--- | :--- | :--- | :--- |
| `/api/evaluate` | `POST` | `examType`, `partOrQuestion`, `questionText`, `transcript`, `durationSeconds` | `scores` (FC, LR, GRA, PR, overall), `critical_weaknesses`, `lexical_enhancements`, `model_answer_band_8_5` | 3단어 미만/무음성 시 Band 0.0 즉시 반환 |
| `/api/train/paraphrase` | `POST` | `text`, `questionText`, `examType` | `tiers`: { `level1_good`, `level2_better`, `level3_native` } | 3단계 문장 변환 및 패턴 설명 |
| `/api/train/followup` | `POST` | `questionText`, `transcript`, `examType` | `followupQuestion`, `followupQuestionKo`, `examinerIntent`, `buyingTimePhrases`, `modelResponseHint` | 실시간 압박 꼬리 질문 생성 |
| `/api/curator` | `POST` | `queryText`, `examType` | `matchedQuestions`: Array<{ id, question_text, similarity }> | pgvector 768d 코사인 검색 |

---

## 6. 프로젝트 디렉토리 및 파일 구조 맵

```
/Users/mac/Documents/영어공부앱
├── app/
│   ├── api/
│   │   ├── curator/route.ts          # pgvector 기반 문제 유사도 검색 엔드포인트
│   │   ├── evaluate/route.ts         # Gemini 2.0 Flash 시험 채점 엔드포인트
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
│   │   ├── ExamTimer.tsx             # 규격 타이머, 비프음 제어, Mute 버튼
│   │   └── MicrophoneButton.tsx      # 마이크 입력 및 녹음 시각화
│   ├── feedback/
│   │   ├── AudioReviewPlayer.tsx     # 내 발화 다시 듣기 오디오 플레이어
│   │   └── EvaluationReport.tsx      # 공식 루브릭 점수 및 AI 피드백 뷰어
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
├── lib/
│   ├── ai/
│   │   ├── gemini.ts                 # Gemini 2.0 Flash 및 임베딩 클라이언트
│   │   ├── evaluator.ts              # IELTS/TOEIC 루브릭 채점 및 휴리스틱 엔진
│   │   └── speechAnalytics.ts        # WPM, 필러 정규식, TTR, 고득점 유의어 매핑
│   ├── audio/
│   │   ├── soundEffects.ts           # Web Audio 880Hz/440Hz 비프 신호음 합성기
│   │   ├── useAudioRecorder.ts       # MediaRecorder 오디오 녹음 훅
│   │   ├── useSpeechRecognition.ts   # Web Speech API 음성인식(STT) 훅
│   │   └── useTextToSpeech.ts        # Web Speech API 원어민 음성합성(TTS) 훅
│   ├── constants/
│   │   ├── curriculum.ts             # IELTS/TOEIC 파트별 문장, 청크, 전략 데이터셋
│   │   └── topics.ts                 # 모의고사 출제 문항 데이터
│   └── db/
│       ├── localAudioStore.ts        # IndexedDB 오디오 Blob 및 평가 기록 로컬 저장소
│       ├── neon.ts                   # Neon Serverless PostgreSQL 클라이언트
│       ├── schema.sql                # DB 스키마 및 pgvector 함수 정의
│       └── weakChunkStore.ts         # 에빙하우스 망각곡선(SRS) 취약 청크 관리자
├── package.json                      # 의존성 및 실행 스크립트 정의
├── tsconfig.json                     # TypeScript 컴파일 설정
└── tailwind.config.ts                # Boro UI 컬러 및 곡률 테마 설정
```

---

## 7. 향후 확장 로드맵 (Future Roadmap)

1. **사용자 음성 피치/인토네이션 시각화 (Pitch Contour)**:
   - Web Audio AnalyserNode를 활용하여 원어민 억양 곡선과 사용자 억양 곡선을 시각적으로 겹쳐 비교하는 피치 트래커 도입.
2. **모바일 PWA (Progressive Web App) 오프라인 모드**:
   - Service Worker 캐싱을 통해 네트워크가 없는 환경에서도 로컬 휴리스틱 모드로 쉐도잉 및 블라인드 리콜 가능하도록 확장.
3. **학습자 맞춤형 주제 자동 큐레이션 (Personalized Weakness Targeting)**:
   - 사용자가 자주 감점되는 특정 루브릭(예: Grammatical Range) 문항만 pgvector를 통해 집중 추천하는 알고리즘 고도화.
