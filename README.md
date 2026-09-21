# FAKE_SPEAK

> **Google Antigravity & Gemini 기반 1인 맞춤형 시험 대비 AI 스피킹 웹앱**  
> *(Next.js 15 PWA + Dexie.js IndexedDB + Neon Serverless pgvector + Google Gemini 1.5)*

---

## 1. 프로젝트 개요 (Executive Summary)

**FAKE_SPEAK**은 기존 상용 영어회화 앱의 고질병인 **'주제 및 패턴의 얕은 반복'**, **'난이도 정체(Plateau)'**, 그리고 **'공인 시험 규격(IELTS / TOEIC Speaking)의 불일치'**를 해결하기 위해 개발된 1인 맞춤형 AI 스피킹 연구소입니다.

- **North Star**: *"어제 다뤘던 주제와 문장 구조는 절대 반복하지 않는다. 나의 언어적 한계를 매일 한 걸음씩 넓혀주는 공인 시험관 페르소나 AI 연구소."*
- **비용 $0 제로 인프라**: 음성 녹음 Blob을 브라우저 로컬 **IndexedDB(Dexie.js)**에 영구 보관하여 클라우드 스토리지 전송 트래픽 $0, 레이턴시 0ms, 100% 프라이버시를 실현했습니다.

---

## 2. 핵심 지능 엔진 (4-Core Engines)

1. **다차원 토픽 온톨로지 & 탐색-활용 (Exploration-Exploitation)**:
   - 8대 대분류, 64개 중분류, 256개 심층 쟁점 매트릭스
   - 미탐색 도메인 우선 배정 및 최근 14일 출제 주제 페널티
2. **시맨틱 중복 제거 (Semantic Deduplication)**:
   - `text-embedding-004` (768차원 벡터) 및 Neon `pgvector` 코사인 유사도 연산
   - $\text{Cosine Similarity} \ge 0.72$ 즉시 리젝트 및 재생성
3. **인지 복잡도 사다리 (Cognitive Load & Adaptive Ladder)**:
   - **Level 1 (Descriptive)**: 사실 묘사, 경험 나열 (Band 5.5 - 6.0)
   - **Level 2 (Comparative & Analytical)**: 개념 대조, 트렌드 분석 (Band 6.5 - 7.0)
   - **Level 3 (Counterfactual & Speculative)**: 가정법 혼합 시제, 도치, 가설 평가 (Band 7.5 - 9.0)
4. **취약 문법 편식 파괴 (Syntactic Gap Injection)**:
   - 회피 문형(양보절 `Although`, 혼합 가정법 등)을 자연스럽게 답변하도록 강제 유도

---

## 3. 공인 시험 시뮬레이션 규격

- **IELTS Speaking**:
  - **Part 1**: 일상/사회적 인터뷰 (답변 30~45초)
  - **Part 2**: Long Turn Cue Card (**1분 준비/메모장 타이머** $\rightarrow$ **2분 발화 타이머 자동 컷**)
  - **Part 3**: 심층 토론 (Part 2 연계 반론 제시, 45~60초)
  - **IELTS 공식 4대 루브릭**: FC(유창성), LR(어휘력), GRA(문법), PR(발음)
- **TOEIC Speaking**:
  - Q1~Q2 (문장 읽기), Q3~Q4 (사진 묘사), Q5~Q7 (듣고 답하기), Q8~Q10 (정보 보고 답하기), Q11 (의견 제시)
  - 시험 표준 비프음(880Hz / 440Hz) 및 준비/발화 시간 자동 전이

---

## 4. 기술 스택 (Tech Stack)

| 계층 | 기술 스택 | 설명 |
|---|---|---|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide | PWA 지원 미니멀 인터페이스 |
| **Audio Core** | Web Audio API, AudioWorklet, Dedicated Web Worker | iOS Autoplay 제약 해제, 백그라운드 스로틀링 방지 정밀 타이머 |
| **STT Engine** | Web Speech API | 브라우저 내장 하드웨어 가속 음성 인식 + 끊김 방지 자동 재연결 |
| **Local Storage** | Dexie.js (IndexedDB) | 원본 음성 Blob 로컬 영구 보관 (트래픽 $0, 0ms 무지연 재생) |
| **AI LLM** | Google Gemini 1.5 Flash & Pro | 공식 루브릭 Strict JSON 채점 & 전문 시험관 페르소나 |
| **Vector DB** | Neon Serverless Postgres (`pgvector`) | 768차원 질문 임베딩 코사인 유사도 검색 |

---

## 5. 시작 가이드 (Quick Start)

### 1) 환경 변수 설정
`.env.example` 파일을 복사하여 `.env.local`을 생성합니다:
```bash
cp .env.example .env.local
```

```env
# Google Gemini API Key (무료 발급: https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Neon Serverless Postgres 연결 URL (선택 사항: 미설정 시 로컬 IndexedDB 단독 모드로 동작)
DATABASE_URL=
```

### 2) 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3) 빌드 및 프로덕션 실행
```bash
npm run build
npm run start
```
