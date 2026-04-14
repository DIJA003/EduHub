require("dotenv").config();
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");

const uploadsDir = path.join(__dirname, "uploads", "materials");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads/materials directory");
}

connectDB();

const app = require("./app");
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
