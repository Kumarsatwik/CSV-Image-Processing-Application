const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadCSV } = require("../controllers/upload.controller");

const router = express.Router();

// Configure multer storage for CSV file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use /tmp directory in Lambda environment, otherwise use local uploads directory
    const uploadDir = process.env.AWS_LAMBDA_FUNCTION_NAME 
      ? '/tmp' 
      : path.join(__dirname, "../../uploads");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".csv");
  },
});

// Create multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      return cb(null, true);
    }

    cb(new Error("Only CSV files are allowed"));
  },
});


router.post("/", upload.single("file"), uploadCSV);

module.exports = router;
