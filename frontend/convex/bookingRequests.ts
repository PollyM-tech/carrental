import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole, requireUser } from "./lib/permissions";
import { normalisePhone } from "./lib/identity";
import { availableFor, rentalEstimate, requiredText } from "./lib/vehicle_rules";
import { reservedConflict, canEditVerification, requireVerificationChecks, IN_PERSON_APPROVED_MESSAGE } from "./lib/rental_checks";
import { bookingDates, bookingText, requireBookingOwner } from "./lib/booking_input";

export const mine = query({
  args: {},
  handler: async ctx => {
    const user = await requireUser(ctx);
    return await ctx.db.query("movaraBookingRequests").withIndex("by_customer", q => q.eq("customerId", user._id)).order("desc").take(100);
  },
});
export const create = mutation({
  args: { requestKey: v.string(), vehicleId: v.id("movaraVehicles"), pickupDate: v.string(), returnDate: v.string(), pickupLocation: v.string(), phone: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (!/^[a-zA-Z0-9-]{16,64}$/.test(args.requestKey)) throw new Error("Refresh this booking form and retry.");
    const rentalDays = bookingDates(args.pickupDate, args.returnDate);
    const pickupLocation = bookingText(args.pickupLocation, "Pickup location", 200);
    const phone = normalisePhone(args.phone);
    const existing = await ctx.db.query("movaraBookingRequests").withIndex("by_customer_key", q => q.eq("customerId", user._id).eq("requestKey", args.requestKey)).unique();
    if (existing) {
      if (existing.vehicleId !== args.vehicleId || existing.pickupDate !== args.pickupDate || existing.returnDate !== args.returnDate || existing.pickupLocation !== pickupLocation || existing.phone !== phone) throw new Error("This request was already received with different details. Refresh your requests before submitting another one.");
      return existing._id;
    }
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) throw new Error("Select a current vehicle.");
    const blocks = await ctx.db.query("movaraVehicleBlocks").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
    const rentals = await ctx.db.query("movaraBookingRequests").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
    if (reservedConflict(rentals, args.pickupDate, args.returnDate)) throw new Error("This vehicle is reserved for those dates or has not yet been returned.");
    if (!availableFor(vehicle, args.pickupDate, args.returnDate, blocks)) throw new Error("This vehicle is unavailable or its compliance does not cover your dates. Choose another vehicle or dates.");
    const vehiclePreference = vehicle.name;
    const dailyRateKes = vehicle.pricePerDay;
    const estimatedRentalKes = rentalEstimate(dailyRateKes, rentalDays);
    if (phone !== user.phone) await ctx.db.patch(user._id, { phone, phoneVerificationTime: undefined });
    const id = await ctx.db.insert("movaraBookingRequests", { customerId: user._id, requestKey: args.requestKey, vehiclePreference, vehicleId: vehicle._id, dailyRateKes, estimatedRentalKes, pickupDate: args.pickupDate, returnDate: args.returnDate, rentalDays, pickupLocation, phone, status: "requested", updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: "booking.requested", occurredAt: Date.now() });
    return id;
  },
});
export const cancel = mutation({
  args: { id: v.id("movaraBookingRequests") },
  handler: async (ctx, { id }) => {
    const user = await requireUser(ctx);
    const booking = await ctx.db.get(id);
    requireBookingOwner(booking, user._id);
    if (booking!.status === "cancelled") return;
    if (!canEditVerification(booking!.status)) throw new Error("Contact Movara to change an approved rental.");
    await ctx.db.patch(id, { status: "cancelled", updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: "booking.request_cancelled", occurredAt: Date.now() });
  },
});
export const staffList = query({
  args: {},
  handler: async ctx => {
    await requireRole(ctx, "front_desk", "finance", "kyc_reviewer");
    const rows = await ctx.db.query("movaraBookingRequests").order("desc").take(100);
    return await Promise.all(rows.map(async row => ({ ...row, email: (await ctx.db.get(row.customerId))?.email ?? "" })));
  },
});
export const review = mutation({
  args: { id: v.id("movaraBookingRequests"), status: v.union(v.literal("in_review"), v.literal("cancelled")) },
  handler: async (ctx, { id, status }) => {
    const { user } = await requireRole(ctx, "front_desk");
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking request not found.");
    if (!canEditVerification(booking.status)) throw new Error("Only pending requests can be changed here. Use Cancel approval for an approved booking before handover.");
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: "booking.request_" + status, occurredAt: Date.now() });
  },
});
export const reopen = mutation({
  args: { id: v.id("movaraBookingRequests") },
  handler: async (ctx, { id }) => {
    const { user } = await requireRole(ctx, "front_desk");
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking request not found.");
    if (booking.status !== "cancelled") throw new Error("Only cancelled requests can be reopened.");
    await ctx.db.patch(id, { status: "in_review", updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `booking.request_reopened:${id}`, occurredAt: Date.now() });
  },
});

