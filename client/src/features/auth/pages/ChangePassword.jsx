import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import useAuthStore from "../../../stores/auth.store";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const dbUser = useAuthStore((s) => s.dbUser);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.next !== form.confirm)
      return setError("New passwords do not match.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.next)) {
      return setError(
        "Password must be 8+ chars with uppercase, lowercase, and a number.",
      );
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      const cred = EmailAuthProvider.credential(user.email, form.current);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, form.next);
      setSuccess(true);
      setTimeout(() => navigate(-1), 2000);
    } catch (err) {
      const msgs = {
        "auth/wrong-password": "Current password is incorrect.",
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-slate-600 hover:text-blue-600"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-black text-slate-900">Change password</h1>
        {success ? (
          <div className="mt-6 rounded-lg bg-green-50 px-4 py-4 text-sm font-medium text-green-700">
            ✅ Password changed successfully. Redirecting…
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}
            {[
              {
                name: "current",
                placeholder: "Current password",
                autoComplete: "current-password",
              },
              {
                name: "next",
                placeholder: "New password",
                autoComplete: "new-password",
              },
              {
                name: "confirm",
                placeholder: "Confirm new password",
                autoComplete: "new-password",
              },
            ].map((f) => (
              <input
                key={f.name}
                name={f.name}
                type="password"
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                value={form[f.name]}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
