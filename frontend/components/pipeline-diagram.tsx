'use client';

import { useState } from 'react';
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

// Fixed viewBox coordinates
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

interface NodeTagProps {
  icon: React.ElementType;
  label: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function NodeTag({ icon: Icon, label, isHovered, onMouseEnter, onMouseLeave }: NodeTagProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`flex items-center gap-3 whitespace-nowrap rounded-full border px-6 py-3.5 text-[18px] uppercase tracking-tight text-off-black transition-all duration-300 cursor-pointer select-none ${
        isHovered
          ? 'border-lake-blue bg-white shadow-md translate-x-1 scale-[1.02]'
          : 'border-ash bg-parchment hover:border-off-black'
      }`}
    >
      <Icon
        size={18}
        className={`transition-colors duration-300 ${isHovered ? 'text-lake-blue scale-110' : 'text-smoke'}`}
      />
      <span className={`font-mono transition-colors duration-300 ${isHovered ? 'text-off-black font-medium' : 'text-graphite'}`}>
        {label}
      </span>
    </div>
  );
}

export function PipelineDiagram() {
  const [hoveredSource, setHoveredSource] = useState<number | null>(null);
  const [hoveredDest, setHoveredDest] = useState<number | null>(null);

  return (
    <>
      {/* Mobile view */}
      <div className="mx-auto flex max-w-[500px] flex-wrap items-center justify-center gap-3 px-6 py-10 md:hidden">
        {[...SOURCES, ...DESTINATIONS].map((n, idx) => (
          <div
            key={n.label}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-ash bg-parchment px-5 py-3 text-[14px] uppercase tracking-tight text-off-black"
          >
            <n.icon size={12} className="text-lake-blue" />
            {n.label}
          </div>
        ))}
      </div>

      {/* Desktop view */}
      <div className="mx-auto hidden max-w-[1100px] px-6 py-10 md:block">
        <div className="relative" style={{ height: VB_H }}>
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            className="pointer-events-none absolute inset-0 h-full w-full"
            fill="none"
          >
            {/* Left Sources to Hub lines */}
            {SOURCES.map((_, i) => {
              const fromX = LEFT_X + LEFT_W;
              const fromY = ROW_Y[i] + NODE_H / 2;
              const toX = HUB_CX - HUB_R;
              const toY = HUB_CY;
              const pathD = connectorPath(fromX, fromY, toX, toY);
              const isHovered = hoveredSource === i;

              return (
                <g key={`l-group-${i}`}>
                  {/* Background link line */}
                  <path
                    d={pathD}
                    stroke={isHovered ? '#a0b5eb' : '#cecac8'}
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    className="transition-colors duration-300"
                  />
                  {/* Flow packet animation */}
                  <motion.path
                    d={pathD}
                    stroke={isHovered ? 'var(--color-lake-blue)' : 'var(--color-sky-blue)'}
                    strokeWidth={isHovered ? 3.5 : 2}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '10 100', strokeDashoffset: 110 }}
                    animate={{ strokeDashoffset: [110, 0] }}
                    transition={{
                      duration: isHovered ? 1.2 : 3,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: i * 0.25,
                    }}
                  />
                </g>
              );
            })}

            {/* Hub to Right Destinations lines */}
            {DESTINATIONS.map((_, i) => {
              const fromX = HUB_CX + HUB_R;
              const fromY = HUB_CY;
              const toX = RIGHT_X;
              const toY = ROW_Y[i] + NODE_H / 2;
              const pathD = connectorPath(fromX, fromY, toX, toY);
              const isHovered = hoveredDest === i;

              return (
                <g key={`r-group-${i}`}>
                  {/* Background link line */}
                  <path
                    d={pathD}
                    stroke={isHovered ? '#a0b5eb' : '#cecac8'}
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    className="transition-colors duration-300"
                  />
                  {/* Flow packet animation */}
                  <motion.path
                    d={pathD}
                    stroke={isHovered ? 'var(--color-lake-blue)' : 'var(--color-sky-blue)'}
                    strokeWidth={isHovered ? 3.5 : 2}
                    strokeLinecap="round"
                    initial={{ strokeDasharray: '10 100', strokeDashoffset: 110 }}
                    animate={{ strokeDashoffset: [110, 0] }}
                    transition={{
                      duration: isHovered ? 1.2 : 3,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: 0.5 + i * 0.25,
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Left Sources Nodes */}
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
              <NodeTag
                icon={s.icon}
                label={s.label}
                isHovered={hoveredSource === i}
                onMouseEnter={() => setHoveredSource(i)}
                onMouseLeave={() => setHoveredSource(null)}
              />
            </motion.div>
          ))}

          {/* Right Destinations Nodes */}
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
              <NodeTag
                icon={d.icon}
                label={d.label}
                isHovered={hoveredDest === i}
                onMouseEnter={() => setHoveredDest(i)}
                onMouseLeave={() => setHoveredDest(null)}
              />
            </motion.div>
          ))}

          {/* Central Normalization Hub */}
          <motion.div
            className="absolute flex items-center justify-center"
            style={{ left: HUB_CX - HUB_R, top: HUB_CY - HUB_R, width: HUB_R * 2, height: HUB_R * 2 }}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Ambient center pulses */}
            <motion.div
              className="absolute h-full w-full rounded-full bg-mint/45 blur-2xl pointer-events-none"
              animate={{
                scale: [1, 1.25, 1],
                opacity: [0.3, 0.65, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute h-[80%] w-[80%] rounded-full bg-sky-blue/35 blur-xl pointer-events-none"
              animate={{
                scale: [1.15, 0.9, 1.15],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Rotated central card container */}
            <div className="relative flex h-full w-full rotate-45 items-center justify-center rounded-[20px] border border-ash bg-white shadow-md transition-transform duration-300 hover:scale-105">
              <DottedMark size={32} className="-rotate-45 text-off-black" />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}