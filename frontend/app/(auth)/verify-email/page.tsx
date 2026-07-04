'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    let cancelled = false;
    verifyEmailRequest(token)
      .then((res) => {
        if (cancelled) return;
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setMessage(apiErrorMessage(err));
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{status === 'verifying' ? 'Verifying…' : status === 'success' ? 'Verified' : 'Verification failed'}</CardTitle>
        <CardDescription>
          {status === 'verifying' ? 'Hang tight, confirming your email address.' : message}
        </CardDescription>
      </CardHeader>
      {status !== 'verifying' && (
        <CardContent>
          <Button asChild variant="primary" className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
