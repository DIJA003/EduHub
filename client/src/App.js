import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRouts";

function App() {
  return (
    <AuthProvider>
<<<<<<< Updated upstream
      <AppRoutes />
=======
      <CourseProvider>
        <MaterialProvider>
          <AppRoutes />
        </MaterialProvider>
      </CourseProvider>
>>>>>>> Stashed changes
    </AuthProvider>
  );
}

export default App;
