'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { registerRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

export default function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => setSubmittedEmail(data.email),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (submittedEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{submittedEmail}</strong>. Click it to activate your
            account, then come back and log in.
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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Self-registration always creates an Employee account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" autoComplete="given-name" {...register('firstName')} />
              <FieldError message={errors.firstName?.message} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" autoComplete="family-name" {...register('lastName')} />
              <FieldError message={errors.lastName?.message} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          <Button type="submit" variant="primary" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? 'Creating account…' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-[14px] text-graphite">
          Already have an account?{' '}
          <Link href="/login" className="text-off-black underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
