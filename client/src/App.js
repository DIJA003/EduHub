import AppRoutes from "./routes/AppRouts";
import { CourseProvider } from "./context/CourseContext";

function App() {
  return (
    <CourseProvider>
      <AppRoutes />
    </CourseProvider>
  );
}

export default App;