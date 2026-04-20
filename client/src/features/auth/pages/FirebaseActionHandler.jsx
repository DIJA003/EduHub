import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function FirebaseActionHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (!mode || !oobCode) {
      setStatus("error");
      setMessage("Invalid action link. Please request a new one.");
      return;
    }

    if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => {
          setStatus("verified");
          setMessage("Email verified! You can now sign in.");
          setTimeout(() => navigate("/login"), 3000);
        })
        .catch((err) => {
          setStatus("error");
          setMessage(
            err.code === "auth/invalid-action-code"
              ? "This link has expired or already been used. Please request a new one."
              : err.message,
          );
        });
    } else if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setResetEmail(email);
          setStatus("resetForm");
        })
        .catch((err) => {
          setStatus("error");
          setMessage(
            err.code === "auth/invalid-action-code"
              ? "This reset link has expired. Please request a new one."
              : err.message,
          );
        });
    } else {
      setStatus("error");
      setMessage("Unknown action type.");
    }
  }, [mode, oobCode, navigate]);

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) {
      return setPasswordError(
        "Must be 8+ chars with upper, lower, and number.",
      );
    }
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("success");
      setMessage("Password reset! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  const icons = {
    loading: "⏳",
    verified: "✅",
    success: "✅",
    error: "❌",
    resetForm: "🔑",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
          {icons[status]}
        </div>

        {status === "loading" && (
          <>
            <h2 className="text-xl font-bold text-slate-900">Processing…</h2>
            <p className="mt-2 text-sm text-slate-500">
              Please wait while we verify your request.
            </p>
          </>
        )}

        {(status === "verified" || status === "success") && (
          <>
            <h2 className="text-xl font-bold text-green-700">
              {status === "verified" ? "Email Verified!" : "Password Reset!"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
          </>
        )}

        {status === "error" && (
          <>
            <h2 className="text-xl font-bold text-red-600">Link Invalid</h2>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 text-sm font-semibold text-blue-600 hover:underline"
            >
              Return to login
            </button>
          </>
        )}

        {status === "resetForm" && (
          <form onSubmit={handleResetSubmit} className="text-left">
            <h2 className="text-xl font-bold text-slate-900 text-center">
              Set new password
            </h2>
            <p className="mt-1 text-center text-sm text-slate-500">
              For <strong>{resetEmail}</strong>
            </p>
            {passwordError && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {passwordError}
              </div>
            )}
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError("");
              }}
              required
              className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              Set password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
