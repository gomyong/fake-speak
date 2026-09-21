'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Sparkles, MessageSquare, AlertTriangle, FileText, CheckCircle } from 'lucide-react';

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

  const { isRecording, recordingDuration, startRecording, stopRecording, resetRecording } =
    useAudioRecorder();
  const {
    transcript,
    interimTranscript,
    isListening,
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

      // Part 2는 60초 준비, Part 1 및 Part 3는 즉시 발화
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

    // 발화 오디오 Blob을 IndexedDB에 로컬 저장 (트래픽 $0)
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

    // 채점 API 호출
    try {
      const finalTranscript = transcript.trim() || 'No clear speech detected';
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

      // 로컬 평가 이력 저장
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
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
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
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 shadow-xl shadow-indigo-600/10">
              <MessageSquare className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                IELTS Speaking Simulation
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                공식 시험관 인터뷰 시뮬레이션입니다. Part 1 질의응답, Part 2 큐카드(1분 준비 / 2분 발화), Part 3 심층 토론이 순서대로 진행됩니다.
              </p>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Start Official Session
            </button>
          </div>
        )}

        {/* 질문 로딩 중 */}
        {examState === 'LOADING_QUESTION' && (
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-slate-400">Curating adaptive agenda...</p>
          </div>
        )}

        {/* Part 2: 1분 준비 (Preparation) 단계 */}
        {examState === 'PREPARATION' && question && (
          <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 glass-panel p-6 rounded-2xl border border-slate-800">
              <div className="space-y-2 text-center sm:text-left">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Part 2 Cue Card • Preparation Time (1 Minute)
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  "{question.questionText}"
                </h3>
                {question.cueCardPoints && (
                  <ul className="text-xs text-slate-300 space-y-1 pt-2 list-disc list-inside">
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
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Candidate Notepad (1-min Scratchpad)
              </span>
              <textarea
                value={prepNotes}
                onChange={(e) => setPrepNotes(e.target.value)}
                placeholder="Jot down keywords, bullet points, and high-level vocabulary for your 2-minute turn..."
                className="w-full h-28 bg-slate-950/60 text-slate-200 text-xs p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 resize-none font-mono"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePrepComplete}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                Skip Preparation & Start Speaking Now
              </button>
            </div>
          </div>
        )}

        {/* 발화 (Speaking) 단계 */}
        {examState === 'SPEAKING' && question && (
          <div className="w-full space-y-8 flex flex-col items-center">
            {/* 질문 카드 */}
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 text-center space-y-3 w-full max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{question.domainName} • Level {question.cognitiveLevel}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                "{question.questionText}"
              </h2>

              {question.syntacticGapPrompt && (
                <p className="text-xs text-amber-300/80 bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-800/40 inline-block">
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
                statusText={isRecording ? 'Listening... Tap to Finish Early' : 'Initializing...'}
              />
            </div>

            {/* 실시간 STT 프리뷰 */}
            <div className="w-full max-w-xl glass-card p-4 rounded-xl border border-slate-800/80 text-center min-h-[60px] flex items-center justify-center">
              <p className="text-xs text-slate-300 italic">
                {transcript || interimTranscript || 'Start speaking clearly into your microphone...'}
              </p>
            </div>
          </div>
        )}

        {/* 채점 중 상태 */}
        {examState === 'EVALUATING' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Examiner Evaluation in Progress</h3>
              <p className="text-xs text-slate-400">
                Analyzing Fluency, Lexical Resource, Grammatical Accuracy, and Pronunciation...
              </p>
            </div>
          </div>
        )}

        {/* 채점 결과 (Result) */}
        {examState === 'RESULT' && evaluation && question && (
          <div className="w-full space-y-6">
            {/* 로컬 오디오 복습 플레이어 */}
            <AudioReviewPlayer sessionUuid={sessionUuid} />

            {/* 평가 리포트 */}
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
