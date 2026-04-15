"""
Real Estate Price Prediction Model Training Script

This script:
1. Loads housing data from CSV
2. Prepares features and target variable
3. Trains a Linear Regression model
4. Evaluates model performance
5. Saves the trained model to disk

Run this script FIRST before starting the Flask API.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import pickle
import os

def load_data():
    """
    Load housing data from CSV file.
    Returns a pandas DataFrame with all housing features.
    """
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, 'data', 'housing_data.csv')
    
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Loaded {len(df)} records")
    print(f"Columns: {list(df.columns)}")
    
    return df

def prepare_features(df):
    """
    Prepare features (X) and target (y) for training.
    
    Features used:
    - area: Square footage of the property
    - bedrooms: Number of bedrooms
    
    Target:
    - price: Sale price in dollars
    """
    # Select features for prediction
    # We use area and bedrooms as primary features
    X = df[['area', 'bedrooms']].values
    
    # Target variable is the price
    y = df['price'].values
    
    print(f"Feature shape: {X.shape}")
    print(f"Target shape: {y.shape}")
    
    return X, y

def train_model(X, y):
    """
    Train a Linear Regression model.
    
    Linear Regression finds the best-fit line through the data
    by minimizing the sum of squared errors.
    
    Returns:
    - Trained model
    - Test features and labels for evaluation
    """
    # Split data: 80% training, 20% testing
    # random_state ensures reproducible results
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, 
        test_size=0.2, 
        random_state=42
    )
    
    print(f"\nTraining set size: {len(X_train)}")
    print(f"Test set size: {len(X_test)}")
    
    # Create and train the model
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    print("\nModel trained successfully!")
    print(f"Coefficients: {model.coef_}")
    print(f"Intercept: {model.intercept_}")
    
    return model, X_test, y_test

def evaluate_model(model, X_test, y_test):
    """
    Evaluate model performance using standard metrics.
    
    Metrics:
    - RMSE: Root Mean Squared Error (lower is better)
    - R² Score: Coefficient of determination (1.0 is perfect)
    """
    # Make predictions on test set
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\n=== Model Evaluation ===")
    print(f"Root Mean Squared Error: ${rmse:,.2f}")
    print(f"R² Score: {r2:.4f}")
    
    # Show some example predictions
    print("\n=== Sample Predictions ===")
    for i in range(min(5, len(X_test))):
        area, bedrooms = X_test[i]
        actual = y_test[i]
        predicted = y_pred[i]
        print(f"Area: {area} sqft, Bedrooms: {int(bedrooms)}")
        print(f"  Actual: ${actual:,.2f} | Predicted: ${predicted:,.2f}")
        print()
    
    return rmse, r2

def save_model(model, filename='model.pkl'):
    """
    Save the trained model to disk using pickle.
    
    Pickle serializes the model object so it can be
    loaded later without retraining.
    """
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, filename)
    
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    print(f"\nModel saved to: {model_path}")

def main():
    """
    Main training pipeline.
    Orchestrates loading, training, evaluation, and saving.
    """
    print("=" * 50)
    print("Real Estate Price Prediction Model Training")
    print("=" * 50)
    
    # Step 1: Load data
    df = load_data()
    
    # Step 2: Prepare features
    X, y = prepare_features(df)
    
    # Step 3: Train model
    model, X_test, y_test = train_model(X, y)
    
    # Step 4: Evaluate model
    evaluate_model(model, X_test, y_test)
    
    # Step 5: Save model
    save_model(model)
    
    print("\n" + "=" * 50)
    print("Training complete! Model is ready for predictions.")
    print("=" * 50)

if __name__ == '__main__':
    main()
