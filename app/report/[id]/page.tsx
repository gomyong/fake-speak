'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-surface text-boro-muted text-sm">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-boro-blue border-t-transparent rounded-full animate-spin mx-auto" />
          <p>Retrieving session from local IndexedDB...</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface text-boro-muted p-6 space-y-4">
        <p className="text-sm">Session record not found in your browser storage.</p>
        <Link
          href="/"
          className="boro-btn-primary px-5 py-2.5 text-xs"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-boro-text">
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-boro-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full text-boro-muted hover:text-boro-text hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full border-[1.5px] border-boro-text flex items-center justify-center font-bold text-xs">
              F
            </div>
            <span className="font-semibold tracking-tight text-boro-text text-base">
              FAKE_SPEAK
            </span>
            <span className="boro-chip text-[11px] py-0.5 px-2.5">
              {record.exam_type} ({record.part_or_question})
            </span>
          </div>
        </div>

        <div className="text-xs text-boro-muted flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
          <span>{new Date(record.created_at).toLocaleDateString()}</span>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
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
