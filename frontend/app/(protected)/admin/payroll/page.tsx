'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useEmployeeList } from '@/hooks/use-employees';
import { useGeneratePayroll, usePayrollList, useSalaryStructure, useUpsertSalaryStructure } from '@/hooks/use-payroll';
import { apiErrorMessage } from '@/lib/axios';
import { formatPaise, MONTH_NAMES } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/ui/pagination';

interface SalaryForm {
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
}

const now = new Date();

export default function AdminPayrollPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [page, setPage] = useState(1);
  const { data: employees } = useEmployeeList({ pageSize: 100 });
  const { data: structure } = useSalaryStructure(employeeId || undefined);
  const upsertMutation = useUpsertSalaryStructure(employeeId);
  const generateMutation = useGeneratePayroll();
  const { data: payrolls, isLoading } = usePayrollList({ page, pageSize: 20, employeeId: employeeId || undefined });

  const { register, handleSubmit, reset } = useForm<SalaryForm>();
  const [genMonth, setGenMonth] = useState(now.getMonth() + 1);
  const [genYear, setGenYear] = useState(now.getFullYear());

  useEffect(() => {
    reset({
      basic: structure ? structure.basic / 100 : 0,
      hra: structure ? structure.hra / 100 : 0,
      allowances: structure ? structure.allowances / 100 : 0,
      deductions: structure ? structure.deductions / 100 : 0,
    });
  }, [structure, reset]);

  async function onSaveSalary(values: SalaryForm) {
    try {
      await upsertMutation.mutateAsync(values);
      toast.success('Salary structure saved');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  async function handleGenerate() {
    try {
      await generateMutation.mutateAsync({ employeeId, month: genMonth, year: genYear });
      toast.success('Payroll generated');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-[38px] font-normal tracking-tight text-off-black">Payroll</h1>
        <p className="mt-1.5 text-[15px] text-graphite">Manage salary structures and generate monthly payroll.</p>
      </div>

      <div className="rounded-[18px] border border-line bg-surface p-3">
        <Select
          value={employeeId}
          onChange={(e) => {
            setEmployeeId(e.target.value);
            setPage(1);
          }}
          className="w-fit"
        >
          <option value="">All employees</option>
          {employees?.data.map((e) => (
            <option key={e.id} value={e.id}>
              {e.firstName} {e.lastName} ({e.loginId})
            </option>
          ))}
        </Select>
      </div>

      {employeeId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Salary structure</CardTitle>
              <CardDescription>Amounts in ₹ (converted to paise on save).</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSaveSalary)}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="basic">Basic</Label>
                    <Input id="basic" type="number" step="0.01" {...register('basic', { valueAsNumber: true })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="hra">HRA</Label>
                    <Input id="hra" type="number" step="0.01" {...register('hra', { valueAsNumber: true })} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="allowances">Allowances</Label>
                    <Input
                      id="allowances"
                      type="number"
                      step="0.01"
                      {...register('allowances', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="deductions">Deductions</Label>
                    <Input
                      id="deductions"
                      type="number"
                      step="0.01"
                      {...register('deductions', { valueAsNumber: true })}
                    />
                  </div>
                </div>
                <Button type="submit" variant="default" disabled={upsertMutation.isPending} className="w-fit">
                  {upsertMutation.isPending ? 'Saving…' : 'Save structure'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate payroll</CardTitle>
              <CardDescription>Re-running for the same month refreshes the snapshot.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="genMonth">Month</Label>
                  <Select id="genMonth" value={genMonth} onChange={(e) => setGenMonth(Number(e.target.value))}>
                    {MONTH_NAMES.map((m, i) => (
                      <option key={m} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="genYear">Year</Label>
                  <Input
                    id="genYear"
                    type="number"
                    value={genYear}
                    onChange={(e) => setGenYear(Number(e.target.value))}
                  />
                </div>
              </div>
              <Button
                variant="primary"
                disabled={!structure || generateMutation.isPending}
                onClick={handleGenerate}
                className="w-fit"
              >
                {generateMutation.isPending ? 'Generating…' : 'Generate payroll ▸'}
              </Button>
              {!structure && <p className="text-[12px] text-crimson">Set a salary structure first.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Generated payroll</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : !payrolls || payrolls.data.length === 0 ? (
            <EmptyState title="No payroll generated yet" />
          ) : (
            <div className="flex flex-col divide-y divide-line">
              {payrolls.data.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 py-4">
                  <div className="min-w-0">
                    <p className="text-[15px] text-off-black">
                      {p.employeeProfile?.firstName} {p.employeeProfile?.lastName}
                    </p>
                    <p className="text-[12px] uppercase tracking-[0.04em] text-smoke">
                      {MONTH_NAMES[p.month - 1]} {p.year}
                    </p>
                  </div>
                  <span className="font-serif text-[16px] tracking-tight tabular-nums text-off-black">
                    {formatPaise(p.net)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {payrolls && <Pagination meta={payrolls.meta} onPageChange={setPage} />}
        </CardContent>
      </Card>
    </div>
  );
}
