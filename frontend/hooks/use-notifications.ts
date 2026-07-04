import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/notification.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: { page?: number; unreadOnly?: boolean }) => [...notificationKeys.all, params] as const,
};

export function useNotifications(params: { page?: number; pageSize?: number; unreadOnly?: boolean } = {}) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => listNotifications(params),
    // Cheap polling for a bell badge — no websocket infra in scope for this build.
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
