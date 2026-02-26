import React, { useState } from 'react';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebase";

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
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Reset Password</h2>
            <p>Please enter your email to receive a password reset link.</p>
            <form onSubmit={handleReset}>
                <div style={{ marginBottom: "15px" }}>
                    <input 
                        type="email" 
                        placeholder="Enter your college email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        style={{ width: "100%", padding: "8px" }}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={status.type === "loading"}
                    style={{ width: "100%", padding: "10px", cursor: "pointer" }}
                >
                    {status.type === "loading"? "Processing..." : "Send Reset Link"}
                </button>
            </form>
            {status.message && (
                <p style={{ 
                    marginTop: "15px", 
                    color: status.type === "error"? "red" : "green" 
                }}>
                    {status.message}
                </p>
            )}
        </div>
    );
};

export default ForgotPassword;