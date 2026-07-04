import { promises as fs } from 'fs';
import path from 'path';
import type { Prisma, Role } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { prisma } from '../lib/prisma';
import { env } from '../config/env';
import { ApiError } from '../lib/apiError';
import { resolveProfileId } from '../lib/profile';
import { buildPageMeta } from '../lib/apiResponse';
import { notifyAdmins } from './notification.service';
import type { DocumentCategory, ListDocumentsQuery } from '../validators/document.validators';

export interface Requester {
  id: string;
  role: Role;
}

const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const DOC_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const profileInclude = {
  employeeProfile: {
    select: { id: true, firstName: true, lastName: true, loginId: true, userId: true },
  },
} as const;

async function loadProfileOr404(employeeProfileId: string) {
  const profile = await prisma.employeeProfile.findFirst({
    where: { id: employeeProfileId, deletedAt: null },
    select: { id: true, userId: true },
  });
  if (!profile) throw ApiError.notFound('Employee not found');
  return profile;
}

function assertCanAccess(requester: Requester, profileUserId: string) {
  if (requester.role !== 'ADMIN' && profileUserId !== requester.id) {
    throw ApiError.forbidden('You can only access your own documents');
  }
}

/** Type/size validation BEFORE touching disk (Section 2) — reject with 422.
 *  Called from the controller with the raw multer file, ahead of any fs write. */
export function assertValidUpload(category: DocumentCategory, file: Express.Multer.File): void {
  const isImageCategory = category === 'PROFILE_PICTURE';
  const allowedTypes = isImageCategory ? IMAGE_TYPES : DOC_TYPES;
  const maxBytes = (isImageCategory ? env.MAX_IMAGE_MB : env.MAX_DOC_MB) * 1024 * 1024;

  if (!allowedTypes.has(file.mimetype)) {
    throw ApiError.validation('Unsupported file type', {
      file: isImageCategory ? 'Allowed: jpg, png, webp' : 'Allowed: pdf, jpg, png',
    });
  }
  if (file.size > maxBytes) {
    throw ApiError.validation('File exceeds the maximum allowed size', {
      file: `Max ${isImageCategory ? env.MAX_IMAGE_MB : env.MAX_DOC_MB}MB`,
    });
  }
}

/** Writes the already-validated buffer to
 *  uploads/{employeeId}/{category}/{uuid}-{originalFilename} (Section 2) and
 *  records a Document row. Notifies Admins (upload trigger); PROFILE_PICTURE
 *  also updates the profile's pointer field. */
export async function upload(
  employeeProfileId: string,
  category: DocumentCategory,
  file: Express.Multer.File,
  uploadedById: string,
) {
  await loadProfileOr404(employeeProfileId); // 404s before writing anything if the employee doesn't exist

  const safeName = path.basename(file.originalname).replace(/[^\w.\-]/g, '_');
  const storageRelPath = path.join(employeeProfileId, category, `${uuid()}-${safeName}`);
  const absDir = path.join(process.cwd(), env.UPLOAD_DIR, employeeProfileId, category);
  const absPath = path.join(process.cwd(), env.UPLOAD_DIR, storageRelPath);

  await fs.mkdir(absDir, { recursive: true });
  await fs.writeFile(absPath, file.buffer);

  const document = await prisma.document.create({
    data: {
      employeeProfileId,
      category,
      fileName: file.originalname,
      storagePath: storageRelPath,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      uploadedById,
    },
    include: profileInclude,
  });

  if (category === 'PROFILE_PICTURE') {
    await prisma.employeeProfile.update({
      where: { id: employeeProfileId },
      data: { profilePicture: document.storagePath },
    });
  }

  await notifyAdmins(
    'DOCUMENT_UPLOADED',
    `${document.employeeProfile.firstName} ${document.employeeProfile.lastName} uploaded a ${category.toLowerCase()} document`,
    `/admin/documents/${document.id}`,
  );

  return document;
}

export async function listMine(userId: string, query: ListDocumentsQuery) {
  const employeeProfileId = await resolveProfileId(userId);
  const { page, pageSize, category, status } = query;
  const where: Prisma.DocumentWhereInput = {
    employeeProfileId,
    deletedAt: null,
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

export async function list(query: ListDocumentsQuery) {
  const { page, pageSize, employeeId, category, status } = query;
  const where: Prisma.DocumentWhereInput = {
    deletedAt: null,
    ...(employeeId ? { employeeProfileId: employeeId } : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
  };

  const [total, data] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      include: profileInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total) };
}

async function loadOr404(id: string) {
  const doc = await prisma.document.findFirst({ where: { id, deletedAt: null }, include: profileInclude });
  if (!doc) throw ApiError.notFound('Document not found');
  return doc;
}

export async function getById(id: string, requester: Requester) {
  const doc = await loadOr404(id);
  assertCanAccess(requester, doc.employeeProfile.userId);
  return doc;
}

/** Ownership-checked absolute path for streaming the underlying file back down. */
export async function getFilePath(id: string, requester: Requester) {
  const doc = await getById(id, requester);
  return {
    absPath: path.join(process.cwd(), env.UPLOAD_DIR, doc.storagePath),
    fileName: doc.fileName,
    mimeType: doc.mimeType,
  };
}

/** Admin approve/reject (mirrors leave review shape). Rejection notifies Admin
 *  per Section 2's trigger list (re-review loop stays visible to Admin too). */
export async function review(id: string, status: 'APPROVED' | 'REJECTED') {
  const doc = await loadOr404(id);
  const updated = await prisma.document.update({ where: { id: doc.id }, data: { status } });
  if (status === 'REJECTED') {
    await notifyAdmins(
      'DOCUMENT_REJECTED',
      `${doc.employeeProfile.firstName} ${doc.employeeProfile.lastName}'s ${doc.category.toLowerCase()} document was rejected`,
      `/admin/documents/${doc.id}`,
    );
  }
  return updated;
}

/** Soft delete (Section 5) — the file stays on disk (retained for audit), only
 *  the Document row is marked deleted and excluded from reads. */
export async function softDelete(id: string, requester: Requester) {
  const doc = await loadOr404(id);
  assertCanAccess(requester, doc.employeeProfile.userId);
  await prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
}
