"use client";

export default function CookieSettingsButton() {
  return (
    <button
      type="button"
      className="ml-4 underline hover:text-white"
      onClick={() => window.dispatchEvent(new Event("movara:open-cookie-settings"))}
    >
      Cookie settings
    </button>
  );
}
