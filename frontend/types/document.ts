export type DocumentCategory = 'ID_PROOF' | 'CONTRACT' | 'PROFILE_PICTURE' | 'OTHER';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface EmployeeDocument {
  id: string;
  employeeProfileId: string;
  category: DocumentCategory;
  fileName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  status: DocumentStatus;
  uploadedById: string;
  createdAt: string;
  employeeProfile?: { id: string; firstName: string; lastName: string; loginId: string };
}
