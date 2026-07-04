// Backend stores/returns money as integer paise (Section 2) — format on display only.
const inrFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatPaise(paise: number): string {
  return inrFormatter.format(paise / 100);
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
