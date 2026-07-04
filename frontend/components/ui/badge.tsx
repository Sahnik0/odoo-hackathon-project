import { cn } from '@/lib/utils';

const TONES: Record<string, { chip: string; dot: string }> = {
  neutral: { chip: 'bg-ash/40 text-graphite ring-ash', dot: 'bg-smoke' },
  positive: { chip: 'bg-mint/40 text-off-black ring-mint', dot: 'bg-[#1f9d57]' },
  warning: { chip: 'bg-gold/40 text-off-black ring-gold', dot: 'bg-crimson' },
  negative: { chip: 'bg-coral/30 text-off-black ring-coral', dot: 'bg-coral' },
  info: { chip: 'bg-periwinkle-mist/70 text-off-black ring-sky-blue', dot: 'bg-lake-blue' },
};

// Status tag: 9999px pill per DESIGN.md ("Pipeline Node Tag" / tags radius),
// with a hairline ring and a leading status dot for a crisper, premium read.
export function Badge({
  tone = 'neutral',
  dot = true,
  children,
}: {
  tone?: keyof typeof TONES;
  dot?: boolean;
  children: React.ReactNode;
}) {
  const t = TONES[tone];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-tight ring-1 ring-inset',
        t.chip,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', t.dot)} />}
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
