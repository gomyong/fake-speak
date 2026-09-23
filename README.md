# FAKE_SPEAK

> **IELTS & TOEIC Speaking AI 실전 모의고사 및 6단계 체화 훈련소**  
> *(Next.js 15.1.7 + React 19 + TypeScript + Neon Serverless pgvector + Google Gemini 2.0 Flash)*

---

## 1. 프로젝트 개요 (Overview)

**FAKE_SPEAK**는 기존 상용 영어 스피킹 앱의 한계인 **'주제 및 패턴의 얕은 반복'**, **'실전 규격 불일치'**, 그리고 **'체계적 발화 훈련의 부재'**를 해결하기 위해 개발된 1인 맞춤형 AI 스피킹 연구소입니다.

- **실전 모의고사 (Exam Simulation)**: IELTS(Part 1~3) 및 TOEIC Speaking(Q1~Q11)의 공식 타이머, 880Hz 비프음, 4대 루브릭(FC, LR, GRA, PR) 평가.
- **파트별 훈련소 (Training Lab)**: 청킹 $\rightarrow$ 쉐도잉 $\rightarrow$ 블라인드 리콜 $\rightarrow$ PREP 논리 빌더 $\rightarrow$ 3단계 패러프레이징 $\rightarrow$ 표현 치환의 6단계 체화 파이프라인.
- **상용 서비스 수준 5대 기능**:
  1. **3단계 패러프레이징 사다리**: Good(5.5) $\rightarrow$ Better(6.5) $\rightarrow$ Native(7.5+) 실시간 문장 업그레이드 & 쉐도잉 연동.
  2. **실시간 정량 스피킹 지표**: 말하기 속도(WPM), 필러 워드(um, like 등) 감지 배지, 어휘 다양성(TTR) 및 고득점 유의어 칩.
  3. **PREP 논리 프레임워크 빌더**: Point $\rightarrow$ Reason $\rightarrow$ Example $\rightarrow$ Point 4단 구조화 스피치 구성기.
  4. **AI 면접관 돌발 꼬리 질문**: 실시간 반론/압박 질문 생성 및 시간 벌기(Buying-time) 담화 표지어 가이드.
  5. **에빙하우스 망각곡선 취약 청크 오답노트(SRS)**: 75% 미만 일치 청크 자동 수집 및 1분 퀵 복습 플래시카드.
- **비용 $0 제로 인프라**: 음성 녹음 Blob을 브라우저 로컬 **IndexedDB(Dexie.js)**에 보관하여 클라우드 스토리지 전송 트래픽 $0, 레이턴시 0ms, 100% 프라이버시를 실현했습니다.

---

## 2. 기술 스택 (Tech Stack)

| 계층 | 기술 스택 | 설명 |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 15.1.7 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS** | Boro UI Warm Gallery 감성 디자인 시스템 |
| **Audio Core** | **Web Audio API**, **Dedicated Web Worker** | 880Hz/440Hz 비프음 합성, 스로틀링 없는 백그라운드 정밀 타이머 |
| **STT Engine** | **Web Speech API** (`SpeechRecognition`) | `event.resultIndex` 기반 중복 방지 및 실시간 텍스트 변환 |
| **TTS Engine** | **Web Speech API** (`SpeechSynthesis`) | 0.8x / 1.0x / 1.2x 속도 제어 원어민 음성 재생 |
| **Local DB** | **Dexie.js (IndexedDB)** & **LocalStorage** | 원본 음성 Blob 로컬 영구 보관 및 SRS 망각곡선 청크 영속화 |
| **AI LLM** | **Google Gemini 2.0 Flash** (`gemini-2.0-flash`) | 공식 루브릭 Strict JSON 채점, 3단계 패러프레이징, 꼬리 질문 생성 |
| **Vector DB** | **Neon Serverless Postgres (`pgvector`)** | 768차원 질문 임베딩 코사인 유사도 검색 (`match_question_similarity`) |

---

## 3. 상세 문서 안내

- **[통합 제품 및 기술 명세서 (SPECIFICATION.md)](./SPECIFICATION.md)**: 전체 기능 명세, 실제 DB 스키마, API 엔드포인트 계약, 디렉토리 구조 등이 상세히 정리되어 있습니다.
- **[레거시 PRD 아카이브](./docs/archive/ielts_toeic_speaking_1_ai_prd.md)**: 초기 기획 및 4-Core 온톨로지 엔진 사양.

---

## 4. 시작 가이드 (Quick Start)

### 1) 환경 변수 설정
`.env.example` 파일을 복사하여 `.env.local`을 생성합니다:
```bash
cp .env.example .env.local
```

```env
# Google Gemini API Key (무료 발급: https://aistudio.google.com/)
GEMINI_API_KEY=your_gemini_api_key_here

# Neon Serverless Postgres 연결 URL (선택 사항: 미설정 시 로컬 IndexedDB 단독 모드로 동작)
DATABASE_URL=postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 2) 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.

### 3) 빌드 및 프로덕션 검증
```bash
npm run build
npm run start
```
