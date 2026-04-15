/**
 * Real Estate Price Prediction API - Main Entry Point
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const predictionsRouter = require('./routes/predictions');

const app = express();
const PORT = process.env.PORT || 5000;

/* ===================
   Middleware
=================== */

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000'
}));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

/* ===================
   Routes
=================== */

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'real-estate-backend',
    timestamp: new Date().toISOString()
  });
});

app.use('/api', predictionsRouter);

/* ===================
   Error Handling
=================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

/* ===================
   Start Server
=================== */

const startServer = async () => {
  try {
    await connectDB(); // MongoDB Atlas connection

    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log(' Real Estate Price Prediction API');
      console.log('========================================');
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('========================================\n');
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();