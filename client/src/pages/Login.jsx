import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import "../assets/Login.css";

function Login() {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
      setError("");
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setLoading(true);
  
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
  
        const token = await userCredential.user.getIdToken();
  
        const response = await fetch("http://localhost:8000/api/users/login", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
  
        if (!response.ok) {
          throw new Error(data.message || "Login failed on server.");
        }
        navigate("/home");
      } catch (err) {
        console.error("Login error:", err.message);
  
        const firebaseErrors = {
          "auth/invalid-credential": "Invalid email or password.",
          "auth/user-not-found": "No account found with this email.",
          "auth/wrong-password": "Incorrect password.",
          "auth/invalid-email": "Please enter a valid email.",
          "auth/too-many-requests": "Too many attempts. Try again later.",
        };
        setError(firebaseErrors[err.code] || err.message);
      } finally {
        setLoading(false);
      }
    };

return (
    <div className="container">
      <div className="left"></div>

      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h2>Welcome Back!</h2>
          <h3>Login to your account</h3>

          <div className="input-box">
            <input
              name="email"
              type="text"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="input-box">
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="remember-forgot">
            <label>
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            <a href="/forgotpassword">Forget password?</a>
          </div>

          <button type="submit" className="btn">
            Login
          </button>

          <div className="register-link">
            <p>
              Don't have an account? <a href="/register">Register</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );

}

export default Login;