'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Copy, Check } from 'lucide-react';
import { verifyEmailRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');
  const [loginId, setLoginId] = useState('');
  const [copied, setCopied] = useState(false);

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

  // ── Verifying ──────────────────────────────────────────────────────────────
  if (status === 'verifying') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full rounded-[28px] border border-line bg-surface p-12 shadow-xl text-center"
      >
        <Loader2 size={40} className="mx-auto mb-4 animate-spin text-lake-blue" />
        <h1 className="font-serif text-[22px] font-normal text-off-black">Verifying your email…</h1>
        <p className="mt-2 text-[13px] text-graphite">Hang tight, confirming your address.</p>
      </motion.div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full rounded-[28px] border border-line bg-surface p-12 shadow-xl text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <XCircle size={36} className="text-crimson" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-[24px] font-normal tracking-tight text-off-black">
          Verification failed
        </h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[14px] leading-relaxed text-graphite">{message}</p>
        <Button asChild variant="primary" className="mt-8 w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </motion.div>
    );
  }

  // ── Success ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-[28px] border border-line bg-surface shadow-xl overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-mint via-lake-blue to-periwinkle-mist" />

      <div className="p-10 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-mint/20"
        >
          <CheckCircle2 size={36} className="text-mint" strokeWidth={2} />
        </motion.div>

        <h1 className="font-serif text-[26px] font-normal tracking-tight text-off-black">
          Email verified!
        </h1>
        <p className="mt-2 text-[14px] text-graphite">
          Your account is now active. Save your Login ID below.
        </p>

        {/* Login ID display */}
        {loginId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 rounded-[20px] border border-lake-blue/20 bg-periwinkle-mist/15 px-6 py-5"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-smoke">
              Your Login ID
            </p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-[22px] font-bold tracking-wider text-off-black">
                {loginId}
              </span>
              <button
                type="button"
                onClick={copyLoginId}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-smoke transition-all hover:border-lake-blue/40 hover:text-lake-blue"
                aria-label="Copy Login ID"
              >
                {copied ? <Check size={14} className="text-mint" /> : <Copy size={14} />}
              </button>
            </div>
            <p className="mt-2 text-[11px] text-smoke">
              Use this ID or your email to sign in
            </p>
          </motion.div>
        )}

        <Button asChild variant="primary" className="mt-7 w-full">
          <Link href="/login">Sign in now →</Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
