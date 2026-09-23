// lib/db/localAudioStore.ts
import Dexie, { type Table } from 'dexie';

export interface LocalAudioRecord {
  id?: number;
  session_uuid: string; // Neon evaluation_sessions.id 와 매핑
  question_id: string;
  audio_blob: Blob;     // 원본 음성 녹음 파일 (audio/webm or audio/mp4)
  mime_type: string;
  duration_seconds: number;
  recorded_at: Date;
}

export interface LocalEvaluationRecord {
  id?: number;
  session_uuid: string;
  exam_type: 'IELTS' | 'TOEIC';
  part_or_question: string;
  question_text: string;
  transcript: string;
  overall_band: number;
  scores_json: Record<string, any>;
  weaknesses: string[];
  lexical_enhancements: Array<{ original: string; upgraded: string }>;
  model_answer: string;
  audio_storage_key?: string;
  duration_seconds?: number;
  created_at: Date;
}

export interface LocalUserProfile {
  id?: number;
  target_exam: 'IELTS' | 'TOEIC';
  current_band_estimate: number;
  weak_grammar_patterns: string[];
  frequent_filler_words: string[];
  type_token_ratio: number;
  total_speaking_seconds: number;
  current_streak_days: number;
  last_studied_at: Date;
}

export class FakeSpeakLocalDatabase extends Dexie {
  audioRecords!: Table<LocalAudioRecord, number>;
  evaluations!: Table<LocalEvaluationRecord, number>;
  userProfile!: Table<LocalUserProfile, number>;

  constructor() {
    super('FakeSpeakLocalDB');
    this.version(1).stores({
      audioRecords: '++id, session_uuid, question_id, recorded_at',
      evaluations: '++id, session_uuid, exam_type, part_or_question, created_at',
      userProfile: '++id, target_exam'
    });
  }
}

export const localDB = new FakeSpeakLocalDatabase();

// 헬퍼 함수: 오디오 Blob 저장
export async function saveAudioRecord(
  sessionUuid: string,
  questionId: string,
  audioBlob: Blob,
  durationSeconds: number,
  mimeType: string = 'audio/webm'
): Promise<number> {
  const id = await localDB.audioRecords.add({
    session_uuid: sessionUuid,
    question_id: questionId,
    audio_blob: audioBlob,
    mime_type: mimeType,
    duration_seconds: Math.round(durationSeconds),
    recorded_at: new Date()
  });
  return id as number;
}

// 헬퍼 함수: 세션 UUID로 오디오 레코드 조회
export async function getAudioRecordBySession(sessionUuid: string): Promise<LocalAudioRecord | undefined> {
  return await localDB.audioRecords.where('session_uuid').equals(sessionUuid).first();
}

// 헬퍼 함수: 로컬 평가 저장
export async function saveLocalEvaluation(record: Omit<LocalEvaluationRecord, 'id'>): Promise<number> {
  const id = await localDB.evaluations.add(record);
  
  // 실제 측정된 발화 시간을 누적 (없을 시 기본 추정치 적용)
  const actualDuration =
    record.duration_seconds && record.duration_seconds > 0
      ? Math.round(record.duration_seconds)
      : record.audio_storage_key
      ? 45
      : 30;

  await updateProfileSpeakingStats(actualDuration);
  return id as number;
}

// 헬퍼 함수: 최근 평가 목록 조회
export async function getRecentEvaluations(limit: number = 20): Promise<LocalEvaluationRecord[]> {
  return await localDB.evaluations.orderBy('created_at').reverse().limit(limit).toArray();
}

// 헬퍼 함수: 로컬 사용자 프로필 가져오기 (없으면 생성)
export async function getOrCreateUserProfile(): Promise<LocalUserProfile> {
  let profile = await localDB.userProfile.toCollection().first();
  if (!profile) {
    const defaultProfile: LocalUserProfile = {
      target_exam: 'IELTS',
      current_band_estimate: 6.0,
      weak_grammar_patterns: ['conditional_type_3', 'concession_clauses'],
      frequent_filler_words: ['like', 'you know', 'actually'],
      type_token_ratio: 0.550,
      total_speaking_seconds: 0,
      current_streak_days: 1,
      last_studied_at: new Date()
    };
    const id = await localDB.userProfile.add(defaultProfile);
    profile = { ...defaultProfile, id: id as number };
  }
  return profile;
}

// 헬퍼 함수: 발화 시간 및 스트릭 갱신
export async function updateProfileSpeakingStats(additionalSeconds: number): Promise<void> {
  const profile = await getOrCreateUserProfile();
  const now = new Date();
  const lastStudied = new Date(profile.last_studied_at);

  const isSameDay = 
    now.getFullYear() === lastStudied.getFullYear() &&
    now.getMonth() === lastStudied.getMonth() &&
    now.getDate() === lastStudied.getDate();

  const diffTime = Math.abs(now.getTime() - lastStudied.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = profile.current_streak_days;
  if (!isSameDay) {
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  await localDB.userProfile.update(profile.id!, {
    total_speaking_seconds: profile.total_speaking_seconds + additionalSeconds,
    current_streak_days: newStreak,
    last_studied_at: now
  });
}
