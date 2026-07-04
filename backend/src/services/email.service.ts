import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../lib/logger';

// Lazily-created transporter → maildev in dev (Section 3, no paid provider).
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      // maildev (dev default) accepts anonymous connections; a real provider
      // (Gmail SMTP, etc.) needs SMTP_USER/SMTP_PASS set in .env.
      ...(env.SMTP_USER && env.SMTP_PASS
        ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
        : {}),
    });
  }
  return transporter;
}

async function send(to: string, subject: string, html: string, text: string): Promise<void> {
  await getTransporter().sendMail({ from: env.SMTP_FROM, to, subject, html, text });
  logger.info({ to, subject }, 'Email sent');
}

export async function sendVerificationEmail(to: string, rawToken: string): Promise<void> {
  const link = `${env.APP_WEB_URL}/verify-email?token=${rawToken}`;
  await send(
    to,
    'Verify your HRMS email',
    `<p>Welcome to HRMS. Verify your email to activate your account:</p>
     <p><a href="${link}">Verify email</a></p>
     <p>This link expires in ${env.EMAIL_VERIFY_TTL_HOURS} hours.</p>`,
    `Verify your HRMS email: ${link} (expires in ${env.EMAIL_VERIFY_TTL_HOURS}h)`,
  );
}

export async function sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
  const link = `${env.APP_WEB_URL}/reset-password?token=${rawToken}`;
  await send(
    to,
    'Reset your HRMS password',
    `<p>A password reset was requested for your HRMS account.</p>
     <p><a href="${link}">Reset password</a></p>
     <p>This link expires in ${env.PASSWORD_RESET_TTL_HOURS} hour(s). If you didn't request this, ignore this email.</p>`,
    `Reset your HRMS password: ${link} (expires in ${env.PASSWORD_RESET_TTL_HOURS}h)`,
  );
}
