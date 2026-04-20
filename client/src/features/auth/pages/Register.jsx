import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../lib/firebase";
import apiClient from "../../../lib/api/client";

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "This email is already registered.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password is too weak.",
};

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    college: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) return setError("Please enter your name.");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match.");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      return setError(
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
      );
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      await sendEmailVerification(cred.user, {
        url: `${window.location.origin}/email-confirmed`,
      });

      try {
        const token = await cred.user.getIdToken();
        await apiClient.post(
          "/auth/register",
          {
            name: form.name.trim(),
            role,
            college: form.college.trim(),
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
      } catch (backendErr) {
        console.error("Backend registration error:", backendErr.message);
      }

      navigate("/verify-email");
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
          <h1 className="text-3xl font-black text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Join EduHub — it's free</p>

          {/* Role selector */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              {
                value: "student",
                label: "Student",
                emoji: "🎓",
                desc: "Learn & grow",
              },
              {
                value: "mentor",
                label: "Mentor",
                emoji: "👨‍🏫",
                desc: "Teach & guide",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col items-center rounded-xl border-2 p-4 transition-all ${
                  role === opt.value
                    ? "border-blue-600 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span
                  className={`text-sm font-bold ${role === opt.value ? "text-blue-600" : "text-slate-800"}`}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-slate-500">{opt.desc}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {[
              {
                name: "name",
                label: "Full name",
                type: "text",
                placeholder: "Full name",
                autocomplete: "name",
              },
              {
                name: "email",
                label: "Email",
                type: "email",
                placeholder: "Email address",
                autocomplete: "email",
              },
              {
                name: "college",
                label: "College",
                type: "text",
                placeholder: "College / Faculty (optional)",
                autocomplete: "organization",
              },
              {
                name: "password",
                label: "Password",
                type: "password",
                placeholder: "Password (min 8 chars)",
                autocomplete: "new-password",
              },
              {
                name: "confirmPassword",
                label: "Confirm password",
                type: "password",
                placeholder: "Confirm password",
                autocomplete: "new-password",
              },
            ].map((field) => (
              <div key={field.name}>
                <label className="sr-only" htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  autoComplete={field.autocomplete}
                  value={form[field.name]}
                  onChange={handleChange}
                  required={field.name !== "college"}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Creating account…"
                : `Create ${role === "mentor" ? "Mentor" : "Student"} Account`}
            </button>

            <p className="text-center text-xs text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
