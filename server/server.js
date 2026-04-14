require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const { authLimiter, apiLimiter } = require("./middleware/rateLimiter");

connectDB();

const PORT = process.env.PORT || 5000;

app.use("/api/", apiLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/users/login", authLimiter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
