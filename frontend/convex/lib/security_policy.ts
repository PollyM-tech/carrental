export const WARNING_AFTER_MS = 30 * 60 * 1000;
export const IDLE_EXPIRES_AFTER_MS = 31 * 60 * 1000;
export const MAX_LOGIN_FAILURES = 5;
export const LOGIN_LOCK_MS = 15 * 60 * 1000;
export const ATTEMPT_LEASE_MS = 90 * 1000;
export function idleDeadline(lastActiveAt: number) { return lastActiveAt + IDLE_EXPIRES_AFTER_MS; }
export function sessionStillValid(session: { userId: string; expirationTime: number; _creationTime: number } | null, userId: string, guard: { secretHash: string; changedAt: number } | null, currentHash: string | undefined, lastActiveAt: number | undefined, now: number) {
  return !!session && session.userId === userId && session.expirationTime > now && !!guard && !!currentHash && guard.secretHash === currentHash && session._creationTime >= guard.changedAt && idleDeadline(lastActiveAt ?? session._creationTime) > now;
}
export type LoginGuard = { failures: number; lockedUntil?: number; pending: { id: string; expiresAt: number }[] };
export function beginLogin(state: LoginGuard | null, id: string, now: number) {
  if (state?.lockedUntil && state.lockedUntil > now) return { allowed: false as const, waitMs: state.lockedUntil - now };
  const fresh = state?.lockedUntil ? { failures: 0, pending: [] } : state ?? { failures: 0, pending: [] };
  const pending = fresh.pending.filter(attempt => attempt.expiresAt > now);
  if (fresh.failures + pending.length >= MAX_LOGIN_FAILURES) return { allowed: false as const, waitMs: pending.length ? Math.max(1000, Math.min(...pending.map(attempt => attempt.expiresAt)) - now) : LOGIN_LOCK_MS };
  return { allowed: true as const, state: { failures: fresh.failures, pending: [...pending, { id, expiresAt: now + ATTEMPT_LEASE_MS }] } };
}
export function finishLogin(state: LoginGuard, id: string, success: boolean, now: number): LoginGuard {
  if (!state.pending.some(attempt => attempt.id === id)) return state;
  if (success) return { failures: 0, pending: [] };
  const failures = state.failures + 1;
  return { failures, pending: state.pending.filter(attempt => attempt.id !== id), ...(failures >= MAX_LOGIN_FAILURES ? { lockedUntil: state.lockedUntil ?? now + LOGIN_LOCK_MS } : {}) };
}
