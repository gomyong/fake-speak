// app/api/train/followup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getGeminiClient, GEMINI_FLASH_MODEL } from '@/lib/ai/gemini';

export interface FollowUpResponse {
  followupQuestion: string;
  followupQuestionKo: string;
  examinerIntent: string;
  buyingTimePhrases: Array<{
    phrase: string;
    ko: string;
    usageTip: string;
  }>;
  suggestedAngles: string[];
  modelResponseHint: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionText, transcript, examType = 'IELTS' } = body;

    const cleanTranscript = (transcript || '').trim();
    if (!cleanTranscript || cleanTranscript.length < 5) {
      return NextResponse.json(
        { error: 'Candidate transcript is required to generate a relevant follow-up.' },
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
            temperature: 0.4,
          },
        });

        const prompt = `You are an insightful, certified ${examType} Speaking Examiner.
The candidate just answered a question. Your role is to generate a realistic, challenging, context-aware follow-up question (interruption/follow-up drill) to test their spontaneous speaking and logical agility.

[INITIAL QUESTION]: "${questionText}"
[CANDIDATE'S PREVIOUS ANSWER]: "${cleanTranscript}"

[REQUIREMENTS]:
1. The follow-up question should probe deeper into their reasoning, present a counter-argument, or explore a practical consequence of what they said.
2. Provide 2-3 "Buying-Time / Stalling" discourse markers (담화 표지어) that candidates can use to buy 2-3 seconds to think without losing fluency points.
3. Suggest 2 angles the candidate could take to answer.
4. Provide a sample high-band (Band 8.0+) model response (1-2 sentences).

[OUTPUT FORMAT SPECIFICATION]:
Return ONLY a valid JSON object matching this schema:
{
  "followupQuestion": "string (Examiner follow-up question in English)",
  "followupQuestionKo": "string (Korean translation)",
  "examinerIntent": "string (What the examiner is testing here, in Korean)",
  "buyingTimePhrases": [
    {
      "phrase": "string (e.g. 'Well, that's an intriguing point to consider, however...')",
      "ko": "string (Korean meaning)",
      "usageTip": "string (When to use this phrase)"
    }
  ],
  "suggestedAngles": ["string (Angle 1)", "string (Angle 2)"],
  "modelResponseHint": "string (Concise high-band model response)"
}`;

        const response = await model.generateContent(prompt);
        const responseText = response.response.text();
        const parsed: FollowUpResponse = JSON.parse(responseText);

        return NextResponse.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini follow-up generation failed, falling back:', geminiError);
      }
    }

    // 로컬 폴백
    const fallback: FollowUpResponse = {
      followupQuestion: `You mentioned that point, but how would you respond if someone argued that this approach might lead to unintended negative consequences in the long run?`,
      followupQuestionKo: `그 점을 말씀해주셨는데, 장기적으로 의도치 않은 부정적 결과를 초래할 수 있다는 반론에 대해서는 어떻게 생각하시나요?`,
      examinerIntent: `자신의 주장에 대한 반대 의견을 논리적으로 방어하고 다각도로 검토할 수 있는지 평가합니다.`,
      buyingTimePhrases: [
        {
          phrase: `Well, that is certainly a compelling counter-argument, but from where I stand...`,
          ko: `충분히 일리 있는 반론이지만, 제가 생각하기에는...`,
          usageTip: `상대방의 의견을 부드럽게 수용하면서 내 논리를 전개할 때 사용합니다.`,
        },
        {
          phrase: `To be completely candid, while that is a valid concern, one must also take into account that...`,
          ko: `솔직히 말씀드리면 타당한 우려이지만, 다음 사항도 고려해야 합니다...`,
          usageTip: `단점을 인정하면서도 더 큰 장점을 부각시킬 때 유용합니다.`,
        },
      ],
      suggestedAngles: [
        `장기적인 리스크보다 당장 얻을 수 있는 구조적 이익이 훨씬 크다는 점 강조`,
        `적절한 규제나 가이드라인을 도입하면 부작용을 최소화할 수 있다는 절충안 제시`,
      ],
      modelResponseHint: `While that is certainly a legitimate concern, I would argue that with appropriate regulatory safeguards in place, the societal benefits far outweigh the potential drawbacks.`,
    };

    return NextResponse.json(fallback);
  } catch (err: any) {
    console.error('Follow-up endpoint error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
