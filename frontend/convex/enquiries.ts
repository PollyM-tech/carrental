import { validateReferralSource, validateReferralDetails } from "./lib/referral";
import { v, ConvexError } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { normaliseEmail, normalisePhone } from "./lib/identity";
import { calendarDate, nairobiToday, requiredText } from "./lib/vehicle_rules";
import { requireRole } from "./lib/permissions";
const fields = { referralSource: v.optional(v.string()), referralDetails: v.optional(v.string()), requestKey: v.string(), kind: v.union(v.literal("booking"), v.literal("general")), name: v.string(), phone: v.string(), email: v.string(), vehicle: v.string(), pickupDate: v.string(), returnDate: v.string(), pickupLocation: v.string(), returnLocation: v.string(), message: v.string(), website: v.optional(v.string()) };
type EnquiryDetails = { referralSource?: string; referralDetails?: string; requestKey: string; kind: "booking" | "general"; name: string; phone: string; email: string; vehicle: string; pickupDate: string; returnDate: string; pickupLocation: string; returnLocation: string; message: string };
function pickupTimestamp(value: string) {
  calendarDate(value.slice(0, 10));
  if (!/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Choose a valid Kenya pickup/return date and time.");
  return Date.parse(value + ":00+03:00");
}
export const submit = action({ args: fields, handler: async (ctx, args): Promise<{ reference: Id<"movaraEnquiries">; details: EnquiryDetails }> => {
  let details: EnquiryDetails;
  try {
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(args.requestKey) || args.website?.trim()) throw new Error("Please refresh the form and try again.");
    const phone = normalisePhone(args.phone);
    const name = requiredText(args.name, "Name", 120);
    const email = args.email.trim() ? normaliseEmail(args.email) : "";
    if (args.vehicle.length > 120 || args.message.length > 2000 || args.pickupLocation.length > 300 || args.returnLocation.length > 300) throw new Error("Please shorten your enquiry details.");
    if (args.kind === "booking") {
      const start = pickupTimestamp(args.pickupDate), end = pickupTimestamp(args.returnDate);
      if (args.pickupDate.slice(0, 10) < nairobiToday() || end <= start) throw new Error("Pickup must be today or later, and return must be after pickup.");
      requiredText(args.pickupLocation, "Pickup location", 300); requiredText(args.returnLocation, "Return location", 300);
    } else requiredText(args.message, "Message", 2000);
    details = { referralDetails: validateReferralDetails(args.referralDetails, args.referralSource), referralSource: validateReferralSource(args.referralSource), requestKey: args.requestKey, kind: args.kind, name, phone, email, vehicle: args.vehicle.trim(), pickupDate: args.kind === "booking" ? args.pickupDate : "", returnDate: args.kind === "booking" ? args.returnDate : "", pickupLocation: args.kind === "booking" ? args.pickupLocation.trim() : "", returnLocation: args.kind === "booking" ? args.returnLocation.trim() : "", message: args.message.trim() };
  } catch (error) { throw new ConvexError({ code: "INVALID_INPUT", message: error instanceof Error ? error.message : "Check your enquiry details." }); }
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(details.phone));
  const phoneKey = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  const reference: Id<"movaraEnquiries"> = await ctx.runMutation(internal.enquiries.persist, { ...details, phoneKey });
  return { reference, details };
}});
export const persist = internalMutation({ args: { ...fields, phoneKey: v.string() }, handler: async (ctx, args) => {
  const { phoneKey, website: _website, ...details } = args;
  void _website;
  const existing = await ctx.db.query("movaraEnquiries").withIndex("by_request", q => q.eq("requestKey", details.requestKey)).unique();
  if (existing) {
    if (Object.entries(details).some(([key, value]) => existing[key as keyof typeof details] !== value)) throw new ConvexError({ code: "INVALID_INPUT", message: "This request was already saved with different details. Refresh before sending another enquiry." });
    return existing._id;
  }
  const day = nairobiToday();
  for (const [key, limit] of [[`day:${day}`, 100], [`phone:${day}:${phoneKey}`, 5]] as const) {
    const guard = await ctx.db.query("movaraEnquiryLimits").withIndex("by_key", q => q.eq("key", key)).unique();
    if ((guard?.count ?? 0) >= limit) throw new ConvexError({ code: "RATE_LIMIT", message: "Too many enquiries today. Please call Movara for assistance." });
  }
  for (const key of [`day:${day}`, `phone:${day}:${phoneKey}`]) {
    const guard = await ctx.db.query("movaraEnquiryLimits").withIndex("by_key", q => q.eq("key", key)).unique();
    if (guard) await ctx.db.patch(guard._id, { count: guard.count + 1 }); else await ctx.db.insert("movaraEnquiryLimits", { key, day, count: 1 });
  }
  return await ctx.db.insert("movaraEnquiries", { ...details, status: "new", updatedAt: Date.now() });
}});
export const list = query({ args: {}, handler: async ctx => {
  await requireRole(ctx);
  const groups = await Promise.all((["new", "contacted", "closed"] as const).map(status => ctx.db.query("movaraEnquiries").withIndex("by_status", q => q.eq("status", status)).order(status === "new" ? "asc" : "desc").take(50)));
  return groups.flat();
}});
export const review = mutation({ args: { id: v.id("movaraEnquiries"), status: v.union(v.literal("contacted"), v.literal("closed")) }, handler: async (ctx, args) => {
  await requireRole(ctx);
  if (!await ctx.db.get(args.id)) throw new Error("Enquiry not found.");
  await ctx.db.patch(args.id, { status: args.status, updatedAt: Date.now() });
}});
export const cleanupLimits = internalMutation({ args: {}, handler: async ctx => {
  const cutoff = nairobiToday(Date.now() - 3 * 86400000);
  const old = await ctx.db.query("movaraEnquiryLimits").withIndex("by_day", q => q.lt("day", cutoff)).take(500);
  for (const row of old) await ctx.db.delete(row._id);
}});
