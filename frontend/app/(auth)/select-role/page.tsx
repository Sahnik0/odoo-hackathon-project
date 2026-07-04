'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, UserRound, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { apiErrorMessage } from '@/lib/axios';
import { Button } from '@/components/ui/button';

const ROLES = [
  {
    id: 'EMPLOYEE' as const,
    icon: UserRound,
    title: 'Employee',
    description: 'Manage your attendance, leaves, payslips, and personal profile.',
    accent: 'from-mint/20 to-periwinkle-mist/20',
    border: 'border-mint/40',
    iconBg: 'bg-mint/15 text-mint',
  },
  {
    id: 'ADMIN' as const,
    icon: Shield,
    title: 'HR / Admin',
    description: 'Full access — manage employees, approve leaves, run payroll, and more.',
    accent: 'from-lake-blue/15 to-periwinkle-mist/20',
    border: 'border-lake-blue/40',
    iconBg: 'bg-lake-blue/10 text-lake-blue',
  },
];

export default function SelectRolePage() {
  const { updateRole } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState<'EMPLOYEE' | 'ADMIN' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function confirm() {
    if (!selected) return;
    setIsSubmitting(true);
    try {
      await updateRole(selected);
      toast.success(`Welcome! You're signed in as ${selected === 'ADMIN' ? 'HR / Admin' : 'Employee'}.`);
      router.replace(selected === 'ADMIN' ? '/admin/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(apiErrorMessage(err));
      setIsSubmitting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full rounded-[28px] border border-line bg-surface p-10 shadow-xl"
    >
      <div className="mb-8 text-center">
        <h1 className="font-serif text-[24px] font-normal tracking-tight text-off-black">
          Select your role
        </h1>
        <p className="mt-2 text-[13px] text-graphite">
          How will you be using this HRMS? You can change this later with admin approval.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {ROLES.map((role) => {
          const isSelected = selected === role.id;
          return (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => setSelected(role.id)}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`relative flex flex-col gap-4 rounded-[20px] border-2 bg-gradient-to-br p-6 text-left transition-all duration-300 ${role.accent} ${
                isSelected
                  ? `${role.border} shadow-lg`
                  : 'border-line hover:border-ash hover:shadow-md'
              }`}
            >
              {/* Selection dot */}
              <div
                className={`absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                  isSelected ? `${role.border} bg-off-black` : 'border-ash bg-transparent'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>

              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[14px] ${role.iconBg}`}>
                <role.icon size={22} strokeWidth={2} />
              </div>

              <div>
                <h2 className="font-serif text-[18px] font-normal text-off-black">{role.title}</h2>
                <p className="mt-1 text-[13px] leading-relaxed text-graphite">{role.description}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="primary"
        disabled={!selected || isSubmitting}
        onClick={confirm}
        className="mt-8 h-11 w-full gap-2"
      >
        {isSubmitting ? 'Setting up…' : (
          <>
            Continue as {selected === 'ADMIN' ? 'HR / Admin' : selected === 'EMPLOYEE' ? 'Employee' : '…'}
            <ArrowRight size={16} />
          </>
        )}
      </Button>
    </motion.div>
  );
}
