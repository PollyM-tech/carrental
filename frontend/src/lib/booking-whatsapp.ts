import { siteConfig } from "../config/site.ts";
export type WhatsAppRequest = {
  reference: string; kind?: "general" | "booking"; name?: string; email?: string;
  phone: string; vehicle?: string; pickupDate?: string; returnDate?: string;
  referralSource?: string; pickupLocation?: string; returnLocation?: string; message?: string;
};
export function bookingWhatsAppUrl(details: WhatsAppRequest) {
  const lines = ["Hello Movara Car Hire,", "", details.kind === "general" ? "I have submitted an enquiry on your website." : "I have submitted a booking request on your website.", `Reference: ${details.reference}`];
  for (const [label, value] of [["Name", details.name], ["Email", details.email], ["Phone / WhatsApp", details.phone], ["Vehicle", details.vehicle], ["Pickup", details.pickupDate], ["Return", details.returnDate], ["Pickup location", details.pickupLocation], ["Return location", details.returnLocation], ["Where did you hear about us?", details.referralSource], ["Message", details.message]]) if (value?.trim()) lines.push(`${label}: ${value.trim()}`);
  lines.push("", "Please confirm availability and the next steps. No payment or reservation is confirmed by this request.");
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}
