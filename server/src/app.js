require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const {
  errorHandler,
  notFoundHandler,
} = require("./middleware/error.middleware");

const authRouter = require("./modules/auth/auth.router");
const usersRouter = require("./modules/users/users.router");
const coursesRouter = require("./modules/courses/courses.router");
const enrollmentsRouter = require("./modules/enrollments/enrollments.router");
const materialsRouter = require("./modules/materials/materials.router");
const uploadsRouter = require("./modules/uploads/uploads.router");
const notificationsRouter = require("./modules/notifications/notifications.router");
const logsRouter = require("./modules/logs/log.router");
const academicYearsRouter = require("./modules/academic-years/academic-years.router");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // API server — CSP applied at frontend
  }),
);

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin "${origin}" not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.use(
  "/api/auth/register",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
      message:
        "Too many registration attempts. Please try again in 15 minutes.",
    },
  }),
);

app.use(
  "/api/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/academic-years", academicYearsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
