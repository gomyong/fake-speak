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

    // Web Worker 초기화 (백그라운드 스로틀링 방지)
    try {
      const worker = new Worker('/workers/timerWorker.js');
      workerRef.current = worker;

      worker.onmessage = (e) => {
        const { type, remainingSeconds } = e.data;

        if (type === 'TICK') {
          setSecondsLeft(remainingSeconds);

          // 5초 전 경고음
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
      console.warn('Web Worker initialization fallback to setInterval:', err);
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
  const strokeColor = isPrep ? '#f59e0b' : secondsLeft <= 5 ? '#ef4444' : '#6366f1';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* SVG 원형 카운트다운 */}
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            className="stroke-slate-800"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={strokeColor}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray="283"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
            {isPrep ? 'Prep Time' : 'Speaking'}
          </span>
          <span
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              secondsLeft <= 5 && !isPrep ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}
          >
            {Math.floor(secondsLeft / 60)}:
            {(secondsLeft % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            / {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
};
