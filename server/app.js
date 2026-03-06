const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/userRoutes");
const semesterRoutes = require("./routes/semesterRoutes");

const app = express();

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/admin/semesters", semesterRoutes); 

module.exports = app;
