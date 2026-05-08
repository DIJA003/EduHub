
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("eduhub-theme") === "dark";
    } catch { return true; }
  });

  useEffect(() => {
    try { localStorage.setItem("eduhub-theme", darkMode ? "dark" : "light"); } catch {}
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