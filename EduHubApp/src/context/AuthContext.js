import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../services/firebase";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

const WEB_CONTINUE_URL =
  process.env.EXPO_PUBLIC_WEB_URL
    ? `${process.env.EXPO_PUBLIC_WEB_URL}/email-confirmed`
    : "http://localhost:3000/email-confirmed";

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(undefined);
  const [dbUser,       setDbUser]       = useState(null);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (!user) {
        setDbUser(null);
        setLoading(false);
        return;
      }

      try {
        // Try with current token first
        const profile = await authApi.getMe();
        setDbUser(profile);
      } catch (firstErr) {
        // Only try force-refresh if it looks like a token issue
        const isTokenErr =
          firstErr.message?.includes("401") ||
          firstErr.message?.includes("expired") ||
          firstErr.message?.includes("Token") ||
          firstErr.message?.includes("invalid");

        if (isTokenErr) {
          try {
            // Force-refresh and retry once
            await user.getIdToken(true);
            const profile = await authApi.getMe();
            setDbUser(profile);
          } catch (retryErr) {
            // Refresh failed — silently sign out, user logs in fresh
            // No error shown — they just see the login screen
            console.warn("[AuthContext] token refresh failed, signing out:", retryErr.message);
            await signOut(auth).catch(() => {});
            setDbUser(null);
          }
        } else {
          // Non-token error (network down etc.) — keep user logged in
          // and show empty data rather than kicking them out
          console.warn("[AuthContext] profile fetch failed:", firstErr.message);
          setDbUser(null);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const value = useMemo(
    () => ({
      loading,
      user:   firebaseUser,
      dbUser,

      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await authApi.getMe();
        setDbUser(profile);
        return profile;
      },

      register: async ({ name, email, password, role, college }) => {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        try {
          await sendEmailVerification(cred.user, { url: WEB_CONTINUE_URL });
        } catch (verifyErr) {
          console.warn("[AuthContext] sendEmailVerification failed:", verifyErr.message);
        }
        await authApi.register({ name, email, role: role || "student", college: college || "" });
        const profile = await authApi.getMe();
        setDbUser(profile);
        return { cred, profile };
      },

      forgotPassword: (email) => sendPasswordResetEmail(auth, email.trim()),
      logout: () => signOut(auth),
    }),
    [loading, firebaseUser, dbUser],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}