import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export type Attachment = {
  id?: string;
  filename: string;
  file_url: string;
  file_type: 'photo' | 'file';
  uploaded_at?: string;
};

export type DiaryEntry = {
  diary_id: string;
  case_id: string;
  officer_id?: string;
  action_type?: string;
  description?: string;
  location?: string;
  occurred_at?: string | null;
  created_at?: string | null;
  attachments?: Attachment[];
};

export type CreateDiaryPayload = {
  case_id: string;
  officer_id?: string;
  action_type: string;
  description: string;
  location?: string;
  occurred_at?: string;
  attachments?: Attachment[];
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

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'unsigned_preset');
  
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your_cloud_name'}/auto/upload`;
  const res = await axios.post(cloudinaryUrl, formData);
  return res.data.secure_url;
}

export async function createCaseDiary(payload: CreateDiaryPayload) {
  const res = await axios.post(`${API_BASE}/api/case-diary`, payload);
  return res.data;
}