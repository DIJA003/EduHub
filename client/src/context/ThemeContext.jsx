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

    // Apply theme to document
    const root = window.document.documentElement;
    if (darkMode) {
      root.removeAttribute("data-theme");
      root.classList.remove("light");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
    }
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