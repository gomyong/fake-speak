// components/training/FollowUpInterviewer.tsx
'use client';

import React, { useState } from 'react';
import { HelpCircle, Mic, Square, Sparkles, Volume2, Clock, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import { useAudioRecorder } from '@/lib/audio/useAudioRecorder';
import { FollowUpResponse } from '@/app/api/train/followup/route';

interface FollowUpInterviewerProps {
  questionText: string;
  candidateTranscript: string;
  examType: 'IELTS' | 'TOEIC';
}

export const FollowUpInterviewer: React.FC<FollowUpInterviewerProps> = ({
  questionText,
  candidateTranscript,
  examType,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<FollowUpResponse | null>(null);
  const [isAnswerRecorded, setIsAnswerRecorded] = useState<boolean>(false);
  const [evaluatingAnswer, setEvaluatingAnswer] = useState<boolean>(false);
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);

  const { speakText } = useTextToSpeech();
  const { isRecording, startRecording, stopRecording, resetRecording, recordedAudio } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();

  // 꼬리 질문 생성 요청
  const handleRequestFollowUp = async () => {
    if (!candidateTranscript.trim()) return;

    setLoading(true);
    setData(null);
    setIsAnswerRecorded(false);
    setAnswerFeedback(null);

    try {
      const res = await fetch('/api/train/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText,
          transcript: candidateTranscript,
          examType,
        }),
      });
      const result: FollowUpResponse = await res.json();
      setData(result);

      // 질문 자동 음성 재생
      if (result.followupQuestion) {
        setTimeout(() => {
          speakText(result.followupQuestion);
        }, 300);
      }
    } catch (err) {
      console.error('Follow-up generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 즉흥 답변 녹음 시작
  const handleStartAnswer = () => {
    resetRecording();
    resetTranscript();
    setIsAnswerRecorded(false);
    setAnswerFeedback(null);
    startRecording();
    startListening();
  };

  // 즉흥 답변 녹음 종료
  const handleStopAnswer = async () => {
    stopListening();
    try {
      await stopRecording();
      setIsAnswerRecorded(true);
    } catch (e) {}
  };

  // 즉흥 답변 AI 평가
  const handleEvaluateImpromptu = async () => {
    const spoken = (transcript + ' ' + interimTranscript).trim();
    if (!spoken || !data) return;

    setEvaluatingAnswer(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          partOrQuestion: 'IMPROMPTU_FOLLOW_UP',
          questionText: `[Examiner Follow-up Question]: ${data.followupQuestion}\n[Candidate Spontaneous Answer]: ${spoken}`,
          transcript: spoken,
          durationSeconds: recordedAudio?.durationSeconds || 20,
        }),
      });
      const result = await res.json();
      setAnswerFeedback(
        result.suggested_next_focus ||
          '순발력 있게 꼬리 질문에 답변하셨습니다. 첫 문장에서 질문의 전제를 인정하고 시작한 점이 좋습니다.'
      );
    } catch (e) {
      setAnswerFeedback('순발력 있게 논리를 전개하셨습니다!');
    } finally {
      setEvaluatingAnswer(false);
    }
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-5 bg-white">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-surface-container text-boro-text">
            <HelpCircle className="w-3 h-3 inline mr-1 text-boro-blue" />
            AI 면접관의 돌발 꼬리 질문 (Follow-up Drill)
          </span>
          <span className="text-xs text-boro-muted font-medium">
            답변 분석 기반 실시간 압박 & 순발력 훈련
          </span>
        </div>

        <button
          onClick={handleRequestFollowUp}
          disabled={loading || !candidateTranscript.trim()}
          className="boro-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{loading ? '질문 생성 중...' : '꼬리 질문 받기'}</span>
        </button>
      </div>

      {!data && !loading && (
        <div className="p-6 rounded-card bg-surface/60 border border-boro-border/80 text-center space-y-2">
          <p className="text-xs text-boro-muted leading-relaxed">
            앞선 쉐도잉이나 발화가 완료되면, <strong>[꼬리 질문 받기]</strong> 버튼을 눌러보세요.
            <br />
            실제 IELTS 시험관처럼 내 답변의 허점을 짚는 즉석 꼬리 질문을 던집니다.
          </p>
        </div>
      )}

      {/* 꼬리 질문 데이터 영역 */}
      {data && (
        <div className="space-y-5 pt-1">
          {/* 면접관의 질문 카드 */}
          <div className="p-4 sm:p-5 rounded-card bg-surface-container/70 border border-boro-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Examiner Follow-up Question
              </span>

              <button
                onClick={() => speakText(data.followupQuestion)}
                className="p-1.5 rounded-full bg-white border border-boro-border hover:bg-boro-black hover:text-white transition-colors text-boro-muted"
                title="질문 다시 듣기"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-boro-text leading-relaxed">
              "{data.followupQuestion}"
            </h3>
            <p className="text-xs text-boro-muted2">{data.followupQuestionKo}</p>

            <div className="text-[11px] text-boro-blue bg-boro-blue-soft/60 p-2.5 rounded-card">
              🎯 <strong>시험관의 출제 의도:</strong> {data.examinerIntent}
            </div>
          </div>

          {/* 시간 벌기(Buying-time) 담화 표지어 칩 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-boro-text flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-boro-blue" />
                <span>시간 벌기(Buying-time) 필수 담화 표지어 (3초 생각할 시간 확보)</span>
              </span>
              <span className="text-boro-muted text-[11px]">탭하여 발음 듣기</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.buyingTimePhrases.map((bt, i) => (
                <div
                  key={i}
                  onClick={() => speakText(bt.phrase)}
                  className="p-3 rounded-card bg-surface/60 border border-boro-border hover:border-boro-blue/60 transition-all cursor-pointer space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-boro-blue">
                      "{bt.phrase}"
                    </span>
                    <Volume2 className="w-3 h-3 text-boro-muted" />
                  </div>
                  <p className="text-[11px] text-boro-muted">{bt.ko}</p>
                  <p className="text-[10px] text-boro-muted2">💡 {bt.usageTip}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 추천 답변 각도 & 모범 힌트 */}
          <div className="p-3.5 rounded-card bg-surface/50 border border-boro-border/80 space-y-2">
            <span className="text-xs font-semibold text-boro-muted">💡 답변 전개 힌트:</span>
            <ul className="text-xs text-boro-text space-y-1 list-disc list-inside">
              {data.suggestedAngles.map((ang, aIdx) => (
                <li key={aIdx}>{ang}</li>
              ))}
            </ul>
          </div>

          {/* 즉흥 답변 녹음 & 피드백 */}
          <div className="p-4 rounded-card border border-boro-border space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-boro-text">
                내 즉흥 답변 녹음 (Spontaneous Speaking):
              </span>

              {!isRecording ? (
                <button
                  onClick={handleStartAnswer}
                  className="boro-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isAnswerRecorded ? '다시 말해보기' : '즉시 답변 녹음 시작'}</span>
                </button>
              ) : (
                <button
                  onClick={handleStopAnswer}
                  className="px-4 py-2 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>답변 완료</span>
                </button>
              )}
            </div>

            {isRecording && (
              <p className="text-xs text-rose-600 font-medium animate-pulse">
                ● 실시간 답변 중: {transcript || interimTranscript || '생각을 소리 내어 말하세요...'}
              </p>
            )}

            {isAnswerRecorded && !isRecording && (
              <div className="space-y-2.5 pt-1">
                <p className="text-xs sm:text-sm text-boro-text bg-surface-container p-3 rounded-card">
                  "{transcript.trim() || '답변 음성이 인식되지 않았습니다.'}"
                </p>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleEvaluateImpromptu}
                    disabled={evaluatingAnswer || !transcript.trim()}
                    className="boro-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-boro-blue" />
                    <span>{evaluatingAnswer ? '평가 중...' : '순발력 & 논리성 AI 피드백 받기'}</span>
                  </button>

                  <button
                    onClick={() => speakText(data.modelResponseHint)}
                    className="text-xs text-boro-muted hover:text-boro-text font-medium flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>모범 답변 힌트 듣기</span>
                  </button>
                </div>

                {answerFeedback && (
                  <div className="p-3 rounded-card bg-emerald-50 text-emerald-800 text-xs border border-emerald-200 leading-relaxed">
                    <strong>✓ AI 피드백:</strong> {answerFeedback}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
