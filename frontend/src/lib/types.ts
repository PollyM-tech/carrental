export type Id<T extends string> = string & { readonly __entity?: T };
interface RecordBase { _id: string; _creationTime: number; createdAt: number; updatedAt?: number }
export interface Car extends RecordBase {
  name: string; category: string; pricePerDay: number; seats: number;
  transmission: string; fuel: string;
  status: "available" | "booked" | "maintenance" | "unavailable";
  description: string; isFeatured: boolean; imageStorageId?: string;
  imageUrl?: string; displayImageUrl?: string | null; rating?: number;
  reviewCount?: number; brand?: string; model?: string; year?: number;
  plateNumber?: string; location?: string; mileage?: number;
}
export interface Booking extends RecordBase {
  status: "draft" | "kyc_submitted" | "kyc_in_review" | "kyc_needs_correction" | "kyc_rejected" | "kyc_approved" | "awaiting_payment" | "payment_pending_verification" | "confirmed" | "handover_in_progress" | "handover_failed" | "active" | "returned" | "closed" | "cancelled" | "expired" | "no_show";
  carId?: string; carName?: string; carImageUrl?: string | null;
  customerName: string; customerEmail?: string; customerPhone?: string;
  pickupDate?: string; returnDate?: string; pickupLocation?: string;
  returnLocation?: string; totalDays?: number; totalAmount?: number;
  message?: string; notes?: string; cancelReason?: string;
  confirmedAt?: number; cancelledAt?: number; completedAt?: number;
  car?: Car | null; customer?: { firstName?: string; lastName?: string; email?: string; phone?: string } | null;
}
export interface BusinessSettings extends RecordBase {
  businessName: string; whatsappNumber: string; phoneNumber?: string; email?: string; location?: string;
}
export type Doc<T extends "cars" | "bookings" | "settings"> =
  T extends "cars" ? Car : T extends "bookings" ? Booking : BusinessSettings;
