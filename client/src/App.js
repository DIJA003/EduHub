import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRouts';
import { CourseProvider } from "./context/CourseContext";
import { MaterialProvider } from "./context/MaterialContext";

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