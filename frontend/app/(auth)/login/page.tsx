'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useAuth } from '@/contexts/auth-context';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { rememberMe: false } });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    try {
      const user = await login(values);
      toast.success('Welcome back!');
      router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log in</CardTitle>
        <CardDescription>Sign in with your work email.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            <FieldError message={errors.email?.message} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
            <FieldError message={errors.password?.message} />
          </div>
          <label className="flex items-center gap-2 text-[14px] text-graphite">
            <input type="checkbox" {...register('rememberMe')} className="h-4 w-4 accent-lake-blue" />
            Remember me for 30 days
          </label>
          <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <div className="mt-6 flex flex-col items-center gap-2 text-[14px] text-graphite">
          <Link href="/forgot-password" className="text-off-black underline">
            Forgot your password?
          </Link>
          <p>
            Need an account?{' '}
            <Link href="/register" className="text-off-black underline">
              Register
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
