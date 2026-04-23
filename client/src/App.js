import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { MaterialProvider } from "./context/MaterialContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CourseProvider>
          <MaterialProvider>
            <AppRoutes />
          </MaterialProvider>
        </CourseProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;