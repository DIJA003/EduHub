import { useEffect } from "react";
import { useThemeStore, applyDomTheme } from "../../stores/theme.store";

export default function ThemeProvider({ children }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  return children;
}
