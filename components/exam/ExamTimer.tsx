'use client';

import React, { useEffect, useRef, useState } from 'react';
import { playStartBeep, playWarningBeep, playEndBeep } from '@/lib/audio/soundEffects';
import { Volume2, VolumeX } from 'lucide-react';

interface ExamTimerProps {
  duration: number; // 총 초
  phase: 'PREPARATION' | 'SPEAKING' | 'IDLE';
  onComplete: () => void;
  autoStart?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  duration,
  phase,
  onComplete,
  autoStart = true,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(duration);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const workerRef = useRef<Worker | null>(null);
  const hasWarnedRef = useRef<boolean>(false);
  const hasPlayedStartBeepRef = useRef<boolean>(false);
  const onCompleteRef = useRef(onComplete);

  // onComplete 참조 갱신 (부모 컴포넌트 리렌더링에 의한 타이머 재시작 방지)
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setSecondsLeft(duration);
    hasWarnedRef.current = false;
    hasPlayedStartBeepRef.current = false;

    if (phase === 'IDLE' || duration <= 0) return;

    // 시작 비프음 1회만 재생 (음소거 상태가 아닐 때)
    if (autoStart && phase === 'SPEAKING' && !hasPlayedStartBeepRef.current) {
      hasPlayedStartBeepRef.current = true;
      if (!isMuted) {
        playStartBeep();
      }
    }

    try {
      const worker = new Worker('/workers/timerWorker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, remainingSeconds } = e.data;

        if (type === 'TICK') {
          setSecondsLeft(remainingSeconds);

          // 5초 전 경고음 (단 1회)
          if (remainingSeconds === 5 && !hasWarnedRef.current) {
            hasWarnedRef.current = true;
            if (!isMuted) {
              playWarningBeep();
            }
          }
        } else if (type === 'COMPLETED') {
          if (!isMuted) {
            playEndBeep();
          }
          onCompleteRef.current();
        }
      };

      if (autoStart) {
        worker.postMessage({ action: 'START', duration });
      }

      return () => {
        worker.postMessage({ action: 'STOP' });
        worker.terminate();
        workerRef.current = null;
      };
    } catch (err) {
      console.warn('Web Worker fallback:', err);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            if (!isMuted) {
              playEndBeep();
            }
            onCompleteRef.current();
            return 0;
          }
          if (prev === 6 && !hasWarnedRef.current) {
            hasWarnedRef.current = true;
            if (!isMuted) {
              playWarningBeep();
            }
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [duration, phase, autoStart, isMuted]);

  const progress = duration > 0 ? ((duration - secondsLeft) / duration) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progress) / 100;

  const isPrep = phase === 'PREPARATION';
  const strokeColor = isPrep ? '#080909' : secondsLeft <= 5 ? '#ba1a1a' : '#0050d7';

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-surface-container"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={strokeColor}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-boro-muted">
            {isPrep ? 'Prep' : 'Speaking'}
          </span>
          <span
            className={`text-3xl sm:text-4xl font-semibold tracking-tighter ${
              secondsLeft <= 5 && !isPrep ? 'text-boro-red animate-pulse' : 'text-boro-text'
            }`}
          >
            {Math.floor(secondsLeft / 60)}:
            {(secondsLeft % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-boro-muted2 font-medium">
            / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* 비프음 사운드 토글 버튼 */}
      <button
        type="button"
        onClick={() => setIsMuted((prev) => !prev)}
        className="flex items-center gap-1 text-[11px] font-medium text-boro-muted hover:text-boro-text transition-colors py-0.5 px-2 rounded-full hover:bg-surface-container"
        title={isMuted ? 'Sound Unmuted' : 'Sound Muted'}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-3.5 h-3.5 text-boro-red stroke-[1.5]" />
            <span>Muted</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>Beep On</span>
          </>
        )}
      </button>
    </div>
  );
};
