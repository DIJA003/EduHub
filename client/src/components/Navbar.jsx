import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "./Icon.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase.js";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const onHome = location.pathname === "/home" || location.pathname === "/";
  const role = dbUser?.role; // 'student' | 'mentor' | 'admin'

  const initials = dbUser?.name
    ? dbUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const renderRightSection = () => {
    if (!dbUser) {
      return (
        <>
          <Link
            to="/login"
            className="px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:text-blue-600 dark:text-slate-200"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-600/90"
          >
            Get Started
          </Link>
        </>
      );
    }
    if (role === "admin") {
      return (
        <>
          <button
            onClick={() => navigate("/admin")}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-600/90"
          >
            Admin Dashboard
          </button>
          <AvatarMenu
            initials={initials}
            name={dbUser.name}
            onLogout={handleLogout}
          />
        </>
      );
    }
    if (role === "mentor") {
      return (
        <>
          <button
            onClick={() => navigate("/mentor")}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-600/90"
          >
            Mentor Dashboard
          </button>
          <AvatarMenu
            initials={initials}
            name={dbUser.name}
            onLogout={handleLogout}
            role={role}
          />
        </>
      );
    }
    // Student
    return (
      <>
        <button
          onClick={() => navigate("/academic-year")}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-600/90"
        >
          My Courses
        </button>
        <AvatarMenu
          initials={initials}
          name={dbUser.name}
          onLogout={handleLogout}
        />
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/home" className="flex items-center gap-2">
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
              to="/home"
              className="text-sm font-semibold transition-colors hover:text-blue-600"
            >
              Home
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">{renderRightSection()}</div>
      </nav>
    </header>
  );
}

function AvatarMenu({ initials, name, onLogout, role }) {
  return (
    <div className="relative group">
      <div
        className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all select-none"
        title={name}
      >
        {initials}
      </div>
      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
            {name}
          </p>
        </div>
        <Link
          to="/change-password"
          className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          🔒 Change Password
        </Link>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-colors"
        >
          <Icon name="logout" className="text-sm" /> Log out
        </button>
      </div>
    </div>
  );
}
