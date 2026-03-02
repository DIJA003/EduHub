import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/admin/Sidebar";
import Navbar from "../../components/admin/Navbar";
import Colleges from "./Colleges";
import Students from "./Students";
import Mentors from "./Mentors";
import Analytics from "./Analytics";
import DashboardHome from "./DashboardHome";
import "../../assets/admin.css";

function AdminDashboard(){
    return (
        <div className="admin-container">
            <Sidebar/>
            <div className="admin-main">
                <Navbar/>
                <div className="admin-content">
                    <Routes>
                        <Route path="/" element={<DashboardHome />} />
                        <Route path="colleges" element={<Colleges />} />
                        <Route path="students" element={<Students />} />
                        <Route path="mentors" element={<Mentors />} />
                        <Route path="analytics" element={<Analytics />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;