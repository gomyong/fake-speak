// components/training/TopicSelectorModal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import {
  IELTS_PREDICTED_TOPICS,
  PredictedTopicItem,
  TopicQuestion,
} from '@/lib/constants/ieltsPredictedTopics';

interface TopicSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUnitId: string;
  onSelectUnit: (unitId: string) => void;
}

export function TopicSelectorModal({
  isOpen,
  onClose,
  currentUnitId,
  onSelectUnit,
}: TopicSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [partFilter, setPartFilter] = useState<'ALL' | '1' | '2'>('ALL');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

  // 필터링된 주제 목록
  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return IELTS_PREDICTED_TOPICS.filter((topic) => {
      // Part 필터
      if (partFilter === '1' && topic.part !== 1) return false;
      if (partFilter === '2' && topic.part !== 2) return false;

      // 검색어 필터
      if (!query) return true;
      const matchTitle = topic.topicTitle.toLowerCase().includes(query);
      const matchTitleKo = topic.topicTitleKo.toLowerCase().includes(query);
      const matchScreenshot = topic.screenshotId.toLowerCase().includes(query);
      const matchQuestion = topic.questions.some(
        (q) =>
          q.question.toLowerCase().includes(query) ||
          q.questionKo.toLowerCase().includes(query)
      );

      return matchTitle || matchTitleKo || matchScreenshot || matchQuestion;
    });
  }, [searchQuery, partFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-surface rounded-2xl border border-boro-border shadow-2xl max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden text-boro-text animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 헤더 */}
        <div className="px-6 py-4 border-b border-boro-border flex items-center justify-between bg-white">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-boro-text">
                아이엘츠 기출 & 예상 문제 주제 선택
              </h2>
              <span className="boro-chip text-[11px] py-0.5 px-2 bg-boro-black text-white font-semibold">
                총 45개 주제 전수 수록
              </span>
            </div>
            <p className="text-xs text-boro-muted">
              실제 시험에 출제된 기출 스크린샷 45개 주제로 훈련합니다. AI 임의 생성이 아닌 실전 기출 원문입니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-container text-boro-muted hover:text-boro-text transition-colors"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* 검색창 및 파트 필터 탭 */}
        <div className="p-4 border-b border-boro-border bg-surface-container-lowest space-y-3">
          {/* 검색 바 */}
          <div className="relative">
            <Search className="w-4 h-4 text-boro-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="주제 영문/한글, 스크린샷 ID, 질문 키워드 검색 (예: Friends, 친구, 박물관, IMG_2103)..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-boro-border bg-white focus:outline-none focus:ring-2 focus:ring-boro-black/20 transition-all placeholder:text-boro-muted/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-boro-muted hover:text-boro-text"
              >
                지우기
              </button>
            )}
          </div>

          {/* 파트 필터 탭 */}
          <div className="flex items-center gap-2">
            {[
              { key: 'ALL', label: '전체 (45개)' },
              { key: '1', label: 'Part 1: 개인 인터뷰 (16개)' },
              { key: '2', label: 'Part 2 & 3: 큐카드·심층토론 (29개)' },
            ].map((tab) => {
              const isSelected = partFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setPartFilter(tab.key as 'ALL' | '1' | '2')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-boro-black text-white shadow-sm'
                      : 'bg-white border border-boro-border text-boro-muted hover:text-boro-text'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 주제 카드 목록 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
          {filteredTopics.length === 0 ? (
            <div className="text-center py-16 space-y-2 text-boro-muted">
              <BookOpen className="w-8 h-8 mx-auto stroke-[1.2] opacity-40" />
              <p className="text-sm font-medium">검색 결과와 일치하는 기출 주제가 없습니다.</p>
              <p className="text-xs">다른 검색어를 입력하거나 필터를 전체로 변경해 보세요.</p>
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isCurrentTopic = topic.questions.some(
                (q) => q.unit.id === currentUnitId
              );
              const isExpanded = expandedTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  className={`border rounded-xl transition-all duration-150 overflow-hidden ${
                    isCurrentTopic
                      ? 'border-boro-black bg-white shadow-sm ring-1 ring-boro-black/10'
                      : 'border-boro-border bg-white hover:border-boro-border-strong'
                  }`}
                >
                  {/* 주제 카드 헤더 */}
                  <div
                    onClick={() => {
                      if (topic.questions.length === 1) {
                        onSelectUnit(topic.questions[0].unit.id);
                        onClose();
                      } else {
                        setExpandedTopicId(isExpanded ? null : topic.id);
                      }
                    }}
                    className="p-4 cursor-pointer flex items-center justify-between gap-4 hover:bg-surface-container/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-surface-container text-boro-muted border border-boro-border/60">
                          <ImageIcon className="w-2.5 h-2.5" />
                          {topic.screenshotId}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            topic.part === 1
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          Part {topic.part}
                        </span>
                        <span className="text-[10px] text-boro-muted font-medium">
                          {topic.questions.length > 1
                            ? `${topic.questions.length}개 질문 수록`
                            : '대표 큐카드'}
                        </span>
                        {isCurrentTopic && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            학습 진행 중
                          </span>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-boro-text truncate">
                          {topic.topicTitle}
                        </h3>
                        <span className="text-xs text-boro-muted truncate">
                          {topic.topicTitleKo}
                        </span>
                      </div>

                      <p className="text-xs text-boro-muted line-clamp-1">
                        Q: {topic.questions[0]?.question}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {topic.questions.length > 1 ? (
                        <button
                          type="button"
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-boro-border hover:bg-surface-container text-boro-text transition-colors"
                        >
                          {isExpanded ? '접기' : '질문 보기'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectUnit(topic.questions[0].unit.id);
                            onClose();
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-boro-black text-white hover:bg-boro-black/90 transition-colors flex items-center gap-1"
                        >
                          <span>학습 시작</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 세부 질문 목록 (질문이 여러 개인 경우 아코디언) */}
                  {topic.questions.length > 1 && isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-boro-border/60 bg-surface-container-lowest space-y-2">
                      <div className="text-[11px] font-semibold text-boro-muted">
                        세부 질문을 선택하여 학습을 시작하세요:
                      </div>
                      <div className="space-y-1.5">
                        {topic.questions.map((q, idx) => {
                          const isSelectedQ = q.unit.id === currentUnitId;
                          return (
                            <button
                              key={q.id}
                              onClick={() => {
                                onSelectUnit(q.unit.id);
                                onClose();
                              }}
                              className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3 ${
                                isSelectedQ
                                  ? 'bg-white border-boro-black shadow-sm font-medium'
                                  : 'bg-white/80 border-boro-border hover:bg-white hover:border-boro-border-strong'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-boro-text">
                                    Q{q.questionNumber || idx + 1}.
                                  </span>
                                  <span className="text-boro-text">
                                    {q.question}
                                  </span>
                                </div>
                                <p className="text-[11px] text-boro-muted pl-5">
                                  {q.questionKo}
                                </p>
                              </div>
                              <span
                                className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded ${
                                  isSelectedQ
                                    ? 'bg-boro-black text-white'
                                    : 'bg-surface-container text-boro-muted'
                                }`}
                              >
                                {isSelectedQ ? '진행 중' : '선택'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 모달 하단 안내 푸터 */}
        <div className="px-6 py-3 border-t border-boro-border bg-white flex items-center justify-between text-xs text-boro-muted">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>각 주제마다 Band 8.5 모범 답변, 청크 분해, 전략 Tip이 제공됩니다.</span>
          </div>
          <button
            onClick={onClose}
            className="font-medium text-boro-text hover:underline"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
