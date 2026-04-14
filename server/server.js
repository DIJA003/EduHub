require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

const app = require("./app");

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
