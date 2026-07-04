import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { PayrollRecord, SalaryStructure } from '@/types/payroll';

export interface ListPayrollParams {
  page?: number;
  pageSize?: number;
  employeeId?: string;
  month?: number;
  year?: number;
}

export async function getSalaryStructure(employeeId: string) {
  const res = await api.get<ApiSuccess<SalaryStructure>>(`/payroll/salary/${employeeId}`);
  return res.data.data;
}

export async function upsertSalaryStructure(
  employeeId: string,
  input: { basic: number; hra: number; allowances: number; deductions: number },
) {
  const res = await api.put<ApiSuccess<SalaryStructure>>(`/payroll/salary/${employeeId}`, input);
  return res.data.data;
}

export async function generatePayroll(input: { employeeId: string; month: number; year: number }) {
  const res = await api.post<ApiSuccess<PayrollRecord>>('/payroll/generate', input);
  return res.data.data;
}

export async function listMyPayroll(params: ListPayrollParams = {}) {
  const res = await api.get<ApiSuccess<PayrollRecord[]>>('/payroll/me', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function listPayroll(params: ListPayrollParams) {
  const res = await api.get<ApiSuccess<PayrollRecord[]>>('/payroll', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}
