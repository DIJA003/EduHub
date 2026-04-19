require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");

// Routers
const authRouter = require("./modules/auth/auth.router");
const userRouter = require("./modules/users/user.router");
const courseRouter = require("./modules/courses/course.router");
const enrollmentRouter = require("./modules/enrollments/enrollment.router");
const materialRouter = require("./modules/materials/material.router");
const uploadRouter = require("./modules/uploads/upload.router");
const notificationRouter = require("./modules/notifications/notification.router");
const logRouter = require("./modules/logs/log.router");

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable for API-only server
  }),
);

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use(
  "/api/auth/register",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many registration attempts" },
  }),
);

app.use("/api/auth/me", rateLimit({ windowMs: 60 * 1000, max: 60 }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    message: { message: "Rate limit exceeded" },
  }),
);

// ── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/enrollments", enrollmentRouter);
app.use("/api/materials", materialRouter);
app.use("/api/uploads", uploadRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/logs", logRouter);

// ── Error Handling ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
