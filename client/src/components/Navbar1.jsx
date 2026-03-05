import { Link, NavLink, useLocation } from 'react-router-dom'
import { Icon } from './Icon1.jsx'

export function Navbar() {
  const location = useLocation()
  const onHome = location.pathname === '/'

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-lg bg-blue-600 p-2 text-white">
            <Icon name="school" className="block" />
          </div>
          <span className="text-2xl font-black tracking-tight text-blue-600">
            EduHub
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {onHome ? (
            <>
              <a
                className="text-sm font-semibold transition-colors hover:text-blue-500"
                href="#features"
              >
                Features
              </a>
              <a
                className="text-sm font-semibold transition-colors hover:text-blue-500"
                href="#how-it-works"
              >
                How it works
              </a>
              <a
                className="text-sm font-semibold transition-colors hover:text-blue-500"
                href="#colleges"
              >
                Colleges
              </a>
              <a
                className="text-sm font-semibold transition-colors hover:text-blue-500"
                href="#testimonials"
              >
                Testimonials
              </a>
            </>
          ) : (
            <NavLink
              to="/"
              className="text-sm font-semibold transition-colors hover:text-primary"
            >
              Home
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-200"
          >
            Login
          </Link>
          <button className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-600/90">
            Explore Colleges
          </button>
        </div>
      </nav>
    </header>
  )
}

