/**
 * MongoDB Database Connection Configuration
 * 
 * This module handles:
 * - Connecting to MongoDB
 * - Connection error handling
 * - Graceful shutdown
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses the connection string from environment variables
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment
  
    const mongoURI = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    
    // Connect with recommended options
    const conn = await mongoose.connect(mongoURI, {
      // These options ensure stable connections
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    
    // Exit process if database connection fails
    // This prevents the app from running without data storage
    process.exit(1);
  }
};

/**
 * Graceful shutdown handler
 * Closes MongoDB connection when the app is terminated
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed gracefully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, closeDB };
