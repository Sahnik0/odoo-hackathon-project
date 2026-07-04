export type Role = 'EMPLOYEE' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}
