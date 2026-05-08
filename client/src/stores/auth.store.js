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
  } catch {
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
        set({ dbUser, error: dbUser ? null : "Failed to sync account profile." });
        return dbUser;
      },

      forceRefresh: async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
          set({ loading: true, dbUser: null, error: null });
          try {
            const dbUser = await fetchDbUser();
            set({ 
              firebaseUser: currentUser, 
              dbUser, 
              error: dbUser ? null : "Failed to sync account profile.",
              loading: false
            });
            return dbUser;
          } catch (error) {
            set({ 
              error: "Failed to sync account profile.",
              loading: false
            });
            return null;
          }
        } else {
          set({ 
            firebaseUser: null, 
            dbUser: null, 
            loading: false, 
            error: null 
          });
          return null;
        }
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
let authTimeout = null;

export const initAuthListener = () => {
  if (unsubscribe) return;

  unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    // Clear any existing timeout
    if (authTimeout) {
      clearTimeout(authTimeout);
    }

    // Set loading state immediately
    useAuthStore.setState({ 
      loading: true, 
      firebaseUser: firebaseUser ?? null, 
      dbUser: null, 
      error: null 
    });

    if (firebaseUser) {
      try {
        const dbUser = await fetchDbUser();
        
        // Add a small delay to ensure UI updates properly
        authTimeout = setTimeout(() => {
          useAuthStore.setState({ 
            dbUser, 
            error: dbUser ? null : "Failed to sync account profile.",
            loading: false
          });
        }, 100);
        
      } catch (error) {
        authTimeout = setTimeout(() => {
          useAuthStore.setState({ 
            error: "Failed to sync account profile.",
            loading: false
          });
        }, 100);
      }
    } else {
      // Immediate update for logout
      authTimeout = setTimeout(() => {
        useAuthStore.setState({ 
          loading: false
        });
      }, 50);
    }
  });
};

export default useAuthStore;
