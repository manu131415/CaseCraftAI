export interface UploadedFile {
  id: number;
  file: File;
  type: string;
}

export interface PersonEntry {
  name: string;
  contact: string;
  relationship?: string;
  statement?: string;
  type?: string;
  description?: string;
  status?: string;
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
}