require("dotenv").config();

const fs = require("fs");
const path = require("path");
const connectDB = require("./src/config/db");

const dirs = [
  path.join(__dirname, "uploads", "materials"),
  path.join(__dirname, "uploads", "avatars"),
];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

require("./src/config/firebase");

connectDB().then(() => {
  const app = require("./src/app");
  const PORT = process.env.PORT || 8000;

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
});
