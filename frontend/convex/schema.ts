// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── USERS ────────────────────────────────────────────────────────────────
  // Kept for possible future customer accounts.
  // The current admin login system uses adminSessions instead.
  users: defineTable({
    email: v.string(),

    role: v.union(
      v.literal("platform_admin"),
      v.literal("staff"),
      v.literal("customer"),
    ),

    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    isActive: v.boolean(),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // ─── ADMIN SESSIONS ──────────────────────────────────────────────────────
  // Used for simple password-based admin login.
  // The frontend stores the token in localStorage and sends it to protected
  // admin Convex functions.
  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  // ─── CARS ─────────────────────────────────────────────────────────────────
  // Cars are managed by admins from the dashboard.
  // Public pages should only show cars where:
  // status === "available" and deletedAt is undefined.
  cars: defineTable({
    name: v.string(),

    // Example: SUV, Sedan, Van, Executive, Family Car
    category: v.string(),

    pricePerDay: v.number(),

    // For now, imageUrl can point to public images like "/lexus.jpeg".
    // Later, imageStorageId can be used for uploaded images stored in Convex.
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    seats: v.number(),
    transmission: v.string(), // Example: Automatic, Manual
    fuel: v.string(), // Example: Petrol, Diesel, Hybrid

    status: v.union(
      v.literal("available"),
      v.literal("booked"),
      v.literal("maintenance"),
      v.literal("unavailable"),
    ),

    description: v.string(),

    // Featured cars appear on the homepage when also available.
    isFeatured: v.boolean(),

    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),

    // Optional fleet/admin details.
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    plateNumber: v.optional(v.string()),
    location: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),

    // Soft delete. Do not show cars publicly when deletedAt exists.
    deletedAt: v.optional(v.number()),
  })
    .index("by_featured", ["isFeatured"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_status_and_featured", ["status", "isFeatured"]),

  // ─── BOOKINGS ─────────────────────────────────────────────────────────────
  // Booking flow:
  // 1. Customer fills public form
  // 2. Booking is saved to Convex
  // 3. Customer is redirected to WhatsApp with booking details
  bookings: defineTable({
    // Optional because public customers may book without signing in.
    userId: v.optional(v.id("users")),

    // Optional because a customer may request a car by name before the car
    // is linked to a real backend car record.
    carId: v.optional(v.id("cars")),

    // Status lifecycle:
    // pending → confirmed → active → completed
    // pending/confirmed/active can also become cancelled.
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("active"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),

    // Dates stored as ISO strings: YYYY-MM-DD
    pickupDate: v.optional(v.string()),
    returnDate: v.optional(v.string()),

    totalDays: v.optional(v.number()),
    totalAmount: v.optional(v.number()),

    // Customer snapshot.
    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),

    // Car snapshot.
    carName: v.optional(v.string()),

    pickupLocation: v.optional(v.string()),
    returnLocation: v.optional(v.string()),

    message: v.optional(v.string()),
    notes: v.optional(v.string()),

    cancelReason: v.optional(v.string()),

    // Admin audit fields.
    confirmedBy: v.optional(v.id("users")),
    cancelledBy: v.optional(v.id("users")),

    confirmedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_userId", ["userId"])
    .index("by_carId", ["carId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_car_and_status", ["carId", "status"]),

  // ─── SETTINGS ─────────────────────────────────────────────────────────────
  // Single-row table. Always upsert, never insert many settings rows.
  settings: defineTable({
    businessName: v.string(),
    whatsappNumber: v.string(),

    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
});
