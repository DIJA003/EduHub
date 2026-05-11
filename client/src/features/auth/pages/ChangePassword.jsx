import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { authApi } from "../../../lib/api/auth.api";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { ThemeToggleFixedCorner } from "../../../components/common/ThemeToggle";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return navigate("/login");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.newPassword)) {
      return setErrMsg(
        "Password must be at least 8 chars with uppercase, lowercase, and a number.",
      );
    }
    if (form.newPassword !== form.confirmPassword)
      return setErrMsg("New passwords do not match.");
    if (form.newPassword === form.currentPassword)
      return setErrMsg("New password must differ from current.");

    setStatus("loading");
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        form.currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPassword);
      await authApi.logPasswordChange().catch(() => {});
      setStatus("success");
    } catch (err) {
      const messages = {
        "auth/wrong-password": "Current password is incorrect.",
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
        "auth/requires-recent-login":
          "Session expired. Please log out and log back in.",
      };
      setErrMsg(
        messages[err.code] || "Something went wrong. Please try again.",
      );
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center px-4 relative overflow-hidden">
        <ThemeToggleFixedCorner />
        <div className="aurora-bg" aria-hidden="true">
          <div className="aurora-bg__blob-1" />
          <div className="aurora-bg__blob-2" />
        </div>
        <div className="w-full max-w-md glass-strong rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-xl)] text-center relative z-10">
          <div className="w-16 h-16 rounded-full bg-[var(--color-success-soft)] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[var(--color-success)]"
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
          <h1 className="text-xl font-black text-[var(--color-text)]">
            Password updated!
          </h1>
          <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-3)]">
            Your password has been changed successfully.
          </p>
          <Button
            className="mt-6 w-full"
            onClick={() => navigate("/home")}
            size="lg"
          >
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ThemeToggleFixedCorner />
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-bg__blob-1" />
        <div className="aurora-bg__blob-2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Link
            to="/home"
            className="text-[var(--text-sm)] font-semibold text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="glass-strong rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-xl)]">
          <h1 className="text-xl font-black text-[var(--color-text)] mb-1">
            Change password
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mb-6">
            Enter your current password, then choose a new one.
          </p>

          {errMsg && (
            <div className="mb-4 rounded-[var(--radius-lg)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)] border-opacity-30 px-4 py-3 text-[var(--text-sm)] text-[var(--color-danger)]">
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              value={form.currentPassword}
              onChange={set("currentPassword")}
              required
            />
            <div className="h-px bg-[var(--color-border)]" />
            <Input
              label="New password"
              type="password"
              placeholder="Min 8 chars"
              value={form.newPassword}
              onChange={set("newPassword")}
              required
            />
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              required
            />

            {/* Strength indicator */}
            {form.newPassword.length > 0 && (
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => {
                  const strength = Math.min(
                    Math.floor(form.newPassword.length / 3),
                    4,
                  );
                  const color =
                    form.newPassword.length < 6
                      ? "bg-[var(--color-danger)]"
                      : form.newPassword.length < 10
                        ? "bg-[var(--color-warning)]"
                        : "bg-[var(--color-success)]";
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? color : "bg-[var(--color-surface-3)]"}`}
                    />
                  );
                })}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              loading={status === "loading"}
              className="w-full"
              size="lg"
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
