
import { useEffect } from "react";
import useAuthStore from "../stores/auth.store";

export function AuthProvider({ children }) {
  // Auto-refresh auth state every 30 seconds to ensure synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      const forceRefresh = useAuthStore.getState().forceRefresh;
      if (forceRefresh) {
        forceRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return <>{children}</>;
}

export function useAuth() {
  // Subscribe to all auth store changes to ensure reactivity
  const firebaseUser = useAuthStore((state) => state.firebaseUser);
  const dbUser = useAuthStore((state) => state.dbUser);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const logout = useAuthStore((state) => state.logout);
  const refreshDbUser = useAuthStore((state) => state.refreshDbUser);
  const forceRefresh = useAuthStore((state) => state.forceRefresh);
  
  const role = dbUser?.role || null;
  const isAuthenticated = !!firebaseUser && !!dbUser;
  const isAdmin = role === "admin";
  const isMentor = role === "mentor";
  const isStudent = role === "student";
  
  // Force re-render when auth state changes by creating a derived state
  const authState = {
    user: dbUser,
    firebaseUser,
    dbUser,
    loading,
    error,
    logout,
    refreshDbUser,
    forceRefresh,
    isAuthenticated,
    role,
    isAdmin,
    isMentor,
    isStudent,
  };
  
  return authState;
}