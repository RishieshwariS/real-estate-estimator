/**
 * API Service Module
 * 
 * Centralizes all API calls to the backend.
 * Uses Axios for HTTP requests.
 */

import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',  // Uses proxy in development
  timeout: 15000,   // 15 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Make a price prediction
 * 
 * @param {number} area - Square footage of the property
 * @param {number} bedrooms - Number of bedrooms
 * @returns {Promise<Object>} Prediction result
 */
export const getPrediction = async (area, bedrooms) => {
  try {
    const response = await api.post('/predict', {
      area: Number(area),
      bedrooms: Number(bedrooms)
    });
    
    return response.data;
    
  } catch (error) {
    // Re-throw with more helpful error message
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'Prediction failed');
    } else if (error.request) {
      // No response received
      throw new Error('Unable to reach the server. Please check your connection.');
    } else {
      // Request setup error
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Get prediction history
 * 
 * @param {number} limit - Maximum number of results (default: 50)
 * @returns {Promise<Object>} Array of past predictions
 */
export const getHistory = async (limit = 50) => {
  try {
    const response = await api.get('/history', {
      params: { limit }
    });
    
    return response.data;
    
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to fetch history');
    } else if (error.request) {
      throw new Error('Unable to reach the server. Please check your connection.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Delete a specific prediction
 * 
 * @param {string} id - Prediction ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deletePrediction = async (id) => {
  try {
    const response = await api.delete(`/history/${id}`);
    return response.data;
    
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to delete prediction');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

/**
 * Clear all prediction history
 * 
 * @returns {Promise<Object>} Deletion result
 */
export const clearHistory = async () => {
  try {
    const response = await api.delete('/history');
    return response.data;
    
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to clear history');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
};

export default api;
