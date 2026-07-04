import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  generatePayroll,
  getSalaryStructure,
  listMyPayroll,
  listPayroll,
  upsertSalaryStructure,
  type ListPayrollParams,
} from '@/services/payroll.service';

export const payrollKeys = {
  all: ['payroll'] as const,
  mine: (params: ListPayrollParams) => [...payrollKeys.all, 'me', params] as const,
  list: (params: ListPayrollParams) => [...payrollKeys.all, 'list', params] as const,
  salary: (employeeId: string) => [...payrollKeys.all, 'salary', employeeId] as const,
};

export function useMyPayroll(params: ListPayrollParams = {}) {
  return useQuery({ queryKey: payrollKeys.mine(params), queryFn: () => listMyPayroll(params) });
}

export function usePayrollList(params: ListPayrollParams) {
  return useQuery({ queryKey: payrollKeys.list(params), queryFn: () => listPayroll(params) });
}

export function useSalaryStructure(employeeId: string | undefined) {
  return useQuery({
    queryKey: payrollKeys.salary(employeeId ?? ''),
    queryFn: () => getSalaryStructure(employeeId!),
    enabled: !!employeeId,
    retry: false,
  });
}

export function useUpsertSalaryStructure(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { basic: number; hra: number; allowances: number; deductions: number }) =>
      upsertSalaryStructure(employeeId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.salary(employeeId) }),
  });
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generatePayroll,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: payrollKeys.all }),
  });
}
