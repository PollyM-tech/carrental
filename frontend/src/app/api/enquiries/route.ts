import { NextResponse } from "next/server";
import { fetchAction } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { api } from "../../../../convex/_generated/api";
import { bookingWhatsAppUrl } from "@/lib/booking-whatsapp";
export async function POST(request: Request) {
  try {
    const reader = request.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Enter your enquiry details." }, { status: 400 });
    const decoder = new TextDecoder(); let bytes = 0; let raw = "";
    while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 16384) { await reader.cancel(); return NextResponse.json({ error: "Please shorten your enquiry." }, { status: 413 }); } raw += decoder.decode(value, { stream: true }); }
    raw += decoder.decode();
    let body: Record<string, unknown>;
    try { const parsed: unknown = JSON.parse(raw); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); body = parsed as Record<string, unknown>; } catch { return NextResponse.json({ error: "Invalid enquiry details." }, { status: 400 }); }
    if (body.kind !== "booking" && body.kind !== "general") return NextResponse.json({ error: "Choose an enquiry type." }, { status: 400 });
    const text = (key: string) => typeof body[key] === "string" ? body[key] as string : "";
    const saved = await fetchAction(api.enquiries.submit, { referralSource: text("referralSource"), requestKey: text("requestKey"), kind: body.kind, name: text("name"), phone: text("phone"), email: text("email"), vehicle: text("vehicle"), pickupDate: text("pickupDate"), returnDate: text("returnDate"), pickupLocation: text("pickupLocation"), returnLocation: text("returnLocation"), message: text("message"), website: text("website") });
    return NextResponse.json({ reference: saved.reference, whatsappUrl: bookingWhatsAppUrl({ ...saved.details, reference: saved.reference }) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ConvexError && error.data && typeof error.data === "object" && "message" in error.data && typeof error.data.message === "string") return NextResponse.json({ error: error.data.message }, { status: error.data.code === "RATE_LIMIT" ? 429 : 400 });
    return NextResponse.json({ error: "Unable to save your enquiry. Please retry. WhatsApp will open after your details are saved." }, { status: 503 });
  }
}
