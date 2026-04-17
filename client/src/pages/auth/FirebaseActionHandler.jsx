import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../../services/firebase";

export default function FirebaseActionHandler() {
  const [params] = useSearchParams();
  const mode = params.get("mode");
  const oobCode = params.get("oobCode");
  const [status, setStatus] = useState("loading");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === "verifyEmail" && oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => setStatus("verified"))
        .catch(() => {
          setStatus("error");
          setError("Link expired or already used.");
        });
    } else if (mode === "resetPassword" && oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then(() => setStatus("resetReady"))
        .catch(() => {
          setStatus("error");
          setError("Reset link expired or already used.");
        });
    } else {
      setStatus("error");
      setError("Invalid or missing action parameters.");
    }
  }, [mode, oobCode]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("resetDone");
    } catch (err) {
      setError("Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700 text-center">
        {status === "loading" && <p className="text-slate-500">Processing…</p>}

        {status === "verified" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
              <svg
                className="h-8 w-8 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Email Confirmed!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your email has been verified successfully.
            </p>
            <Link
              to="/home"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Continue to Home
            </Link>
          </>
        )}

        {status === "resetReady" && (
          <>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-4">
              Set New Password
            </h1>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <form onSubmit={handleReset} className="space-y-4 text-left">
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 ring-blue-600/20 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                required
              />
              <button
                type="submit"
                className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
              >
                Reset Password
              </button>
            </form>
          </>
        )}

        {status === "resetDone" && (
          <>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Password Changed!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your password has been reset successfully.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Back to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Link
              to="/login"
              className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
