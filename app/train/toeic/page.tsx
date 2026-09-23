'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Mic, EyeOff, Sparkles, ChevronRight, ChevronLeft, Zap } from 'lucide-react';
import { TRAINING_UNITS, TrainingUnit } from '@/lib/constants/curriculum';
import { ChunkViewer } from '@/components/training/ChunkViewer';
import { ShadowingPlayer } from '@/components/training/ShadowingPlayer';
import { BlindRecallRecorder } from '@/components/training/BlindRecallRecorder';
import { SubstitutionDrill } from '@/components/training/SubstitutionDrill';

type TrainingStep = 'CHUNK' | 'SHADOWING' | 'BLIND' | 'DRILL';

export default function ToeicTrainingPage() {
  const toeicUnits = TRAINING_UNITS.filter((u) => u.examType === 'TOEIC');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(toeicUnits[0]?.id || '');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TrainingStep>('CHUNK');

  const currentUnit = toeicUnits.find((u) => u.id === selectedUnitId) || toeicUnits[0];
  const currentSentence = currentUnit.sentences[currentSentenceIdx] || currentUnit.sentences[0];

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setCurrentSentenceIdx(0);
    setActiveStep('CHUNK');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-boro-text">
      {/* 상단 헤더 */}
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
              TOEIC Speaking Lab
            </span>
            <span className="boro-chip bg-surface-container text-boro-text text-[11px] py-0.5 px-2.5">
              Training
            </span>
          </div>
        </div>

        <div className="text-xs text-boro-muted font-medium hidden sm:block">
          {currentUnit.sectionTitle}
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* 파트 선택 탭 */}
        <div className="flex flex-wrap gap-2 border-b border-boro-border/60 pb-3">
          {toeicUnits.map((unit) => (
            <button
              key={unit.id}
              onClick={() => handleSelectUnit(unit.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                unit.id === selectedUnitId
                  ? 'bg-boro-black text-white'
                  : 'bg-white border border-boro-border text-boro-muted hover:text-boro-text'
              }`}
            >
              {unit.sectionTitle.split(':')[0]} • {unit.topicTitle}
            </button>
          ))}
        </div>

        {/* 질문 & 전략 팁 카드 */}
        <div className="boro-card p-6 space-y-2.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="boro-chip bg-surface-container text-boro-text">
              {currentUnit.sectionTitle}
            </span>
            <span className="text-xs font-medium text-boro-muted">
              Sentence {currentSentenceIdx + 1} / {currentUnit.sentences.length}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-semibold text-boro-text">
            Q. "{currentUnit.question}"
          </h2>
          <p className="text-xs text-boro-muted">{currentUnit.questionKo}</p>

          <div className="pt-2 text-xs text-boro-text bg-surface-container p-3 rounded-card">
            💡 <strong>답변 전략:</strong> {currentUnit.strategyTip}
          </div>
        </div>

        {/* 4단계 학습 스텝 네비게이션 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { key: 'CHUNK', label: '1. 청크 파악', icon: BookOpen },
            { key: 'SHADOWING', label: '2. 쉐도잉 훈련', icon: Mic },
            { key: 'BLIND', label: '3. 블라인드 스피킹', icon: EyeOff },
            { key: 'DRILL', label: '4. 표현 치환', icon: Sparkles },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;

            return (
              <button
                key={step.key}
                onClick={() => setActiveStep(step.key as TrainingStep)}
                className={`p-3 rounded-card border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-boro-black text-white border-boro-black'
                    : 'bg-white border-boro-border text-boro-muted hover:text-boro-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 스텝별 컴포넌트 */}
        {activeStep === 'CHUNK' && (
          <ChunkViewer sentence={currentSentence} />
        )}

        {activeStep === 'SHADOWING' && (
          <ShadowingPlayer sentence={currentSentence} />
        )}

        {activeStep === 'BLIND' && (
          <BlindRecallRecorder
            sentence={currentSentence}
            questionText={currentUnit.question}
          />
        )}

        {activeStep === 'DRILL' && (
          <SubstitutionDrill sentence={currentSentence} />
        )}

        {/* 하단 문장 이전/다음 네비게이션 */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentSentenceIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentSentenceIdx === 0}
            className="boro-btn-secondary px-4 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 문장</span>
          </button>

          <span className="text-xs text-boro-muted font-medium">
            {currentSentenceIdx + 1} of {currentUnit.sentences.length} sentences
          </span>

          <button
            onClick={() =>
              setCurrentSentenceIdx((prev) => Math.min(currentUnit.sentences.length - 1, prev + 1))
            }
            disabled={currentSentenceIdx === currentUnit.sentences.length - 1}
            className="boro-btn-secondary px-4 py-2 text-xs flex items-center gap-1 disabled:opacity-40"
          >
            <span>다음 문장</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
