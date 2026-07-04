import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { AppNotification } from '@/types/notification';

export async function listNotifications(params: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) {
  const res = await api.get<ApiSuccess<AppNotification[]>>('/notifications', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta, unreadCount: res.data.unreadCount ?? 0 };
}

export async function markNotificationRead(id: string) {
  const res = await api.patch<ApiSuccess<AppNotification>>(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsRead() {
  const res = await api.patch<ApiSuccess<{ count: number }>>('/notifications/read-all');
  return res.data.data;
}
