// lib/db/weakChunkStore.ts

export interface WeakChunk {
  id: string;
  chunkText: string;
  ko: string;
  contextSentence: string;
  examType: 'IELTS' | 'TOEIC';
  sectionTitle: string;
  accuracy: number; // 최근 일치율 (%)
  level: number; // 0(당일), 1(1일후), 2(3일후), 3(7일후), 4(14일후), 5(마스터)
  nextReviewDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'fake_speak_weak_chunks_v1';

// 에빙하우스 망각곡선 기반 복습 주기 (일수)
const SRS_INTERVALS_DAYS = [0, 1, 3, 7, 14];

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getAllWeakChunks(): WeakChunk[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load weak chunks:', e);
    return [];
  }
}

function saveWeakChunks(chunks: WeakChunk[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chunks));
  } catch (e) {
    console.error('Failed to save weak chunks:', e);
  }
}

/**
 * 취약 청크 등록 (중복 시 최신 발화 정확도로 업데이트)
 */
export function addWeakChunk(params: {
  chunkText: string;
  ko: string;
  contextSentence: string;
  examType: 'IELTS' | 'TOEIC';
  sectionTitle: string;
  accuracy: number;
}): WeakChunk {
  const chunks = getAllWeakChunks();
  const normalizedText = params.chunkText.trim().toLowerCase();

  const existingIdx = chunks.findIndex(
    (c) => c.chunkText.trim().toLowerCase() === normalizedText
  );

  const today = getTodayString();

  if (existingIdx >= 0) {
    // 기존 청크가 있으면 정확도 업데이트 및 복습 스케줄 재조정
    const existing = chunks[existingIdx];
    const updated: WeakChunk = {
      ...existing,
      accuracy: params.accuracy,
      // 발화 정확도가 낮으면 레벨을 낮춰 복습 주기를 당김
      level: params.accuracy < 70 ? 0 : Math.max(0, existing.level - 1),
      nextReviewDate: today,
      updatedAt: today,
    };
    chunks[existingIdx] = updated;
    saveWeakChunks(chunks);
    return updated;
  }

  const newChunk: WeakChunk = {
    id: `chunk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    chunkText: params.chunkText.trim(),
    ko: params.ko.trim(),
    contextSentence: params.contextSentence,
    examType: params.examType,
    sectionTitle: params.sectionTitle,
    accuracy: params.accuracy,
    level: 0,
    nextReviewDate: today,
    createdAt: today,
    updatedAt: today,
  };

  chunks.unshift(newChunk);
  saveWeakChunks(chunks);
  return newChunk;
}

/**
 * 오늘 복습 기한이 도래한 청크 목록 조회
 */
export function getDueWeakChunks(): WeakChunk[] {
  const chunks = getAllWeakChunks();
  const today = getTodayString();

  return chunks.filter((c) => c.level < 5 && c.nextReviewDate <= today);
}

/**
 * 복습 시도 결과 기록 (망각곡선 레벨 승급 / 강등)
 */
export function recordReviewResult(
  id: string,
  passed: boolean,
  accuracy: number
): WeakChunk | null {
  const chunks = getAllWeakChunks();
  const idx = chunks.findIndex((c) => c.id === id);
  if (idx === -1) return null;

  const target = chunks[idx];
  const today = getTodayString();

  let nextLevel = target.level;
  let nextDate = today;

  if (passed) {
    // 합격 (80% 이상): 레벨 1단계 승급
    nextLevel = Math.min(target.level + 1, 5);
    const intervalDays = SRS_INTERVALS_DAYS[nextLevel] || 14;
    nextDate = addDaysToDate(today, intervalDays);
  } else {
    // 불합격: 레벨 0(또는 1)로 강등하고 내일 즉시 재복습
    nextLevel = 0;
    nextDate = addDaysToDate(today, 1);
  }

  const updated: WeakChunk = {
    ...target,
    level: nextLevel,
    accuracy,
    nextReviewDate: nextDate,
    updatedAt: today,
  };

  chunks[idx] = updated;
  saveWeakChunks(chunks);
  return updated;
}

/**
 * 취약 청크 삭제
 */
export function deleteWeakChunk(id: string): void {
  const chunks = getAllWeakChunks();
  const filtered = chunks.filter((c) => c.id !== id);
  saveWeakChunks(filtered);
}

/**
 * 대시보드 요약 통계
 */
export function getWeakChunkStats(): {
  totalCount: number;
  dueCount: number;
  masteredCount: number;
} {
  const chunks = getAllWeakChunks();
  const today = getTodayString();

  const dueCount = chunks.filter((c) => c.level < 5 && c.nextReviewDate <= today).length;
  const masteredCount = chunks.filter((c) => c.level >= 5).length;

  return {
    totalCount: chunks.length,
    dueCount,
    masteredCount,
  };
}
