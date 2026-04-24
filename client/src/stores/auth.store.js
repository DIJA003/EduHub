import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { auth } from "../lib/firebase";
import apiClient from "../lib/api/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { queryClient } from "../lib/queryClient";
import { useEffect } from "react";

const fetchDbUser = async () => {
  try {
    if (!auth.currentUser) return null;

    const token = await auth.currentUser.getIdToken(true);

    const response = await apiClient.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data?.data || response.data;
  } catch (err) {
    return null;
  }
};

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

const useAuthStore = create(
  devtools(
    (set, get) => ({
      firebaseUser: undefined,
      dbUser: null,
      loading: true,
      error: null,

      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setDbUser: (dbUser) => set({ dbUser }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      refreshDbUser: async () => {
        const dbUser = await fetchDbUser();
        set({ dbUser });
        return dbUser;
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch {}

        queryClient.clear();

        set({
          firebaseUser: null,
          dbUser: null,
          loading: false,
          error: null,
        });
      },
    }),
    { name: "eduhub-auth-store" },
  ),
);

let unsubscribe = null;
export const initAuthListener = () => {
  if (unsubscribe) return;

  const state = useAuthStore.getState();

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    state.setLoading(true);
    state.setFirebaseUser(firebaseUser ?? null);
    state.setDbUser(null);

    if (firebaseUser) {
      const dbUser = await fetchDbUser();
      state.setDbUser(dbUser);
    }

    state.setLoading(false);
  });
};

export default useAuthStore;
