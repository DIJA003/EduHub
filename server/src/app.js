require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

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
const facultiesRouter = require("./modules/faculties/faculties.router");
const programsRouter = require("./modules/programs/programs.router");
const requestsRouter = require("./modules/requests/requests.router");
const settingsRouter = require("./modules/settings/settings.router");
const dashboardRouter = require("./modules/dashboard/dashboard.router");
const mentorRouter = require("./modules/mentor/mentor.router");
const adminDashboardRouter = require("./modules/admin/dashboard.router");

const app = express();

// ── Security headers ────────────────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ── Rate limiting ─────────────────────────────────────────────────────────────
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

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  "/uploads",
  cors(corsOptions), // allow browser fetch from React dev server
  express.static(path.join(__dirname, "../../uploads"), {
    setHeaders(res) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  }),
);

// Fallback: serve material files by looking up correct storagePath in database
// This handles cases where fileUrl in DB doesn't match actual disk path
// Use regex to match any path under /uploads/materials/
app.get(/^\/uploads\/materials\/.+/, async (req, res, next) => {
  try {
    const fs = require("fs");
    const path = require("path");
    const Material = require("./modules/materials/material.model");

    // Get the path from URL (everything after /uploads/materials/)
    const requestedPath = req.path.replace(/^\/uploads\/materials\//, "");
    if (!requestedPath || typeof requestedPath !== "string") {
      return res.status(404).json({ success: false, message: "Invalid path" });
    }

    // Try the direct path first
    const directPath = path.join(
      __dirname,
      "../../uploads/materials",
      requestedPath,
    );
    if (fs.existsSync(directPath)) {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      return res.sendFile(directPath);
    }

    // Extract filename from URL
    const filename = path.basename(requestedPath);

    // Find material by filename
    const material = await Material.findOne({
      $or: [
        { storagePath: { $regex: filename + "$" } },
        { fileUrl: { $regex: filename + "$" } },
      ],
    })
      .select("storagePath fileUrl")
      .lean();

    // Try storagePath first
    if (material?.storagePath) {
      const storageFullPath = path.join(
        __dirname,
        "../../uploads/materials",
        material.storagePath,
      );
      if (fs.existsSync(storageFullPath)) {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        return res.sendFile(storageFullPath);
      }
    }

    // Try extracting from fileUrl
    if (material?.fileUrl) {
      const urlPath = material.fileUrl.replace(
        /^.*?\/uploads\/materials\//,
        "",
      );
      if (urlPath && urlPath !== material.fileUrl) {
        const urlFullPath = path.join(
          __dirname,
          "../../uploads/materials",
          urlPath,
        );
        if (fs.existsSync(urlFullPath)) {
          res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
          return res.sendFile(urlFullPath);
        }
      }
    }

    // Last resort: search all subdirectories for the filename
    const uploadsDir = path.join(__dirname, "../../uploads/materials");
    if (fs.existsSync(uploadsDir)) {
      const dirs = fs
        .readdirSync(uploadsDir)
        .filter((f) => fs.statSync(path.join(uploadsDir, f)).isDirectory());

      for (const dir of dirs) {
        const dirPath = path.join(uploadsDir, dir);
        const subDirs = fs
          .readdirSync(dirPath)
          .filter((f) => fs.statSync(path.join(dirPath, f)).isDirectory());

        for (const subDir of subDirs) {
          const possiblePath = path.join(dirPath, subDir, filename);
          if (fs.existsSync(possiblePath)) {
            res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
            return res.sendFile(possiblePath);
          }
        }
      }
    }

    // If not found, return 404
    res.status(404).json({ success: false, message: "File not found" });
  } catch (err) {
    next(err);
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/enrollments", enrollmentsRouter);
app.use("/api/materials", materialsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/logs", logsRouter);
app.use("/api/academic-years", academicYearsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/mentor", mentorRouter);
app.use("/api/admin", adminDashboardRouter);
app.use("/api/faculties", facultiesRouter);
app.use("/api/programs", programsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/requests", requestsRouter);

// ── Error handlers ────────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
