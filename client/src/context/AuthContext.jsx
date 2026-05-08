
import { createContext, useContext } from "react";
import useAuthStore from "../stores/auth.store";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return <AuthContext.Provider value={null}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const { firebaseUser, dbUser, loading, logout, refreshDbUser } = useAuthStore();
  return {
    user: firebaseUser,
    dbUser,
    loading,
    logout,
    refreshDbUser,
    isAuthenticated: !!firebaseUser && !!dbUser,
  };
}