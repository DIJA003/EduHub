import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendEmailVerification, reload, signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import Button from "../../../components/ui/Button";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");
  const [cooldown, setCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return navigate("/login");
    if (currentUser.emailVerified) return navigate("/home");
    setUser(currentUser);
  }, [navigate]);

  // Cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  // Auto-poll for verification
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      try {
        await reload(auth.currentUser);
        if (auth.currentUser?.emailVerified) {
          clearInterval(id);
          navigate("/home");
        }
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [user, navigate]);

  const handleResend = async () => {
    if (cooldown > 0 || !user) return;
    setStatus("sending");
    try {
      await sendEmailVerification(user);
      setStatus("sent");
      setCooldown(60);
    } catch {
      setStatus("error");
    }
  };

  const handleCheck = async () => {
    if (!user) return;
    setChecking(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser?.emailVerified) {
        navigate("/home");
      } else {
        setChecking(false);
      }
    } catch {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h1 className="text-xl font-black text-center text-slate-900">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-center text-slate-500">
            We sent a verification link to{" "}
            <strong className="text-slate-700">{user?.email}</strong>
          </p>

          <ol className="mt-6 space-y-2">
            {[
              "Check your inbox (and spam folder)",
              "Click the verification link",
              "This page will update automatically",
            ].map((step, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm text-slate-600"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {status === "sent" && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              ✓ Verification email sent! Check your inbox.
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              Failed to send email. Please wait and try again.
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Button
              className="w-full"
              onClick={handleCheck}
              loading={checking}
              size="lg"
            >
              I've verified my email
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={handleResend}
              disabled={cooldown > 0 || status === "sending"}
              size="lg"
            >
              {status === "sending"
                ? "Sending…"
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : "Resend verification email"}
            </Button>

            <button
              onClick={async () => {
                await signOut(auth);
                navigate("/login");
              }}
              className="w-full text-xs text-center text-slate-400 hover:text-slate-600 py-2"
            >
              Wrong email? Sign out and use a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
