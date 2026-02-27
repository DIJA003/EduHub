import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";
import "../assets/ForgotPassword.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });

    const handleReset = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Sending reset link..." });

        try {
            await sendPasswordResetEmail(auth, email);
            setStatus({
                type: "success",
                message: "Check your inbox! A reset link has been sent."
            });
        } catch (error) {
            let errorMsg = "An error occurred. Please try again.";
            if (error.code === "auth/user-not-found") {
                errorMsg = "This email is not registered.";
            } else {
                errorMsg = "Error: " + error.message;
            }
            setStatus({ type: "error", message: errorMsg });
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