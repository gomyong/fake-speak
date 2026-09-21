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
import { Zap, HelpCircle, Image as ImageIcon, FileText, CheckCircle } from 'lucide-react';

interface ToeicQuestionSpec {
  index: number;
  partKey: string;
  title: string;
  typeDesc: string;
  prepSec: number;
  respSec: number;
  samplePrompt: string;
}

const TOEIC_QUESTIONS_SPEC: ToeicQuestionSpec[] = [
  {
    index: 1,
    partKey: 'TOEIC_Q1',
    title: 'Question 1: Read a Text Aloud',
    typeDesc: 'Read the provided announcement clearly with accurate pronunciation and intonation.',
    prepSec: 45,
    respSec: 45,
    samplePrompt:
      'Welcome to the annual Global Tech Expo! Please proceed to Hall B for the keynote presentation on renewable energy breakthroughs. Remember to keep your badges visible at all times, and visit the informational kiosk if you require translation headsets.',
  },
  {
    index: 2,
    partKey: 'TOEIC_Q2',
    title: 'Question 2: Read a Text Aloud',
    typeDesc: 'Read the provided broadcast clearly with appropriate pauses and phrasing.',
    prepSec: 45,
    respSec: 45,
    samplePrompt:
      'Attention all passengers traveling on Metro Line 4. Due to scheduled track maintenance between Central Station and University Park, shuttle buses will operate every ten minutes. We apologize for the inconvenience and appreciate your cooperation.',
  },
  {
    index: 3,
    partKey: 'TOEIC_Q3',
    title: 'Question 3: Describe a Picture',
    typeDesc: 'Describe the scene in as much detail as possible, focusing on actions, location, and objects.',
    prepSec: 45,
    respSec: 30,
    samplePrompt:
      '[Photo Scene]: An open-concept modern office where two professionals in business casual attire are reviewing architectural blueprints on a wooden conference table, while sunlight streams through floor-to-ceiling windows.',
  },
  {
    index: 4,
    partKey: 'TOEIC_Q4',
    title: 'Question 4: Describe a Picture',
    typeDesc: 'Describe the outdoor community setting, highlighting foreground and background activities.',
    prepSec: 45,
    respSec: 30,
    samplePrompt:
      '[Photo Scene]: A vibrant weekend farmer’s market where customers are inspecting organic produce under striped canopies, with a barista preparing coffee in a mobile cart in the background.',
  },
  {
    index: 5,
    partKey: 'TOEIC_Q5',
    title: 'Question 5: Respond to Questions',
    typeDesc: 'Imagine you are participating in a consumer research interview about online shopping habits.',
    prepSec: 3,
    respSec: 15,
    samplePrompt: 'How often do you purchase groceries online, and what is the primary benefit?',
  },
  {
    index: 6,
    partKey: 'TOEIC_Q6',
    title: 'Question 6: Respond to Questions',
    typeDesc: 'Continue answering the consumer research interview.',
    prepSec: 3,
    respSec: 15,
    samplePrompt: 'When was the last time you returned a product bought on the internet, and why?',
  },
  {
    index: 7,
    partKey: 'TOEIC_Q7',
    title: 'Question 7: Respond to Questions',
    typeDesc: 'Provide a detailed response with specific reasons.',
    prepSec: 3,
    respSec: 30,
    samplePrompt:
      'Would you recommend shopping exclusively through subscription services rather than individual purchases? Why or why not?',
  },
  {
    index: 8,
    partKey: 'TOEIC_Q8',
    title: 'Question 8: Respond Using Information Provided',
    typeDesc: 'Refer to the conference schedule provided on screen to answer the caller’s inquiry.',
    prepSec: 45,
    respSec: 15,
    samplePrompt:
      '[Schedule Context]: Annual Medical Symposium. 09:00 AM Registration, 10:00 AM Keynote by Dr. Evans in Room 101.\nQuestion: What time does the registration begin, and who is delivering the keynote address?',
  },
  {
    index: 9,
    partKey: 'TOEIC_Q9',
    title: 'Question 9: Respond Using Information Provided',
    typeDesc: 'Verify details against the conference schedule.',
    prepSec: 3,
    respSec: 15,
    samplePrompt:
      'I heard the afternoon workshops have been cancelled due to weather. Is that true?',
  },
  {
    index: 10,
    partKey: 'TOEIC_Q10',
    title: 'Question 10: Respond Using Information Provided',
    typeDesc: 'Summarize the relevant sessions from the agenda.',
    prepSec: 3,
    respSec: 30,
    samplePrompt:
      'Could you provide me with all the details regarding the pediatric medicine sessions scheduled for the afternoon?',
  },
  {
    index: 11,
    partKey: 'TOEIC_Q11',
    title: 'Question 11: Express an Opinion',
    typeDesc: 'State your opinion clearly and support it with at least two distinct reasons or examples.',
    prepSec: 45,
    respSec: 60,
    samplePrompt:
      'Do you agree or disagree with the statement: "Companies should encourage all employees to work remotely at least three days per week"? Provide specific reasons to support your point of view.',
  },
];

type ToeicExamState = 'IDLE' | 'PREPARATION' | 'SPEAKING' | 'EVALUATING' | 'RESULT';

