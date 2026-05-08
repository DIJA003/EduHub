import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CourseProvider } from "./src/context/CourseContext";
import { MaterialProvider } from "./src/context/MaterialContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useTheme } from "./src/context/ThemeContext";

// Inner component so useTheme() can access ThemeProvider
function AppContent() {
  const { isDark } = useTheme();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <CourseProvider>
            <MaterialProvider>
              <AppContent />
            </MaterialProvider>
          </CourseProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}