import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { purgeUsers } from '../test/db';
import { signAccessToken } from '../services/token.service';
import { orgDateOnly, viewRange } from '../lib/time';

const app = createApp();
const PREFIX = 'atttest_';
const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });
const DAY_MS = 86_400_000;

let adminToken: string;
let empAToken: string;
let empBToken: string;
let profileAId: string;
let profileBId: string;

async function makeEmployee(email: string, loginId: string, department = 'Engineering') {
  return prisma.user.create({
    data: {
      email,
      passwordHash: 'x',
      role: 'EMPLOYEE',
      emailVerified: true,
      profile: {
        create: {
          loginId,
          firstName: 'Emp',
          lastName: 'Loyee',
          department,
          dateOfJoining: new Date('2026-01-01T00:00:00Z'),
        },
      },
    },
    include: { profile: true },
  });
}

beforeAll(async () => {
  await purgeUsers(PREFIX);

  const admin = await prisma.user.create({
    data: { email: `${PREFIX}admin@hrms.local`, passwordHash: 'x', role: 'ADMIN', emailVerified: true },
  });
  const empA = await makeEmployee(`${PREFIX}empa@hrms.local`, 'OITESTA20260011', 'Engineering');
  const empB = await makeEmployee(`${PREFIX}empb@hrms.local`, 'OITESTB20260012', 'Sales');

  profileAId = empA.profile!.id;
  profileBId = empB.profile!.id;

  adminToken = signAccessToken({ sub: admin.id, role: 'ADMIN', email: admin.email });
  empAToken = signAccessToken({ sub: empA.id, role: 'EMPLOYEE', email: empA.email });
  empBToken = signAccessToken({ sub: empB.id, role: 'EMPLOYEE', email: empB.email });
});

afterAll(async () => {
  await purgeUsers(PREFIX);
  await prisma.$disconnect();
});

