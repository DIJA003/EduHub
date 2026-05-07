import { create } from "zustand";
import { persist } from "zustand/middleware";

const THEME_VALUES = ["light", "dark"];
const STORAGE_KEY = "eduhub-theme";

function applyDomTheme(theme) {
  const t = THEME_VALUES.includes(theme) ? theme : "dark";
  document.documentElement.setAttribute("data-theme", t);
  document.documentElement.style.colorScheme =
    t === "light" ? "light" : "dark";
  if (typeof document !== "undefined") {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        "content",
        t === "light" ? "#f5f6fa" : "#0d0f14",
      );
    }
  }
}

export function initThemeAttributes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const theme = parsed?.state?.theme;
    applyDomTheme(theme || "dark");
  } catch {
    applyDomTheme("dark");
  }
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "dark",
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyDomTheme(next);
        set({ theme: next });
      },
      setTheme: (theme) => {
        const next = THEME_VALUES.includes(theme) ? theme : "dark";
        applyDomTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({ theme: s.theme }),
      onRehydrateStorage: () => (state, err) => {
        if (!err && state?.theme) applyDomTheme(state.theme);
      },
    },
  ),
);

export { applyDomTheme, THEME_VALUES };
