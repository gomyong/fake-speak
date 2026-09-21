'use client';

import React from 'react';
import { Award, CheckCircle2, AlertCircle, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { EvaluationResult } from '@/lib/ai/evaluator';

interface EvaluationReportProps {
  evaluation: EvaluationResult;
  questionText: string;
  transcript: string;
  onNext?: () => void;
  nextLabel?: string;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  evaluation,
  questionText,
  transcript,
  onNext,
  nextLabel = 'Next Question',
}) => {
  const { scores, critical_weaknesses, lexical_enhancements, model_answer_band_8_5, suggested_next_focus } = evaluation;

  const scoreCategories = [
    { key: 'fc', name: 'Fluency & Coherence', data: scores.fluency_and_coherence },
    { key: 'lr', name: 'Lexical Resource', data: scores.lexical_resource },
    { key: 'gra', name: 'Grammar Range & Accuracy', data: scores.grammatical_range_accuracy },
    { key: 'pr', name: 'Pronunciation Estimate', data: scores.pronunciation_estimate },
  ];

  const getBandBadgeColor = (band: number) => {
    if (band >= 7.5) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    if (band >= 6.5) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
    if (band >= 5.5) return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-12">
      {/* 상단 총점 헤더 카드 */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5" />
            Official Examiner Rubric Report
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Speaking Assessment</h2>
          <p className="text-sm text-slate-400 max-w-lg line-clamp-2">
            "{questionText}"
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-slate-900/80 border border-indigo-700/40 min-w-[140px]">
          <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider">Overall Band</span>
          <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mt-1">
            {scores.overall_band.toFixed(1)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1">Scale 0.0 - 9.0</span>
        </div>
      </div>

      {/* 4대 세부 채점 기준 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreCategories.map((cat) => (
          <div
            key={cat.key}
            className="glass-card p-5 rounded-xl border border-slate-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">{cat.name}</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBandBadgeColor(
                  cat.data.band
                )}`}
              >
                Band {cat.data.band.toFixed(1)}
              </span>
            </div>

            {/* 진행 바 */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${(cat.data.band / 9) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{cat.data.justification}</p>
          </div>
        ))}
      </div>

      {/* 나의 발화 전사본 (Transcript) */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          Candidate Transcript
        </h3>
        <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 leading-relaxed italic">
          "{transcript}"
        </p>
      </div>

      {/* 원어민 어휘 개선 (Lexical Enhancements) */}
      {lexical_enhancements && lexical_enhancements.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">Native Revision (Lexical Upgrades)</h3>
          </div>

          <div className="space-y-3">
            {lexical_enhancements.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                    Original Utterance
                  </span>
                  <p className="text-xs text-slate-300 line-through decoration-rose-500/50">
                    "{item.original}"
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                    Band 8.5+ Native Upgrade
                  </span>
                  <p className="text-xs text-emerald-300 font-medium">"{item.upgraded}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 취약점 & 다음 학습 초점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {critical_weaknesses && critical_weaknesses.length > 0 && (
          <div className="glass-card p-5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <h4 className="text-sm font-bold text-slate-200">Critical Weaknesses</h4>
            </div>
            <ul className="space-y-2">
              {critical_weaknesses.map((weakness, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggested_next_focus && (
          <div className="glass-card p-5 rounded-xl border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
              <h4 className="text-sm font-bold text-slate-200">Recommended Next Focus</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-indigo-950/20 p-3 rounded-lg border border-indigo-900/40">
              {suggested_next_focus}
            </p>
          </div>
        )}
      </div>

      {/* Band 8.5+ 모범 답변 */}
      {model_answer_band_8_5 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Model Answer (Band 8.5 - 9.0)
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            {model_answer_band_8_5}
          </p>
        </div>
      )}

      {/* 하단 액션 버튼 */}
      {onNext && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <span>{nextLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
