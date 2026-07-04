'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { forgotPasswordRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (v: ForgotPasswordInput) => forgotPasswordRequest(v.email),
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (sent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for that address, we&apos;ve sent a password reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>We&apos;ll email you a link to reset it.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <Button type="submit" variant="primary" disabled={mutation.isPending} className="mt-1 w-full">
            {mutation.isPending ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-graphite">
          <Link href="/login" className="text-off-black underline underline-offset-4 hover:text-lake-blue">
            Back to login
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
