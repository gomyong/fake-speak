import type { TrainingUnit } from './curriculum';

export interface TopicQuestion {
  id: string;
  questionNumber?: number;
  question: string;
  questionKo: string;
  strategyTip: string;
  cuePoints?: string[]; // Part 2 전용 큐카드 포인트
  unit: TrainingUnit;
}

export interface PredictedTopicItem {
  id: string;
  part: 1 | 2 | 3;
  topicTitle: string;
  topicTitleKo: string;
  screenshotId: string;
  questions: TopicQuestion[];
}

// 헬퍼: 기본 문장 모델 답변 및 청크 생성
function createDefaultUnit(
  unitId: string,
  sectionKey: string,
  sectionTitle: string,
  topicTitle: string,
  question: string,
  questionKo: string,
  strategyTip: string,
  modelAnswer: string,
  modelKo: string,
  chunks: { text: string; ko: string; isKeyChunk?: boolean }[],
  substitutionHint?: string
): TrainingUnit {
  return {
    id: unitId,
    examType: 'IELTS',
    sectionKey,
    sectionTitle,
    topicTitle,
    question,
    questionKo,
    strategyTip,
    sentences: [
      {
        id: `${unitId}_s1`,
        fullText: modelAnswer,
        fullKo: modelKo,
        chunks,
        substitutionHint,
      },
    ],
  };
}

