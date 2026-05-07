import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { endpoints } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setDbUser(null);
        setLoading(false);
        return;
      }
      try {
        const profile = await endpoints.auth.loginProfile();
        setDbUser(profile);
      } catch (err) {
        console.warn("[AuthContext] profile fetch failed:", err.message);
        setDbUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      loading,
      user: firebaseUser,
      dbUser,
      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await endpoints.auth.loginProfile();
        setDbUser(profile);
        return profile;
      },
      register: async ({ name, email, password, role, college }) => {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await endpoints.auth.registerDbUser({ name, email, role: role || "student", college: college || "" });
        const profile = await endpoints.auth.loginProfile();
        setDbUser(profile);
        return { cred, profile };
      },
      forgotPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
      logout: () => signOut(auth),
    }),
    [loading, firebaseUser, dbUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
