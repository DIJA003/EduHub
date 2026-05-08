import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CourseProvider } from "./src/context/CourseContext";
import { MaterialProvider } from "./src/context/MaterialContext";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";

function AppContent() {
  const { isDark } = useTheme();
  return (
    <AuthProvider>
      <CourseProvider>
        <MaterialProvider>
          <StatusBar style={isDark ? "light" : "dark"} />
          <AppNavigator />
        </MaterialProvider>
      </CourseProvider>
    </AuthProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}