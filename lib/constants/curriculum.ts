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

export const TRAINING_UNITS: TrainingUnit[] = [
  // 1. IELTS Part 1: Hometown & Urban Life
  {
    id: 'ielts_p1_hometown',
    examType: 'IELTS',
    sectionKey: 'IELTS_PART_1',
    sectionTitle: 'Part 1: Personal Interview',
    topicTitle: 'Hometown & Community Infrastructure',
    question: 'What do you like most about your hometown?',
    questionKo: '당신의 고향에서 가장 마음에 드는 점은 무엇인가요?',
    strategyTip: '단답형으로 끝내지 말고, 구체적인 특징 1가지와 그로 인한 일상적 이점을 복문 구조로 연결하세요.',
    sentences: [
      {
        id: 's1',
        fullText: 'What I appreciate most about my hometown is its harmonious balance between urban convenience and lush natural reserves.',
        fullKo: '내 고향에서 가장 마음에 드는 점은 도시의 편리함과 푸른 자연 녹지 사이의 조화로운 균형입니다.',
        chunks: [
          { text: 'What I appreciate most about my hometown', ko: '내 고향에서 가장 마음에 드는 점은', isKeyChunk: true },
          { text: 'is its harmonious balance', ko: '조화로운 균형입니다', isKeyChunk: true },
          { text: 'between urban convenience', ko: '도시의 편리함과', isKeyChunk: false },
          { text: 'and lush natural reserves.', ko: '푸른 자연 녹지 사이의.', isKeyChunk: true },
        ],
        substitutionHint: "'urban convenience and lush natural reserves' 대신 'historic architecture and modern cafes'로 바꿔보세요.",
      },
      {
        id: 's2',
        fullText: 'Within walking distance from my residence, there is a serene public park where I can decompress after a hectic working day.',
        fullKo: '집에서 걸어갈 수 있는 거리에 잔잔한 공원이 있어서 바쁜 일과 후에 스트레스를 풀 수 있습니다.',
        chunks: [
          { text: 'Within walking distance from my residence,', ko: '집에서 걸어갈 수 있는 거리에,', isKeyChunk: true },
          { text: 'there is a serene public park', ko: '잔잔한 공원이 있어서', isKeyChunk: false },
          { text: 'where I can decompress', ko: '스트레스를 풀 수 있습니다', isKeyChunk: true },
          { text: 'after a hectic working day.', ko: '바쁜 일과 후에.', isKeyChunk: true },
        ],
        substitutionHint: "'serene public park' 대신 'vibrant local market'으로 치환해 보세요.",
      },
    ],
  },

  // 2. IELTS Part 2: Cue Card (Technological Innovation)
  {
    id: 'ielts_p2_technology',
    examType: 'IELTS',
    sectionKey: 'IELTS_PART_2',
    sectionTitle: 'Part 2: Long Turn (Cue Card)',
    topicTitle: 'An AI Tool That Changed My Routine',
    question: 'Describe an artificial intelligence technology that has significantly influenced your lifestyle.',
    questionKo: '당신의 일상에 큰 영향을 미친 인공지능 기술에 대해 이야기해 주세요.',
    strategyTip: '1분 메모를 기반으로 서론(도입) -> 구체적 경험 -> 파급 효과 -> 미래 전망의 4단 구조를 지키세요.',
    sentences: [
      {
        id: 's1',
        fullText: 'I would like to speak about generative language models, which have fundamentally revolutionized the way I conduct professional research.',
        fullKo: '저는 제 업무 연구 방식을 근본적으로 혁신한 생성형 언어 모델에 대해 말씀드리고자 합니다.',
        chunks: [
          { text: 'I would like to speak about', ko: '저는 ~에 대해 말씀드리고자 합니다', isKeyChunk: false },
          { text: 'generative language models,', ko: '생성형 언어 모델에 대해,', isKeyChunk: true },
          { text: 'which have fundamentally revolutionized', ko: '근본적으로 혁신한', isKeyChunk: true },
          { text: 'the way I conduct professional research.', ko: '제가 전문적인 연구를 수행하는 방식을.', isKeyChunk: true },
        ],
        substitutionHint: "'professional research' 대신 'creative writing'이나 'language learning'으로 바꿔보세요.",
      },
      {
        id: 's2',
        fullText: 'Prior to incorporating this tool, synthesizing complex academic papers used to consume countless hours of exhaustive reading.',
        fullKo: '이 도구를 도입하기 전에는 복잡한 학술 논문을 요약하는 데 수많은 시간의 피로한 독서가 소모되곤 했습니다.',
        chunks: [
          { text: 'Prior to incorporating this tool,', ko: '이 도구를 도입하기 전에는,', isKeyChunk: true },
          { text: 'synthesizing complex academic papers', ko: '복잡한 학술 논문을 종합하는 것이', isKeyChunk: true },
          { text: 'used to consume countless hours', ko: '수많은 시간을 소모하곤 했습니다', isKeyChunk: false },
          { text: 'of exhaustive reading.', ko: '지치는 독서로.', isKeyChunk: true },
        ],
        substitutionHint: "'synthesizing complex academic papers' 대신 'organizing daily schedules'로 치환해 보세요.",
      },
      {
        id: 's3',
        fullText: 'Were it not for its analytical capabilities, maintaining my current standard of productivity would be virtually unattainable.',
        fullKo: '이 도구의 분석 역량이 없었다면, 현재의 생산성 기준을 유지하는 것은 거의 불가능했을 것입니다.',
        chunks: [
          { text: 'Were it not for its analytical capabilities,', ko: '이 도구의 분석 역량이 없었다면,', isKeyChunk: true },
          { text: 'maintaining my current standard of productivity', ko: '현재의 생산성 기준을 유지하는 것은', isKeyChunk: true },
          { text: 'would be virtually unattainable.', ko: '거의 불가능했을 것입니다.', isKeyChunk: true },
        ],
        substitutionHint: "'analytical capabilities' 대신 'instant feedback system'으로 바꿔보세요.",
      },
    ],
  },

  // 3. IELTS Part 3: Deep Discussion (Environmental Policy)
  {
    id: 'ielts_p3_environment',
    examType: 'IELTS',
    sectionKey: 'IELTS_PART_3',
    sectionTitle: 'Part 3: In-depth Discussion',
    topicTitle: 'Government Legislation vs Individual Action',
    question: 'Do you believe individual voluntary efforts are sufficient to tackle climate change?',
    questionKo: '개인의 자발적인 노력만으로 기후 변화에 대처할 수 있다고 생각하십니까?',
    strategyTip: '양보절(Although / While)로 반대편 입장을 인정하고, 주 논거에서 제도적 규제의 필요성을 학술 어휘로 강조하세요.',
    sentences: [
      {
        id: 's1',
        fullText: 'While grassroots environmental awareness is undeniably crucial, it remains inherently insufficient without rigorous structural legislation.',
        fullKo: '풀뿌리 환경 인식이 분명 중요하긴 하지만, 엄격한 구조적 법제화 없이는 본질적으로 불충분합니다.',
        chunks: [
          { text: 'While grassroots environmental awareness', ko: '풀뿌리 환경 인식이', isKeyChunk: true },
          { text: 'is undeniably crucial,', ko: '분명 중요하긴 하지만,', isKeyChunk: true },
          { text: 'it remains inherently insufficient', ko: '본질적으로 불충분합니다', isKeyChunk: true },
          { text: 'without rigorous structural legislation.', ko: '엄격한 구조적 법제화 없이는.', isKeyChunk: true },
        ],
        substitutionHint: "'environmental awareness' 대신 'personal recycling habits'로 치환해 보세요.",
      },
      {
        id: 's2',
        fullText: 'Unless governments impose binding carbon caps on multinational corporations, individual eco-friendly choices will have minimal macroscopic impact.',
        fullKo: '정부가 다국적 기업에 구속력 있는 탄소 배출 상한제를 부과하지 않는 한, 개인의 친환경적 선택은 거시적으로 미미한 영향만을 미칠 것입니다.',
        chunks: [
          { text: 'Unless governments impose binding carbon caps', ko: '정부가 구속력 있는 탄소 상한제를 부과하지 않는 한', isKeyChunk: true },
          { text: 'on multinational corporations,', ko: '다국적 기업에,', isKeyChunk: false },
          { text: 'individual eco-friendly choices', ko: '개인의 친환경적 선택은', isKeyChunk: false },
          { text: 'will have minimal macroscopic impact.', ko: '거시적으로 미미한 영향만을 미칠 것입니다.', isKeyChunk: true },
        ],
        substitutionHint: "'binding carbon caps' 대신 'heavier plastic tariffs'로 바꿔보세요.",
      },
    ],
  },

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
