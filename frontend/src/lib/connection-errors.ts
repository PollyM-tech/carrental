/** Classifies transport failures without exposing credentials or treating them as a bad password. */
export function isConnectionError(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== "object" || depth > 3) return false;
  const value = error as { message?: unknown; code?: unknown; cause?: unknown; errors?: unknown[] };
  if (typeof value.code === "string" && ["ETIMEDOUT", "ENETUNREACH", "ECONNRESET", "ECONNREFUSED", "EAI_AGAIN", "ENOTFOUND", "UND_ERR_CONNECT_TIMEOUT"].includes(value.code)) return true;
  if (typeof value.message === "string" && /fetch failed|failed to fetch|network request failed|networkerror|network error|unable to reach movara/i.test(value.message)) return true;
  return isConnectionError(value.cause, depth + 1) || (Array.isArray(value.errors) && value.errors.some(item => isConnectionError(item, depth + 1)));
}
/** Retry an idempotent read once; never use this for payment or other write operations. */
export async function retryConnectionRead<T>(read: () => Promise<T>, delayMs = 200): Promise<T> {
  try { return await read(); }
  catch (error) { if (!isConnectionError(error)) throw error; }
  await new Promise(resolve => setTimeout(resolve, delayMs));
  return read();
}
