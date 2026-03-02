import { Link } from "react-router-dom";

function Sidebar(){
    return (
        <aside className="admin-sidebar">
            <h2>EduHub Admin</h2>
            <nav>
                <Link to="/admin">Dashboard</Link>
                <Link to="/admin/colleges">Colleges</Link>
                <Link to="/admin/students">Students</Link>
                <Link to="/admin/mentors">Mentors</Link>
                <Link to="/admin/analytics">Analytics</Link>
            </nav>
        </aside>
    )
}
export default Sidebar;