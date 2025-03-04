const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { promisify } = require('util');
const Product = require('../models/product.model');
const Request = require('../models/request.model');

const writeFileAsync = promisify(fs.writeFile);
const createReadStream = fs.createReadStream;

const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // check if required columns exist and are not empty
        const serialNumber = data['Serial Number'] || data['SerialNumber'] || '';
        const productName = data['Product Name'] || data['ProductName'] || '';
        const inputImageUrls = data['Input Image Urls'] || data['InputImageUrls'] || '';
        
        if (!serialNumber || !productName || !inputImageUrls) {
          return reject(new Error('CSV file is missing required columns'));
        }
        
        
        const imageUrls = inputImageUrls.split(',').map(url => url.trim()); // process image url
        
        results.push({
          serialNumber,
          productName,
          inputImageUrls: imageUrls
        });
      })
      .on('end', () => {
        if (results.length === 0) {
          return reject(new Error('CSV file is empty or has no valid rows'));
        }
        
        resolve(results);
      })
      .on('error', (error) => {
        reject(new Error(`Error parsing CSV: ${error.message}`));
      });
  });
};


const validateCSV = (csvData) => {
  if (!Array.isArray(csvData) || csvData.length === 0) {
    throw new Error('CSV data is empty or invalid');
  }
  

  csvData.forEach((row, index) => {
    if (!row.serialNumber) {
      throw new Error(`Row ${index + 1} is missing Serial Number`);
    }
    
    if (!row.productName) {
      throw new Error(`Row ${index + 1} is missing Product Name`);
    }
    
    if (!row.inputImageUrls || row.inputImageUrls.length === 0) {
      throw new Error(`Row ${index + 1} is missing Input Image URLs`);
    }
    
    // validate urls
    row.inputImageUrls.forEach((url, urlIndex) => {
      try {
        new URL(url);
      } catch (error) {
        throw new Error(`Row ${index + 1}, URL ${urlIndex + 1} is invalid: ${url}`);
      }
    });
  });
  
  return true;
};


const generateOutputCsv = async (requestId) => {
  try {
    
    const products = await Product.find({ requestId }).sort({ serialNumber: 1 });
    
    if (!products || products.length === 0) {
      throw new Error(`No products found for request ${requestId}`);
    }
    
    
    let csvContent = 'Serial Number,Product Name,Input Image Urls,Output Image Urls\n';
    
    
    products.forEach(product => {
      const inputUrls = product.inputImageUrls.join(',');
      const outputUrls = product.outputImageUrls.join(',');
      
      csvContent += `${product.serialNumber},${product.productName},"${inputUrls}","${outputUrls}"\n`;
    });
    
    
    const outputDir = path.join(__dirname, '../../processed/csv');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    
    const outputPath = path.join(outputDir, `output_${requestId}.csv`);
    await writeFileAsync(outputPath, csvContent);
    
    return outputPath;
  } catch (error) {
    console.error(`Error generating output CSV for request ${requestId}:`, error);
    throw new Error(`Failed to generate output CSV: ${error.message}`);
  }
};

module.exports = {
  parseCSV,
  validateCSV,
  generateOutputCsv
};
