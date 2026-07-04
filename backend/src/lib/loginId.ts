import type { Prisma } from '@prisma/client';

// Login ID format (Section 2): OI + first 2 letters of first name + first 2 of
// last name + year of joining + 4-digit per-year serial.
//   John Doe, joined 2022, 1st that year → OIJODO20220001
// Serial comes from LoginIdCounter, incremented inside the caller's transaction
// so concurrent registrations never collide.

const COMPANY_PREFIX = 'OI'; // Odoo India

function twoLetters(name: string): string {
  const letters = name.replace(/[^a-zA-Z]/g, '');
  return letters.slice(0, 2).toUpperCase().padEnd(2, 'X');
}

export async function nextLoginId(
  tx: Prisma.TransactionClient,
  firstName: string,
  lastName: string,
  joinYear: number,
): Promise<string> {
  const counter = await tx.loginIdCounter.upsert({
    where: { year: joinYear },
    create: { year: joinYear, seq: 1 },
    update: { seq: { increment: 1 } },
  });
  const serial = String(counter.seq).padStart(4, '0');
  return `${COMPANY_PREFIX}${twoLetters(firstName)}${twoLetters(lastName)}${joinYear}${serial}`;
}
