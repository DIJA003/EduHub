import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDbUser = useCallback(async (firebaseUser, retries = 2) => {
    if (!firebaseUser) return null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Force refresh token on retry attempts
        const token = await firebaseUser.getIdToken(attempt > 0);
        const res = await fetch(`${API_URL}/users/login`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          return data;
        }
        if (res.status === 403) {
          // User not in DB yet (race during registration), wait and retry
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            continue;
          }
        }
        console.warn(`[AuthContext] login fetch failed: ${res.status}`);
        return null;
      } catch (err) {
        console.error("[AuthContext] fetchDbUser error:", err.message);
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
        }
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setDbUser(null);

      if (firebaseUser) {
        const data = await fetchDbUser(firebaseUser);
        setDbUser(data);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchDbUser]);

  // Expose a refresh function so other parts of the app can re-fetch dbUser
  const refreshDbUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    const data = await fetchDbUser(firebaseUser);
    setDbUser(data);
  }, [fetchDbUser]);

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, refreshDbUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
