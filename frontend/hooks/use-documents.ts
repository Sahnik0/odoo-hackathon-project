import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteDocument,
  listDocuments,
  listMyDocuments,
  reviewDocument,
  uploadMyDocument,
  type ListDocumentsParams,
} from '@/services/document.service';
import type { DocumentCategory } from '@/types/document';

export const documentKeys = {
  all: ['documents'] as const,
  mine: (params: ListDocumentsParams) => [...documentKeys.all, 'me', params] as const,
  list: (params: ListDocumentsParams) => [...documentKeys.all, 'list', params] as const,
};

export function useMyDocuments(params: ListDocumentsParams = {}) {
  return useQuery({ queryKey: documentKeys.mine(params), queryFn: () => listMyDocuments(params) });
}

export function useDocumentList(params: ListDocumentsParams) {
  return useQuery({ queryKey: documentKeys.list(params), queryFn: () => listDocuments(params) });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ category, file }: { category: DocumentCategory; file: File }) =>
      uploadMyDocument(category, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useReviewDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' }) => reviewDocument(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentKeys.all }),
  });
}
