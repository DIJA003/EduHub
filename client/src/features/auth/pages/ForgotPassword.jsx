import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError("Please enter your email address.");
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
      });
      setSent(true);
    } catch (err) {
      const msgs = {
        "auth/user-not-found": "No account found with this email.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            ← Back to Login
          </Link>
        </div>
        <div className="rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <span className="text-2xl">✉️</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Check your inbox
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                A password reset link was sent to <strong>{email}</strong>
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-sm font-semibold text-blue-600 hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-slate-900">
                Reset password
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Enter your email to receive a reset link.
              </p>
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
