'use client';

import { motion } from 'framer-motion';
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

// Fixed viewBox coordinates so the SVG connector paths line up exactly with
// the absolutely-positioned pill nodes — avoids a DOM-measurement pass.
const VB_W = 1100;
const VB_H = 460;
const ROW_Y = [40, 160, 280, 400];
const NODE_H = 44;
const LEFT_X = 40;
const LEFT_W = 230;
const RIGHT_X = 830;
const RIGHT_W = 230;
const HUB_CX = VB_W / 2;
const HUB_CY = VB_H / 2;
const HUB_R = 46;

function connectorPath(fromX: number, fromY: number, toX: number, toY: number) {
  const midX = (fromX + toX) / 2;
  return `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;
}

// DESIGN.md "Pipeline Node Tag" + curved connectors + central hub glow,
// repurposed to show the actual HRMS data flow (employee actions → the
// system → admin outcomes) instead of Monad's literal security-pipeline
// diagram (AGENTS.md: DESIGN.md is look-only, never copy its content).
function NodeTag({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-ash bg-parchment px-5 py-3 text-[14px] uppercase tracking-tight text-off-black shadow-[0_0_0_1px_rgba(0,0,0,0)] transition-shadow hover:shadow-[0_0_10px_rgba(0,0,0,0.08)]">
      <Icon size={14} />
      {label}
    </div>
  );
}

export function PipelineDiagram() {
  return (
    <>
      <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center gap-3 px-6 py-10 md:hidden">
        {[...SOURCES, ...DESTINATIONS].map((n) => (
          <NodeTag key={n.label} icon={n.icon} label={n.label} />
        ))}
      </div>
      <div className="mx-auto hidden max-w-[1100px] px-6 py-10 md:block">
        <div className="relative" style={{ height: VB_H }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="pointer-events-none absolute inset-0 h-full w-full"
          fill="none"
        >
          {SOURCES.map((_, i) => (
            <motion.path
              key={`l-${i}`}
              d={connectorPath(LEFT_X + LEFT_W, ROW_Y[i] + NODE_H / 2, HUB_CX - HUB_R, HUB_CY)}
              stroke="#cecac8"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 * i, ease: 'easeInOut' }}
            />
          ))}
          {DESTINATIONS.map((_, i) => (
            <motion.path
              key={`r-${i}`}
              d={connectorPath(HUB_CX + HUB_R, HUB_CY, RIGHT_X, ROW_Y[i] + NODE_H / 2)}
              stroke="#cecac8"
              strokeWidth={1.5}
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.35 + 0.15 * i, ease: 'easeInOut' }}
            />
          ))}
        </svg>

        {SOURCES.map((s, i) => (
          <motion.div
            key={s.label}
            className="absolute"
            style={{ left: LEFT_X, top: ROW_Y[i], width: LEFT_W }}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          >
            <NodeTag icon={s.icon} label={s.label} />
          </motion.div>
        ))}

        {DESTINATIONS.map((d, i) => (
          <motion.div
            key={d.label}
            className="absolute"
            style={{ left: RIGHT_X, top: ROW_Y[i], width: RIGHT_W }}
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + 0.1 * i }}
          >
            <NodeTag icon={d.icon} label={d.label} />
          </motion.div>
        ))}

        <motion.div
          className="absolute flex items-center justify-center"
          style={{ left: HUB_CX - HUB_R, top: HUB_CY - HUB_R, width: HUB_R * 2, height: HUB_R * 2 }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            className="absolute h-full w-full rounded-full bg-mint/50 blur-2xl"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex h-full w-full rotate-45 items-center justify-center rounded-3xl border border-ash bg-parchment">
            <DottedMark size={32} className="-rotate-45 text-off-black" />
          </div>
        </motion.div>
        </div>
      </div>
    </>
  );
}
