import React, {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "eduhub-student-dark";

function readStoredDark() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkModeState] = useState(readStoredDark);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("eduhub-dark", darkMode);
    try {
      window.localStorage.setItem(STORAGE_KEY, darkMode ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [darkMode]);

  const setDarkMode = useCallback((value) => {
    setDarkModeState(Boolean(value));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkModeState((d) => !d);
  }, []);

  const value = useMemo(
    () => ({ darkMode, setDarkMode, toggleDarkMode }),
    [darkMode, setDarkMode, toggleDarkMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
