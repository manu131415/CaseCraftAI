export interface ComplaintData {
  // Complaint Details
  complaintTitle: string;

  crimeCategory: string;
  crimeSubcategory: string;

  priority: string;
  complaintMode: string;

  incidentDate: string;
  incidentTime: string;

  location: string;
  landmark: string;

  emergency: string;

  description: string;
  officerNotes: string;

  // Complainant Details
  complainantName: string;
  complainantFatherName: string;

  complainantAge: string;
  complainantGender: string;

  complainantPhone: string;
  complainantEmail: string;

  complainantAddress: string;

  complainantAadhaar: string;

  complainantRelationship: string;

  complainantOccupation: string;
  complainantNationality: string;

  complainantPhotoUrl?: string;
  complainantPhotoName?: string;
  // Optional aggregated fields used by the file extraction flow
  aiSummary?: string;
  attachments?: AttachmentMeta[];
  complainants?: VictimEntry[];
  victims?: VictimEntry[];
  suspects?: SuspectEntry[];
}

export interface VictimEntry {
  fullName: string;

  age: string;
  gender: string;

  phone: string;

  address: string;

  injuries: string;

  photoUrl?: string;
  photoName?: string;
}

export interface SuspectEntry {
  fullName: string;

  alias: string;

  fatherName: string;

  age: string;
  dob: string;

  gender: string;

  permanentAddress: string;
  presentAddress: string;

  identificationMarks: string;

  faceShape: string;
  complexion: string;

  eyeColor: string;
  eyeStructure: string;

  hairType: string;
  hairColor: string;

  unknownIdentity: boolean;

  photoUrl?: string;
  photoName?: string;
}

export interface WitnessEntry {
  fullName: string;

  phone: string;

  address: string;

  statement: string;

  photoUrl?: string;
  photoName?: string;
}

export interface EvidenceEntry {
  evidenceType: string;

  description: string;

  quantity: string;

  serialNumber: string;

  itemCondition: string;

  seizedFrom: string;

  seizureDate: string;
  seizureTime: string;

  seizureLocation: string;

  sealNumber: string;

  storageLocation: string;

  fileUrl?: string;
  fileName?: string;
}
export interface AttachmentMeta {
  id: string;
  fileName: string;
  fileType: string;
  documentUrl?: string;
  extractedText?: string;
  summary?: string;
  extraction?: {
    sections?: {
      narrative_text?: string;
      incident_details?: {
        description?: string;
      };
      complainant_details?: {
        name?: string;
      };
      accused_details?: Array<{ name?: string }>;
    };
    entities?: {
      locations?: string[];
      phone_numbers?: string[];
      people?: Array<{ name?: string }>;
    };
    key_facts?: string[];
    full_text?: string;
  };
}

export interface DocumentEntry {
  documentType: string;

  title: string;

  description: string;

  fileUrl?: string;
  fileName?: string;
}

export interface UploadedFile {
  id: number;
  file: File;
  type?: string;
}