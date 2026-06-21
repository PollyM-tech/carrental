import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAuth, requireRole } from "./lib/auth";

type NormalizedBookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

function normalizeBookingStatus(status: string): NormalizedBookingStatus {
  const normalized = status.toLowerCase();

  if (
    normalized === "pending" ||
    normalized === "confirmed" ||
    normalized === "active" ||
    normalized === "completed" ||
    normalized === "cancelled"
  ) {
    return normalized;
  }

  return "pending";
}

function legacyBookingStatus(status: NormalizedBookingStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "active":
      return "Active";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

function readBookingStartDate(booking: {
  startDate?: string;
  pickupDate?: string;
}) {
  return booking.startDate ?? booking.pickupDate ?? "";
}

function readBookingEndDate(booking: {
  endDate?: string;
  returnDate?: string;
}) {
  return booking.endDate ?? booking.returnDate ?? "";
}

function readCustomerEmail(booking: {
  customerEmail?: string;
  email?: string;
}) {
  return booking.customerEmail ?? booking.email ?? "";
}

function readCustomerPhone(booking: {
  customerPhone?: string;
  phone?: string;
}) {
  return booking.customerPhone ?? booking.phone ?? "";
}

export const create = mutation({
  args: {
    carId: v.id("cars"),
    startDate: v.string(),
    endDate: v.string(),
    customerPhone: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ["customer"]);

    const car = await ctx.db.get(args.carId);
    if (!car) {
      throw new ConvexError("This vehicle is no longer available.");
    }

    if (car.status !== "Available") {
      throw new ConvexError("This vehicle is not available for booking.");
    }

    const today = new Date().toISOString().split("T")[0];
    if (args.startDate < today) {
      throw new ConvexError("Please choose a current or future start date.");
    }

    if (args.endDate <= args.startDate) {
      throw new ConvexError("Please choose an end date after the start date.");
    }

    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const totalDays = Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );

    const overlappingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_car_and_status", (q) =>
        q.eq("carId", args.carId).eq("status", "pending"),
      )
      .collect();

    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_car_and_status", (q) =>
        q.eq("carId", args.carId).eq("status", "confirmed"),
      )
      .collect();

    const allActiveBookings = [...overlappingBookings, ...activeBookings];

    for (const booking of allActiveBookings) {
      const existingStartDate = readBookingStartDate(booking);
      const existingEndDate = readBookingEndDate(booking);

      if (
        existingStartDate &&
        existingEndDate &&
        args.startDate < existingEndDate &&
        args.endDate > existingStartDate
      ) {
        throw new ConvexError(
          "This vehicle is already booked for those dates.",
        );
      }
    }

    const totalAmount = totalDays * car.pricePerDay;

    const bookingId = await ctx.db.insert("bookings", {
      userId: user._id,
      carId: args.carId,
      status: "pending",
      startDate: args.startDate,
      endDate: args.endDate,
      totalDays,
      totalAmount,
      customerName:
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
      customerEmail: user.email,
      customerPhone: args.customerPhone,
      notes: args.notes,
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

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
          startDate: readBookingStartDate(booking),
          endDate: readBookingEndDate(booking),
          customerEmail: readCustomerEmail(booking),
          customerPhone: readCustomerPhone(booking),
          status: normalizeBookingStatus(booking.status),
          displayImageUrl: uploadedImageUrl ?? car?.imageUrl ?? null,
        };
      }),
    );
  },
});

export const listAll = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("active"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin", "staff"]);

    if (args.status) {
      const status = args.status;
      const normalizedBookings = await ctx.db
        .query("bookings")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
      const legacyBookings = await ctx.db
        .query("bookings")
        .withIndex("by_status", (q) =>
          q.eq("status", legacyBookingStatus(status)),
        )
        .order("desc")
        .collect();
      const bookings = [...normalizedBookings, ...legacyBookings].sort(
        (left, right) => right.createdAt - left.createdAt,
      );

      return await Promise.all(
        bookings.map(async (booking) => {
          const car = booking.carId ? await ctx.db.get(booking.carId) : null;

          return {
            ...booking,
            carName: car?.name ?? booking.carName,
            customerName: booking.customerName,
            customerEmail: readCustomerEmail(booking),
            customerPhone: readCustomerPhone(booking),
            startDate: readBookingStartDate(booking),
            endDate: readBookingEndDate(booking),
            status: normalizeBookingStatus(booking.status),
          };
        }),
      );
    }

    const bookings = await ctx.db.query("bookings").order("desc").collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const car = booking.carId ? await ctx.db.get(booking.carId) : null;

        return {
          ...booking,
          carName: car?.name ?? booking.carName,
          customerName: booking.customerName,
          customerEmail: readCustomerEmail(booking),
          customerPhone: readCustomerPhone(booking),
          startDate: readBookingStartDate(booking),
          endDate: readBookingEndDate(booking),
          status: normalizeBookingStatus(booking.status),
        };
      }),
    );
  },
});

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
      customerEmail: readCustomerEmail(booking),
      customerPhone: readCustomerPhone(booking),
      startDate: readBookingStartDate(booking),
      endDate: readBookingEndDate(booking),
      status: normalizeBookingStatus(booking.status),
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

    if (normalizeBookingStatus(booking.status) !== "pending") {
      throw new ConvexError("This booking cannot be confirmed right now.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "confirmed",
      confirmedBy: user._id,
      confirmedAt: Date.now(),
    });

    return args.bookingId;
  },
});

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

    if (normalizeBookingStatus(booking.status) === "completed") {
      throw new ConvexError("This booking cannot be cancelled.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "cancelled",
      cancelReason: args.cancelReason,
      cancelledBy: user._id,
      cancelledAt: Date.now(),
    });

    const car = booking.carId ? await ctx.db.get(booking.carId) : null;
    if (car && car.status === "Booked") {
      await ctx.db.patch(car._id, {
        status: "Available",
        updatedAt: Date.now(),
      });
    }

    return args.bookingId;
  },
});

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

    if (normalizeBookingStatus(booking.status) !== "active") {
      throw new ConvexError("This booking cannot be completed right now.");
    }

    await ctx.db.patch(args.bookingId, {
      status: "completed",
      completedAt: Date.now(),
    });

    const car = booking.carId ? await ctx.db.get(booking.carId) : null;
    if (car) {
      await ctx.db.patch(car._id, {
        status: "Available",
        updatedAt: Date.now(),
      });
    }

    return args.bookingId;
  },
});

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["platform_admin"]);

    const allBookings = await ctx.db.query("bookings").collect();
    const allCars = await ctx.db.query("cars").collect();

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const completedThisMonth = allBookings.filter((booking) => {
      if (
        normalizeBookingStatus(booking.status) !== "completed" ||
        !booking.completedAt
      )
        return false;
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
        (b) => normalizeBookingStatus(b.status) === "pending",
      ).length,
      confirmedBookings: allBookings.filter(
        (b) => normalizeBookingStatus(b.status) === "confirmed",
      ).length,
      activeBookings: allBookings.filter(
        (b) => normalizeBookingStatus(b.status) === "active",
      ).length,
      completedBookings: allBookings.filter(
        (b) => normalizeBookingStatus(b.status) === "completed",
      ).length,
      cancelledBookings: allBookings.filter(
        (b) => normalizeBookingStatus(b.status) === "cancelled",
      ).length,
      revenueThisMonth,
      totalCars: allCars.length,
      availableCars: allCars.filter((c) => c.status === "Available").length,
      bookedCars: allCars.filter((c) => c.status === "Booked").length,
      maintenanceCars: allCars.filter((c) => c.status === "Maintenance").length,
    };
  },
});
