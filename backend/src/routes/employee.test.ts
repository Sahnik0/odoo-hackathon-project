import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { purgeUsers } from '../test/db';
import { signAccessToken } from '../services/token.service';

const app = createApp();
const PREFIX = 'emptest_';
const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

let adminToken: string;
let empAToken: string;
let empBToken: string;
let profileAId: string;
let profileBId: string;

async function makeEmployee(email: string, loginId: string) {
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
          department: 'Engineering',
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
  const empA = await makeEmployee(`${PREFIX}empa@hrms.local`, 'OITESTA20260001');
  const empB = await makeEmployee(`${PREFIX}empb@hrms.local`, 'OITESTB20260002');

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

describe('GET /employees (list, admin-only)', () => {
  it('returns a paginated list with meta for an admin', async () => {
    const res = await request(app).get('/employees?pageSize=5').set(bearer(adminToken)).expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.meta).toMatchObject({ page: 1, pageSize: 5 });
    expect(res.body.meta.total).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('supports department filter + search', async () => {
    const res = await request(app)
      .get('/employees?department=Engineering&search=OITESTA')
      .set(bearer(adminToken))
      .expect(200);
    expect(res.body.data.every((p: { department: string }) => p.department === 'Engineering')).toBe(true);
  });

  it('rejects a non-admin with 403', async () => {
    const res = await request(app).get('/employees').set(bearer(empAToken)).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('rejects an unauthenticated request with 401', async () => {
    await request(app).get('/employees').expect(401);
  });
});

describe('GET /employees/:id + /me (ownership)', () => {
  it('lets an employee read their own profile', async () => {
    const res = await request(app).get(`/employees/${profileAId}`).set(bearer(empAToken)).expect(200);
    expect(res.body.data.id).toBe(profileAId);
  });

  it('returns own profile via /me', async () => {
    const res = await request(app).get('/employees/me').set(bearer(empAToken)).expect(200);
    expect(res.body.data.id).toBe(profileAId);
  });

  it("blocks an employee from reading another employee's profile (403)", async () => {
    await request(app).get(`/employees/${profileBId}`).set(bearer(empAToken)).expect(403);
  });

  it('lets an admin read any profile', async () => {
    await request(app).get(`/employees/${profileBId}`).set(bearer(adminToken)).expect(200);
  });
});

describe('PATCH /employees/:id (field-level RBAC)', () => {
  it('lets an employee edit an allowed field (phone) on their own profile', async () => {
    const res = await request(app)
      .patch(`/employees/${profileAId}`)
      .set(bearer(empAToken))
      .send({ phone: '+91 99999 88888' })
      .expect(200);
    expect(res.body.data.phone).toBe('+91 99999 88888');
  });

  it('blocks an employee from editing an admin-only field (department) → 403', async () => {
    const res = await request(app)
      .patch(`/employees/${profileAId}`)
      .set(bearer(empAToken))
      .send({ department: 'Finance' })
      .expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    // Ensure it was NOT applied.
    const profile = await prisma.employeeProfile.findUnique({ where: { id: profileAId } });
    expect(profile?.department).toBe('Engineering');
  });

  it('escapes stored-XSS in free-text (address)', async () => {
    const res = await request(app)
      .patch(`/employees/${profileAId}`)
      .set(bearer(empAToken))
      .send({ address: '<script>alert(1)</script>' })
      .expect(200);
    expect(res.body.data.address).not.toContain('<script>');
    expect(res.body.data.address).toContain('&lt;script&gt;');
  });

  it('lets an admin edit any field on any employee', async () => {
    const res = await request(app)
      .patch(`/employees/${profileBId}`)
      .set(bearer(adminToken))
      .send({ department: 'Sales', employmentStatus: 'ON_LEAVE' })
      .expect(200);
    expect(res.body.data.department).toBe('Sales');
    expect(res.body.data.employmentStatus).toBe('ON_LEAVE');
  });

  it('rejects an empty update body with 422', async () => {
    const res = await request(app)
      .patch(`/employees/${profileAId}`)
      .set(bearer(empAToken))
      .send({})
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /employees (admin create)', () => {
  it('creates an employee account as admin', async () => {
    const res = await request(app)
      .post('/employees')
      .set(bearer(adminToken))
      .send({ email: `${PREFIX}created@hrms.local`, firstName: 'New', lastName: 'Hire', department: 'Marketing' })
      .expect(201);
    expect(res.body.data.user.email).toBe(`${PREFIX}created@hrms.local`);
    expect(res.body.data.loginId).toMatch(/^OINEHI\d{8}$/);
  });

  it('rejects a non-admin creating an employee (403)', async () => {
    await request(app)
      .post('/employees')
      .set(bearer(empAToken))
      .send({ email: `${PREFIX}nope@hrms.local`, firstName: 'No', lastName: 'Pe' })
      .expect(403);
  });
});

describe('DELETE /employees/:id (soft delete, admin-only)', () => {
  it('soft-deletes an employee as admin', async () => {
    const victim = await makeEmployee(`${PREFIX}victim@hrms.local`, 'OITESTV20260009');
    await request(app).delete(`/employees/${victim.profile!.id}`).set(bearer(adminToken)).expect(204);
    const profile = await prisma.employeeProfile.findUnique({ where: { id: victim.profile!.id } });
    expect(profile?.deletedAt).not.toBeNull();
    const user = await prisma.user.findUnique({ where: { id: victim.id } });
    expect(user?.deletedAt).not.toBeNull();
  });

  it('rejects a non-admin deleting (403)', async () => {
    await request(app).delete(`/employees/${profileBId}`).set(bearer(empBToken)).expect(403);
  });
});
