import type { ReactNode } from 'react';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[40px] border border-dashed border-ash px-10 py-16 text-center">
      <p className="font-serif text-[24px] font-normal text-off-black">{title}</p>
      {description && <p className="max-w-[420px] text-[14px] text-graphite">{description}</p>}
      {action}
    </div>
  );
}