export const approve = mutation({ args: {
  id: v.id("movaraBookingRequests"),
  manualClearance: v.optional(v.object({ contractSigned: v.boolean(), requirementsMet: v.boolean() })),
  verification: v.optional(v.object({ revision: v.number(), updatedAt: v.number(), phoneChecked: v.boolean(), identityChecked: v.boolean(), licenceChecked: v.boolean(), ageChecked: v.boolean(), licenceTenureChecked: v.boolean(), contactsChecked: v.boolean(), customerMessage: v.string() })),
}, handler: async (ctx, { id, verification: submitted, manualClearance }) => {
  const { user } = await requireRole(ctx); const booking = await ctx.db.get(id);
  if (booking?.status === "approved") return;
  if (!booking || !booking.vehicleId || !canEditVerification(booking.status)) throw new Error("This request cannot be approved.");
  const verification = await ctx.db.query("movaraVerification").withIndex("by_booking", q => q.eq("bookingId", id)).unique();
  if (manualClearance && submitted) throw new Error("Choose either signed-contract clearance or the verification checklist.");
  if (manualClearance) {
    if (!manualClearance.contractSigned || !manualClearance.requirementsMet) throw new Error("Confirm the paper contract is signed and all in-person requirements are met before approving.");
  } else if (submitted) {
    if (!verification) throw new Error("The customer must save their name, next-of-kin and guarantor contacts first.");
    if ((verification.revision ?? 0) !== submitted.revision || verification.updatedAt !== submitted.updatedAt) throw new Error("Verification details changed. Review the latest checks before approving.");
    requireVerificationChecks(submitted);
  } else if (verification?.status !== "approved") throw new Error("Complete and approve the in-person identity, licence and contact checks first.");
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", booking.customerId)).unique();
  if (standing?.status === "flagged") throw new Error("This customer is flagged. Record an explicit second-chance decision before approving another rental.");
  const vehicle = await ctx.db.get(booking.vehicleId); if (!vehicle) throw new Error("Vehicle not found.");
  const blocks = await ctx.db.query("movaraVehicleBlocks").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
  const rentals = await ctx.db.query("movaraBookingRequests").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
  bookingDates(booking.pickupDate, booking.returnDate);
  if (!availableFor(vehicle, booking.pickupDate, booking.returnDate, blocks) || reservedConflict(rentals, booking.pickupDate, booking.returnDate, id)) throw new Error("This car is no longer available or compliant for these dates.");
  if (submitted && verification) {
    const checks = { phoneChecked: submitted.phoneChecked, identityChecked: submitted.identityChecked, licenceChecked: submitted.licenceChecked, ageChecked: submitted.ageChecked, licenceTenureChecked: submitted.licenceTenureChecked, contactsChecked: submitted.contactsChecked };
    const customerMessage = requiredText(submitted.customerMessage.trim() || IN_PERSON_APPROVED_MESSAGE, "Customer-facing review message", 1000);
    await ctx.db.patch(verification._id, { ...checks, customerMessage, status: "approved", reviewedBy: user._id, reviewedAt: Date.now(), updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `verification.approved:${id}`, occurredAt: Date.now() });
  }
  await ctx.db.patch(id, { status: "approved", approvalVersion: (booking.approvalVersion ?? 0) + 1, manualClearance: manualClearance ? { ...manualClearance, recordedAt: Date.now() } : undefined, updatedAt: Date.now() });
  await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `booking.${manualClearance ? "approved_in_person" : "approved"}:${id}`, occurredAt: Date.now() });
}});

export const cancelApproval = mutation({
  args: { id: v.id("movaraBookingRequests"), approvalVersion: v.number(), notHandedOverConfirmed: v.boolean() },
  handler: async (ctx, { id, approvalVersion, notHandedOverConfirmed }) => {
    const { user } = await requireRole(ctx);
    const booking = await ctx.db.get(id);
    if (!booking) throw new Error("Booking not found.");
    if (!notHandedOverConfirmed) throw new Error("Confirm the vehicle has not been handed over before cancelling approval.");
    if ((booking.approvalVersion ?? 0) !== approvalVersion) throw new Error("The approval has changed. Review the current booking before cancelling it.");
    if (booking.status === "in_review") return;
    if (booking.status !== "approved") throw new Error("Only an approved booking can have its approval cancelled.");
    const outcome = await ctx.db.query("movaraReturnRecords").withIndex("by_booking", q => q.eq("bookingId", id)).first();
    if (outcome) throw new Error("A rental outcome is already recorded. Approval cannot be cancelled.");
    await ctx.db.patch(id, { status: "in_review", manualClearance: undefined, updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `booking.approval_cancelled:${id}`, occurredAt: Date.now() });
  },
});
