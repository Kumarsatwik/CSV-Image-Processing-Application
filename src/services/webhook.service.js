const axios = require('axios');
const Request = require('../models/request.model');
const Product = require('../models/product.model');

const triggerWebhook = async (requestId) => {
  try {
   
    const request = await Request.findOne({ requestId });
    if (!request) {
      throw new Error(`Request ${requestId} not found`);
    }
    
   
    const totalProducts = await Product.countDocuments({ requestId });
    const completedProducts = await Product.countDocuments({ 
      requestId, 
      status: 'completed' 
    });
    const failedProducts = await Product.countDocuments({ 
      requestId, 
      status: 'failed' 
    });
    
    const payload = {
      requestId,
      status: request.status,
      originalFileName: request.originalFileName,
      outputFileName: request.outputFileName,
      totalItems: totalProducts,
      completedItems: completedProducts,
      failedItems: failedProducts,
      processingTimeMs: new Date() - request.createdAt,
      timestamp: new Date().toISOString()
    };
    

    const webhookUrl = process.env.WEBHOOK_URL;
    if (!webhookUrl) {
      console.warn('No webhook URL configured');
      return false;
    }
    
    await axios.post(webhookUrl, payload);
    
    console.log(`Webhook triggered for request ${requestId}`);
    return true;
  } catch (error) {
    console.error(`Error triggering webhook for request ${requestId}:`, error);
    return false;
  }
};

module.exports = {
  triggerWebhook
};
