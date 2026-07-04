import type { Role } from './auth';

export type EmploymentStatus = 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';

export interface EmployeeProfile {
  id: string;
  userId: string;
  loginId: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  address: string | null;
  profilePicture: string | null;
  department: string | null;
  designation: string | null;
  dateOfJoining: string;
  employmentStatus: EmploymentStatus;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string; role: Role; emailVerified: boolean };
}

export interface UpdateEmployeeInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  employmentStatus?: EmploymentStatus;
}

export interface CreateEmployeeInput {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  designation?: string;
  phone?: string;
  address?: string;
}
