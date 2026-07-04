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
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

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
      // Always go to role selection — the user picks their context every session
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
      className="w-full rounded-[28px] border border-line bg-surface p-8 shadow-xl backdrop-blur-sm"
    >
      <div className="mb-8">
        <h1 className="font-serif text-[26px] font-normal tracking-tight text-off-black">
          Welcome back
        </h1>
        <p className="mt-1 text-[13px] text-graphite">
          Sign in with your Login ID or email address
        </p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)} aria-label="Login form">
        {/* Email / Login ID */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="text-[13px] font-medium text-off-black">
            Login ID or Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. OIJODO20250001 or john@company.com"
            autoComplete="email"
            {...register('email')}
            className="h-11"
          />
          <FieldError message={errors.email?.message} />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-[13px] font-medium text-off-black">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-[12px] text-graphite transition-colors hover:text-lake-blue"
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
              className="h-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-off-black transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <FieldError message={errors.password?.message} />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full"
        >
          {isSubmitting ? 'Signing in…' : 'Sign In'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-graphite">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-off-black transition-colors hover:text-lake-blue">
          Sign Up
        </Link>
      </p>
    </motion.div>
  );
}
