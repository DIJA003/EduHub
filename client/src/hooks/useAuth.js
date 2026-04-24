import { useEffect } from "react";
import useAuthStore, { initAuthListener } from "../stores/auth.store";

export const useAuth = () => {
  useEffect(() => {
    initAuthListener();
  }, []);

  const { firebaseUser, dbUser, loading, error, logout, refreshDbUser } =
    useAuthStore();

  const isAuthenticated = !!firebaseUser && !!dbUser;
  const role = dbUser?.role || null;
  const isAdmin = role === "admin";
  const isMentor = role === "mentor";
  const isStudent = role === "student";

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
