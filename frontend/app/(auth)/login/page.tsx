'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useAuth } from '@/contexts/auth-context';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { Logo } from '@/components/logo';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-[28px] border border-line bg-surface p-12 shadow-xl backdrop-blur-sm"
    >
      <div className="mb-10 flex justify-center">
        <div className="rounded-[20px] bg-surface-raised px-8 py-4 shadow-sm">
          <Logo />
        </div>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email" className="text-[15px] font-medium text-off-black">
            Login ID / Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email or login ID"
            autoComplete="email"
            {...register('email')}
            className="h-12"
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="password" className="text-[15px] font-medium text-off-black">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            {...register('password')}
            className="h-12"
          />
          <FieldError message={errors.password?.message} />
        </div>

        <Button type="submit" variant="primary" disabled={isSubmitting} className="mt-4 h-12 w-full text-[15px]">
          {isSubmitting ? 'Signing in…' : 'SIGN IN'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[15px] text-graphite">
          Don't have an Account?{' '}
          <Link href="/register" className="font-medium text-off-black transition-colors hover:text-lake-blue">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