export const IELTS_PREDICTED_TOPICS: PredictedTopicItem[] = [
  // =========================================================================
  // PART 1 TOPICS (16 Topics - IMG_2103 to IMG_2118)
  // =========================================================================
  {
    id: 'p1_friends',
    part: 1,
    topicTitle: 'Friends',
    topicTitleKo: '친구 & 대인관계',
    screenshotId: 'IMG_2103',
    questions: [
      {
        id: 'p1_friends_q1',
        questionNumber: 1,
        question: 'Do you have a friend you have known for a long time?',
        questionKo: '오랫동안 알고 지낸 친구가 있나요?',
        strategyTip: '관계의 기간(since childhood)과 끈끈한 유대감을 복문 구조로 연결하세요.',
        unit: createDefaultUnit(
          'u_p1_friends_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Friends',
          'Do you have a friend you have known for a long time?',
          '오랫동안 알고 지낸 친구가 있나요?',
          '관계의 지속 기간과 신뢰 관계를 고급 형용사(cherished, steadfast)로 표현하세요.',
          'Yes, indeed. I have a cherished childhood companion whom I first met in primary school, nearly fifteen years ago.',
          '네, 그렇습니다. 약 15년 전 초등학교 시절 처음 만난 아주 소중한 죽마고우가 있습니다.',
          [
            { text: 'Yes, indeed.', ko: '네, 그렇습니다.', isKeyChunk: false },
            { text: 'I have a cherished childhood companion', ko: '소중한 어린 시절 친구가 있습니다', isKeyChunk: true },
            { text: 'whom I first met in primary school,', ko: '초등학교 시절 처음 만난,', isKeyChunk: true },
            { text: 'nearly fifteen years ago.', ko: '거의 15년 전에.', isKeyChunk: false },
          ],
          "'cherished childhood companion' 대신 'lifelong confidant'로 바꿔보세요."
        ),
      },
      {
        id: 'p1_friends_q2',
        questionNumber: 2,
        question: 'What do you usually do with your friends?',
        questionKo: '친구들과 주로 무엇을 하나요?',
        strategyTip: '단순한 활동 나열 대신 정서적 재충전(decompress) 목적과 함께 설명하세요.',
        unit: createDefaultUnit(
          'u_p1_friends_q2',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Friends',
          'What do you usually do with your friends?',
          '친구들과 주로 무엇을 하나요?',
          '일상적 행위를 나열하기보다 스트레스 해소와 교류의 의미를 부여하세요.',
          'More often than not, we congregate at local cafes to decompress and exchange thoughts on our professional endeavors.',
          '대개의 경우, 우리는 동네 카페에 모여 피로를 풀고 각자의 커리어 고민이나 생각을 나눕니다.',
          [
            { text: 'More often than not,', ko: '대개의 경우,', isKeyChunk: true },
            { text: 'we congregate at local cafes', ko: '우리는 동네 카페에 모입니다', isKeyChunk: true },
            { text: 'to decompress', ko: '피로를 풀고', isKeyChunk: true },
            { text: 'and exchange thoughts on our professional endeavors.', ko: '각자의 직업적 노력에 대한 생각을 교환하기 위해.', isKeyChunk: false },
          ],
          "'congregate at local cafes' 대신 'explore tranquil walking trails'로 바꿔보세요."
        ),
      },
      {
        id: 'p1_friends_q3',
        questionNumber: 3,
        question: 'Where do you usually meet with your friends?',
        questionKo: '친구들과 주로 어디서 만나나요?',
        strategyTip: '선호하는 장소의 분위기(ambient atmosphere)와 접근성을 언급하세요.',
        unit: createDefaultUnit(
          'u_p1_friends_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Friends',
          'Where do you usually meet with your friends?',
          '친구들과 주로 어디서 만나나요?',
          '장소의 분위기와 편안함을 강조하세요.',
          'We frequently gravitate towards quiet bistros or urban parks that offer a relaxed environment conducive to meaningful conversation.',
          '우리는 의미 있는 대화에 적합한 편안한 환경을 제공하는 조용한 비스트로나 도심 공원을 자주 찾습니다.',
          [
            { text: 'We frequently gravitate towards', ko: '우리는 자주 ~로 향합니다', isKeyChunk: true },
            { text: 'quiet bistros or urban parks', ko: '조용한 비스트로나 도심 공원으로', isKeyChunk: false },
            { text: 'that offer a relaxed environment', ko: '편안한 환경을 제공하는', isKeyChunk: true },
            { text: 'conducive to meaningful conversation.', ko: '의미 있는 대화에 적합한.', isKeyChunk: true },
          ],
          "'gravitate towards' 대신 'opt for'로 바꿔보세요."
        ),
      },
      {
        id: 'p1_friends_q4',
        questionNumber: 4,
        question: 'How often do you meet with your friends?',
        questionKo: '친구들을 얼마나 자주 만나나요?',
        strategyTip: '빈도 부사와 함께 바쁜 일상 속에서도 균형을 맞추는 노력을 전달하세요.',
        unit: createDefaultUnit(
          'u_p1_friends_q4',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Friends',
          'How often do you meet with your friends?',
          '친구들을 얼마나 자주 만나나요?',
          '주기성과 일상의 균형을 설명하세요.',
          'On average, we assemble on a bi-weekly basis, strike a balance between our demanding workloads and personal commitments.',
          '평균적으로 2주에 한 번 정도 모이며, 벅찬 업무와 개인 일정 사이에서 균형을 유지하고 있습니다.',
          [
            { text: 'On average, we assemble', ko: '평균적으로 우리는 모입니다', isKeyChunk: false },
            { text: 'on a bi-weekly basis,', ko: '2주에 한 번 주기로,', isKeyChunk: true },
            { text: 'strike a balance', ko: '균형을 이루며', isKeyChunk: true },
            { text: 'between our demanding workloads and personal commitments.', ko: '벅찬 업무량과 개인 일정 사이에서.', isKeyChunk: true },
          ],
          "'assemble on a bi-weekly basis' 대신 'catch up every fortnight'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_sharing',
    part: 1,
    topicTitle: 'Sharing',
    topicTitleKo: '나눔과 공유',
    screenshotId: 'IMG_2104',
    questions: [
      {
        id: 'p1_sharing_q1',
        questionNumber: 1,
        question: 'Did your parents teach you to share when you were a child?',
        questionKo: '어렸을 때 부모님이 나눔에 대해 가르쳐 주셨나요?',
        strategyTip: '가정교육의 긍정적 가치(virtue of empathy)를 강조하세요.',
        unit: createDefaultUnit(
          'u_p1_sharing_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Sharing',
          'Did your parents teach you to share when you were a child?',
          '어렸을 때 부모님이 나눔에 대해 가르쳐 주셨나요?',
          '도덕적 가치 함양을 세련된 어휘로 표현하세요.',
          'Without a doubt, my parents constantly instilled the virtue of empathy by encouraging me to share toys with my peers.',
          '의심의 여지 없이, 부모님께서는 또래 친구들과 장난감을 나누게 함으로써 공감의 미덕을 끊임없이 심어주셨습니다.',
          [
            { text: 'Without a doubt,', ko: '의심의 여지 없이,', isKeyChunk: false },
            { text: 'my parents constantly instilled', ko: '부모님께서는 끊임없이 심어주셨습니다', isKeyChunk: true },
            { text: 'the virtue of empathy', ko: '공감의 미덕을', isKeyChunk: true },
            { text: 'by encouraging me to share toys with my peers.', ko: '또래들과 장난감을 나누도록 격려함으로써.', isKeyChunk: true },
          ],
          "'instilled the virtue of empathy' 대신 'fostered a spirit of generosity'로 치환해보세요."
        ),
      },
      {
        id: 'p1_sharing_q3',
        questionNumber: 3,
        question: 'What kind of things are not suitable for sharing?',
        questionKo: '어떤 것들은 공유하기에 적합하지 않은가요?',
        strategyTip: '개인정보 보호와 위생적 한계(hygienic boundaries)를 제시하세요.',
        unit: createDefaultUnit(
          'u_p1_sharing_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Sharing',
          'What kind of things are not suitable for sharing?',
          '어떤 것들은 공유하기에 적합하지 않은가요?',
          '프라이버시와 위생의 중요성을 명확히 분리하여 설명하세요.',
          'I would argue that confidential digital passwords and personal hygiene items should strictly remain private.',
          '기밀 디지털 비밀번호나 개인 위생용품은 엄격하게 사적인 영역으로 남겨두어야 한다고 봅니다.',
          [
            { text: 'I would argue that', ko: '제 생각에는 ~라고 봅니다', isKeyChunk: false },
            { text: 'confidential digital passwords', ko: '기밀 디지털 비밀번호와', isKeyChunk: true },
            { text: 'and personal hygiene items', ko: '개인 위생 용품은', isKeyChunk: true },
            { text: 'should strictly remain private.', ko: '엄격히 사적인 것으로 유지되어야 한다고.', isKeyChunk: true },
          ],
          "'strictly remain private' 대신 'never be compromised'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_having_a_break',
    part: 1,
    topicTitle: 'Having a break',
    topicTitleKo: '휴식과 재충전',
    screenshotId: 'IMG_2105',
    questions: [
      {
        id: 'p1_break_q1',
        questionNumber: 1,
        question: 'How often do you have a break?',
        questionKo: '얼마나 자주 휴식을 취하나요?',
        strategyTip: '작업 주기와 인지 피로 완화(alleviate cognitive fatigue)를 언급하세요.',
        unit: createDefaultUnit(
          'u_p1_break_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Having a break',
          'How often do you have a break?',
          '얼마나 자주 휴식을 취하나요?',
          '인지적 피로 해소와 생산성 유지를 결합하세요.',
          'I consciously take brief pauses every fifty minutes to alleviate cognitive fatigue and sustain my overall focus.',
          '저는 인지적 피로를 덜고 전반적인 집중력을 유지하기 위해 매 50분마다 의식적으로 짧은 휴식을 취합니다.',
          [
            { text: 'I consciously take brief pauses', ko: '저는 의식적으로 짧은 휴식을 취합니다', isKeyChunk: true },
            { text: 'every fifty minutes', ko: '매 50분마다', isKeyChunk: false },
            { text: 'to alleviate cognitive fatigue', ko: '인지적 피로를 완화하고', isKeyChunk: true },
            { text: 'and sustain my overall focus.', ko: '전반적인 집중력을 유지하기 위해.', isKeyChunk: true },
          ],
          "'alleviate cognitive fatigue' 대신 'recharge my mental stamina'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_museum',
    part: 1,
    topicTitle: 'Museum',
    topicTitleKo: '박물관과 문화유산',
    screenshotId: 'IMG_2106',
    questions: [
      {
        id: 'p1_museum_q1',
        questionNumber: 1,
        question: 'Do you think museums are important?',
        questionKo: '박물관이 중요하다고 생각하시나요?',
        strategyTip: '역사적 보존(custodians of historical heritage)과 대중 교육의 가치를 강조하세요.',
        unit: createDefaultUnit(
          'u_p1_museum_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Museum',
          'Do you think museums are important?',
          '박물관이 중요하다고 생각하시나요?',
          '문화재 보존과 역사 교육의 기능을 복문으로 서술하세요.',
          'Museums serve as indispensable custodians of historical heritage, offering tangible connections to our collective past.',
          '박물관은 인류의 공동 역사를 만질 수 있게 연결해주는 대체 불가능한 역사 유산의 수호자 역할을 합니다.',
          [
            { text: 'Museums serve as', ko: '박물관은 ~ 역할을 합니다', isKeyChunk: false },
            { text: 'indispensable custodians', ko: '없어서는 안 될 수호자', isKeyChunk: true },
            { text: 'of historical heritage,', ko: '역사적 유산의,', isKeyChunk: true },
            { text: 'offering tangible connections', ko: '실체적인 연결고리를 제공하며', isKeyChunk: true },
            { text: 'to our collective past.', ko: '우리의 공동 과거로의.', isKeyChunk: false },
          ],
          "'indispensable custodians' 대신 'vital cultural repositories'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_advertisement',
    part: 1,
    topicTitle: 'Advertisement',
    topicTitleKo: '광고와 미디어',
    screenshotId: 'IMG_2107',
    questions: [
      {
        id: 'p1_ad_q1',
        questionNumber: 1,
        question: 'Is there an advertisement that made an impression on you when you were a child?',
        questionKo: '어릴 적 특별히 인상 깊었던 광고가 있나요?',
        strategyTip: '광고의 감성적 연출과 오래 남는 잔상을 묘사하세요.',
        unit: createDefaultUnit(
          'u_p1_ad_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Advertisement',
          'Is there an advertisement that made an impression on you when you were a child?',
          '어릴 적 특별히 인상 깊었던 광고가 있나요?',
          '기억에 깊이 각인된 감성적 이미지를 표현하세요.',
          'A particular public welfare commercial featuring environmental conservation remains deeply etched in my memory due to its evocative imagery.',
          '환경 보전을 다룬 한 공익 광고가 감동적인 시각 연출 덕분에 제 기억 속에 여전히 깊이 각인되어 있습니다.',
          [
            { text: 'A particular public welfare commercial', ko: '한 특정 공익 광고가', isKeyChunk: true },
            { text: 'featuring environmental conservation', ko: '환경 보전을 다룬', isKeyChunk: true },
            { text: 'remains deeply etched in my memory', ko: '내 기억 속에 깊이 각인되어 있다', isKeyChunk: true },
            { text: 'due to its evocative imagery.', ko: '그 감동적인 이미지 덕분에.', isKeyChunk: true },
          ],
          "'evocative imagery' 대신 'compelling storytelling'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_borrowing_lending',
    part: 1,
    topicTitle: 'Borrowing/lending',
    topicTitleKo: '빌리기와 빌려주기',
    screenshotId: 'IMG_2108',
    questions: [
      {
        id: 'p1_borrow_q4',
        questionNumber: 4,
        question: "How do you feel when people don't return things they borrowed from you?",
        questionKo: '남이 빌려간 물건을 돌려주지 않을 때 어떤 기분이 드나요?',
        strategyTip: '신뢰 손상(undermines mutual trust)과 실망감을 고급 표현으로 전개하세요.',
        unit: createDefaultUnit(
          'u_p1_borrow_q4',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Borrowing/lending',
          "How do you feel when people don't return things they borrowed from you?",
          '남이 빌려간 물건을 돌려주지 않을 때 어떤 기분이 드나요?',
          '대인관계 신뢰 훼손을 논리적으로 진술하세요.',
          'Frankly speaking, I feel somewhat disillusioned, as failing to return borrowed items undermines the fundamental trust in interpersonal relations.',
          '솔직히 말씀드리면 다소 실망스러운데, 빌린 물건을 반납하지 않는 것은 대인 관계의 근본적인 신뢰를 훼손하기 때문입니다.',
          [
            { text: 'Frankly speaking,', ko: '솔직히 말씀드리면,', isKeyChunk: false },
            { text: 'I feel somewhat disillusioned,', ko: '다소 실망감을 느낍니다,', isKeyChunk: true },
            { text: 'as failing to return borrowed items', ko: '빌린 물건을 돌려주지 않는 것은', isKeyChunk: true },
            { text: 'undermines the fundamental trust', ko: '근본적인 신뢰를 훼손하기 때문에', isKeyChunk: true },
            { text: 'in interpersonal relations.', ko: '대인 관계에 있어서.', isKeyChunk: false },
          ],
          "'undermines the fundamental trust' 대신 'compromises mutual reliability'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_chatting',
    part: 1,
    topicTitle: 'Chatting',
    topicTitleKo: '대화와 소통',
    screenshotId: 'IMG_2109',
    questions: [
      {
        id: 'p1_chat_q4',
        questionNumber: 4,
        question: 'Do you prefer to communicate face-to-face or via social media?',
        questionKo: '대면 소통과 소셜 미디어 소통 중 어느 쪽을 선호하나요?',
        strategyTip: '눈맞춤, 음성 억양 등 비언어적 단서의 중요성을 부각하세요.',
        unit: createDefaultUnit(
          'u_p1_chat_q4',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Chatting',
          'Do you prefer to communicate face-to-face or via social media?',
          '대면 소통과 소셜 미디어 소통 중 어느 쪽을 선호하나요?',
          '비언어적 교감과 공감 형성을 강조하세요.',
          'I unquestionably favor in-person dialogue because subtle nuances like eye contact and vocal inflection cultivate genuine empathy.',
          '시선 접촉이나 음성의 억양 같은 미묘한 뉘앙스가 진정한 공감을 길러주기 때문에 저는 의심할 여지 없이 대면 대화를 선호합니다.',
          [
            { text: 'I unquestionably favor in-person dialogue', ko: '저는 단연코 대면 대화를 선호합니다', isKeyChunk: true },
            { text: 'because subtle nuances', ko: '미묘한 뉘앙스들이', isKeyChunk: true },
            { text: 'like eye contact and vocal inflection', ko: '눈맞춤이나 목소리 억양과 같은', isKeyChunk: true },
            { text: 'cultivate genuine empathy.', ko: '진정한 공감을 배양하기 때문에.', isKeyChunk: true },
          ],
          "'in-person dialogue' 대신 'face-to-face interaction'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_growing_vegetables',
    part: 1,
    topicTitle: 'Growing vegetables/fruits',
    topicTitleKo: '작물 재배와 가드닝',
    screenshotId: 'IMG_2110',
    questions: [
      {
        id: 'p1_grow_q5',
        questionNumber: 5,
        question: 'Should schools teach students how to grow vegetables?',
        questionKo: '학교에서 학생들에게 채소 재배법을 가르쳐야 할까요?',
        strategyTip: '생태학적 인식(ecological awareness)과 노동 존중을 연결하세요.',
        unit: createDefaultUnit(
          'u_p1_grow_q5',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Growing vegetables/fruits',
          'Should schools teach students how to grow vegetables?',
          '학교에서 학생들에게 채소 재배법을 가르쳐야 할까요?',
          '원예 교육의 교육적, 생태학적 가치를 서술하세요.',
          'Introducing gardening into the curriculum fosters ecological awareness and helps children develop a profound respect for agricultural labor.',
          '교육과정에 가드닝을 도입하면 생태학적 인식을 고취시키고 아이들이 농업 노동에 대한 깊은 존중을 기르도록 돕습니다.',
          [
            { text: 'Introducing gardening into the curriculum', ko: '교육과정에 원예를 도입하는 것은', isKeyChunk: true },
            { text: 'fosters ecological awareness', ko: '생태학적 인식을 고취시키고', isKeyChunk: true },
            { text: 'and helps children develop', ko: '아이들이 기르도록 돕습니다', isKeyChunk: false },
            { text: 'a profound respect for agricultural labor.', ko: '농업 노동에 대한 깊은 경의를.', isKeyChunk: true },
          ],
          "'fosters ecological awareness' 대신 'promotes environmental stewardship'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_crowded_place',
    part: 1,
    topicTitle: 'Crowded place',
    topicTitleKo: '혼잡한 장소',
    screenshotId: 'IMG_2111',
    questions: [
      {
        id: 'p1_crowd_q3',
        questionNumber: 3,
        question: 'Do you like crowded places?',
        questionKo: '혼잡한 장소를 좋아하시나요?',
        strategyTip: '감각적 과부하(sensory overload)와 평온함에 대한 선호를 대조하세요.',
        unit: createDefaultUnit(
          'u_p1_crowd_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Crowded place',
          'Do you like crowded places?',
          '혼잡한 장소를 좋아하시나요?',
          '과도한 자극에 대한 심리적 영향을 논리적으로 표현하세요.',
          'To be candid, I find densely populated venues overwhelming, as excessive noise invariably induces sensory overload and mental drain.',
          '솔직히 말씀드리면, 지나친 소음이 항상 감각적 과부하와 정신적 소모를 유발하기 때문에 인파가 몰리는 장소는 부담스럽습니다.',
          [
            { text: 'To be candid,', ko: '솔직히 말씀드리면,', isKeyChunk: false },
            { text: 'I find densely populated venues overwhelming,', ko: '인파가 밀집된 장소는 압도적이라고 느낍니다,', isKeyChunk: true },
            { text: 'as excessive noise invariably induces', ko: '과도한 소음이 변함없이 유발하기 때문에', isKeyChunk: true },
            { text: 'sensory overload and mental drain.', ko: '감각적 과부하와 정신적 탈진을.', isKeyChunk: true },
          ],
          "'sensory overload' 대신 'claustrophobic discomfort'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_going_out',
    part: 1,
    topicTitle: 'Going out',
    topicTitleKo: '외출 습관과 소지품',
    screenshotId: 'IMG_2112',
    questions: [
      {
        id: 'p1_going_q3',
        questionNumber: 3,
        question: 'Do you often bring cash with you?',
        questionKo: '외출할 때 현금을 자주 가지고 다니나요?',
        strategyTip: '모바일 결제 보편화와 현금 없는 사회(cashless ecosystem)를 서술하세요.',
        unit: createDefaultUnit(
          'u_p1_going_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Going out',
          'Do you often bring cash with you?',
          '외출할 때 현금을 자주 가지고 다니나요?',
          '디지털 결제의 편리함과 일상 변화를 설명하세요.',
          'Seldom do I carry physical banknotes nowadays, given the seamless ubiquity of mobile payment platforms across virtually all merchants.',
          '거의 모든 상점에서 모바일 결제 플랫폼의 원활한 보편성을 고려할 때, 요즘 저는 실물 지폐를 거의 들고 다니지 않습니다.',
          [
            { text: 'Seldom do I carry physical banknotes nowadays,', ko: '요즘 저는 실물 지폐를 거의 들고 다니지 않습니다,', isKeyChunk: true },
            { text: 'given the seamless ubiquity', ko: '원활한 보편성을 감안할 때', isKeyChunk: true },
            { text: 'of mobile payment platforms', ko: '모바일 결제 플랫폼의', isKeyChunk: true },
            { text: 'across virtually all merchants.', ko: '사실상 모든 상점에 걸쳐.', isKeyChunk: false },
          ],
          "'seamless ubiquity' 대신 'widespread adoption'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_staying_with_old_people',
    part: 1,
    topicTitle: 'Staying with old people',
    topicTitleKo: '노년층과의 교류',
    screenshotId: 'IMG_2113',
    questions: [
      {
        id: 'p1_old_q3',
        questionNumber: 3,
        question: 'What are the benefits of being friends with or working with old people?',
        questionKo: '어르신들과 친구가 되거나 함께 일할 때의 장점은 무엇인가요?',
        strategyTip: '인생의 경험적 지혜(experiential wisdom)와 현실적 안목을 강조하세요.',
        unit: createDefaultUnit(
          'u_p1_old_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Staying with old people',
          'What are the benefits of being friends with or working with old people?',
          '어르신들과 친구가 되거나 함께 일할 때의 장점은 무엇인가요?',
          '세대를 뛰어넘는 지혜의 가치를 고급 어휘로 표현하세요.',
          'Senior individuals possess an invaluable reservoir of experiential wisdom that provides grounded perspective during complex crises.',
          '노년층은 복잡한 위기 상황에서 현실적인 안목을 제공하는 대단히 소중한 경험적 지혜의 보고를 지니고 계십니다.',
          [
            { text: 'Senior individuals possess', ko: '어르신들은 지니고 계십니다', isKeyChunk: false },
            { text: 'an invaluable reservoir of experiential wisdom', ko: '매우 소중한 경험적 지혜의 보고를', isKeyChunk: true },
            { text: 'that provides grounded perspective', ko: '중심 잡힌 시각을 제공하는', isKeyChunk: true },
            { text: 'during complex crises.', ko: '복잡한 위기 속에서.', isKeyChunk: true },
          ],
          "'experiential wisdom' 대신 'generational insights'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_doing_something_well',
    part: 1,
    topicTitle: 'Doing something well',
    topicTitleKo: '성취와 칭찬 경험',
    screenshotId: 'IMG_2114',
    questions: [
      {
        id: 'p1_well_q1',
        questionNumber: 1,
        question: 'Do you have an experience when you did something well?',
        questionKo: '무언가를 아주 잘 해냈던 경험이 있나요?',
        strategyTip: '팀 프로젝트나 과제에서의 주도적 역할(orchestrated)을 묘사하세요.',
        unit: createDefaultUnit(
          'u_p1_well_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Doing something well',
          'Do you have an experience when you did something well?',
          '무언가를 아주 잘 해냈던 경험이 있나요?',
          '성공적인 완수와 만장일치 평가를 복합 구문으로 전달하세요.',
          'I vividly recall orchestrating a complex university research presentation that earned unanimous praise from faculty mentors.',
          '교수진으로부터 만장일치의 찬사를 받았던 복잡한 대학 연구 발표를 훌륭히 지휘했던 기억이 생생합니다.',
          [
            { text: 'I vividly recall orchestrating', ko: '성공적으로 이끌었던 기억이 생생합니다', isKeyChunk: true },
            { text: 'a complex university research presentation', ko: '복잡한 대학 연구 발표를', isKeyChunk: true },
            { text: 'that earned unanimous praise', ko: '만장일치의 찬사를 받은', isKeyChunk: true },
            { text: 'from faculty mentors.', ko: '교수 멘토들로부터.', isKeyChunk: false },
          ],
          "'earned unanimous praise' 대신 'received exemplary commendation'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_shoes',
    part: 1,
    topicTitle: 'Shoes',
    topicTitleKo: '신발과 소비 성향',
    screenshotId: 'IMG_2115',
    questions: [
      {
        id: 'p1_shoes_q4',
        questionNumber: 4,
        question: 'Which do you prefer, fashionable shoes or comfortable shoes?',
        questionKo: '유행하는 신발과 편안한 신발 중 어느 쪽을 더 선호하나요?',
        strategyTip: '인체공학적 지지력(ergonomic support)과 건강상의 이점을 우선순위로 두세요.',
        unit: createDefaultUnit(
          'u_p1_shoes_q4',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Shoes',
          'Which do you prefer, fashionable shoes or comfortable shoes?',
          '유행하는 신발과 편안한 신발 중 어느 쪽을 더 선호하나요?',
          '실용성과 척추 건강 보호의 가치를 제시하세요.',
          'I invariably prioritize ergonomic support over fleeting aesthetics, as well-cushioned footwear directly safeguards spinal posture.',
          '쿠션감이 좋은 신발이 척추 자세를 직접 보호해주기 때문에, 저는 순간적인 유행보다 인체공학적 지지력을 항상 우선시합니다.',
          [
            { text: 'I invariably prioritize ergonomic support', ko: '저는 항상 인체공학적 지지력을 우선시합니다', isKeyChunk: true },
            { text: 'over fleeting aesthetics,', ko: '순간적인 유행보다,', isKeyChunk: true },
            { text: 'as well-cushioned footwear', ko: '쿠션이 잘 된 신발은', isKeyChunk: false },
            { text: 'directly safeguards spinal posture.', ko: '척추 자세를 직접적으로 보호하기 때문에.', isKeyChunk: true },
          ],
          "'ergonomic support' 대신 'orthopedic comfort'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_rules',
    part: 1,
    topicTitle: 'Rules',
    topicTitleKo: '규칙과 규율',
    screenshotId: 'IMG_2116',
    questions: [
      {
        id: 'p1_rules_q2',
        questionNumber: 2,
        question: 'Do you think students would benefit more from more rules?',
        questionKo: '학생들에게 규칙이 더 많아지면 더 유익할 것이라고 생각하나요?',
        strategyTip: '규율(discipline)과 창의적 자율성(creative autonomy)의 균형을 논하세요.',
        unit: createDefaultUnit(
          'u_p1_rules_q2',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Rules',
          'Do you think students would benefit more from more rules?',
          '학생들에게 규칙이 더 많아지면 더 유익할 것이라고 생각하나요?',
          '제약의 증가보다 내재적 자율 훈련의 우수성을 설득력 있게 전달하세요.',
          'Excessive regulations often stifle creative exploration; rather than multiplying constraints, fostering intrinsic self-discipline yields better development.',
          '과도한 규제는 종종 창의적 탐색을 억누르므로, 제약을 늘리기보다는 내재적 자기 훈육을 길러주는 것이 더 나은 성장을 이끕니다.',
          [
            { text: 'Excessive regulations often stifle creative exploration;', ko: '지나친 규제는 종종 창의적 탐구를 억압합니다;', isKeyChunk: true },
            { text: 'rather than multiplying constraints,', ko: '제약을 배가시키기보다는,', isKeyChunk: true },
            { text: 'fostering intrinsic self-discipline', ko: '내재적 자율 규율을 기르는 것이', isKeyChunk: true },
            { text: 'yields better development.', ko: '더 나은 발전을 낳습니다.', isKeyChunk: false },
          ],
          "'stifle creative exploration' 대신 'hinder autonomous initiative'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_public_places',
    part: 1,
    topicTitle: 'Public places',
    topicTitleKo: '공공장소와 도시 공간',
    screenshotId: 'IMG_2117',
    questions: [
      {
        id: 'p1_pub_q3',
        questionNumber: 3,
        question: 'Would you like to see more public places near where you live?',
        questionKo: '거주지 주변에 더 많은 공공장소가 생겼으면 좋겠나요?',
        strategyTip: '공공 여가 시설의 확충이 시민 화합(communal cohesion)에 기여함을 강조하세요.',
        unit: createDefaultUnit(
          'u_p1_pub_q3',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Public places',
          'Would you like to see more public places near where you live?',
          '거주지 주변에 더 많은 공공장소가 생겼으면 좋겠나요?',
          '지역사회 연대감과 삶의 질 향상을 연결하세요.',
          'Expanding civic recreational spaces such as pedestrian plazas and community gardens substantially enriches neighborhood cohesion and mental well-being.',
          '보행자 광장이나 커뮤니티 정원 같은 시민 휴식 공간을 확장하면 이웃 간 결속력과 정신 건강이 크게 향상됩니다.',
          [
            { text: 'Expanding civic recreational spaces', ko: '시민 여가 공간을 확장하는 것은', isKeyChunk: true },
            { text: 'such as pedestrian plazas and community gardens', ko: '보행자 광장과 커뮤니티 정원 같은', isKeyChunk: false },
            { text: 'substantially enriches neighborhood cohesion', ko: '이웃 간의 유대감을 실질적으로 풍부하게 하고', isKeyChunk: true },
            { text: 'and mental well-being.', ko: '정신적 안녕을 증진합니다.', isKeyChunk: true },
          ],
          "'neighborhood cohesion' 대신 'social solidarity'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p1_plants',
    part: 1,
    topicTitle: 'Plants',
    topicTitleKo: '식물과 자연',
    screenshotId: 'IMG_2118',
    questions: [
      {
        id: 'p1_plant_q1',
        questionNumber: 1,
        question: 'Do you keep plants at home?',
        questionKo: '집에 식물을 키우고 있나요?',
        strategyTip: '공기 정화와 함께 일상에 차분한 평온함(calming ambiance)을 준다는 점을 말하세요.',
        unit: createDefaultUnit(
          'u_p1_plant_q1',
          'IELTS_PART_1',
          'Part 1: Personal Interview',
          'Plants',
          'Do you keep plants at home?',
          '집에 식물을 키우고 있나요?',
          '식물이 주는 쾌적함과 정서적 안정 효과를 표현하세요.',
          'I maintain several indoor succulents, which not only purify the living space but also infuse a calming ambiance into my apartment.',
          '저는 몇 개의 실내 다육식물을 키우고 있는데, 이는 생활 공간을 정화할 뿐만 아니라 아파트에 차분한 분위기를 불어넣어 줍니다.',
          [
            { text: 'I maintain several indoor succulents,', ko: '저는 몇몇 실내 다육식물을 기르고 있는데,', isKeyChunk: true },
            { text: 'which not only purify the living space', ko: '생활 공간을 정화해 줄 뿐만 아니라', isKeyChunk: true },
            { text: 'but also infuse a calming ambiance', ko: '차분한 분위기를 불어넣어 줍니다', isKeyChunk: true },
            { text: 'into my apartment.', ko: '제 아파트 안으로.', isKeyChunk: false },
          ],
          "'infuse a calming ambiance' 대신 'create a soothing domestic sanctuary'로 바꿔보세요."
        ),
      },
    ],
  },

  // =========================================================================
  // PART 2 & PART 3 TOPICS (29 Topics - IMG_2119 to IMG_2147)
  // =========================================================================
  {
    id: 'p23_unusual_meal',
    part: 2,
    topicTitle: 'An unusual meal',
    topicTitleKo: '특별하거나 특이했던 식사',
    screenshotId: 'IMG_2119',
    questions: [
      {
        id: 'p2_unusual_meal',
        question: 'Describe an unusual meal you had.',
        questionKo: '당신이 먹었던 특별하거나 특이했던 식사에 대해 이야기해 주세요.',
        strategyTip: '시기, 장소, 메뉴, 특이했던 이유 4개 항목을 시간 흐름에 따라 120초 동안 자연스럽게 연결하세요.',
        cuePoints: ['When it was', 'Where you had it', 'What you ate', 'And explain why you thought it was unusual'],
        unit: createDefaultUnit(
          'u_p2_unusual_meal',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'An unusual meal',
          'Describe an unusual meal you had.',
          '당신이 먹었던 특별하거나 특이했던 식사에 대해 이야기해 주세요.',
          '미식 모험과 오감 묘사를 포함하여 풍부한 서사를 구축하세요.',
          'I would like to recount an unforgettable gastronomic adventure I had during a hiking excursion in rural Hokkaido two autumns ago.',
          '2년 전 가을 홋카이도 시골로 하이킹 여행을 갔을 때 경험한 잊을 수 없는 미식 모험에 대해 말씀드리고자 합니다.',
          [
            { text: 'I would like to recount', ko: '저는 이야기하고 싶습니다', isKeyChunk: false },
            { text: 'an unforgettable gastronomic adventure', ko: '잊을 수 없는 미식의 모험을', isKeyChunk: true },
            { text: 'during a hiking excursion', ko: '하이킹 여행 도중', isKeyChunk: true },
            { text: 'in rural Hokkaido two autumns ago.', ko: '2년 전 가을 홋카이도 시골에서.', isKeyChunk: false },
          ],
          "'gastronomic adventure' 대신 'culinary escapade'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_popular_person',
    part: 2,
    topicTitle: 'A popular person',
    topicTitleKo: '인기 있는 사람',
    screenshotId: 'IMG_2120',
    questions: [
      {
        id: 'p2_popular_person',
        question: 'Describe a popular person.',
        questionKo: '인기 있는 사람에 대해 묘사해 주세요.',
        strategyTip: '인물의 긍정적인 카리스마와 동료들의 신뢰를 얻는 태도를 부각하세요.',
        cuePoints: ['Who this person is', 'What kind of person he or she is', 'When you see him/her normally', 'And explain why you think this person is popular'],
        unit: createDefaultUnit(
          'u_p2_popular_person',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A popular person',
          'Describe a popular person.',
          '인기 있는 사람에 대해 묘사해 주세요.',
          '감정적 지능과 타인을 배려하는 인품을 강조하세요.',
          'I would like to speak about my colleague David, whose infectious optimism and authentic empathy make him universally admired across our entire department.',
          '전염성 있는 긍정성과 진정성 어린 공감 능력으로 부서 전체에서 두루 존경받는 제 동료 데이비드에 대해 이야기하고자 합니다.',
          [
            { text: 'I would like to speak about my colleague David,', ko: '제 동료 데이비드에 대해 말씀드리고 싶습니다,', isKeyChunk: false },
            { text: 'whose infectious optimism', ko: '그의 전염성 강한 긍정주의와', isKeyChunk: true },
            { text: 'and authentic empathy', ko: '진정성 있는 공감 능력이', isKeyChunk: true },
            { text: 'make him universally admired across our entire department.', ko: '그를 부서 전체에서 보편적으로 존경받게 만듭니다.', isKeyChunk: true },
          ],
          "'infectious optimism' 대신 'radiant enthusiasm'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_natural_place',
    part: 2,
    topicTitle: 'A natural place',
    topicTitleKo: '자연 명소 (공원, 산 등)',
    screenshotId: 'IMG_2121',
    questions: [
      {
        id: 'p2_natural_place',
        question: 'Describe a natural place (e.g. parks, mountains, etc.)',
        questionKo: '자연의 장소(공원, 산 등)에 대해 묘사해 주세요.',
        strategyTip: '경관의 아름다움(scenic grandeur)과 정신적 힐링 효과를 묘사하세요.',
        cuePoints: ['Where this place is', 'How you knew this place', 'What it is like', 'And explain why you like to visit it'],
        unit: createDefaultUnit(
          'u_p2_natural_place',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A natural place',
          'Describe a natural place (e.g. parks, mountains, etc.)',
          '자연의 장소(공원, 산 등)에 대해 묘사해 주세요.',
          '장소의 지리적 특징과 마음의 안정을 주는 매력을 엮어보세요.',
          'The place I cherish most is a secluded coastal cliff situated in Jeju Island, celebrated for its emerald waters and dramatic volcanic rock formations.',
          '제가 가장 아끼는 장소는 에메랄드빛 바다와 극적인 화산암 절벽 지형으로 유명한 제주도의 한적한 해안 절벽입니다.',
          [
            { text: 'The place I cherish most is', ko: '제가 가장 아끼는 장소는 ~입니다', isKeyChunk: false },
            { text: 'a secluded coastal cliff situated in Jeju Island,', ko: '제주도에 위치한 한적한 해안 절벽,', isKeyChunk: true },
            { text: 'celebrated for its emerald waters', ko: '에메랄드빛 바다로 유명하며', isKeyChunk: true },
            { text: 'and dramatic volcanic rock formations.', ko: '극적인 화산암 지형으로.', isKeyChunk: true },
          ],
          "'secluded coastal cliff' 대신 'picturesque mountain summit'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_good_service',
    part: 2,
    topicTitle: 'Good service in a shop',
    topicTitleKo: '매장에서의 훌륭한 고객 응대 경험',
    screenshotId: 'IMG_2122',
    questions: [
      {
        id: 'p2_good_service',
        question: 'Describe a time when you received good service in a shop/store',
        questionKo: '상점이나 매장에서 훌륭한 서비스를 받았던 경험을 이야기해 주세요.',
        strategyTip: '직원의 헌신적인 태도와 고객의 기대를 뛰어넘은 감동 포인트를 전개하세요.',
        cuePoints: ['Where the shop is', 'When you went to the shop', 'What service you received from the staff', 'And explain how you felt about the service'],
        unit: createDefaultUnit(
          'u_p2_good_service',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Good service in a shop',
          'Describe a time when you received good service in a shop/store',
          '상점이나 매장에서 훌륭한 서비스를 받았던 경험을 이야기해 주세요.',
          '전문적인 서비스 마인드가 준 감동을 표현하세요.',
          'I encountered exceptional customer care at a boutique electronics workshop when the technician patiently diagnosed and resolved my laptop malfunction without any charges.',
          '한 부티크 전자 기기 수리점에서 기술자분이 노트북 고장 원인을 참을성 있게 진단하고 무료로 해결해 주셨을 때 탁월한 고객 서비스를 경험했습니다.',
          [
            { text: 'I encountered exceptional customer care', ko: '저는 탁월한 고객 관리를 경험했습니다', isKeyChunk: true },
            { text: 'at a boutique electronics workshop', ko: '한 전문 전자기기 수리점에서', isKeyChunk: false },
            { text: 'when the technician patiently diagnosed', ko: '기술자분이 참을성 있게 진단했을 때', isKeyChunk: true },
            { text: 'and resolved my laptop malfunction without any charges.', ko: '어떤 비용도 받지 않고 노트북 결함을 해결해 주며.', isKeyChunk: true },
          ],
          "'exceptional customer care' 대신 'impeccable customer hospitality'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_routine_change',
    part: 2,
    topicTitle: 'Positive change in daily routine',
    topicTitleKo: '최근 일상 속 긍정적 변화',
    screenshotId: 'IMG_2123',
    questions: [
      {
        id: 'p2_routine_change',
        question: 'Describe a positive change that you have made recently in your daily routine',
        questionKo: '최근 일상 루틴에 도입한 긍정적인 변화에 대해 말씀해 주세요.',
        strategyTip: '새로운 습관 도입 전후의 활력과 업무 집중도 차이를 비교하세요.',
        cuePoints: ['What the change is', 'How you have changed the routine', 'Why you think it is a positive change', 'And explain how you feel about the change'],
        unit: createDefaultUnit(
          'u_p2_routine_change',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Positive change in daily routine',
          'Describe a positive change that you have made recently in your daily routine',
          '최근 일상 루틴에 도입한 긍정적인 변화에 대해 말씀해 주세요.',
          '아침 명상과 운동이 가져온 신체적, 정신적 이점을 서술하세요.',
          'The most impactful habit I instituted recently is rising at six a.m. to practice mindfulness meditation followed by a vigorous brisk walk.',
          '제가 최근 도입한 가장 큰 변화는 아침 6시에 일어나 마음챙김 명상을 한 뒤 활기찬 빠른 걷기를 실천하는 루틴입니다.',
          [
            { text: 'The most impactful habit I instituted recently', ko: '내가 최근 도입한 가장 영향력 있는 습관은', isKeyChunk: true },
            { text: 'is rising at six a.m.', ko: '오전 6시에 일어나는 것입니다', isKeyChunk: false },
            { text: 'to practice mindfulness meditation', ko: '마음챙김 명상을 실천하고', isKeyChunk: true },
            { text: 'followed by a vigorous brisk walk.', ko: '뒤이어 활기찬 빠른 걷기를 하는 것.', isKeyChunk: true },
          ],
          "'mindfulness meditation' 대신 'structured journaling'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_waiting_special',
    part: 2,
    topicTitle: 'Waiting for something special',
    topicTitleKo: '특별한 일을 기다렸던 경험',
    screenshotId: 'IMG_2124',
    questions: [
      {
        id: 'p2_waiting_special',
        question: 'Describe a time when you waited for something special that would happen',
        questionKo: '특별한 일이 일어나기를 기다렸던 순간에 대해 이야기해 주세요.',
        strategyTip: '기다리는 동안의 기대감(anticipation)과 설렘, 그리고 그 결과의 감동을 전개하세요.',
        cuePoints: ['What you waited for', 'Where you waited', 'Why it was special', 'And explain how you felt while you were waiting'],
        unit: createDefaultUnit(
          'u_p2_waiting_special',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Waiting for something special',
          'Describe a time when you waited for something special that would happen',
          '특별한 일이 일어나기를 기다렸던 순간에 대해 이야기해 주세요.',
          '합격 발표를 기다리며 느꼈던 긴장감과 환희를 표현하세요.',
          'I vividly recall waiting for the admission verdict from my dream graduate school, an agonizing yet exhilarating fortnight filled with palpable anticipation.',
          '꿈에 그리던 대학원의 합격 발표를 기다리던 때가 생생히 기억나는데, 손에 잡힐 듯한 기대감으로 가득 찼던 고통스러우면서도 짜릿했던 2주간이었습니다.',
          [
            { text: 'I vividly recall waiting for', ko: '기다렸던 기억이 생생합니다', isKeyChunk: false },
            { text: 'the admission verdict from my dream graduate school,', ko: '꿈의 대학원으로부터의 합격 판정을,', isKeyChunk: true },
            { text: 'an agonizing yet exhilarating fortnight', ko: '고통스러우면서도 매우 짜릿했던 2주,', isKeyChunk: true },
            { text: 'filled with palpable anticipation.', ko: '손에 잡힐 듯한 기대감으로 가득 찬.', isKeyChunk: true },
          ],
          "'palpable anticipation' 대신 'restless suspense'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_decision_help',
    part: 2,
    topicTitle: 'Important decision made with help',
    topicTitleKo: '타인의 도움으로 내린 중요한 결정',
    screenshotId: 'IMG_2125',
    questions: [
      {
        id: 'p2_decision_help',
        question: 'Describe an important decision you made with help from others.',
        questionKo: '타인의 도움을 받아 내린 중요한 결정에 대해 이야기해 주세요.',
        strategyTip: '갈등 상황, 멘토의 조언, 그리고 그 결정이 가져온 긍정적 전환점을 강조하세요.',
        cuePoints: ['What the decision was', 'Who helped you', 'How he/she helped you', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_decision_help',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Important decision made with help',
          'Describe an important decision you made with help from others.',
          '타인의 도움을 받아 내린 중요한 결정에 대해 이야기해 주세요.',
          '진로 고민과 멘토의 객관적 조언을 논리적으로 서술하세요.',
          'I would like to speak about my pivotal decision to change my undergraduate major to computer science, a challenging transition made possible through the insightful counsel of my senior mentor.',
          '제 진로에서 매우 중대한 전환점이었던 컴퓨터공학으로의 전과 결정에 대해 말씀드리고자 하며, 이는 선배 멘토의 통찰력 있는 조언 덕분에 가능했던 도전이었습니다.',
          [
            { text: 'I would like to speak about', ko: '저는 말씀드리고자 합니다', isKeyChunk: false },
            { text: 'my pivotal decision', ko: '저의 중대한 결정을', isKeyChunk: true },
            { text: 'to change my undergraduate major to computer science,', ko: '학부 전공을 컴퓨터공학으로 바꾸기로 한,', isKeyChunk: true },
            { text: 'a challenging transition made possible', ko: '가능해졌던 도전적인 전환', isKeyChunk: true },
            { text: 'through the insightful counsel of my senior mentor.', ko: '선배 멘토의 통찰력 있는 조언을 통해.', isKeyChunk: true },
          ],
          "'pivotal decision' 대신 'life-altering choice'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_childhood_toy',
    part: 2,
    topicTitle: 'Childhood toy',
    topicTitleKo: '어린 시절 좋아했던 장난감',
    screenshotId: 'IMG_2126',
    questions: [
      {
        id: 'p2_childhood_toy',
        question: 'Describe a toy you liked in your childhood.',
        questionKo: '어린 시절 좋아했던 장난감에 대해 묘사해 주세요.',
        strategyTip: '장난감의 외형과 이를 통해 발휘했던 상상력, 조부모님과의 추억을 연결하세요.',
        cuePoints: ['What kind of toy it is', 'When you received it', 'How you played with it', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_childhood_toy',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Childhood toy',
          'Describe a toy you liked in your childhood.',
          '어린 시절 좋아했던 장난감에 대해 묘사해 주세요.',
          '장난감을 통해 자라난 창의력과 정서적 유대를 표현하세요.',
          'The toy that captured my imagination most vividly was a classic wooden building block set gifted by my grandfather on my seventh birthday.',
          '저의 상상력을 가장 생생하게 사로잡았던 장난감은 일곱 번째 생일에 할아버지께서 선물해 주신 고전적인 원목 블록 세트였습니다.',
          [
            { text: 'The toy that captured my imagination most vividly', ko: '내 상상력을 가장 생생히 사로잡았던 장난감은', isKeyChunk: true },
            { text: 'was a classic wooden building block set', ko: '고전적인 원목 블록 세트였습니다', isKeyChunk: true },
            { text: 'gifted by my grandfather', ko: '할아버지께서 선물해 주신', isKeyChunk: false },
            { text: 'on my seventh birthday.', ko: '일곱 번째 생일에.', isKeyChunk: false },
          ],
          "'captured my imagination' 대신 'sparked my boundless curiosity'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_admired_athlete',
    part: 2,
    topicTitle: 'A successful sportsperson you admire',
    topicTitleKo: '존경하는 성공한 운동선수',
    screenshotId: 'IMG_2127',
    questions: [
      {
        id: 'p2_admired_athlete',
        question: 'Describe a successful sportsperson you admire.',
        questionKo: '존경하는 성공한 스포츠 선수에 대해 이야기해 주세요.',
        strategyTip: '선수의 기록뿐 아니라 극한의 훈련 규율(ironclad discipline)과 겸손함을 부각하세요.',
        cuePoints: ['Who he/she is', 'What sport he/she does', 'What he/she has achieved', 'And explain why you admire him/her'],
        unit: createDefaultUnit(
          'u_p2_admired_athlete',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A successful sportsperson you admire',
          'Describe a successful sportsperson you admire.',
          '존경하는 성공한 스포츠 선수에 대해 이야기해 주세요.',
          '철저한 자기관리와 한계를 뛰어넘은 인간 승리를 서술하세요.',
          'I hold immense admiration for marathon runner Eliud Kipchoge, whose legendary discipline and philosophical mindset demonstrate that human potential has no limits.',
          '저는 전설적인 규율과 철학적 사고방식으로 인간의 잠재력에는 한계가 없음을 증명해 낸 마라토너 엘리우드 킵초게를 대단히 존경합니다.',
          [
            { text: 'I hold immense admiration for', ko: '저는 대단한 존경심을 갖고 있습니다', isKeyChunk: true },
            { text: 'marathon runner Eliud Kipchoge,', ko: '마라토너 엘리우드 킵초게에 대해,', isKeyChunk: false },
            { text: 'whose legendary discipline and philosophical mindset', ko: '그의 전설적인 규율과 철학적 마음가짐은', isKeyChunk: true },
            { text: 'demonstrate that human potential has no limits.', ko: '인간의 잠재력에 한계가 없음을 증명합니다.', isKeyChunk: true },
          ],
          "'immense admiration' 대신 'profound reverence'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_useful_book',
    part: 2,
    topicTitle: 'A useful book',
    topicTitleKo: '유익하게 읽었던 책',
    screenshotId: 'IMG_2128',
    questions: [
      {
        id: 'p2_useful_book',
        question: 'Describe a useful book you read.',
        questionKo: '유익하게 읽었던 책에 대해 이야기해 주세요.',
        strategyTip: '책의 핵심 메시지와 그것이 본인의 습관/의사결정에 미친 구체적 영향을 연결하세요.',
        cuePoints: ['What it is', 'When you read it', 'What it is about', 'And explain why you think it is useful'],
        unit: createDefaultUnit(
          'u_p2_useful_book',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A useful book',
          'Describe a useful book you read.',
          '유익하게 읽었던 책에 대해 이야기해 주세요.',
          '과학적 근거에 기반한 행동 변화의 실질적 유용성을 제시하세요.',
          'A deeply transformative book I recently completed is "Atomic Habits" by James Clear, which offers scientifically backed strategies for personal productivity and behavioral change.',
          '최근 완독한 매우 변화무쌍한 책은 제임스 클리어의 "아주 작은 습관의 힘"으로, 개인 생산성과 행동 변화를 위한 과학적으로 검증된 전략들을 제공합니다.',
          [
            { text: 'A deeply transformative book I recently completed', ko: '제가 최근 완독한 깊이 있는 변화를 준 책은', isKeyChunk: true },
            { text: 'is "Atomic Habits" by James Clear,', ko: '제임스 클리어의 "아주 작은 습관의 힘"이며,', isKeyChunk: false },
            { text: 'which offers scientifically backed strategies', ko: '과학적으로 뒷받침된 전략을 제공합니다', isKeyChunk: true },
            { text: 'for personal productivity and behavioral change.', ko: '개인 생산성과 행동 변화를 위한.', isKeyChunk: true },
          ],
          "'scientifically backed strategies' 대신 'empirically grounded principles'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_science_field',
    part: 2,
    topicTitle: 'An area/subject of science',
    topicTitleKo: '관심 있는 과학 분야/학문',
    screenshotId: 'IMG_2129',
    questions: [
      {
        id: 'p2_science_field',
        question: 'Describe an area/subject of science that you are interested in.',
        questionKo: '관심을 갖고 있는 과학 분야나 주제에 대해 설명해 주세요.',
        strategyTip: '인간 두뇌와 인공지능의 유사성 등 미래 지향적인 학문적 호기심을 피력하세요.',
        cuePoints: ['What it is', 'When you first knew it', 'How you learned it', 'And explain why you are interested in it'],
        unit: createDefaultUnit(
          'u_p2_science_field',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'An area/subject of science',
          'Describe an area/subject of science that you are interested in.',
          '관심을 갖고 있는 과학 분야나 주제에 대해 설명해 주세요.',
          '뇌과학과 머신러닝의 융합에 대한 학문적 열정을 진술하세요.',
          'I have developed a profound fascination with cognitive neuroscience, particularly how artificial neural architectures mirror the biological pathways of human memory.',
          '저는 인지 신경과학, 특히 인공 신경망 구조가 인간 기억의 생물학적 경로를 어떻게 모방하는지에 대해 깊은 매료를 느끼고 있습니다.',
          [
            { text: 'I have developed a profound fascination with', ko: '저는 깊은 매료를 느껴왔습니다', isKeyChunk: true },
            { text: 'cognitive neuroscience,', ko: '인지 신경과학에,', isKeyChunk: true },
            { text: 'particularly how artificial neural architectures', ko: '특히 인공 신경망 구조가', isKeyChunk: true },
            { text: 'mirror the biological pathways of human memory.', ko: '인간 기억의 생물학적 경로를 어떻게 모방하는지에.', isKeyChunk: true },
          ],
          "'profound fascination' 대신 'keen intellectual intrigue'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_broken_thing',
    part: 2,
    topicTitle: 'A time when you broke something',
    topicTitleKo: '물건을 망가뜨렸던 일화',
    screenshotId: 'IMG_2130',
    questions: [
      {
        id: 'p2_broken_thing',
        question: 'Describe a time when you broke something.',
        questionKo: '물건을 깨뜨리거나 망가뜨렸던 경험에 대해 말씀해 주세요.',
        strategyTip: '부주의했던 원인, 당혹스러웠던 심경, 그리고 사후 수습과 교훈을 전개하세요.',
        cuePoints: ['What it was', 'When it happened', 'How you broke it', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_broken_thing',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A time when you broke something',
          'Describe a time when you broke something.',
          '물건을 깨뜨리거나 망가뜨렸던 경험에 대해 말씀해 주세요.',
          '가족 모임 전 긴장 속에서 겪은 당혹감과 실수를 생생히 묘사하세요.',
          'I distinctly remember accidentally shattering an antique ceramic vase while hastily rearranging the living room furniture before an annual family reunion.',
          '연례 가족 모임을 앞두고 거실 가구를 서둘러 재배치하다가 실수로 골동품 도자기 꽃병을 산산조각 냈던 기억이 생생합니다.',
          [
            { text: 'I distinctly remember accidentally shattering', ko: '실수로 산산조각 냈던 기억이 생생합니다', isKeyChunk: true },
            { text: 'an antique ceramic vase', ko: '골동품 도자기 꽃병을', isKeyChunk: true },
            { text: 'while hastily rearranging the living room furniture', ko: '거실 가구를 서둘러 재배치하던 도중', isKeyChunk: true },
            { text: 'before an annual family reunion.', ko: '연례 가족 모임 전에.', isKeyChunk: false },
          ],
          "'accidentally shattering' 대신 'inadvertently fracturing'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_social_media',
    part: 2,
    topicTitle: 'Something interesting on social media',
    topicTitleKo: '소셜 미디어에서 본 흥미로운 콘텐츠',
    screenshotId: 'IMG_2131',
    questions: [
      {
        id: 'p2_social_media',
        question: 'Describe something interesting you saw on social media.',
        questionKo: '소셜 미디어에서 보았던 흥미로운 콘텐츠에 대해 이야기해 주세요.',
        strategyTip: '단순한 오락물이 아닌, 해양 보전이나 혁신 기술 같은 유익한 주제를 선택하세요.',
        cuePoints: ['When you saw it', 'Where you saw it', 'What it was', 'And explain why you think it was interesting'],
        unit: createDefaultUnit(
          'u_p2_social_media',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Something interesting on social media',
          'Describe something interesting you saw on social media.',
          '소셜 미디어에서 보았던 흥미로운 콘텐츠에 대해 이야기해 주세요.',
          '해양 생태계 복원 기술이 준 신선한 지적 자극을 표현하세요.',
          'I recently encountered a captivating short documentary on Instagram showcasing how marine biologists are employing 3D printing to restore degraded coral reef ecosystems.',
          '최근 인스타그램에서 해양 생물학자들이 퇴화한 산호초 생태계를 복원하기 위해 3D 프린팅을 어떻게 활용하고 있는지 보여주는 매혹적인 짧은 다큐멘터리를 보았습니다.',
          [
            { text: 'I recently encountered a captivating short documentary', ko: '최근 매혹적인 짧은 다큐멘터리를 접했습니다', isKeyChunk: true },
            { text: 'on Instagram showcasing how marine biologists', ko: '해양 생물학자들이 어떻게 하는지 보여주는 인스타그램에서', isKeyChunk: false },
            { text: 'are employing 3D printing', ko: '3D 프린팅을 활용하고 있는지', isKeyChunk: true },
            { text: 'to restore degraded coral reef ecosystems.', ko: '훼손된 산호초 생태계를 복원하기 위해.', isKeyChunk: true },
          ],
          "'captivating short documentary' 대신 'riveting video exposé'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_foreign_language',
    part: 2,
    topicTitle: 'First time talked in a foreign language',
    topicTitleKo: '외국어로 처음 대화했던 순간',
    screenshotId: 'IMG_2132',
    questions: [
      {
        id: 'p2_foreign_language',
        question: 'Describe the first time you talked in a foreign language.',
        questionKo: '외국어로 처음 이야기했던 경험에 대해 묘사해 주세요.',
        strategyTip: '초기의 불안감(apprehension)과 성공적인 의사소통 후의 성취감을 대비시키세요.',
        cuePoints: ['When it was', 'Who you talked to', 'What you talked about', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_foreign_language',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'First time talked in a foreign language',
          'Describe the first time you talked in a foreign language.',
          '외국어로 처음 이야기했던 경험에 대해 묘사해 주세요.',
          '언어 장벽을 넘어선 소통의 짜릿함과 자신감 획득을 서술하세요.',
          'The first time I communicated in English was during a family vacation to Singapore, when I timidly asked a local transit officer for directions to the national museum.',
          '제가 처음 영어로 소통했던 것은 싱가포르 가족 여행 때였는데, 국립 박물관으로 가는 길을 현지 대중교통 직원에게 조심스레 물어보았을 때였습니다.',
          [
            { text: 'The first time I communicated in English was', ko: '제가 처음 영어로 소통했던 때는 ~였습니다', isKeyChunk: false },
            { text: 'during a family vacation to Singapore,', ko: '싱가포르 가족 휴가 중에,', isKeyChunk: false },
            { text: 'when I timidly asked a local transit officer', ko: '현지 교통 직원에게 소심하게 물었을 때', isKeyChunk: true },
            { text: 'for directions to the national museum.', ko: '국립 박물관으로 가는 길을.', isKeyChunk: true },
          ],
          "'timidly asked' 대신 'tentatively inquired'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_family_old_thing',
    part: 2,
    topicTitle: 'Important old thing family kept',
    topicTitleKo: '가족이 오랫동안 보관해 온 오래된 물건',
    screenshotId: 'IMG_2133',
    questions: [
      {
        id: 'p2_family_old_thing',
        question: 'Describe an important old thing that your family has kept for a long time.',
        questionKo: '가족이 오랫동안 소중히 간직해 온 오래된 물건에 대해 이야기해 주세요.',
        strategyTip: '물건의 역사적 맥락과 3대에 걸친 가족의 정서적 유대감을 강조하세요.',
        cuePoints: ['What it is', 'How your family got it', 'How long your family has kept it', 'And explain why it is important'],
        unit: createDefaultUnit(
          'u_p2_family_old_thing',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Important old thing family kept',
          'Describe an important old thing that your family has kept for a long time.',
          '가족이 오랫동안 소중히 간직해 온 오래된 물건에 대해 이야기해 주세요.',
          '대를 이어온 가보의 상징성과 정서적 연속성을 표현하세요.',
          'An invaluable heirloom preserved in our household is a hand-wound mechanical wristwatch passed down across three generations from my great-grandfather.',
          '우리 집안에 보존된 매우 소중한 가보는 증조할아버지 때부터 3대에 걸쳐 전해 내려온 수동 기계식 손목시계입니다.',
          [
            { text: 'An invaluable heirloom preserved in our household', ko: '우리 가정에 보존된 소중한 가보는', isKeyChunk: true },
            { text: 'is a hand-wound mechanical wristwatch', ko: '수동 태엽 기계식 손목시계입니다', isKeyChunk: true },
            { text: 'passed down across three generations', ko: '3대에 걸쳐 전수된', isKeyChunk: true },
            { text: 'from my great-grandfather.', ko: '증조부로부터.', isKeyChunk: false },
          ],
          "'invaluable heirloom' 대신 'treasured ancestral relic'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_creative_person',
    part: 2,
    topicTitle: 'A creative person you admire',
    topicTitleKo: '존경하는 창의적인 인물',
    screenshotId: 'IMG_2134',
    questions: [
      {
        id: 'p2_creative_person',
        question: 'Describe a creative person you admire.',
        questionKo: '존경하는 창의적인 인물에 대해 묘사해 주세요.',
        strategyTip: '인물의 독창적인 예술 세계와 생태 철학, 인간적 울림을 부각하세요.',
        cuePoints: ['Who this person is', 'What he/she makes or does', 'Why he/she is creative', 'And explain why you admire him/her'],
        unit: createDefaultUnit(
          'u_p2_creative_person',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A creative person you admire',
          'Describe a creative person you admire.',
          '존경하는 창의적인 인물에 대해 묘사해 주세요.',
          '자연주의와 인본주의를 융합한 독창적 예술혼을 전달하세요.',
          'I deeply revere the visionary film director Hayao Miyazaki, whose evocative hand-drawn animations seamlessly blend ecological parables with profound humanistic philosophy.',
          '저는 생태학적 우화와 깊이 있는 인본주의 철학을 매끄럽게 결합해 낸 감동적인 손그림 애니메이션의 선구자적 영화감독 미야자키 하야오를 깊이 존경합니다.',
          [
            { text: 'I deeply revere the visionary film director Hayao Miyazaki,', ko: '저는 비전을 가진 영화감독 미야자키 하야오를 깊이 숭경합니다,', isKeyChunk: true },
            { text: 'whose evocative hand-drawn animations', ko: '그의 감동적인 수채화풍 애니메이션은', isKeyChunk: true },
            { text: 'seamlessly blend ecological parables', ko: '생태학적 우화를 매끄럽게 융합합니다', isKeyChunk: true },
            { text: 'with profound humanistic philosophy.', ko: '심오한 인본주의 철학과 함께.', isKeyChunk: true },
          ],
          "'visionary film director' 대신 'pioneering cinematic auteur'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_exciting_activity',
    part: 2,
    topicTitle: 'An exciting activity tried for first time',
    topicTitleKo: '처음 시도해 본 신나는 활동',
    screenshotId: 'IMG_2135',
    questions: [
      {
        id: 'p2_exciting_activity',
        question: 'Describe an exciting activity you tried for the first time.',
        questionKo: '처음 시도해 보았던 흥미진진한 활동에 대해 말씀해 주세요.',
        strategyTip: '공중에서의 아드레날린 분비와 탁 트인 파노라마 전경의 해방감을 서술하세요.',
        cuePoints: ['What it was', 'Where you did it', 'Who you did it with', 'And explain why you felt excited'],
        unit: createDefaultUnit(
          'u_p2_exciting_activity',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'An exciting activity tried for first time',
          'Describe an exciting activity you tried for the first time.',
          '처음 시도해 보았던 흥미진진한 활동에 대해 말씀해 주세요.',
          '패러글라이딩의 아찔함과 공중에서 바라본 대자연의 경이로움을 묘사하세요.',
          'An exhilarating activity I undertook for the first time was tandem paragliding off a coastal cliff in Danyang, which granted me a breathtaking bird’s-eye perspective of the landscape.',
          '제가 처음으로 도전했던 매우 짜릿한 활동은 단양의 해안 절벽에서 탄 2인승 패러글라이딩이었는데, 주변 풍경의 숨 막히는 조감도를 선사해 주었습니다.',
          [
            { text: 'An exhilarating activity I undertook for the first time', ko: '내가 처음 시도했던 매우 짜릿한 활동은', isKeyChunk: true },
            { text: 'was tandem paragliding off a coastal cliff in Danyang,', ko: '단양의 절벽에서 즐긴 텐덤 패러글라이딩이었으며,', isKeyChunk: true },
            { text: 'which granted me a breathtaking bird’s-eye perspective', ko: '숨 막히는 조감도를 제게 선사했습니다', isKeyChunk: true },
            { text: 'of the landscape.', ko: '그 풍경의.', isKeyChunk: false },
          ],
          "'exhilarating activity' 대신 'spine-tingling pursuit'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_friend_habit',
    part: 2,
    topicTitle: 'A good habit your friend has',
    topicTitleKo: '친구의 본받고 싶은 좋은 습관',
    screenshotId: 'IMG_2136',
    questions: [
      {
        id: 'p2_friend_habit',
        question: 'Describe a good habit your friend has.',
        questionKo: '친구의 본받고 싶은 좋은 습관에 대해 이야기해 주세요.',
        strategyTip: '디지털 디톡스의 구체적 실천법과 그것이 주는 정신적 명료함을 설명하세요.',
        cuePoints: ['What the habit is', 'How he/she formed it', 'Why it is good', 'And explain how it influences you'],
        unit: createDefaultUnit(
          'u_p2_friend_habit',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A good habit your friend has',
          'Describe a good habit your friend has.',
          '친구의 본받고 싶은 좋은 습관에 대해 이야기해 주세요.',
          '스마트폰 절제를 통한 마음의 평화와 본인의 긍정적 모방을 다루세요.',
          'A commendable habit embodied by my close friend Min-woo is his unwavering commitment to digital detox every Sunday evening, which fosters remarkable mental clarity.',
          '제 절친한 친구 민우가 지닌 본받을 만한 습관은 일요일 저녁마다 디지털 디톡스를 철저히 지키는 것으로, 이는 놀라운 정신적 명료함을 가져다줍니다.',
          [
            { text: 'A commendable habit embodied by my close friend Min-woo', ko: '내 친한 친구 민우가 체화한 본받을 만한 습관은', isKeyChunk: true },
            { text: 'is his unwavering commitment to digital detox', ko: '디지털 디톡스에 대한 흔들림 없는 실천이며', isKeyChunk: true },
            { text: 'every Sunday evening,', ko: '매주 일요일 저녁마다,', isKeyChunk: false },
            { text: 'which fosters remarkable mental clarity.', ko: '이는 뛰어난 정신적 맑음을 길러줍니다.', isKeyChunk: true },
          ],
          "'commendable habit' 대신 'exemplary discipline'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_apology_received',
    part: 2,
    topicTitle: 'A time someone apologized to you',
    topicTitleKo: '누군가 나에게 사과했던 경험',
    screenshotId: 'IMG_2137',
    questions: [
      {
        id: 'p2_apology_received',
        question: 'Describe a time someone apologized to you.',
        questionKo: '누군가가 당신에게 사과했던 일화에 대해 말씀해 주세요.',
        strategyTip: '갈등의 배경과 진심 어린 사과가 신뢰 회복으로 이어진 과정을 서술하세요.',
        cuePoints: ['Who this person was', 'Why he/she apologized to you', 'How you reacted', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_apology_received',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A time someone apologized to you',
          'Describe a time someone apologized to you.',
          '누군가가 당신에게 사과했던 일화에 대해 말씀해 주세요.',
          '진솔한 책임 인정과 화해를 통한 관계 성숙을 표현하세요.',
          'I remember a sincere apology from a project teammate who missed a critical deadline due to personal distress, whose transparent accountability instantly resolved our interpersonal friction.',
          '개인적인 어려움으로 결정적인 마감일을 놓쳤던 프로젝트 팀원의 진심 어린 사과가 기억나는데, 그의 투명한 책임 인정은 우리 사이의 대인 관계 갈등을 즉시 해소해 주었습니다.',
          [
            { text: 'I remember a sincere apology from a project teammate', ko: '프로젝트 팀원의 진심 어린 사과를 기억합니다', isKeyChunk: true },
            { text: 'who missed a critical deadline due to personal distress,', ko: '개인적 곤란으로 중요 마감을 놓쳤던,', isKeyChunk: true },
            { text: 'whose transparent accountability', ko: '그의 투명한 책임감은', isKeyChunk: true },
            { text: 'instantly resolved our interpersonal friction.', ko: '우리의 대인 갈등을 즉시 해결했습니다.', isKeyChunk: true },
          ],
          "'transparent accountability' 대신 'unreserved ownership'으로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_power_outage',
    part: 2,
    topicTitle: 'A time electricity suddenly went off',
    topicTitleKo: '갑자기 정전되었던 순간',
    screenshotId: 'IMG_2138',
    questions: [
      {
        id: 'p2_power_outage',
        question: 'Describe a time when the electricity suddenly went off.',
        questionKo: '갑작스럽게 정전이 발생했던 경험에 대해 이야기해 주세요.',
        strategyTip: '태풍 속 돌발 정전 상황과 촛불 아래 가족들과 진솔한 대화를 나눈 뜻밖의 따뜻함을 대조하세요.',
        cuePoints: ['When it happened', 'Where you were', 'What you were doing', 'And explain how you handled the situation'],
        unit: createDefaultUnit(
          'u_p2_power_outage',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A time electricity suddenly went off',
          'Describe a time when the electricity suddenly went off.',
          '갑작스럽게 정전이 발생했던 경험에 대해 이야기해 주세요.',
          '문명의 암전 속에서 찾은 아날로그적 온기와 유대를 묘사하세요.',
          'I recall an unexpected electrical blackout during a torrential summer typhoon, which abruptly plunged our entire apartment complex into pitch darkness.',
          '폭우가 쏟아지던 여름 태풍 당시 발생한 예기치 못한 정전이 기억나는데, 아파트 단지 전체가 순식간에 칠흑 같은 어둠에 휩싸였습니다.',
          [
            { text: 'I recall an unexpected electrical blackout', ko: '예기치 못한 정전을 회상합니다', isKeyChunk: true },
            { text: 'during a torrential summer typhoon,', ko: '폭우가 쏟아지던 여름 태풍 동안,', isKeyChunk: false },
            { text: 'which abruptly plunged our entire apartment complex', ko: '우리 아파트 단지 전체를 갑작스럽게 몰아넣은', isKeyChunk: true },
            { text: 'into pitch darkness.', ko: '칠흑 같은 어둠 속으로.', isKeyChunk: true },
          ],
          "'pitch darkness' 대신 'complete obscurity'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_traditional_story',
    part: 2,
    topicTitle: 'An interesting traditional story',
    topicTitleKo: '흥미로운 전통 이야기',
    screenshotId: 'IMG_2139',
    questions: [
      {
        id: 'p2_traditional_story',
        question: 'Describe an interesting traditional story you know.',
        questionKo: '흥미로운 전통 이야기나 전래동화에 대해 말씀해 주세요.',
        strategyTip: '줄거리 요약과 함께 그 설화가 전달하는 도덕적 권선징악의 교훈을 강조하세요.',
        cuePoints: ['What the story is about', 'Who told you the story', 'Why you find it interesting', 'And explain what moral lesson it conveys'],
        unit: createDefaultUnit(
          'u_p2_traditional_story',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'An interesting traditional story',
          'Describe an interesting traditional story you know.',
          '흥미로운 전통 이야기나 전래동화에 대해 말씀해 주세요.',
          '흥부놀부 설화가 담고 있는 권선징악과 나눔의 교훈을 설명하세요.',
          'A fascinating Korean folklore tale I grew up hearing is the legend of "Heungbu and Nolbu", an allegorical narrative that vividly contrasts greed with unconditional kindness.',
          '제가 자라면서 들었던 매력적인 한국 전래동화는 "흥부와 놀부" 이야기로, 탐욕과 대가 없는 친절을 생생하게 대조하는 우화적 서사입니다.',
          [
            { text: 'A fascinating Korean folklore tale I grew up hearing', ko: '내가 자라며 들었던 매혹적인 한국 민담은', isKeyChunk: true },
            { text: 'is the legend of "Heungbu and Nolbu",', ko: '"흥부와 놀부" 전설이며,', isKeyChunk: false },
            { text: 'an allegorical narrative that vividly contrasts', ko: '생생히 대비시키는 우화적 서사입니다', isKeyChunk: true },
            { text: 'greed with unconditional kindness.', ko: '탐욕과 조건 없는 친절을.', isKeyChunk: true },
          ],
          "'allegorical narrative' 대신 'didactic parable'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_long_journey',
    part: 2,
    topicTitle: 'A long journey you would like to take again',
    topicTitleKo: '다시 떠나고 싶은 긴 여행',
    screenshotId: 'IMG_2140',
    questions: [
      {
        id: 'p2_long_journey',
        question: 'Describe a long journey you would like to take again.',
        questionKo: '다시 경험해보고 싶은 장거리 여행에 대해 이야기해 주세요.',
        strategyTip: '이동 수단(파노라마 기차)과 알프스 산맥의 웅장함, 감정적 정화를 진술하세요.',
        cuePoints: ['Where you went', 'How you traveled', 'Who you traveled with', 'And explain why you want to take it again'],
        unit: createDefaultUnit(
          'u_p2_long_journey',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A long journey you would like to take again',
          'Describe a long journey you would like to take again.',
          '다시 경험해보고 싶은 장거리 여행에 대해 이야기해 주세요.',
          '스위스 알프스 철도 횡단이 준 시각적 황홀경과 평온을 표현하세요.',
          'A transcontinental rail journey across Switzerland remains the most majestic voyage of my life, and I yearn to experience those panoramic alpine landscapes once again.',
          '스위스를 횡단하는 대륙 횡단 기차 여행은 제 인생에서 가장 장엄한 여정으로 남아 있으며, 그 파노라마 알프스 풍경을 다시 한번 경험하기를 간절히 바라고 있습니다.',
          [
            { text: 'A transcontinental rail journey across Switzerland', ko: '스위스를 가로지르는 대륙 횡단 철도 여행은', isKeyChunk: true },
            { text: 'remains the most majestic voyage of my life,', ko: '내 인생에서 가장 웅장한 여정으로 남아 있으며,', isKeyChunk: true },
            { text: 'and I yearn to experience', ko: '다시 경험하기를 갈망합니다', isKeyChunk: true },
            { text: 'those panoramic alpine landscapes once again.', ko: '그 파노라마 알프스 풍경을 다시 한번.', isKeyChunk: false },
          ],
          "'majestic voyage' 대신 'sublime pilgrimage'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_great_dinner',
    part: 2,
    topicTitle: 'A great dinner enjoyed with friends/family',
    topicTitleKo: '친구 또는 가족과 함께한 멋진 저녁 식사',
    screenshotId: 'IMG_2141',
    questions: [
      {
        id: 'p2_great_dinner',
        question: 'Describe a great dinner you had with friends or family.',
        questionKo: '친구 또는 가족과 함께 즐겼던 최고의 저녁 식사에 대해 이야기해 주세요.',
        strategyTip: '음식의 맛뿐 아니라 졸업 직후의 홀가분함과 청춘의 축하 분위기를 담으세요.',
        cuePoints: ['When it happened', 'Who was there', 'What you ate', 'And explain why it was memorable'],
        unit: createDefaultUnit(
          'u_p2_great_dinner',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A great dinner enjoyed with friends/family',
          'Describe a great dinner you had with friends or family.',
          '친구 또는 가족과 함께 즐겼던 최고의 저녁 식사에 대해 이야기해 주세요.',
          '동고동락했던 대학 동기들과의 축하 만찬을 따뜻한 어조로 진술하세요.',
          'An extraordinary dinner I cherish was our celebratory rooftop barbecue following our university graduation, where we reminisced about shared struggles over grilled delicacies.',
          '제가 소중히 간직하는 특별한 저녁 식사는 대학교 졸업식 직후의 루프탑 축하 바비큐였는데, 구운 요리를 나누며 함께했던 고난의 추억들을 회상했습니다.',
          [
            { text: 'An extraordinary dinner I cherish was', ko: '내가 소중히 여기는 특별한 저녁은 ~였습니다', isKeyChunk: false },
            { text: 'our celebratory rooftop barbecue following our university graduation,', ko: '대학 졸업 직후의 축하 옥상 바비큐 파티,', isKeyChunk: true },
            { text: 'where we reminisced about shared struggles', ko: '함께 겪은 고난을 회상하며', isKeyChunk: true },
            { text: 'over grilled delicacies.', ko: '맛있는 구이 요리를 즐기며.', isKeyChunk: true },
          ],
          "'reminisced about shared struggles' 대신 'celebrated shared milestones'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_talent_to_improve',
    part: 2,
    topicTitle: 'A natural talent you want to improve',
    topicTitleKo: '더 발전시키고 싶은 타고난 재능',
    screenshotId: 'IMG_2142',
    questions: [
      {
        id: 'p2_talent_to_improve',
        question: 'Describe a natural talent you want to improve.',
        questionKo: '더 개발하고 싶은 본인의 타고난 재능에 대해 설명해 주세요.',
        strategyTip: '사진 구도에 대한 직관적 감각과 향후 체계적인 이론/실습 계획을 연결하세요.',
        cuePoints: ['What the talent is', 'When you discovered it', 'How you plan to improve it', 'And explain why you want to improve it'],
        unit: createDefaultUnit(
          'u_p2_talent_to_improve',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A natural talent you want to improve',
          'Describe a natural talent you want to improve.',
          '더 개발하고 싶은 본인의 타고난 재능에 대해 설명해 주세요.',
          '공간 구도 감각과 시각적 스토리텔링 역량을 더욱 완성하겠다는 포부를 서술하세요.',
          'A dormant aptitude I strive to hone further is my intuitive sense of spatial composition in photography, which I hope to elevate through systematic technical training.',
          '제가 더 갈고닦고자 노력하는 잠재적 재능은 사진 촬영에서의 직관적인 공간 구도 감각이며, 체계적인 기술 훈련을 통해 이를 더욱 끌어올리고자 합니다.',
          [
            { text: 'A dormant aptitude I strive to hone further', ko: '더 연마하고자 노력하는 잠재적 재능은', isKeyChunk: true },
            { text: 'is my intuitive sense of spatial composition in photography,', ko: '사진 촬영 시 공간 구도에 대한 직관적인 감각이며,', isKeyChunk: true },
            { text: 'which I hope to elevate', ko: '더 높이 끌어올리길 희망합니다', isKeyChunk: false },
            { text: 'through systematic technical training.', ko: '체계적인 기술 훈련을 통해.', isKeyChunk: true },
          ],
          "'dormant aptitude' 대신 'innate visual flair'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_family_business',
    part: 2,
    topicTitle: 'Person who enjoys working for family business',
    topicTitleKo: '가족 기업에서 일하는 것을 즐기는 사람',
    screenshotId: 'IMG_2143',
    questions: [
      {
        id: 'p2_family_business',
        question: 'Describe a person who enjoys working for a family business.',
        questionKo: '가업이나 가족 사업에서 즐겁게 일하는 사람에 대해 이야기해 주세요.',
        strategyTip: '장인 정신의 계승과 현대적 마케팅/레시피 혁신의 결합을 조명하세요.',
        cuePoints: ['Who this person is', 'What the business is', 'What he/she does', 'And explain why he/she enjoys it'],
        unit: createDefaultUnit(
          'u_p2_family_business',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'Person who enjoys working for family business',
          'Describe a person who enjoys working for a family business.',
          '가업이나 가족 사업에서 즐겁게 일하는 사람에 대해 이야기해 주세요.',
          '전통 발효 베이커리를 현대화하며 보람을 느끼는 사촌의 열정을 서술하세요.',
          'My cousin Jin-ho derives profound fulfillment from managing our family’s artisanal bakery, seamlessly modernizing traditional sourdough recipes while preserving heritage craftsmanship.',
          '제 사촌 진호는 가문의 전통 수제 베이커리를 운영하면서 큰 보람을 느끼고 있으며, 고유의 장인 정신을 지키면서도 전통 사워도우 레시피를 매끄럽게 현대화하고 있습니다.',
          [
            { text: 'My cousin Jin-ho derives profound fulfillment', ko: '사촌 진호는 깊은 성취감을 얻습니다', isKeyChunk: true },
            { text: 'from managing our family’s artisanal bakery,', ko: '가족의 장인 베이커리를 운영하는 것에서,', isKeyChunk: true },
            { text: 'seamlessly modernizing traditional sourdough recipes', ko: '전통 사워도우 레시피를 매끄럽게 현대화하면서', isKeyChunk: true },
            { text: 'while preserving heritage craftsmanship.', ko: '전통적인 장인 기술을 보존하면서.', isKeyChunk: true },
          ],
          "'profound fulfillment' 대신 'deep-seated pride'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_lost_way',
    part: 2,
    topicTitle: 'An occasion when you lost your way',
    topicTitleKo: '길을 잃었던 경험',
    screenshotId: 'IMG_2144',
    questions: [
      {
        id: 'p2_lost_way',
        question: 'Describe an occasion when you lost your way.',
        questionKo: '길을 잃었던 일화에 대해 말씀해 주세요.',
        strategyTip: '황혼 무렵 베니스의 미로 같은 골목길과 예상치 못한 숨은 명소 발견의 즐거움을 엮으세요.',
        cuePoints: ['Where you were', 'How you got lost', 'How you found your way', 'And explain how you felt about it'],
        unit: createDefaultUnit(
          'u_p2_lost_way',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'An occasion when you lost your way',
          'Describe an occasion when you lost your way.',
          '길을 잃었던 일화에 대해 말씀해 주세요.',
          '방향 상실의 당혹감이 우연한 세렌디피티(serendipity)로 바뀐 경험을 서술하세요.',
          'I found myself completely disoriented while navigating the labyrinthine back alleys of Venice during a foggy twilight, which ultimately turned into an unexpected adventure.',
          '안개 낀 황혼 무렵 베니스의 미로 같은 뒷골목을 걷다가 완전히 방향 감각을 잃었지만, 그것은 결국 뜻밖의 멋진 모험으로 이어졌습니다.',
          [
            { text: 'I found myself completely disoriented', ko: '완전히 방향 감각을 잃었습니다', isKeyChunk: true },
            { text: 'while navigating the labyrinthine back alleys of Venice', ko: '베니스의 미로 같은 뒷골목을 헤매던 도중', isKeyChunk: true },
            { text: 'during a foggy twilight,', ko: '안개 자욱한 황혼녘에,', isKeyChunk: false },
            { text: 'which ultimately turned into an unexpected adventure.', ko: '결국 예상치 못한 모험으로 전환된.', isKeyChunk: true },
          ],
          "'completely disoriented' 대신 'utterly confounded'로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_important_friend',
    part: 2,
    topicTitle: 'A good friend who is important to you',
    topicTitleKo: '나에게 소중한 좋은 친구',
    screenshotId: 'IMG_2145',
    questions: [
      {
        id: 'p2_important_friend',
        question: 'Describe a good friend who is important to you.',
        questionKo: '당신에게 중요한 좋은 친구에 대해 이야기해 주세요.',
        strategyTip: '오랜 우정의 역사와 인생의 갈림길마다 든든한 버팀목(pillar of strength)이 되어준 점을 강조하세요.',
        cuePoints: ['Who this friend is', 'How long you have known each other', 'What you do together', 'And explain why he/she is important to you'],
        unit: createDefaultUnit(
          'u_p2_important_friend',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A good friend who is important to you',
          'Describe a good friend who is important to you.',
          '당신에게 중요한 좋은 친구에 대해 이야기해 주세요.',
          '변함없는 신뢰와 객관적인 멘토링 역할을 겸해주는 친구의 소중함을 표현하세요.',
          'An indispensable pillar in my life is my childhood confidant Eric, whose steadfast loyalty and objective advice have steered me through several major life crossroads.',
          '제 삶에서 없어서는 안 될 버팀목은 오랜 친구 에릭으로, 그의 흔들림 없는 의리와 객관적인 조언은 제가 몇 차례의 중대한 인생 갈림길을 헤쳐 나갈 수 있도록 이끌어 주었습니다.',
          [
            { text: 'An indispensable pillar in my life', ko: '내 인생에 없어서는 안 될 기둥은', isKeyChunk: true },
            { text: 'is my childhood confidant Eric,', ko: '어린 시절부터의 절친 에릭이며,', isKeyChunk: false },
            { text: 'whose steadfast loyalty and objective advice', ko: '그의 변함없는 의리와 객관적 조언은', isKeyChunk: true },
            { text: 'have steered me through several major life crossroads.', ko: '여러 주요 인생 갈림길에서 나를 이끌어 주었습니다.', isKeyChunk: true },
          ],
          "'indispensable pillar' 대신 'rock-solid anchor'로 치환해보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_wild_animal',
    part: 2,
    topicTitle: 'A wild animal to learn more about',
    topicTitleKo: '더 알고 싶은 야생 동물',
    screenshotId: 'IMG_2146',
    questions: [
      {
        id: 'p2_wild_animal',
        question: 'Describe a wild animal you would like to learn more about.',
        questionKo: '더 깊이 알고 싶은 야생 동물에 대해 설명해 주세요.',
        strategyTip: '눈표범(snow leopard)의 험준한 서식지, 위장 능력, 생태적 보전 가치를 지적 어휘로 진술하세요.',
        cuePoints: ['What animal it is', 'Where it lives', 'What it looks like', 'And explain why you want to learn more about it'],
        unit: createDefaultUnit(
          'u_p2_wild_animal',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A wild animal to learn more about',
          'Describe a wild animal you would like to learn more about.',
          '더 깊이 알고 싶은 야생 동물에 대해 설명해 주세요.',
          '중앙아시아 고산지대 포식자의 진화적 적응과 생태계 보호 필요성을 전달하세요.',
          'I am endlessly intrigued by the elusive snow leopard of Central Asia, a magnificent predator whose solitary lifestyle and camouflage mastery are marvels of evolutionary adaptation.',
          '저는 중앙아시아의 눈표범에 끝없는 호기심을 갖고 있는데, 그 고독한 생활 방식과 뛰어난 위장술은 진화적 적응의 경이로움 그 자체인 웅장한 포식자입니다.',
          [
            { text: 'I am endlessly intrigued by', ko: '저는 끊임없는 호기심을 느낍니다', isKeyChunk: true },
            { text: 'the elusive snow leopard of Central Asia,', ko: '중앙아시아의 신비로운 눈표범에,', isKeyChunk: true },
            { text: 'a magnificent predator whose solitary lifestyle', ko: '그 고독한 생활방식의 웅장한 포식자이자', isKeyChunk: true },
            { text: 'and camouflage mastery are marvels of evolutionary adaptation.', ko: '위장술의 달인은 진화적 적응의 경이로움입니다.', isKeyChunk: true },
          ],
          "'elusive snow leopard' 대신 'enigmatic mountain phantom'으로 바꿔보세요."
        ),
      },
    ],
  },
  {
    id: 'p23_friend_music',
    part: 2,
    topicTitle: 'A friend good at music/singing',
    topicTitleKo: '음악이나 노래에 뛰어난 친구',
    screenshotId: 'IMG_2147',
    questions: [
      {
        id: 'p2_friend_music',
        question: 'Describe a friend who is good at music/singing.',
        questionKo: '음악이나 노래에 재능이 있는 친구에 대해 이야기해 주세요.',
        strategyTip: '친구의 절대음감, 영혼을 울리는 가창력, 청중의 열광적 반응을 묘사하세요.',
        cuePoints: ['Who this person is', 'When and where you listen to him/her', 'What kind of music or songs he/she is good at', 'And explain how you feel about him/her'],
        unit: createDefaultUnit(
          'u_p2_friend_music',
          'IELTS_PART_2',
          'Part 2: Long Turn (Cue Card)',
          'A friend good at music/singing',
          'Describe a friend who is good at music/singing.',
          '음악이나 노래에 재능이 있는 친구에 대해 이야기해 주세요.',
          '가창력과 악기 연주 실력의 조화를 감성적으로 묘사하세요.',
          'I would like to highlight my childhood friend Clara, a gifted acoustic guitarist whose soulful vocals possess an uncanny ability to deeply move any listener.',
          '누구라도 깊이 감동시키는 비범한 능력을 지닌 소울풀한 보컬과 천부적인 어쿠스틱 기타 실력을 갖춘 제 오랜 친구 클라라에 대해 말씀드리고자 합니다.',
          [
            { text: 'I would like to highlight my childhood friend Clara,', ko: '어린 시절 친구 클라라를 조명하고 싶습니다,', isKeyChunk: false },
            { text: 'a gifted acoustic guitarist', ko: '재능 있는 어쿠스틱 기타리스트이자', isKeyChunk: true },
            { text: 'whose soulful vocals possess an uncanny ability', ko: '그녀의 영혼 어린 목소리는 놀라운 능력을 지녔습니다', isKeyChunk: true },
            { text: 'to deeply move any listener.', ko: '어떤 청중이든 깊이 감동시키는.', isKeyChunk: true },
          ],
          "'uncanny ability' 대신 'mesmerizing talent'로 바꿔보세요."
        ),
      },
    ],
  },
];

// 45개 주제 전수 목록 (메타데이터 및 필터링용)
export const ALL_PREDICTED_TOPIC_SUMMARIES = [
  // Part 1 (16)
  { id: 'p1_friends', part: 1, title: 'Friends', titleKo: '친구 & 대인관계', count: 9, screenshot: 'IMG_2103' },
  { id: 'p1_sharing', part: 1, title: 'Sharing', titleKo: '나눔과 공유', count: 6, screenshot: 'IMG_2104' },
  { id: 'p1_having_a_break', part: 1, title: 'Having a break', titleKo: '휴식과 재충전', count: 4, screenshot: 'IMG_2105' },
  { id: 'p1_museum', part: 1, title: 'Museum', titleKo: '박물관과 문화유산', count: 4, screenshot: 'IMG_2106' },
  { id: 'p1_advertisement', part: 1, title: 'Advertisement', titleKo: '광고와 미디어', count: 5, screenshot: 'IMG_2107' },
  { id: 'p1_borrowing_lending', part: 1, title: 'Borrowing/lending', titleKo: '빌리기와 빌려주기', count: 5, screenshot: 'IMG_2108' },
  { id: 'p1_chatting', part: 1, title: 'Chatting', titleKo: '대화와 소통', count: 5, screenshot: 'IMG_2109' },
  { id: 'p1_growing_vegetables', part: 1, title: 'Growing vegetables/fruits', titleKo: '작물 재배와 가드닝', count: 5, screenshot: 'IMG_2110' },
  { id: 'p1_crowded_place', part: 1, title: 'Crowded place', titleKo: '혼잡한 장소', count: 5, screenshot: 'IMG_2111' },
  { id: 'p1_going_out', part: 1, title: 'Going out', titleKo: '외출 습관과 소지품', count: 4, screenshot: 'IMG_2112' },
  { id: 'p1_staying_with_old_people', part: 1, title: 'Staying with old people', titleKo: '노년층과의 교류', count: 4, screenshot: 'IMG_2113' },
  { id: 'p1_doing_something_well', part: 1, title: 'Doing something well', titleKo: '성취와 칭찬 경험', count: 3, screenshot: 'IMG_2114' },
  { id: 'p1_shoes', part: 1, title: 'Shoes', titleKo: '신발과 소비 성향', count: 4, screenshot: 'IMG_2115' },
  { id: 'p1_rules', part: 1, title: 'Rules', titleKo: '규칙과 규율', count: 6, screenshot: 'IMG_2116' },
  { id: 'p1_public_places', part: 1, title: 'Public places', titleKo: '공공장소와 도시 공간', count: 4, screenshot: 'IMG_2117' },
  { id: 'p1_plants', part: 1, title: 'Plants', titleKo: '식물과 자연', count: 4, screenshot: 'IMG_2118' },

  // Part 2 & 3 (29)
  { id: 'p23_unusual_meal', part: 2, title: 'An unusual meal', titleKo: '특별하거나 특이했던 식사', count: 7, screenshot: 'IMG_2119' },
  { id: 'p23_popular_person', part: 2, title: 'A popular person', titleKo: '인기 있는 사람', count: 7, screenshot: 'IMG_2120' },
  { id: 'p23_natural_place', part: 2, title: 'A natural place', titleKo: '자연 명소 (공원, 산 등)', count: 7, screenshot: 'IMG_2121' },
  { id: 'p23_good_service', part: 2, title: 'Good service in a shop', titleKo: '매장에서의 훌륭한 고객 응대 경험', count: 7, screenshot: 'IMG_2122' },
  { id: 'p23_routine_change', part: 2, title: 'Positive change in daily routine', titleKo: '최근 일상 속 긍정적 변화', count: 7, screenshot: 'IMG_2123' },
  { id: 'p23_waiting_special', part: 2, title: 'Waiting for something special', titleKo: '특별한 일을 기다렸던 경험', count: 7, screenshot: 'IMG_2124' },
  { id: 'p23_decision_help', part: 2, title: 'Important decision made with help', titleKo: '타인의 도움으로 내린 중요한 결정', count: 6, screenshot: 'IMG_2125' },
  { id: 'p23_childhood_toy', part: 2, title: 'Childhood toy', titleKo: '어린 시절 좋아했던 장난감', count: 7, screenshot: 'IMG_2126' },
  { id: 'p23_admired_athlete', part: 2, title: 'A successful sportsperson you admire', titleKo: '존경하는 성공한 운동선수', count: 7, screenshot: 'IMG_2127' },
  { id: 'p23_useful_book', part: 2, title: 'A useful book', titleKo: '유익하게 읽었던 책', count: 7, screenshot: 'IMG_2128' },
  { id: 'p23_science_field', part: 2, title: 'An area/subject of science', titleKo: '관심 있는 과학 분야/학문', count: 7, screenshot: 'IMG_2129' },
  { id: 'p23_broken_thing', part: 2, title: 'A time when you broke something', titleKo: '물건을 망가뜨렸던 일화', count: 7, screenshot: 'IMG_2130' },
  { id: 'p23_social_media', part: 2, title: 'Something interesting on social media', titleKo: '소셜 미디어에서 본 흥미로운 콘텐츠', count: 7, screenshot: 'IMG_2131' },
  { id: 'p23_foreign_language', part: 2, title: 'First time talked in a foreign language', titleKo: '외국어로 처음 대화했던 순간', count: 7, screenshot: 'IMG_2132' },
  { id: 'p23_family_old_thing', part: 2, title: 'Important old thing family kept', titleKo: '가족이 오랫동안 보관해 온 오래된 물건', count: 7, screenshot: 'IMG_2133' },
  { id: 'p23_creative_person', part: 2, title: 'A creative person you admire', titleKo: '존경하는 창의적인 인물', count: 7, screenshot: 'IMG_2134' },
  { id: 'p23_exciting_activity', part: 2, title: 'An exciting activity tried for first time', titleKo: '처음 시도해 본 신나는 활동', count: 7, screenshot: 'IMG_2135' },
  { id: 'p23_friend_habit', part: 2, title: 'A good habit your friend has', titleKo: '친구의 본받고 싶은 좋은 습관', count: 7, screenshot: 'IMG_2136' },
  { id: 'p23_apology_received', part: 2, title: 'A time someone apologized to you', titleKo: '누군가 나에게 사과했던 경험', count: 7, screenshot: 'IMG_2137' },
  { id: 'p23_power_outage', part: 2, title: 'A time electricity suddenly went off', titleKo: '갑자기 정전되었던 순간', count: 7, screenshot: 'IMG_2138' },
  { id: 'p23_traditional_story', part: 2, title: 'An interesting traditional story', titleKo: '흥미로운 전통 이야기', count: 7, screenshot: 'IMG_2139' },
  { id: 'p23_long_journey', part: 2, title: 'A long journey you would like to take again', titleKo: '다시 떠나고 싶은 긴 여행', count: 7, screenshot: 'IMG_2140' },
  { id: 'p23_great_dinner', part: 2, title: 'A great dinner enjoyed with friends/family', titleKo: '친구 또는 가족과 함께한 멋진 저녁 식사', count: 7, screenshot: 'IMG_2141' },
  { id: 'p23_talent_to_improve', part: 2, title: 'A natural talent you want to improve', titleKo: '더 발전시키고 싶은 타고난 재능', count: 7, screenshot: 'IMG_2142' },
  { id: 'p23_family_business', part: 2, title: 'Person who enjoys working for family business', titleKo: '가족 기업에서 일하는 것을 즐기는 사람', count: 7, screenshot: 'IMG_2143' },
  { id: 'p23_lost_way', part: 2, title: 'An occasion when you lost your way', titleKo: '길을 잃었던 경험', count: 7, screenshot: 'IMG_2144' },
  { id: 'p23_important_friend', part: 2, title: 'A good friend who is important to you', titleKo: '나에게 소중한 좋은 친구', count: 7, screenshot: 'IMG_2145' },
  { id: 'p23_wild_animal', part: 2, title: 'A wild animal to learn more about', titleKo: '더 알고 싶은 야생 동물', count: 7, screenshot: 'IMG_2146' },
  { id: 'p23_friend_music', part: 2, title: 'A friend good at music/singing', titleKo: '음악이나 노래에 뛰어난 친구', count: 7, screenshot: 'IMG_2147' },
];

// 전체 기출/예상 TrainingUnit 목록 추출
export function getAllPredictedUnits(): TrainingUnit[] {
  const units: TrainingUnit[] = [];
  for (const topic of IELTS_PREDICTED_TOPICS) {
    for (const q of topic.questions) {
      units.push(q.unit);
    }
  }
  return units;
}

export function getPredictedTopicsByPart(part?: 1 | 2 | 3): PredictedTopicItem[] {
  if (!part) return IELTS_PREDICTED_TOPICS;
  return IELTS_PREDICTED_TOPICS.filter((t) => t.part === part);
}

export function getTopicById(topicId: string): PredictedTopicItem | undefined {
  return IELTS_PREDICTED_TOPICS.find((t) => t.id === topicId);
}

export function getUnitById(unitId: string): TrainingUnit | undefined {
  for (const topic of IELTS_PREDICTED_TOPICS) {
    const found = topic.questions.find((q) => q.unit.id === unitId);
    if (found) return found.unit;
  }
  return undefined;
}

