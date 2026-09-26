import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'whylode_approver';
const NAME_COOKIE = 'whylode_approver_name';

// The cookie holds an HMAC of a fixed label, never the admin key itself.
function sessionValue(): string | null {
  const key = process.env.WHYLODE_ADMIN_KEY;
  if (!key) return null;
  return createHmac('sha256', key).update('whylode-approver-v1').digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function keyMatches(candidate: string): boolean {
  const key = process.env.WHYLODE_ADMIN_KEY;
  return !!key && safeEqual(candidate, key);
}

export async function isApprover(): Promise<boolean> {
  const expected = sessionValue();
  const got = (await cookies()).get(SESSION_COOKIE)?.value;
  return !!expected && !!got && safeEqual(got, expected);
}

export async function approverName(): Promise<string | null> {
  return (await cookies()).get(NAME_COOKIE)?.value ?? null;
}

export async function startApproverSession(name: string): Promise<void> {
  const value = sessionValue();
  if (!value) throw new Error('Approvals are not configured.');
  const jar = await cookies();
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  };
  jar.set(SESSION_COOKIE, value, opts);
  jar.set(NAME_COOKIE, name, opts);
}

export async function endApproverSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(NAME_COOKIE);
}
