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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
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
            Password updated!
          </h1>
          <p className="mt-2 text-sm text-slate-500">
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/home"
            className="text-sm font-semibold text-slate-600 hover:text-blue-600"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-black text-slate-900 mb-1">
            Change password
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            Enter your current password, then choose a new one.
          </p>

          {errMsg && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
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
            <div className="h-px bg-slate-100" />
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
                      ? "bg-red-400"
                      : form.newPassword.length < 10
                        ? "bg-amber-400"
                        : "bg-emerald-500";
                  return (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? color : "bg-slate-200"}`}
                    />
                  );
                })}
              </div>
            )}

            <Button
              type="submit"
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
