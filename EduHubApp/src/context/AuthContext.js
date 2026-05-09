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
import { endpoints } from "../services/api";

const AuthContext = createContext(null);

// The web app's email-confirmed landing page — same continueUrl the web uses
// so after tapping the link in email, the user lands on the web verified page.
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
      user:   firebaseUser,
      dbUser,

      login: async (email, password) => {
        await signInWithEmailAndPassword(auth, email.trim(), password);
        const profile = await endpoints.auth.loginProfile();
        setDbUser(profile);
        return profile;
      },

      register: async ({ name, email, password, role, college }) => {
        // 1. Create Firebase account
        const cred = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

        // 2. Send verification email — same as the web does.
        //    continueUrl brings user back to the web verified page.
        try {
          await sendEmailVerification(cred.user, {
            url: WEB_CONTINUE_URL,
          });
        } catch (verifyErr) {
          // Non-fatal — account is created, email may still send later
          console.warn("[AuthContext] sendEmailVerification failed:", verifyErr.message);
        }

        // 3. Register user in MongoDB
        await endpoints.auth.registerDbUser({
          name,
          email,
          role:    role    || "student",
          college: college || "",
        });

        // 4. Fetch DB profile
        const profile = await endpoints.auth.loginProfile();
        setDbUser(profile);

        return { cred, profile };
      },

      forgotPassword: (email) =>
        sendPasswordResetEmail(auth, email.trim()),

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