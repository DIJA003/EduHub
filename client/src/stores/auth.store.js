// stores/auth.store.js
// Zustand store for Firebase auth state.
// Fully CRA-compatible — no import.meta.env anywhere.

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { auth } from "../lib/firebase";
import apiClient from "../lib/api/client";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { queryClient } from "../lib/queryClient";

const fetchDbUser = async (retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await apiClient.get("/auth/me");
      return response.data?.data || response.data;
    } catch (err) {
      if (err.status === 403 && attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (attempt === retries) {
        console.warn("[AuthStore] Could not fetch dbUser:", err.message);
      }
      return null;
    }
  }
  return null;
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
