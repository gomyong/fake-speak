'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { ExamTimer } from '@/components/exam/ExamTimer';
import { MicrophoneButton } from '@/components/exam/MicrophoneButton';
import { EvaluationReport } from '@/components/feedback/EvaluationReport';
import { AudioReviewPlayer } from '@/components/feedback/AudioReviewPlayer';
import { useAudioRecorder, AudioRecordingResult } from '@/lib/audio/useAudioRecorder';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import { unlockAudioContext, playTransitionChime } from '@/lib/audio/soundEffects';
import { saveAudioRecord, saveLocalEvaluation } from '@/lib/db/localAudioStore';
import { CuratedQuestion } from '@/lib/ai/curator';
import { EvaluationResult } from '@/lib/ai/evaluator';
import { Sparkles, MessageSquare, FileText } from 'lucide-react';

type IeltsPart = 'IELTS_PART_1' | 'IELTS_PART_2' | 'IELTS_PART_3';
type ExamState = 'IDLE' | 'LOADING_QUESTION' | 'PREPARATION' | 'SPEAKING' | 'EVALUATING' | 'RESULT';

export default function IeltsExamPage() {
  const router = useRouter();
  const [currentPart, setCurrentPart] = useState<IeltsPart>('IELTS_PART_1');
  const [examState, setExamState] = useState<ExamState>('IDLE');
  const [question, setQuestion] = useState<CuratedQuestion | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionUuid, setSessionUuid] = useState<string>('');
  const [prepNotes, setPrepNotes] = useState<string>(''); // Part 2 메모장

  const { isRecording, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const {
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // 질문 로드
  const fetchNextQuestion = async (part: IeltsPart) => {
    setExamState('LOADING_QUESTION');
    resetRecording();
    resetTranscript();
    setPrepNotes('');
    setEvaluation(null);

    const newUuid = `ielts_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    setSessionUuid(newUuid);

    try {
      const res = await fetch('/api/curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: 'IELTS',
          partOrQuestion: part,
          currentBandEstimate: 6.5,
        }),
      });
      const data: CuratedQuestion = await res.json();
      setQuestion(data);

      if (part === 'IELTS_PART_2' && data.preparationSeconds > 0) {
        setExamState('PREPARATION');
      } else {
        setExamState('SPEAKING');
      }
    } catch (err) {
      console.error('Failed to load question:', err);
      setExamState('IDLE');
    }
  };

  // 시험 시작 핸들러
  const handleStartExam = async () => {
    await unlockAudioContext();
    fetchNextQuestion('IELTS_PART_1');
  };

  // 준비 시간 종료 -> 발화 시간으로 전환
  const handlePrepComplete = async () => {
    playTransitionChime();
    setExamState('SPEAKING');
  };

  // 발화 단계 진입 시 녹음 및 STT 자동 시작
  useEffect(() => {
    if (examState === 'SPEAKING') {
      startRecording();
      startListening();
    }
  }, [examState, startRecording, startListening]);

  // 발화 완료 (타이머 만료 또는 수동 정지)
  const handleFinishSpeaking = async () => {
    if (examState !== 'SPEAKING') return;

    setExamState('EVALUATING');
    stopListening();

    let recorded: AudioRecordingResult | null = null;
    try {
      recorded = await stopRecording();
    } catch (err) {
      console.warn('Stop recording failed:', err);
    }

    let audioKey = '';
    if (recorded?.blob && question) {
      try {
        const recordId = await saveAudioRecord(
          sessionUuid,
          question.questionId,
          recorded.blob,
          recorded.durationSeconds,
          recorded.mimeType
        );
        audioKey = `local_audio_${recordId}`;
      } catch (err) {
        console.error('Failed to save audio to IndexedDB:', err);
      }
    }

    // 채점 API 호출 (빈 발화 시 0.0점 처리되도록 전달)
    try {
      const finalTranscript = transcript.trim();
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: 'IELTS',
          partOrQuestion: currentPart,
          questionText: question?.questionText || '',
          transcript: finalTranscript,
          durationSeconds: recorded?.durationSeconds || 45,
        }),
      });

      const evalData: EvaluationResult = await evalRes.json();
      setEvaluation(evalData);

      await saveLocalEvaluation({
        session_uuid: sessionUuid,
        exam_type: 'IELTS',
        part_or_question: currentPart,
        question_text: question?.questionText || '',
        transcript: finalTranscript,
        overall_band: evalData.scores.overall_band,
        scores_json: evalData.scores,
        weaknesses: evalData.critical_weaknesses,
        lexical_enhancements: evalData.lexical_enhancements,
        model_answer: evalData.model_answer_band_8_5,
        audio_storage_key: audioKey,
        created_at: new Date(),
      });

      setExamState('RESULT');
    } catch (err) {
      console.error('Failed to evaluate session:', err);
      setExamState('RESULT');
    }
  };

  // 다음 파트 진행
  const handleProceedNextPart = () => {
    if (currentPart === 'IELTS_PART_1') {
      setCurrentPart('IELTS_PART_2');
      fetchNextQuestion('IELTS_PART_2');
    } else if (currentPart === 'IELTS_PART_2') {
      setCurrentPart('IELTS_PART_3');
      fetchNextQuestion('IELTS_PART_3');
    } else {
      router.push(`/report/${sessionUuid}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-boro-text">
      <ExamHeader
        examType="IELTS"
        sectionTitle={
          currentPart === 'IELTS_PART_1'
            ? 'Part 1: Interview'
            : currentPart === 'IELTS_PART_2'
            ? 'Part 2: Long Turn (Cue Card)'
            : 'Part 3: Discussion'
        }
        stageName={examState}
        onExit={() => router.push('/')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        {/* 대기 상태 (Start Exam) */}
        {examState === 'IDLE' && (
          <div className="boro-card p-8 sm:p-10 text-center space-y-6 max-w-md w-full">
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto text-boro-text">
              <MessageSquare className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-boro-text">
                IELTS Speaking
              </h2>
              <p className="text-xs sm:text-sm text-boro-muted leading-relaxed">
                공식 시험관 인터뷰 시뮬레이션입니다. Part 1 질의응답, Part 2 큐카드(1분 준비 / 2분 발화), Part 3 심층 토론이 순서대로 진행됩니다.
              </p>
            </div>

            <button
              onClick={handleStartExam}
              className="boro-btn-primary w-full py-3.5 px-6 text-sm"
            >
              Start Official Session
            </button>
          </div>
        )}

        {/* 질문 로딩 중 */}
        {examState === 'LOADING_QUESTION' && (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-boro-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-boro-muted">Curating adaptive agenda...</p>
          </div>
        )}

        {/* Part 2: 1분 준비 (Preparation) 단계 */}
        {examState === 'PREPARATION' && question && (
          <div className="w-full space-y-6">
            <div className="boro-card p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left flex-1">
                <span className="boro-chip">
                  Part 2 Cue Card • Preparation Time
                </span>
                <h3 className="text-lg sm:text-xl font-semibold text-boro-text">
                  "{question.questionText}"
                </h3>
                {question.cueCardPoints && (
                  <ul className="text-xs text-boro-muted space-y-1 pt-2 list-disc list-inside">
                    {question.cueCardPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="shrink-0">
                <ExamTimer
                  duration={question.preparationSeconds || 60}
                  phase="PREPARATION"
                  onComplete={handlePrepComplete}
                />
              </div>
            </div>

            {/* 실시간 메모장 */}
            <div className="boro-card p-5 space-y-2">
              <span className="text-xs font-semibold text-boro-muted uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 stroke-[1.5]" />
                Candidate Notepad (1-minute scratchpad)
              </span>
              <textarea
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                placeholder="Jot down keywords, bullet points, and high-level vocabulary for your 2-minute turn..."
                className="w-full h-28 bg-surface-container text-boro-text text-xs p-3 rounded-card border border-boro-border focus:outline-none focus:border-boro-text resize-none font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePrepComplete}
                className="boro-btn-secondary px-5 py-2.5 text-xs"
              >
                Skip Preparation & Start Speaking
              </button>
            </div>
          </div>
        )}

        {/* 발화 (Speaking) 단계 */}
        {examState === 'SPEAKING' && question && (
          <div className="w-full space-y-8 flex flex-col items-center">
            {/* 질문 카드 */}
            <div className="boro-card p-6 sm:p-8 text-center space-y-3 w-full max-w-2xl">
              <span className="boro-chip">
                {question.domainName} • Level {question.cognitiveLevel}
              </span>

              <h2 className="text-xl sm:text-2xl font-semibold text-boro-text leading-snug">
                "{question.questionText}"
              </h2>

              {question.syntacticGapPrompt && (
                <p className="text-xs text-boro-muted bg-surface-container px-3 py-1.5 rounded-full inline-block">
                  💡 Hint: {question.syntacticGapPrompt}
                </p>
              )}
            </div>

            {/* 타이머 및 마이크 */}
            <div className="flex flex-col items-center gap-6">
              <ExamTimer
                duration={question.responseSeconds || 45}
                phase="SPEAKING"
                onComplete={handleFinishSpeaking}
              />

              <MicrophoneButton
                isRecording={isRecording}
                onToggle={handleFinishSpeaking}
                statusText={isRecording ? 'Speaking... Tap to finish early' : 'Initializing...'}
              />
            </div>

            {/* 실시간 STT 프리뷰 */}
            <div className="w-full max-w-xl boro-panel p-4 text-center min-h-[56px] flex items-center justify-center">
              <p className="text-xs text-boro-muted italic">
                {transcript || interimTranscript || 'Start speaking clearly into your microphone...'}
              </p>
            </div>
          </div>
        )}

        {/* 채점 중 상태 */}
        {examState === 'EVALUATING' && (
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-boro-blue border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-boro-text">Examiner Evaluation in Progress</h3>
              <p className="text-xs text-boro-muted">
                Analyzing Fluency, Lexical Resource, Grammatical Accuracy, and Pronunciation...
              </p>
            </div>
          </div>
        )}

        {/* 채점 결과 (Result) */}
        {examState === 'RESULT' && evaluation && question && (
          <div className="w-full space-y-6">
            <AudioReviewPlayer sessionUuid={sessionUuid} />

            <EvaluationReport
              evaluation={evaluation}
              questionText={question.questionText}
              transcript={transcript}
              onNext={handleProceedNextPart}
              nextLabel={
                currentPart === 'IELTS_PART_1'
                  ? 'Proceed to Part 2 (Cue Card)'
                  : currentPart === 'IELTS_PART_2'
                  ? 'Proceed to Part 3 (Discussion)'
                  : 'View Final Summary'
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
