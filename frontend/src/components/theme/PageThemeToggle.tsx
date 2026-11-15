"use client";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
export default function PageThemeToggle() {
  const pathname = usePathname();
  if (!["/sign-in", "/movara-access", "/admin-login", "/workspace"].includes(pathname)) return null;
  return <div className="mx-auto flex max-w-7xl justify-end px-4 pt-4 sm:px-6"><ThemeToggle /></div>;
}
