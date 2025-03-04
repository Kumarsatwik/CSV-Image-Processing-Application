const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { promisify } = require("util");
const { v4: uuidv4 } = require("uuid");
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);


const ensureDirectoryExists = async (dirPath) => {
  try {
    await mkdirAsync(dirPath, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
};


const imageProcessor = async (imageUrl, productName, serialNumber) => {
  try {
    
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data);
    
    console.log(
      `Downloaded image size: ${
        response.data.byteLength / (1024 * 1024)
      } MB`
    );

    // create a folder for store processed image
    const productDir = path.join(
      __dirname,
      "../../processed",
      productName.replace(/[^a-zA-Z0-9]/g, "_")
    );
    await ensureDirectoryExists(productDir);

    const processedImageBuffer = await sharp(imageBuffer)
      .jpeg({ quality: 50 }) // compress to 50% quality
      .toBuffer();


    const filename = `${serialNumber}_${uuidv4()}.jpg`;
    const outputPath = path.join(productDir, filename);
    console.log(
      `Processed image size: ${
        processedImageBuffer.byteLength / (1024 * 1024)
      } mb`
    );

    await writeFileAsync(outputPath, processedImageBuffer);

    //return the URL path of the compressed image
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
