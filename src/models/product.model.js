const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      ref: 'Request'
    },
    serialNumber: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    inputImageUrls: {
      type: [String],
      required: true,
    },
    outputImageUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);


productSchema.index({ requestId: 1, serialNumber: 1 }, { unique: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
