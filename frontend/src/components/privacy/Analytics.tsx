"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { analyticsId, trackConversion } from "@/lib/analytics";
import { optionalCookiesAllowed } from "@/lib/cookie-consent";
const publicPath = (path: string) => path === "/" || /^\/(cars|services|travel|contact|privacy|rental-terms)(\/|$)/.test(path);
export default function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!analyticsId) return;
    function update() {
      const allowed = optionalCookiesAllowed(document.cookie) && publicPath(pathname);
      (window as unknown as Record<string, unknown>)[`ga-disable-${analyticsId}`] = !allowed;
      if (!allowed) {
        if (window.gtag) window.gtag("consent", "update", { analytics_storage: "denied" });
        return;
      }
      if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = function (...args: unknown[]) {
          void args;
          // Google's command queue uses an Arguments object.
          // eslint-disable-next-line prefer-rest-params
          window.dataLayer!.push(arguments);
        };
        window.gtag("consent", "default", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
        window.gtag("consent", "update", { analytics_storage: "granted" });
        window.gtag("js", new Date());
        window.gtag("config", analyticsId, { send_page_view: false, page_location: `${window.location.origin}${pathname}`, page_referrer: "", allow_google_signals: false, allow_ad_personalization_signals: false });
        const script = document.createElement("script");
        script.async = true; script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
        document.head.appendChild(script);
      } else window.gtag("consent", "update", { analytics_storage: "granted" });
      // Never send query strings, references, customer names or contact details.
      window.gtag("event", "page_view", { page_location: `${window.location.origin}${pathname}`, page_title: "Movara Car Hire", page_referrer: "" });
    }
    function click(event: MouseEvent) {
      if (!publicPath(pathname) || !(event.target instanceof Element)) return;
      const href = event.target.closest("a")?.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) trackConversion("call_click");
      else if (href.startsWith("https://wa.me/")) trackConversion("whatsapp_click");
    }
    update(); window.addEventListener("movara:cookie-choice", update); document.addEventListener("click", click);
    return () => { window.removeEventListener("movara:cookie-choice", update); document.removeEventListener("click", click); };
  }, [pathname]);
  return null;
}
