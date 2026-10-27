import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const staffRole = v.union(v.literal("owner"), v.literal("admin"), v.literal("fleet_manager"), v.literal("kyc_reviewer"), v.literal("front_desk"), v.literal("finance"));

export default defineSchema({
  ...authTables,
  movaraCredentialGuards: defineTable({ userId: v.id("users"), secretHash: v.string(), changedAt: v.number() }).index("by_user", ["userId"]),
  movaraSessionActivity: defineTable({ sessionId: v.id("authSessions"), lastActiveAt: v.number() }).index("by_session", ["sessionId"]),
  movaraLoginGuards: defineTable({ key: v.string(), failures: v.number(), lockedUntil: v.optional(v.number()), pending: v.array(v.object({ id: v.string(), expiresAt: v.number() })) }).index("by_key", ["key"]),
  movaraVehicles: defineTable({
    name: v.string(), category: v.string(), brand: v.string(), model: v.string(),
    year: v.optional(v.number()), registration: v.string(), pricePerDay: v.number(),
    seats: v.number(), transmission: v.string(), fuel: v.string(), mileage: v.number(),
    location: v.string(), description: v.string(), isFeatured: v.boolean(),
    status: v.union(v.literal("available"), v.literal("maintenance"), v.literal("unavailable")),
    published: v.boolean(), archived: v.boolean(),
    insuranceExpiresOn: v.optional(v.string()), inspectionExpiresOn: v.optional(v.string()),
    photoId: v.optional(v.id("movaraVehiclePhotos")), updatedAt: v.number(),
  }).index("by_registration", ["registration"]).index("by_archived", ["archived"]),
  movaraVehiclePhotos: defineTable({
    storageId: v.id("_storage"), uploaderId: v.id("users"),
    vehicleId: v.optional(v.id("movaraVehicles")),
  }).index("by_storage", ["storageId"]),
  movaraVehicleBlocks: defineTable({
    vehicleId: v.id("movaraVehicles"), startsOn: v.string(), endsOn: v.string(), reason: v.string(),
    createdBy: v.id("users"),
  }).index("by_vehicle", ["vehicleId"]),
  movaraBookingRequests: defineTable({
    customerId: v.id("users"),
    requestKey: v.string(),
    vehiclePreference: v.string(),
    vehicleId: v.optional(v.id("movaraVehicles")),
    dailyRateKes: v.optional(v.number()),
    estimatedRentalKes: v.optional(v.number()),
    pickupDate: v.string(),
    returnDate: v.string(),
    rentalDays: v.number(),
    pickupLocation: v.string(),
    phone: v.string(),
    status: v.union(v.literal("requested"), v.literal("in_review"), v.literal("approved"), v.literal("overdue"), v.literal("returned"), v.literal("cancelled")),
    updatedAt: v.number(),
  }).index("by_customer", ["customerId"]).index("by_customer_key", ["customerId", "requestKey"]).index("by_vehicle", ["vehicleId"]),
  movaraVerification: defineTable({
    bookingId: v.id("movaraBookingRequests"), customerId: v.id("users"),
    revision: v.optional(v.number()), consentAt: v.optional(v.number()), fullName: v.string(), nextOfKinName: v.string(), nextOfKinPhone: v.string(), guarantorName: v.string(), guarantorPhone: v.string(),
    method: v.literal("in_person"), status: v.union(v.literal("awaiting_in_person"), v.literal("approved"), v.literal("needs_correction"), v.literal("rejected")),
    phoneChecked: v.optional(v.boolean()), identityChecked: v.optional(v.boolean()), licenceChecked: v.optional(v.boolean()), ageChecked: v.optional(v.boolean()), licenceTenureChecked: v.optional(v.boolean()), contactsChecked: v.optional(v.boolean()),
    customerMessage: v.optional(v.string()), reviewedBy: v.optional(v.id("users")), reviewedAt: v.optional(v.number()), updatedAt: v.number(),
  }).index("by_booking", ["bookingId"]),
  movaraReturnRecords: defineTable({
    bookingId: v.id("movaraBookingRequests"), customerId: v.id("users"), vehicleId: v.id("movaraVehicles"),
    condition: v.union(v.literal("good"), v.literal("damage"), v.literal("not_returned")), rulesFollowed: v.boolean(),
    disposition: v.union(v.literal("clear"), v.literal("flagged"), v.literal("second_chance")), notes: v.string(),
    handedOverConfirmed: v.boolean(), recordedBy: v.id("users"), recordedAt: v.number(),
  }).index("by_booking", ["bookingId"]).index("by_customer", ["customerId"]),
  movaraCustomerStanding: defineTable({
    customerId: v.id("users"), status: v.union(v.literal("clear"), v.literal("flagged"), v.literal("second_chance")),
    reason: v.string(), updatedAt: v.number(), updatedBy: v.id("users"),
  }).index("by_customer", ["customerId"]),
  staffMemberships: defineTable({
    userId: v.id("users"),
    roles: v.array(staffRole),
    active: v.boolean(),
  }).index("by_user", ["userId"]),
  accessEvents: defineTable({
    subjectId: v.id("users"),
    actorId: v.optional(v.id("users")),
    action: v.string(),
    occurredAt: v.number(),
  }).index("by_subject", ["subjectId"]),
});