describe('POST /attendance/check-in', () => {
  it('creates a PRESENT row on first check-in today', async () => {
    const res = await request(app).post('/attendance/check-in').set(bearer(empAToken)).expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('PRESENT');
    expect(res.body.data.checkIn).not.toBeNull();
    expect(res.body.data.checkOut).toBeNull();
  });

  it('rejects a second check-in the same day with 409', async () => {
    const res = await request(app).post('/attendance/check-in').set(bearer(empAToken)).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('rejects an unauthenticated request with 401', async () => {
    await request(app).post('/attendance/check-in').expect(401);
  });
});

describe('POST /attendance/check-out', () => {
  it('rejects checkout without a same-day check-in (409)', async () => {
    const res = await request(app).post('/attendance/check-out').set(bearer(empBToken)).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('computes workedMinutes and flags HALF_DAY below the threshold', async () => {
    // empA already checked in "now" above; backdate that check-in to 2h ago so
    // checkout falls under the (default 4h) half-day threshold deterministically,
    // without needing to sleep the test.
    const today = orgDateOnly();
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await prisma.attendance.update({
      where: { employeeProfileId_date: { employeeProfileId: profileAId, date: today } },
      data: { checkIn: twoHoursAgo },
    });

    const res = await request(app).post('/attendance/check-out').set(bearer(empAToken)).expect(200);
    expect(res.body.data.status).toBe('HALF_DAY');
    expect(res.body.data.workedMinutes).toBeGreaterThanOrEqual(115);
    expect(res.body.data.workedMinutes).toBeLessThanOrEqual(125);
  });

  it('rejects a second checkout the same day with 409', async () => {
    await request(app).post('/attendance/check-out').set(bearer(empAToken)).expect(409);
  });

  it('flags PRESENT at/above the threshold', async () => {
    // empB: check in, then backdate check-in to 5h ago → checkout should be PRESENT.
    await request(app).post('/attendance/check-in').set(bearer(empBToken)).expect(201);
    const today = orgDateOnly();
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    await prisma.attendance.update({
      where: { employeeProfileId_date: { employeeProfileId: profileBId, date: today } },
      data: { checkIn: fiveHoursAgo },
    });

    const res = await request(app).post('/attendance/check-out').set(bearer(empBToken)).expect(200);
    expect(res.body.data.status).toBe('PRESENT');
    expect(res.body.data.workedMinutes).toBeGreaterThanOrEqual(295);
  });
});

describe('GET /attendance/me (view granularities)', () => {
  const weekStart = viewRange('weekly').gte;
  const beforeWeek = new Date(weekStart.getTime() - DAY_MS);
  const monthStart = viewRange('monthly').gte;
  const beforeMonth = new Date(monthStart.getTime() - DAY_MS);

  beforeAll(async () => {
    // Seed extra historical rows for empA spanning week/month boundaries.
    // (today's row already exists from the check-in/out tests above.)
    await prisma.attendance.upsert({
      where: { employeeProfileId_date: { employeeProfileId: profileAId, date: weekStart } },
      create: { employeeProfileId: profileAId, date: weekStart, status: 'PRESENT' },
      update: {},
    });
    if (beforeWeek.getTime() !== weekStart.getTime()) {
      await prisma.attendance.upsert({
        where: { employeeProfileId_date: { employeeProfileId: profileAId, date: beforeWeek } },
        create: { employeeProfileId: profileAId, date: beforeWeek, status: 'PRESENT' },
        update: {},
      });
    }
    await prisma.attendance.upsert({
      where: { employeeProfileId_date: { employeeProfileId: profileAId, date: monthStart } },
      create: { employeeProfileId: profileAId, date: monthStart, status: 'PRESENT' },
      update: {},
    });
    await prisma.attendance.upsert({
      where: { employeeProfileId_date: { employeeProfileId: profileAId, date: beforeMonth } },
      create: { employeeProfileId: profileAId, date: beforeMonth, status: 'PRESENT' },
      update: {},
    });
  });

  it('daily view returns only today', async () => {
    const res = await request(app).get('/attendance/me?view=daily').set(bearer(empAToken)).expect(200);
    const today = orgDateOnly().toISOString();
    expect(res.body.data.view).toBe('daily');
    expect(
      res.body.data.data.every((r: { date: string }) => new Date(r.date).toISOString() === today),
    ).toBe(true);
    expect(res.body.data.data.length).toBeGreaterThanOrEqual(1);
  });

  it('weekly view includes this week, excludes the day before the week started', async () => {
    const res = await request(app).get('/attendance/me?view=weekly').set(bearer(empAToken)).expect(200);
    const dates = res.body.data.data.map((r: { date: string }) => new Date(r.date).toISOString());
    expect(dates).toContain(weekStart.toISOString());
    expect(dates).not.toContain(beforeWeek.toISOString());
  });

  it('monthly view includes this month, excludes the day before the month started', async () => {
    const res = await request(app).get('/attendance/me?view=monthly').set(bearer(empAToken)).expect(200);
    const dates = res.body.data.data.map((r: { date: string }) => new Date(r.date).toISOString());
    expect(dates).toContain(monthStart.toISOString());
    expect(dates).not.toContain(beforeMonth.toISOString());
  });

  it('rejects an invalid view with 422', async () => {
    const res = await request(app)
      .get('/attendance/me?view=yearly')
      .set(bearer(empAToken))
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('GET /attendance (admin list + filters)', () => {
  it('lets an admin list with pagination meta', async () => {
    const res = await request(app).get('/attendance?pageSize=5').set(bearer(adminToken)).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta).toMatchObject({ page: 1, pageSize: 5 });
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('filters by department', async () => {
    const res = await request(app)
      .get('/attendance?department=Sales')
      .set(bearer(adminToken))
      .expect(200);
    expect(
      res.body.data.every((r: { employeeProfile: { department: string } }) => r.employeeProfile.department === 'Sales'),
    ).toBe(true);
  });

  it('filters by employeeId', async () => {
    const res = await request(app)
      .get(`/attendance?employeeId=${profileAId}`)
      .set(bearer(adminToken))
      .expect(200);
    expect(
      res.body.data.every((r: { employeeProfile: { id: string } }) => r.employeeProfile.id === profileAId),
    ).toBe(true);
  });

  it('filters by status', async () => {
    const res = await request(app).get('/attendance?status=HALF_DAY').set(bearer(adminToken)).expect(200);
    expect(res.body.data.every((r: { status: string }) => r.status === 'HALF_DAY')).toBe(true);
  });

  it('rejects a non-admin with 403', async () => {
    const res = await request(app).get('/attendance').set(bearer(empAToken)).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});

describe('POST /attendance/mark-absent (admin)', () => {
  it('marks an employee absent for a given date', async () => {
    const date = new Date(Date.now() + 2 * DAY_MS).toISOString().slice(0, 10);
    const res = await request(app)
      .post('/attendance/mark-absent')
      .set(bearer(adminToken))
      .send({ employeeId: profileBId, date })
      .expect(201);
    expect(res.body.data.status).toBe('ABSENT');
  });

  it('rejects a non-admin with 403', async () => {
    await request(app)
      .post('/attendance/mark-absent')
      .set(bearer(empAToken))
      .send({ employeeId: profileBId, date: new Date().toISOString().slice(0, 10) })
      .expect(403);
  });

  it('rejects a missing employeeId with 422', async () => {
    const res = await request(app)
      .post('/attendance/mark-absent')
      .set(bearer(adminToken))
      .send({ date: new Date().toISOString().slice(0, 10) })
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
