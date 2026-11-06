import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/permissions";
import { requiredText } from "./lib/vehicle_rules";
import { deleteUserSessions } from "./lib/session_guard";
const kind = v.union(v.literal("access"), v.literal("correction"), v.literal("deletion"));
export const mine = query({ args: {}, handler: async ctx => {
  const user = await requireUser(ctx);
  return await ctx.db.query("movaraDataRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).order("desc").take(50);
}});
export const create = mutation({ args: { kind, details: v.string() }, handler: async (ctx, args) => {
  const user = await requireUser(ctx);
  const details = requiredText(args.details, "Request details", 1000);
  const rows = await ctx.db.query("movaraDataRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  if (rows.some(row => row.kind === args.kind && ["pending", "in_review"].includes(row.status))) throw new Error("You already have an open request of this type.");
  if (rows.filter(row => row._creationTime > Date.now() - 86400000).length >= 3) throw new Error("You can submit up to three privacy requests per day. Contact Movara if urgent.");
  await ctx.db.insert("movaraDataRequests", { customerId: user._id, kind: args.kind, details, status: "pending", customerMessage: "", updatedAt: Date.now() });
}});
export const exportMine = query({ args: {}, handler: async ctx => {
  const user = await requireUser(ctx);
  const bookings = await ctx.db.query("movaraBookingRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  const verification = await Promise.all(bookings.map(async booking => {
    const row = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", booking._id)).unique();
    return row ? { bookingId: row.bookingId, fullName: row.fullName, nextOfKinName: row.nextOfKinName, nextOfKinPhone: row.nextOfKinPhone, guarantorName: row.guarantorName, guarantorPhone: row.guarantorPhone, status: row.status, customerMessage: row.customerMessage } : null;
  }));
  const receipts = await ctx.db.query("movaraHandovers").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  return { payments: receipts.map(row => ({ bookingId: row.bookingId, rentalKes: row.rentalKes, depositKes: row.depositKes, receivedKes: row.receivedKes, paidAt: row.paidAt, status: row.status, releasedAt: row.releasedAt, refundedKes: row.refund?.refundedKes, depositReturnedKes: row.depositSettlement?.returnedKes })), generatedAt: Date.now(), account: { email: user.email, phone: user.phone, name: user.name }, bookings: bookings.map(row => ({ reference: row._id, name: row.customerName, vehicle: row.vehiclePreference, pickupDate: row.pickupDate, returnDate: row.returnDate, pickupLocation: row.pickupLocation, phone: row.phone, status: row.status, estimatedRentalKes: row.estimatedRentalKes })), verification: verification.filter(Boolean) };
}});
export const list = query({ args: {}, handler: async ctx => {
  await requireRole(ctx);
  const groups = await Promise.all((["pending", "in_review", "completed", "declined"] as const).map(status => ctx.db.query("movaraDataRequests").withIndex("by_status", q => q.eq("status", status)).order(status === "pending" || status === "in_review" ? "asc" : "desc").take(50)));
  const rows = groups.flat();
  return await Promise.all(rows.map(async row => ({ ...row, email: (await ctx.db.get(row.customerId))?.email ?? "Account deleted" })));
}});
export const review = mutation({ args: { id: v.id("movaraDataRequests"), status: v.union(v.literal("in_review"), v.literal("completed"), v.literal("declined")), customerMessage: v.string() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx);
  const row = await ctx.db.get(args.id); if (!row) throw new Error("Request not found.");
  if (["completed", "declined"].includes(row.status)) throw new Error("This request is already closed.");
  if (row.kind === "deletion" && args.status === "completed") throw new Error("Use Delete account to complete a deletion request, or explain a retention hold.");
  const customerMessage = requiredText(args.customerMessage, "Customer response", 1000);
  await ctx.db.patch(row._id, { status: args.status, customerMessage, updatedAt: Date.now() });
  await ctx.db.insert("accessEvents", { subjectId: row.customerId, actorId: user._id, action: `privacy.${args.status}:${row._id}`, occurredAt: Date.now() });
}});
export const eraseAccount = mutation({ args: { id: v.id("movaraDataRequests"), confirmed: v.boolean() }, handler: async (ctx, args) => {
  await requireRole(ctx);
  if (!args.confirmed) throw new Error("Confirm account deletion first.");
  const request = await ctx.db.get(args.id);
  if (!request || request.kind !== "deletion") throw new Error("Choose a deletion request.");
  if (request.status === "completed") return;
  if (request.status === "declined") throw new Error("This request is closed.");
  const user = await ctx.db.get(request.customerId);
  if (!user || user.email === "movaracarhire@gmail.com") throw new Error("This account cannot be deleted here.");
  const bookings = await ctx.db.query("movaraBookingRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", user._id)).unique();
  const handovers = await ctx.db.query("movaraHandovers").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  const outcomes = await ctx.db.query("movaraReturnRecords").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  if (handovers.length || outcomes.length || bookings.some(row => ["approved", "overdue", "returned"].includes(row.status)) || standing?.status === "flagged") throw new Error("Rental or dispute records require a retention review. Explain the hold to the customer; this action cannot erase rental history.");
  await deleteUserSessions(ctx, user._id);
  const accounts = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", q => q.eq("userId", user._id)).collect();
  for (const account of accounts) {
    const codes = await ctx.db.query("authVerificationCodes").withIndex("accountId", q => q.eq("accountId", account._id)).collect();
    for (const code of codes) await ctx.db.delete(code._id);
    await ctx.db.delete(account._id);
  }
  for (const booking of bookings) {
    const verification = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", booking._id)).unique();
    if (verification) await ctx.db.delete(verification._id);
    await ctx.db.delete(booking._id);
  }
  const guard = await ctx.db.query("movaraCredentialGuards").withIndex("by_user", q => q.eq("userId", user._id)).unique();
  if (guard) await ctx.db.delete(guard._id);
  if (standing) await ctx.db.delete(standing._id);
  const memberships = await ctx.db.query("staffMemberships").withIndex("by_user", q => q.eq("userId", user._id)).collect();
  for (const membership of memberships) await ctx.db.delete(membership._id);
  const events = await ctx.db.query("accessEvents").withIndex("by_subject", q => q.eq("subjectId", user._id)).collect();
  for (const event of events) await ctx.db.delete(event._id);
  const requests = await ctx.db.query("movaraDataRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).collect();
  for (const row of requests) if (row._id !== request._id) await ctx.db.delete(row._id);
  await ctx.db.patch(request._id, { details: "Removed after account deletion", status: "completed", customerMessage: "Account and pending-request data deleted.", updatedAt: Date.now() });
  await ctx.db.delete(user._id);
}});
