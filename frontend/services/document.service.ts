import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { DocumentCategory, EmployeeDocument } from '@/types/document';

export interface ListDocumentsParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  category?: DocumentCategory;
  status?: string;
}

export async function uploadMyDocument(category: DocumentCategory, file: File) {
  const form = new FormData();
  // category MUST precede file in the multipart stream — multer's fileFilter
  // (and our own body-field access) only sees fields already parsed by then.
  form.append('category', category);
  form.append('file', file);
  const res = await api.post<ApiSuccess<EmployeeDocument>>('/documents/me', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data;
}

export async function listMyDocuments(params: ListDocumentsParams = {}) {
  const res = await api.get<ApiSuccess<EmployeeDocument[]>>('/documents/me', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function listDocuments(params: ListDocumentsParams) {
  const res = await api.get<ApiSuccess<EmployeeDocument[]>>('/documents', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function reviewDocument(id: string, status: 'APPROVED' | 'REJECTED') {
  const res = await api.patch<ApiSuccess<EmployeeDocument>>(`/documents/${id}/review`, { status });
  return res.data.data;
}

export async function deleteDocument(id: string) {
  await api.delete(`/documents/${id}`);
}

// The download route is behind `authenticate` (Bearer header), so a bare
// <img src>/<a href> can't hit it directly — fetch through the shared Axios
// instance (which attaches the token) and hand back an object URL instead.
export async function fetchDocumentBlobUrl(id: string): Promise<string> {
  const res = await api.get(`/documents/${id}/file`, { responseType: 'blob' });
  return URL.createObjectURL(res.data as Blob);
}
