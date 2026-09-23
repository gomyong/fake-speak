// components/training/SpeechAnalyticsCard.tsx
'use client';

import React, { useMemo } from 'react';
import { Gauge, AlertCircle, Sparkles, BookA, Clock, Zap } from 'lucide-react';
import { analyzeSpeech, SpeechAnalyticsResult } from '@/lib/ai/speechAnalytics';

interface SpeechAnalyticsCardProps {
  transcript: string;
  durationSeconds: number;
  onApplySynonym?: (original: string, replacement: string) => void;
}

export const SpeechAnalyticsCard: React.FC<SpeechAnalyticsCardProps> = ({
  transcript,
  durationSeconds,
  onApplySynonym,
}) => {
  const analytics: SpeechAnalyticsResult = useMemo(() => {
    return analyzeSpeech(transcript, durationSeconds);
  }, [transcript, durationSeconds]);

  if (!transcript || transcript.trim().length === 0) {
    return null;
  }

  // WPM 상태 색상
  const getWpmColor = (status: SpeechAnalyticsResult['wpmStatus']) => {
    switch (status) {
      case 'OPTIMAL':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'SLIGHTLY_SLOW':
      case 'FAST':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'TOO_SLOW':
      case 'TOO_FAST':
        return 'text-boro-red bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-5 bg-white">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-surface-container text-boro-text">
            <Zap className="w-3 h-3 inline mr-1 text-boro-blue" />
            실시간 정량 스피킹 분석
          </span>
          <span className="text-xs text-boro-muted font-medium">
            WPM • 필러 워드 • 어휘 다양성
          </span>
        </div>
        <div className="text-xs font-mono text-boro-muted">
          발화 단어: <strong className="text-boro-text">{analytics.wordCount}</strong> / 시간:{' '}
          <strong className="text-boro-text">{Math.round(analytics.durationSeconds)}초</strong>
        </div>
      </div>

      {/* 3대 정량 지표 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. 말하기 속도 (WPM) */}
        <div className="p-4 rounded-card border border-boro-border/80 bg-surface/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-muted flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-boro-blue" />
              말하기 속도 (WPM)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getWpmColor(
                analytics.wpmStatus
              )}`}
            >
              {analytics.wpmStatus}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-boro-text">
              {analytics.wpm}
            </span>
            <span className="text-xs text-boro-muted font-medium">words/min</span>
          </div>

          {/* 이상적 범위 게이지 (120 - 150) */}
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                analytics.wpmStatus === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(Math.max((analytics.wpm / 200) * 100, 10), 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-boro-muted leading-relaxed">
            {analytics.wpmMessage}
          </p>
        </div>

        {/* 2. 필러 워드 (추임새) */}
        <div className="p-4 rounded-card border border-boro-border/80 bg-surface/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-muted flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              필러 워드 (추임새)
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                analytics.fillers.totalCount === 0
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {analytics.fillers.totalCount === 0 ? 'CLEAN' : `${analytics.fillers.totalCount}회 감지`}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-boro-text">
              {analytics.fillers.fillerRatio}%
            </span>
            <span className="text-xs text-boro-muted font-medium">전체 발화 대비</span>
          </div>

          {/* 감지된 필러 워드 태그들 */}
          <div className="flex flex-wrap gap-1 min-h-[20px]">
            {analytics.fillers.detected.length > 0 ? (
              analytics.fillers.detected.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold"
                >
                  "{f.word}" ({f.count})
                </span>
              ))
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium">
                ✓ 불필요한 추임새 없이 깔끔합니다.
              </span>
            )}
          </div>
        </div>

        {/* 3. 어휘 다양성 (TTR) */}
        <div className="p-4 rounded-card border border-boro-border/80 bg-surface/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-muted flex items-center gap-1.5">
              <BookA className="w-3.5 h-3.5 text-indigo-500" />
              어휘 다양성 (TTR)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-indigo-700 bg-indigo-50 border-indigo-200">
              {analytics.lexicalDiversity.rating}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-boro-text">
              {analytics.lexicalDiversity.ttr}
            </span>
            <span className="text-xs text-boro-muted font-medium">
              ({analytics.lexicalDiversity.uniqueWordCount}/{analytics.wordCount} 고유단어)
            </span>
          </div>

          <p className="text-[11px] text-boro-muted leading-relaxed">
            {analytics.lexicalDiversity.rating === 'LIMITED'
              ? '동일 단어의 반복이 잦습니다. 다양한 유의어를 활용해 보세요.'
              : '어휘가 풍부하며 다양한 표현을 적극적으로 사용하고 있습니다.'}
          </p>
        </div>
      </div>

      {/* 발화 텍스트 인터랙티브 하이라이트 */}
      <div className="p-4 rounded-card bg-surface-container/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-boro-muted font-medium">
          <span>발화 내용 분석 하이라이트:</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> 필러 워드
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-boro-blue" /> 대체 추천 기초 어휘
            </span>
          </div>
        </div>

        <p className="text-sm sm:text-base leading-relaxed text-boro-text font-medium">
          {analytics.highlightedTokens.map((token, i) => {
            if (token.isFiller) {
              return (
                <span
                  key={i}
                  className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-rose-200/80 text-rose-800 font-semibold text-xs underline decoration-rose-500"
                  title="필러 워드(추임새) 감지"
                >
                  {token.text}
                </span>
              );
            }
            if (token.isOverused) {
              return (
                <span
                  key={i}
                  className="inline-block px-1.5 py-0.2 mx-0.5 rounded bg-boro-blue-soft text-boro-blue font-semibold text-xs border border-boro-blue/30 cursor-pointer"
                  title={`추천 대체어: ${token.replacementHint}`}
                >
                  {token.text}
                </span>
              );
            }
            return (
              <span key={i} className="inline-block mr-1">
                {token.text}
              </span>
            );
          })}
        </p>
      </div>

      {/* 추천 고득점 대체 어휘 카드 (Synonym Chips) */}
      {analytics.overusedWords.length > 0 && (
        <div className="space-y-2.5 pt-1 border-t border-boro-border/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-boro-text">
            <Sparkles className="w-3.5 h-3.5 text-boro-blue" />
            <span>Band 7.5+ 추천 업그레이드 어휘 (탭하여 적용)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {analytics.overusedWords.map((ov, idx) => (
              <div
                key={idx}
                className="p-3 rounded-card bg-white border border-boro-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    "{ov.original}"
                  </span>
                  <span className="text-[10px] text-boro-muted">{ov.explanation}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ov.upgraded.map((syn, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => onApplySynonym?.(ov.original, syn)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container text-boro-blue hover:bg-boro-blue hover:text-white transition-all active:scale-95"
                    >
                      + {syn}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
