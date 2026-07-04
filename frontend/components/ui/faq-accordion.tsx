'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// DESIGN.md "FAQ Accordion Item" — full-width row, generous vertical padding,
// 1px line bottom border only, serif question, trailing +/× indicator.
// Restyle: the soft Coral→Gold gradient wash now animates in on HOVER (not just
// when open), and the answer expands with a smooth height/opacity transition.
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="group border-b border-line">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="relative flex w-full items-center justify-between gap-6 px-5 py-7 text-left"
              aria-expanded={isOpen}
            >
              {/* Hover / open gradient wash — fades in under the row content. */}
              <span
                aria-hidden
                className={cn(
                  'pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-gold/25 via-coral/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100',
                  isOpen && 'opacity-100',
                )}
              />
              <span className="relative z-10 font-serif text-[22px] font-normal tracking-tight text-off-black transition-colors duration-200 group-hover:text-lake-blue sm:text-[24px]">
                {item.question}
              </span>
              <span
                className={cn(
                  'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ash text-off-black transition-all duration-300 group-hover:border-off-black',
                  isOpen && 'rotate-45 border-off-black bg-off-black text-white',
                )}
              >
                <Plus size={18} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-8 pt-0 text-[16px] leading-relaxed text-graphite">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
