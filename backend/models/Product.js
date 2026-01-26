
const mongoose = require('mongoose');

/**
 * Product Schema for NammaMart
 * This defines how a single grocery item is stored in the database.
 */
const productSchema = mongoose.Schema(
  {
    // The admin user who added this product
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
