import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { auth } from "../lib/firebase";
import { authApi } from "../lib/api/auth.api";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { queryClient } from "../lib/queryClient";

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

      fetchDbUser: async (firebaseUser, retries = 2) => {
        if (!firebaseUser) return null;

        for (let attempt = 0; attempt <= retries; attempt++) {
          try {
            const { data } = await authApi.getMe();
            return data;
          } catch (err) {
            if (err.status === 403 && attempt < retries) {
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
              continue;
            }
            if (attempt === retries)
              console.warn("[AuthStore] Could not fetch dbUser:", err.message);
            return null;
          }
        }
        return null;
      },

      refreshDbUser: async () => {
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return;
        const dbUser = await get().fetchDbUser(firebaseUser);
        set({ dbUser });
      },

      logout: async () => {
        await signOut(auth);
        queryClient.clear();
        set({ firebaseUser: null, dbUser: null });
      },

      get isAuthenticated() {
        return !!get().firebaseUser && !!get().dbUser;
      },

      get role() {
        return get().dbUser?.role || null;
      },

      get isAdmin() {
        return get().dbUser?.role === "admin";
      },

      get isMentor() {
        return get().dbUser?.role === "mentor";
      },

      get isStudent() {
        return get().dbUser?.role === "student";
      },
    }),
    { name: "auth-store" },
  ),
);

let listenerInitialized = false;

export const initAuthListener = () => {
  if (listenerInitialized) return;
  listenerInitialized = true;

  const { setFirebaseUser, setDbUser, setLoading, fetchDbUser } =
    useAuthStore.getState();

  onAuthStateChanged(auth, async (firebaseUser) => {
    setFirebaseUser(firebaseUser ?? null);
    setDbUser(null);

    if (firebaseUser) {
      const dbUser = await fetchDbUser(firebaseUser);
      setDbUser(dbUser);
    }

    setLoading(false);
  });
};

export default useAuthStore;
