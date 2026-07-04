// Test helper: read/clear emails from the maildev REST API (:1080). Used to prove
// real email delivery (Phase 2 DoD) and to extract verification/reset tokens from
// the delivered links.

const MAILDEV_URL = process.env.MAILDEV_URL ?? 'http://localhost:1080';

interface MaildevEmail {
  id: string;
  subject: string;
  text: string;
  html: string;
  to: { address: string; name?: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const f: (url: string, init?: any) => Promise<any> = (globalThis as any).fetch;

export async function clearMaildev(): Promise<void> {
  await f(`${MAILDEV_URL}/email/all`, { method: 'DELETE' });
}

export async function latestEmailTo(address: string): Promise<MaildevEmail | undefined> {
  const res = await f(`${MAILDEV_URL}/email`);
  const emails: MaildevEmail[] = await res.json();
  return emails.filter((e) => e.to?.some((t) => t.address === address)).pop();
}

/** Extract the `token=...` value from an email's text/html body. */
export function extractToken(email: MaildevEmail): string | undefined {
  const match = (email.text || email.html || '').match(/token=([a-f0-9]+)/);
  return match?.[1];
}
