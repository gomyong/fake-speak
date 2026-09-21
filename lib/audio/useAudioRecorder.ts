// lib/audio/useAudioRecorder.ts
'use client';

import { useState, useRef, useCallback } from 'react';

export interface AudioRecordingResult {
  blob: Blob;
  mimeType: string;
  durationSeconds: number;
  url: string;
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedAudio, setRecordedAudio] = useState<AudioRecordingResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      audioChunksRef.current = [];
      setRecordedAudio(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 브라우저별 최적 MIME 타입 감지
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(250); // 250ms 단위 청크
      startTimeRef.current = Date.now();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      throw err;
    }
  }, []);

  const stopRecording = useCallback((): Promise<AudioRecordingResult> => {
    return new Promise((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        reject(new Error('Recorder is not active'));
        return;
      }

      recorder.onstop = () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        const duration = (Date.now() - startTimeRef.current) / 1000;
        const actualMime = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        const url = URL.createObjectURL(blob);

        const result: AudioRecordingResult = {
          blob,
          mimeType: actualMime,
          durationSeconds: duration,
          url,
        };

        setRecordedAudio(result);
        setIsRecording(false);

        // 스트림 트랙 정리
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }

        resolve(result);
      };

      recorder.stop();
    });
  }, []);

  const resetRecording = useCallback(() => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setRecordingDuration(0);
    setIsRecording(false);
  }, [recordedAudio]);

  return {
    isRecording,
    recordingDuration,
    recordedAudio,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
