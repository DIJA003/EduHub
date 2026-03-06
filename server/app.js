const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
//const academicYearRoutes = require('./routes/academicYearRoutes');
const semesterRoutes = require('./routes/semesterRoutes');

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ message: "EduHub API is running successfully!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); 
//app.use('/api/admin/years', academicYearRoutes);
app.use('/api/admin/semesters', semesterRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found. Please check your URL." });
});

app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ error: "Something went wrong on the server!" });
});

module.exports = app;
