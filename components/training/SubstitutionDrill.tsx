'use client';

import React, { useState } from 'react';
import { RefreshCw, Mic, Square, CheckCircle2, Sparkles } from 'lucide-react';
import { TrainingSentence } from '@/lib/constants/curriculum';
import { useAudioRecorder } from '@/lib/audio/useAudioRecorder';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';

interface SubstitutionDrillProps {
  sentence: TrainingSentence;
}

export const SubstitutionDrill: React.FC<SubstitutionDrillProps> = ({ sentence }) => {
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const { isRecording, startRecording, stopRecording, resetRecording, recordedAudio } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const handleStartRecording = () => {
    resetRecording();
    resetTranscript();
    setHasRecorded(false);
    startRecording();
    startListening();
  };

  const handleStopRecording = async () => {
    stopListening();
    try {
      await stopRecording();
      setHasRecorded(true);
    } catch (e) {}
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-emerald-100 text-emerald-800">
            Step 4: Substitution Drill (나만의 표현 치환)
          </span>
          <span className="text-xs text-boro-muted font-medium">
            문장 뼈대는 유지하고 내 경험으로 바꿔 말해보세요
          </span>
        </div>
      </div>

      {/* 치환 가이드 힌트 */}
      {sentence.substitutionHint && (
        <div className="p-4 rounded-card bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>응용 훈련 가이드</span>
          </div>
          <p className="leading-relaxed">{sentence.substitutionHint}</p>
        </div>
      )}

      {/* 기본 문장 뼈대 */}
      <div className="p-4 rounded-card bg-surface-container/60 space-y-1">
        <span className="text-[10px] font-semibold text-boro-muted uppercase tracking-wider">
          기본 문장 뼈대
        </span>
        <p className="text-sm font-medium text-boro-text">{sentence.fullText}</p>
      </div>

      {/* 실시간 녹음 상태 */}
      {isRecording && (
        <div className="p-4 rounded-card bg-white border border-boro-border text-center space-y-1 animate-pulse">
          <span className="text-[11px] font-semibold text-boro-red uppercase tracking-wider">
            Recording Custom Utterance...
          </span>
          <p className="text-xs text-boro-text italic">
            {transcript || interimTranscript || '바꾼 문장으로 자유롭게 말해보세요...'}
          </p>
        </div>
      )}

      {/* 녹음 결과 */}
      {hasRecorded && !isRecording && (
        <div className="boro-card p-4 space-y-2 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-text flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
              내가 치환해 말한 문장
            </span>
            {recordedAudio?.url && (
              <audio src={recordedAudio.url} controls className="h-7 w-40" />
            )}
          </div>
          <p className="text-xs sm:text-sm text-boro-text bg-surface-container p-3 rounded-card">
            "{transcript.trim() || '음성이 명확히 감지되지 않았습니다.'}"
          </p>
        </div>
      )}

      {/* 컨트롤 버튼 */}
      <div className="flex justify-end pt-1">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="boro-btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
          >
            <Mic className="w-4 h-4 stroke-[2]" />
            <span>{hasRecorded ? 'Try Custom Drill Again' : 'Record My Variation'}</span>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="px-5 py-2.5 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-2 active:scale-98 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Finish Speaking</span>
          </button>
        )}
      </div>
    </div>
  );
};
