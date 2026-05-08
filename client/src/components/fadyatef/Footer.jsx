export default function Footer({ onAction }) {
  return (
    <footer className="border-t border-slate-100 py-8 mt-12">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} EduHub. All rights reserved.
      </div>
    </footer>
  );
}