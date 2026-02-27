import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgetpassword" element={<ForgotPassword />}/>
      </Routes>
    </Router>
  );
}

export default AppRoutes;