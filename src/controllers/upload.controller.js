const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { parseCSV, validateCSV } = require("../services/csv.service");
const Request = require("../models/request.model");
const Product = require("../models/product.model");
const { addImageProcessingJob } = require("../services/queue.service");


const uploadCSV = async (req, res) => {
  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }
    const { path: filePath, originalname } = req.file;

    const requestId = uuidv4();

    try {
      const csvData = await parseCSV(filePath);

      validateCSV(csvData); //validate csv file

      const request = new Request({
        requestId,
        status: "pending",
        totalItems: csvData.length,
        processedItems: 0,
        originalFileName: originalname,
      });

      await request.save();

      
      const productPromises = csvData.map(async (item) => {
        
        const product = new Product({
          requestId,
          serialNumber: item.serialNumber,
          productName: item.productName,
          inputImageUrls: item.inputImageUrls,
          status: "pending",
        });

        await product.save();
        await addImageProcessingJob(requestId, product._id); // add images into the queue

        return product;
      });

      await Promise.all(productPromises);

      request.status = "processing";
      await request.save();
      return res.status(200).json({
        success: true,
        message: "CSV file uploaded and processing started",
        requestId,
        totalItems: csvData.length,
      });
    } catch (error) {
      
      console.log('error uploading csv file', error);

      const request = new Request({
        requestId,
        status: "failed",
        error: error.message,
        originalFileName: originalname,
      });

      await request.save();

      return res.status(400).json({
        success: false,
        message: `CSV validation failed: ${error.message}`,
        requestId,
      });
    } finally {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error uploading CSV:", error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

module.exports = {
  uploadCSV,
};
