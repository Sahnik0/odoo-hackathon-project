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
  Linkedin,
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

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <main className="min-h-screen bg-parchment">
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

      <header className="sticky top-0 z-40 border-b border-line/70 bg-parchment/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-6">
          <Logo />
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
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="default" size="sm">
              <Link href="/register">Get started ▸</Link>
            </Button>
          </div>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="bg-radial-accent mx-auto flex max-w-[860px] flex-col items-center gap-7 px-6 pb-6 pt-20 text-center"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] uppercase tracking-tight text-graphite shadow-ambient">
          <span className="h-1.5 w-1.5 rounded-full bg-mint" />
          HR, attendance, leave & payroll — unified
        </span>
        <h1 className="font-serif text-[46px] font-normal leading-[1.05] tracking-[-0.03em] text-off-black sm:text-[76px]">
          Every workday,
          <br />
          perfectly aligned.
        </h1>
        <p className="max-w-[540px] text-[19px] leading-relaxed text-graphite">
          One system for onboarding, attendance, leave and payroll — built so employees and admins always
          know exactly where things stand.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="default" size="lg">
            <Link href="/register">Start free ▸</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </motion.section>

      <PipelineDiagram />

      <section id="how-it-works" className="mx-auto max-w-[1200px] px-6 py-24">
        <div className="max-w-[560px]">
          <span className="text-[12px] uppercase tracking-[0.06em] text-lake-blue">How it works</span>
          <h2 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] text-off-black sm:text-[44px]">
            Four modules, one source of truth
          </h2>
        </div>
        <RevealGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((f) => (
            <RevealItem
              key={f.title}
              className="group flex flex-col gap-4 rounded-[24px] border border-line bg-surface p-7 shadow-ambient transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-off-black/[0.05] text-off-black transition-colors group-hover:bg-off-black group-hover:text-white">
                <f.icon size={19} />
              </span>
              <div>
                <h3 className="font-serif text-[21px] tracking-tight text-off-black">{f.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-graphite">{f.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 gap-0 overflow-hidden rounded-[28px] border border-line bg-periwinkle-mist/70 md:grid-cols-2"
        >
          <div className="flex flex-col justify-center gap-5 p-10 md:p-14">
            <h2 className="font-serif text-[34px] font-normal leading-tight tracking-[-0.03em] text-off-black sm:text-[40px]">
              Everything in one dashboard
            </h2>
            <p className="max-w-[420px] text-[15px] leading-relaxed text-graphite">
              Employees see their profile, attendance and leave balance the moment they log in. Admins get a
              live view across the whole organization — no spreadsheets, no email chains.
            </p>
            <Button asChild variant="default" className="w-fit">
              <Link href="/register">Explore the dashboard ▸</Link>
            </Button>
          </div>
          <RevealGroup className="relative flex flex-col items-start justify-center gap-3 p-10 md:p-14">
            {[
              { t: 'Priya Sharma — checked in at 9:12 AM', d: 'bg-mint' },
              { t: 'Leave request from Arjun — pending review', d: 'bg-gold' },
              { t: 'Payroll generated for Engineering — 42 employees', d: 'bg-lake-blue' },
              { t: 'Document uploaded — awaiting approval', d: 'bg-coral' },
            ].map((line) => (
              <RevealItem
                key={line.t}
                className="flex w-full items-center gap-3 rounded-[14px] border border-line bg-surface/90 px-4 py-3 text-[13px] text-off-black shadow-ambient"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${line.d}`} />
                {line.t}
              </RevealItem>
            ))}
          </RevealGroup>
        </motion.div>
      </section>

      <section id="why-us" className="mx-auto max-w-[1200px] px-6 pb-24">
        <div className="max-w-[560px]">
          <span className="text-[12px] uppercase tracking-[0.06em] text-lake-blue">Why us</span>
          <h2 className="mt-3 font-serif text-[38px] font-normal tracking-[-0.03em] text-off-black sm:text-[44px]">
            Why teams choose this HRMS
          </h2>
        </div>
        <RevealGroup className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {WHY_CHOOSE.map((f) => (
            <RevealItem
              key={f.title}
              className="group relative overflow-hidden rounded-[24px] border border-line bg-surface p-8 shadow-ambient transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-md"
            >
              <div className={`absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br ${f.tone} opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-100`} />
              <div className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-off-black/[0.05] text-off-black">
                  <f.icon size={19} />
                </span>
                <h3 className="mt-4 font-serif text-[22px] tracking-tight text-off-black">{f.title}</h3>
                <p className="mt-1.5 max-w-[440px] text-[14px] leading-relaxed text-graphite">{f.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section id="faq" className="mx-auto max-w-[880px] px-6 pb-24">
        <h2 className="mb-8 font-serif text-[38px] font-normal tracking-[-0.03em] text-off-black sm:text-[44px]">
          Frequently asked
        </h2>
        <FaqAccordion items={FAQ_ITEMS} />
      </section>

      <section className="mx-auto max-w-[1200px] px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-6 py-20 text-center shadow-ambient"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-gold/40 via-coral/10 to-transparent"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="max-w-[560px] font-serif text-[36px] font-normal leading-tight tracking-[-0.03em] text-off-black sm:text-[44px]">
              Every workday, perfectly aligned.
            </h2>
            <p className="max-w-[440px] text-[15px] text-graphite">
              Set up your organization in minutes — seed data, real workflows, no spreadsheets required.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="default" size="lg">
                <Link href="/register">Start free ▸</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/login">Login</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="border-t border-ash">
        <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-8 px-6 py-16 sm:grid-cols-4">
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <Logo />
            <p className="text-[12px] uppercase tracking-tight text-smoke">Follow us on</p>
            <Linkedin size={18} className="text-off-black" />
          </div>
          <FooterColumn
            title="Modules"
            links={[
              { label: 'Employee profile', href: '/register' },
              { label: 'Attendance', href: '/register' },
              { label: 'Leave management', href: '/register' },
              { label: 'Payroll', href: '/register' },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: 'About', href: '#' },
              { label: 'Contact', href: '#' },
            ]}
          />
          <FooterColumn
            title="Account"
            links={[
              { label: 'Login', href: '/login' },
              { label: 'Register', href: '/register' },
            ]}
          />
        </div>
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-8 text-[12px] uppercase text-smoke">
          <span>HRMS © {new Date().getFullYear()}</span>
          <span>Odoo India</span>
        </div>
      </footer>
    </main>
  );
}

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-[12px] uppercase tracking-tight text-smoke">{title}</span>
      {links.map((l) => (
        <Link key={l.label} href={l.href} className="text-[14px] text-off-black hover:text-lake-blue">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
