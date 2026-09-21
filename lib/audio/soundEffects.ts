// lib/audio/soundEffects.ts

let sharedAudioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  return sharedAudioContext;
}

// iOS Safari 대응: 사용자 최초 인터랙션 시 AudioContext 영구 언락
export async function unlockAudioContext(): Promise<boolean> {
  const ctx = getAudioContext();
  if (!ctx) return false;

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (err) {
      console.warn('Failed to resume AudioContext:', err);
    }
  }

  // 1개 샘플 무음 버퍼 재생
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
    return true;
  } catch (err) {
    console.warn('Failed to play silent buffer:', err);
    return false;
  }
}

// 고정밀 오디오 오실레이터 비프음 생성 (시험용 표준 비프음)
export function playTone(frequency: number, durationMs: number, type: OscillatorType = 'sine'): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    // 부드러운 페이드 인/아웃으로 팝(pop) 노이즈 제거
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (e) {
    console.warn('playTone error:', e);
  }
}

// 시험 시작 알림음 (띵! 880Hz)
export function playStartBeep(): void {
  playTone(880, 350, 'sine');
}

// 시험 5초 전 경고음 (띡- 587Hz)
export function playWarningBeep(): void {
  playTone(587.33, 150, 'triangle');
}

// 시험 시간 종료음 (삐--- 440Hz)
export function playEndBeep(): void {
  playTone(440, 700, 'sine');
}

// IELTS 파트 전환 차임 (이중음)
export function playTransitionChime(): void {
  playTone(523.25, 200, 'sine'); // C5
  setTimeout(() => {
    playTone(659.25, 300, 'sine'); // E5
  }, 180);
}
