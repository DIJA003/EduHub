require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const semesterRoutes = require("./routes/semesterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const materialRoutes = require("./routes/materialRoutes");
const mentorRoutes = require("./routes/MentorRoutes");
const academicYearRoutes = require("./routes/academicYearRoutes");
const studentRoutes = require("./routes/studentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const allowedOrigins = (
  process.env.CLIENT_URLS || "http://localhost:3000,http://localhost:5173"
)
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

//app.use("/api/", apiLimiter);
//app.use("/api/auth/", authLimiter);
//app.use("/api/users/login", authLimiter);
//app.use("/api/users/register", authLimiter);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/uploads", express.static("uploads"));

app.use("/api/academic-years", academicYearRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin/semesters", semesterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "EduHub API is running" });
});

// Academic year routes (public course catalog per year)
app.get(
  "/api/courses/year/:yearId",
  require("./middleware/authMiddleware").verifyToken,
  async (req, res) => {
    try {
      const Course = require("./models/Course");
      const courses = await Course.find({
        yearId: req.params.yearId,
        status: "Published",
      }).sort({ createdAt: -1 });
      res.json({ success: true, data: courses });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found.` });
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Server Error:`, err.message);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal server error" });
});

module.exports = app;
