'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { getAudioRecordBySession } from '@/lib/db/localAudioStore';

interface AudioReviewPlayerProps {
  sessionUuid: string;
  initialBlob?: Blob;
}

export const AudioReviewPlayer: React.FC<AudioReviewPlayerProps> = ({
  sessionUuid,
  initialBlob,
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let activeUrl: string | null = null;

    async function loadAudio() {
      setLoading(true);
      try {
        if (initialBlob) {
          activeUrl = URL.createObjectURL(initialBlob);
          setAudioUrl(activeUrl);
        } else {
          const record = await getAudioRecordBySession(sessionUuid);
          if (record?.audio_blob) {
            activeUrl = URL.createObjectURL(record.audio_blob);
            setAudioUrl(activeUrl);
          }
        }
      } catch (err) {
        console.error('Error loading audio from IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAudio();

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [sessionUuid, initialBlob]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5, 0.8];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="boro-panel p-4 text-center text-xs text-boro-muted">
        Loading audio from local IndexedDB...
      </div>
    );
  }

  if (!audioUrl) {
    return (
      <div className="boro-panel p-4 text-center text-xs text-boro-muted2">
        No local audio recording found for this session.
      </div>
    );
  }

  return (
    <div className="boro-card p-5 space-y-3">
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-boro-blue stroke-[1.5]" />
          <span className="text-xs font-semibold text-boro-text uppercase tracking-wider">
            Voice Playback (Local 0ms)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={cyclePlaybackRate}
            className="boro-btn-secondary px-2.5 py-1 text-[11px]"
            title="Change Playback Speed"
          >
            {playbackRate}x
          </button>
          <a
            href={audioUrl}
            download={`fakespeak_${sessionUuid}.webm`}
            className="boro-btn-secondary p-1.5"
            title="Download Audio Recording"
          >
            <Download className="w-3.5 h-3.5 stroke-[1.5]" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="boro-btn-primary w-10 h-10 flex items-center justify-center shrink-0"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-surface-container rounded-full appearance-none cursor-pointer accent-boro-blue"
          />
          <div className="flex justify-between text-[11px] text-boro-muted font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
