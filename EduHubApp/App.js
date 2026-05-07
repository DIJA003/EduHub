import { StatusBar } from "expo-status-bar";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { CourseProvider } from "./src/context/CourseContext";
import { MaterialProvider } from "./src/context/MaterialContext";

export default function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <MaterialProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </MaterialProvider>
      </CourseProvider>
    </AuthProvider>
  );
}
