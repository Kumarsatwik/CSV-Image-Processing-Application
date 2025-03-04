const Queue = require('bull');
const path = require('path');
const { imageProcessor } = require('./image.service');
const Request = require('../models/request.model');
const Product = require('../models/product.model');
const { triggerWebhook } = require('./webhook.service');

// Create Redis connection for Bull queue
const imageQueue = new Queue('image-processing', {
  redis: {
    host: 'localhost',
    port: 6379,
  },
});

// process queue jobs
imageQueue.process(async (job) => {
  try {
    const { requestId, productId } = job.data;
    
    
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    
    product.status = 'processing';
    await product.save();
    
    const outputUrls = [];
    for (const imageUrl of product.inputImageUrls) {
      try {
        const outputUrl = await imageProcessor(imageUrl, product.productName, product.serialNumber);
        outputUrls.push(outputUrl);
      } catch (err) {
        console.error(`Error processing image ${imageUrl}:`, err);
        outputUrls.push('');  // Add empty string for failed image
      }
    }
    
   
    product.outputImageUrls = outputUrls;
    product.status = 'completed';
    await product.save();
    
    
    const request = await Request.findOne({ requestId });
    if (request) {
      request.processedItems += 1;
      
      
      if (request.processedItems >= request.totalItems) {
        request.status = 'completed';
        
        // generate output csv
        const csvService = require('./csv.service');
        const outputFilePath = await csvService.generateOutputCsv(requestId);
        request.outputFileName = path.basename(outputFilePath);
        
        // call webhook if all processing is complete
        await triggerWebhook(requestId);
      }
      
      await request.save();
    }
    
    return { success: true };
  } catch (error) {
    console.error('Job processing error:', error);
    
    // Update product status to failed
    const { productId } = job.data;
    await Product.findByIdAndUpdate(
      productId, 
      { 
        status: 'failed',
        error: error.message
      }
    );
    
    throw error;
  }
});


imageQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed with result:`, result);
});


imageQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed with error:`, error);
});

const addImageProcessingJob = async (requestId, productId) => {
  return await imageQueue.add(
    { requestId, productId },
    { 
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 10000
      }
    }
  );
};

module.exports = {
  imageQueue,
  addImageProcessingJob
};
