import type { Request } from 'express';
import { ok, created, list as listResponse, noContent } from '../lib/apiResponse';
import { asyncHandler } from '../lib/asyncHandler';
import { ApiError } from '../lib/apiError';
import { resolveProfileId } from '../lib/profile';
import * as documentService from '../services/document.service';
import { uploadDocumentSchema } from '../validators/document.validators';

function requester(req: Request) {
  return { id: req.user!.id, role: req.user!.role };
}

// Multipart body fields arrive as strings alongside req.file — validated here
// (not via the JSON `validate` middleware, which only reads req.body pre-parse
// for JSON payloads) before the file ever touches disk (Section 2).
export const uploadMine = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.validation('No file provided', { file: 'Required' });
  const { category } = uploadDocumentSchema.parse(req.body);
  const employeeProfileId = await resolveProfileId(req.user!.id);
  documentService.assertValidUpload(category, req.file);
  created(res, await documentService.upload(employeeProfileId, category, req.file, req.user!.id));
});

export const uploadFor = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.validation('No file provided', { file: 'Required' });
  const { category } = uploadDocumentSchema.parse(req.body);
  documentService.assertValidUpload(category, req.file);
  created(res, await documentService.upload(req.params.employeeId, category, req.file, req.user!.id));
});

export const listMine = asyncHandler(async (req, res) => {
  const { data, meta } = await documentService.listMine(req.user!.id, req.query as never);
  listResponse(res, data, meta);
});

export const list = asyncHandler(async (req, res) => {
  const { data, meta } = await documentService.list(req.query as never);
  listResponse(res, data, meta);
});

export const getById = asyncHandler(async (req, res) => {
  ok(res, await documentService.getById(req.params.id, requester(req)));
});

export const download = asyncHandler(async (req, res) => {
  const { absPath, fileName, mimeType } = await documentService.getFilePath(req.params.id, requester(req));
  res.setHeader('Content-Type', mimeType);
  res.download(absPath, fileName);
});

export const review = asyncHandler(async (req, res) => {
  ok(res, await documentService.review(req.params.id, req.body.status));
});

export const remove = asyncHandler(async (req, res) => {
  await documentService.softDelete(req.params.id, requester(req));
  noContent(res);
});
