import request from 'supertest';
import type { Response } from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { purgeUsers } from '../test/db';
import { clearMaildev, latestEmailTo, extractToken } from '../test/maildev';

const app = createApp();
const PREFIX = 'authtest_';
const PW = 'Password1';

const email = (name: string) => `${PREFIX}${name}@hrms.local`;

// Pull the raw refresh token out of the Set-Cookie header.
function refreshCookie(res: Response): string | undefined {
  const cookies = res.headers['set-cookie'] as unknown as string[] | undefined;
  const raw = cookies?.find((c) => c.startsWith('refreshToken='));
  return raw?.split(';')[0].split('=')[1];
}

/** Register + verify a user, returning nothing (user is left verified). */
async function registerAndVerify(addr: string): Promise<void> {
  await request(app)
    .post('/auth/register')
    .send({ email: addr, password: PW, firstName: 'Test', lastName: 'User' })
    .expect(201);
  const mail = await latestEmailTo(addr);
  const token = mail && extractToken(mail);
  await request(app).post('/auth/verify-email').send({ token }).expect(200);
}

beforeAll(async () => {
  await purgeUsers(PREFIX);
  await clearMaildev();
});

afterAll(async () => {
  await purgeUsers(PREFIX);
  await prisma.$disconnect();
});

describe('POST /auth/register', () => {
  it('creates an unverified EMPLOYEE and sends a verification email', async () => {
    const addr = email('register');
    const res = await request(app)
      .post('/auth/register')
      .send({ email: addr, password: PW, firstName: 'Reg', lastName: 'Ister' })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(addr);

    const user = await prisma.user.findUnique({ where: { email: addr }, include: { profile: true } });
    expect(user?.emailVerified).toBe(false);
    expect(user?.role).toBe('EMPLOYEE');
    expect(user?.profile?.loginId).toMatch(/^OI[A-Z]{4}\d{8}$/);

    const mail = await latestEmailTo(addr);
    expect(mail?.subject).toMatch(/verify/i);
    expect(extractToken(mail!)).toBeTruthy();
  });

  it('rejects invalid input with 422', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short', firstName: '', lastName: 'X' })
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.fields).toBeDefined();
  });

  it('rejects a duplicate email with 409', async () => {
    const addr = email('dupe');
    const body = { email: addr, password: PW, firstName: 'Du', lastName: 'Pe' };
    await request(app).post('/auth/register').send(body).expect(201);
    const res = await request(app).post('/auth/register').send(body).expect(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});

describe('POST /auth/verify-email', () => {
  it('verifies the account and creates an EMAIL_VERIFIED notification', async () => {
    const addr = email('verify');
    await request(app)
      .post('/auth/register')
      .send({ email: addr, password: PW, firstName: 'Ver', lastName: 'Ify' })
      .expect(201);
    const mail = await latestEmailTo(addr);
    const token = extractToken(mail!);

    await request(app).post('/auth/verify-email').send({ token }).expect(200);

    const user = await prisma.user.findUnique({ where: { email: addr } });
    expect(user?.emailVerified).toBe(true);
    const notif = await prisma.notification.findFirst({
      where: { userId: user!.id, type: 'EMAIL_VERIFIED' },
    });
    expect(notif).not.toBeNull();
  });

  it('rejects an invalid token with 400', async () => {
    const res = await request(app)
      .post('/auth/verify-email')
      .send({ token: 'deadbeef' })
      .expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
});

describe('POST /auth/login', () => {
  it('blocks login until the email is verified (403)', async () => {
    const addr = email('unverified');
    await request(app)
      .post('/auth/register')
      .send({ email: addr, password: PW, firstName: 'Un', lastName: 'Verified' })
      .expect(201);
    const res = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('logs in a verified user and sets a refresh cookie', async () => {
    const addr = email('login');
    await registerAndVerify(addr);
    const res = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(200);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.email).toBe(addr);
    const cookies = res.headers['set-cookie'] as unknown as string[];
    expect(cookies.some((c) => c.startsWith('refreshToken=') && /HttpOnly/i.test(c))).toBe(true);
  });

  it('rejects a wrong password with 401', async () => {
    const addr = email('login'); // already verified above
    const res = await request(app)
      .post('/auth/login')
      .send({ email: addr, password: 'Wrongpass1' })
      .expect(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('rejects missing password with 422', async () => {
    const res = await request(app).post('/auth/login').send({ email: email('login') }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('POST /auth/refresh', () => {
  it('rotates the refresh token and issues a new access token', async () => {
    const addr = email('refresh');
    await registerAndVerify(addr);
    const login = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(200);
    const first = refreshCookie(login)!;

    const rotated = await request(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${first}`)
      .expect(200);
    expect(rotated.body.data.accessToken).toBeTruthy();
    const second = refreshCookie(rotated)!;
    expect(second).not.toBe(first);
  });

  it('detects reuse of a rotated token and revokes the family (401)', async () => {
    const addr = email('reuse');
    await registerAndVerify(addr);
    const login = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(200);
    const first = refreshCookie(login)!;

    // Rotate once → `first` is now spent.
    const rotated = await request(app)
      .post('/auth/refresh')
      .set('Cookie', `refreshToken=${first}`)
      .expect(200);
    const second = refreshCookie(rotated)!;

    // Replay the spent token → theft detected.
    await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${first}`).expect(401);

    // The whole family (incl. the valid `second`) is now revoked.
    await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${second}`).expect(401);
  });

  it('rejects a request with no refresh cookie (401)', async () => {
    await request(app).post('/auth/refresh').expect(401);
  });
});

describe('POST /auth/logout', () => {
  it('revokes the refresh token', async () => {
    const addr = email('logout');
    await registerAndVerify(addr);
    const login = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(200);
    const token = refreshCookie(login)!;

    await request(app).post('/auth/logout').set('Cookie', `refreshToken=${token}`).expect(204);
    // Token no longer usable.
    await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${token}`).expect(401);
  });
});

describe('forgot / reset password', () => {
  it('sends a reset email and lets the user reset + log in with the new password', async () => {
    const addr = email('reset');
    await registerAndVerify(addr);
    // Establish a refresh token that must be invalidated by the reset.
    const login = await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(200);
    const oldRefresh = refreshCookie(login)!;

    await request(app).post('/auth/forgot-password').send({ email: addr }).expect(200);
    const mail = await latestEmailTo(addr);
    expect(mail?.subject).toMatch(/reset/i);
    const token = extractToken(mail!);

    const newPw = 'Newpass2';
    await request(app).post('/auth/reset-password').send({ token, password: newPw }).expect(200);

    // Old refresh tokens invalidated (Section 2).
    await request(app).post('/auth/refresh').set('Cookie', `refreshToken=${oldRefresh}`).expect(401);
    // Old password no longer works, new one does.
    await request(app).post('/auth/login').send({ email: addr, password: PW }).expect(401);
    await request(app).post('/auth/login').send({ email: addr, password: newPw }).expect(200);
  });

  it('returns a generic 200 for an unknown email (no enumeration)', async () => {
    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: email('ghost') })
      .expect(200);
    expect(res.body.success).toBe(true);
  });

  it('rejects an invalid reset token with 400', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'deadbeef', password: 'Another3' })
      .expect(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });
});
