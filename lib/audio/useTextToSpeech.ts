// lib/audio/useTextToSpeech.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSupported(false);
      return;
    }

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      // 자연스러운 영어 원어민 음성(US / UK) 우선 탐색
      const preferred =
        voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find((v) => v.lang === 'en-US') ||
        voices.find((v) => v.lang.startsWith('en'));

      if (preferred) {
        voiceRef.current = preferred;
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  const speakText = useCallback(
    (text: string, customRate?: number): Promise<void> => {
      return new Promise((resolve) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();

        const cleanText = text.trim();
        if (!cleanText) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = customRate ?? playbackRate;
        utterance.pitch = 1.0;

        if (voiceRef.current) {
          utterance.voice = voiceRef.current;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          resolve();
        };

        utterance.onerror = (e) => {
          console.warn('TTS playback error:', e);
          setIsPlaying(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [playbackRate]
  );

  return {
    isSupported,
    isPlaying,
    playbackRate,
    setPlaybackRate,
    speakText,
    stopSpeaking,
  };
}
