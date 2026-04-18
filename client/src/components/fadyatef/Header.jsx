import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";
import logo from "../../assets/images/logo.png";

function Header() {
  const navigate = useNavigate();
  const { years } = useCourses();

  const handleCoursesClick = () => {
    const inProgressYearId = Object.keys(years).find(
      (id) => years[id].meta?.status === "In Progress",
    );
    if (inProgressYearId) {
      navigate(`/academic-year/${inProgressYearId}`);
    } else {
      navigate("/academic-year");
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700">
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
          <button
            className="font-medium text-slate-900 hover:text-edublue"
            onClick={() => navigate("/academic-year")}
          >
            Academic Years
          </button>
          <button className="hover:text-edublue" onClick={handleCoursesClick}>
            Academic Years
          </button>
          <button
            className="hover:text-edublue"
            onClick={() => navigate("/home")}
          >
            Home
          </button>
          <button
            className="hover:text-edublue"
            onClick={() => navigate("/profile")}
          >
            Dashboard
          </button>
          {/* <div className="flex items-center gap-3">
            <img
              src={profileImage}
              alt="Profile"
              className="h-9 w-9 rounded-full object-cover cursor-pointer"
              onClick={() => navigate("/profile")}
            />
          </div> */}
        </nav>
      </div>
    </header>
  );
}

export default Header;
