// components/training/ParaphrasingLadder.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Play, Volume2, CheckCircle2, ChevronRight, Layers, Mic } from 'lucide-react';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';
import { ParaphraseResponse, ParaphraseTier } from '@/app/api/train/paraphrase/route';

interface ParaphrasingLadderProps {
  initialText?: string;
  questionText: string;
  examType: 'IELTS' | 'TOEIC';
  onSelectForShadowing?: (text: string, ko: string) => void;
}

export const ParaphrasingLadder: React.FC<ParaphrasingLadderProps> = ({
  initialText = '',
  questionText,
  examType,
  onSelectForShadowing,
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ParaphraseResponse | null>(null);
  const [selectedTierKey, setSelectedTierKey] = useState<'level1_good' | 'level2_better' | 'level3_native'>('level2_better');

  const { speakText, isPlaying } = useTextToSpeech();

  // initialText가 변경되면 업데이트
  useEffect(() => {
    if (initialText && initialText.trim().length >= 5) {
      setInputText(initialText);
      handleGenerateParaphrase(initialText);
    }
  }, [initialText]);

  const handleGenerateParaphrase = async (textToParaphrase?: string) => {
    const target = (textToParaphrase || inputText).trim();
    if (!target || target.length < 5) return;

    setLoading(true);
    try {
      const res = await fetch('/api/train/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: target,
          questionText,
          examType,
        }),
      });
      const data: ParaphraseResponse = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Failed to paraphrase:', err);
    } finally {
      setLoading(false);
    }
  };

  const tiers = result?.tiers;

  return (
    <div className="boro-card p-5 sm:p-6 space-y-5 bg-white">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-surface-container text-boro-text">
            <Layers className="w-3 h-3 inline mr-1 text-boro-blue" />
            3단계 패러프레이징 사다리 (Paraphrasing Ladder)
          </span>
          <span className="text-xs text-boro-muted font-medium">
            Good (5.5) → Better (6.5) → Native (7.5+)
          </span>
        </div>

        <span className="text-xs text-boro-muted font-mono">
          {examType} Speaking Standard
        </span>
      </div>

      {/* 입력 영역 */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-boro-muted flex items-center justify-between">
          <span>변환할 발화 문장 (직접 입력하거나 녹음된 텍스트 활용):</span>
          <span className="text-[11px] text-boro-blue">Gemini 2.0 Flash 분석</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="예: I like my hometown because it is very quiet and has good parks."
            className="flex-1 px-4 py-2.5 rounded-card border border-boro-border text-sm text-boro-text bg-surface/50 focus:outline-none focus:border-boro-black transition-colors"
          />
          <button
            onClick={() => handleGenerateParaphrase()}
            disabled={loading || inputText.trim().length < 5}
            className="boro-btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? '변환 중...' : '3단계 업그레이드'}</span>
          </button>
        </div>
      </div>

      {/* 3개 티어 카드 뷰 */}
      {tiers && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Level 1: Good */}
            <TierCard
              tierKey="level1_good"
              tier={tiers.level1_good}
              isSelected={selectedTierKey === 'level1_good'}
              badgeBg="bg-stone-100 text-stone-700"
              borderColor="border-stone-300"
              onSelect={() => setSelectedTierKey('level1_good')}
              onPlay={() => speakText(tiers.level1_good.text)}
              onShadowing={() => onSelectForShadowing?.(tiers.level1_good.text, tiers.level1_good.ko)}
            />

            {/* Level 2: Better */}
            <TierCard
              tierKey="level2_better"
              tier={tiers.level2_better}
              isSelected={selectedTierKey === 'level2_better'}
              badgeBg="bg-blue-100 text-boro-blue"
              borderColor="border-boro-blue/60"
              recommendedTag="추천 목표"
              onSelect={() => setSelectedTierKey('level2_better')}
              onPlay={() => speakText(tiers.level2_better.text)}
              onShadowing={() => onSelectForShadowing?.(tiers.level2_better.text, tiers.level2_better.ko)}
            />

            {/* Level 3: Native */}
            <TierCard
              tierKey="level3_native"
              tier={tiers.level3_native}
              isSelected={selectedTierKey === 'level3_native'}
              badgeBg="bg-emerald-100 text-emerald-800"
              borderColor="border-emerald-500/60"
              recommendedTag="최고 득점"
              onSelect={() => setSelectedTierKey('level3_native')}
              onPlay={() => speakText(tiers.level3_native.text)}
              onShadowing={() => onSelectForShadowing?.(tiers.level3_native.text, tiers.level3_native.ko)}
            />
          </div>

          {/* 선택된 티어 상세 비교 & 학습 가이드 */}
          {tiers[selectedTierKey] && (
            <div className="p-4 rounded-card bg-surface-container/60 border border-boro-border/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-boro-text flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-boro-blue stroke-[2]" />
                  <span>{tiers[selectedTierKey].levelTitle} 점수 상승 핵심 포인트</span>
                </span>
                <span className="boro-chip text-[11px] py-0.5 px-2 bg-white">
                  {tiers[selectedTierKey].band}
                </span>
              </div>

              <p className="text-xs text-boro-text leading-relaxed">
                💡 <strong>개선점:</strong> {tiers[selectedTierKey].keyEnhancement}
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-boro-muted">핵심 패턴:</span>
                {tiers[selectedTierKey].usedPatterns.map((pat, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-white border border-boro-border text-boro-text"
                  >
                    {pat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface TierCardProps {
  tierKey: string;
  tier: ParaphraseTier;
  isSelected: boolean;
  badgeBg: string;
  borderColor: string;
  recommendedTag?: string;
  onSelect: () => void;
  onPlay: () => void;
  onShadowing: () => void;
}

const TierCard: React.FC<TierCardProps> = ({
  tier,
  isSelected,
  badgeBg,
  borderColor,
  recommendedTag,
  onSelect,
  onPlay,
  onShadowing,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-card border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
        isSelected
          ? `bg-white ${borderColor} ring-2 ring-boro-blue/20 shadow-sm`
          : 'bg-surface/50 border-boro-border/80 hover:bg-white'
      }`}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
            {tier.band}
          </span>
          {recommendedTag && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-boro-black text-white">
              {recommendedTag}
            </span>
          )}
        </div>

        <h4 className="text-xs font-semibold text-boro-text">{tier.levelTitle}</h4>

        <p className="text-xs sm:text-sm font-medium text-boro-text leading-relaxed">
          "{tier.text}"
        </p>
        <p className="text-[11px] text-boro-muted2 leading-relaxed">
          {tier.ko}
        </p>
      </div>

      <div className="pt-2 border-t border-boro-border/60 flex items-center justify-between gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="p-2 rounded-full bg-surface-container hover:bg-boro-black hover:text-white transition-colors text-boro-muted"
          title="원어민 발음 듣기"
        >
          <Volume2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onShadowing();
          }}
          className="text-[11px] font-semibold text-boro-blue hover:text-boro-text flex items-center gap-1 transition-colors"
        >
          <Mic className="w-3 h-3" />
          <span>쉐도잉으로 훈련</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
