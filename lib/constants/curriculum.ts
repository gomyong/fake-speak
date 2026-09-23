// lib/constants/curriculum.ts

export interface SentenceChunk {
  text: string;
  ko: string;
  isKeyChunk?: boolean; // 핵심 표현 여부 (빈칸 훈련 시 가려질 대상)
}

export interface TrainingSentence {
  id: string;
  fullText: string;
  fullKo: string;
  chunks: SentenceChunk[];
  substitutionHint?: string; // 치환 훈련 가이드 (예: 'technology'를 'public transport'로 변경)
}

export interface TrainingUnit {
  id: string;
  examType: 'IELTS' | 'TOEIC';
  sectionKey: string;
  sectionTitle: string;
  topicTitle: string;
  question: string;
  questionKo: string;
  strategyTip: string;
  sentences: TrainingSentence[];
}

import { getAllPredictedUnits } from './ieltsPredictedTopics';

export const TRAINING_UNITS: TrainingUnit[] = [
  // 45 Authentic IELTS Exam & Predicted Topics (from '예상 문제' collection)
  ...getAllPredictedUnits(),


  // 4. TOEIC Speaking: Q3 Describe a Picture
  {
    id: 'toeic_q3_picture',
    examType: 'TOEIC',
    sectionKey: 'TOEIC_Q3',
    sectionTitle: 'Question 3: Describe a Picture',
    topicTitle: 'Collaborative Office Scene',
    question: 'Describe the picture: Two colleagues discussing blueprints in an open office.',
    questionKo: '사진 묘사: 개방형 사무실에서 설계도를 보며 대화하는 두 동료.',
    strategyTip: '1) 전체 장소(This picture was taken in...) -> 2) 중심 인물 동작 -> 3) 주변 사물/배경 -> 4) 전반적인 분위기 순서로 전개하세요.',
    sentences: [
      {
        id: 's1',
        fullText: 'This picture was taken in a brightly lit modern office with expansive glass windows.',
        fullKo: '이 사진은 넓은 유리창이 있는 밝은 현대식 사무실에서 촬영되었습니다.',
        chunks: [
          { text: 'This picture was taken in', ko: '이 사진은 ~에서 촬영되었습니다', isKeyChunk: true },
          { text: 'a brightly lit modern office', ko: '밝은 현대식 사무실에서', isKeyChunk: true },
          { text: 'with expansive glass windows.', ko: '넓은 유리창이 있는.', isKeyChunk: false },
        ],
      },
      {
        id: 's2',
        fullText: 'In the foreground, a man and a woman are leaning over a wooden conference table to examine architectural blueprints.',
        fullKo: '전경에는 한 남성과 여성이 목재 회의 테이블 위로 몸을 기울여 건축 설계도를 살펴보고 있습니다.',
        chunks: [
          { text: 'In the foreground,', ko: '전경에는,', isKeyChunk: true },
          { text: 'a man and a woman are leaning over', ko: '한 남성과 여성이 몸을 기울이고 있습니다', isKeyChunk: true },
          { text: 'a wooden conference table', ko: '목재 회의 테이블 위로', isKeyChunk: false },
          { text: 'to examine architectural blueprints.', ko: '건축 설계도를 살펴보기 위해.', isKeyChunk: true },
        ],
      },
      {
        id: 's3',
        fullText: 'Overall, the atmosphere appears highly collaborative and focused on productive problem-solving.',
        fullKo: '전반적으로 분위기는 매우 협력적이고 생산적인 문제 해결에 집중된 것처럼 보입니다.',
        chunks: [
          { text: 'Overall, the atmosphere appears', ko: '전반적으로 분위기는 ~해 보입니다', isKeyChunk: true },
          { text: 'highly collaborative', ko: '매우 협력적이고', isKeyChunk: true },
          { text: 'and focused on productive problem-solving.', ko: '생산적인 문제 해결에 집중된 것처럼.', isKeyChunk: true },
        ],
      },
    ],
  },

  // 5. TOEIC Speaking: Q11 Express an Opinion
  {
    id: 'toeic_q11_remote_work',
    examType: 'TOEIC',
    sectionKey: 'TOEIC_Q11',
    sectionTitle: 'Question 11: Express an Opinion',
    topicTitle: 'Hybrid & Remote Work Policy',
    question: 'Do you agree that companies should mandate flexible telecommuting options for all employees?',
    questionKo: '기업이 모든 직원에게 유연한 재택근무 옵션을 의무화해야 한다는 의견에 동의하십니까?',
    strategyTip: '명확한 입장 표명(I firmly believe...) 후, 2가지 독립적인 논거(통근 피로 감소 + 업무 집중도 증대)를 명시적으로 제시하세요.',
    sentences: [
      {
        id: 's1',
        fullText: 'I firmly support the view that organizations should provide flexible remote work arrangements for their staff members.',
        fullKo: '저는 기업이 직원들에게 유연한 원격 근무 제도를 제공해야 한다는 견해를 확고히 지지합니다.',
        chunks: [
          { text: 'I firmly support the view that', ko: '저는 ~라는 견해를 확고히 지지합니다', isKeyChunk: true },
          { text: 'organizations should provide', ko: '기업이 제공해야 한다는', isKeyChunk: false },
          { text: 'flexible remote work arrangements', ko: '유연한 원격 근무 제도를', isKeyChunk: true },
          { text: 'for their staff members.', ko: '직원들을 위해.', isKeyChunk: false },
        ],
      },
      {
        id: 's2',
        fullText: 'First of all, eliminating daily commutes significantly mitigates mental fatigue, which directly enhances worker productivity.',
        fullKo: '무엇보다도 매일의 통근을 없애면 정신적 피로가 크게 줄어들어 직원의 생산성 향상으로 직결됩니다.',
        chunks: [
          { text: 'First of all,', ko: '무엇보다도,', isKeyChunk: true },
          { text: 'eliminating daily commutes', ko: '매일의 통근을 없애는 것은', isKeyChunk: true },
          { text: 'significantly mitigates mental fatigue,', ko: '정신적 피로를 크게 줄여주며,', isKeyChunk: true },
          { text: 'which directly enhances worker productivity.', ko: '이는 직원의 생산성 향상으로 직결됩니다.', isKeyChunk: true },
        ],
      },
    ],
  },
];
