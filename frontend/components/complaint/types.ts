export interface UploadedFile {
  id: number;
  file: File;
  type: string;
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
  complainantName: string;
  complainantContact: string;
  complainantRelationship: string;
  complainantStatement: string;
  victimType: string;
  victimName: string;
  victimContact: string;
  victimStatement: string;
  suspectType: string;
  suspectName: string;
  suspectContact: string;
  suspectDescription: string;
  suspectStatus: string;
}