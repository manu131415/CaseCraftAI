import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type DiaryEntry = {
  diary_id: string;
  case_id: string;
  officer_id: string;
  action_type?: string;
  description?: string;
  location?: string;
  occurred_at?: string | null;
  created_at?: string | null;
};

export type CreateDiaryPayload = {
  case_id: string;
  officer_id?: string;
  action_type: string;
  description: string;
  location?: string;
  occurred_at?: string;
};

export async function getCaseByComplaint(complaintId: string) {
  try {
    const res = await axios.get(`${API_BASE}/api/cases/by-complaint/${complaintId}`);
    return res.data || null;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    throw err;
  }
}

export async function loadDiaryEntriesForComplaint(complaintId: string): Promise<{ entries: DiaryEntry[]; hasCase: boolean }>{
  const caseRecord = await getCaseByComplaint(complaintId);
  if (!caseRecord) return { entries: [], hasCase: false };

  const caseId = caseRecord.case_id;
  const res = await axios.get(`${API_BASE}/api/case-diary/case/${caseId}`);
  return { entries: res.data.diary_entries || [], hasCase: true };
}

export async function createCaseDiary(payload: CreateDiaryPayload) {
  const res = await axios.post(`${API_BASE}/api/case-diary`, payload);
  return res.data;
}