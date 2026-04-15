/**
 * Predictions API Routes
 * 
 * Handles:
 * - POST /predict : Make a new price prediction
 * - GET /history  : Retrieve past predictions
 * - DELETE /history/:id : Delete a specific prediction
 */

const express = require('express');
const axios = require('axios');
const Prediction = require('../models/Prediction');

const router = express.Router();

// Get ML service URL from environment
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || '[localhost](http://localhost:5001)';

/**
 * POST /api/predict
 * 
 * Makes a price prediction by calling the ML service
 * and stores the result in MongoDB.
 * 
 * Request body:
 * { "area": 1500, "bedrooms": 3 }
 * 
 * Response:
 * { "success": true, "data": { prediction object } }
 */
router.post('/predict', async (req, res) => {
  try {
    const { area, bedrooms } = req.body;
    
    // Validate input
    if (area === undefined || area === null) {
      return res.status(400).json({
        success: false,
        error: 'Area is required'
      });
    }
    
    if (bedrooms === undefined || bedrooms === null) {
      return res.status(400).json({
        success: false,
        error: 'Number of bedrooms is required'
      });
    }
    
    // Convert to numbers and validate
    const areaNum = Number(area);
    const bedroomsNum = Number(bedrooms);
    
    if (isNaN(areaNum) || areaNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Area must be a positive number'
      });
    }
    
    if (isNaN(bedroomsNum) || bedroomsNum < 0 || !Number.isInteger(bedroomsNum)) {
      return res.status(400).json({
        success: false,
        error: 'Bedrooms must be a non-negative integer'
      });
    }
    
    console.log(`Requesting prediction for: area=${areaNum}, bedrooms=${bedroomsNum}`);
    
    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      area: areaNum,
      bedrooms: bedroomsNum
    }, {
      timeout: 10000,  // 10 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Check if ML service returned success
    if (!mlResponse.data.success) {
      return res.status(500).json({
        success: false,
        error: mlResponse.data.error || 'ML service returned an error'
      });
    }
    
    const predictedPrice = mlResponse.data.prediction;
    
    // Save prediction to database
    const prediction = new Prediction({
      area: areaNum,
      bedrooms: bedroomsNum,
      price: predictedPrice
    });
    
    await prediction.save();
    
    console.log(`Prediction saved: ${prediction._id}`);
    
    // Return success response
    res.status(201).json({
      success: true,
      data: {
        id: prediction._id,
        area: prediction.area,
        bedrooms: prediction.bedrooms,
        price: prediction.price,
        createdAt: prediction.createdAt
      }
    });
    
  } catch (error) {
    console.error('Prediction error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'ML service is unavailable. Please ensure the Python service is running.'
      });
    }
    
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        error: 'ML service request timed out. Please try again.'
      });
    }
    
    // Handle Axios errors
    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        error: error.response.data.error || 'ML service error'
      });
    }
    
    // Generic error
    res.status(500).json({
      success: false,
      error: 'An unexpected error occurred'
    });
  }
});

/**
 * GET /api/history
 * 
 * Retrieves past predictions from the database.
 * Results are sorted by creation date (newest first).
 * 
 * Query parameters:
 * - limit: Maximum number of results (default: 50)
 * - skip: Number of results to skip (for pagination)
 * 
 * Response:
 * { "success": true, "data": [prediction objects], "count": number }
 */
router.get('/history', async (req, res) => {
  try {
    // Parse pagination parameters
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);  // Max 100
    const skip = parseInt(req.query.skip) || 0;
    
    // Fetch predictions from database
    const predictions = await Prediction
      .find()
      .sort({ createdAt: -1 })  // Newest first
      .skip(skip)
      .limit(limit)
      .select('area bedrooms price createdAt');  // Select specific fields
    
    // Get total count for pagination info
    const totalCount = await Prediction.countDocuments();
    
    res.json({
      success: true,
      data: predictions,
      count: predictions.length,
      total: totalCount,
      hasMore: skip + predictions.length < totalCount
    });
    
  } catch (error) {
    console.error('History fetch error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prediction history'
    });
  }
});

/**
 * DELETE /api/history/:id
 * 
 * Deletes a specific prediction by ID.
 * 
 * Response:
 * { "success": true, "message": "Prediction deleted" }
 */
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const prediction = await Prediction.findByIdAndDelete(id);
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        error: 'Prediction not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Prediction deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete error:', error.message);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid prediction ID'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete prediction'
    });
  }
});

/**
 * DELETE /api/history
 * 
 * Clears all prediction history.
 * Use with caution!
 */
router.delete('/history', async (req, res) => {
  try {
    const result = await Prediction.deleteMany({});
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} predictions`
    });
    
  } catch (error) {
    console.error('Clear history error:', error.message);
    
    res.status(500).json({
      success: false,
      error: 'Failed to clear prediction history'
    });
  }
});

module.exports = router;
