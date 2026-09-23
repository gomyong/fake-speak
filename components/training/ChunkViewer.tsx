'use client';

import React, { useState } from 'react';
import { Volume2, Play, Pause } from 'lucide-react';
import { TrainingSentence, SentenceChunk } from '@/lib/constants/curriculum';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';

interface ChunkViewerProps {
  sentence: TrainingSentence;
  showTranslation?: boolean;
}

export const ChunkViewer: React.FC<ChunkViewerProps> = ({
  sentence,
  showTranslation = true,
}) => {
  const { isPlaying, playbackRate, setPlaybackRate, speakText, stopSpeaking } = useTextToSpeech();
  const [activeChunkIndex, setActiveChunkIndex] = useState<number | null>(null);

  const handlePlayFull = () => {
    if (isPlaying) {
      stopSpeaking();
      setActiveChunkIndex(null);
    } else {
      setActiveChunkIndex(null);
      speakText(sentence.fullText);
    }
  };

  const handlePlayChunk = (chunk: SentenceChunk, index: number) => {
    setActiveChunkIndex(index);
    speakText(chunk.text).then(() => {
      setActiveChunkIndex(null);
    });
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-4">
      {/* 상단 컨트롤러: 전체 재생 및 속도 설정 */}
      <div className="flex items-center justify-between border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayFull}
            className="boro-btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            {isPlaying && activeChunkIndex === null ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Listen All</span>
              </>
            )}
          </button>

          <span className="text-xs text-boro-muted font-medium hidden sm:inline">
            청크를 클릭하면 개별 발음을 듣습니다
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                playbackRate === rate
                  ? 'bg-boro-black text-white'
                  : 'bg-surface-container text-boro-muted hover:text-boro-text'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* 청킹 분할 텍스트 뷰 */}
      <div className="flex flex-wrap gap-2.5 items-center">
        {sentence.chunks.map((chunk, idx) => {
          const isChunkPlaying = activeChunkIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => handlePlayChunk(chunk, idx)}
              className={`group text-left p-2.5 sm:p-3 rounded-card border transition-all text-sm leading-relaxed ${
                isChunkPlaying
                  ? 'bg-boro-blue-soft border-boro-blue text-boro-blue ring-2 ring-boro-blue/20'
                  : chunk.isKeyChunk
                  ? 'bg-surface-container/80 border-boro-border hover:border-boro-muted text-boro-text'
                  : 'bg-white border-boro-border/80 hover:border-boro-border text-boro-text'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold">{chunk.text}</span>
                <Volume2 className="w-3 h-3 text-boro-muted group-hover:text-boro-blue opacity-70 shrink-0" />
              </div>

              {showTranslation && (
                <span className="block text-[11px] text-boro-muted mt-1 font-normal">
                  {chunk.ko}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 전체 해석 */}
      {showTranslation && (
        <div className="pt-2 text-xs text-boro-muted2 bg-surface-container p-3 rounded-card">
          <span className="font-medium text-boro-muted mr-1">[전체 번역]</span>
          {sentence.fullKo}
        </div>
      )}
    </div>
  );
};
