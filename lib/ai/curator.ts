// lib/ai/curator.ts
import { TOPIC_DOMAINS, TopicDomain } from '@/lib/constants/topics';
import { generateEmbedding } from './gemini';
import { findSimilarQuestions, saveQuestionToHistory } from '@/lib/db/neon';

export interface CuratorRequest {
  examType: 'IELTS' | 'TOEIC';
  partOrQuestion: string;
  currentBandEstimate?: number;
  weakGrammarPatterns?: string[];
  recentTopics?: string[];
}

export interface CuratedQuestion {
  questionId: string;
  domainId: string;
  domainName: string;
  subTopicId: string;
  subTopicTitle: string;
  cognitiveLevel: 1 | 2 | 3;
  questionText: string;
  cueCardPoints?: string[]; // IELTS Part 2 전용
  preparationSeconds: number;
  responseSeconds: number;
  syntacticGapPrompt?: string;
}

export async function curateNextQuestion(params: CuratorRequest): Promise<CuratedQuestion> {
  const { examType, partOrQuestion, currentBandEstimate = 6.0, weakGrammarPatterns = [], recentTopics = [] } = params;

  // 1. 인지 복잡도 결정 (PRD 2.3 인지 복잡도 사다리)
  let cognitiveLevel: 1 | 2 | 3 = 1;
  if (currentBandEstimate >= 7.5) {
    cognitiveLevel = 3;
  } else if (currentBandEstimate >= 6.5) {
    cognitiveLevel = 2;
  } else {
    cognitiveLevel = 1;
  }

  // IELTS 파트별 특수 보정
  if (partOrQuestion === 'IELTS_PART_1') {
    cognitiveLevel = 1; // Part 1은 기본 Descriptive
  } else if (partOrQuestion === 'IELTS_PART_3') {
    cognitiveLevel = Math.max(cognitiveLevel, 2) as 2 | 3; // Part 3는 최소 Analytical 이상
  }

  // 2. 미탐색 도메인 우선 선정 (PRD 2.1 탐색-활용)
  const availableDomains = TOPIC_DOMAINS.filter((d) => !recentTopics.includes(d.id));
  const selectedDomain: TopicDomain =
    availableDomains.length > 0
      ? availableDomains[Math.floor(Math.random() * availableDomains.length)]
      : TOPIC_DOMAINS[Math.floor(Math.random() * TOPIC_DOMAINS.length)];

  const selectedSub =
    selectedDomain.subTopics[Math.floor(Math.random() * selectedDomain.subTopics.length)];

  // 3. 인지 복잡도에 맞는 기본 질문 추출
  let rawQuestion =
    cognitiveLevel === 3
      ? selectedSub.cognitiveQuestions.level3
      : cognitiveLevel === 2
      ? selectedSub.cognitiveQuestions.level2
      : selectedSub.cognitiveQuestions.level1;

  // 4. 취약 문형 주입 프롬프트 가이드 (PRD 2.4 Syntactic Gap Injection)
  let syntacticGapPrompt: string | undefined;
  if (weakGrammarPatterns.includes('concession_clauses')) {
    syntacticGapPrompt = 'Try using concession clauses like "Although...", "Even if...", or "Notwithstanding...".';
  } else if (weakGrammarPatterns.includes('conditional_type_3')) {
    syntacticGapPrompt = 'Consider expressing hypothetical outcomes using "Had it not been for..." or "If they had...".';
  }

  // 5. 시맨틱 중복 제거 검증 (PRD 2.2 pgvector 0.72 코사인 유사도)
  let finalQuestion = rawQuestion;
  try {
    const embedding = await generateEmbedding(finalQuestion);
    if (embedding) {
      const similar = await findSimilarQuestions(embedding, 0.72, 60);
      if (similar.length > 0) {
        console.warn(`[Curator] Semantic collision detected (similarity=${similar[0].similarity.toFixed(3)}). Alternate selected.`);
        // 중복 시 다른 서브토픽이나 대안 질문으로 스위치
        const altLevel = (cognitiveLevel === 3 ? 2 : 3) as 1 | 2 | 3;
        finalQuestion =
          altLevel === 3
            ? selectedSub.cognitiveQuestions.level3
            : selectedSub.cognitiveQuestions.level2;
      }

      // Neon DB에 질문 아카이브
      await saveQuestionToHistory({
        examType,
        partOrQuestion,
        domainCategory: selectedDomain.name,
        subTopic: selectedSub.title,
        cognitiveLevel,
        questionText: finalQuestion,
        embedding,
      });
    }
  } catch (err) {
    console.warn('[Curator] Vector deduplication skipped or failed:', err);
  }

  // 6. 시험 규격별 시간 및 큐카드 세팅 (PRD 3절 규격)
  let preparationSeconds = 0;
  let responseSeconds = 45;
  let cueCardPoints: string[] | undefined;

  if (examType === 'IELTS') {
    if (partOrQuestion === 'IELTS_PART_1') {
      preparationSeconds = 0;
      responseSeconds = 45;
    } else if (partOrQuestion === 'IELTS_PART_2') {
      preparationSeconds = 60; // 1분 준비
      responseSeconds = 120; // 2분 발화
      cueCardPoints = [
        'What the situation or concept is',
        'When and where you first encountered or considered it',
        'How it has influenced your perspective or actions',
        'And explain why it holds significant value in contemporary society',
      ];
    } else if (partOrQuestion === 'IELTS_PART_3') {
      preparationSeconds = 0;
      responseSeconds = 60; // 1분 심층 토론
    }
  } else if (examType === 'TOEIC') {
    // TOEIC Speaking 규격
    if (partOrQuestion.startsWith('TOEIC_Q1') || partOrQuestion.startsWith('TOEIC_Q2')) {
      preparationSeconds = 45;
      responseSeconds = 45;
    } else if (partOrQuestion.startsWith('TOEIC_Q3') || partOrQuestion.startsWith('TOEIC_Q4')) {
      preparationSeconds = 45;
      responseSeconds = 30;
    } else if (partOrQuestion.startsWith('TOEIC_Q5') || partOrQuestion.startsWith('TOEIC_Q6')) {
      preparationSeconds = 3;
      responseSeconds = 15;
    } else if (partOrQuestion.startsWith('TOEIC_Q7')) {
      preparationSeconds = 3;
      responseSeconds = 30;
    } else if (partOrQuestion.startsWith('TOEIC_Q8') || partOrQuestion.startsWith('TOEIC_Q9')) {
      preparationSeconds = 45;
      responseSeconds = 15;
    } else if (partOrQuestion.startsWith('TOEIC_Q10')) {
      preparationSeconds = 45;
      responseSeconds = 30;
    } else if (partOrQuestion.startsWith('TOEIC_Q11')) {
      preparationSeconds = 45;
      responseSeconds = 60;
    }
  }

  return {
    questionId: `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    domainId: selectedDomain.id,
    domainName: selectedDomain.nameKo,
    subTopicId: selectedSub.id,
    subTopicTitle: selectedSub.title,
    cognitiveLevel,
    questionText: finalQuestion,
    cueCardPoints,
    preparationSeconds,
    responseSeconds,
    syntacticGapPrompt,
  };
}
