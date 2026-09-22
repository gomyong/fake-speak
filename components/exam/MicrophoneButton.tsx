'use client';

import React from 'react';
import { Mic, Square } from 'lucide-react';

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
          <div className="absolute w-24 h-24 rounded-full bg-boro-red-soft boro-recording-pulse" />
        )}

        <button
          onClick={onToggle}
          disabled={disabled}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 active:scale-[0.98] ${
            disabled
              ? 'bg-surface-dim text-boro-muted2 cursor-not-allowed border border-boro-border'
              : isRecording
              ? 'bg-boro-red text-white'
              : 'bg-boro-black text-white hover:bg-boro-text'
          }`}
          aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? (
            <Square className="w-6 h-6 fill-current" />
          ) : (
            <Mic className="w-7 h-7 stroke-[1.75]" />
          )}
        </button>
      </div>

      {statusText && (
        <span
          className={`text-xs font-medium tracking-tight transition-colors ${
            isRecording ? 'text-boro-red animate-pulse' : 'text-boro-muted'
          }`}
        >
          {statusText}
        </span>
      )}
    </div>
  );
};
