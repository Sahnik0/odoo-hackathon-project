'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  CalendarCheck,
  IndianRupee,
  ShieldCheck,
  Zap,
  BellRing,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { PipelineDiagram } from '@/components/pipeline-diagram';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { RevealGroup, RevealItem } from '@/components/ui/reveal';

const HOW_IT_WORKS = [
  {
    icon: Users,
    title: 'Employee Profile',
    body: 'Personal details, job details, salary structure and documents in one place — self-service for what you own, admin-controlled for the rest.',
  },
  {
    icon: Clock,
    title: 'Attendance',
    body: 'Check in, check out, and review daily, weekly or monthly views. Admins filter across the whole team by department, date or status.',
  },
  {
    icon: CalendarCheck,
    title: 'Leave Management',
    body: 'Apply for paid, sick or unpaid leave, track balances, and get notified the moment an Admin approves or rejects your request.',
  },
  {
    icon: IndianRupee,
    title: 'Payroll',
    body: 'Transparent, read-only payslips for every employee. Admins manage salary structures and generate payroll with one action.',
  },
];

const WHY_CHOOSE = [
  {
    icon: ShieldCheck,
    tone: 'from-sky-blue/40 to-transparent',
    title: 'Server-side role security',
    body: 'Field-level permissions and ownership checks are enforced in the API, not just hidden in the UI — every request is verified.',
  },
  {
    icon: Zap,
    tone: 'from-gold/40 to-transparent',
    title: 'Instant onboarding',
    body: 'Admins create an account in seconds; employees get an auto-generated login ID and a verification email immediately.',
  },
  {
    icon: BellRing,
    tone: 'from-mint/40 to-transparent',
    title: 'Real-time notifications',
    body: 'Leave approvals, payroll runs and document reviews all trigger a notification — nobody has to go looking for updates.',
  },
  {
    icon: Building2,
    tone: 'from-coral/30 to-transparent',
    title: 'Built for one org, ready to scale',
    body: 'Department-aware filtering, audit-friendly soft deletes, and a clean data model that grows with your headcount.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How do I apply for leave?',
    answer:
      'Go to Leave from your dashboard, pick a type (paid, sick or unpaid), choose your dates and add a reason. Your balance updates automatically once an Admin approves it.',
  },
  {
    question: 'Who can see my profile and documents?',
    answer:
      'Only you and your organization’s Admins. Every field-level edit and document review is enforced on the server, not just hidden in the interface.',
  },
  {
    question: 'How is my payroll calculated?',
    answer:
      'Admins maintain a salary structure (basic, HRA, allowances, deductions) and generate a payslip each cycle. Amounts are stored precisely in paise, so there’s never any rounding drift.',
  },
  {
    question: 'Can I check attendance from anywhere?',
    answer:
      'Yes — check in and out from any device, and review daily, weekly or monthly history any time. Admins get the same views across the whole team.',
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;

      // Make background sticky & colored after scrolling a tiny bit
      if (currentScroll > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Collapsible logic
      if (currentScroll > 120) {
        if (currentScroll > lastScrollY) {
          setIsVisible(false); // Hide on scroll down
        } else {
          setIsVisible(true);  // Show on scroll up
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-parchment">
      {/* Ambient corner washes matching auth pages */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-96 w-96 rounded-full bg-periwinkle-mist/50 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-mint/20 blur-3xl" />

      {announcementOpen && (
        <div className="flex w-full items-center justify-center gap-4 bg-off-black px-4 py-2.5 text-center">
          <p className="text-[13px] text-parchment">
            New: automatic payroll generation and real-time notifications are live.
          </p>
          <Link
            href="/register"
            className="rounded-full border border-parchment/40 px-3 py-1 text-[11px] uppercase tracking-tight text-parchment transition-colors hover:bg-parchment hover:text-off-black"
          >
            Get started
          </Link>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setAnnouncementOpen(false)}
            className="text-parchment"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -80 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
          isScrolled
            ? 'border-line/70 bg-surface/90 backdrop-blur-md shadow-sm'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-20 max-w-[var(--page-max-width)] items-center justify-center gap-8 px-6">
          <Link href="/" className="absolute left-6">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 rounded-full border border-line bg-surface/60 p-1 md:flex">
            {[
              { href: '#how-it-works', label: 'How it works' },
              { href: '#why-us', label: 'Why us' },
              { href: '#faq', label: 'FAQ' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-1.5 text-[13px] font-medium uppercase tracking-tight text-graphite transition-colors hover:bg-off-black/[0.05] hover:text-off-black"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="absolute right-6 flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/register">Get started ▸</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0">
          <motion.div
            className="absolute left-1/4 top-20 h-64 w-64 rounded-full bg-periwinkle-mist/40 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-mint/20 blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto flex max-w-[900px] flex-col items-center gap-8 px-6 pb-20 pt-24 text-center sm:pt-32"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[52px] font-normal leading-[1.05] tracking-[-0.035em] text-off-black sm:text-[84px]"
          >
            Every workday,
            <br />
            perfectly aligned.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-[600px] text-[18px] leading-[1.7] text-graphite sm:text-[20px]"
          >
            One system for onboarding, attendance, leave and payroll — built so employees and admins always
            know exactly where things stand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Button asChild variant="default" size="lg">
              <Link href="/register">Get started free →</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/learn-more">Learn more</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <PipelineDiagram />

      {/* How it Works Section */}
      <section id="how-it-works" className="mx-auto max-w-[var(--page-max-width)] px-6 py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-[600px]"
        >
          <div className="flex items-center gap-3">
            <span className="inline-block rounded-full bg-lake-blue/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-lake-blue">
              How it works
            </span>
            <span className="h-px flex-1 max-w-[48px] bg-lake-blue/20" />
          </div>
          <h2 className="mt-5 font-serif text-[40px] font-normal leading-[1.12] tracking-[-0.03em] text-off-black sm:text-[50px]">
            Four powerful modules
          </h2>
          <p className="mt-4 text-[15px] leading-[1.75] text-graphite">
            Everything you need to manage your workforce in a single unified platform.
          </p>
        </motion.div>

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((f, i) => (
            <RevealItem key={f.title}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative flex h-full flex-col rounded-[20px] border border-line bg-surface shadow-sm transition-all duration-300 hover:border-lake-blue/30 hover:shadow-lg overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-lake-blue/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                {/* Card top: icon + step number */}
                <div className="relative flex items-start justify-between px-7 pt-7 pb-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-gradient-to-br from-lake-blue/10 to-periwinkle-mist/50 text-lake-blue shadow-inner transition-all duration-300 group-hover:from-lake-blue group-hover:to-lake-blue-dark group-hover:text-white group-hover:shadow-md">
                    <f.icon size={20} strokeWidth={2} />
                  </span>
                  <span className="text-[13px] font-semibold tabular-nums text-off-black/20 transition-colors duration-300 group-hover:text-lake-blue/40">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Divider */}
                <div className="mx-7 h-px bg-line/60 transition-colors duration-300 group-hover:bg-lake-blue/15" />

                {/* Card body */}
                <div className="relative flex flex-1 flex-col gap-2 px-7 py-6">
                  <h3 className="font-serif text-[20px] font-normal leading-snug tracking-tight text-off-black">
                    {f.title}
                  </h3>
                  <p className="text-[14px] leading-[1.75] text-graphite">{f.body}</p>
                </div>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Why Choose Section */}
      <section id="why-us" className="mx-auto max-w-[var(--page-max-width)] px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-[640px]"
        >
          <span className="inline-block rounded-full bg-lake-blue/10 px-4 py-1.5 text-[12px] font-medium uppercase tracking-[0.08em] text-lake-blue">
            Why us
          </span>
          <h2 className="mt-6 font-serif text-[42px] font-normal leading-[1.15] tracking-[-0.03em] text-off-black sm:text-[52px]">
            Why teams choose this HRMS
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-graphite">
            Built with security, speed, and scalability at its core — designed for modern teams.
          </p>
        </motion.div>

        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {WHY_CHOOSE.map((f) => (
            <RevealItem key={f.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="group relative h-full overflow-hidden rounded-[28px] border border-line bg-surface p-10 shadow-sm transition-all duration-500 hover:border-lake-blue/20 hover:shadow-xl"
              >
                <motion.div
                  className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${f.tone} blur-3xl`}
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  whileHover={{ scale: 1.2, opacity: 0.8 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-off-black/[0.06] to-off-black/[0.02] text-off-black shadow-inner transition-all duration-500 group-hover:from-lake-blue group-hover:to-lake-blue-dark group-hover:text-white group-hover:shadow-lg group-hover:shadow-lake-blue/20">
                    <f.icon size={26} strokeWidth={2} />
                  </div>

                  <h3 className="mb-3 font-serif text-[26px] font-normal leading-tight tracking-tight text-off-black">
                    {f.title}
                  </h3>
                  <p className="text-[15px] leading-[1.75] text-graphite">{f.body}</p>
                </div>

                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-lake-blue to-transparent transition-all duration-500 group-hover:w-full" />
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="mx-auto max-w-[880px] px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="mb-12 font-serif text-[42px] font-normal tracking-[-0.03em] text-off-black sm:text-[52px]">
            Frequently asked
          </h2>
        </motion.div>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      {/* Final CTA Section */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[32px] border border-line bg-gradient-to-br from-surface via-white to-surface px-8 py-24 text-center shadow-xl sm:px-12"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-gold/30 via-coral/10 to-periwinkle-mist/20"
            animate={{
              opacity: [0.6, 0.9, 0.6],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-[640px] font-serif text-[40px] font-normal leading-[1.2] tracking-[-0.03em] text-off-black sm:text-[52px]"
            >
              Every workday, perfectly aligned.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-[500px] text-[16px] leading-relaxed text-graphite"
            >
              Set up your organization in minutes — seed data, real workflows, no spreadsheets required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              <Button asChild variant="default" size="lg">
                <Link href="/register">Start free ▸</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <footer className="relative border-t border-line/50 bg-surface/30 backdrop-blur-sm">
        <div className="mx-auto max-w-[var(--page-max-width)] px-6 py-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-6">
              <Logo />
              <p className="max-w-[280px] text-[14px] leading-relaxed text-graphite">
                Every workday, perfectly aligned. Modern HR management for growing teams.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-[18px] font-normal text-off-black">Modules</h3>
              <div className="flex flex-col gap-3">
                <Link href="/register" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Employee profile
                </Link>
                <Link href="/register" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Attendance
                </Link>
                <Link href="/register" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Leave management
                </Link>
                <Link href="/register" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Payroll
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-[18px] font-normal text-off-black">Company</h3>
              <div className="flex flex-col gap-3">
                <Link href="#" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  About
                </Link>
                <Link href="#" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Contact
                </Link>
                <Link href="#" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Careers
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-serif text-[18px] font-normal text-off-black">Account</h3>
              <div className="flex flex-col gap-3">
                <Link href="/login" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Login
                </Link>
                <Link href="/register" className="text-[14px] text-graphite transition-colors hover:text-off-black">
                  Register
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-line/50 pt-8 sm:flex-row">
            <p className="text-[13px] text-smoke">© {new Date().getFullYear()} HRMS. All rights reserved.</p>
            <p className="text-[13px] text-smoke">Built with care by Odoo India</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
