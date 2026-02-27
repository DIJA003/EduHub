import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import "../assets/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleReset = async (e) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Checking email..." });

    try {
      const checkRes = await fetch("http://localhost:8000/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setStatus({ type: "error", message: checkData.message });
        return;
      }
      await sendPasswordResetEmail(auth, email);

      setStatus({
        type: "success",
        message: "Reset link sent! Check your inbox (and spam folder).",
      });
      setEmail("");
    } catch (error) {
      console.error("Reset error:", error);
      setStatus({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
        <div className="forgot-container">
            <h2>Reset Password</h2>
            <p>Please enter your email to receive a password reset link.</p>

            <form onSubmit={handleReset}>
                <div className="input-group">
                    <input
                        type="email"
                        placeholder="Enter your college email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="email-input"
                    />
                </div>

                <button
                    type="submit"
                    disabled={status.type === "loading"}
                    className="reset-button"
                >
                    {status.type === "loading"
                        ? "Processing..."
                        : "Send Reset Link"}
                </button>
            </form>

            {status.message && (
                <p className={`status-message ${status.type}`}>
                    {status.message}
                </p>
            )}
        </div>
    );
};

export default ForgotPassword;
