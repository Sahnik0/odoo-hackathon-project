import { Button } from '@/components/ui/button';
import type { ApiMeta } from '@/types/api';

export function Pagination({ meta, onPageChange }: { meta: ApiMeta; onPageChange: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between border-t border-line pt-5 text-[13px] text-graphite">
      <span>
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </span>
      <div className="flex gap-2">
        <Button variant="subtle" size="sm" disabled={meta.page <= 1} onClick={() => onPageChange(meta.page - 1)}>
          Previous
        </Button>
        <Button
          variant="subtle"
          size="sm"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
