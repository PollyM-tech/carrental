import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { reservedConflict } from "./lib/rental_checks";
import { requireRole } from "./lib/permissions";
import { nairobiToday, positiveInteger, requiredText } from "./lib/vehicle_rules";
export const detail = query({ args: { bookingId: v.id("movaraBookingRequests") }, handler: async (ctx, { bookingId }) => {
  await requireRole(ctx);
  return await ctx.db.query("movaraHandovers").withIndex("by_booking", q => q.eq("bookingId", bookingId)).unique();
}});
export const recordReceipt = mutation({ args: {
  bookingId: v.id("movaraBookingRequests"), rentalKes: v.number(), depositKes: v.number(), receivedKes: v.number(),
  receivingDetails: v.string(), transactionCode: v.string(), paidAt: v.number(),
  contractSigned: v.boolean(), clearanceConfirmed: v.boolean(), receivingAccountChecked: v.boolean(),
}, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx);
  const booking = await ctx.db.get(args.bookingId);
  if (!booking || booking.status !== "approved") throw new Error("Approve the cleared booking before recording payment.");
  if (!args.contractSigned || !args.clearanceConfirmed || !args.receivingAccountChecked) throw new Error("Confirm in-person clearance, signed paper contract and the actual transaction in the receiving account.");
  const rentalKes = positiveInteger(args.rentalKes, "Agreed rental", 10000000);
  if (!Number.isSafeInteger(args.depositKes) || args.depositKes < 0 || args.depositKes > 10000000) throw new Error("Enter the agreed deposit as a non-negative whole KES amount.");
  const receivedKes = positiveInteger(args.receivedKes, "Verified received amount", 20000000);
  if (receivedKes !== rentalKes + args.depositKes) throw new Error("Verified receipt must match the agreed rental plus deposit.");
  const transactionCode = args.transactionCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(transactionCode)) throw new Error("Enter the actual 10-character M-Pesa transaction code.");
  if (!Number.isFinite(args.paidAt) || args.paidAt > Date.now() + 120000 || args.paidAt < booking.updatedAt - 60000) throw new Error("Enter a valid payment time.");
  const receivingDetails = requiredText(args.receivingDetails, "Verified receiving account and recipient", 200);
  const existing = await ctx.db.query("movaraHandovers").withIndex("by_booking", q => q.eq("bookingId", booking._id)).unique();
  if (existing) {
    if (existing.status === "verified" && existing.transactionCode === transactionCode && existing.rentalKes === rentalKes && existing.depositKes === args.depositKes && existing.receivingDetails === receivingDetails && existing.paidAt === args.paidAt) return existing._id;
    throw new Error("A receipt is already recorded for this booking. Do not overwrite a verified transaction.");
  }
  const duplicate = await ctx.db.query("movaraHandovers").withIndex("by_transaction", q => q.eq("transactionCode", transactionCode)).unique();
  if (duplicate) throw new Error("This transaction is already recorded on another booking.");
  const id = await ctx.db.insert("movaraHandovers", { bookingId: booking._id, customerId: booking.customerId, rentalKes, depositKes: args.depositKes, receivedKes, receivingDetails, transactionCode, paidAt: args.paidAt, contractSigned: true, clearanceConfirmed: true, status: "verified", verifiedBy: user._id, verifiedAt: Date.now() });
  await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `handover.payment_verified:${booking._id}`, occurredAt: Date.now() });
  return id;
}});
export const release = mutation({ args: { bookingId: v.id("movaraBookingRequests"), confirmed: v.boolean() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx); const booking = await ctx.db.get(args.bookingId);
  if (!args.confirmed || !booking?.vehicleId || booking.status !== "approved") throw new Error("Confirm release of an approved booking.");
  const handover = await ctx.db.query("movaraHandovers").withIndex("by_booking", q => q.eq("bookingId", booking._id)).unique();
  if (!handover || handover.status !== "verified" || !handover.contractSigned || !handover.clearanceConfirmed) throw new Error("Record the signed contract, clearance and verified receipt before releasing the vehicle.");
  if (handover.releasedAt) return;
  const vehicle = await ctx.db.get(booking.vehicleId); const today = nairobiToday();
  if (!vehicle || vehicle.archived || ["maintenance", "unavailable"].includes(vehicle.status) || !vehicle.insuranceExpiresOn || vehicle.insuranceExpiresOn < booking.returnDate || !vehicle.inspectionExpiresOn || vehicle.inspectionExpiresOn < booking.returnDate) throw new Error("Vehicle is not ready or compliant for release.");
  if (booking.pickupDate > today || booking.returnDate <= today) throw new Error("Release must be within the agreed rental dates.");
  const standing = await ctx.db.query("movaraCustomerStanding").withIndex("by_customer", q => q.eq("customerId", booking.customerId)).unique();
  if (standing?.status === "flagged") throw new Error("Resolve the customer flag before vehicle release.");
  const blocks = await ctx.db.query("movaraVehicleBlocks").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
  if (blocks.some(block => block.startsOn < booking.returnDate && block.endsOn > booking.pickupDate)) throw new Error("A maintenance block overlaps this rental.");
  const rentals = await ctx.db.query("movaraBookingRequests").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
  if (reservedConflict(rentals, booking.pickupDate, booking.returnDate, booking._id)) throw new Error("Another reservation or unreturned vehicle prevents release.");
  await ctx.db.patch(handover._id, { releasedAt: Date.now(), releasedBy: user._id });
  await ctx.db.insert("accessEvents", { subjectId: booking.customerId, actorId: user._id, action: `handover.released:${booking._id}`, occurredAt: Date.now() });
}});
export const recordRefund = mutation({ args: { bookingId: v.id("movaraBookingRequests"), refundedKes: v.number(), transactionCostKes: v.number(), reference: v.string(), reason: v.string(), confirmed: v.boolean() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx);
  const handover = await ctx.db.query("movaraHandovers").withIndex("by_booking", q => q.eq("bookingId", args.bookingId)).unique();
  if (!args.confirmed || !handover || handover.releasedAt) throw new Error("Record an actual pre-handover refund only after checking the receiving and refund accounts.");
  if (handover.status === "refunded") throw new Error("A refund is already recorded.");
  if (![args.refundedKes, args.transactionCostKes].every(amount => Number.isSafeInteger(amount) && amount >= 0) || args.refundedKes + args.transactionCostKes !== handover.receivedKes) throw new Error("Refund plus documented transaction cost must match the received amount.");
  const refund = { refundedKes: args.refundedKes, transactionCostKes: args.transactionCostKes, reference: requiredText(args.reference, "Refund reference", 100), reason: requiredText(args.reason, "Refund findings", 1000), recordedAt: Date.now(), recordedBy: user._id };
  await ctx.db.patch(handover._id, { status: "refunded", refund });
}});
export const settleDeposit = mutation({ args: { bookingId: v.id("movaraBookingRequests"), returnedKes: v.number(), deductionsKes: v.number(), notes: v.string(), confirmed: v.boolean() }, handler: async (ctx, args) => {
  const { user } = await requireRole(ctx); const booking = await ctx.db.get(args.bookingId);
  const handover = await ctx.db.query("movaraHandovers").withIndex("by_booking", q => q.eq("bookingId", args.bookingId)).unique();
  if (!args.confirmed || booking?.status !== "returned" || !handover?.releasedAt || handover.status !== "verified") throw new Error("Complete the vehicle return and verify the actual deposit settlement first.");
  if (handover.depositSettlement) throw new Error("Deposit settlement is already recorded.");
  if (![args.returnedKes, args.deductionsKes].every(amount => Number.isSafeInteger(amount) && amount >= 0) || args.returnedKes + args.deductionsKes !== handover.depositKes) throw new Error("Returned deposit plus deductions must match the deposit collected.");
  await ctx.db.patch(handover._id, { depositSettlement: { returnedKes: args.returnedKes, deductionsKes: args.deductionsKes, notes: requiredText(args.notes, "Contract settlement findings", 1000), recordedAt: Date.now(), recordedBy: user._id } });
}});
