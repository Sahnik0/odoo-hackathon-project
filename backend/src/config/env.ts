import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

// Validate env at boot — fail fast on misconfiguration (trust boundary).
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().url(),
  CORS_ORIGIN: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REFRESH_TOKEN_TTL_DAYS_REMEMBER: z.coerce.number().int().positive().default(30),
  BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(12),

  EMAIL_VERIFY_TTL_HOURS: z.coerce.number().int().positive().default(24),
  PASSWORD_RESET_TTL_HOURS: z.coerce.number().int().positive().default(1),
  EMAIL_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  // Optional — maildev (dev default) accepts anonymous connections. Set both
  // to authenticate against a real provider (e.g. Gmail SMTP + an app password).
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('HRMS <no-reply@hrms.local>'),

  APP_WEB_URL: z.string().url().default('http://localhost:3000'),

  ORG_TIMEZONE: z.string().default('Asia/Kolkata'),
  HALF_DAY_THRESHOLD_HOURS: z.coerce.number().positive().default(4),
  LEAVE_DEFAULT_PAID: z.coerce.number().int().nonnegative().default(18),
  LEAVE_DEFAULT_SICK: z.coerce.number().int().nonnegative().default(10),

  UPLOAD_DIR: z.string().default('src/uploads'),
  MAX_IMAGE_MB: z.coerce.number().positive().default(5),
  MAX_DOC_MB: z.coerce.number().positive().default(10),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  // eslint-disable-next-line no-console -- logger not yet constructed at this point
  console.error('❌ Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
