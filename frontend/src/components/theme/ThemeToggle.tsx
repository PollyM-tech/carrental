"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { currentTheme, setTheme, subscribeTheme } from "@/lib/theme";
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "light");
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return <button type="button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={label} title={label} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B1C4D] transition-colors hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"><Moon className="theme-moon" size={19} aria-hidden="true" /><Sun className="theme-sun" size={19} aria-hidden="true" /></button>;
}
