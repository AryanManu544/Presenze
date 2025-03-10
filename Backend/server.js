// server.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const serverless = require("serverless-http");

const app = express();

// Middleware for JSON parsing and CORS
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "auth-token"],
  })
);

// MongoDB Connection (optimized for serverless)
const mongoURI =
  process.env.MONGO_URI ||
  "mongodb+srv://aryanmanu544:ary1nay2@aryanmanu.pvkla.mongodb.net/Attendance_tracker";

const connectDB = async () => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        heartbeatFrequencyMS: 30000,
      });
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      process.exit(1);
    }
  }
};

// Connect to the database only when a request is received
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Optional: Timeout middleware to handle long requests gracefully
const timeout = (ms) => (req, res, next) => {
  res.setTimeout(ms, () => {
    res.status(504).json({ error: "Request timeout" });
  });
  next();
};

app.use(timeout(9000));

// Mounting routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/timetable", require("./routes/timetable")); // Timetable routes

// If you later add a universal 404 middleware, do it AFTER mounting your routes.
// For example:
// app.use((req, res) => {
//    res.status(404).json({ error: "Resource not found" });
// });

// Serverless handler configuration for environments like Netlify:
if (process.env.NETLIFY) {
  module.exports.handler = serverless(app);
} else {
  // Start the server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}