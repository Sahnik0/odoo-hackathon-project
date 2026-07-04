'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Copy, Check, Shield, UserRound, ArrowRight } from 'lucide-react';
import { verifyEmailRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

type Status = 'verifying' | 'success' | 'error';
type Step = 'verified' | 'role';

const ROLES = [
  {
    id: 'EMPLOYEE' as const,
    icon: UserRound,
    title: 'Employee',
    description: 'Access your attendance, leaves, payslips and profile.',
    accent: 'from-mint/20 to-periwinkle-mist/20',
    border: 'border-mint/40',
    iconBg: 'bg-mint/15 text-mint',
  },
  {
    id: 'ADMIN' as const,
    icon: Shield,
    title: 'HR / Admin',
    description: 'Manage employees, approve leaves and run payroll.',
    accent: 'from-lake-blue/15 to-periwinkle-mist/20',
    border: 'border-lake-blue/40',
    iconBg: 'bg-lake-blue/10 text-lake-blue',
  },
];

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const [loginId, setLoginId] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<Step>('role');
  const [selectedRole, setSelectedRole] = useState<'EMPLOYEE' | 'ADMIN' | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Check your email link.');
      return;
    }
    let cancelled = false;
    verifyEmailRequest(token)
      .then((res) => {
        if (cancelled) return;
        setStatus('success');
        setLoginId(res.loginId);
        setVerifiedEmail(res.email);
        setMessage(res.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(apiErrorMessage(err));
      });
    return () => { cancelled = true; };
  }, [token]);

  function copyLoginId() {
    navigator.clipboard.writeText(loginId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function confirmRoleAndProceed() {
    if (selectedRole) {
      sessionStorage.setItem('pendingRole', selectedRole);
      sessionStorage.setItem('pendingRole_email', verifiedEmail);
      sessionStorage.setItem('pendingRole_loginId', loginId);
    }
    setStep('verified');
  }

  function proceedToLogin() {
    router.push('/login');
  }

  // ── Verifying ──
  if (status === 'verifying') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto w-full max-w-[480px] rounded-[28px] border border-line bg-surface p-10 shadow-xl text-center"
      >
        <Loader2 size={36} className="mx-auto mb-4 animate-spin text-lake-blue" />
        <h1 className="font-serif text-[20px] font-normal text-off-black">Verifying your email…</h1>
        <p className="mt-2 text-[13px] text-graphite">Hang tight, confirming your address.</p>
      </motion.div>
    );
  }

  // ── Error ──
  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-[480px] rounded-[28px] border border-line bg-surface p-10 shadow-xl text-center"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <XCircle size={32} className="text-crimson" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-[22px] font-normal tracking-tight text-off-black">Verification failed</h1>
        <p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-graphite">{message}</p>
        <Button asChild variant="primary" className="mt-8 w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </motion.div>
    );
  }

  // ── Success — step 1: show Login ID ──
  // ── Success — step 2: pick role ──
  return (
    <div className="mx-auto w-full max-w-[520px]">
      <AnimatePresence mode="wait">
        {step === 'verified' ? (
          <motion.div
            key="verified"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-[28px] border border-line bg-surface shadow-xl"
          >
            {/* Gradient top bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-mint via-lake-blue to-periwinkle-mist" />

            <div className="p-8 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, type: 'spring' }}
                className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-mint/20"
              >
                <CheckCircle2 size={32} className="text-mint" strokeWidth={2} />
              </motion.div>

              <h1 className="font-serif text-[22px] font-normal tracking-tight text-off-black">Email verified!</h1>
              <p className="mt-1.5 text-[13px] text-graphite">Your account is active. Save your Login ID.</p>

              {/* Login ID */}
              {loginId && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-5 rounded-[16px] border border-lake-blue/20 bg-periwinkle-mist/15 px-5 py-4"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-smoke">Your Login ID</p>
                  <div className="mt-1.5 flex items-center justify-center gap-2.5">
                    <span className="font-mono text-[20px] font-bold tracking-wider text-off-black">{loginId}</span>
                    <button
                      type="button"
                      onClick={copyLoginId}
                      className="flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-smoke transition-all hover:border-lake-blue/40 hover:text-lake-blue"
                      aria-label="Copy Login ID"
                    >
                      {copied ? <Check size={13} className="text-mint" /> : <Copy size={13} />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-smoke">Use this or your email to sign in</p>
                </motion.div>
              )}

              <Button
                type="button"
                variant="primary"
                onClick={proceedToLogin}
                className="mt-6 w-full gap-2"
              >
                Continue to Sign In <ArrowRight size={15} />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-[28px] border border-line bg-surface p-8 shadow-xl"
          >
            <div className="mb-6 text-center">
              <h1 className="font-serif text-[22px] font-normal tracking-tight text-off-black">Select your role</h1>
              <p className="mt-1.5 text-[13px] text-graphite">How will you be using this HRMS?</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((role) => {
                const isSelected = selectedRole === role.id;
                return (
                  <motion.button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative flex flex-col gap-3 rounded-[18px] border-2 bg-gradient-to-br p-5 text-left transition-all duration-200 ${role.accent} ${
                      isSelected ? `${role.border} shadow-md` : 'border-line hover:border-ash'
                    }`}
                  >
                    <div className={`absolute right-3 top-3 flex h-4.5 w-4.5 h-[18px] w-[18px] items-center justify-center rounded-full border-2 transition-all ${
                      isSelected ? `${role.border} bg-off-black` : 'border-ash'
                    }`}>
                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[12px] ${role.iconBg}`}>
                      <role.icon size={20} strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="font-serif text-[16px] font-normal text-off-black">{role.title}</h2>
                      <p className="mt-0.5 text-[12px] leading-relaxed text-graphite">{role.description}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={!selectedRole}
              onClick={confirmRoleAndProceed}
              className="mt-5 w-full gap-2"
            >
              Continue to Get Login ID <ArrowRight size={15} />
            </Button>

            <p className="mt-3 text-center text-[11px] text-smoke">
              You can change this after signing in
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
