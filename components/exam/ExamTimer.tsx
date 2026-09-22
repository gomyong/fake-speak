'use client';

import React, { useEffect, useRef, useState } from 'react';
import { playStartBeep, playWarningBeep, playEndBeep } from '@/lib/audio/soundEffects';

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
  const workerRef = useRef<Worker | null>(null);
  const hasWarnedRef = useRef<boolean>(false);

  useEffect(() => {
    setSecondsLeft(duration);
    hasWarnedRef.current = false;

    if (phase === 'IDLE' || duration <= 0) return;

    try {
      const worker = new Worker('/workers/timerWorker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, remainingSeconds } = e.data;

        if (type === 'TICK') {
          setSecondsLeft(remainingSeconds);

          if (remainingSeconds === 5 && !hasWarnedRef.current) {
            hasWarnedRef.current = true;
            playWarningBeep();
          }
        } else if (type === 'COMPLETED') {
          playEndBeep();
          onComplete();
        }
      };

      if (autoStart) {
        if (phase === 'SPEAKING') {
          playStartBeep();
        }
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
            playEndBeep();
            onComplete();
            return 0;
          }
          if (prev === 6) {
            playWarningBeep();
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [duration, phase, onComplete, autoStart]);

  const progress = duration > 0 ? ((duration - secondsLeft) / duration) * 100 : 0;
  const strokeDashoffset = 283 - (283 * progress) / 100;

  const isPrep = phase === 'PREPARATION';
  const strokeColor = isPrep ? '#080909' : secondsLeft <= 5 ? '#ba1a1a' : '#0050d7';

  return (
    <div className="flex flex-col items-center justify-center">
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
    </div>
  );
};
