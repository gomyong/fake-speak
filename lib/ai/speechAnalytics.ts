// lib/ai/speechAnalytics.ts

export interface FillerDetection {
  word: string;
  count: number;
}

export interface VocabularyUpgrade {
  original: string;
  upgraded: string[];
  explanation: string;
}

export interface SpeechAnalyticsResult {
  wordCount: number;
  durationSeconds: number;
  wpm: number;
  wpmStatus: 'TOO_SLOW' | 'SLIGHTLY_SLOW' | 'OPTIMAL' | 'FAST' | 'TOO_FAST';
  wpmMessage: string;
  fillers: {
    totalCount: number;
    fillerRatio: number; // percentage (0 - 100)
    detected: FillerDetection[];
  };
  lexicalDiversity: {
    uniqueWordCount: number;
    ttr: number; // 0.0 - 1.0 (Type-Token Ratio)
    rating: 'LIMITED' | 'MODERATE' | 'RICH' | 'EXCEPTIONAL';
  };
  overusedWords: VocabularyUpgrade[];
  highlightedTokens: Array<{
    text: string;
    isFiller: boolean;
    isOverused: boolean;
    replacementHint?: string;
  }>;
}

// 필러 워드(추임새) 목록
const COMMON_FILLERS = [
  'um',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'i mean',
  'basically',
  'actually',
  'sort of',
  'kind of',
  'right',
];

// 초·중급 빈출 단어 -> IELTS Band 7.5+ / 토익스피킹 고득점 유의어 사전
const OVERUSED_VOCAB_MAP: Record<string, { upgraded: string[]; explanation: string }> = {
  good: {
    upgraded: ['beneficial', 'exceptional', 'advantageous', 'favorable'],
    explanation: '구체적인 이점이나 뛰어난 품질을 명시하는 어휘로 대체하세요.',
  },
  bad: {
    upgraded: ['detrimental', 'adverse', 'unfavorable', 'counterproductive'],
    explanation: '부정적 영향의 심각성을 전달하는 학술적 어휘입니다.',
  },
  think: {
    upgraded: ['strongly believe', 'maintain', 'reckon', 'postulate', 'am convinced that'],
    explanation: '단순 생각 대신 확신이나 논리적 입장을 표현하는 동사를 사용하세요.',
  },
  very: {
    upgraded: ['substantially', 'immensely', 'exceptionally', 'profoundly'],
    explanation: '"very" 대신 부사 자체로 강도를 표현하면 격식이 높아집니다.',
  },
  important: {
    upgraded: ['paramount', 'crucial', 'imperative', 'indispensable'],
    explanation: '중요성의 본질을 강조하는 고급 형용사입니다.',
  },
  many: {
    upgraded: ['a multitude of', 'an abundance of', 'numerous', 'a substantial number of'],
    explanation: '양적인 풍부함을 세련된 어구로 나타냅니다.',
  },
  make: {
    upgraded: ['facilitate', 'generate', 'precipitate', 'foster'],
    explanation: '단순 제작을 넘어 촉진/유발의 의미를 명확히 합니다.',
  },
  big: {
    upgraded: ['substantial', 'monumental', 'extensive', 'considerable'],
    explanation: '규모와 영향력의 크기를 객관적으로 표현합니다.',
  },
  nice: {
    upgraded: ['pleasant', 'agreeable', 'picturesque', 'hospitable'],
    explanation: '상황에 맞는 구체적 감각/태도 어휘로 치환하세요.',
  },
  people: {
    upgraded: ['individuals', 'the populace', 'citizens', 'contemporaries'],
    explanation: '대상 집단을 구체적으로 지정하면 전문성이 향상됩니다.',
  },
};

/**
 * 음성 발화 텍스트와 녹음 시간을 분석하여 종합 정량 지표를 산출합니다.
 */
