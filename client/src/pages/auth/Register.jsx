import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../services/firebase";

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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPassword.test(form.password)) {
      setError(
        "Password must be at least 8 characters with uppercase, lowercase, and a number.",
      );
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );

      const continueUrl = `${window.location.origin}/email-confirmed`;
      await sendEmailVerification(userCredential.user, { url: continueUrl });

      try {
        const token = await userCredential.user.getIdToken();
        const API_URL =
          process.env.REACT_APP_API_URL || "http://localhost:8000/api";
        const response = await fetch(`${API_URL}/users/register`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            role,
            college: form.college.trim(),
          }),
        });
        const data = await response.json();
        if (!response.ok)
          console.error("Backend registration failed:", data.message);
      } catch (backendErr) {
        console.error("Backend registration error:", backendErr.message);
      }

      navigate("/verify-email");
    } catch (err) {
      const firebaseErrors = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/weak-password": "Password is too weak.",
      };
      setError(firebaseErrors[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
        {/* Left panel */}
        <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative z-10 px-12 text-center text-white">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <svg
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-black">Join EduHub today</h2>
            <p className="mt-4 text-blue-100 max-w-xs mx-auto">
              Whether you're here to learn or to teach, EduHub is built for your
              journey.
            </p>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <Link
                to="/home"
                className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Create account
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Join EduHub — it's free
              </p>

              {/* Role selector */}
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
                  I am joining as a…
                </p>
                <div className="grid grid-cols-2 gap-3">
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
                      className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all duration-150 ${
                        role === opt.value
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/20"
                      }`}
                    >
                      <span className="text-2xl mb-1">{opt.emoji}</span>
                      <span
                        className={`text-sm font-bold ${role === opt.value ? "text-blue-600" : "text-slate-800 dark:text-slate-200"}`}
                      >
                        {opt.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {opt.desc}
                      </span>
                      {role === opt.value && (
                        <span className="mt-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-600">
                          <svg
                            className="h-2.5 w-2.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="sr-only" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="college">
                    College / Faculty
                  </label>
                  <input
                    id="college"
                    name="college"
                    type="text"
                    placeholder="College / Faculty (e.g. Faculty of Science)"
                    value={form.college}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Password (min 8 characters)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="new-password"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Creating account…"
                    : `Create ${role === "mentor" ? "Mentor" : "Student"} Account`}
                </button>

                <p className="pt-2 text-center text-xs text-slate-600 dark:text-slate-300">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Login
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
