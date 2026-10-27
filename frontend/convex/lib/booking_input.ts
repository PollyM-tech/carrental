export function bookingDates(pickup: string, returned: string, now = Date.now()) {
  for (const value of [pickup, returned]) {
    const timestamp = Date.parse(value + "T00:00:00Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) throw new Error("Choose valid pickup and return dates.");
  }
  const today = new Date(now + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  if (pickup < today || returned <= pickup) throw new Error("Pickup must be today or later, and return must be after pickup.");
  return Math.round((Date.parse(returned + "T00:00:00Z") - Date.parse(pickup + "T00:00:00Z")) / 86400000);
}
export function bookingText(value: string, label: string, max: number) {
  if (!value.trim() || value.trim().length > max) throw new Error(`${label} is required and must be at most ${max} characters.`);
  return value.trim();
}
export function requireBookingOwner(booking: { customerId: string } | null, userId: string) {
  if (!booking || booking.customerId !== userId) throw new Error("Booking request not found.");
  return booking;
}
