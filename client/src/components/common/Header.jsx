import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { EduHubLogo } from "../ui/Logo";

export default function Header() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!isAuthenticated) return "/login";
    const role = user?.role;
    switch (role) {
      case "admin":
        return "/admin";
      case "mentor":
        return "/mentor";
      case "student":
        return "/student";
      default:
        return "/academic-year";
    }
  };

  const getCoursesPath = () => {
    if (!isAuthenticated) return "/login";
    const role = user?.role;
    switch (role) {
      case "admin":
        return "/admin/courses";
      case "mentor":
        return "/mentor/courses";
      case "student":
        return "/student/courses";
      default:
        return "/academic-year";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-surface-1)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface-1)]/60 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <EduHubLogo className="w-9 h-9 rounded-lg shadow-sm group-hover:shadow-md transition-shadow" />
          <span className="font-bold text-[var(--text-lg)] text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
            EduHub
          </span>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isAuthenticated && (
            <>
              <button
                onClick={() => handleNavigation(getDashboardPath())}
                className="px-4 py-2 text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-all duration-200 font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => handleNavigation(getCoursesPath())}
                className="px-4 py-2 text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-all duration-200 font-medium"
              >
                Courses
              </button>
            </>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] animate-pulse" />
              <div className="hidden sm:block w-16 h-4 bg-[var(--color-surface-2)] rounded animate-pulse" />
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                  {(user?.name || user?.email || "U")[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-[var(--text-sm)] text-[var(--color-text)] font-medium">
                  {user?.name || user?.email || "User"}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-[var(--color-text-2)] hover:text-[var(--color-text)]"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-[var(--color-surface-2)] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 text-[var(--color-text)]" />
            ) : (
              <Menu className="w-5 h-5 text-[var(--color-text)]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface-1)] shadow-lg">
          <div className="container mx-auto px-4 py-4 space-y-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigation(getDashboardPath())}
                  className="block w-full text-left px-4 py-3 text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-all duration-200 font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNavigation(getCoursesPath())}
                  className="block w-full text-left px-4 py-3 text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-all duration-200 font-medium"
                >
                  Courses
                </button>
                <hr className="border-[var(--color-border)] my-2" />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] text-white text-xs font-bold flex items-center justify-center">
                      {(user?.name || user?.email || "U")[0].toUpperCase()}
                    </div>
                    <span className="text-[var(--text-sm)] text-[var(--color-text)] font-medium">
                      {user?.name || user?.email || "User"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="block w-full text-left text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] py-2"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="block w-full text-left text-[var(--text-sm)] text-[var(--color-text-2)] hover:text-[var(--color-text)] py-2"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
