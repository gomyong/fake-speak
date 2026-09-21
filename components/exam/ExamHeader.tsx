'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Award, ShieldAlert } from 'lucide-react';

interface ExamHeaderProps {
  examType: 'IELTS' | 'TOEIC';
  sectionTitle: string;
  stageName?: string;
  onExit?: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  examType,
  sectionTitle,
  stageName,
  onExit,
}) => {
  return (
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-slate-800 bg-[#0c121e]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {onExit ? (
          <button
            onClick={onExit}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <Link
            href="/"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        )}

        <div className="flex items-center gap-2.5">
          <span className="font-extrabold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-lg">
            FAKE_SPEAK
          </span>
          <span className="text-slate-600">/</span>
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
            {examType} Speaking
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-slate-400">{sectionTitle}</p>
          {stageName && <p className="text-xs font-bold text-indigo-400">{stageName}</p>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live Session
        </div>
      </div>
    </header>
  );
};
