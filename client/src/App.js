import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRouts';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;