export interface SalaryStructure {
  id: string;
  employeeProfileId: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  currency: string;
  effectiveFrom: string;
}

export interface PayrollRecord {
  id: string;
  employeeProfileId: string;
  month: number;
  year: number;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  gross: number;
  net: number;
  currency: string;
  generatedAt: string;
  employeeProfile?: { id: string; firstName: string; lastName: string; loginId: string };
}
