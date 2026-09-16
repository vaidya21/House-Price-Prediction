"""
ProphetVal India - Real Estate Valuation Web Service
Backend built with Flask and Python's pickle (.pkl)
"""

import os
import pickle
import pandas as pd
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Resolve model paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'linear_regression_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')

# Fallback to model/ folder if not in root
if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(BASE_DIR, 'model', 'linear_regression_model.pkl')
if not os.path.exists(SCALER_PATH):
    SCALER_PATH = os.path.join(BASE_DIR, 'model', 'scaler.pkl')

model = None
scaler = None

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(SCALER_PATH, 'rb') as f:
        scaler = pickle.load(f)
    print("✓ Model and Scaler loaded successfully from .pkl files!")
except Exception as e:
    print(f"⚠️ Error loading .pkl files: {e}")


def format_inr(amount):
    """Formats amounts into Indian Crores / Lakhs."""
    if amount >= 10000000:
        cr_val = amount / 10000000
        return f"₹{cr_val:.2f} Cr"
    elif amount >= 100000:
        lakh_val = amount / 100000
        return f"₹{lakh_val:.2f} Lakhs"
    else:
        return f"₹{amount:,.0f}"


def calculate_emi(principal, tenure_years=20, annual_rate=8.5):
    """Calculates approximate monthly home loan EMI (assuming 80% loan)."""
    loan_amount = principal * 0.80  # 80% financed
    monthly_rate = (annual_rate / 12) / 100
    total_months = tenure_years * 12
    emi = (loan_amount * monthly_rate * ((1 + monthly_rate) ** total_months)) / (((1 + monthly_rate) ** total_months) - 1)
    return emi


@app.route('/')
def home():
    """Renders the main valuation dashboard."""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """Inference endpoint accepting JSON or form inputs."""
    if model is None or scaler is None:
        return jsonify({'status': 'error', 'message': 'Model is not loaded.'}), 500

    try:
        data = request.get_json() if request.is_json else request.form.to_dict()

        # Parse inputs
        sqft = float(data.get('SquareFeet', 1800))
        bedrooms = int(float(data.get('Bedrooms', 3)))
        bathrooms = float(data.get('Bathrooms', 2.0))
        house_age = float(data.get('HouseAge', 5))
        distance = float(data.get('DistanceToCityCenter', 6.0))
        garage = int(float(data.get('GarageSpaces', 1)))
        neighborhood = str(data.get('Neighborhood', 'Suburban')).strip()

        # Map neighborhood to the 3 one-hot columns (City Center is baseline: all 0)
        is_gated = 1 if neighborhood == 'Gated Society' else 0
        is_rural = 1 if neighborhood == 'Rural / Outskirts' else 0
        is_suburban = 1 if neighborhood == 'Suburban' else 0

        # Construct DataFrame matching Scaler feature columns exactly
        input_df = pd.DataFrame([{
            'SquareFeet': sqft,
            'Bedrooms': bedrooms,
            'Bathrooms': bathrooms,
            'HouseAge': house_age,
            'DistanceToCityCenter': distance,
            'GarageSpaces': garage,
            'Neighborhood_Gated Society': is_gated,
            'Neighborhood_Rural / Outskirts': is_rural,
            'Neighborhood_Suburban': is_suburban
        }])

        # Scale features and run Linear Regression model
        scaled_input = scaler.transform(input_df)
        predicted_raw = float(model.predict(scaled_input)[0])
        predicted_price = max(predicted_raw, 1500000.0) # floor at 15 Lakhs

        # Financial calculations
        price_per_sqft = predicted_price / sqft if sqft > 0 else 0
        estimated_emi = calculate_emi(predicted_price)

        return jsonify({
            'status': 'success',
            'raw_price': round(predicted_price, 2),
            'formatted_inr': format_inr(predicted_price),
            'full_currency': f"₹{predicted_price:,.0f}",
            'price_per_sqft': f"₹{price_per_sqft:,.0f} / sq ft",
            'monthly_emi': f"₹{estimated_emi:,.0f} / mo",
            'bhk_label': f"{bedrooms} BHK",
            'locality': neighborhood,
            'sqft_label': f"{int(sqft):,} sq ft"
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'service': 'Indian Real Estate Price Predictor',
        'currency': 'INR (₹)',
        'model_loaded': model is not None
    }), 200


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"🚀 ProphetVal server starting at http://localhost:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
