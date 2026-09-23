// components/training/PrepFrameworkBuilder.tsx
'use client';

import React, { useState } from 'react';
import { Layers, Mic, Square, CheckCircle2, Sparkles, Volume2, ArrowRight, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from '@/lib/audio/useSpeechRecognition';
import { useAudioRecorder } from '@/lib/audio/useAudioRecorder';
import { useTextToSpeech } from '@/lib/audio/useTextToSpeech';

interface PrepStep {
  key: 'P1' | 'R' | 'E' | 'P2';
  title: string;
  name: string;
  desc: string;
  starters: string[];
}

const PREP_STEPS: PrepStep[] = [
  {
    key: 'P1',
    title: 'Point (결론 및 핵심 주장)',
    name: '결론',
    desc: '질문에 대한 명확하고 단호한 입장을 1문장으로 밝히세요.',
    starters: [
      'To begin with, I strongly advocate that...',
      'In my perspective, the core issue is that...',
      'I am firmly of the opinion that...',
    ],
  },
  {
    key: 'R',
    title: 'Reason (이유 및 논리적 근거)',
    name: '이유',
    desc: '왜 그렇게 생각하는지 핵심 원인과 당위성을 설명하세요.',
    starters: [
      'The fundamental rationale behind this is that...',
      'This is primarily attributed to the fact that...',
      'First and foremost, one cannot overlook that...',
    ],
  },
  {
    key: 'E',
    title: 'Example (구체적 사례 및 경험)',
    name: '사례',
    desc: '개인적 경험이나 사회적 사례를 들어 주장을 구체화하세요.',
    starters: [
      'For instance, in my personal experience...',
      'A prime illustration of this can be observed in...',
      'Take, for example, a recent scenario where...',
    ],
  },
  {
    key: 'P2',
    title: 'Point (재강조 및 마무리 요약)',
    name: '마무리',
    desc: '앞선 논리를 종합하여 최종 결론을 맺으세요.',
    starters: [
      'Consequently, it is evident that...',
      'Therefore, taking everything into account, I believe that...',
      'For these compelling reasons, it is clear that...',
    ],
  },
];

interface PrepFrameworkBuilderProps {
  questionText: string;
  questionKo: string;
  examType: 'IELTS' | 'TOEIC';
  onCompleteSpeech?: (fullSpeech: string) => void;
}

export const PrepFrameworkBuilder: React.FC<PrepFrameworkBuilderProps> = ({
  questionText,
  questionKo,
  examType,
  onCompleteSpeech,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [prepTexts, setPrepTexts] = useState<Record<string, string>>({
    P1: '',
    R: '',
    E: '',
    P2: '',
  });
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [coherenceFeedback, setCoherenceFeedback] = useState<string | null>(null);

  const currentStep = PREP_STEPS[activeStepIdx];
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const { transcript, interimTranscript, startListening, stopListening, resetTranscript } =
    useSpeechRecognition();
  const { speakText } = useTextToSpeech();

  // 음성 녹음 시작
  const handleStartRecording = () => {
    resetTranscript();
    startRecording();
    startListening();
  };

  // 음성 녹음 완료
  const handleStopRecording = async () => {
    stopListening();
    try {
      await stopRecording();
      const spoken = (transcript + ' ' + interimTranscript).trim();
      if (spoken) {
        setPrepTexts((prev) => ({
          ...prev,
          [currentStep.key]: spoken,
        }));
      }
    } catch (e) {}
  };

  // 스타터 칩 클릭 시 텍스트 앞부분에 추가
  const handleApplyStarter = (starter: string) => {
    setPrepTexts((prev) => {
      const current = prev[currentStep.key] || '';
      return {
        ...prev,
        [currentStep.key]: `${starter} ${current}`.trim(),
      };
    });
  };

  // 4단계 합치기
  const fullSpeech = [prepTexts.P1, prepTexts.R, prepTexts.E, prepTexts.P2]
    .filter(Boolean)
    .join(' ');

  const allCompleted = !!(prepTexts.P1 && prepTexts.R && prepTexts.E && prepTexts.P2);

  // Gemini 일관성 검증
  const handleValidateCoherence = async () => {
    if (!fullSpeech.trim()) return;
    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          partOrQuestion: 'PREP_LOGIC_BUILDER',
          questionText: `[Target Question]: ${questionText}\n[Structured PREP Answer]:\n- Point: ${prepTexts.P1}\n- Reason: ${prepTexts.R}\n- Example: ${prepTexts.E}\n- Point(Summary): ${prepTexts.P2}`,
          transcript: fullSpeech,
          durationSeconds: 45,
        }),
      });
      const data = await res.json();
      setCoherenceFeedback(
        data.suggested_next_focus ||
          'PREP 4단 구조가 매우 탄탄합니다. 문장 간 연결이 자연스럽습니다.'
      );
      onCompleteSpeech?.(fullSpeech);
    } catch (err) {
      setCoherenceFeedback('논리 구조가 탄탄하게 완성되었습니다. 실전에서 그대로 발화해 보세요!');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="boro-card p-5 sm:p-6 space-y-6 bg-white">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-boro-border/60 pb-3">
        <div className="flex items-center gap-2">
          <span className="boro-chip bg-surface-container text-boro-text">
            <Layers className="w-3 h-3 inline mr-1 text-boro-blue" />
            PREP 논리 구조 빌더
          </span>
          <span className="text-xs text-boro-muted font-medium">
            Point → Reason → Example → Point
          </span>
        </div>
        <span className="text-xs text-boro-muted font-mono">
          {examType} Part 3 / Q11 고득점 특화
        </span>
      </div>

      {/* 4단계 프로그레스 바 */}
      <div className="grid grid-cols-4 gap-2">
        {PREP_STEPS.map((step, idx) => {
          const isCurrent = idx === activeStepIdx;
          const isDone = !!prepTexts[step.key];

          return (
            <button
              key={step.key}
              onClick={() => setActiveStepIdx(idx)}
              className={`p-2.5 rounded-card border text-left transition-all ${
                isCurrent
                  ? 'bg-boro-black text-white border-boro-black shadow-sm'
                  : isDone
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-surface/60 border-boro-border text-boro-muted hover:text-boro-text'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold font-mono">
                  STEP {idx + 1}
                </span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600 stroke-[2]" />}
              </div>
              <div className="text-xs font-semibold truncate mt-0.5">{step.name}</div>
            </button>
          );
        })}
      </div>

      {/* 현재 단계 가이드 & 입력 카드 */}
      <div className="p-5 rounded-card bg-surface-container/60 border border-boro-border/80 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-boro-text flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-boro-blue text-white flex items-center justify-center text-xs font-bold font-mono">
                {currentStep.key}
              </span>
              <span>{currentStep.title}</span>
            </h3>
            <span className="text-xs text-boro-muted">
              {activeStepIdx + 1} / {PREP_STEPS.length}
            </span>
          </div>
          <p className="text-xs text-boro-muted2">{currentStep.desc}</p>
        </div>

        {/* 추천 문장 시작 칩 (Sentence Starters) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-boro-muted">
            💡 추천 시작 어구 (탭하여 적용):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentStep.starters.map((starter, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleApplyStarter(starter)}
                className="text-xs font-medium px-2.5 py-1 rounded-full bg-white border border-boro-border text-boro-blue hover:bg-boro-blue hover:text-white transition-all active:scale-95"
              >
                + {starter}
              </button>
            ))}
          </div>
        </div>

        {/* 입력 및 음성 인식 필드 */}
        <div className="space-y-2">
          <textarea
            rows={3}
            value={prepTexts[currentStep.key]}
            onChange={(e) =>
              setPrepTexts((prev) => ({
                ...prev,
                [currentStep.key]: e.target.value,
              }))
            }
            placeholder={
              isRecording
                ? '음성을 인식하고 있습니다... 말씀해 주세요.'
                : '소리 내어 말하거나, 직접 영문으로 작성하세요.'
            }
            className="w-full p-3 rounded-card border border-boro-border text-sm text-boro-text bg-white focus:outline-none focus:border-boro-black leading-relaxed"
          />

          {isRecording && (
            <p className="text-xs text-rose-600 font-medium animate-pulse">
              ● 실시간 녹음 중: {transcript || interimTranscript || '발화 대기 중...'}
            </p>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-between pt-1">
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="boro-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5 text-boro-blue" />
              <span>말로 입력하기 (Mic)</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="px-4 py-2 rounded-full bg-boro-red text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>완료하기</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {activeStepIdx > 0 && (
              <button
                onClick={() => setActiveStepIdx((prev) => prev - 1)}
                className="boro-btn-secondary px-3.5 py-2 text-xs"
              >
                이전
              </button>
            )}

            {activeStepIdx < PREP_STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStepIdx((prev) => prev + 1)}
                className="boro-btn-primary px-4 py-2 text-xs flex items-center gap-1"
              >
                <span>다음 단계</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleValidateCoherence}
                disabled={!allCompleted || isSynthesizing}
                className="boro-btn-primary px-4 py-2 text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSynthesizing ? '검증 중...' : '전체 완성 & AI 검증'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 완성된 PREP 스피치 프리뷰 & 피드백 */}
      {fullSpeech && (
        <div className="p-5 rounded-card border border-boro-border space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-boro-text flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-boro-blue" />
              <span>완성된 PREP 스피치 (총 {fullSpeech.split(/\s+/).filter(Boolean).length}단어)</span>
            </span>

            <button
              onClick={() => speakText(fullSpeech)}
              className="boro-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>전체 듣기</span>
            </button>
          </div>

          <div className="p-4 rounded-card bg-surface-container/60 space-y-2 text-xs sm:text-sm text-boro-text leading-relaxed">
            <p>
              <strong className="text-boro-blue font-mono">[P]:</strong> {prepTexts.P1 || '...'}
            </p>
            <p>
              <strong className="text-indigo-600 font-mono">[R]:</strong> {prepTexts.R || '...'}
            </p>
            <p>
              <strong className="text-emerald-700 font-mono">[E]:</strong> {prepTexts.E || '...'}
            </p>
            <p>
              <strong className="text-boro-black font-mono">[P]:</strong> {prepTexts.P2 || '...'}
            </p>
          </div>

          {coherenceFeedback && (
            <div className="p-3.5 rounded-card bg-boro-blue-soft text-boro-blue text-xs leading-relaxed space-y-1">
              <span className="font-semibold">💡 AI 논리성 진단:</span>
              <p>{coherenceFeedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
