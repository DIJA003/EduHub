import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

function Header({ onAction }) {
  const navigate = useNavigate();
  const { dbUser } = useAuth();

  const initials = dbUser?.name
    ? dbUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header className="border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/home")}
        >
          <img
            src={logo}
            alt="EduHub logo"
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            EduHub
          </span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <button
            className="font-medium text-slate-900 hover:text-blue-600 dark:text-white"
            onClick={() => navigate("/academic-year")}
          >
            Academic Years
          </button>
          <button
            className="hover:text-blue-600 dark:text-slate-300"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className="hover:text-blue-600 dark:text-slate-300"
            onClick={() => navigate("/std-dashboard")}
          >
            Dashboard
          </button>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white cursor-pointer"
            onClick={() => navigate("/std-dashboard")}
            title={dbUser?.name}
          >
            {initials}
          </div>
        </nav>
      </div>
    </header>
  );
}
export default Header;
