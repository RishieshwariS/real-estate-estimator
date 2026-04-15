/**
 * PredictionResult Component
 * 
 * Displays the predicted price after a successful prediction.
 * Shows error messages if prediction fails.
 */

import React from 'react';

const PredictionResult = ({ result, error }) => {
  // Don't render if no result and no error
  if (!result && !error) {
    return null;
  }

  /**
   * Format price with currency symbol and commas
   */
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Render error state
  if (error) {
    return (
      <div className="prediction-result error">
        <div className="result-icon">⚠️</div>
        <h3>Prediction Failed</h3>
        <p className="error-text">{error}</p>
        <p className="error-hint">
          Please check your inputs and try again.
        </p>
      </div>
    );
  }

  // Render success state
  return (
    <div className="prediction-result success">
      <div className="result-icon">🏠</div>
      <h3>Estimated Price</h3>
      <div className="price-display">
        {formatPrice(result.price)}
      </div>
      
      <div className="result-details">
        <div className="detail-item">
          <span className="detail-label">Area</span>
          <span className="detail-value">
            {result.area.toLocaleString()} sq ft
          </span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Bedrooms</span>
          <span className="detail-value">{result.bedrooms}</span>
        </div>
        {result.createdAt && (
          <div className="detail-item">
            <span className="detail-label">Predicted at</span>
            <span className="detail-value">
              {formatDate(result.createdAt)}
            </span>
          </div>
        )}
      </div>
      
      <p className="disclaimer">
        * This is an estimate based on historical data. 
        Actual prices may vary based on location, condition, and market factors.
      </p>
    </div>
  );
};

export default PredictionResult;
