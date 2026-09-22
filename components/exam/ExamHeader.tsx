'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
    <header className="w-full px-6 py-4 flex items-center justify-between border-b border-boro-border bg-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {onExit ? (
          <button
            onClick={onExit}
            className="p-2 rounded-full text-boro-muted hover:text-boro-text hover:bg-surface-container transition-colors"
            aria-label="Exit Exam"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
        ) : (
          <Link
            href="/"
            className="p-2 rounded-full text-boro-muted hover:text-boro-text hover:bg-surface-container transition-colors"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </Link>
        )}

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full border-[1.5px] border-boro-text flex items-center justify-center font-bold text-xs">
            F
          </div>
          <span className="font-semibold tracking-tight text-boro-text text-base">
            FAKE_SPEAK
          </span>
          <span className="boro-chip text-[11px] py-0.5 px-2.5">
            {examType}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-boro-muted">{sectionTitle}</p>
          {stageName && <p className="text-xs font-semibold text-boro-text">{stageName}</p>}
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-boro-text text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-boro-blue animate-pulse"></span>
          Live
        </div>
      </div>
    </header>
  );
};
