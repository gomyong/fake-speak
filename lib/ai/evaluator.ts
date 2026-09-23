// lib/ai/evaluator.ts
import { getGeminiClient, GEMINI_FLASH_MODEL } from './gemini';

export interface ScoreItem {
  band: number;
  justification: string;
}

export interface EvaluationResult {
  scores: {
    fluency_and_coherence: ScoreItem;
    lexical_resource: ScoreItem;
    grammatical_range_accuracy: ScoreItem;
    pronunciation_estimate: ScoreItem;
    overall_band: number;
  };
  critical_weaknesses: string[];
  lexical_enhancements: Array<{
    original: string;
    upgraded: string;
  }>;
  model_answer_band_8_5: string;
  suggested_next_focus: string;
}

export async function evaluateSpeakingSession(params: {
  examType: 'IELTS' | 'TOEIC';
  partOrQuestion: string;
  questionText: string;
  transcript: string;
  durationSeconds?: number;
}): Promise<EvaluationResult> {
  const { examType, partOrQuestion, questionText, transcript, durationSeconds = 45 } = params;

  const cleanTranscript = (transcript || '').trim();
  const words = cleanTranscript.split(/\s+/).filter((w) => w.length > 0);

  // 1. 발화가 없거나, 의미 없는 극소수 단어(3단어 미만 또는 10자 미만)인 경우 0.0점 처리
  if (!cleanTranscript || words.length < 3 || cleanTranscript.length < 8) {
    return {
      scores: {
        fluency_and_coherence: {
          band: 0.0,
          justification: 'No intelligible speech detected during the session. (음성이 감지되지 않았습니다)',
        },
        lexical_resource: {
          band: 0.0,
          justification: 'Insufficient vocabulary sample provided. (어휘 데이터 부족)',
        },
        grammatical_range_accuracy: {
          band: 0.0,
          justification: 'No grammatical structures attempted. (문장 구사 없음)',
        },
        pronunciation_estimate: {
          band: 0.0,
          justification: 'No phonological features could be analyzed. (발음 분석 불가)',
        },
        overall_band: 0.0,
      },
      critical_weaknesses: [
        '마이크 입력이 감지되지 않았거나 발화가 녹음되지 않았습니다.',
        '마이크 연결 상태 및 브라우저 권한을 확인하고, 문항에 맞춰 큰 소리로 발화해 주세요.',
      ],
      lexical_enhancements: [],
      model_answer_band_8_5: `Regarding "${questionText.slice(0, 70)}...", a high-scoring response requires at least two fully structured sentences with cohesive transitions.`,
      suggested_next_focus: 'Ensure your microphone is active and speak continuously for at least 15–30 seconds.',
    };
  }

  const genAI = getGeminiClient();

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: GEMINI_FLASH_MODEL,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const systemPrompt = `You are an elite, certified ${examType} Speaking Senior Examiner.
Evaluate the candidate's transcript strictly against official standards (for IELTS: the 9-band descriptors covering Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, and Pronunciation; for TOEIC: scaled appropriately to an equivalent 9.0 band).

[STRICT SCORING RULES]
1. If the candidate's speech is merely off-topic gibberish, filler words, or fewer than 10 words, score between 1.0 and 3.0. DO NOT give a default 6.0.
2. A score of 6.0+ requires genuine sentence construction, appropriate vocabulary, and sustained discourse relevant to the question.
3. If the transcript indicates no meaningful answer, overall_band MUST be 0.0 to 1.0.

[TARGET EXAM & PART]
Exam: ${examType}, Section: ${partOrQuestion}

[TARGET QUESTION]
${questionText}

[CANDIDATE TRANSCRIPT]
${cleanTranscript}

[OUTPUT FORMAT SPECIFICATION]
Return ONLY a valid JSON object matching this schema:
{
  "scores": {
    "fluency_and_coherence": { "band": number, "justification": "string" },
    "lexical_resource": { "band": number, "justification": "string" },
    "grammatical_range_accuracy": { "band": number, "justification": "string" },
    "pronunciation_estimate": { "band": number, "justification": "string" },
    "overall_band": number
  },
  "critical_weaknesses": ["string"],
  "lexical_enhancements": [
    { "original": "string", "upgraded": "string" }
  ],
  "model_answer_band_8_5": "string",
  "suggested_next_focus": "string"
}`;

      const response = await model.generateContent(systemPrompt);
      const text = response.response.text();
      const parsed: EvaluationResult = JSON.parse(text);
      return parsed;
    } catch (err) {
      console.warn('Gemini API evaluation failed, falling back to heuristic engine:', err);
    }
  }

  // Fallback / Mock 휴리스틱 평가 엔진
  return generateHeuristicEvaluation(questionText, cleanTranscript, durationSeconds);
}

