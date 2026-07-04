'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/use-employees';
import { adminEditSchema, type AdminEditInput } from '@/schemas/employee';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { FieldError } from '@/components/ui/field-error';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DocumentsPanel } from '@/components/documents-panel';

export default function AdminEmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: profile, isLoading } = useEmployee(id);
  const updateMutation = useUpdateEmployee(id, false);
  const deleteMutation = useDeleteEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AdminEditInput>({ resolver: zodResolver(adminEditSchema) });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        department: profile.department ?? '',
        designation: profile.designation ?? '',
        dateOfJoining: profile.dateOfJoining.slice(0, 10),
        employmentStatus: profile.employmentStatus,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });
    }
  }, [profile, reset]);

  async function onSubmit(values: AdminEditInput) {
    try {
      await updateMutation.mutateAsync(values);
      toast.success('Employee updated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Employee removed');
      router.push('/admin/employees');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[40px] font-normal text-off-black">
            {profile.firstName} {profile.lastName}
          </h1>
          <p className="mt-2 text-[14px] text-graphite">
            {profile.loginId} · {profile.user.email}
          </p>
        </div>
        <ConfirmDialog
          trigger={<Button variant="destructive">Remove employee</Button>}
          title="Remove this employee?"
          description="This soft-deletes their account and revokes all active sessions. This cannot be undone from the UI."
          confirmLabel="Remove"
          onConfirm={handleDelete}
          isPending={deleteMutation.isPending}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" {...register('firstName')} />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" {...register('lastName')} />
                <FieldError message={errors.lastName?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" {...register('department')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="designation">Designation</Label>
                <Input id="designation" {...register('designation')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dateOfJoining">Date of joining</Label>
                <Input id="dateOfJoining" type="date" {...register('dateOfJoining')} />
                <FieldError message={errors.dateOfJoining?.message} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="employmentStatus">Employment status</Label>
                <Select id="employmentStatus" {...register('employmentStatus')}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On leave</option>
                  <option value="TERMINATED">Terminated</option>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register('address')} />
              </div>
            </div>
            <Button type="submit" variant="primary" disabled={!isDirty || updateMutation.isPending} className="w-fit">
              {updateMutation.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <DocumentsPanel employeeId={id} canReview />
    </div>
  );
}
