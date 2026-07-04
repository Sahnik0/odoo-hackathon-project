import { CalendarCheck, FileText, IndianRupee, UserPlus, Bell, CheckCircle2, Users, Clock } from 'lucide-react';
import { DottedMark } from '@/components/logo';

const SOURCES = [
  { icon: Clock, label: 'Check-in / out' },
  { icon: CalendarCheck, label: 'Leave request' },
  { icon: FileText, label: 'Document upload' },
  { icon: UserPlus, label: 'Profile update' },
];

const DESTINATIONS = [
  { icon: Users, label: 'Admin dashboard' },
  { icon: CheckCircle2, label: 'Approvals' },
  { icon: IndianRupee, label: 'Payroll' },
  { icon: Bell, label: 'Notifications' },
];

// DESIGN.md "Pipeline Node Tag" + central hub glow, repurposed to show the
// actual HRMS data flow (employee actions → the system → admin outcomes)
// instead of Monad's literal security-pipeline diagram (AGENTS.md: DESIGN.md
// is look-only, never copy its content/structure literally).
function NodeTag({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-ash bg-parchment px-5 py-3 text-[14px] uppercase tracking-tight text-off-black">
      <Icon size={14} />
      {label}
    </div>
  );
}

export function PipelineDiagram() {
  return (
    <div className="relative mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-3">
      <div className="flex flex-col items-start gap-4 md:items-end">
        {SOURCES.map((s) => (
          <NodeTag key={s.label} icon={s.icon} label={s.label} />
        ))}
      </div>

      <div className="relative flex items-center justify-center py-10">
        <div className="absolute h-40 w-40 rounded-full bg-mint/40 blur-3xl" />
        <div className="relative flex h-28 w-28 rotate-45 items-center justify-center rounded-3xl border border-ash bg-parchment">
          <DottedMark size={32} className="-rotate-45 text-off-black" />
        </div>
      </div>

      <div className="flex flex-col items-start gap-4">
        {DESTINATIONS.map((d) => (
          <NodeTag key={d.label} icon={d.icon} label={d.label} />
        ))}
      </div>
    </div>
  );
}
