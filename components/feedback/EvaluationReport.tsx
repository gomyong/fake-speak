'use client';

import React from 'react';
import { Award, CheckCircle2, AlertCircle, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12">
      {/* 휴리스틱 폴백 안내 배너 */}
      {evaluation.is_fallback && (
        <div className="p-4 rounded-card bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong>임시 로컬 분석:</strong> AI 서버 일시 응답 지연으로 로컬 휴리스틱 분석 결과가 표시되었습니다.
          </p>
        </div>
      )}

      {/* 상단 총점 헤더 카드 (Boro UI Architectural Header) */}
      <div className="boro-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="boro-chip">
            Official Examiner Rubric
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-boro-text">Speaking Assessment</h2>
          <p className="text-xs sm:text-sm text-boro-muted max-w-lg line-clamp-2">
            "{questionText}"
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-card bg-surface-container border border-boro-border min-w-[130px]">
          <span className="text-[10px] uppercase font-semibold text-boro-muted tracking-wider">Overall Band</span>
          <span className="text-4xl sm:text-5xl font-semibold tracking-tighter text-boro-text mt-0.5">
            {scores.overall_band.toFixed(1)}
          </span>
          <span className="text-[11px] text-boro-muted2 mt-0.5">Scale 0.0 - 9.0</span>
        </div>
      </div>

      {/* 4대 세부 채점 기준 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scoreCategories.map((cat) => (
          <div
            key={cat.key}
            className="boro-card p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-boro-text">{cat.name}</span>
              <span className="boro-chip text-[11px] py-0.5 px-2">
                Band {cat.data.band.toFixed(1)}
              </span>
            </div>

            {/* 미니멀 진행 바 */}
            <div className="w-full h-1.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full bg-boro-blue rounded-full transition-all duration-700"
                style={{ width: `${(cat.data.band / 9) * 100}%` }}
              />
            </div>

            <p className="text-xs text-boro-muted leading-relaxed">{cat.data.justification}</p>
          </div>
        ))}
      </div>

      {/* 나의 발화 전사본 (Transcript) */}
      <div className="boro-card p-6 space-y-2">
        <h3 className="text-xs font-semibold text-boro-muted uppercase tracking-wider flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
          Candidate Transcript
        </h3>
        <p className="text-sm text-boro-text bg-surface-container p-4 rounded-card leading-relaxed italic">
          "{transcript}"
        </p>
      </div>

      {/* 원어민 어휘 개선 (Lexical Enhancements) */}
      {lexical_enhancements && lexical_enhancements.length > 0 && (
        <div className="boro-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-boro-blue stroke-[1.5]" />
            <h3 className="text-base font-semibold text-boro-text">Native Revision (Lexical Upgrades)</h3>
          </div>

          <div className="space-y-3">
            {lexical_enhancements.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-card bg-surface-container"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-boro-red uppercase tracking-wider">
                    Original Utterance
                  </span>
                  <p className="text-xs text-boro-muted line-through decoration-boro-red/40">
                    "{item.original}"
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-boro-blue uppercase tracking-wider">
                    Band 8.5+ Upgrade
                  </span>
                  <p className="text-xs text-boro-text font-medium">"{item.upgraded}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 취약점 & 다음 학습 초점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {critical_weaknesses && critical_weaknesses.length > 0 && (
          <div className="boro-card p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-boro-text">
              <AlertCircle className="w-4 h-4 text-boro-red stroke-[1.5]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-boro-muted">Critical Weaknesses</h4>
            </div>
            <ul className="space-y-1.5">
              {critical_weaknesses.map((weakness, i) => (
                <li key={i} className="text-xs text-boro-text flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-boro-red mt-1.5 shrink-0" />
                  <span>{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {suggested_next_focus && (
          <div className="boro-card p-5 space-y-2.5">
            <div className="flex items-center gap-1.5 text-boro-text">
              <CheckCircle2 className="w-4 h-4 text-boro-blue stroke-[1.5]" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-boro-muted">Recommended Focus</h4>
            </div>
            <p className="text-xs text-boro-text leading-relaxed bg-surface-container p-3 rounded-card">
              {suggested_next_focus}
            </p>
          </div>
        )}
      </div>

      {/* Band 8.5+ 모범 답변 */}
      {model_answer_band_8_5 && (
        <div className="boro-card p-6 space-y-2">
          <h3 className="text-xs font-semibold text-boro-muted uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-boro-blue stroke-[1.5]" />
            Model Answer (Band 8.5 - 9.0)
          </h3>
          <p className="text-xs sm:text-sm text-boro-text leading-relaxed bg-surface-container p-4 rounded-card">
            {model_answer_band_8_5}
          </p>
        </div>
      )}

      {/* 하단 액션 버튼 */}
      {onNext && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onNext}
            className="boro-btn-primary py-3.5 px-6 flex items-center gap-2 text-sm"
          >
            <span>{nextLabel}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      )}
    </div>
  );
};