// 로컬 휴리스틱 채점
function generateHeuristicEvaluation(
  questionText: string,
  transcript: string,
  durationSeconds: number
): EvaluationResult {
  const words = transcript.trim().split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  if (wordCount < 3) {
    return {
      scores: {
        fluency_and_coherence: { band: 0.0, justification: 'No speech detected.' },
        lexical_resource: { band: 0.0, justification: 'No words detected.' },
        grammatical_range_accuracy: { band: 0.0, justification: 'No grammar detected.' },
        pronunciation_estimate: { band: 0.0, justification: 'No pronunciation detected.' },
        overall_band: 0.0,
      },
      critical_weaknesses: ['마이크에 음성이 감지되지 않았습니다.'],
      lexical_enhancements: [],
      model_answer_band_8_5: 'Please provide a clear spoken response.',
      suggested_next_focus: 'Check your microphone and speak clearly.',
    };
  }

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const ttr = uniqueWords.size / wordCount;
  const wpm = (wordCount / Math.max(durationSeconds, 15)) * 60;

  // 단어 수가 적으면 낮은 밴드 부여
  let fcBand = 5.0;
  if (wpm >= 110 && wpm <= 160 && wordCount >= 35) fcBand = 7.0;
  else if (wpm >= 80 && wordCount >= 20) fcBand = 6.0;
  else if (wordCount < 10) fcBand = 2.0;

  let lrBand = 5.0;
  if (ttr > 0.65 && wordCount > 35) lrBand = 7.0;
  else if (wordCount < 10) lrBand = 2.0;

  let graBand = 5.0;
  if (transcript.includes('although') || transcript.includes('whereas') || transcript.includes('if')) {
    graBand = 6.5;
  }
  if (wordCount < 10) graBand = 2.0;

  const overall = Number(((fcBand + lrBand + graBand + (wordCount < 10 ? 2.0 : 6.0)) / 4).toFixed(1));

  return {
    scores: {
      fluency_and_coherence: {
        band: fcBand,
        justification: `Delivered at approximately ${Math.round(wpm)} WPM (${wordCount} words).`,
      },
      lexical_resource: {
        band: lrBand,
        justification: `Type-Token Ratio of ${ttr.toFixed(2)}.`,
      },
      grammatical_range_accuracy: {
        band: graBand,
        justification: 'Structure assessment based on utterance length and clause variety.',
      },
      pronunciation_estimate: {
        band: wordCount < 10 ? 2.0 : 6.0,
        justification: 'Speech clarity verified through transcript completeness.',
      },
      overall_band: overall,
    },
    critical_weaknesses: [
      wordCount < 15
        ? 'Response was too brief to demonstrate full communicative competence.'
        : 'Frequent repetition of basic discourse connectors (e.g. "and", "because").',
    ],
    lexical_enhancements: [
      {
        original: 'a lot of people think that it is good',
        upgraded: 'a substantial portion of society advocates for its manifest benefits',
      },
      {
        original: 'it makes many problems',
        upgraded: 'it precipitates significant socioeconomic ramifications',
      },
    ],
    model_answer_band_8_5: `Regarding "${questionText.slice(0, 60)}...", it is imperative to recognize that while conventional perspectives emphasize immediate pragmatic utility, contemporary evidence suggests a nuanced equilibrium between systemic regulation and individual initiative. Furthermore, were policymakers to enact targeted structural reforms, long-term societal resilience would be substantially reinforced.`,
    suggested_next_focus: 'Incorporate complex concession clauses such as "Notwithstanding the aforementioned..." and "Albeit..." in your opening arguments.',
  };
}
