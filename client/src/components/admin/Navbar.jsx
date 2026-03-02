import { useState } from "react";

function Navbar(){
    const [dark, setDark] = useState(false);
    const toggleTheme = () => {
        document.body.classList.toggle("dark");
        setDark(!dark);
    };
    return(
        <header className="admin-navbar">
            <input className="search-input" placeholder="Search..."/>
            <div className="navbar-actions">
                <button onClick={toggleTheme}>
                    {dark ? "Light Mode" : "Dark Mode"};
                </button>
            </div>
        </header>
    );
}
export default Navbar;
