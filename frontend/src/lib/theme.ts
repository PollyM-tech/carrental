export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "movara-theme";
const THEME_EVENT = "movara:theme-change";
export function resolveTheme(saved: string | null, prefersDark: boolean): Theme {
  return saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
}
function readPreference() {
  try { return window.localStorage.getItem(THEME_STORAGE_KEY); } catch { return null; }
}
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
export function setTheme(theme: Theme) {
  applyTheme(theme);
  try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* The switch still works when storage is unavailable. */ }
  window.dispatchEvent(new Event(THEME_EVENT));
}
export function subscribeTheme(callback: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function systemChange() {
    const saved = readPreference();
    if (saved !== "light" && saved !== "dark") {
      applyTheme(resolveTheme(saved, media.matches));
      callback();
    }
  }
  function storageChange(event: StorageEvent) {
    if (event.key === THEME_STORAGE_KEY || event.key === null) {
      applyTheme(resolveTheme(readPreference(), media.matches));
      callback();
    }
  }
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", storageChange);
  media.addEventListener("change", systemChange);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", storageChange);
    media.removeEventListener("change", systemChange);
  };
}
// Runs before the page paints so a saved dark preference does not flash white.
export const themeInitScript = `(function(){var saved=null;try{saved=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var theme=saved==="light"||saved==="dark"?saved:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;})();`;
