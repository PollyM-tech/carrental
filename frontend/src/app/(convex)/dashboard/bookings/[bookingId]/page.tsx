import BookingDetail from "@/components/admin/BookingDetail";
import type { Id } from "../../../../../../convex/_generated/dataModel";
export default async function BookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  return <BookingDetail bookingId={bookingId as Id<"movaraBookingRequests">} />;
}
