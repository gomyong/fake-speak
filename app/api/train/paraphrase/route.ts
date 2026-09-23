// app/api/train/paraphrase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_FLASH_MODEL } from '@/lib/ai/gemini';

export interface ParaphraseTier {
  band: string;
  levelTitle: string;
  text: string;
  ko: string;
  keyEnhancement: string;
  usedPatterns: string[];
}

export interface ParaphraseResponse {
  originalText: string;
  tiers: {
    level1_good: ParaphraseTier;
    level2_better: ParaphraseTier;
    level3_native: ParaphraseTier;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, questionText = '', examType = 'IELTS' } = body;

    const cleanText = (text || '').trim();
    if (!cleanText || cleanText.length < 5) {
      return NextResponse.json(
        { error: 'Text must be at least 5 characters long to paraphrase.' },
        { status: 400 }
      );
    }

    const genAI = getGeminiClient();

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({
          model: GEMINI_FLASH_MODEL,
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const prompt = `You are a world-class English Speaking Coach and Senior ${examType} Examiner.
Analyze the candidate's English sentence or response and transform it into a 3-tier Paraphrasing Ladder:

[TARGET QUESTION]: "${questionText}"
[CANDIDATE TEXT]: "${cleanText}"

[TIER DEFINITIONS]:
1. Level 1 (Good - Band 5.5 to 6.0):
   - Correct grammatical mistakes, maintain simple/compound sentence structures, keep vocabulary straightforward but clear.
2. Level 2 (Better - Band 6.5 to 7.0):
   - Combine clauses into complex structures (using subordinating conjunctions like 'although', 'whereas', 'not to mention'), employ academic discourse connectors, and elevate adjectives/adverbs.
3. Level 3 (Native / Mastery - Band 7.5 to 8.5+):
   - Use authentic native collocations, idiomatic phrasing, rich lexical resource, and sophisticated rhythmic flow suitable for top-band speaking.

[OUTPUT FORMAT SPECIFICATION]:
Return ONLY a valid JSON object matching this schema:
{
  "originalText": "${cleanText}",
  "tiers": {
    "level1_good": {
      "band": "Band 5.5 - 6.0",
      "levelTitle": "Good (기초 문법 & 명확한 전달)",
      "text": "string (improved English sentence)",
      "ko": "string (natural Korean translation)",
      "keyEnhancement": "string (what was corrected/improved)",
      "usedPatterns": ["pattern1", "pattern2"]
    },
    "level2_better": {
      "band": "Band 6.5 - 7.0",
      "levelTitle": "Better (복문 & 고득점 연결사)",
      "text": "string (advanced English sentence)",
      "ko": "string (natural Korean translation)",
      "keyEnhancement": "string (structural & lexical upgrade details)",
      "usedPatterns": ["pattern1", "pattern2"]
    },
    "level3_native": {
      "band": "Band 7.5 - 8.5+",
      "levelTitle": "Native / Idiomatic (원어민 관용구 & 고급 Collocation)",
      "text": "string (mastery level English sentence)",
      "ko": "string (natural Korean translation)",
      "keyEnhancement": "string (authentic nuances & idiomatic touches)",
      "usedPatterns": ["pattern1", "pattern2"]
    }
  }
}`;

        const response = await model.generateContent(prompt);
        const responseText = response.response.text();
        const parsed: ParaphraseResponse = JSON.parse(responseText);

        return NextResponse.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini paraphrase API failed, using fallback heuristic:', geminiError);
      }
    }

    // 로컬 휴리스틱 폴백
    const fallbackResponse: ParaphraseResponse = generateFallbackParaphrase(cleanText);
    return NextResponse.json(fallbackResponse);
  } catch (err: any) {
    console.error('Paraphrase endpoint error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFallbackParaphrase(text: string): ParaphraseResponse {
  return {
    originalText: text,
    tiers: {
      level1_good: {
        band: 'Band 5.5 - 6.0',
        levelTitle: 'Good (기초 문법 & 명확한 전달)',
        text: `In my view, ${text.toLowerCase().replace(/^(i think|in my opinion)\s*/i, '')}.`,
        ko: '제 관점에서는, 발화하신 내용이 명확하게 전달되는 기본 문장입니다.',
        keyEnhancement: '주어와 동사의 명확한 일치 및 기본 연결사 보강',
        usedPatterns: ['In my view', 'Subject-verb agreement'],
      },
      level2_better: {
        band: 'Band 6.5 - 7.0',
        levelTitle: 'Better (복문 & 고득점 연결사)',
        text: `What strikes me most is that ${text.toLowerCase().replace(/^(i think|in my opinion)\s*/i, '')}, which fundamentally influences the outcome.`,
        ko: '가장 눈에 띄는 점은 이 부분이 결과에 근본적인 영향을 미친다는 것입니다.',
        keyEnhancement: '관계대명사 계속적 용법(which) 및 What-cleft 강조 구문 도입',
        usedPatterns: ['What strikes me most is that...', 'which fundamentally influences...'],
      },
      level3_native: {
        band: 'Band 7.5 - 8.5+',
        levelTitle: 'Native / Idiomatic (원어민 관용구 & 고급 Collocation)',
        text: `From my vantage point, not only does this circumstance hold substantial significance, but it also serves as a catalyst for meaningful change.`,
        ko: '저의 관점에서 볼 때, 이 상황은 상당한 중요성을 지닐 뿐만 아니라 의미 있는 변화를 위한 촉매제 역할을 합니다.',
        keyEnhancement: '부정어 도치(not only does...) 및 격조 높은 비유적 어휘(catalyst) 활용',
        usedPatterns: ['From my vantage point', 'Not only does... but it also...', 'Serves as a catalyst'],
      },
    },
  };
}
