import { optionalCookiesAllowed } from "./cookie-consent";
export const tagManagerId = "GTM-T7DP9KTX";
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}
export function trackConversion(event: "booking_request_saved" | "enquiry_saved" | "whatsapp_click" | "call_click") {
  if (!optionalCookiesAllowed(document.cookie) || !window.gtag) return;
  window.dataLayer?.push({ event, page_location: `${window.location.origin}${window.location.pathname}`, page_referrer: "", page_title: "Movara Car Hire" });
}
