import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import useAuthStore from "../../../stores/auth.store";

export default function EmailVerification() {
  const navigate = useNavigate();
  const firebaseUser = useAuthStore((s) => s.firebaseUser);
  const logout = useAuthStore((s) => s.logout);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resend = async () => {
    if (!firebaseUser) return;
    setLoading(true);
    setError("");
    try {
      await sendEmailVerification(firebaseUser, {
        url: `${window.location.origin}/login`,
      });
      setSent(true);
    } catch (err) {
      setError(
        err.code === "auth/too-many-requests"
          ? "Too many requests. Wait a few minutes."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    if (!firebaseUser) return;
    await firebaseUser.reload();
    if (auth.currentUser?.emailVerified) navigate("/home");
    else
      setError("Email not verified yet. Check your inbox and click the link.");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl">
          ✉️
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Verify your email
        </h1>
        <p className="mt-3 text-sm text-slate-500">
          We sent a verification link to{" "}
          <strong className="text-slate-800">
            {firebaseUser?.email || "your email"}
          </strong>
          . Click the link to activate your account.
        </p>
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </div>
        )}
        {sent && (
          <div className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-600">
            Verification email resent!
          </div>
        )}
        <div className="mt-8 space-y-3">
          <button
            onClick={handleCheck}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
          >
            I've verified my email
          </button>
          <button
            onClick={resend}
            disabled={loading || sent}
            className="w-full rounded-lg border border-slate-300 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Resend verification email"}
          </button>
          <button
            onClick={logout}
            className="w-full text-sm text-slate-400 hover:text-slate-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
