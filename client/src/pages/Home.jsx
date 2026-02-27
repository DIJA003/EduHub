import React, { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../assets/Home.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      setUser(firebaseUser);

      try {
        const token = await firebaseUser.getIdToken();
        const res = await fetch("http://localhost:8000/api/users/login", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (err) {
        console.error("Failed to fetch user data:", err);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="home-container">
        <div className="home-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <nav className="home-nav">
        <span className="home-logo">📚 EduHub</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="home-main">
        <div className="welcome-card">
          <div className="welcome-icon">🎉</div>
          <h1>You're in!</h1>
          <p className="welcome-sub">Authentication is working correctly.</p>

          <div className="user-info">
            <div className="info-row">
              <span className="info-label">Email</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Firebase UID</span>
              <span className="info-value uid">{user.uid}</span>
            </div>
            {dbUser && (
              <>
                <div className="info-row">
                  <span className="info-label">MongoDB ID</span>
                  <span className="info-value uid">{dbUser._id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className="info-badge">{dbUser.role}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member since</span>
                  <span className="info-value">
                    {new Date(dbUser.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="status-badges">
            <span className="badge firebase">✅ Firebase Auth</span>
            <span className="badge mongo">✅ MongoDB</span>
            <span className="badge connected">✅ Backend Connected</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