export function analyzeSpeech(transcript: string, durationSeconds: number): SpeechAnalyticsResult {
  const cleanTranscript = (transcript || '').trim();
  const rawTokens = cleanTranscript.split(/\s+/).filter(Boolean);
  const wordCount = rawTokens.length;

  const validDuration = Math.max(durationSeconds, 3);
  const wpm = Math.round((wordCount / validDuration) * 60);

  // 1. WPM 상태 진단
  let wpmStatus: SpeechAnalyticsResult['wpmStatus'] = 'OPTIMAL';
  let wpmMessage = '이상적인 발화 페이스입니다 (120~150 WPM).';

  if (wpm < 85) {
    wpmStatus = 'TOO_SLOW';
    wpmMessage = '말하기 속도가 많이 느립니다. 휴지기(망설임)를 줄이고 연속 발화에 집중하세요.';
  } else if (wpm < 115) {
    wpmStatus = 'SLIGHTLY_SLOW';
    wpmMessage = '조금 느린 편입니다. 문장 간 연결을 좀 더 매끄럽게 이어보세요.';
  } else if (wpm > 175) {
    wpmStatus = 'TOO_FAST';
    wpmMessage = '말이 너무 빨라 발음과 억양이 뭉개질 위험이 있습니다. 안정된 톤으로 조절하세요.';
  } else if (wpm > 155) {
    wpmStatus = 'FAST';
    wpmMessage = '다소 빠른 페이스입니다. 중요한 키워드에 강세를 주며 완급을 조절하세요.';
  }

  // 2. 필러 워드 감지
  const lowerTranscript = cleanTranscript.toLowerCase();
  const fillerCounts: Record<string, number> = {};
  let totalFillerCount = 0;

  COMMON_FILLERS.forEach((filler) => {
    // 단어 경계(\b) 매칭
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerTranscript.match(regex);
    if (matches && matches.length > 0) {
      fillerCounts[filler] = matches.length;
      totalFillerCount += matches.length;
    }
  });

  const fillerRatio = wordCount > 0 ? Math.round((totalFillerCount / wordCount) * 100) : 0;
  const detectedFillers: FillerDetection[] = Object.entries(fillerCounts)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  // 3. 어휘 다양성 (TTR: Type-Token Ratio)
  const normalizedWords = rawTokens.map((w) =>
    w.toLowerCase().replace(/[^a-z0-9]/g, '')
  ).filter(Boolean);

  const uniqueWordSet = new Set(normalizedWords);
  const uniqueWordCount = uniqueWordSet.size;
  const ttr = wordCount > 0 ? Number((uniqueWordCount / wordCount).toFixed(2)) : 0;

  let lexicalRating: SpeechAnalyticsResult['lexicalDiversity']['rating'] = 'MODERATE';
  if (ttr >= 0.75 && wordCount >= 30) {
    lexicalRating = 'EXCEPTIONAL';
  } else if (ttr >= 0.6) {
    lexicalRating = 'RICH';
  } else if (ttr < 0.45) {
    lexicalRating = 'LIMITED';
  }

  // 4. 자주 쓰인 기초 어휘 및 대체 제안
  const overusedWordsFound: VocabularyUpgrade[] = [];
  const foundKeys = new Set<string>();

  normalizedWords.forEach((word) => {
    if (OVERUSED_VOCAB_MAP[word] && !foundKeys.has(word)) {
      foundKeys.add(word);
      overusedWordsFound.push({
        original: word,
        upgraded: OVERUSED_VOCAB_MAP[word].upgraded,
        explanation: OVERUSED_VOCAB_MAP[word].explanation,
      });
    }
  });

  // 5. 토큰별 하이라이트 정보 매핑
  const highlightedTokens = rawTokens.map((token) => {
    const cleanWord = token.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isFiller = COMMON_FILLERS.includes(cleanWord);
    const isOverused = !!OVERUSED_VOCAB_MAP[cleanWord];
    const replacementHint = isOverused ? OVERUSED_VOCAB_MAP[cleanWord].upgraded[0] : undefined;

    return {
      text: token,
      isFiller,
      isOverused,
      replacementHint,
    };
  });

  return {
    wordCount,
    durationSeconds: validDuration,
    wpm,
    wpmStatus,
    wpmMessage,
    fillers: {
      totalCount: totalFillerCount,
      fillerRatio,
      detected: detectedFillers,
    },
    lexicalDiversity: {
      uniqueWordCount,
      ttr,
      rating: lexicalRating,
    },
    overusedWords: overusedWordsFound,
    highlightedTokens,
  };
}
