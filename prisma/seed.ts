// Prisma seed — 1 Admin + 6 Employees with realistic data across ALL entities
// (Section 11, Phase 1 DoD). Clean-then-seed for safe re-runs.
//
// Run: `npm run seed` from backend/ (ts-node --transpile-only ../prisma/seed.ts).
//
// Demo credentials (also documented in README, Phase 11):
//   Admin    → admin@hrms.local    / Admin@123
//   Employee → priya@hrms.local    / Employee@123  (all employees share this pw)

// Loaded before the Prisma import below: `ts-node` (unlike the `prisma` CLI) does
// not auto-read `.env` for a plain script invocation, so DATABASE_URL would be
// undefined on a fresh clone without this. cwd is `backend/` (see npm script),
// so this resolves `backend/.env`.
import 'dotenv/config';
import { PrismaClient, type LeaveType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { nextLoginId } from '../backend/src/lib/loginId';

const prisma = new PrismaClient();

const BCRYPT_COST = 12;
const YEAR = 2026;

/** Rupees → integer paise (Section 2: money stored as paise). */
const inr = (rupees: number) => Math.round(rupees * 100);

/** Default annual leave allocation (Section 2). UNPAID = null (unlimited). */
const LEAVE_ALLOCATION: Record<LeaveType, number | null> = {
  PAID: 18,
  SICK: 10,
  UNPAID: null,
};

/** A calendar Date (UTC midnight) for @db.Date columns. */
const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
/** A full UTC timestamp for check-in/out. */
const at = (iso: string, hhmm: string) => new Date(`${iso}T${hhmm}:00.000Z`);

async function clean() {
  // FK-safe deletion order (children first).
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.salaryStructure.deleteMany();
  await prisma.document.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.loginIdCounter.deleteMany();
}

interface SeedPerson {
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'EMPLOYEE';
  department: string;
  designation: string;
  joinYear: number;
  joinDate: string;
  employmentStatus?: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  salaryINR: { basic: number; hra: number; allowances: number; deductions: number };
}

const PEOPLE: SeedPerson[] = [
  {
    email: 'admin@hrms.local',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    role: 'ADMIN',
    department: 'Administration',
    designation: 'HR Director',
    joinYear: 2020,
    joinDate: '2020-01-15',
    salaryINR: { basic: 120000, hra: 48000, allowances: 20000, deductions: 15000 },
  },
  {
    email: 'priya@hrms.local',
    firstName: 'Priya',
    lastName: 'Sharma',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Senior Software Engineer',
    joinYear: 2022,
    joinDate: '2022-03-01',
    salaryINR: { basic: 80000, hra: 32000, allowances: 12000, deductions: 8000 },
  },
  {
    email: 'arjun@hrms.local',
    firstName: 'Arjun',
    lastName: 'Mehta',
    role: 'EMPLOYEE',
    department: 'Sales',
    designation: 'Account Executive',
    joinYear: 2022,
    joinDate: '2022-07-11',
    salaryINR: { basic: 60000, hra: 24000, allowances: 15000, deductions: 6000 },
  },
  {
    email: 'vikram@hrms.local',
    firstName: 'Vikram',
    lastName: 'Singh',
    role: 'EMPLOYEE',
    department: 'Engineering',
    designation: 'Engineering Manager',
    joinYear: 2021,
    joinDate: '2021-05-20',
    employmentStatus: 'ON_LEAVE',
    salaryINR: { basic: 110000, hra: 44000, allowances: 18000, deductions: 12000 },
  },
  {
    email: 'sneha@hrms.local',
    firstName: 'Sneha',
    lastName: 'Patel',
    role: 'EMPLOYEE',
    department: 'Human Resources',
    designation: 'HR Executive',
    joinYear: 2023,
    joinDate: '2023-02-06',
    salaryINR: { basic: 55000, hra: 22000, allowances: 10000, deductions: 5000 },
  },
  {
    email: 'ananya@hrms.local',
    firstName: 'Ananya',
    lastName: 'Reddy',
    role: 'EMPLOYEE',
    department: 'Marketing',
    designation: 'Marketing Associate',
    joinYear: 2024,
    joinDate: '2024-09-02',
    salaryINR: { basic: 50000, hra: 20000, allowances: 9000, deductions: 4000 },
  },
  {
    email: 'rohan@hrms.local',
    firstName: 'Rohan',
    lastName: 'Das',
    role: 'EMPLOYEE',
    department: 'Finance',
    designation: 'Financial Analyst',
    joinYear: 2023,
    joinDate: '2023-11-13',
    employmentStatus: 'TERMINATED',
    salaryINR: { basic: 58000, hra: 23000, allowances: 8000, deductions: 5000 },
  },
];

async function main() {
  await clean();

  const adminPasswordHash = await bcrypt.hash('Admin@123', BCRYPT_COST);
  const employeePasswordHash = await bcrypt.hash('Employee@123', BCRYPT_COST);

  // Create users + profiles + login IDs + leave balances + salary structures.
  const created: { profileId: string; userId: string; person: SeedPerson; loginId: string }[] =
    [];

  for (const person of PEOPLE) {
    const { profileId, userId, loginId } = await prisma.$transaction(async (tx) => {
      const loginId = await nextLoginId(tx, person.firstName, person.lastName, person.joinYear);

      const user = await tx.user.create({
        data: {
          email: person.email,
          passwordHash: person.role === 'ADMIN' ? adminPasswordHash : employeePasswordHash,
          role: person.role,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          profile: {
            create: {
              loginId,
              firstName: person.firstName,
              lastName: person.lastName,
              phone: '+91 90000 0' + String(1000 + PEOPLE.indexOf(person)),
              address: `${person.department} Wing, Odoo India, Gandhinagar`,
              department: person.department,
              designation: person.designation,
              dateOfJoining: day(person.joinDate),
              employmentStatus: person.employmentStatus ?? 'ACTIVE',
            },
          },
        },
        include: { profile: true },
      });

      const profile = user.profile!;

      // Leave balances for the current year, all three types.
      await tx.leaveBalance.createMany({
        data: (Object.keys(LEAVE_ALLOCATION) as LeaveType[]).map((type) => ({
          employeeProfileId: profile.id,
          type,
          year: YEAR,
          allocated: LEAVE_ALLOCATION[type],
          used: 0,
        })),
      });

      // Salary structure (paise).
      await tx.salaryStructure.create({
        data: {
          employeeProfileId: profile.id,
          basic: inr(person.salaryINR.basic),
          hra: inr(person.salaryINR.hra),
          allowances: inr(person.salaryINR.allowances),
          deductions: inr(person.salaryINR.deductions),
          effectiveFrom: day(`${person.joinYear}-01-01`),
        },
      });

      return { profileId: profile.id, userId: user.id, loginId };
    });

    created.push({ profileId, userId, person, loginId });
  }

  const admin = created.find((c) => c.person.role === 'ADMIN')!;
  const employees = created.filter((c) => c.person.role === 'EMPLOYEE');

  // Attendance — a week of records for the first three active employees.
  const attendanceDays = [
    { date: '2026-06-29', in: '03:30', out: '12:30', status: 'PRESENT' as const }, // 9:00 IST → 18:00
    { date: '2026-06-30', in: '03:30', out: '12:30', status: 'PRESENT' as const },
    { date: '2026-07-01', in: '03:30', out: '06:30', status: 'HALF_DAY' as const }, // 3h < 4h threshold
    { date: '2026-07-02', in: null, out: null, status: 'ABSENT' as const },
    { date: '2026-07-03', in: '03:30', out: '12:45', status: 'PRESENT' as const },
  ];

  for (const emp of employees.slice(0, 3)) {
    for (const a of attendanceDays) {
      const checkIn = a.in ? at(a.date, a.in) : null;
      const checkOut = a.out ? at(a.date, a.out) : null;
      const workedMinutes =
        checkIn && checkOut ? Math.round((checkOut.getTime() - checkIn.getTime()) / 60000) : null;
      await prisma.attendance.create({
        data: {
          employeeProfileId: emp.profileId,
          date: day(a.date),
          checkIn,
          checkOut,
          workedMinutes,
          status: a.status,
        },
      });
    }
  }

  // Leave requests — one approved (balance deducted), one pending, one rejected.
  const priya = employees[0];
  const arjun = employees[1];
  const sneha = employees[3];

  // Approved paid leave for Priya (3 days) — deduct from balance.
  await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.create({
      data: {
        employeeProfileId: priya.profileId,
        type: 'PAID',
        status: 'APPROVED',
        startDate: day('2026-06-10'),
        endDate: day('2026-06-12'),
        days: 3,
        reason: 'Family function',
        reviewedById: admin.userId,
        reviewRemarks: 'Approved. Enjoy!',
        reviewedAt: new Date('2026-06-05T10:00:00.000Z'),
      },
    });
    await tx.leaveBalance.update({
      where: {
        employeeProfileId_type_year: { employeeProfileId: priya.profileId, type: 'PAID', year: YEAR },
      },
      data: { used: { increment: 3 } },
    });
  });

  // Pending sick leave for Arjun.
  await prisma.leaveRequest.create({
    data: {
      employeeProfileId: arjun.profileId,
      type: 'SICK',
      status: 'PENDING',
      startDate: day('2026-07-08'),
      endDate: day('2026-07-09'),
      days: 2,
      reason: 'Fever and rest advised by doctor',
    },
  });

  // Rejected paid leave for Sneha.
  await prisma.leaveRequest.create({
    data: {
      employeeProfileId: sneha.profileId,
      type: 'PAID',
      status: 'REJECTED',
      startDate: day('2026-07-15'),
      endDate: day('2026-07-20'),
      days: 6,
      reason: 'Vacation',
      reviewedById: admin.userId,
      reviewRemarks: 'Rejected — team is short-staffed that week.',
      reviewedAt: new Date('2026-07-01T09:00:00.000Z'),
    },
  });

  // Payroll — generate June 2026 entries for all active employees.
  for (const emp of employees) {
    if (emp.person.employmentStatus === 'TERMINATED') continue;
    const s = emp.person.salaryINR;
    const basic = inr(s.basic);
    const hra = inr(s.hra);
    const allowances = inr(s.allowances);
    const deductions = inr(s.deductions);
    const gross = basic + hra + allowances;
    const net = gross - deductions;
    await prisma.payroll.create({
      data: {
        employeeProfileId: emp.profileId,
        month: 6,
        year: YEAR,
        basic,
        hra,
        allowances,
        deductions,
        gross,
        net,
        generatedById: admin.userId,
        generatedAt: new Date('2026-07-01T04:00:00.000Z'),
      },
    });
  }

  // Documents — one per first two employees.
  for (const emp of employees.slice(0, 2)) {
    await prisma.document.create({
      data: {
        employeeProfileId: emp.profileId,
        category: 'ID_PROOF',
        fileName: 'aadhaar.pdf',
        storagePath: `uploads/${emp.profileId}/ID_PROOF/${emp.loginId}-aadhaar.pdf`,
        mimeType: 'application/pdf',
        sizeBytes: 245_760,
        status: 'APPROVED',
        uploadedById: emp.userId,
      },
    });
  }

  // Notifications — reflect the leave/payroll events above.
  await prisma.notification.createMany({
    data: [
      {
        userId: priya.userId,
        type: 'LEAVE_APPROVED',
        message: 'Your paid leave (10–12 Jun) was approved.',
        link: '/leave',
        read: false,
      },
      {
        userId: sneha.userId,
        type: 'LEAVE_REJECTED',
        message: 'Your paid leave (15–20 Jul) was rejected.',
        link: '/leave',
        read: false,
      },
      {
        userId: admin.userId,
        type: 'LEAVE_SUBMITTED',
        message: 'Arjun Mehta submitted a sick leave request.',
        link: '/admin/leave',
        read: false,
      },
      {
        userId: priya.userId,
        type: 'PAYROLL_GENERATED',
        message: 'Your payroll for June 2026 is available.',
        link: '/payroll',
        read: true,
        readAt: new Date('2026-07-02T05:00:00.000Z'),
      },
    ],
  });

  // Summary.
  const counts = {
    users: await prisma.user.count(),
    profiles: await prisma.employeeProfile.count(),
    attendance: await prisma.attendance.count(),
    leaveRequests: await prisma.leaveRequest.count(),
    leaveBalances: await prisma.leaveBalance.count(),
    salaryStructures: await prisma.salaryStructure.count(),
    payrolls: await prisma.payroll.count(),
    documents: await prisma.document.count(),
    notifications: await prisma.notification.count(),
  };

  // eslint-disable-next-line no-console -- seed runs standalone, not in request path
  console.log('✅ Seed complete:', counts);
  // eslint-disable-next-line no-console
  console.log('   Login IDs:', created.map((c) => `${c.person.email} → ${c.loginId}`).join('\n              '));
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console -- seed runs standalone, not in request path
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
