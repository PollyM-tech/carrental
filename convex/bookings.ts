import { ConvexError, v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireAuth, requireRole } from "./lib/auth";

const bookingStatusValidator = v.union(
  v.literal("pending"),
  v.literal("confirmed"),
  v.literal("active"),
  v.literal("completed"),
  v.literal("cancelled"),
);

type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

function calculateTotalDays(pickupDate?: string, returnDate?: string) {
  if (!pickupDate || !returnDate) return undefined;

  const pickup = new Date(pickupDate);
  const returned = new Date(returnDate);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(returned.getTime())) {
    return undefined;
  }

  return Math.max(
    1,
    Math.ceil((returned.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function bookingDatesOverlap({
  newPickupDate,
  newReturnDate,
  existingPickupDate,
  existingReturnDate,
}: {
  newPickupDate?: string;
  newReturnDate?: string;
  existingPickupDate?: string;
  existingReturnDate?: string;
}) {
  if (
    !newPickupDate ||
    !newReturnDate ||
    !existingPickupDate ||
    !existingReturnDate
  ) {
    return false;
  }

  return (
    newPickupDate < existingReturnDate && newReturnDate > existingPickupDate
  );
}

async function checkCarBookingConflict(
  ctx: MutationCtx,
  carId: Id<"cars">,
  pickupDate?: string,
  returnDate?: string,
) {
  if (!pickupDate || !returnDate) return;

  const statusesToCheck: BookingStatus[] = ["pending", "confirmed", "active"];

  for (const status of statusesToCheck) {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_car_and_status", (q) =>
        q.eq("carId", carId).eq("status", status),
      )
      .collect();

    for (const booking of bookings) {
      const hasConflict = bookingDatesOverlap({
        newPickupDate: pickupDate,
        newReturnDate: returnDate,
        existingPickupDate: booking.pickupDate,
        existingReturnDate: booking.returnDate,
      });

      if (hasConflict) {
        throw new ConvexError(
          "This vehicle already has a booking for those dates.",
        );
      }
    }
  }
}

/**
 * Public booking mutation.
 *
 * Flow:
 * 1. Customer fills the public booking form.
 * 2. Booking is saved to Convex as "pending".
 * 3. Frontend redirects customer to WhatsApp with the same booking details.
 */
export const create = mutation({
  args: {
    carId: v.optional(v.id("cars")),
    carName: v.optional(v.string()),

    customerName: v.string(),
    customerEmail: v.optional(v.string()),
    customerPhone: v.optional(v.string()),

    pickupDate: v.optional(v.string()),
    returnDate: v.optional(v.string()),
    pickupLocation: v.optional(v.string()),
    returnLocation: v.optional(v.string()),

    message: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    if (!args.customerName.trim()) {
      throw new ConvexError("Customer name is required.");
    }

    if (
      args.pickupDate &&
      args.returnDate &&
      args.returnDate <= args.pickupDate
    ) {
      throw new ConvexError(
        "Please choose a return date after the pickup date.",
      );
    }

    let carName = args.carName;
    let totalAmount: number | undefined;

    const totalDays = calculateTotalDays(args.pickupDate, args.returnDate);

    if (args.carId) {
      const car = await ctx.db.get(args.carId);

      if (!car || car.deletedAt) {
        throw new ConvexError("This vehicle is no longer available.");
      }

      if (car.status !== "available") {
        throw new ConvexError("This vehicle is not available for booking.");
      }

      await checkCarBookingConflict(
        ctx,
        args.carId,
        args.pickupDate,
        args.returnDate,
      );

      carName = car.name;
      totalAmount = totalDays ? totalDays * car.pricePerDay : undefined;
    }

    const bookingId = await ctx.db.insert("bookings", {
      carId: args.carId,
      carName,

      status: "pending",

      pickupDate: args.pickupDate,
      returnDate: args.returnDate,
      pickupLocation: args.pickupLocation,
      returnLocation: args.returnLocation,

      totalDays,
      totalAmount,

      customerName: args.customerName.trim(),
      customerEmail: args.customerEmail?.trim(),
      customerPhone: args.customerPhone?.trim(),

      message: args.message?.trim(),

      createdAt: Date.now(),
    });

    return bookingId;
  },
});

/**
 * Logged-in customer bookings.
 * Optional for now, but useful if customer accounts are added later.
 */
export const myBookings = query({
  args: {},

  handler: async (ctx) => {
    const user = await requireRole(ctx, ["customer"]);

    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = booking.carId ? await ctx.db.get(booking.carId) : null;

        const uploadedImageUrl = car?.imageStorageId
          ? await ctx.storage.getUrl(car.imageStorageId)
          : null;

        return {
          ...booking,
          carName: car?.name ?? booking.carName,
          displayImageUrl: uploadedImageUrl ?? car?.imageUrl ?? null,
        };
      }),
    );
  },
});

/**
 * Admin/staff booking list.
 */
export const listAll = query({
  args: {
    status: v.optional(bookingStatusValidator),
  },

  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin", "staff"]);

    const bookings = args.status
      ? await ctx.db
          .query("bookings")
          .withIndex("by_status", (q) => q.eq("status", args.status!))
          .order("desc")
          .collect()
      : await ctx.db.query("bookings").order("desc").collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = booking.carId ? await ctx.db.get(booking.carId) : null;

        const uploadedImageUrl = car?.imageStorageId
          ? await ctx.storage.getUrl(car.imageStorageId)
          : null;

        return {
          ...booking,
          carName: car?.name ?? booking.carName,
          carImageUrl: uploadedImageUrl ?? car?.imageUrl ?? null,
        };
      }),
    );
  },
});

