import { Link } from 'react-router-dom'
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import loginImage from '../assets/images/login.jpg'  

export function Login() {
  const navigate = useNavigate();
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      remember: false,
    });
    const [error, setError] = useState("");
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
      setError("");
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
  
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
        console.log(error);
      }
    };
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <img
            alt="Campus life"
            className="h-full w-full object-cover"
            src={loginImage}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/35 via-slate-900/10 to-transparent" />
        </div>

        <div className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between">
              <Link
                to="/"
                className="text-sm font-semibold text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              >
                ← Back to Home
              </Link>
            </div>

            <div className="rounded-2xl bg-white p-10 shadow-xl shadow-slate-900/10 ring-1 ring-slate-200 dark:bg-slate-900/40 dark:ring-slate-700">
              <h1 className="text-3xl font-black tracking-tight">
                Welcome Back!
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                login to your account
              </p>

              <form className="mt-8 space-y-4">
                <div>
                  <label className="sr-only" htmlFor="username">
                    username
                  </label>
                  <input
                    id="username"
                    name="username"
                    placeholder="username"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="sr-only" htmlFor="password">
                    password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="password"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-primary/20 focus:ring-4 dark:border-slate-700 dark:bg-slate-950/40"
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-700"
                    />
                    Remember me
                  </label>

                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    forget password?
                  </button>
                </div>

                <button
                  type="button"
                  className="mt-4 w-full rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-colors hover:bg-blue-600/90"
                >
                  login
                </button>

                <p className="pt-2 text-center text-xs text-slate-600 dark:text-slate-300">
                  dont have account?{' '}
                  <a className="font-semibold text-blue-600 hover:underline" href="#">
                    register
                  </a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login;
