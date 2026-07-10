export interface UploadedFile {
  id: number;
  file: File;
  type: string;
}

export interface AttachmentMeta {
  id: string;
  fileName: string;
  fileType: string;
  documentUrl?: string;
  extractedText?: string;
  summary?: string;
}

export interface PersonEntry {
  name: string;
  contact: string;
  relationship?: string;
  statement?: string;
  type?: string;
  description?: string;
  status?: string;
  photoUrl?: string;
  photoName?: string;
}

export interface ComplaintData {
  complaintType: string;
  category: string;
  priority: string;
  incidentDate: string;
  incidentTime: string;
  location: string;
  description: string;
  aiSummary: string;
  officerNotes: string;
  complainants: PersonEntry[];
  victims: PersonEntry[];
  suspects: PersonEntry[];
  attachments?: AttachmentMeta[];
}