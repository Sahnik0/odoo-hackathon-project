import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[40px] border border-dashed border-ash px-10 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-periwinkle-mist/60">
        <Icon size={22} className="text-off-black" />
      </div>
      <p className="font-serif text-[24px] font-normal text-off-black">{title}</p>
      {description && <p className="max-w-[420px] text-[14px] text-graphite">{description}</p>}
      {action}
    </div>
  );
}
