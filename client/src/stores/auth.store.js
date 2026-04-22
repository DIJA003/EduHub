import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { auth } from "../lib/firebase";
import apiClient from "../lib/api/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { queryClient } from "../lib/queryClient";

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

let initialized = false;

export const initAuthListener = () => {
  if (initialized) return;
  initialized = true;

  const state = useAuthStore.getState();

  onAuthStateChanged(auth, async (firebaseUser) => {
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
