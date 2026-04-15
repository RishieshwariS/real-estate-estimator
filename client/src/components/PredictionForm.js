/**
 * PredictionForm Component
 * 
 * Renders a form for users to input property details
 * and request a price prediction.
 */

import React, { useState } from 'react';

const PredictionForm = ({ onPredict, isLoading }) => {
  // Form state
  const [area, setArea] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [errors, setErrors] = useState({});

  /**
   * Validate form inputs
   * Returns true if valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Validate area
    if (!area) {
      newErrors.area = 'Area is required';
    } else if (isNaN(area) || Number(area) <= 0) {
      newErrors.area = 'Area must be a positive number';
    } else if (Number(area) > 100000) {
      newErrors.area = 'Area seems too large. Please check your input.';
    }
    
    // Validate bedrooms
    if (!bedrooms && bedrooms !== 0) {
      newErrors.bedrooms = 'Number of bedrooms is required';
    } else if (isNaN(bedrooms) || Number(bedrooms) < 0) {
      newErrors.bedrooms = 'Bedrooms must be a non-negative number';
    } else if (!Number.isInteger(Number(bedrooms))) {
      newErrors.bedrooms = 'Bedrooms must be a whole number';
    } else if (Number(bedrooms) > 20) {
      newErrors.bedrooms = 'Maximum 20 bedrooms allowed';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate before submitting
    if (!validateForm()) {
      return;
    }
    
    // Call parent's onPredict handler
    onPredict({
      area: Number(area),
      bedrooms: Number(bedrooms)
    });
  };

  /**
   * Clear the form
   */
  const handleClear = () => {
    setArea('');
    setBedrooms('');
    setErrors({});
  };

  return (
    <div className="prediction-form-container">
      <h2>Property Details</h2>
      <p className="form-description">
        Enter the property specifications to get an estimated price.
      </p>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        {/* Area Input */}
        <div className="form-group">
          <label htmlFor="area">
            Area (sq ft)
            <span className="required">*</span>
          </label>
          <input
            type="number"
            id="area"
            value={area}
            onChange={(e) => {
              setArea(e.target.value);
              if (errors.area) {
                setErrors({ ...errors, area: '' });
              }
            }}
            placeholder="e.g., 1500"
            min="1"
            max="100000"
            step="1"
            className={errors.area ? 'input-error' : ''}
            disabled={isLoading}
          />
          {errors.area && (
            <span className="error-message">{errors.area}</span>
          )}
          <span className="input-hint">
            Total living area in square feet
          </span>
        </div>
        
        {/* Bedrooms Input */}
        <div className="form-group">
          <label htmlFor="bedrooms">
            Bedrooms
            <span className="required">*</span>
          </label>
          <input
            type="number"
            id="bedrooms"
            value={bedrooms}
            onChange={(e) => {
              setBedrooms(e.target.value);
              if (errors.bedrooms) {
                setErrors({ ...errors, bedrooms: '' });
              }
            }}
            placeholder="e.g., 3"
            min="0"
            max="20"
            step="1"
            className={errors.bedrooms ? 'input-error' : ''}
            disabled={isLoading}
          />
          {errors.bedrooms && (
            <span className="error-message">{errors.bedrooms}</span>
          )}
          <span className="input-hint">
            Number of bedrooms (0-20)
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Predicting...
              </>
            ) : (
              'Get Prediction'
            )}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;
