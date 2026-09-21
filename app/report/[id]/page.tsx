'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, Calendar, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { localDB, LocalEvaluationRecord } from '@/lib/db/localAudioStore';
import { AudioReviewPlayer } from '@/components/feedback/AudioReviewPlayer';
import { EvaluationReport } from '@/components/feedback/EvaluationReport';

export default function SessionReportPage() {
  const params = useParams();
  const router = useRouter();
  const sessionUuid = params.id as string;

  const [record, setRecord] = useState<LocalEvaluationRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadSession() {
      if (!sessionUuid) return;
      try {
        const found = await localDB.evaluations.where('session_uuid').equals(sessionUuid).first();
        if (found) {
          setRecord(found);
        }
      } catch (err) {
        console.error('Failed to load session from IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionUuid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-400 text-sm">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Retrieving session from local IndexedDB...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-slate-400 p-6 space-y-4">
        <p className="text-sm">Session record not found in your browser storage.</p>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-[#0c121e]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-base">
                FAKE_SPEAK
              </span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-semibold text-slate-300">
                {record.exam_type} ({record.part_or_question})
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-8">
        {/* 오디오 복습 플레이어 */}
        <AudioReviewPlayer sessionUuid={sessionUuid} />

        {/* 상세 평가 리포트 */}
        <EvaluationReport
          evaluation={{
            scores: record.scores_json as any,
            critical_weaknesses: record.weaknesses,
            lexical_enhancements: record.lexical_enhancements,
            model_answer_band_8_5: record.model_answer,
            suggested_next_focus: 'Review your collocations and reduce repetitive discourse markers.',
          }}
          questionText={record.question_text}
          transcript={record.transcript}
          onNext={() => router.push('/')}
          nextLabel="Back to Dashboard"
        />
      </main>
    </div>
  );
}
