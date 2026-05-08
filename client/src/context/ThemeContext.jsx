import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem("eduhub-theme");
      if (stored) return stored === "dark";
      // Default to dark if no preference, check system preference
      return window.matchMedia?.("(prefers-color-scheme: light)").matches ? false : true;
    } catch { return true; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("eduhub-theme", darkMode ? "dark" : "light");
    } catch {}

    // Apply theme to document with smooth transition
    const root = window.document.documentElement;
    root.classList.add("theme-transitioning");
    
    if (darkMode) {
      root.removeAttribute("data-theme");
      root.classList.remove("light");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
    }

    // Remove transition class after animation completes
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
