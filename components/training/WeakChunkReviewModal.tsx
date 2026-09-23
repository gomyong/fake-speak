// components/training/WeakChunkReviewModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Volume2, Mic, Square, CheckCircle2, Award, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import {
  WeakChunk,
  getDueWeakChunks,
  recordReviewResult,
  getAllWeakChunks,
} from '@/lib/db/weakChunkStore';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';
import { useAudioRecorder } from '@/lib/audio/useAudioRecorder';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';

interface WeakChunkReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStats?: () => void;
}

export const WeakChunkReviewModal: React.FC<WeakChunkReviewModalProps> = ({
  isOpen,
  onClose,
  onUpdateStats,
}) => {
  const [dueChunks, setDueChunks] = useState<WeakChunk[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [reviewResult, setReviewResult] = useState<{
    accuracy: number;
    passed: boolean;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const { speakText } = useTextToSpeech();
  const { isRecording, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  // 모달이 열릴 때 오늘 복습할 청크 로드
  useEffect(() => {
    if (isOpen) {
      const due = getDueWeakChunks();
      setDueChunks(due);
      setCurrentIndex(0);
      setReviewResult(null);
      setIsCompleted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentChunk = dueChunks[currentIndex];

  // 녹음 시작
  const handleStartRecording = () => {
    resetRecording();
    resetTranscript();
    setReviewResult(null);
    startRecording();
    startListening();
  };

  // 녹음 종료 및 채점
  const handleStopRecording = async () => {
    stopListening();
    try {
      await stopRecording();
    } catch (e) {}

    const spoken = (transcript + ' ' + interimTranscript).trim().toLowerCase();
    const target = currentChunk.chunkText.toLowerCase().replace(/[^a-z0-9\s]/g, '');

    const targetWords = target.split(/\s+/).filter(Boolean);
    const spokenWords = spoken.split(/\s+/).filter(Boolean);

    const matched = targetWords.filter((w) => spokenWords.includes(w)).length;
    const accuracy = targetWords.length > 0 ? Math.round((matched / targetWords.length) * 100) : 0;
    const passed = accuracy >= 75;

    // SRS 결과 기록 (성공 시 간격 증가, 실패 시 재복습)
    recordReviewResult(currentChunk.id, passed, accuracy);
    setReviewResult({ accuracy, passed });
    onUpdateStats?.();
  };

  // 다음 청크로 이동
  const handleNext = () => {
    if (currentIndex + 1 < dueChunks.length) {
      setCurrentIndex((prev) => prev + 1);
      setReviewResult(null);
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-boro-black/40 backdrop-blur-sm animate-fade-in">
      <div className="boro-card max-w-lg w-full bg-white p-6 space-y-5 shadow-2xl relative">
        {/* 상단 닫기 & 타이틀 */}
        <div className="flex items-center justify-between border-b border-boro-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="boro-chip bg-surface-container text-boro-text">
              <Sparkles className="w-3 h-3 inline mr-1 text-boro-blue" />
              1분 퀵 복습 (에빙하우스 망각곡선)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-boro-muted hover:text-boro-text hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 복습할 청크가 없는 경우 */}
        {dueChunks.length === 0 && !isCompleted && (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-semibold text-boro-text">
              오늘 복습할 취약 청크가 없습니다!
            </h3>
            <p className="text-xs text-boro-muted leading-relaxed max-w-xs mx-auto">
              모든 청크가 최적의 기억 주기에 보관되어 있습니다. 훈련소에서 새로운 표현을 학습해 보세요.
            </p>
            <button onClick={onClose} className="boro-btn-primary px-5 py-2 text-xs">
              확인
            </button>
          </div>
        )}

        {/* 전체 복습 완료 화면 */}
        {isCompleted && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-boro-blue-soft text-boro-blue flex items-center justify-center mx-auto">
              <Award className="w-7 h-7 stroke-[2]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-semibold text-boro-text">
                오늘의 1분 퀵 복습 완료!
              </h3>
              <p className="text-xs text-boro-muted">
                총 {dueChunks.length}개 취약 청크의 망각곡선 레벨이 업데이트되었습니다.
              </p>
            </div>
            <button onClick={onClose} className="boro-btn-primary px-6 py-2.5 text-xs">
              완료하고 닫기
            </button>
          </div>
        )}

        {/* 복습 진행 중 카드 */}
        {currentChunk && !isCompleted && (
          <div className="space-y-5">
            {/* 프로그레스 */}
            <div className="flex items-center justify-between text-xs text-boro-muted">
              <span>
                청크 {currentIndex + 1} / {dueChunks.length}
              </span>
              <span className="font-mono font-semibold text-boro-blue">
                SRS Level: {currentChunk.level} (다음 주기: {currentChunk.nextReviewDate})
              </span>
            </div>

            {/* 청크 카드 */}
            <div className="p-5 rounded-card bg-surface-container/60 border border-boro-border/80 space-y-3 text-center">
              <span className="text-[11px] font-bold text-boro-muted uppercase tracking-wider">
                {currentChunk.sectionTitle}
              </span>

              {/* 한국어 의미 먼저 제시 (블라인드 리콜) */}
              <h4 className="text-base sm:text-lg font-bold text-boro-text">
                "{currentChunk.ko}"
              </h4>

              {/* 정답 영문 청크 (발화 후 공개 또는 듣기) */}
              <div className="pt-2 border-t border-boro-border/60 flex items-center justify-center gap-2">
                <p className="text-sm font-semibold text-boro-blue font-mono">
                  {reviewResult ? currentChunk.chunkText : '••••••••••••••••'}
                </p>

                <button
                  onClick={() => speakText(currentChunk.chunkText)}
                  className="p-1.5 rounded-full bg-white border border-boro-border hover:bg-boro-black hover:text-white transition-colors text-boro-muted"
                  title="원어민 발음 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-boro-muted2 italic">
                예문 문맥: "{currentChunk.contextSentence}"
              </p>
            </div>

            {/* 녹음 중 / 결과 영역 */}
            {isRecording && (
              <div className="p-3 rounded-card bg-white border border-rose-200 text-center animate-pulse">
                <p className="text-xs text-rose-600 font-semibold">
                  ● 소리 내어 청크를 말하세요: {transcript || interimTranscript || '인식 대기 중...'}
                </p>
              </div>
            )}

            {reviewResult && !isRecording && (
              <div
                className={`p-3.5 rounded-card border text-xs space-y-1 ${
                  reviewResult.passed
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-rose-50 border-rose-300 text-rose-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>
                    {reviewResult.passed ? '✓ 복습 통과! (다음 주기로 이동)' : '✕ 불일치 (내일 다시 복습)'}
                  </span>
                  <span>일치율: {reviewResult.accuracy}%</span>
                </div>
                <p className="text-[11px] opacity-90">
                  내가 말한 내용: "{transcript || '음성 미인식'}"
                </p>
              </div>
            )}

            {/* 하단 컨트롤러 */}
            <div className="flex items-center justify-between pt-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="boro-btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>{reviewResult ? '다시 발화하기' : '소리 내어 말하기'}</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="px-5 py-2.5 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-2 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>완료</span>
                </button>
              )}

              {reviewResult && (
                <button
                  onClick={handleNext}
                  className="boro-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <span>{currentIndex + 1 < dueChunks.length ? '다음 청크' : '복습 완료'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
