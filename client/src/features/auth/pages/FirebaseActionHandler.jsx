import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";

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
    if (newPassword.length < 8)
      return setError("Password must be at least 8 characters.");
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("resetDone");
    } catch {
      setError("Failed to reset password. The link may have expired.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {status === "loading" && <p className="text-slate-500">Processing…</p>}

        {status === "verified" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-black text-slate-900">
              Email Confirmed!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your email has been verified successfully.
            </p>
            <Link to="/home">
              <Button className="mt-6 w-full" size="lg">
                Continue to Home
              </Button>
            </Link>
          </>
        )}

        {status === "resetReady" && (
          <>
            <h1 className="text-xl font-black text-slate-900 mb-4">
              Set New Password
            </h1>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <form onSubmit={handleReset} className="text-left space-y-4">
              <Input
                label="New password"
                type="password"
                placeholder="Min 8 characters"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setError("");
                }}
                required
              />
              <Button type="submit" className="w-full" size="lg">
                Reset Password
              </Button>
            </form>
          </>
        )}

        {status === "resetDone" && (
          <>
            <h1 className="text-xl font-black text-slate-900">
              Password Changed!
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Your password has been reset successfully.
            </p>
            <Link to="/login">
              <Button className="mt-6 w-full" size="lg">
                Back to Login
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-black text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-500">{error}</p>
            <Link to="/login">
              <Button variant="secondary" className="mt-6 w-full" size="lg">
                Back to Login
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
