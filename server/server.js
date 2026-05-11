// Suppress all Node.js warnings
process.env.NODE_NO_WARNINGS = '1';
process.env.DOTENVX_SILENT = '1';

require("dotenv").config({ silent: true, debug: false });

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

connectDB().then(async () => {
  const app = require("./src/app");
  const { initializeSettings } = require("./src/modules/settings/settings.controller");

  // Initialize default settings
  await initializeSettings();
  console.log("✅ Settings initialized");

  const PORT = process.env.PORT || 8000;

  const server = app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
});
