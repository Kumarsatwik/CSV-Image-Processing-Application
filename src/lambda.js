const serverless = require("serverless-http");
const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const uploadRoutes = require("./routes/upload.routes");
const statusRoutes = require("./routes/status.routes");
const webhookRoutes = require("./routes/webhook.routes");

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: "5mb", extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/webhook", webhookRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Export handler for AWS Lambda
module.exports.handler = serverless(app);
