import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendEmailVerification, reload, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [user, setUser]           = useState(null);
  const [status, setStatus]       = useState('idle');
  const [cooldown, setCooldown]   = useState(0);
  const [checkPulse, setCheckPulse] = useState(false);
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.emailVerified) {
      navigate('/home');
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      try {
        await reload(auth.currentUser);
        if (auth.currentUser?.emailVerified) {
          clearInterval(id);
          navigate('/home');
        }
      } catch {}
    }, 4000);
    return () => clearInterval(id);
  }, [user, navigate]);

  const handleResend = async () => {
    if (cooldown > 0 || !user) return;
    setStatus('sending');
    try {
      await sendEmailVerification(user);
      setStatus('sent');
      setCooldown(60);
    } catch (err) {
      setStatus('error');
    }
  };

  const handleCheckNow = async () => {
    if (!user) return;
    setCheckPulse(true);
    try {
      await reload(auth.currentUser);
      if (auth.currentUser?.emailVerified) {
        navigate('/home');
      } else {
        setCheckPulse(false);
      }
    } catch {
      setCheckPulse(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-6">
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300"
          >
            ← Back to Login
          </button>
        </div>

        <div className="rounded-2xl bg-white p-10 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">

          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10">
            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            We sent a verification link to{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {user?.email}
            </span>
          </p>

          <ol className="mt-8 space-y-3">
            {[
              'Check your inbox (and spam folder)',
              'Click the verification link in the email',
              'This page will update automatically',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-[11px] font-bold text-blue-600">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {status === 'sent' && (
            <div className="mt-6 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
              ✓ Verification email sent! Check your inbox.
            </div>
          )}
          {status === 'error' && (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
              Failed to send email. Please wait a moment and try again.
            </div>
          )}

          <div className="mt-8 space-y-3">
            <button
              onClick={handleCheckNow}
              className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={checkPulse}
            >
              {checkPulse ? 'Checking…' : "I've verified my email"}
            </button>

            <button
              onClick={handleResend}
              disabled={cooldown > 0 || status === 'sending'}
              className="w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              {status === 'sending'
                ? 'Sending…'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend verification email'}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Wrong email?{' '}
            <button
              onClick={handleLogout}
              className="font-semibold text-blue-600 hover:underline"
            >
              Sign out and use a different account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}