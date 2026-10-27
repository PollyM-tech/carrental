import { v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { requireRole } from "./lib/permissions";
import { availableFor, calendarDate, catalogueReady, nairobiToday, normaliseRegistration, positiveInteger, requiredText, validatePhoto } from "./lib/vehicle_rules";
import { reservedConflict } from "./lib/rental_checks";
import { bookingDates } from "./lib/booking_input";

const fields = {
  name: v.string(), category: v.string(), brand: v.string(), model: v.string(), year: v.optional(v.number()),
  registration: v.string(), pricePerDay: v.number(), seats: v.number(), transmission: v.string(), fuel: v.string(),
  mileage: v.number(), location: v.string(), description: v.string(), isFeatured: v.boolean(),
  status: v.union(v.literal("available"), v.literal("maintenance"), v.literal("unavailable")), published: v.boolean(),
  insuranceExpiresOn: v.optional(v.string()), inspectionExpiresOn: v.optional(v.string()),
  photoId: v.optional(v.union(v.id("movaraVehiclePhotos"), v.null())),
};
async function photoUrl(ctx: QueryCtx, vehicle: Doc<"movaraVehicles">) {
  const photo = vehicle.photoId ? await ctx.db.get(vehicle.photoId) : null;
  return photo ? await ctx.storage.getUrl(photo.storageId) : null;
}
async function summary(ctx: QueryCtx, vehicle: Doc<"movaraVehicles">) {
  // Registration, compliance dates, block reasons and staff fields are never public.
  return { _id: vehicle._id, name: vehicle.name, category: vehicle.category, brand: vehicle.brand, model: vehicle.model,
    year: vehicle.year ?? null, pricePerDay: vehicle.pricePerDay, seats: vehicle.seats, transmission: vehicle.transmission,
    fuel: vehicle.fuel, location: vehicle.location, description: vehicle.description, isFeatured: vehicle.isFeatured,
    displayImageUrl: await photoUrl(ctx, vehicle) };
}
export const publicList = query({
  args: { pickupDate: v.optional(v.string()), returnDate: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (Boolean(args.pickupDate) !== Boolean(args.returnDate)) throw new Error("Choose both pickup and return dates.");
    if (args.pickupDate && args.returnDate) bookingDates(args.pickupDate, args.returnDate);
    const vehicles = await ctx.db.query("movaraVehicles").withIndex("by_archived", q => q.eq("archived", false)).collect();
    const result = [];
    for (const vehicle of vehicles) {
      if (!catalogueReady(vehicle)) continue;
      const rentals = await ctx.db.query("movaraBookingRequests").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
      // Without selected dates, the website shows only cars with no active reservation.
      if (!args.pickupDate && rentals.some(rental => rental.status === "approved" || rental.status === "overdue")) continue;
      if (args.pickupDate && args.returnDate) {
        const blocks = await ctx.db.query("movaraVehicleBlocks").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect();
        if (!availableFor(vehicle, args.pickupDate, args.returnDate, blocks) || reservedConflict(rentals, args.pickupDate, args.returnDate)) continue;
      }
      result.push(await summary(ctx, vehicle));
    }
    return result;
  },
});
export const list = query({
  args: {},
  handler: async ctx => {
    await requireRole(ctx, "fleet_manager");
    const vehicles = await ctx.db.query("movaraVehicles").order("desc").collect();
    return await Promise.all(vehicles.map(async vehicle => ({ ...vehicle, displayImageUrl: await photoUrl(ctx, vehicle), blocks: await ctx.db.query("movaraVehicleBlocks").withIndex("by_vehicle", q => q.eq("vehicleId", vehicle._id)).collect() })));
  },
});
export const save = mutation({
  args: { id: v.optional(v.id("movaraVehicles")), ...fields },
  handler: async (ctx, args) => {
    const { user } = await requireRole(ctx, "fleet_manager");
    const old = args.id ? await ctx.db.get(args.id) : null;
    if (args.id && (!old || old.archived)) throw new Error("Restore this vehicle before editing it.");
    const registration = normaliseRegistration(args.registration);
    const duplicate = await ctx.db.query("movaraVehicles").withIndex("by_registration", q => q.eq("registration", registration)).unique();
    if (duplicate && duplicate._id !== args.id) throw new Error("A vehicle with this registration already exists, including archived records.");
    const pricePerDay = positiveInteger(args.pricePerDay, "Daily rate", 10000000);
    const seats = positiveInteger(args.seats, "Seats", 100);
    if (!Number.isSafeInteger(args.mileage) || args.mileage < 0 || args.mileage > 100000000) throw new Error("Enter a valid non-negative mileage.");
    if (args.year !== undefined && (!Number.isInteger(args.year) || args.year < 1900 || args.year > new Date().getUTCFullYear()+1)) throw new Error("Enter a valid model year.");
    if (!["Automatic", "Manual"].includes(args.transmission)) throw new Error("Choose Automatic or Manual transmission.");
    if (!["Petrol", "Diesel", "Hybrid", "Electric", "Other"].includes(args.fuel)) throw new Error("Choose a valid fuel type.");
    const insuranceExpiresOn = args.insuranceExpiresOn ? calendarDate(args.insuranceExpiresOn) : undefined;
    const inspectionExpiresOn = args.inspectionExpiresOn ? calendarDate(args.inspectionExpiresOn) : undefined;
    if (args.published && (!insuranceExpiresOn || insuranceExpiresOn < nairobiToday() || !inspectionExpiresOn || inspectionExpiresOn < nairobiToday())) throw new Error("Current insurance and inspection expiry dates are required before publishing.");
    const photoId = args.photoId === undefined ? old?.photoId : args.photoId ?? undefined;
    if (photoId && photoId !== old?.photoId) {
      const photo = await ctx.db.get(photoId);
      if (!photo || photo.uploaderId !== user._id || photo.vehicleId) throw new Error("Upload a fresh vehicle photo from this account.");
    }
    const data = { name: requiredText(args.name, "Vehicle name"), category: requiredText(args.category, "Category", 80),
      brand: requiredText(args.brand, "Brand", 80), model: requiredText(args.model, "Model", 80), year: args.year, registration, pricePerDay, seats,
      transmission: args.transmission, fuel: args.fuel, mileage: args.mileage, location: requiredText(args.location, "Location"),
      description: args.description.trim().slice(0, 2000), isFeatured: args.isFeatured, status: args.status, published: args.published,
      insuranceExpiresOn, inspectionExpiresOn, photoId, updatedAt: Date.now() };
    const id = args.id ?? await ctx.db.insert("movaraVehicles", { ...data, archived: false });
    if (args.id) await ctx.db.patch(args.id, data);
    if (photoId && photoId !== old?.photoId) await ctx.db.patch(photoId, { vehicleId: id });
    if (old?.photoId && old.photoId !== photoId) {
      await ctx.db.patch(old.photoId, { vehicleId: undefined });
      await ctx.scheduler.runAfter(0, internal.vehicles.expireUnusedPhoto, { photoId: old.photoId });
    }
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: `vehicle.${args.id ? "updated" : "created"}:${id}`, occurredAt: Date.now() });
    return id;
  },
});
export const setArchived = mutation({
  args: { id: v.id("movaraVehicles"), archived: v.boolean() },
  handler: async (ctx, { id, archived }) => {
    const { user } = await requireRole(ctx, "fleet_manager");
    if (!await ctx.db.get(id)) throw new Error("Vehicle not found.");
    await ctx.db.patch(id, { archived, published: false, updatedAt: Date.now() });
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: `vehicle.${archived ? "archived" : "restored"}:${id}`, occurredAt: Date.now() });
  },
});
export const addBlock = mutation({
  args: { vehicleId: v.id("movaraVehicles"), startsOn: v.string(), endsOn: v.string(), reason: v.string() },
  handler: async (ctx, args) => {
    const { user } = await requireRole(ctx, "fleet_manager");
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.archived) throw new Error("Choose an active vehicle.");
    calendarDate(args.startsOn); calendarDate(args.endsOn);
    if (args.endsOn <= args.startsOn) throw new Error("The block end must be after its start; the end date is exclusive.");
    const id = await ctx.db.insert("movaraVehicleBlocks", { ...args, reason: requiredText(args.reason, "Reason", 255), createdBy: user._id });
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: `vehicle.block_added:${args.vehicleId}:${id}`, occurredAt: Date.now() });
    return id;
  },
});
export const removeBlock = mutation({
  args: { id: v.id("movaraVehicleBlocks") },
  handler: async (ctx, { id }) => {
    const { user } = await requireRole(ctx, "fleet_manager");
    const block = await ctx.db.get(id);
    if (!block) throw new Error("Block not found.");
    await ctx.db.delete(id);
    await ctx.db.insert("accessEvents", { subjectId: user._id, actorId: user._id, action: `vehicle.block_removed:${block.vehicleId}:${id}`, occurredAt: Date.now() });
  },
});
export const photoAccess = internalQuery({ args: {}, handler: async ctx => (await requireRole(ctx, "fleet_manager")).user._id });
export const registerPhoto = internalMutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const { user } = await requireRole(ctx, "fleet_manager");
    const photoId = await ctx.db.insert("movaraVehiclePhotos", { storageId, uploaderId: user._id });
    await ctx.scheduler.runAfter(86400000, internal.vehicles.expireUnusedPhoto, { photoId });
    return photoId;
  },
});
export const uploadPhoto = action({
  args: { bytes: v.bytes(), contentType: v.string() },
  returns: v.id("movaraVehiclePhotos"),
  handler: async (ctx, { bytes, contentType }): Promise<Id<"movaraVehiclePhotos">> => {
    await ctx.runQuery(internal.vehicles.photoAccess, {});
    validatePhoto(bytes, contentType);
    const storageId = await ctx.storage.store(new Blob([bytes], { type: contentType }));
    try { return await ctx.runMutation(internal.vehicles.registerPhoto, { storageId }); }
    catch (error) { await ctx.storage.delete(storageId); throw error; }
  },
});
export const expireUnusedPhoto = internalMutation({
  args: { photoId: v.id("movaraVehiclePhotos") },
  handler: async (ctx, { photoId }) => {
    const photo = await ctx.db.get(photoId);
    if (!photo || photo.vehicleId) return;
    await ctx.storage.delete(photo.storageId);
    await ctx.db.delete(photo._id);
  },
});
