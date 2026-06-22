"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  applyResolvedTheme,
  DEFAULT_THEME,
  resolveTheme,
  ResolvedTheme,
  Theme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

interface ThemeContextValue {
  /** The user's raw choice (may be "system"). */
  theme: Theme;
  /** What's actually applied right now ("dark" | "light"). */
  resolved: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  resolved: "dark",
  setTheme: () => {},
});

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start from the default so the server render and the first client render
  // agree (no hydration mismatch); the saved choice is synced in after mount.
  // The inline boot script in layout.tsx already applied the right palette
  // pre-paint, so there's no visible flash in between.
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);
  // Bumped by the OS preference listener so "system" re-resolves live.
  const [, bumpSystem] = useState(0);

  // Derived (not stored) — recomputed each render; resolveTheme reads the live OS
  // preference for "system".
  const resolved = resolveTheme(theme);

  // Pull the saved choice in after mount (localStorage is client-only). Syncing
  // post-mount — rather than initialising state from storage — keeps the server
  // and first client render identical, so there's no hydration mismatch.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration of a client-only stored value
    setThemeState(readStoredTheme());
  }, []);

  // Apply the resolved palette to <html> whenever it changes.
  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  // While following the system, react to OS light/dark changes live.
  useEffect(() => {
    if (theme !== "system" || typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => bumpSystem((n) => n + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage may be unavailable (private mode) — still apply for the session */
    }
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
