'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Clock, Award, Sparkles, TrendingUp } from 'lucide-react';
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

  // 최근 7일 잔디 시뮬레이션
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 연속 학습일 (Streak) */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <Flame className="w-6 h-6 fill-current animate-bounce" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Day Streak</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-white">{profile.current_streak_days}</span>
            <span className="text-xs text-amber-400 font-bold">Days Active</span>
          </div>
        </div>
      </div>

      {/* 총 발화 시간 */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
          <Clock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Speaking Time</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-white">{totalMinutes}</span>
            <span className="text-xs text-indigo-400 font-bold">Minutes Total</span>
          </div>
        </div>
      </div>

      {/* 실시간 밴드 점수 추정 */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Band</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-white">
              {profile.current_band_estimate.toFixed(1)}
            </span>
            <span className="text-xs text-emerald-400 font-bold">IELTS / C1</span>
          </div>
        </div>
      </div>
    </div>
  );
};
