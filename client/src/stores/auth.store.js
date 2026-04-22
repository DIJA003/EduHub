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
    const status = err?.status || err?.response?.status;
    if (status === 401 || status === 404) return null;
    if (status === 403) {
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const token2 = await auth.currentUser?.getIdToken(true);
        if (!token2) return null;
        const retry = await apiClient.get("/auth/me", {
          headers: { Authorization: `Bearer ${token2}` },
        });
        return retry.data?.data || retry.data;
      } catch {
        return null;
      }
    }
    console.warn("[AuthStore] fetchDbUser error:", err.message);
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

      _setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      _setDbUser: (dbUser) => set({ dbUser }),
      _setLoading: (loading) => set({ loading }),
      _setError: (error) => set({ error }),

      refreshDbUser: async () => {
        const dbUser = await fetchDbUser();
        set({ dbUser });
        return dbUser;
      },

      logout: async () => {
        try {
          await signOut(auth);
        } catch (err) {
          console.warn("[AuthStore] Sign-out error:", err.message);
        }
        queryClient.clear();
        set({ firebaseUser: null, dbUser: null, error: null });
      },

      get isAuthenticated() {
        const s = get();
        return !!s.firebaseUser && !!s.dbUser;
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
    { name: "eduhub-auth-store" },
  ),
);

let _listenerInitialised = false;

export const initAuthListener = () => {
  if (_listenerInitialised) return;
  _listenerInitialised = true;

  const { _setFirebaseUser, _setDbUser, _setLoading } = useAuthStore.getState();

  onAuthStateChanged(auth, async (firebaseUser) => {
    _setFirebaseUser(firebaseUser ?? null);
    _setDbUser(null);

    if (firebaseUser) {
      const dbUser = await fetchDbUser();
      _setDbUser(dbUser);
    }

    _setLoading(false);
  });
};

export default useAuthStore;
