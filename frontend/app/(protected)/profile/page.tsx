'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useMyProfile, useUpdateEmployee } from '@/hooks/use-employees';
import { selfEditSchema, type SelfEditInput } from '@/schemas/employee';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/badge';
import { ProfilePictureUpload } from '@/components/profile-picture-upload';
import { DocumentsPanel } from '@/components/documents-panel';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useMyProfile();
  const updateMutation = useUpdateEmployee(profile?.id ?? '', true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<SelfEditInput>({ resolver: zodResolver(selfEditSchema) });

  useEffect(() => {
    if (profile) reset({ phone: profile.phone ?? '', address: profile.address ?? '' });
  }, [profile, reset]);

  async function onSubmit(values: SelfEditInput) {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">My Profile</h1>
        <p className="mt-1.5 text-[15px] text-graphite">{profile.loginId}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Job details</CardTitle>
            <CardDescription>Admin-managed — contact HR to change these.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ProfilePictureUpload profileId={profile.id} currentPicture={profile.profilePicture} />
            <Field label="Name" value={`${profile.firstName} ${profile.lastName}`} />
            <Field label="Email" value={profile.user.email} />
            <Field label="Department" value={profile.department ?? '—'} />
            <Field label="Designation" value={profile.designation ?? '—'} />
            <Field label="Date of joining" value={new Date(profile.dateOfJoining).toLocaleDateString()} />
            <div className="flex flex-col gap-1">
              <span className="text-[12px] uppercase tracking-[0.04em] text-smoke">Status</span>
              <StatusBadge status={profile.employmentStatus} />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contact details</CardTitle>
            <CardDescription>You can edit these yourself.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
                <FieldError message={errors.phone?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} />
                <FieldError message={errors.address?.message} />
              </div>
              <Button type="submit" variant="primary" disabled={!isDirty || updateMutation.isPending} className="w-fit">
                {updateMutation.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <DocumentsPanel employeeId={profile.id} canReview={user?.role === 'ADMIN'} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] uppercase tracking-[0.04em] text-smoke">{label}</span>
      <span className="text-[16px] text-off-black">{value}</span>
    </div>
  );
}
