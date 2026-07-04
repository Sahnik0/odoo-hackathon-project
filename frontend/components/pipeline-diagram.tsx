'use client';

import { motion } from 'framer-motion';
import { CalendarCheck, FileText, IndianRupee, UserPlus, Bell, CheckCircle2, Users, Clock } from 'lucide-react';
import { DottedMark } from '@/components/logo';

const SOURCES = [
  { icon: Clock, label: 'Check-in / out', desc: 'Employee action' },
  { icon: CalendarCheck, label: 'Leave request', desc: 'Self-service' },
  { icon: FileText, label: 'Document upload', desc: 'Secure storage' },
  { icon: UserPlus, label: 'Profile update', desc: 'Personal data' },
];

const DESTINATIONS = [
  { icon: Users, label: 'Admin dashboard', desc: 'Live overview' },
  { icon: CheckCircle2, label: 'Approvals', desc: 'One-click action' },
  { icon: IndianRupee, label: 'Payroll', desc: 'Auto-generated' },
  { icon: Bell, label: 'Notifications', desc: 'Real-time alerts' },
];

// ── Layout constants ──
const VB_W = 1100;
const VB_H = 480;
const ROW_CY = [70, 190, 310, 430];
const NODE_H = 48;
const L_EDGE = 250;
const R_EDGE = 850;
const HUB_CX = VB_W / 2;
const HUB_CY = VB_H / 2;
const HUB_R = 42;

function connectorPath(fromX: number, fromY: number, toX: number, toY: number) {
  const dx = toX - fromX;
  return `M ${fromX} ${fromY} C ${fromX + dx * 0.45} ${fromY}, ${toX - dx * 0.45} ${toY}, ${toX} ${toY}`;
}

// Animated dot that loops along a path
function FlowDot({ pathId, delay, duration }: { pathId: string; delay: number; duration: number }) {
  return (
    <motion.circle
      r={3}
      fill="#2b59d1"
      opacity={0}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: [0, 0.8, 0.8, 0] }}
      viewport={{ once: false }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'easeInOut',
      }}
    >
      <animateMotion
        dur={`${duration}s`}
        begin={`${delay}s`}
        repeatCount="indefinite"
        keyPoints="0;1"
        keyTimes="0;1"
        calcMode="spline"
        keySplines="0.42 0 0.58 1"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </motion.circle>
  );
}

function NodeTag({ icon: Icon, label, desc, side }: { icon: React.ElementType; label: string; desc: string; side: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-3 whitespace-nowrap rounded-[16px] border border-line bg-surface px-5 py-3 shadow-ambient transition-all duration-300 hover:shadow-md hover:border-lake-blue/20 ${side === 'right' ? '' : ''}`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-lake-blue/8 text-lake-blue">
        <Icon size={15} strokeWidth={2} />
      </span>
      <div className="flex flex-col">
        <span className="text-[13px] font-medium leading-tight text-off-black">{label}</span>
        <span className="text-[10px] leading-tight text-smoke">{desc}</span>
      </div>
    </div>
  );
}

export function PipelineDiagram() {
  // Pre-compute all path data strings
  const leftPaths = SOURCES.map((_, i) =>
    connectorPath(L_EDGE, ROW_CY[i], HUB_CX - HUB_R, HUB_CY)
  );
  const rightPaths = DESTINATIONS.map((_, i) =>
    connectorPath(HUB_CX + HUB_R, HUB_CY, R_EDGE, ROW_CY[i])
  );

  return (
    <>
      {/* Mobile: simple wrapped pills */}
      <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center gap-3 px-6 py-10 md:hidden">
        {[...SOURCES, ...DESTINATIONS].map((n) => (
          <NodeTag key={n.label} icon={n.icon} label={n.label} desc={n.desc} side="left" />
        ))}
      </div>

      {/* Desktop: full diagram */}
      <div className="mx-auto hidden max-w-[1100px] px-6 py-10 md:block">
        <div className="relative" style={{ aspectRatio: `${VB_W}/${VB_H}` }}>
          {/* SVG connectors + flow dots */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d8d3ce" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#d8d3ce" stopOpacity={1} />
                <stop offset="100%" stopColor="#d8d3ce" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="grad-right" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d8d3ce" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#d8d3ce" stopOpacity={1} />
                <stop offset="100%" stopColor="#d8d3ce" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            {/* Left → Hub connectors */}
            {leftPaths.map((d, i) => (
              <g key={`lg-${i}`}>
                <motion.path
                  id={`left-path-${i}`}
                  d={d}
                  stroke="url(#grad-left)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.12 * i, ease: 'easeInOut' }}
                />
                <FlowDot pathId={`left-path-${i}`} delay={1.2 + i * 0.6} duration={2.2} />
              </g>
            ))}

            {/* Hub → Right connectors */}
            {rightPaths.map((d, i) => (
              <g key={`rg-${i}`}>
                <motion.path
                  id={`right-path-${i}`}
                  d={d}
                  stroke="url(#grad-right)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + 0.12 * i, ease: 'easeInOut' }}
                />
                <FlowDot pathId={`right-path-${i}`} delay={2.4 + i * 0.6} duration={2.2} />
              </g>
            ))}
          </svg>

          {/* Left nodes */}
          {SOURCES.map((s, i) => (
            <motion.div
              key={s.label}
              className="absolute"
              style={{
                right: `${((VB_W - L_EDGE) / VB_W) * 100}%`,
                top: `${((ROW_CY[i] - NODE_H / 2) / VB_H) * 100}%`,
              }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.08 * i }}
            >
              <NodeTag icon={s.icon} label={s.label} desc={s.desc} side="left" />
            </motion.div>
          ))}

          {/* Right nodes */}
          {DESTINATIONS.map((d, i) => (
            <motion.div
              key={d.label}
              className="absolute"
              style={{
                left: `${(R_EDGE / VB_W) * 100}%`,
                top: `${((ROW_CY[i] - NODE_H / 2) / VB_H) * 100}%`,
              }}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.25 + 0.08 * i }}
            >
              <NodeTag icon={d.icon} label={d.label} desc={d.desc} side="right" />
            </motion.div>
          ))}

          {/* Central hub */}
          <motion.div
            className="absolute"
            style={{
              left: `${((HUB_CX - HUB_R) / VB_W) * 100}%`,
              top: `${((HUB_CY - HUB_R) / VB_H) * 100}%`,
              width: `${((HUB_R * 2) / VB_W) * 100}%`,
              aspectRatio: '1',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-[-50%] rounded-full bg-mint/40 blur-2xl"
              animate={{ opacity: [0.3, 0.65, 0.3], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex h-full w-full rotate-45 items-center justify-center rounded-[20px] border border-line bg-surface shadow-ambient">
              <DottedMark size={28} className="-rotate-45 text-off-black" />
            </div>
          </motion.div>

          {/* Hub label */}
          <motion.div
            className="absolute text-center"
            style={{
              left: `${((HUB_CX - 50) / VB_W) * 100}%`,
              top: `${((HUB_CY + HUB_R + 14) / VB_H) * 100}%`,
              width: `${(100 / VB_W) * 100}%`,
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-smoke">
              HRMS Engine
            </span>
          </motion.div>
        </div>
      </div>
    </>
  );
}
