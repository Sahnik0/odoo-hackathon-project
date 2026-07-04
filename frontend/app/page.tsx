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
  UserPlus,
  Settings,
  TrendingUp,
  Workflow,
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { PipelineDiagram } from '@/components/pipeline-diagram';
import { FaqAccordion } from '@/components/ui/faq-accordion';
import { RevealGroup, RevealItem } from '@/components/ui/reveal';

// Integration marquee nodes data
const INTEGRATIONS_ROW = [
  { name: 'Azure Active Directory', bg: '#e8f0fe' },
  { name: 'AWS CloudTrail', bg: '#fef3e8' },
  { name: 'Okta Directory Sync', bg: '#edf2fe' },
  { name: 'Github Teams', bg: '#f1f1f1' },
  { name: 'Google Cloud IAM', bg: '#fcf0ed' },
  { name: 'Splunk Alerts', bg: '#f6fbf7' },
  { name: 'Tines Workflows', bg: '#fef1f8' },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [announcementOpen, setAnnouncementOpen] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let prevScroll = window.scrollY;

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setIsScrolled(currentScroll > 20);

      if (currentScroll > 120) {
        setIsVisible(currentScroll < prevScroll);
      } else {
        setIsVisible(true);
      }

      prevScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  return (
    <main className="relative min-h-screen overflow-hidden bg-parchment selection:bg-lake-blue selection:text-white">
      {/* Decorative Atmosphere Wash (Coral -> Sky Blue) */}
      <div className="pointer-events-none absolute -left-48 top-16 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-coral/25 to-sky-blue/30 blur-[100px] mix-blend-multiply opacity-70" />
      <div className="pointer-events-none absolute -right-48 top-[600px] h-[600px] w-[600px] rounded-full bg-gradient-to-br from-mint/20 to-gold/25 blur-[120px] mix-blend-multiply opacity-60" />

      {/* Navigation Header */}
      <motion.header
        animate={{ y: isVisible ? 0 : '-100%' }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? 'bg-parchment/90 backdrop-blur-md border-b border-ash/70'
            : 'bg-transparent'
        }`}
      >
        {announcementOpen && (
          <div className="flex h-10 w-full items-center justify-between bg-black px-6 text-white font-mono text-[12px] uppercase tracking-tight">
            <div className="flex-1 text-center">
              <span>New: automatic payroll generation and directory syncing are live.</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/register'}
                className="font-mono rounded-full border border-white px-3 py-0.5 text-[11px] uppercase tracking-tight text-white hover:bg-white hover:text-black transition-colors"
              >
                {user ? 'Dashboard' : 'Get Started'}
              </Link>
              <button
                type="button"
                aria-label="Dismiss announcement"
                onClick={() => setAnnouncementOpen(false)}
                className="text-white hover:text-smoke transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="mx-auto flex h-20 max-w-[var(--page-max-width)] items-center justify-center px-10 relative">
          <Link href="/" className="absolute left-10 flex items-center gap-2">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-16 md:flex">
            {[
              { href: '#how-it-works', label: 'How it works' },
              { href: '#features', label: 'Features' },
              { href: '#why-us', label: 'Why us' },
              { href: '#faq', label: 'FAQ' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[18px] font-medium uppercase tracking-tight text-graphite transition-colors hover:text-off-black"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="absolute right-10 flex items-center gap-4">
            {user ? (
              <Button asChild variant="primary" size="sm">
                <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="inline-flex items-center gap-1.5">
                  <span>Dashboard</span>
                  <span className="text-[10px] leading-none translate-y-[-0.5px] select-none">▸</span>
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login" className="inline-flex items-center justify-center">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button asChild variant="primary" size="sm">
                  <Link href="/register" className="inline-flex items-center gap-1.5">
                    <span>Get started free</span>
                    <span className="text-[10px] leading-none translate-y-[-0.5px] select-none">▸</span>
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      {/* Spacer for fixed header */}
      <div className={announcementOpen ? 'h-[120px]' : 'h-20'} />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="mx-auto max-w-[var(--page-max-width)] px-10">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-[54px] sm:text-[80px] md:text-[96px] font-normal leading-[1.05] tracking-[-0.025em] text-off-black max-w-[1000px]"
            >
              Every workday,
              <br />
              perfectly aligned.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-14 max-w-[640px] font-mono text-[16px] leading-[1.45] tracking-[-0.015em] text-graphite sm:text-[18px]"
            >
              One cohesive environment for identity provisioning, attendance logs, leave structures, and payroll ledger.
              Typeset cleanly, compiled type-safely.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-10"
            >
              <Button asChild variant="default" size="lg" className="h-12 px-8 text-[15px] font-mono uppercase tracking-tight gap-2">
                <Link href={user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/register'}>
                  {user ? 'Go to Dashboard' : 'Get Started Free'}
                  <span className="text-[12px] translate-y-[-0.5px]">▸</span>
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Diagram Section */}
      <section className="border-b border-ash bg-white/10 py-28 md:py-36">
        <div className="mx-auto max-w-[var(--page-max-width)] px-10">
          <div className="text-center mb-12">
            <span className="font-mono text-[18px] font-medium uppercase tracking-tight text-smoke">Core System Synchronization flow</span>
          </div>
          <PipelineDiagram />
        </div>
      </section>



      {/* The 3-Column Premium Features Grid (Image 1 replica) */}
      <section id="features" className="mx-auto max-w-[var(--page-max-width)] px-10 py-28 border-b border-ash">
        <div className="mb-20 max-w-[700px]">
          <span className="font-mono text-[12px] uppercase tracking-tight text-lake-blue border border-lake-blue/20 rounded-full px-3 py-1 bg-lake-blue/5">
            System Capabilities
          </span>
          <h2 className="mt-6 font-serif text-[40px] font-normal leading-[1.15] tracking-[-0.02em] text-off-black sm:text-[48px]">
            Engineered details. Zero boilerplate.
          </h2>
          <p className="mt-4 font-mono text-[15px] leading-relaxed text-graphite">
            We replaced messy spreadsheets and clunky interfaces with direct pipelines and automated schema engines.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Left Column (Tall Card) - Managed HR Pipelines */}
          <div className="lg:col-span-2 flex">
            <div className="flex flex-col justify-between w-full rounded-[40px] border border-ash bg-white/40 p-10 hover:border-off-black transition-colors duration-300">
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lake-blue mb-6">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                <h3 className="font-serif text-[24px] font-normal leading-tight text-off-black mb-4">
                  Managed HR Pipelines
                </h3>
                <p className="font-mono text-[15px] leading-relaxed text-graphite mb-10">
                  Provision nodes in minutes. No custom adapters, no engineering overhead. Your direct ledger is live instantly.
                </p>
              </div>

              {/* Premium Flow Diagram Graphic */}
              <div className="relative border border-ash bg-white/60 rounded-3xl p-6 overflow-hidden flex flex-col gap-6 items-center">
                {/* Connection lines */}
                <div className="absolute top-[35px] bottom-[35px] w-px bg-dashed bg-ash" style={{ backgroundImage: 'linear-gradient(to bottom, #cecac8 50%, rgba(255,255,255,0) 0%)', backgroundSize: '1px 8px', backgroundRepeat: 'y' }} />

                {/* Node 1 */}
                <div className="relative z-10 flex items-center gap-3 bg-white border border-ash rounded-full px-4 py-2 text-[12px] font-mono uppercase text-off-black shadow-sm w-full max-w-[200px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-periwinkle-mist text-lake-blue"><UserPlus size={10} /></span>
                  <span>New Hire Form</span>
                </div>

                {/* Always badge 1 */}
                <div className="relative z-10 bg-white border border-lake-blue text-lake-blue font-mono text-[9px] uppercase px-3 py-0.5 rounded-full">
                  Always
                </div>

                {/* Node 2 */}
                <div className="relative z-10 flex items-center gap-3 bg-white border border-ash rounded-full px-4 py-2 text-[12px] font-mono uppercase text-off-black shadow-sm w-full max-w-[200px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/30 text-crimson"><Settings size={10} /></span>
                  <span>Assign Role</span>
                </div>

                {/* Always badge 2 */}
                <div className="relative z-10 bg-white border border-lake-blue text-lake-blue font-mono text-[9px] uppercase px-3 py-0.5 rounded-full">
                  Always
                </div>

                {/* Node 3 */}
                <div className="relative z-10 flex items-center gap-3 bg-white border border-ash rounded-full px-4 py-2 text-[12px] font-mono uppercase text-off-black shadow-sm w-full max-w-[200px]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint text-off-black"><IndianRupee size={10} /></span>
                  <span>Build Payroll</span>
                </div>

                {/* Fork section (OR line) */}
                <div className="relative z-10 bg-white border border-lake-blue text-lake-blue font-mono text-[9px] uppercase px-3 py-0.5 rounded-full">
                  OR
                </div>

                {/* Dual output nodes */}
                <div className="flex gap-4 w-full justify-center">
                  <div className="relative z-10 flex items-center gap-2 bg-white border border-ash rounded-full px-3 py-1.5 text-[10px] font-mono uppercase text-off-black shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-mint" />
                    <span>Slack Sync</span>
                  </div>
                  <div className="relative z-10 flex items-center gap-2 bg-white border border-ash rounded-full px-3 py-1.5 text-[10px] font-mono uppercase text-off-black shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-sky-blue" />
                    <span>Bank Ledger</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (3 Stacked Cards) */}
          <div className="lg:col-span-3 flex flex-col gap-8">
            {/* Card 1: In-flight Data Transforms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-[40px] border border-ash bg-white/40 p-10 hover:border-off-black transition-colors duration-300">
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lake-blue mb-4">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  <path d="M2 12h20" />
                </svg>
                <h3 className="font-serif text-[24px] font-normal leading-tight text-off-black mb-3">
                  In-flight Data Transforms
                </h3>
                <p className="font-mono text-[14px] leading-relaxed text-graphite">
                  Discard discrepancies before they contaminate your logs. Automated transforms trim up to 70% of manual calculation drift, locking records safely.
                </p>
              </div>

              {/* Premium Rotating Geometric SVG */}
              <div className="relative h-44 w-full flex items-center justify-center overflow-hidden">
                <motion.div
                  className="absolute h-36 w-36 rounded-full bg-coral/10 blur-xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Outer decorative dashed orbit */}
                <motion.svg
                  viewBox="0 0 100 100"
                  className="absolute h-40 w-40 text-ash"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                >
                  <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                </motion.svg>
                {/* Rotated background hexagon */}
                <motion.div
                  className="absolute w-24 h-24 bg-gradient-to-br from-coral/80 via-sky-blue/70 to-mint/80 rounded-2xl opacity-60"
                  style={{ clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                />
                {/* Center target circle */}
                <div className="absolute w-12 h-12 rounded-full border border-black/25 bg-white/95 flex items-center justify-center shadow-md">
                  <div className="w-6 h-6 rounded-full border border-dashed border-lake-blue animate-spin" style={{ animationDuration: '6s' }} />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-lake-blue" />
                </div>
                {/* Orbits */}
                <div className="absolute top-8 left-12 w-3.5 h-3.5 rounded-full bg-gold border border-black/10 shadow-sm animate-bounce" />
                <div className="absolute bottom-6 right-16 w-3 h-3 rounded-full bg-sky-blue border border-black/10 shadow-sm animate-pulse" />
              </div>
            </div>

            {/* Card 2: Rule-Based Data Routing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-[40px] border border-ash bg-white/40 p-10 hover:border-off-black transition-colors duration-300">
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lake-blue mb-4">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 17v-5h6v5" />
                  <path d="M9 12h6" />
                  <path d="M12 7v5" />
                </svg>
                <h3 className="font-serif text-[24px] font-normal leading-tight text-off-black mb-3">
                  Rule-Based Access Routing
                </h3>
                <p className="font-mono text-[14px] leading-relaxed text-graphite">
                  Intelligent condition sets process logs selectively. Dispatch routine attendance automatically, while routing payroll increments straight to executive desks.
                </p>
              </div>

              {/* Rules Mockup UI */}
              <div className="border border-ash bg-white/70 rounded-2xl p-5 flex flex-col gap-4 font-mono text-[11px] shadow-sm overflow-hidden">
                <div className="flex justify-between items-center pb-2 border-b border-ash">
                  <span className="font-bold uppercase text-off-black">Routing Policies</span>
                  <div className="flex gap-1.5">
                    <span className="border border-lake-blue text-lake-blue px-2 py-0.5 rounded text-[8px] uppercase font-bold">AND</span>
                    <span className="border border-ash text-smoke px-2 py-0.5 rounded text-[8px] uppercase">OR</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {/* Rule 1 */}
                  <div className="bg-white border border-ash rounded-lg p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-smoke text-[9px] uppercase">
                      <span>Condition 1</span>
                      <span className="text-lake-blue">Match</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-parchment text-off-black px-1.5 py-0.5 rounded text-[10px]">leave_type</span>
                      <span className="text-smoke">has value:</span>
                      <span className="bg-periwinkle-mist/40 text-lake-blue px-1.5 py-0.5 rounded text-[10px]">Paid</span>
                    </div>
                  </div>

                  {/* Rule 2 */}
                  <div className="bg-white border border-ash rounded-lg p-2.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-smoke text-[9px] uppercase">
                      <span>Condition 2</span>
                      <span className="text-lake-blue">Match</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-parchment text-off-black px-1.5 py-0.5 rounded text-[10px]">department</span>
                      <span className="text-smoke">has value:</span>
                      <span className="bg-mint/40 text-off-black px-1.5 py-0.5 rounded text-[10px]">Engineering</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Deploy Your Way */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-[40px] border border-ash bg-white/40 p-10 hover:border-off-black transition-colors duration-300">
              <div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-lake-blue mb-4">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <path d="M3.27 6.96L12 12.01l8.73-5.05" />
                  <path d="M12 22.08V12" />
                </svg>
                <h3 className="font-serif text-[24px] font-normal leading-tight text-off-black mb-3">
                  Deploy Your Way
                </h3>
                <p className="font-mono text-[14px] leading-relaxed text-graphite">
                  Run it wherever aligns best with your audit directives. Fully hosted Cloud SaaS, containerized Hybrid gateway, or air-gapped On-Premises.
                </p>
              </div>

              {/* Overlapping Index Cards SVG Representation */}
              <div className="relative h-44 w-full flex items-center justify-center">
                {/* Card 3 (On-Premises) - Back */}
                <div className="absolute w-[160px] h-[100px] border border-ash bg-white/80 rounded-xl p-3 flex flex-col justify-between shadow-sm transform -rotate-6 translate-x-[-25px] translate-y-[-15px]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-tight text-smoke">On-Premises</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  </div>
                  <span className="font-serif text-[12px] text-graphite">Air-gapped</span>
                </div>

                {/* Card 2 (Hybrid) - Middle */}
                <div className="absolute w-[160px] h-[100px] border border-ash bg-white/95 rounded-xl p-3 flex flex-col justify-between shadow-md transform rotate-3 translate-x-[20px] translate-y-[-5px]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-tight text-smoke">Hybrid Edge</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-blue" />
                  </div>
                  <span className="font-serif text-[12px] text-graphite">Local Ledger</span>
                </div>

                {/* Card 1 (SaaS) - Front */}
                <div className="absolute w-[160px] h-[100px] border border-off-black bg-white rounded-xl p-3 flex flex-col justify-between shadow-lg transform -rotate-3 translate-x-[-10px] translate-y-[20px]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] uppercase tracking-tight text-off-black font-semibold">Cloud SaaS</span>
                    <span className="w-2 h-2 rounded-full bg-lake-blue animate-pulse" />
                  </div>
                  <span className="font-serif text-[13px] text-off-black">Instant Sandbox</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* How it Works Module Section */}
      <section id="how-it-works" className="mx-auto max-w-[var(--page-max-width)] px-10 py-28 border-b border-ash">
        <div className="mb-20 max-w-[700px]">
          <span className="font-mono text-[12px] uppercase tracking-tight text-lake-blue border border-lake-blue/20 rounded-full px-3 py-1 bg-lake-blue/5">
            Module Architecture
          </span>
          <h2 className="mt-6 font-serif text-[40px] font-normal leading-[1.15] tracking-[-0.02em] text-off-black sm:text-[48px]">
            Four core domains. Single source of truth.
          </h2>
          <p className="mt-4 font-mono text-[15px] leading-relaxed text-graphite">
            Modules operate asynchronously, feeding metadata directly into your central accounting database.
          </p>
        </div>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Users,
              step: '01',
              title: 'Employee Ledger',
              body: 'Centralized metadata store containing profile scopes, compensation details, and verified documents. Fully audited edits.',
            },
            {
              icon: Clock,
              step: '02',
              title: 'Attendance Clock',
              body: 'Self-service entry stamps with automatic IP and location tags. Real-time logging of shifts and breaks.',
            },
            {
              icon: CalendarCheck,
              step: '03',
              title: 'Leave Registry',
              body: 'Structured quota calculations (Earned, Medical, Unpaid) linked directly to payroll calendars.',
            },
            {
              icon: IndianRupee,
              step: '04',
              title: 'Payroll Calculator',
              body: 'Direct transaction compiling with precise decimal logic. PDF payslip generation and tax report summaries.',
            },
          ].map((f, i) => (
            <RevealItem key={f.title} className="h-full">
              <div className="group relative flex h-full flex-col rounded-[40px] border border-ash bg-white/30 p-10 hover:bg-white/60 hover:border-off-black transition-all duration-300">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-periwinkle-mist/40 text-lake-blue group-hover:bg-lake-blue group-hover:text-white transition-colors duration-300">
                    <f.icon size={22} strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[14px] font-semibold text-smoke/50 group-hover:text-lake-blue/40 transition-colors duration-300">
                    {f.step}
                  </span>
                </div>
                <h3 className="font-serif text-[22px] font-normal leading-tight text-off-black mb-3">
                  {f.title}
                </h3>
                <p className="font-mono text-[14px] leading-relaxed text-graphite">
                  {f.body}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      {/* Why Teams Choose Monad Section (Image 2 replica) */}
      <section id="why-us" className="mx-auto max-w-[var(--page-max-width)] px-10 py-28 border-b border-ash">
        <div className="mb-20 max-w-[700px]">
          <span className="font-mono text-[12px] uppercase tracking-tight text-lake-blue border border-lake-blue/20 rounded-full px-3 py-1 bg-lake-blue/5">
            Operational Values
          </span>
          <h2 className="mt-6 font-serif text-[40px] font-normal leading-[1.15] tracking-[-0.02em] text-off-black sm:text-[48px]">
            Why teams choose Monad HRMS
          </h2>
          <p className="mt-4 font-mono text-[15px] leading-relaxed text-graphite">
            Built under technical-manual constraints, emphasizing durability, performance, and clear auditing logs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              icon: ShieldCheck,
              gradient: 'from-sky-blue/20 to-transparent',
              title: 'Operational Efficiency at Every Step',
              body: 'Auto-synced leave registers and clock cards eliminate redundant double-entry. Save admin cycles and prevent human calculation errors.',
            },
            {
              icon: Zap,
              gradient: 'from-gold/20 to-transparent',
              title: 'Onboard in Minutes',
              body: 'Seed your entire organization registry instantly. Upload staff spreadsheets, sync departments, and check in your first employee before your coffee gets cold.',
            },
            {
              icon: Workflow,
              gradient: 'from-mint/20 to-transparent',
              title: 'Developer-Friendly Architecture',
              body: 'Fully documented REST endpoints. Type-safe schemas and webhooks let you integrate custom messaging alerts, Active Directory, or payroll relays.',
            },
            {
              icon: TrendingUp,
              gradient: 'from-coral/20 to-transparent',
              title: 'Scalability on Demand',
              body: 'Optimized index queries and clear database constraints support heavy transactional load. Track payroll registers for ten or ten thousand with identical speed.',
            },
          ].map((c) => (
            <div key={c.title} className="group relative overflow-hidden rounded-[40px] border border-ash bg-white/40 p-10 hover:border-off-black transition-all duration-300">
              {/* Soft decorative gradient wash inside card */}
              <div className={`absolute -right-20 -top-20 h-60 w-60 rounded-full bg-gradient-to-br ${c.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative z-10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-off-black/[0.04] text-off-black group-hover:bg-off-black group-hover:text-white transition-colors duration-300">
                  <c.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-[24px] font-normal leading-tight text-off-black mb-3">
                  {c.title}
                </h3>
                <p className="font-mono text-[14px] leading-relaxed text-graphite">
                  {c.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connect Everything callout section (Image 3 replica) */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-10 py-28 border-b border-ash">
        <div className="relative rounded-[40px] border border-ash bg-gradient-to-br from-periwinkle-mist/40 via-sky-blue/20 to-transparent p-12 md:p-16 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Subtle background wash */}
          <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-gradient-to-l from-white/30 to-transparent blur-2xl pointer-events-none" />

          <div>
            <h2 className="font-serif text-[38px] font-normal leading-tight text-off-black sm:text-[46px] mb-4">
              Connect Everything, Effortlessly
            </h2>
            <p className="font-mono text-[14px] leading-relaxed text-graphite mb-8 max-w-[480px]">
              Provision connectors in minutes, not months. No specialized systems integration consultants. No custom parsers. Zero engineering drag. Deploy and sync.
            </p>
            <Button asChild variant="default" size="default">
              <Link href={user ? (user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/register'}>
                {user ? 'Go to Dashboard' : 'Explore Integrations'}
              </Link>
            </Button>
          </div>

          {/* Premium Animated Integrations Marquee Column */}
          <div className="relative h-60 w-full overflow-hidden flex flex-col justify-center">
            {/* Infinite vertical scroll simulation */}
            <div className="flex flex-col gap-3.5 items-end transform -rotate-12 translate-y-[-20px]">
              <motion.div
                className="flex flex-col gap-3.5"
                animate={{ y: [0, -320] }}
                transition={{
                  repeat: Infinity,
                  duration: 18,
                  ease: 'linear',
                }}
              >
                {[...INTEGRATIONS_ROW, ...INTEGRATIONS_ROW].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white border border-ash rounded-full px-5 py-2.5 shadow-sm min-w-[280px]"
                    style={{ borderRightWidth: '3px', borderRightColor: '#2b59d1' }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-lake-blue shrink-0" />
                    <span className="font-mono text-[12px] text-off-black uppercase tracking-tight whitespace-nowrap">
                      {item.name}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Mask gradients to fade edges */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="mx-auto max-w-[900px] px-10 py-28">
        <div className="text-center mb-16">
          <span className="font-mono text-[12px] uppercase tracking-tight text-smoke">Faq</span>
          <h2 className="mt-4 font-serif text-[40px] font-normal tracking-[-0.02em] text-off-black">
            Frequently asked questions
          </h2>
        </div>

        <FaqAccordion
          items={[
            {
              question: 'How does role-based access validation work?',
              answer: 'Access controls are validated at the API database level, not just hidden in the frontend client. Every request checks session authorization tags against requested resource schemas before dispatch.',
            },
            {
              question: 'Can employee records be exported securely?',
              answer: 'Yes. Organization admins can generate audited ledger exports in standard spreadsheet, CSV, or structured JSON formats at any point via the tools settings panel.',
            },
            {
              question: 'How is payroll calculation precision handled?',
              answer: 'Compilations are computed using integer base logic in basic denominations (paise/cents) to eliminate float rounding errors, guaranteeing perfect alignment down to the cent.',
            },
            {
              question: 'What is the implementation timeline?',
              answer: 'Zero implementation consultants needed. Organizations deploy immediately by defining active nodes. Seed default templates, populate staff registers, and start tracking workdays instantly.',
            },
          ]}
        />
      </section>

      {/* Final Call To Action (CTA) */}
      <section className="mx-auto max-w-[var(--page-max-width)] px-10 pb-28">
        <div className="relative rounded-[40px] border border-ash bg-gradient-to-b from-white/40 to-transparent p-12 md:p-20 text-center overflow-hidden">
          {/* Subtle glow wash */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-coral/5 to-periwinkle-mist/10 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="font-serif text-[38px] font-normal leading-tight text-off-black sm:text-[50px] max-w-[680px]">
              Every workday, perfectly aligned.
            </h2>
            <p className="mt-6 font-mono text-[15px] leading-relaxed text-graphite max-w-[500px]">
              Configure your organization gateway in seconds. Real-time auditing ledger, zero spreadsheets.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {user ? (
                <Button asChild variant="primary" size="lg">
                  <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}>Go to Dashboard ▸</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="primary" size="lg">
                    <Link href="/register">Register free ▸</Link>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <Link href="/login">Login to registry</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ash bg-white/20">
        <div className="mx-auto max-w-[var(--page-max-width)] px-10 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 font-mono text-[13px]">
            <div className="flex flex-col gap-6">
              <Logo />
              <p className="text-graphite leading-relaxed">
                Every workday, perfectly aligned.<br />
                Technical grade organization synchronization.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-bold text-off-black uppercase text-[12px] tracking-tight">Capabilities</span>
              <div className="flex flex-col gap-2.5">
                <Link href="/register" className="text-graphite hover:text-off-black transition-colors">Employee Ledger</Link>
                <Link href="/register" className="text-graphite hover:text-off-black transition-colors">Attendance Clock</Link>
                <Link href="/register" className="text-graphite hover:text-off-black transition-colors">Leave Registry</Link>
                <Link href="/register" className="text-graphite hover:text-off-black transition-colors">Payroll calculator</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-bold text-off-black uppercase text-[12px] tracking-tight">Deployments</span>
              <div className="flex flex-col gap-2.5">
                <Link href="#" className="text-graphite hover:text-off-black transition-colors">Cloud SaaS</Link>
                <Link href="#" className="text-graphite hover:text-off-black transition-colors">Hybrid Edge</Link>
                <Link href="#" className="text-graphite hover:text-off-black transition-colors">On-Premises</Link>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-bold text-off-black uppercase text-[12px] tracking-tight">Enterprise</span>
              <div className="flex flex-col gap-2.5">
                {user ? (
                  <Link href={user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="text-graphite hover:text-off-black transition-colors">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="text-graphite hover:text-off-black transition-colors">System Login</Link>
                    <Link href="/register" className="text-graphite hover:text-off-black transition-colors">Register Org</Link>
                  </>
                )}
                <Link href="#" className="text-graphite hover:text-off-black transition-colors">API docs</Link>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-ash/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-smoke text-[12px]">
            <span>© {new Date().getFullYear()} Monad HRMS. Built with care by Odoo India.</span>
            <span>All logs synchronized.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}