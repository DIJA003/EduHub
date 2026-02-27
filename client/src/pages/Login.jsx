import React, { useState } from "react";
import "../assets/Login.css";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
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