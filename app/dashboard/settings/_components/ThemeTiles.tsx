"use client";

import { useTheme } from "@/components/theme-provider";
import { THEME_OPTIONS } from "@/lib/theme";

/** Theme preview swatch class per option. */
const previewClass: Record<string, string> = {
  dark: "dark",
  light: "light",
  system: "system",
};

/**
 * Interactive theme picker. Reads/writes the active theme via the ThemeProvider,
 * which persists the choice and applies `data-theme` on <html>. Selecting a tile
 * recolours the whole dashboard instantly (this page included).
 */
export function ThemeTiles() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-grid" role="radiogroup" aria-label="Theme">
      {THEME_OPTIONS.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.value)}
            className={`theme-tile ${previewClass[opt.value]}${active ? " active" : ""}`}
          >
            <div className="label">
              {opt.label}
              {opt.hint ? ` · ${opt.hint}` : ""}
            </div>
          </button>
        );
      })}
    </div>
  );
}