/**
 * Admin/customer booking details.
 */
export const getById = query({
  args: {
    bookingId: v.id("bookings"),
  },

  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);

    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new ConvexError("This booking could not be found.");
    }

    if (user.role === "customer" && booking.userId !== user._id) {
      throw new ConvexError("Unauthorized");
    }

    const car = booking.carId ? await ctx.db.get(booking.carId) : null;
    const customer = booking.userId ? await ctx.db.get(booking.userId) : null;

    const uploadedImageUrl = car?.imageStorageId
      ? await ctx.storage.getUrl(car.imageStorageId)
      : null;

    return {
      ...booking,
      carName: car?.name ?? booking.carName,
      car: car
        ? {
            ...car,
            displayImageUrl: uploadedImageUrl ?? car.imageUrl ?? null,
          }
        : null,
      customer,
    };
  },
});

/**
 * Admin/staff confirms a pending booking.
 * When confirmed, linked car becomes booked.
 */
export const confirm = mutation({
  args: {
    bookingId: v.id("bookings"),
  },

  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["platform_admin", "staff"]);

    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new ConvexError("This booking could not be found.");
    }

    if (booking.status !== "pending") {
      throw new ConvexError("Only pending bookings can be confirmed.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      confirmedBy: user._id,
      confirmedAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (booking.carId) {
      await ctx.db.patch(booking.carId, {
        status: "booked",
        updatedAt: Date.now(),
      });
    }

    return args.bookingId;
  },
});

/**
 * Admin/staff marks a confirmed booking as active.
 */
export const activate = mutation({
  args: {
    bookingId: v.id("bookings"),
  },

  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin", "staff"]);

    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new ConvexError("This booking could not be found.");
    }

    if (booking.status !== "confirmed") {
      throw new ConvexError("Only confirmed bookings can be activated.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "active",
      updatedAt: Date.now(),
    });

    if (booking.carId) {
      await ctx.db.patch(booking.carId, {
        status: "booked",
        updatedAt: Date.now(),
      });
    }

    return args.bookingId;
  },
});

/**
 * Admin cancels a booking.
 * If linked car was booked, it becomes available again.
 */
export const cancel = mutation({
  args: {
    bookingId: v.id("bookings"),
    cancelReason: v.string(),
  },

  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["platform_admin"]);

    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new ConvexError("This booking could not be found.");
    }

    if (booking.status === "completed") {
      throw new ConvexError("Completed bookings cannot be cancelled.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelReason: args.cancelReason,
      cancelledBy: user._id,
      cancelledAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (booking.carId) {
      const car = await ctx.db.get(booking.carId);

      if (car && car.status === "booked") {
        await ctx.db.patch(car._id, {
          status: "available",
          updatedAt: Date.now(),
        });
      }
    }

    return args.bookingId;
  },
});

/**
 * Admin/staff completes a booking.
 * When completed, linked car becomes available again.
 */
export const complete = mutation({
  args: {
    bookingId: v.id("bookings"),
  },

  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin", "staff"]);

    const booking = await ctx.db.get(args.bookingId);

    if (!booking) {
      throw new ConvexError("This booking could not be found.");
    }

    if (booking.status !== "active" && booking.status !== "confirmed") {
      throw new ConvexError(
        "Only active or confirmed bookings can be completed.",
      );
    }

    await ctx.db.patch(args.bookingId, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (booking.carId) {
      const car = await ctx.db.get(booking.carId);

      if (car) {
        await ctx.db.patch(car._id, {
          status: "available",
          updatedAt: Date.now(),
        });
      }
    }

    return args.bookingId;
  },
});

/**
 * Admin dashboard stats.
 */
export const getStats = query({
  args: {},

  handler: async (ctx) => {
    await requireRole(ctx, ["platform_admin"]);

    const allBookings = await ctx.db.query("bookings").collect();
    const allCars = await ctx.db.query("cars").collect();

    const activeCars = allCars.filter((car) => !car.deletedAt);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedThisMonth = allBookings.filter((booking) => {
      if (booking.status !== "completed" || !booking.completedAt) return false;

      const completedDate = new Date(booking.completedAt);

      return (
        completedDate.getMonth() === currentMonth &&
        completedDate.getFullYear() === currentYear
      );
    });

    const revenueThisMonth = completedThisMonth.reduce(
      (sum, booking) => sum + (booking.totalAmount ?? 0),
      0,
    );

    return {
      totalBookings: allBookings.length,

      pendingBookings: allBookings.filter(
        (booking) => booking.status === "pending",
      ).length,
      confirmedBookings: allBookings.filter(
        (booking) => booking.status === "confirmed",
      ).length,
      activeBookings: allBookings.filter(
        (booking) => booking.status === "active",
      ).length,
      completedBookings: allBookings.filter(
        (booking) => booking.status === "completed",
      ).length,
      cancelledBookings: allBookings.filter(
        (booking) => booking.status === "cancelled",
      ).length,

      revenueThisMonth,

      totalCars: activeCars.length,
      availableCars: activeCars.filter((car) => car.status === "available")
        .length,
      bookedCars: activeCars.filter((car) => car.status === "booked").length,
      maintenanceCars: activeCars.filter((car) => car.status === "maintenance")
        .length,
      unavailableCars: activeCars.filter((car) => car.status === "unavailable")
        .length,
      featuredCars: activeCars.filter((car) => car.isFeatured).length,
    };
  },
});
