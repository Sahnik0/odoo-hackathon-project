import { z } from 'zod';
import { paginationSchema } from './common';

// PROFILE_PICTURE is validated against the image constraints (5MB, jpg/png/webp);
// everything else against the document constraints (10MB, pdf/jpg/png) — Section 2.
export const documentCategoryEnum = z.enum(['ID_PROOF', 'CONTRACT', 'PROFILE_PICTURE', 'OTHER']);
export const documentStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const uploadDocumentSchema = z.object({
  category: documentCategoryEnum,
});

export const reviewDocumentSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});

export const listDocumentsSchema = paginationSchema.extend({
  employeeId: z.string().uuid().optional(),
  status: documentStatusEnum.optional(),
  category: documentCategoryEnum.optional(),
});

export type DocumentCategory = z.infer<typeof documentCategoryEnum>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type ReviewDocumentInput = z.infer<typeof reviewDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsSchema>;
