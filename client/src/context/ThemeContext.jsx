import {
  createContext,
  useContext,
  useState,
  useLayoutEffect,
  useRef,
} from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const skipTransitionOnce = useRef(true);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("eduhub-theme");
      if (stored) return stored === "dark";
      // Default to dark if no preference, check system preference
      return window.matchMedia?.("(prefers-color-scheme: light)").matches ? false : true;
    } catch { return true; }
  });

  useLayoutEffect(() => {
    try {
      localStorage.setItem("eduhub-theme", darkMode ? "dark" : "light");
    } catch {}

    const root = window.document.documentElement;
    const animate = !skipTransitionOnce.current;
    skipTransitionOnce.current = false;
    if (animate) root.classList.add("theme-transitioning");

    if (darkMode) {
      root.removeAttribute("data-theme");
      root.classList.remove("light");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
    }

    if (!animate) return undefined;
    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 300);
    return () => clearTimeout(timer);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((v) => !v);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
