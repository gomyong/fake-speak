'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Clock, Award } from 'lucide-react';
import { getOrCreateUserProfile, LocalUserProfile } from '@/lib/db/localAudioStore';

export const StreakCalendar: React.FC = () => {
  const [profile, setProfile] = useState<LocalUserProfile | null>(null);

  useEffect(() => {
    async function load() {
      const p = await getOrCreateUserProfile();
      setProfile(p);
    }
    load();
  }, []);

  if (!profile) return null;

  const totalMinutes = Math.round(profile.total_speaking_seconds / 60);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 연속 학습일 (Streak) */}
      <div className="boro-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-boro-muted uppercase tracking-wider">Day Streak</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tighter text-boro-text">
              {profile.current_streak_days}
            </span>
            <span className="text-xs font-medium text-boro-muted">days</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-boro-text shrink-0">
          <Flame className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* 총 발화 시간 */}
      <div className="boro-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-boro-muted uppercase tracking-wider">Speaking Time</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tighter text-boro-text">
              {totalMinutes}
            </span>
            <span className="text-xs font-medium text-boro-muted">minutes</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-boro-blue shrink-0">
          <Clock className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>

      {/* 실시간 밴드 점수 추정 */}
      <div className="boro-card p-5 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-medium text-boro-muted uppercase tracking-wider">Estimated Band</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tracking-tighter text-boro-text">
              {profile.current_band_estimate.toFixed(1)}
            </span>
            <span className="boro-chip text-[11px] py-0.5 px-2">C1 Level</span>
          </div>
        </div>
        <div className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center text-boro-text shrink-0">
          <Award className="w-5 h-5 stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
};
