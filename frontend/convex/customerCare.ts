import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/permissions";
import { normalisePhone } from "./lib/identity";
import { requiredText } from "./lib/vehicle_rules";
import { canEditVerification, requireVerificationChecks, requireReturnOutcome } from "./lib/rental_checks";

export const mine = query({ args: { bookingId: v.id("movaraBookingRequests") }, handler: async (ctx, { bookingId }) => {
  const user = await requireUser(ctx); const booking = await ctx.db.get(bookingId);
  if (!booking || booking.customerId !== user._id) throw new Error("Booking not found.");
  const verification = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", bookingId)).unique();
  return verification ? { updatedAt: verification.updatedAt, revision: verification.revision ?? 0, fullName: verification.fullName, nextOfKinName: verification.nextOfKinName, nextOfKinPhone: verification.nextOfKinPhone, guarantorName: verification.guarantorName, guarantorPhone: verification.guarantorPhone, method: verification.method, status: verification.status, customerMessage: verification.customerMessage ?? "" } : null;
}});
export const submit = mutation({ args: { bookingId: v.id("movaraBookingRequests"), fullName: v.string(), nextOfKinName: v.string(), nextOfKinPhone: v.string(), guarantorName: v.string(), guarantorPhone: v.string(), consentToContacts: v.boolean() }, handler: async (ctx, args) => {
  const user = await requireUser(ctx); const booking = await ctx.db.get(args.bookingId);
  if (!booking || booking.customerId !== user._id || !canEditVerification(booking.status)) throw new Error("This booking cannot be changed. Contact Movara.");
  if (!args.consentToContacts) throw new Error("Confirm permission to provide these contact details.");
  const current = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", args.bookingId)).unique();
  const data = { revision: (current?.revision ?? 0) + 1, consentAt: Date.now(), bookingId: args.bookingId, customerId: user._id, fullName: requiredText(args.fullName, "Full name", 120), nextOfKinName: requiredText(args.nextOfKinName, "Next-of-kin name", 120), nextOfKinPhone: normalisePhone(args.nextOfKinPhone), guarantorName: requiredText(args.guarantorName, "Guarantor name", 120), guarantorPhone: normalisePhone(args.guarantorPhone), method: "in_person" as const, status: "awaiting_in_person" as const, phoneChecked: false, identityChecked: false, licenceChecked: false, ageChecked: false, licenceTenureChecked: false, contactsChecked: false, reviewedAt: undefined, reviewedBy: undefined, customerMessage: undefined, updatedAt: Date.now() };
  if (current) await ctx.db.patch(current._id, data); else await ctx.db.insert("movaraVerification", data);
}});
export const adminDetail = query({ args: { bookingId: v.id("movaraBookingRequests") }, handler: async (ctx, { bookingId }) => {
  await requireRole(ctx); const booking = await ctx.db.get(bookingId); if (!booking) throw new Error("Booking not found.");
  const verification = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", bookingId)).unique();
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", booking.customerId)).unique();
  const history = await ctx.db.query("movaraReturnRecords").withIndex("by_customer", q => q.eq("customerId", booking.customerId)).order("desc").take(30);
  return { booking, verification, standing, history };
}});
export const review = mutation({ args: { bookingId: v.id("movaraBookingRequests"), verificationRevision: v.number(), decision: v.union(v.literal("approved"), v.literal("needs_correction"), v.literal("rejected")), phoneChecked: v.boolean(), identityChecked: v.boolean(), licenceChecked: v.boolean(), ageChecked: v.boolean(), licenceTenureChecked: v.boolean(), contactsChecked: v.boolean(), customerMessage: v.string() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx); const booking = await ctx.db.get(args.bookingId);
  if (!booking || !canEditVerification(booking.status)) throw new Error("Review this customer's checks before approving the booking.");
  const current = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", args.bookingId)).unique();
  if (!current) throw new Error("The customer must provide their name, next-of-kin and guarantor contacts first.");
  if ((current.revision ?? 0) !== args.verificationRevision) throw new Error("Customer details changed. Review the updated details before saving your checks.");
  const checks = { phoneChecked: args.phoneChecked, identityChecked: args.identityChecked, licenceChecked: args.licenceChecked, ageChecked: args.ageChecked, licenceTenureChecked: args.licenceTenureChecked, contactsChecked: args.contactsChecked };
  if (args.decision === "approved") requireVerificationChecks(checks);
  const customerMessage = requiredText(args.customerMessage, "Customer-facing review message", 1000);
  await ctx.db.patch(current._id, { ...checks, status: args.decision, customerMessage, reviewedAt: Date.now(), reviewedBy: user._id, updatedAt: Date.now() });
  await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `verification.${args.decision}:${booking._id}`, occurredAt: Date.now() });
}});
export const recordReturn = mutation({ args: { bookingId: v.id("movaraBookingRequests"), condition: v.union(v.literal("good"), v.literal("damage"), v.literal("not_returned")), rulesFollowed: v.boolean(), disposition: v.union(v.literal("clear"), v.literal("flagged"), v.literal("second_chance")), notes: v.string(), handedOverConfirmed: v.boolean() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx); const booking = await ctx.db.get(args.bookingId);
  if (!booking?.vehicleId || !["approved", "overdue"].includes(booking.status)) throw new Error("Choose an approved rental or an unresolved non-return.");
  if (!args.handedOverConfirmed) throw new Error("Confirm that the vehicle was actually handed over under the manually managed contract.");
  requireReturnOutcome(args.condition, args.rulesFollowed, args.disposition);
  const notes = requiredText(args.notes, "Return findings", 2000);
  await ctx.db.insert("movaraReturnRecords", { ...args, notes, customerId: booking.customerId, vehicleId: booking.vehicleId, recordedBy: user._id, recordedAt: Date.now() });
  await ctx.db.patch(booking._id, { status: args.condition === "not_returned" ? "overdue" : "returned", updatedAt: Date.now() });
  // Never clear an earlier flag automatically just because another rental ended well.
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", booking.customerId)).unique();
  if (!standing || args.disposition !== "clear") {
    const data = { customerId: booking.customerId, status: args.disposition, reason: notes, updatedBy: user._id, updatedAt: Date.now() };
    if (standing) await ctx.db.patch(standing._id, data); else await ctx.db.insert("movaraCustomerStanding", data);
  }
  await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `return.${args.condition}:${booking._id}`, occurredAt: Date.now() });
}});
export const setStanding = mutation({ args: { customerId: v.id("users"), status: v.union(v.literal("flagged"), v.literal("second_chance")), reason: v.string() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx); if (!await ctx.db.get(args.customerId)) throw new Error("Customer not found.");
  const reason = requiredText(args.reason, "Reason", 2000);
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", args.customerId)).unique();
  const data = { ...args, reason, updatedBy: user._id, updatedAt: Date.now() };
  if (standing) await ctx.db.patch(standing._id, data); else await ctx.db.insert("movaraCustomerStanding", data);
  await ctx.db.insert("accessEvents", { subjectId: args.customerId, actorId: user._id, action: `customer.${args.status}`, occurredAt: Date.now() });
}});
