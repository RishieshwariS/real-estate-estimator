"""
Flask API for Real Estate Price Prediction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import os

app = Flask(__name__)
CORS(app)

model = None


def load_model():
    """Load trained model"""
    global model

    model_path = os.path.join(os.path.dirname(__file__), "model.pkl")

    if not os.path.exists(model_path):
        raise FileNotFoundError("model.pkl not found. Run model.py first.")

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    print("✅ Model loaded successfully")


# Load model once at startup
load_model()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"success": False, "error": "No input data"}), 400

        area = float(data["area"])
        bedrooms = int(data["bedrooms"])

        if area <= 0 or bedrooms < 0:
            return jsonify({"success": False, "error": "Invalid input values"}), 400

        features = np.array([[area, bedrooms]])
        prediction = model.predict(features)[0]

        return jsonify({
            "success": True,
            "prediction": round(float(prediction), 2),
            "input": data
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/model-info", methods=["GET"])
def model_info():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500

    return jsonify({
        "model_type": str(type(model)),
        "coefficients": model.coef_.tolist(),
        "intercept": float(model.intercept_)
    })


# 🚀 Render / Production entry point
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))

    print("🚀 Starting ML Service...")

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )