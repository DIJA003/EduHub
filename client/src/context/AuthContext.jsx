import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    user: null,
    dbUser: null,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthState({ loading: false, user: null, dbUser: null });
        return;
      }

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch('http://localhost:8000/api/users/login', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dbUser = res.ok ? await res.json() : null;
        setAuthState({ loading: false, user: firebaseUser, dbUser });
      } catch {
        setAuthState({ loading: false, user: firebaseUser, dbUser: null });
      }
    });

    return () => unsubscribe();
  }, []);

  const refetch = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken(true);
      const res = await fetch('http://localhost:8000/api/users/login', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dbUser = res.ok ? await res.json() : null;
      setAuthState((prev) => ({ ...prev, dbUser }));
    } catch {}
  };

  return (
    <AuthContext.Provider value={{ ...authState, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);