export default function ToeicExamPage() {
  const router = useRouter();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [examState, setExamState] = useState<ToeicExamState>('IDLE');
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [sessionUuid, setSessionUuid] = useState<string>('');

  const currentSpec = TOEIC_QUESTIONS_SPEC[currentQuestionIdx];

  const { isRecording, recordingDuration, startRecording, stopRecording, resetRecording } =
    useAudioRecorder();
  const {
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // 시험 시작
  const handleStartExam = async () => {
    await unlockAudioContext();
    startQuestion(0);
  };

  const startQuestion = (idx: number) => {
    setCurrentQuestionIdx(idx);
    resetRecording();
    resetTranscript();
    setEvaluation(null);

    const newUuid = `toeic_q${idx + 1}_${Date.now()}`;
    setSessionUuid(newUuid);

    const spec = TOEIC_QUESTIONS_SPEC[idx];
    if (spec.prepSec > 0) {
      setExamState('PREPARATION');
    } else {
      setExamState('SPEAKING');
    }
  };

  // 준비 시간 종료 -> 발화 전환
  const handlePrepComplete = () => {
    playTransitionChime();
    setExamState('SPEAKING');
  };

  // 발화 시작 시 녹음 및 STT
  useEffect(() => {
    if (examState === 'SPEAKING') {
      startRecording();
      startListening();
    }
  }, [examState, startRecording, startListening]);

  // 발화 종료
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

    // IndexedDB 로컬 오디오 Blob 저장
    let audioKey = '';
    if (recorded?.blob) {
      try {
        const recordId = await saveAudioRecord(
          sessionUuid,
          currentSpec.partKey,
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
      const finalTranscript = transcript.trim() || 'No clear utterance recorded';
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType: 'TOEIC',
          partOrQuestion: currentSpec.partKey,
          questionText: currentSpec.samplePrompt,
          transcript: finalTranscript,
          durationSeconds: recorded?.durationSeconds || currentSpec.respSec,
        }),
      });

      const evalData: EvaluationResult = await evalRes.json();
      setEvaluation(evalData);

      // 로컬 평가 저장
      await saveLocalEvaluation({
        session_uuid: sessionUuid,
        exam_type: 'TOEIC',
        part_or_question: currentSpec.partKey,
        question_text: currentSpec.samplePrompt,
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
      console.error('Evaluation error:', err);
      setExamState('RESULT');
    }
  };

  // 다음 문항 진행
  const handleNextQuestion = () => {
    if (currentQuestionIdx < TOEIC_QUESTIONS_SPEC.length - 1) {
      startQuestion(currentQuestionIdx + 1);
    } else {
      router.push(`/report/${sessionUuid}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <ExamHeader
        examType="TOEIC"
        sectionTitle={currentSpec.title}
        stageName={`Q${currentSpec.index} / 11`}
        onExit={() => router.push('/')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col justify-center items-center">
        {/* 시작 전 화면 */}
        {examState === 'IDLE' && (
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center mx-auto text-violet-400 shadow-xl shadow-violet-600/10">
              <Zap className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                TOEIC Speaking Simulation
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                실제 토익스피킹 11개 전 문항을 시험 규격 타이머와 표준 비프음으로 시뮬레이션합니다.
              </p>
            </div>

            <button
              onClick={handleStartExam}
              className="w-full py-4 px-6 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Start TOEIC Simulation (Q1 - Q11)
            </button>
          </div>
        )}

        {/* 준비 (Preparation) 단계 */}
        {examState === 'PREPARATION' && (
          <div className="w-full space-y-6 flex flex-col items-center">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 text-center space-y-4 w-full max-w-2xl">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentSpec.title} • Preparation Time
              </span>
              <p className="text-xs text-slate-400">{currentSpec.typeDesc}</p>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line text-left font-medium">
                {currentSpec.samplePrompt}
              </div>
            </div>

            <ExamTimer
              duration={currentSpec.prepSec}
              phase="PREPARATION"
              onComplete={handlePrepComplete}
            />

            <button
              onClick={handlePrepComplete}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              Skip Prep & Start Speaking Now
            </button>
          </div>
        )}

        {/* 발화 (Speaking) 단계 */}
        {examState === 'SPEAKING' && (
          <div className="w-full space-y-8 flex flex-col items-center">
            <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 text-center space-y-4 w-full max-w-2xl">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">
                {currentSpec.title} • Response Time
              </span>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-200 leading-relaxed whitespace-pre-line text-left font-medium">
                {currentSpec.samplePrompt}
              </div>
            </div>

            <ExamTimer
              duration={currentSpec.respSec}
              phase="SPEAKING"
              onComplete={handleFinishSpeaking}
            />

            <MicrophoneButton
              isRecording={isRecording}
              onToggle={handleFinishSpeaking}
              statusText={isRecording ? 'Speaking... Tap to Finish Early' : 'Initializing...'}
            />

            <div className="w-full max-w-xl glass-card p-4 rounded-xl border border-slate-800/80 text-center min-h-[60px] flex items-center justify-center">
              <p className="text-xs text-slate-300 italic">
                {transcript || interimTranscript || 'Speak clearly into your microphone...'}
              </p>
            </div>
          </div>
        )}

        {/* 채점 중 상태 */}
        {examState === 'EVALUATING' && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
            <h3 className="text-base font-bold text-white">Scoring Question {currentSpec.index}...</h3>
          </div>
        )}

        {/* 채점 결과 */}
        {examState === 'RESULT' && evaluation && (
          <div className="w-full space-y-6">
            <AudioReviewPlayer sessionUuid={sessionUuid} />

            <EvaluationReport
              evaluation={evaluation}
              questionText={currentSpec.samplePrompt}
              transcript={transcript}
              onNext={handleNextQuestion}
              nextLabel={
                currentQuestionIdx < TOEIC_QUESTIONS_SPEC.length - 1
                  ? `Proceed to Question ${currentQuestionIdx + 2}`
                  : 'Complete TOEIC Exam'
              }
            />
          </div>
        )}
      </main>
    </div>
  );
}
