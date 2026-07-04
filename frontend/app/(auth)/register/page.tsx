'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, Eye, EyeOff, Upload, X, Building2 } from 'lucide-react';
import { z } from 'zod';
import { registerSchema } from '@/schemas/auth';
import { registerRequest } from '@/services/auth.service';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';

type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: (values: RegisterInput) =>
      registerRequest({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
      }),
    onSuccess: (data) => setSubmittedEmail(data.email),
    onError: (err) => toast.error(apiErrorMessage(err)),
  });

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    // Store in localStorage
    const r2 = new FileReader();
    r2.onload = (ev) => {
      try { localStorage.setItem('company_logo', ev.target?.result as string); } catch { /* quota */ }
    };
    r2.readAsDataURL(file);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submittedEmail) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full rounded-[28px] border border-line bg-surface p-12 shadow-xl backdrop-blur-sm text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-mint/20">
          <CheckCircle2 size={40} className="text-mint" strokeWidth={2} />
        </div>
        <h1 className="font-serif text-[28px] font-normal tracking-tight text-off-black">
          Check your inbox
        </h1>
        <p className="mx-auto mt-4 max-w-[360px] text-[14px] leading-relaxed text-graphite">
          We sent a verification link to{' '}
          <strong className="font-medium text-off-black">{submittedEmail}</strong>.
          Click it to activate your account — your Login ID will be shown right after.
        </p>
        <div className="mt-6 rounded-[16px] border border-line bg-periwinkle-mist/10 px-6 py-4">
          <p className="text-[12px] text-graphite">Your Login ID will be generated as</p>
          <p className="mt-1 font-mono text-[14px] font-semibold text-off-black">OI[FirstLast][Year][Seq]</p>
          <p className="mt-0.5 text-[11px] text-smoke">e.g. OIJODO20250001</p>
        </div>
        <Button asChild variant="default" className="mt-8 w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </motion.div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-[28px] border border-line bg-surface shadow-xl backdrop-blur-sm overflow-hidden"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px]">
        {/* ── Left: form fields ── */}
        <div className="p-8">
          <h1 className="font-serif text-[24px] font-normal tracking-tight text-off-black">
            Create your account
          </h1>
          <p className="mt-1 text-[13px] text-graphite">Fill in your details to get started</p>

          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={handleSubmit((v) => mutation.mutate(v))}
            aria-label="Registration form"
          >
            {/* Company Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="companyName" className="text-[13px] font-medium text-off-black">
                Company Name
              </Label>
              <Input
                id="companyName"
                placeholder="Acme Corp"
                {...register('companyName')}
                className="h-11"
              />
              <FieldError message={errors.companyName?.message} />
            </div>

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName" className="text-[13px] font-medium text-off-black">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  autoComplete="given-name"
                  {...register('firstName')}
                  className="h-11"
                />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName" className="text-[13px] font-medium text-off-black">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  autoComplete="family-name"
                  {...register('lastName')}
                  className="h-11"
                />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-[13px] font-medium text-off-black">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@company.com"
                autoComplete="email"
                {...register('email')}
                className="h-11"
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone" className="text-[13px] font-medium text-off-black">
                Phone <span className="text-smoke font-normal">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                autoComplete="tel"
                {...register('phone')}
                className="h-11"
              />
              <FieldError message={errors.phone?.message} />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password" className="text-[13px] font-medium text-off-black">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 chars with letter & number"
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px] font-medium text-off-black">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  {...register('confirmPassword')}
                  className="h-11 pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-smoke hover:text-off-black transition-colors"
                  aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.confirmPassword?.message} />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
              className="mt-2 h-11 w-full"
            >
              {mutation.isPending ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-graphite">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-off-black transition-colors hover:text-lake-blue">
              Sign In
            </Link>
          </p>
        </div>

        {/* ── Right: company logo upload ── */}
        <div className="flex flex-col items-center justify-center gap-4 border-l border-line bg-surface-raised p-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.08em] text-smoke">
            Company Logo
          </p>

          {/* Preview / placeholder */}
          <div
            onClick={() => logoInputRef.current?.click()}
            className="group relative flex h-[100px] w-[100px] cursor-pointer items-center justify-center overflow-hidden rounded-[20px] border-2 border-dashed border-ash bg-surface transition-all hover:border-lake-blue/50 hover:bg-lake-blue/5"
          >
            {logoPreview ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoPreview} alt="Company logo preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setLogoPreview(null); localStorage.removeItem('company_logo'); }}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-off-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove logo"
                >
                  <X size={10} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-smoke transition-colors group-hover:text-lake-blue">
                <Building2 size={28} strokeWidth={1.5} />
                <Upload size={14} />
              </div>
            )}
          </div>

          <p className="text-center text-[10px] leading-snug text-smoke">
            Click to upload<br />Stored locally
          </p>

          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleLogoChange}
          />
        </div>
      </div>
    </motion.div>
  );
}
