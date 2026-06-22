/**
 * Theme vocabulary for the dashboard.
 *
 * The dashboard is fully CSS-variable driven and scoped under `.aa-dash`, so a
 * theme is just a value of `data-theme` on <html>. The light palette is defined
 * in dashboard.css under `html[data-theme="light"] .aa-dash`. We store the user's
 * RAW choice ("dark" | "light" | "system") and resolve "system" against the OS
 * preference at apply time.
 */

export type Theme = "dark" | "light" | "system";
export type ResolvedTheme = "dark" | "light";

export const THEME_STORAGE_KEY = "aa-theme";
export const DEFAULT_THEME: Theme = "dark";

export const THEME_OPTIONS: { value: Theme; label: string; hint: string }[] = [
  { value: "dark", label: "Dark", hint: "default" },
  { value: "light", label: "Light", hint: "" },
  { value: "system", label: "Match system", hint: "" },
];

const prefersLight = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-color-scheme: light)").matches;

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return prefersLight() ? "light" : "dark";
  return theme;
}

/** Apply a resolved theme to the document (sets html[data-theme]). */
export function applyResolvedTheme(resolved: ResolvedTheme): void {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = resolved;
  }
}

/**
 * Inline script (stringified) injected at the top of <body> so the correct
 * theme is set BEFORE first paint — no flash of the wrong palette on load.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)})||${JSON.stringify(DEFAULT_THEME)};var r=t==="system"?(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):t;document.documentElement.dataset.theme=r;}catch(e){document.documentElement.dataset.theme="dark";}})();`;
