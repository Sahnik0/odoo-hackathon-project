'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useEmployeeList, useCreateEmployee } from '@/hooks/use-employees';
import { createEmployeeSchema, type CreateEmployeeFormInput } from '@/schemas/employee';
import { apiErrorMessage } from '@/lib/axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FieldError } from '@/components/ui/field-error';
import { StatusBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function AdminEmployeesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useEmployeeList({ page, pageSize: 20, search, department: department || undefined });
  const createMutation = useCreateEmployee();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeFormInput>({ resolver: zodResolver(createEmployeeSchema) });

  async function onCreate(values: CreateEmployeeFormInput) {
    try {
      await createMutation.mutateAsync({
        ...values,
        department: values.department || undefined,
        designation: values.designation || undefined,
      });
      toast.success('Employee created — password reset email sent');
      reset();
      setDialogOpen(false);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-[40px] font-normal text-off-black">Employees</h1>
          <p className="mt-2 text-[14px] text-graphite">{data?.meta.total ?? 0} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Add employee ▸</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add employee</DialogTitle>
              <DialogDescription>
                A pre-verified account is created and a password-setup link is emailed.
              </DialogDescription>
            </DialogHeader>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(onCreate)}>
              <div className="grid grid-cols-2 gap-4">
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
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
                <FieldError message={errors.email?.message} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" {...register('department')} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" {...register('designation')} />
                </div>
              </div>
              <Button type="submit" variant="primary" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? 'Creating…' : 'Create employee'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <Input
          placeholder="Search name, login ID or email…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Input
          placeholder="Filter by department…"
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
      </div>

      <Card>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !data || data.data.length === 0 ? (
            <EmptyState title="No employees found" description="Try adjusting your search or filters." />
          ) : (
            <div className="flex flex-col divide-y divide-ash">
              {data.data.map((emp) => (
                <Link
                  key={emp.id}
                  href={`/admin/employees/${emp.id}`}
                  className="flex items-center justify-between py-4 hover:bg-off-black/[0.02]"
                >
                  <div>
                    <p className="text-[16px] text-off-black">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-[12px] uppercase text-smoke">
                      {emp.loginId} · {emp.department ?? 'No department'}
                    </p>
                  </div>
                  <StatusBadge status={emp.employmentStatus} />
                </Link>
              ))}
            </div>
          )}
          {data && <Pagination meta={data.meta} onPageChange={setPage} />}
        </CardContent>
      </Card>
    </div>
  );
}
