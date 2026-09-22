'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Award, Zap, History, ArrowRight, Volume2 } from 'lucide-react';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { getRecentEvaluations, LocalEvaluationRecord } from '@/lib/db/localAudioStore';

export default function HomePage() {
  const [recentRecords, setRecentRecords] = useState<LocalEvaluationRecord[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const records = await getRecentEvaluations(5);
        setRecentRecords(records);
      } catch (err) {
        console.error('Failed to load recent evaluations:', err);
      }
    }
    loadHistory();
  }, []);

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
      {/* 헤더 히어로 섹션 */}
      <div className="flex flex-col items-center justify-center pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-[1.5px] border-boro-text flex items-center justify-center font-bold text-sm tracking-tight">
            F
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tighter text-boro-text">
            FAKE_SPEAK
          </h1>
        </div>
      </div>

      {/* 대시보드 스트릭 & 누적 통계 */}
      <StreakCalendar />

      {/* 시험 모드 선택 카드 (Warm Gallery / Polestar Minimalism) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IELTS Speaking 카드 */}
        <div className="boro-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="boro-chip">
                IELTS Spec
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-boro-text">
                <Award className="w-4 h-4 stroke-[1.5]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-boro-text">IELTS Speaking</h2>
              <p className="text-sm text-boro-muted leading-relaxed">
                Part 1 인터뷰부터 Part 2 큐카드(1분 준비 / 2분 발화), Part 3 심층 토론까지 시험관 페르소나와 실전 규격으로 시뮬레이션합니다.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-boro-muted border-t border-boro-border/60">
              <div className="flex items-center justify-between pt-2">
                <span>Part 2 Timer</span>
                <span className="font-medium text-boro-text">1m prep / 2m speaking</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Evaluation</span>
                <span className="font-medium text-boro-text">FC, LR, GRA, PR (0-9 Band)</span>
              </div>
            </div>
          </div>

          <Link
            href="/exam/ielts"
            className="boro-btn-primary w-full py-3.5 px-6 flex items-center justify-center gap-2 text-sm"
          >
            <span>Start IELTS Simulation</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>

        {/* TOEIC Speaking 카드 */}
        <div className="boro-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="boro-chip bg-surface-container text-boro-text">
                11 Questions
              </span>
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-boro-blue">
                <Zap className="w-4 h-4 stroke-[1.5]" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-semibold tracking-tight text-boro-text">TOEIC Speaking</h2>
              <p className="text-sm text-boro-muted leading-relaxed">
                문장 읽기, 사진 묘사, 질의응답, 정보 분석, 의견 제시까지 11개 전 문항의 엄격한 타이머와 비프음을 시뮬레이션합니다.
              </p>
            </div>

            <div className="space-y-2 pt-2 text-xs text-boro-muted border-t border-boro-border/60">
              <div className="flex items-center justify-between pt-2">
                <span>Format</span>
                <span className="font-medium text-boro-text">Q1 to Q11 Automatic Transition</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Audio Signals</span>
                <span className="font-medium text-boro-text">Standard 880Hz / 440Hz Beeps</span>
              </div>
            </div>
          </div>

          <Link
            href="/exam/toeic"
            className="boro-btn-primary w-full py-3.5 px-6 flex items-center justify-center gap-2 text-sm"
          >
            <span>Start TOEIC Simulation</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </Link>
        </div>
      </div>

      {/* 최근 학습 기록 (Boro UI Clean Transaction List Style) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base font-semibold text-boro-text flex items-center gap-2">
            <History className="w-4 h-4 text-boro-muted stroke-[1.5]" />
            Recent Sessions
          </h3>
          <span className="text-xs text-boro-muted">IndexedDB Local Audio</span>
        </div>

        {recentRecords.length === 0 ? (
          <div className="boro-panel p-8 text-center space-y-1.5">
            <p className="text-sm text-boro-muted">아직 완료된 스피킹 세션이 없습니다.</p>
            <p className="text-xs text-boro-muted2">
              상단의 IELTS 또는 TOEIC 버튼을 눌러 첫 번째 시험관 세션을 시작해보세요.
            </p>
          </div>
        ) : (
          <div className="boro-card divide-y divide-boro-border/60 overflow-hidden">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-low transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="boro-chip text-[11px] py-0.5 px-2">
                      {rec.exam_type}
                    </span>
                    <span className="text-xs font-semibold text-boro-text">
                      {rec.part_or_question}
                    </span>
                    <span className="text-[11px] text-boro-muted2">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-boro-muted line-clamp-1">"{rec.question_text}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] text-boro-muted uppercase font-medium block">Band</span>
                    <span className="text-base font-semibold tracking-tight text-boro-text">
                      {rec.overall_band.toFixed(1)}
                    </span>
                  </div>

                  <Link
                    href={`/report/${rec.session_uuid}`}
                    className="boro-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Review</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
