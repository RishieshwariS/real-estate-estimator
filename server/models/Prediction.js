/**
 * Prediction Model Schema
 * 
 * Defines the structure for storing predictions in MongoDB.
 * Each document represents one price prediction request.
 */

const mongoose = require('mongoose');

// Define the schema for prediction documents
const predictionSchema = new mongoose.Schema({
  // Square footage of the property
  area: {
    type: Number,
    required: [true, 'Area is required'],
    min: [1, 'Area must be at least 1 square foot'],
    max: [100000, 'Area cannot exceed 100,000 square feet']
  },
  
  // Number of bedrooms
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative'],
    max: [20, 'Bedrooms cannot exceed 20']
  },
  
  // Predicted price from the ML model
  price: {
    type: Number,
    required: [true, 'Predicted price is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Timestamp when prediction was made
  createdAt: {
    type: Date,
    default: Date.now,
    index: true  // Index for efficient sorting by date
  }
});

// Add a virtual field for formatted price
predictionSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toLocaleString()}`;
});

// Ensure virtuals are included when converting to JSON
predictionSchema.set('toJSON', { virtuals: true });
predictionSchema.set('toObject', { virtuals: true });

// Create and export the model
// 'Prediction' will create a 'predictions' collection in MongoDB
const Prediction = mongoose.model('Prediction', predictionSchema);

module.exports = Prediction;
