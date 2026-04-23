import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-6xl font-black text-slate-900">404</h1>
      <p className="text-slate-500">Page not found.</p>
      <Link
        to="/"
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}