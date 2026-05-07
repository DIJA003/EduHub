import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { authApi } from "../../../lib/api/auth.api";
import useAuthStore from "../../../stores/auth.store";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import BrandMark from "../../../components/layout/BrandMark";
import ThemeToggle from "../../../components/layout/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setFirebaseUser, setDbUser } = useAuthStore();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    setLocalLoading(true);
    setError("");

    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      setFirebaseUser(cred.user);

      // Wait briefly for token propagation
      await new Promise((r) => setTimeout(r, 300));

      const { data: dbUser } = await authApi.getMe();
      setDbUser(dbUser);

      // Role-based redirect
      if (dbUser?.role === "admin")
        return navigate("/admin", { replace: true });
      if (dbUser?.role === "mentor")
        return navigate("/mentor", { replace: true });
      navigate(from === "/" ? "/home" : from, { replace: true });
    } catch (err) {
      const messages = {
        "auth/invalid-credential": "Invalid email or password.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-email": "Please enter a valid email.",
        "auth/too-many-requests": "Too many attempts. Try again later.",
      };
      setError(messages[err.code] || err.message || "Login failed.");
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-ink)] px-4 py-12 font-sans">
      <div className="absolute right-4 top-4 z-10 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(91,140,255,0.35),transparent),radial-gradient(ellipse_at_bottom_right,rgba(91,140,255,0.08),transparent)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mb-5 flex justify-center">
            <BrandMark size="lg" animated />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Welcome back
          </h1>
          <p className="mt-1.5 text-[var(--text-sm)] text-[var(--color-text-3)]">
            Sign in to your EduHub workspace
          </p>
        </div>

        <div className="glass rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-xl)] sm:p-8">
          {error && (
            <div
              className="mb-4 rounded-[var(--radius-lg)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-soft)] px-4 py-3 text-[var(--text-sm)] text-[var(--color-danger)]"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              autoCapitalize="off"
              spellCheck={false}
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-[var(--color-text-3)] transition-colors hover:text-[var(--color-text)]"
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              }
            />

            <div className="flex items-center justify-end">
              <Link
                to="/forgotpassword"
                className="text-[var(--text-xs)] font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-2)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full shadow-[var(--shadow-glow)]"
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-[var(--text-sm)] text-[var(--color-text-3)]">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-2)] hover:underline"
            >
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
