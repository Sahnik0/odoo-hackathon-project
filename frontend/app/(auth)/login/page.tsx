'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { useAuth } from '@/contexts/auth-context';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldError } from '@/components/ui/field-error';

// Normal-case label — overrides design-system uppercase default
function FL({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[12px] font-medium normal-case tracking-normal text-graphite"
    >
      {children}
    </label>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true);
    try {
      await login(values);
      router.push('/select-role');
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
      className="mx-auto w-full max-w-[440px] rounded-[28px] border border-line bg-surface p-7 shadow-xl backdrop-blur-sm"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-[22px] font-normal tracking-tight text-off-black">
          Welcome back
        </h1>
        <p className="mt-1 text-[13px] text-graphite">
          Sign in with your Login ID or email address
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
        {/* Email / Login ID */}
        <div className="flex flex-col gap-1">
          <FL htmlFor="email">Login ID or Email</FL>
          <Input
            id="email"
            type="email"
            placeholder="OIJODO20250001 or john@company.com"
            autoComplete="email"
            {...register('email')}
            className="h-10"
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <FL htmlFor="password">Password</FL>
            <Link
              href="/forgot-password"
              className="text-[11px] text-smoke transition-colors hover:text-lake-blue"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              autoComplete="current-password"
              {...register('password')}
              className="h-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke transition-colors hover:text-off-black"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="mt-1 h-10 w-full"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-5 text-center text-[12px] text-graphite">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-off-black transition-colors hover:text-lake-blue">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}
