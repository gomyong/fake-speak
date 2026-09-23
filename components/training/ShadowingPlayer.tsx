'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Square, Play, Pause, RefreshCw, Award, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { TrainingSentence } from '@/lib/constants/curriculum';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';
import { useAudioRecorder, AudioRecordingResult } from '@/lib/audio/useAudioRecorder';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import { SpeechAnalyticsCard } from './SpeechAnalyticsCard';
import { addWeakChunk } from '@/lib/db/weakChunkStore';

interface ShadowingPlayerProps {
  sentence: TrainingSentence;
  examType?: 'IELTS' | 'TOEIC';
  sectionTitle?: string;
  onComplete?: (accuracy: number) => void;
}

export const ShadowingPlayer: React.FC<ShadowingPlayerProps> = ({
  sentence,
  examType = 'IELTS',
  sectionTitle = 'Speaking Lab',
  onComplete,
}) => {
  const { isPlaying: isTtsPlaying, speakText, stopSpeaking, playbackRate, setPlaybackRate } = useTextToSpeech();
  const { isRecording, startRecording, stopRecording, resetRecording, recordedAudio } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const [practiceCount, setPracticeCount] = useState<number>(0);
  const [accuracyScore, setAccuracyScore] = useState<number | null>(null);
  const [savedToSrs, setSavedToSrs] = useState<boolean>(false);

  // 원본 단어 목록
  const targetWords = sentence.fullText
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // 현재 인식된 단어 목록
  const spokenWords = (transcript + ' ' + interimTranscript)
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  // 일치율 계산
  const matchedCount = targetWords.filter((tw) => spokenWords.includes(tw)).length;
  const currentAccuracy =
    targetWords.length > 0 ? Math.round((matchedCount / targetWords.length) * 100) : 0;

  // 쉐도잉 시작 (TTS 재생 후 바로 마이크 활성화)
  const handleStartShadowing = async () => {
    resetRecording();
    resetTranscript();
    setAccuracyScore(null);
    setSavedToSrs(false);

    // 원어민 음성 재생 시작
    speakText(sentence.fullText);

    // 약간의 딜레이(0.4초) 후 녹음 및 STT 시작 (Shadowing)
    setTimeout(() => {
      startRecording();
      startListening();
    }, 400);
  };

  // 쉐도잉 완료
  const handleStopShadowing = async () => {
    stopSpeaking();
    stopListening();
    let result: AudioRecordingResult | null = null;
    try {
      result = await stopRecording();
    } catch (e) {}

    const finalAccuracy = currentAccuracy;
    setAccuracyScore(finalAccuracy);
    setPracticeCount((prev) => prev + 1);

    // 일치율 75% 미만인 경우, 핵심 청크들을 SRS 취약 청크 오답노트에 자동 등록
    if (finalAccuracy < 75 && sentence.chunks) {
      sentence.chunks
        .filter((c) => c.isKeyChunk)
        .forEach((keyChunk) => {
          addWeakChunk({
            chunkText: keyChunk.text,
            ko: keyChunk.ko,
            contextSentence: sentence.fullText,
            examType,
            sectionTitle,
            accuracy: finalAccuracy,
          });
        });
      setSavedToSrs(true);
    }

    if (onComplete) {
      onComplete(finalAccuracy);
    }
  };

  return (
    <div className="space-y-4">
      <div className="boro-card p-5 sm:p-6 space-y-5">
        {/* 상단 안내 & 통계 */}
        <div className="flex items-center justify-between border-b border-boro-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="boro-chip">
              Step 2: Guided Shadowing
            </span>
            <span className="text-xs text-boro-muted font-medium">
              원어민 소리를 듣고 0.5초 뒤 따라 말하세요
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-boro-muted">
              연습: <strong className="text-boro-text">{practiceCount}회</strong>
            </span>
            {accuracyScore !== null && (
              <span className={`boro-chip text-[11px] py-0.5 px-2 ${
                accuracyScore >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-boro-blue-soft text-boro-blue'
              }`}>
                일치율: {accuracyScore}%
              </span>
            )}
            {savedToSrs && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center gap-1">
                <BookmarkPlus className="w-3 h-3" />
                SRS 오답노트 등록됨
              </span>
            )}
          </div>
        </div>

        {/* 스크립트 텍스트 및 실시간 단어 일치 하이라이트 */}
        <div className="p-4 rounded-card bg-surface-container/70 space-y-3">
          <p className="text-base sm:text-lg font-medium leading-relaxed">
            {sentence.fullText.split(/\s+/).map((word, i) => {
              const clean = word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
              const isSpoken = spokenWords.includes(clean);

              return (
                <span
                  key={i}
                  className={`inline-block mr-1.5 transition-colors duration-150 ${
                    isSpoken
                      ? 'text-emerald-600 font-semibold'
                      : isRecording
                      ? 'text-boro-muted'
                      : 'text-boro-text'
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </p>

          <p className="text-xs text-boro-muted2">
            {sentence.fullKo}
          </p>
        </div>

        {/* 녹음 중 실시간 STT 프리뷰 */}
        {isRecording && (
          <div className="p-3 rounded-card bg-white border border-boro-border text-center">
            <p className="text-xs text-boro-muted italic">
              {transcript || interimTranscript || '음성을 듣고 따라 말하세요...'}
            </p>
          </div>
        )}

        {/* 하단 컨트롤러 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                onClick={handleStartShadowing}
                className="boro-btn-primary px-5 py-2.5 text-xs flex items-center gap-2"
              >
                <Mic className="w-4 h-4 stroke-[2]" />
                <span>Start Shadowing (Listen & Repeat)</span>
              </button>
            ) : (
              <button
                onClick={handleStopShadowing}
                className="px-5 py-2.5 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-2 active:scale-98 animate-pulse"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>Finish Speaking</span>
              </button>
            )}

            <button
              onClick={() => speakText(sentence.fullText)}
              disabled={isRecording}
              className="boro-btn-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Listen Only</span>
            </button>
          </div>

          {/* 내 녹음 다시 듣기 */}
          {recordedAudio?.url && !isRecording && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-boro-muted font-medium">내 발화:</span>
              <audio src={recordedAudio.url} controls className="h-8 w-44" />
            </div>
          )}
        </div>
      </div>

      {/* 녹음 완료 후 실시간 정량 스피킹 분석 대시보드 */}
      {accuracyScore !== null && transcript.trim().length > 0 && (
        <SpeechAnalyticsCard
          transcript={transcript}
          durationSeconds={recordedAudio?.durationSeconds || 5}
        />
      )}
    </div>
  );
};
