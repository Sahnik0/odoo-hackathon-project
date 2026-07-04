import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getMyProfile,
  listEmployees,
  updateEmployee,
  type ListEmployeesParams,
} from '@/services/employee.service';
import type { UpdateEmployeeInput, CreateEmployeeInput } from '@/types/employee';

export const employeeKeys = {
  all: ['employees'] as const,
  mine: () => [...employeeKeys.all, 'me'] as const,
  detail: (id: string) => [...employeeKeys.all, id] as const,
  list: (params: ListEmployeesParams) => [...employeeKeys.all, 'list', params] as const,
};

export function useMyProfile() {
  return useQuery({ queryKey: employeeKeys.mine(), queryFn: getMyProfile });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? ''),
    queryFn: () => getEmployee(id!),
    enabled: !!id,
  });
}

export function useEmployeeList(params: ListEmployeesParams) {
  return useQuery({ queryKey: employeeKeys.list(params), queryFn: () => listEmployees(params) });
}

export function useUpdateEmployee(id: string, isSelf: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateEmployeeInput) => updateEmployee(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.detail(id) });
      if (isSelf) queryClient.invalidateQueries({ queryKey: employeeKeys.mine() });
      queryClient.invalidateQueries({ queryKey: employeeKeys.all });
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEmployeeInput) => createEmployee(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.all }),
  });
}
