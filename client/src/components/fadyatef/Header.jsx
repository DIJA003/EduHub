import React from "react";
import logo from "../../assets/images/logo.png";
import profileImage from "../../assets/images/profile.jpg";

function Header({ onAction }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="EduHub logo"
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg font-semibold text-slate-900">EduHub</span>
        </div>
        <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
          <button className="font-medium text-slate-900 hover:text-edublue">
            Academic Years
          </button>
          <button
            className="hover:text-edublue"
            onClick={() => onAction("Courses")}
          >
            Courses
          </button>
          <button
            className="hover:text-edublue"
            onClick={() => onAction("Home")}
          >
            Home
          </button>
          <button
            className="hover:text-edublue"
            onClick={() => onAction("Profile")}
          >
            Profile
          </button>
          <div className="flex items-center gap-3">
            <img
              src={profileImage}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover"
            />
          </div>
        </nav>
      </div>
    </header>
  );
}
export default Header;
