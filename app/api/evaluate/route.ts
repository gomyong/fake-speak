// app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import { evaluateSpeakingSession } from '@/lib/ai/evaluator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { examType, partOrQuestion, questionText, transcript, durationSeconds } = body;

    const evaluation = await evaluateSpeakingSession({
      examType,
      partOrQuestion,
      questionText,
      transcript,
      durationSeconds,
    });

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Evaluation API error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate speaking session', details: error.message },
      { status: 500 }
    );
  }
}
