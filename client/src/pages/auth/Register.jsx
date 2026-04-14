import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, form.email, form.password,
      );
      await sendEmailVerification(userCredential.user);

      try {
        const token = await userCredential.user.getIdToken();
        const response = await fetch('http://localhost:8000/api/users/register', {
          method:  'POST',
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: form.name.trim() }),
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('Backend registration failed:', data.message);
        }
      } catch (backendErr) {
        console.error('Backend registration error:', backendErr.message);
      }

      navigate('/verify-email');

    } catch (err) {
      const firebaseErrors = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email':        'Please enter a valid email address.',
        'auth/weak-password':        'Password is too weak.',
      };
      setError(firebaseErrors[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-500" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-12">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm">
              <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-center">Start your journey today</h2>
            <p className="mt-4 text-center text-blue-100 max-w-xs">
              Join thousands of students and mentors on EduHub — the platform built for academic success.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <Link to="/login" className="text-sm font-semibold text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-300">
                ← Back to Login
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-10 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
              <h1 className="text-3xl font-black tracking-tight">Create account</h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Register to get started with EduHub
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="sr-only" htmlFor="name">Full Name</label>
                  <input
                    id="name" name="name" type="text"
                    placeholder="Full name"
                    value={form.name} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="email">Email</label>
                  <input
                    id="email" name="email" type="email"
                    placeholder="College email address"
                    value={form.email} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="password">Password</label>
                  <input
                    id="password" name="password" type="password"
                    placeholder="Password (min. 6 characters)"
                    value={form.password} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="sr-only" htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    id="confirmPassword" name="confirmPassword" type="password"
                    placeholder="Confirm password"
                    value={form.confirmPassword} onChange={handleChange} required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-blue-600/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit" disabled={loading}
                  className="mt-4 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>

                <p className="pt-2 text-center text-xs text-slate-600 dark:text-slate-300">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">
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