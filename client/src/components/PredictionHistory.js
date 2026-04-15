/**
 * PredictionHistory Component
 * 
 * Displays a list of past predictions fetched from the database.
 * Allows users to delete individual predictions or clear all.
 */

import React from 'react';

const PredictionHistory = ({ 
  history, 
  isLoading, 
  onDelete, 
  onClearAll,
  onRefresh 
}) => {
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
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    // Show relative time for recent predictions
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    // Show date for older predictions
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="prediction-history-container">
      <div className="history-header">
        <h2>Prediction History</h2>
        <div className="history-actions">
          <button 
            className="btn btn-icon" 
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh history"
          >
            🔄
          </button>
          {history.length > 0 && (
            <button 
              className="btn btn-danger-text"
              onClick={onClearAll}
              disabled={isLoading}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && history.length === 0 && (
        <div className="history-loading">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && history.length === 0 && (
        <div className="history-empty">
          <div className="empty-icon">📊</div>
          <p>No predictions yet</p>
          <span>Your prediction history will appear here</span>
        </div>
      )}

      {/* History List */}
      {history.length > 0 && (
        <div className="history-list">
          {history.map((item) => (
            <div key={item._id} className="history-item">
              <div className="history-item-main">
                <div className="history-price">
                  {formatPrice(item.price)}
                </div>
                <div className="history-details">
                  <span className="history-spec">
                    📐 {item.area.toLocaleString()} sq ft
                  </span>
                  <span className="history-spec">
                    🛏️ {item.bedrooms} bed{item.bedrooms !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              <div className="history-item-meta">
                <span className="history-date">
                  {formatDate(item.createdAt)}
                </span>
                <button
                  className="btn btn-icon btn-delete"
                  onClick={() => onDelete(item._id)}
                  title="Delete prediction"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {history.length > 0 && (
        <div className="history-summary">
          <span>{history.length} prediction{history.length !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default PredictionHistory;
