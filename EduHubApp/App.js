import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CourseProvider } from "./src/context/CourseContext";
import { MaterialProvider } from "./src/context/MaterialContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CourseProvider>
          <MaterialProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </MaterialProvider>
        </CourseProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}