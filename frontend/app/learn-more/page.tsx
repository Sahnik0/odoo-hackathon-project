'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ChevronRight,
  Database,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { RevealGroup, RevealItem } from '@/components/ui/reveal';

const MODULES_DETAIL = [
  {
    icon: Users,
    title: 'Employee Profile',
    badge: 'Core Identity',
    body: 'Centralized directory storing complete personal, employment, and banking details. Features self-service access control allowing employees to update their own contact information while retaining strict admin validation for salary structure, job roles, and documents.',
    features: ['Direct document upload & storage', 'Self-service contact updates', 'Role-restricted edits'],
    color: 'from-sky-blue/20 to-sky-blue/5',
  },
  {
    icon: Clock,
    title: 'Attendance tracking',
    badge: 'Timekeeping',
    body: 'Clean check-in and check-out tracking with zero friction. Supports real-time status tracking, department-based filtering for admins, and history reviews by day, week, or month to keep work logs transparent.',
    features: ['Instant single-action check-in', 'Filtered administrative views', 'Personal history log'],
    color: 'from-gold/20 to-gold/5',
  },
  {
    icon: CalendarCheck,
    title: 'Leave Management',
    badge: 'Balance & Approvals',
    body: 'Apply for paid, sick, or unpaid leave and track individual balances. Automated workflow updates balances immediately upon admin approval, while keeping employees updated with status notifications.',
    features: ['Real-time balance adjustments', 'Admin approval interface', 'Notification alerts'],
    color: 'from-mint/20 to-mint/5',
  },
  {
    icon: IndianRupee,
    title: 'Payroll calculation',
    badge: 'Financial Engine',
    body: 'Salary structure management that calculates and compiles payslips with a single action. Stores balances in paise to eliminate rounding drifts and offers transparent read-only access for employees.',
    features: ['Single-action generation', 'Paise-level precision', 'Read-only digital payslips'],
    color: 'from-coral/20 to-coral/5',
  },
];

export default function LearnMorePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-parchment pb-24">
      {/* Ambient background washes */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-periwinkle-mist/50 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-[var(--page-max-width)] items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 text-graphite hover:text-off-black transition-colors">
              <ArrowLeft size={16} />
              <span className="text-[13px] font-semibold uppercase tracking-tight">Back to home</span>
            </Link>
            <span className="h-4 w-px bg-line" />
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/register">Get started free →</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto max-w-[800px] px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6"
        >
          <span className="inline-block rounded-full bg-lake-blue/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-lake-blue">
            System overview
          </span>
          <h1 className="font-serif text-[44px] font-normal leading-[1.1] tracking-[-0.03em] text-off-black sm:text-[64px]">
            Designed to simplify <br />
            workforce management.
          </h1>
          <p className="max-w-[600px] text-[16px] leading-[1.7] text-graphite sm:text-[18px]">
            Explore the core features, modular design, and robust security architecture built for high-performance team operations.
          </p>
        </motion.div>
      </section>

      {/* Modules Detail Section */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-6 py-8">
        <RevealGroup className="flex flex-col gap-12">
          {MODULES_DETAIL.map((m, index) => (
            <RevealItem key={m.title}>
              <div className="grid grid-cols-1 gap-8 rounded-[24px] border border-line bg-surface p-8 shadow-sm transition-all duration-300 hover:shadow-md md:grid-cols-12 md:p-12">
                {/* Left col: Icon and Title info */}
                <div className="flex flex-col gap-4 md:col-span-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-lake-blue/10 to-periwinkle-mist/50 text-lake-blue shadow-inner">
                    <m.icon size={20} strokeWidth={2} />
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-lake-blue/70">
                      {m.badge}
                    </span>
                    <h3 className="mt-1 font-serif text-[26px] font-normal leading-tight text-off-black">
                      {m.title}
                    </h3>
                  </div>
                </div>

                {/* Right col: Details and bullet points */}
                <div className="flex flex-col justify-between gap-6 md:col-span-8 md:border-l md:border-line md:pl-10">
                  <p className="text-[15px] leading-[1.75] text-graphite">
                    {m.body}
                  </p>
                  
                  <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                    {m.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-[13px] text-off-black">
                        <ChevronRight size={14} className="text-lake-blue" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Architecture / Security Details */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-6 py-20">
        <div className="rounded-[32px] border border-line bg-gradient-to-br from-periwinkle-mist/40 via-surface to-surface p-8 shadow-sm md:p-16">
          <div className="max-w-[640px] mb-12">
            <span className="inline-block rounded-full bg-lake-blue/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-lake-blue">
              Under the Hood
            </span>
            <h2 className="mt-4 font-serif text-[36px] font-normal leading-tight tracking-tight text-off-black sm:text-[44px]">
              Reliable design, secure engineering.
            </h2>
            <p className="mt-4 text-[15px] leading-[1.7] text-graphite">
              Security and data consistency are verified at every layer, ensuring peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex gap-6 rounded-[20px] border border-line/60 bg-surface-raised p-6 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-lake-blue/10 text-lake-blue">
                <Lock size={20} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-[18px] text-off-black">Server-side security</h3>
                <p className="text-[14px] leading-[1.6] text-graphite">
                  No security-by-obscurity. Field-level permissions and organization restrictions are validated directly on the API server. Even if a user alters client code, unauthorized modifications are immediately rejected.
                </p>
              </div>
            </div>

            <div className="flex gap-6 rounded-[20px] border border-line/60 bg-surface-raised p-6 shadow-sm">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-lake-blue/10 text-lake-blue">
                <Database size={20} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-serif text-[18px] text-off-black">Soft deletes & audit logs</h3>
                <p className="text-[14px] leading-[1.6] text-graphite">
                  Critical HR information is protected against accidental loss. Deletions are processed as soft deletes in the database, allowing admins to restore records easily and trace system history when auditing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-6 py-8">
        <div className="rounded-[28px] bg-off-black px-8 py-16 text-center text-parchment shadow-lg md:py-20">
          <div className="mx-auto flex max-w-[600px] flex-col items-center gap-6">
            <h2 className="font-serif text-[32px] font-normal leading-tight tracking-tight text-white sm:text-[44px]">
              Ready to manage your workforce?
            </h2>
            <p className="text-[14px] leading-relaxed text-parchment/70 sm:text-[16px]">
              Set up your organization account in seconds, define department layouts, and invite team members.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button asChild variant="default" size="lg" className="bg-white text-off-black hover:bg-parchment">
                <Link href="/register">Create admin account</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="border-white/20 text-white hover:border-white/40 hover:bg-white/10">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
