const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

// Import routes
const uploadRoutes = require("./routes/upload.routes");
const statusRoutes = require("./routes/status.routes");
const webhookRoutes = require("./routes/webhook.routes");

// Import database config
const { connectDB } = require("./config/db");

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Static folder for processed images
app.use("/processed", express.static(path.join(__dirname, "../processed")));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/webhook", webhookRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("CSV Image Processing API");
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
