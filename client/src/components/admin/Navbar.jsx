import { useState } from "react";

function Navbar() {
  const [dark, setDark] = useState(true);

  const toggleTheme = () => {
    document.body.classList.toggle("light");
    setDark(!dark);
  };

  return (
    <header className="admin-navbar">
      <div className="navbar-search-wrap">
        <span className="search-icon">🔍</span>
        <input className="search-input" placeholder="Search anything..." />
      </div>

      <div className="navbar-actions">
        <button className="btn-icon" onClick={toggleTheme} title="Toggle theme">
          {dark ? "☀️" : "🌙"}
        </button>
        <button className="btn-icon" title="Notifications">🔔</button>
        <div className="navbar-avatar" title="Admin">A</div>
      </div>
    </header>
  );
}

export default Navbar;