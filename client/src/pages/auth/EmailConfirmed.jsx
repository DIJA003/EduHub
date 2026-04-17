import { Link } from "react-router-dom";

export default function EmailConfirmed() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700 text-center">
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
          Email Verified!
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your email has been confirmed successfully. You can now access all
          features.
        </p>
        <Link
          to="/home"
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
