import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { authApi } from "../../../lib/api/auth.api";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { EduHubLogo } from "../../../components/ui/Logo";
import { ThemeToggleFixedCorner } from "../../../components/common/ThemeToggle";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { forceRefresh } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

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
    setLoading(true);
    try {
      // Let Firebase handle the auth state change through the listener
      await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      
      // Wait a moment for the auth listener to update the state
      await new Promise((r) => setTimeout(r, 500));
      
      // Force refresh to ensure state is synchronized
      await forceRefresh();
      
      // Navigate after state is updated
      const user = auth.currentUser;
      if (user) {
        const { data: dbUser } = await authApi.getMe();
        if (dbUser?.role === "admin")
          return navigate("/admin", { replace: true });
        if (dbUser?.role === "mentor")
          return navigate("/mentor", { replace: true });
      }
      
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <ThemeToggleFixedCorner />
      {/* Aurora blobs */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-bg__blob-1" />
        <div className="aurora-bg__blob-2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5">
            <EduHubLogo className="w-14 h-14 rounded-[var(--radius-xl)] shadow-[var(--shadow-accent)]" />
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text)] tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-3)]">
            Sign in to your EduHub account
          </p>
        </div>

        <div className="glass-strong rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-xl)]">
          {error && (
            <div className="mb-5 rounded-[var(--radius-lg)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)] border-opacity-30 px-4 py-3 text-sm text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@university.edu"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPwd ? "text" : "password"}
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="text-[var(--color-text-3)] hover:text-[var(--color-text)] transition-colors"
                  tabIndex={-1}
                >
                  {showPwd ? (
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
                className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-2)] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              className="w-full"
              size="lg"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-3)]">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-2)] transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
