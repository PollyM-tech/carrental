import { siteConfig } from "@/config/site";

export default function SecondaryContact({ className = "underline", label = "" }: { className?: string; label?: string }) {
  return <a href={`tel:${siteConfig.secondaryPhoneInternational}`} className={className}>{label}{siteConfig.secondaryPhone}</a>;
}
