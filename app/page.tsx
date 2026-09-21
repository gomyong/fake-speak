'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mic, Award, Zap, History, Sparkles, ArrowRight, ShieldCheck, Database, Volume2 } from 'lucide-react';
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
    <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-12">
      {/* 헤더 히어로 섹션 */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Zero Repetition & Adaptive Difficulty Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          FAKE_
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400">
            SPEAK
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          어제 다뤘던 주제와 문장 구조는 절대 반복하지 않습니다.
          <br className="hidden sm:inline" />
          공인 시험관 페르소나와 100% 로컬 프라이빗 오디오로 나의 한계를 매일 넓혀보세요.
        </p>

        {/* 제로 인프라 & 프라이버시 뱃지 */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Client-side Audio (IndexedDB)
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            pgvector Semantic Deduplication
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Gemini 1.5 Official Rubric Grading
          </span>
        </div>
      </div>

      {/* 대시보드 스트릭 & 누적 통계 */}
      <StreakCalendar />

      {/* 시험 모드 선택 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IELTS Speaking 카드 */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-indigo-600/50 transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Official Spec (Band 0 - 9.0)
              </span>
              <Award className="w-6 h-6 text-indigo-400" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">IELTS Speaking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Part 1 인터뷰부터 Part 2 큐카드(1분 준비 / 2분 발화), Part 3 심층 토론까지 시험관 페르소나와 실전 규격으로 연습합니다.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Part 2: 1분 메모 타이머 + 2분 발화 자동 컷오프
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                FC, LR, GRA, PR 4대 공식 평가 루브릭
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                Band 8.5+ 원어민 모범 답변 및 문법 개선안
              </li>
            </ul>
          </div>

          <Link
            href="/exam/ielts"
            className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all group-hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start IELTS Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* TOEIC Speaking 카드 */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 relative overflow-hidden group hover:border-violet-600/50 transition-all duration-300 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/40">
                11 Questions Full Simulation
              </span>
              <Zap className="w-6 h-6 text-violet-400" />
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">TOEIC Speaking</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              문장 읽기, 사진 묘사, 질의응답, 정보 분석, 의견 제시까지 11개 문항의 엄격한 타이머와 비프음을 시뮬레이션합니다.
            </p>

            <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                Q1~Q11 단계별 준비 및 답변 타이머 자동 전이
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                표준 비프음(880Hz / 440Hz) 실전 청각 신호
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                발음, 억양 및 논리적 완결성 정량 분석
              </li>
            </ul>
          </div>

          <Link
            href="/exam/toeic"
            className="w-full py-3.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all group-hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Start TOEIC Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 최근 학습 기록 & 로컬 오디오 복습 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Recent Speaking Sessions (Local IndexedDB)
          </h2>
          <span className="text-xs text-slate-500">0ms Instant Review</span>
        </div>

        {recentRecords.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center space-y-2">
            <p className="text-sm text-slate-400">아직 완료된 스피킹 세션이 없습니다.</p>
            <p className="text-xs text-slate-500">
              상단의 IELTS 또는 TOEIC 버튼을 눌러 첫 번째 시험관 세션을 시작해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentRecords.map((rec) => (
              <div
                key={rec.id}
                className="glass-card p-4 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                      {rec.exam_type}
                    </span>
                    <span className="text-xs font-semibold text-slate-300">
                      {rec.part_or_question}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1">"{rec.question_text}"</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-center">
                    <span className="text-[10px] text-slate-400 block">Band</span>
                    <span className="text-sm font-extrabold text-indigo-300">
                      {rec.overall_band.toFixed(1)}
                    </span>
                  </div>

                  <Link
                    href={`/report/${rec.session_uuid}`}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
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
