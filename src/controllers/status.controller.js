const Request = require('../models/request.model');
const Product = require('../models/product.model');


const getRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'Request ID is required'
      });
    }
    
    const request = await Request.findOne({ requestId });
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: `Request with ID ${requestId} not found`
      });
    }
    
    const completedProducts = await Product.countDocuments({ 
      requestId, 
      status: 'completed' 
    });
    const failedProducts = await Product.countDocuments({ 
      requestId, 
      status: 'failed' 
    });
    

    const response = {
      success: true,
      requestId: request.requestId,
      status: request.status,
      progress: {
        total: request.totalItems,
        processed: request.processedItems,
        completed: completedProducts,
        failed: failedProducts,
        percentComplete: request.totalItems > 0 
          ? Math.round((request.processedItems / request.totalItems) * 100) 
          : 0
      },
      originalFileName: request.originalFileName,
      outputFileName: request.outputFileName,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
    
    
    if (request.status === 'completed' && request.outputFileName) {
      response.outputFileUrl = `/processed/csv/${request.outputFileName}`;
    }
    
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error getting request status:', error);
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`
    });
  }
};

module.exports = {
  getRequestStatus
};
