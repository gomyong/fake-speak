// app/api/curator/route.ts
import { NextResponse } from 'next/server';
import { curateNextQuestion, CuratorRequest } from '@/lib/ai/curator';

export async function POST(req: Request) {
  try {
    const body: CuratorRequest = await req.json();
    const curated = await curateNextQuestion(body);
    return NextResponse.json(curated);
  } catch (error: any) {
    console.error('Curator API error:', error);
    return NextResponse.json(
      { error: 'Failed to curate question', details: error.message },
      { status: 500 }
    );
  }
}
