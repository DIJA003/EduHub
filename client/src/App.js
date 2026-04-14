import { AuthProvider } from "./context/AuthContext";
import { CourseProvider } from "./context/CourseContext";
import { MaterialProvider } from "./context/MaterialContext";
import AppRoutes from "./routes/AppRouts";

function App() {
  return (
    <AuthProvider>
      <CourseProvider>
        <MaterialProvider>
          <AppRoutes />
        </MaterialProvider>
      </CourseProvider>
    </AuthProvider>
  );
}

export default App;
