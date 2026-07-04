'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// DESIGN.md "FAQ Accordion Item" — full-width row, 40px vertical padding, 1px
// Ash bottom border only, serif 24px question, trailing chevron. The open row
// gets a soft gradient wash (Coral→Gold) per the reference screenshots.
export function FaqAccordion({ items }: { items: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.question} className="border-b border-ash">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={cn(
                'flex w-full items-center justify-between gap-6 px-4 py-10 text-left transition-colors',
                isOpen && 'bg-gradient-to-r from-gold/25 via-coral/10 to-transparent',
              )}
              aria-expanded={isOpen}
            >
              <span className="font-serif text-[24px] font-normal text-off-black">{item.question}</span>
              <ChevronDown
                size={20}
                className={cn('shrink-0 text-off-black transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && <p className="px-4 pb-8 text-[16px] leading-relaxed text-graphite">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
