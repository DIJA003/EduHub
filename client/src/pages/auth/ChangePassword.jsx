import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../services/firebase";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [status, setStatus] = useState("idle");
  const [errMsg, setErrMsg] = useState("");
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrMsg("");
  };
  const toggle = (k) => setShowPw((s) => ({ ...s, [k]: !s[k] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      navigate("/login");
      return;
    }

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(form.newPassword)) {
      setErrMsg(
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
      );
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrMsg("New passwords do not match.");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setErrMsg("New password must be different from your current password.");
      return;
    }

    setStatus("loading");
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        form.currentPassword,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, form.newPassword);

      try {
        const token = await auth.currentUser.getIdToken();
        await fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/users/password-changed`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      } catch (err) {
        console.error("Failed to notify server about password change:", err);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      const msgs = {
        "auth/wrong-password": "Current password is incorrect.",
        "auth/invalid-credential": "Current password is incorrect.",
        "auth/too-many-requests": "Too many attempts. Please try again later.",
        "auth/requires-recent-login":
          "Session expired. Please log out and log back in.",
      };
      setErrMsg(msgs[err.code] || "Something went wrong. Please try again.");
    }
  };

  const EyeIcon = ({ visible }) => (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      {visible ? (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
          />
        </>
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </>
      )}
    </svg>
  );

  const PasswordField = ({ id, label, fieldKey, toggleKey, value }) => (
    <div>
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPw[toggleKey] ? "text" : "password"}
          placeholder={label}
          value={value}
          onChange={set(fieldKey)}
          required
          className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-10 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
        />
        <button
          type="button"
          onClick={() => toggle(toggleKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          tabIndex={-1}
        >
          <EyeIcon visible={showPw[toggleKey]} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/home"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-10 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
          {status === "success" ? (
            <div className="text-center">
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
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Password updated!
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Your password has been changed successfully.
              </p>
              <button
                onClick={() => navigate("/home")}
                className="mt-8 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700"
              >
                Go to Home
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Change password
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter your current password, then choose a new one.
              </p>

              {errMsg && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {errMsg}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <PasswordField
                  id="current"
                  label="Current password"
                  fieldKey="currentPassword"
                  toggleKey="current"
                  value={form.currentPassword}
                />
                <div className="h-px bg-slate-100 dark:bg-slate-800" />
                <PasswordField
                  id="new"
                  label="New password (min. 6 characters)"
                  fieldKey="newPassword"
                  toggleKey="next"
                  value={form.newPassword}
                />
                <PasswordField
                  id="confirm"
                  label="Confirm new password"
                  fieldKey="confirmPassword"
                  toggleKey="confirm"
                  value={form.confirmPassword}
                />

                {form.newPassword.length > 0 && (
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <
                          Math.min(Math.floor(form.newPassword.length / 3), 4)
                            ? form.newPassword.length < 6
                              ? "bg-red-400"
                              : form.newPassword.length < 10
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                            : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "loading" ? "Updating…" : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
