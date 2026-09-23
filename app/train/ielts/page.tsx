// app/train/ielts/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Mic,
  EyeOff,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { TRAINING_UNITS, TrainingUnit, TrainingSentence } from '@/lib/constants/curriculum';
import { IELTS_PREDICTED_TOPICS } from '@/lib/constants/ieltsPredictedTopics';
import { TopicSelectorModal } from '@/components/training/TopicSelectorModal';
import { ChunkViewer } from '@/components/training/ChunkViewer';
import { ShadowingPlayer } from '@/components/training/ShadowingPlayer';
import { BlindRecallRecorder } from '@/components/training/BlindRecallRecorder';
import { SubstitutionDrill } from '@/components/training/SubstitutionDrill';
import { PrepFrameworkBuilder } from '@/components/training/PrepFrameworkBuilder';
import { ParaphrasingLadder } from '@/components/training/ParaphrasingLadder';
import { WeakChunkReviewModal } from '@/components/training/WeakChunkReviewModal';
import { getWeakChunkStats } from '@/lib/db/weakChunkStore';

type TrainingStep = 'CHUNK' | 'SHADOWING' | 'BLIND' | 'PREP' | 'PARAPHRASE' | 'DRILL';

export default function IeltsTrainingPage() {
  const ieltsUnits = TRAINING_UNITS.filter((u) => u.examType === 'IELTS');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(ieltsUnits[0]?.id || '');
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState<number>(0);
  const [activeStep, setActiveStep] = useState<TrainingStep>('CHUNK');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);
  const [weakStats, setWeakStats] = useState<{ totalCount: number; dueCount: number; masteredCount: number }>({
    totalCount: 0,
    dueCount: 0,
    masteredCount: 0,
  });

  // 동적 쉐도잉 문장 (패러프레이징 사다리에서 선택 시 교체)
  const [customSentence, setCustomSentence] = useState<TrainingSentence | null>(null);

  const refreshWeakStats = () => {
    setWeakStats(getWeakChunkStats());
  };

  useEffect(() => {
    refreshWeakStats();
  }, []);

  const currentUnit = ieltsUnits.find((u) => u.id === selectedUnitId) || ieltsUnits[0];
  const activeSentence =
    customSentence || currentUnit.sentences[currentSentenceIdx] || currentUnit.sentences[0];

  // 현재 유닛의 기출 주제 및 질문 정보
  const currentTopicInfo = useMemo(() => {
    for (const topic of IELTS_PREDICTED_TOPICS) {
      const q = topic.questions.find((item) => item.unit.id === selectedUnitId);
      if (q) return { topic, question: q };
    }
    return null;
  }, [selectedUnitId]);

  const currentTopicIndex = currentTopicInfo
    ? IELTS_PREDICTED_TOPICS.findIndex((t) => t.id === currentTopicInfo.topic.id)
    : -1;

  const handleSelectUnit = (id: string) => {
    setSelectedUnitId(id);
    setCurrentSentenceIdx(0);
    setCustomSentence(null);
    setActiveStep('CHUNK');
  };

  const handlePrevTopic = () => {
    if (currentTopicIndex > 0) {
      const prevTopic = IELTS_PREDICTED_TOPICS[currentTopicIndex - 1];
      handleSelectUnit(prevTopic.questions[0].unit.id);
    }
  };

  const handleNextTopic = () => {
    if (currentTopicIndex >= 0 && currentTopicIndex < IELTS_PREDICTED_TOPICS.length - 1) {
      const nextTopic = IELTS_PREDICTED_TOPICS[currentTopicIndex + 1];
      handleSelectUnit(nextTopic.questions[0].unit.id);
    }
  };

  const handleSelectForShadowing = (text: string, ko: string) => {
    setCustomSentence({
      id: `custom_${Date.now()}`,
      fullText: text,
      fullKo: ko,
      chunks: text.split(/([,.]\s*)/).filter(Boolean).map((part) => ({
        text: part.trim(),
        ko: '업그레이드 표현',
        isKeyChunk: true,
      })),
    });
    setActiveStep('SHADOWING');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-boro-text">
      {/* 45개 기출/예상 주제 선택 모달 */}
      <TopicSelectorModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        currentUnitId={selectedUnitId}
        onSelectUnit={handleSelectUnit}
      />

      {/* 1분 퀵 복습 모달 */}
      <WeakChunkReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onUpdateStats={refreshWeakStats}
      />

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
              IELTS Speaking Lab
            </span>
            <span className="boro-chip text-[11px] py-0.5 px-2.5">
              Training
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 주제 선택 모달 열기 버튼 */}
          <button
            onClick={() => setIsTopicModalOpen(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-boro-black text-white hover:bg-boro-black/90 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>기출 45개 주제 선택</span>
          </button>

          {weakStats.dueCount > 0 && (
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>복습 청크 {weakStats.dueCount}개</span>
            </button>
          )}

          <div className="text-xs text-boro-muted font-medium hidden sm:block">
            {currentUnit.sectionTitle}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        {/* 기출 주제 네비게이션 배너 */}
        <div className="bg-white border border-boro-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {currentTopicInfo && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-boro-muted border border-boro-border/60">
                  {currentTopicInfo.topic.screenshotId}
                </span>
              )}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  currentTopicInfo?.topic.part === 1
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}
              >
                {currentTopicInfo?.topic.part === 1
                  ? 'Part 1: Personal Interview'
                  : 'Part 2 & 3: Cue Card & Discussion'}
              </span>
              <span className="text-[10px] text-boro-muted font-medium">
                45개 기출 컬렉션 중 {currentTopicIndex >= 0 ? currentTopicIndex + 1 : 1}번째 주제
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <h1 className="text-base sm:text-lg font-bold text-boro-text">
                {currentTopicInfo?.topic.topicTitle || currentUnit.topicTitle}
              </h1>
              <span className="text-xs text-boro-muted">
                {currentTopicInfo?.topic.topicTitleKo}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevTopic}
              disabled={currentTopicIndex <= 0}
              title="이전 기출 주제"
              className="p-2 rounded-lg border border-boro-border text-boro-muted hover:text-boro-text hover:bg-surface-container disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsTopicModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-boro-border bg-surface-container-lowest hover:bg-surface-container text-xs font-semibold text-boro-text flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-boro-muted" />
              <span>전체 주제 목록 (45개)</span>
            </button>
            <button
              onClick={handleNextTopic}
              disabled={
                currentTopicIndex < 0 ||
                currentTopicIndex >= IELTS_PREDICTED_TOPICS.length - 1
              }
              title="다음 기출 주제"
              className="p-2 rounded-lg border border-boro-border text-boro-muted hover:text-boro-text hover:bg-surface-container disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Part 2 전용 Candidate Task Card (큐카드 가이드) */}
        {currentTopicInfo?.question.cuePoints && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>📋 Part 2 Candidate Task Card</span>
              </span>
              <span className="text-[11px] text-amber-800 font-medium">
                발표 준비 1분 • 발표 1~2분
              </span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish:
            </p>
            <ul className="list-disc list-inside text-xs text-amber-950 font-medium space-y-1 pl-1">
              {currentTopicInfo.question.cuePoints.map((point, idx) => (
                <li key={idx}>{point}</li>
              ))}
            </ul>
          </div>
        )}


        {/* 질문 & 전략 팁 카드 */}
        <div className="boro-card p-6 space-y-2.5 bg-white">
          <div className="flex items-center justify-between">
            <span className="boro-chip">
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

          <div className="pt-2 text-xs text-boro-blue bg-boro-blue-soft/50 p-3 rounded-card">
            💡 <strong>전략 Tip:</strong> {currentUnit.strategyTip}
          </div>
        </div>

        {/* 6단계 완성형 학습 스텝 네비게이션 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[
            { key: 'CHUNK', label: '1. 청크 파악', icon: BookOpen },
            { key: 'SHADOWING', label: '2. 쉐도잉', icon: Mic },
            { key: 'BLIND', label: '3. 블라인드', icon: EyeOff },
            { key: 'PREP', label: '4. PREP 빌더', icon: Layers },
            { key: 'PARAPHRASE', label: '5. 패러프레이즈', icon: Sparkles },
            { key: 'DRILL', label: '6. 표현 치환', icon: Sparkles },
          ].map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.key;

            return (
              <button
                key={step.key}
                onClick={() => {
                  setActiveStep(step.key as TrainingStep);
                  if (step.key !== 'SHADOWING') {
                    setCustomSentence(null);
                  }
                }}
                className={`p-2.5 sm:p-3 rounded-card border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-boro-black text-white border-boro-black shadow-sm'
                    : 'bg-white border-boro-border text-boro-muted hover:text-boro-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{step.label}</span>
              </button>
            );
          })}
        </div>

        {/* 스텝별 컴포넌트 렌더링 */}
        {activeStep === 'CHUNK' && (
          <ChunkViewer sentence={activeSentence} />
        )}

        {activeStep === 'SHADOWING' && (
          <ShadowingPlayer
            sentence={activeSentence}
            examType="IELTS"
            sectionTitle={currentUnit.sectionTitle}
            onComplete={() => refreshWeakStats()}
          />
        )}

        {activeStep === 'BLIND' && (
          <BlindRecallRecorder
            sentence={activeSentence}
            questionText={currentUnit.question}
            examType="IELTS"
            sectionTitle={currentUnit.sectionTitle}
            onSelectForShadowing={handleSelectForShadowing}
            onSuccess={() => refreshWeakStats()}
          />
        )}

        {activeStep === 'PREP' && (
          <PrepFrameworkBuilder
            questionText={currentUnit.question}
            questionKo={currentUnit.questionKo}
            examType="IELTS"
          />
        )}

        {activeStep === 'PARAPHRASE' && (
          <ParaphrasingLadder
            initialText={activeSentence.fullText}
            questionText={currentUnit.question}
            examType="IELTS"
            onSelectForShadowing={handleSelectForShadowing}
          />
        )}

        {activeStep === 'DRILL' && (
          <SubstitutionDrill sentence={activeSentence} />
        )}

        {/* 하단 문장 이전/다음 네비게이션 */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              setCustomSentence(null);
              setCurrentSentenceIdx((prev) => Math.max(0, prev - 1));
            }}
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
            onClick={() => {
              setCustomSentence(null);
              setCurrentSentenceIdx((prev) =>
                Math.min(currentUnit.sentences.length - 1, prev + 1)
              );
            }}
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
