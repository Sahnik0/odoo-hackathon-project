'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle2 } from 'lucide-react';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '@/hooks/use-notifications';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function NotificationBell() {
  const { data } = useNotifications({ pageSize: 8 });
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();

  const unreadCount = data?.unreadCount ?? 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-ash text-off-black transition-colors hover:bg-off-black/5"
          aria-label="Notifications"
        >
          <motion.span animate={unreadCount > 0 ? { rotate: [0, -12, 10, -8, 0] } : {}} transition={{ duration: 0.6 }}>
            <Bell size={18} />
          </motion.span>
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-crimson px-1 text-[10px] text-white"
              >
                <motion.span
                  className="absolute inset-0 rounded-full bg-crimson"
                  animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
                <span className="relative">{unreadCount > 9 ? '9+' : unreadCount}</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-[14px] font-medium uppercase text-off-black">Notifications</span>
          {unreadCount > 0 && (
            <Button variant="link" size="sm" onClick={() => markAllMutation.mutate()}>
              Mark all read
            </Button>
          )}
        </div>
        {!data || data.data.length === 0 ? (
          <div className="p-4">
            <EmptyState title="You're all caught up" icon={CheckCircle2} />
          </div>
        ) : (
          <div className="flex max-h-[400px] flex-col gap-1 overflow-y-auto">
            {data.data.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? '#'}
                onClick={() => !n.read && markReadMutation.mutate(n.id)}
                className={`flex flex-col gap-1 rounded-2xl px-3 py-2 text-left hover:bg-off-black/5 ${
                  n.read ? '' : 'bg-periwinkle-mist/40'
                }`}
              >
                <span className="text-[13px] text-off-black">{n.message}</span>
                <span className="text-[11px] uppercase text-smoke">{timeAgo(n.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
