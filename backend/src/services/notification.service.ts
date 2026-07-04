import type { NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../lib/apiError';
import { buildPageMeta } from '../lib/apiResponse';
import type { ListNotificationsQuery } from '../validators/notification.validators';

// Shared fire-and-forget notification helpers, used by leave/payroll/document
// services (Section 2 trigger list). Never throws on its own — a notification
// failure should not roll back the business transaction that triggered it, so
// callers that need atomicity should include the create() call in their own
// `prisma.$transaction` instead (see auth.service.verifyEmail for that pattern).

export async function notify(userId: string, type: NotificationType, message: string, link?: string) {
  return prisma.notification.create({ data: { userId, type, message, link } });
}

/** Broadcast to every active Admin (Leave submitted, Document uploaded — Section 2). */
export async function notifyAdmins(type: NotificationType, message: string, link?: string) {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', deletedAt: null },
    select: { id: true },
  });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, type, message, link })),
  });
}

export async function list(userId: string, query: ListNotificationsQuery) {
  const { page, pageSize, unreadOnly } = query;
  const where = { userId, ...(unreadOnly ? { read: false } : {}) };

  const [total, unreadCount, data] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { data, meta: buildPageMeta(page, pageSize, total), unreadCount };
}

export async function markRead(id: string, userId: string) {
  const notification = await prisma.notification.findFirst({ where: { id, userId } });
  if (!notification) throw ApiError.notFound('Notification not found');
  if (notification.read) return notification;
  return prisma.notification.update({
    where: { id },
    data: { read: true, readAt: new Date() },
  });
}

export async function markAllRead(userId: string): Promise<{ count: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
  return { count: result.count };
}
