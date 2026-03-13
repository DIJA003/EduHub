import AppRoutes from "./routes/AppRouts";
import { CourseProvider } from "./context/CourseContext";
import { MaterialProvider } from "./context/MaterialContext";

function App() {
  return (
    <CourseProvider>
      <MaterialProvider>
        <AppRoutes />
      </MaterialProvider>
    </CourseProvider>
  );
}

export default App;