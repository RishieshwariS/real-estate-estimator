/**
 * Main App Component
 * 
 * This is the root component that:
 * - Manages application state
 * - Handles API calls
 * - Renders child components
 */

import React, { useState, useEffect, useCallback } from 'react';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import PredictionHistory from './components/PredictionHistory';
import { getPrediction, getHistory, deletePrediction, clearHistory } from './services/api';
import './App.css';

function App() {
  // State for current prediction
  const [prediction, setPrediction] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for history
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /**
   * Fetch prediction history from the backend
   */
  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const response = await getHistory(50);
      if (response.success) {
        setHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Fetch history on component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  /**
   * Handle prediction request
   */
  const handlePredict = async ({ area, bedrooms }) => {
    setIsLoading(true);
    setPredictionError(null);
    setPrediction(null);
    
    try {
      const response = await getPrediction(area, bedrooms);
      
      if (response.success) {
        setPrediction(response.data);
        // Refresh history to include new prediction
        fetchHistory();
      } else {
        setPredictionError(response.error || 'Prediction failed');
      }
    } catch (error) {
      setPredictionError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle deleting a single prediction
   */
  const handleDelete = async (id) => {
    try {
      const response = await deletePrediction(id);
      if (response.success) {
        // Remove from local state
        setHistory(history.filter(item => item._id !== id));
        
        // Clear current prediction if it was the deleted one
        if (prediction && prediction.id === id) {
          setPrediction(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete prediction:', error.message);
    }
  };

  /**
   * Handle clearing all history
   */
  const handleClearAll = async () => {
    // Confirm before deleting
    if (!window.confirm('Are you sure you want to delete all predictions?')) {
      return;
    }
    
    try {
      const response = await clearHistory();
      if (response.success) {
        setHistory([]);
        setPrediction(null);
      }
    } catch (error) {
      console.error('Failed to clear history:', error.message);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>🏠 Real Estate Price Predictor</h1>
          <p>Powered by Machine Learning</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <div className="content-grid">
          {/* Left Column - Form and Result */}
          <div className="left-column">
            <PredictionForm 
              onPredict={handlePredict}
              isLoading={isLoading}
            />
            
            <PredictionResult 
              result={prediction}
              error={predictionError}
            />
          </div>
          
          {/* Right Column - History */}
          <div className="right-column">
            <PredictionHistory
              history={history}
              isLoading={historyLoading}
              onDelete={handleDelete}
              onClearAll={handleClearAll}
              onRefresh={fetchHistory}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>
          Built with React, Node.js, Flask, and scikit-learn
        </p>
      </footer>
    </div>
  );
}

export default App;
