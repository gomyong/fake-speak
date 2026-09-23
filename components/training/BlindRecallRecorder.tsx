'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mic, Square, CheckCircle2, RotateCcw, Sparkles, Volume2 } from 'lucide-react';
import { TrainingSentence } from '@/lib/constants/curriculum';
import { useAudioRecorder, AudioRecordingResult } from '@/lib/audio/useAudioRecorder';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';

interface BlindRecallRecorderProps {
  sentence: TrainingSentence;
  questionText: string;
  onSuccess?: () => void;
}

type BlindMode = 'FULL_BLIND' | 'CLOZE_BLIND' | 'SHOW';

export const BlindRecallRecorder: React.FC<BlindRecallRecorderProps> = ({
  sentence,
  questionText,
  onSuccess,
}) => {
  const [blindMode, setBlindMode] = useState<BlindMode>('FULL_BLIND');
  const [hasRecorded, setHasRecorded] = useState<boolean>(false);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { isRecording, startRecording, stopRecording, resetRecording, recordedAudio } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const handleStartRecording = () => {
    resetRecording();
    resetTranscript();
    setHasRecorded(false);
    setFeedback(null);
    startRecording();
    startListening();
  };

  const handleStopRecording = async () => {
    stopListening();
    try {
      await stopRecording();
      setHasRecorded(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {}
  };

  // AI 피드백 요청
  const handleRequestFeedback = async () => {
    if (!transcript.trim()) return;
    setEvaluating(true);

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: 'IELTS',
          partOrQuestion: 'BLIND_RECALL',
          questionText: `[Target Model Answer]: ${sentence.fullText}\n[Candidate Blind Recall]: ${transcript}`,
          transcript: transcript,
          durationSeconds: recordedAudio?.durationSeconds || 15,
        }),
      });
      const data = await res.json();
      setFeedback(data.suggested_next_focus || 'Great attempt! Work on connecting the clauses smoothly.');
    } catch (err) {
      console.warn('Feedback request failed:', err);
      setFeedback('피드백을 생성하는 중 일시적인 오류가 발생했습니다.');
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-5">
      {/* 상단 모드 전환 & 배지 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-surface-container text-boro-text">
            Step 3: Blind Recall (가림막 훈련)
          </span>
          <span className="text-xs text-boro-muted font-medium">
            스크립트 없이 기억에만 의존하여 말해보세요
          </span>
        </div>

        {/* 가림막 모드 토글 */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-full text-xs">
          <button
            onClick={() => setBlindMode('FULL_BLIND')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              blindMode === 'FULL_BLIND' ? 'bg-boro-black text-white' : 'text-boro-muted hover:text-boro-text'
            }`}
          >
            <EyeOff className="w-3 h-3 inline mr-1" />
            완전 가리기
          </button>
          <button
            onClick={() => setBlindMode('CLOZE_BLIND')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              blindMode === 'CLOZE_BLIND' ? 'bg-boro-black text-white' : 'text-boro-muted hover:text-boro-text'
            }`}
          >
            빈칸 힌트
          </button>
          <button
            onClick={() => setBlindMode('SHOW')}
            className={`px-3 py-1 rounded-full font-medium transition-colors ${
              blindMode === 'SHOW' ? 'bg-boro-black text-white' : 'text-boro-muted hover:text-boro-text'
            }`}
          >
            <Eye className="w-3 h-3 inline mr-1" />
            답변 보기
          </button>
        </div>
      </div>

      {/* 스크립트 가림막 영역 */}
      <div className="p-5 rounded-card bg-surface-container/60 space-y-3 relative overflow-hidden">
        {blindMode === 'FULL_BLIND' && (
          <div className="py-4 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-boro-muted text-xs font-medium border border-boro-border">
              <EyeOff className="w-3.5 h-3.5" />
              <span>스크립트가 가려져 있습니다</span>
            </div>
            <p className="text-sm text-boro-text font-medium">
              "{sentence.fullKo}"
            </p>
          </div>
        )}

        {blindMode === 'CLOZE_BLIND' && (
          <div className="space-y-2">
            <p className="text-base sm:text-lg leading-relaxed font-medium text-boro-text">
              {sentence.chunks.map((chunk, i) => (
                <span key={i} className="inline-block mr-2">
                  {chunk.isKeyChunk ? (
                    <span className="px-2 py-0.5 rounded bg-boro-blue-soft/60 text-boro-blue font-mono text-sm border border-boro-blue/30">
                      [ {chunk.ko} ]
                    </span>
                  ) : (
                    chunk.text
                  )}
                </span>
              ))}
            </p>
            <p className="text-xs text-boro-muted2">
              파란색 빈칸의 의미를 영어 청크로 회상하여 전체 문장을 발화하세요.
            </p>
          </div>
        )}

        {blindMode === 'SHOW' && (
          <div className="space-y-2">
            <p className="text-base sm:text-lg leading-relaxed font-medium text-boro-text">
              {sentence.fullText}
            </p>
            <p className="text-xs text-boro-muted">{sentence.fullKo}</p>
          </div>
        )}
      </div>

      {/* 녹음 중 프리뷰 */}
      {isRecording && (
        <div className="p-4 rounded-card bg-white border border-boro-border text-center space-y-1 animate-pulse">
          <span className="text-[11px] font-semibold text-boro-red uppercase tracking-wider">
            Blind Speaking in Progress...
          </span>
          <p className="text-xs text-boro-text italic">
            {transcript || interimTranscript || '기억나는 대로 소리 내어 말하세요...'}
          </p>
        </div>
      )}

      {/* 녹음 후 결과 대조 영역 */}
      {hasRecorded && !isRecording && (
        <div className="boro-card p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-text flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
              내 블라인드 발화 결과
            </span>
            {recordedAudio?.url && (
              <audio src={recordedAudio.url} controls className="h-7 w-40" />
            )}
          </div>

          <p className="text-xs sm:text-sm text-boro-text bg-surface-container p-3 rounded-card">
            "{transcript.trim() || '발화가 명확히 감지되지 않았습니다.'}"
          </p>

          <div className="text-xs text-boro-muted border-t border-boro-border/60 pt-2 space-y-1">
            <span className="font-semibold text-boro-text">[원문 정답]:</span>
            <p className="text-boro-muted leading-relaxed">{sentence.fullText}</p>
          </div>

          {/* AI 피드백 버튼 및 결과 */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <button
              onClick={handleRequestFeedback}
              disabled={evaluating || !transcript.trim()}
              className="boro-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-boro-blue" />
              <span>{evaluating ? 'Analyzing...' : 'AI 일치도 & 피드백 받기'}</span>
            </button>

            {feedback && (
              <p className="text-xs text-boro-blue font-medium bg-boro-blue-soft px-3 py-1.5 rounded-full">
                💡 {feedback}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 녹음 컨트롤러 */}
      <div className="flex items-center justify-between pt-1">
        {!isRecording ? (
          <button
            onClick={handleStartRecording}
            className="boro-btn-primary px-6 py-3 text-xs flex items-center gap-2"
          >
            <Mic className="w-4 h-4 stroke-[2]" />
            <span>{hasRecorded ? 'Try Blind Speaking Again' : 'Start Blind Speaking'}</span>
          </button>
        ) : (
          <button
            onClick={handleStopRecording}
            className="px-6 py-3 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-2 active:scale-98 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Done Speaking</span>
          </button>
        )}
      </div>
    </div>
  );
};
