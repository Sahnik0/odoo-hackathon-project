import { cn } from '@/lib/utils';

const TONES: Record<string, string> = {
  neutral: 'bg-ash/40 text-off-black',
  positive: 'bg-mint/60 text-off-black',
  warning: 'bg-gold/60 text-off-black',
  negative: 'bg-coral/50 text-off-black',
  info: 'bg-periwinkle-mist text-off-black',
};

// Status tag: 9999px pill per DESIGN.md ("Pipeline Node Tag" / tags radius).
export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium uppercase tracking-tight',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONE: Record<string, keyof typeof TONES> = {
  PRESENT: 'positive',
  APPROVED: 'positive',
  ACTIVE: 'positive',
  HALF_DAY: 'warning',
  PENDING: 'warning',
  ON_LEAVE: 'warning',
  LEAVE: 'info',
  ABSENT: 'negative',
  REJECTED: 'negative',
  CANCELLED: 'neutral',
  TERMINATED: 'negative',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONE[status] ?? 'neutral'}>{status.replace('_', ' ')}</Badge>;
}
