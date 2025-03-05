const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Ensure processed directory exists
const ensureDirectoryExists = async (dirPath) => {
  try {
    await mkdirAsync(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};

// Image processing function
const imageProcessor = async (imageUrl, productName, serialNumber) => {
  try {
    // Download the image
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data);
    console.log(
      `Downloaded image ${imageUrl} with size: ${
        response.data.byteLength / (1024 * 1024)
      } MB`
    );
    // Create directory structure for organized storage
    const productDir = path.join(
      __dirname,
      "../../processed",
      productName.replace(/[^a-zA-Z0-9]/g, "_")
    );

    await ensureDirectoryExists(productDir);

    // Process the image - compress by 50% quality
    const processedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 50 }) // Compress to 50% quality
      .toBuffer();

    // Generate unique filename
    const filename = `${serialNumber}_${uuidv4()}.jpg`;
    const outputPath = path.join(productDir, filename);
    console.log(
      `Processed image buffer size: ${
        processedImageBuffer.byteLength / (1024 * 1024)
      } mb`
    );

    // Save processed image
    await writeFileAsync(outputPath, processedImageBuffer);

    // Return the URL path to the processed image (relative to server)
    const relativePath = path
      .join("/processed", productName.replace(/[^a-zA-Z0-9]/g, "_"), filename)
      .replace(/\\/g, "/");

    return relativePath;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

module.exports = {
  imageProcessor,
};
