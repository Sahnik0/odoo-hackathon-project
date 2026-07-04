import { api } from '@/lib/axios';
import type { ApiSuccess, ApiMeta } from '@/types/api';
import type { CreateEmployeeInput, EmployeeProfile, UpdateEmployeeInput } from '@/types/employee';

export interface ListEmployeesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  status?: string;
  sort?: string;
}

export async function getMyProfile() {
  const res = await api.get<ApiSuccess<EmployeeProfile>>('/employees/me');
  return res.data.data;
}

export async function getEmployee(id: string) {
  const res = await api.get<ApiSuccess<EmployeeProfile>>(`/employees/${id}`);
  return res.data.data;
}

export async function listEmployees(params: ListEmployeesParams) {
  const res = await api.get<ApiSuccess<EmployeeProfile[]>>('/employees', { params });
  return { data: res.data.data, meta: res.data.meta as ApiMeta };
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  const res = await api.patch<ApiSuccess<EmployeeProfile>>(`/employees/${id}`, input);
  return res.data.data;
}

export async function createEmployee(input: CreateEmployeeInput) {
  const res = await api.post<ApiSuccess<EmployeeProfile>>('/employees', input);
  return res.data.data;
}

export async function deleteEmployee(id: string) {
  await api.delete(`/employees/${id}`);
}
