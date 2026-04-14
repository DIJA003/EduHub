import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function ForgotPassword() {
  const [email,  setEmail]  = useState('');
  const [status, setStatus] = useState('idle');
  const [errMsg, setErrMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrMsg('');

    try {
      try {
        const checkRes = await fetch('http://localhost:8000/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        if (checkRes.ok === false) {
          const checkData = await checkRes.json();
          if (checkRes.status === 404) {
            setStatus('error');
            setErrMsg(checkData.message || 'Email not found in our system.');
            return;
          }
        }
      } catch (backendErr) {
        console.error('Backend email check failed:', backendErr.message);
      }
      await sendPasswordResetEmail(auth, email.trim());
      setStatus('success');

    } catch (err) {
      setStatus('error');
      const firebaseErrors = {
        'auth/user-not-found':  'No account found with this email.',
        'auth/invalid-email':   'Please enter a valid email address.',
      };
      setErrMsg(firebaseErrors[err.code] || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="mb-6">
          <Link
            to="/login"
            className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300"
          >
            ← Back to Login
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-10 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">

          {status === 'success' ? (
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Check your inbox
              </h1>
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                If <span className="font-semibold text-slate-700 dark:text-slate-200">{email}</span> is
                registered, a password reset link has been sent. The link expires in 1 hour.
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Didn't get it? Check your spam folder.
              </p>
              <Link
                to="/login"
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700"
              >
                Back to Login
              </Link>
              <button
                onClick={() => { setStatus('idle'); setErrMsg(''); }}
                className="mt-3 w-full rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-transparent dark:text-slate-200"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Forgot password?
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Enter your registered email and we'll send you a reset link.
              </p>

              {errMsg && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {errMsg}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="sr-only" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your college email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrMsg(''); }}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40 dark:text-white"
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Remember your password?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:underline">
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}