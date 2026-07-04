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
    <div className="flex flex-col items-center gap-3 rounded-[20px] border border-dashed border-ash px-10 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-periwinkle-mist/50 ring-1 ring-inset ring-sky-blue/40">
        <Icon size={22} className="text-lake-blue" />
      </div>
      <p className="font-serif text-[22px] font-normal tracking-tight text-off-black">{title}</p>
      {description && <p className="max-w-[420px] text-[14px] leading-relaxed text-graphite">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
