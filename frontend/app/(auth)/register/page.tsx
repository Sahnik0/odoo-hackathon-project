'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, Upload } from 'lucide-react';
import { registerSchema, type RegisterInput } from '@/schemas/auth';
import { registerRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { Logo } from '@/components/logo';

export default function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => setSubmittedEmail(data.email),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  if (submittedEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-[28px] border border-line bg-surface p-12 shadow-xl backdrop-blur-sm"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mint/20">
            <CheckCircle2 size={40} className="text-mint" strokeWidth={2.5} />
          </div>

          <h1 className="font-serif text-[32px] font-normal tracking-tight text-off-black">Check your email</h1>
          <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-graphite">
            We sent a verification link to <strong className="font-medium text-off-black">{submittedEmail}</strong>.
            Click it to activate your account and receive your Login ID.
          </p>

          <div className="mt-6 w-full rounded-[16px] border border-line bg-periwinkle-mist/10 p-4">
            <p className="text-[13px] text-graphite">
              Your unique Login ID will be automatically generated in the format:
            </p>
            <p className="mt-2 font-mono text-[14px] font-medium text-off-black">
              OI[FirstLast][Year][Number]
            </p>
            <p className="mt-1 text-[12px] text-smoke">Example: OIJODO20220001</p>
          </div>

          <Button asChild variant="default" className="mt-8 w-full">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      </motion.div>
    );
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

      <form className="flex flex-col gap-5" onSubmit={handleSubmit((v) => mutation.mutate(v))}>
        <div className="flex flex-col gap-2.5">
          <Label htmlFor="firstName" className="text-[15px] font-medium text-off-black">
            Name
          </Label>
          <Input
            id="firstName"
            placeholder="Enter your full name"
            autoComplete="given-name"
            {...register('firstName')}
            className="h-12"
          />
          <FieldError message={errors.firstName?.message} />
          <p className="text-[12px] text-smoke">Note: First and last name will be used to generate your Login ID</p>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="lastName" className="text-[15px] font-medium text-off-black">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Enter your last name"
            autoComplete="family-name"
            {...register('lastName')}
            className="h-12"
          />
          <FieldError message={errors.lastName?.message} />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email" className="text-[15px] font-medium text-off-black">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your work email"
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
            placeholder="Create a strong password"
            autoComplete="new-password"
            {...register('password')}
            className="h-12"
          />
          <FieldError message={errors.password?.message} />
          <p className="text-[12px] text-smoke">Must be at least 8 characters with a letter and number</p>
        </div>

        <Button type="submit" variant="primary" disabled={mutation.isPending} className="mt-4 h-12 w-full text-[15px]">
          {mutation.isPending ? 'Creating account…' : 'SIGN UP'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-[15px] text-graphite">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-off-black transition-colors hover:text-lake-blue">
            Sign In
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
