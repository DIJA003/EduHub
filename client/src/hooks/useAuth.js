import { useEffect } from "react";
import useAuthStore, { initAuthListener } from "../stores/auth.store";

export const useAuth = () => {
  useEffect(() => {
    initAuthListener();
  }, []);

  const {
    firebaseUser,
    dbUser,
    loading,
    error,
    logout,
    refreshDbUser,
    isAuthenticated,
    role,
    isAdmin,
    isMentor,
    isStudent,
  } = useAuthStore();

  return {
    user: dbUser,
    firebaseUser,
    loading,
    error,
    logout,
    refreshDbUser,
    isAuthenticated,
    role,
    isAdmin,
    isMentor,
    isStudent,
  };
};
