"""
Flask API for Real Estate Price Prediction

This microservice:
1. Loads the pre-trained ML model
2. Exposes a /predict endpoint
3. Returns price predictions as JSON

Run model.py FIRST to generate model.pkl before starting this API.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
# This allows the Node.js backend to call this API
CORS(app)

# Global variable to hold the loaded model
model = None

def load_model():
    """
    Load the trained model from disk.
    Called once when the server starts.
    """
    global model
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, 'model.pkl')
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"Model file not found at {model_path}. "
            "Please run model.py first to train and save the model."
        )
    
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    print(f"Model loaded successfully from {model_path}")

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint.
    Returns status to verify the service is running.
    """
    return jsonify({
        'status': 'healthy',
        'service': 'ml-prediction-service',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint.
    
    Expects JSON body:
    {
        "area": 1500,      // Square footage (number)
        "bedrooms": 3      // Number of bedrooms (number)
    }
    
    Returns JSON:
    {
        "success": true,
        "prediction": 225000.00,
        "input": { "area": 1500, "bedrooms": 3 }
    }
    """
    try:
        # Parse JSON request body
        data = request.get_json()
        
        # Validate required fields exist
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400
        
        if 'area' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: area'
            }), 400
            
        if 'bedrooms' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: bedrooms'
            }), 400
        
        # Extract and validate values
        try:
            area = float(data['area'])
            bedrooms = int(data['bedrooms'])
        except (ValueError, TypeError) as e:
            return jsonify({
                'success': False,
                'error': 'Invalid input types. area must be a number, bedrooms must be an integer.'
            }), 400
        
        # Validate reasonable ranges
        if area <= 0:
            return jsonify({
                'success': False,
                'error': 'Area must be a positive number'
            }), 400
            
        if bedrooms < 0:
            return jsonify({
                'success': False,
                'error': 'Bedrooms cannot be negative'
            }), 400
        
        # Prepare input for model
        # Model expects 2D array: [[area, bedrooms]]
        features = np.array([[area, bedrooms]])
        
        # Make prediction
        prediction = model.predict(features)[0]
        
        # Ensure prediction is not negative
        prediction = max(0, prediction)
        
        # Return successful response
        return jsonify({
            'success': True,
            'prediction': round(prediction, 2),
            'input': {
                'area': area,
                'bedrooms': bedrooms
            }
        })
        
    except Exception as e:
        # Log the error for debugging
        print(f"Prediction error: {str(e)}")
        
        return jsonify({
            'success': False,
            'error': f'Prediction failed: {str(e)}'
        }), 500

@app.route('/model-info', methods=['GET'])
def model_info():
    """
    Returns information about the loaded model.
    Useful for debugging and verification.
    """
    if model is None:
        return jsonify({
            'success': False,
            'error': 'Model not loaded'
        }), 500
    
    return jsonify({
        'success': True,
        'model_type': type(model).__name__,
        'coefficients': model.coef_.tolist(),
        'intercept': float(model.intercept_),
        'features': ['area', 'bedrooms']
    })

# Load model when module is imported
load_model()

if __name__ == '__main__':
    # Run Flask development server
    # Port 5001 to avoid conflicts with other services
    print("\nStarting ML Prediction Service...")
    print("Endpoints:")
    print("  - POST /predict  : Get price prediction")
    print("  - GET  /health   : Health check")
    print("  - GET  /model-info: Model information")
    print("\n")
    
    app.run(
        host='0.0.0.0',  # Accept connections from any IP
        port=5001,
        debug=True       # Enable debug mode for development
    )
