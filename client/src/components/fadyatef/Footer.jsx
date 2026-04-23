import React from "react";
import logo from "../../assets/images/logo.png";
//import { useNavigate } from "react-router-dom";

export default function Footer({ onAction }) {
  //const navigate = useNavigate();

  // const platformLinks = {
  //   Dashboard: () => navigate("/std-dashboard"),
  //   "All Courses": () => navigate("/academic-year"),
  //   Mentorship: () => navigate("/home"),
  //   Resources: () => navigate("/home"),
  // };
  return (
    <footer className="mt-10 border-t border-slate-200 pt-10 text-xs text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:justify-between">
        <div className="max-w-sm space-y-3">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="EduHub logo"
              className="h-8 w-8 object-contain"
            />
            <span className="text-sm font-semibold text-slate-900">EduHub</span>
          </div>
          <p className="text-[11px] md:text-xs">
            Empowering students with world-class education tools and resources
            to build their future.
          </p>
        </div>

        <div className="grid flex-1 gap-8 text-[11px] sm:grid-cols-2 md:grid-cols-3 md:text-xs">
          <div className="space-y-2">
            {/* <h4 className="font-semibold text-slate-900">Platform</h4> */}
            <ul className="space-y-1">
              {/* {["Dashboard", "All Courses", "Mentorship", "Resources"].map(
                (item) => (
                  <li key={item}>
                    <button
                      className="transition hover:text-edublue hover:underline"
                      onClick={() => platformLinks[item]?.() || onAction(item)}
                    >
                      {item}
                    </button>
                  </li>
                ),
              )} */}
            </ul>
          </div>
          <div className="space-y-2">
            {/* <h4 className="font-semibold text-slate-900">Company</h4> */}
            <ul className="space-y-1">
              {/* {["About Us", "Careers", "Press", "Contact"].map((item) => (
                <li key={item}>
                  <button
                    className="transition hover:text-edublue hover:underline"
                    onClick={() => platformLinks[item]?.() || onAction(item)}
                  >
                    {item}
                  </button>
                </li>
              ))} */}
            </ul>
          </div>
          <div className="space-y-2">
            {/* <h4 className="font-semibold text-slate-900">Social</h4> */}
            <ul className="space-y-1">
              {/* {["Twitter", "LinkedIn", "Instagram", "Community"].map((item) => (
                <li key={item}>
                  <button
                    className="transition hover:text-edublue hover:underline"
                    onClick={() => platformLinks[item]?.() || onAction(item)}
                  >
                    {item}
                  </button>
                </li>
              ))} */}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-slate-200 pt-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4">
          <span>© 2026 EduHub Inc. All rights reserved.</span>
          <div className="flex gap-6"></div>
        </div>
      </div>
    </footer>
  );
}