import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { EduHubLogo } from "../../../components/ui/Logo";

export function ForgotPassword() {
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
    <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-bg__blob-1" />
        <div className="aurora-bg__blob-2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Link
            to="/login"
            className="text-[var(--text-sm)] font-semibold text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="glass-strong rounded-[var(--radius-2xl)] p-8 shadow-[var(--shadow-xl)]">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success-soft)]">
                <EduHubLogo className="w-10 h-10 rounded-lg" />
              </div>
              <h1 className="text-xl font-bold text-[var(--color-text)]">
                Check your inbox
              </h1>
              <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-3)]">
                A password reset link was sent to{" "}
                <strong className="text-[var(--color-text)]">{email}</strong>
              </p>
              <Link
                to="/login"
                className="mt-6 inline-block text-[var(--text-sm)] font-semibold text-[var(--color-accent)] hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-[var(--color-text)]">
                Reset password
              </h1>
              <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-3)]">
                Enter your email to receive a reset link.
              </p>

              {error && (
                <div className="mt-4 rounded-[var(--radius-lg)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)] border-opacity-30 px-4 py-3 text-[var(--text-sm)] text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@university.edu"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  required
                />
                <Button
                  type="submit"
                  variant="gradient"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  Send reset link
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
