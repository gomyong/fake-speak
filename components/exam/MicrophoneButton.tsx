'use client';

import React from 'react';
import { Mic, MicOff, Square } from 'lucide-react';

interface MicrophoneButtonProps {
  isRecording: boolean;
  onToggle?: () => void;
  disabled?: boolean;
  statusText?: string;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  isRecording,
  onToggle,
  disabled = false,
  statusText,
}) => {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {isRecording && (
          <div className="absolute w-28 h-28 rounded-full bg-indigo-500/30 recording-pulse" />
        )}

        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
            disabled
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-500/30 scale-105'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white ring-4 ring-indigo-500/30 hover:scale-105 active:scale-95'
          }`}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </button>
      </div>

      {statusText && (
        <span
          className={`text-xs font-semibold tracking-wide transition-colors ${
            isRecording ? 'text-rose-400 animate-pulse' : 'text-slate-400'
          }`}
        >
          {statusText}
        </span>
      )}
    </div>
  );
};
