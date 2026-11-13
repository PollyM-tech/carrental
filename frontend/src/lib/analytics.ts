import { optionalCookiesAllowed } from "./cookie-consent";
export const analyticsId = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "") ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID : undefined;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}
export function trackConversion(event: "booking_request_saved" | "enquiry_saved" | "whatsapp_click" | "call_click") {
  if (!analyticsId || !optionalCookiesAllowed(document.cookie) || !window.gtag) return;
  window.gtag("event", event, { transport_type: "beacon", page_location: `${window.location.origin}${window.location.pathname}`, page_referrer: "", page_title: "Movara Car Hire" });
}
