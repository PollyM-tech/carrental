import { ConvexError } from "convex/values";
import { isConnectionError } from "./connection-errors.ts";
const publicCodes = new Set(["INVALID_INPUT", "BOOKING_UNAVAILABLE", "REQUEST_CONFLICT", "REGISTRATION_REQUIRED", "AUTH_REQUIRED", "RATE_LIMIT"]);
/** Only deliberately public application errors belong in customer-facing messages. */
export function publicErrorMessage(error: unknown, fallback = "Unable to complete your request. Please try again or contact Movara."): string {
  if (isConnectionError(error)) return "Unable to reach Movara. Check your connection and try again.";
  if (error instanceof ConvexError && error.data && typeof error.data === "object") {
    const data = error.data as Record<string, unknown>;
    if (typeof data.code === "string" && publicCodes.has(data.code) && typeof data.message === "string" && data.message.length > 0 && data.message.length <= 500 && !/https?:\/\/|\.convex\.(site|cloud)|\[CONVEX|request id|uncaught|\n\s*at\s/i.test(data.message)) return data.message;
  }
  return fallback;
}
