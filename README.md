# 🏡 House Price Prediction - The Real Estate Price Predictor 

An end-to-end Machine Learning web application that predicts house price, complete with an ultra-modern responsive frontend UI (HTML5, CSS3, JavaScript) and a Flask backend powered by Python's `pickle` (`.pkl`).

🔗 **Live Demo:** [https://car-price-predictor-1-8u8k.onrender.com](https://house-price-prediction-kegh.onrender.com)
*(Note: Since this is hosted on a free tier, it may take 30-50 seconds to wake up the server on the first load).*

---

## 🌟 Key Features
- **Accurate Linear Regression Model**: Trained on 2,000 Indian housing records with ~97.4% $R^2$ accuracy.
- **Indian Pricing System**: Calculates valuations in **Lakhs** and **Crores** (`₹1.25 Cr` / `₹85 Lakhs`).
- **Interactive Modern UI**:
  - Live synchronized sliders for Built-up Area, Property Age, and Metro Distance.
  - Interactive BHK (1 BHK to 5 BHK) and Bathroom selector pills.
  - Indian Locality dropdowns (`City Center / Prime Metro`, `Gated Society`, `Suburban`, `Rural / Outskirts`).
  - Quick Presets (Metro 2 BHK, Gated Society 3 BHK, Suburban 4 BHK Villa).
  - Monthly Home Loan EMI estimation widget (at 8.5% p.a.).
  - Price per square foot calculation (`₹6,745 / sq ft`).
- **Production Ready**: One-click deployment on Render / Heroku / AWS using `gunicorn`.

---

## 📁 Repository File Structure

```
├── app.py                            # Flask server loading .pkl model & REST API
├── templates/
│   └── index.html                    # Modern glassmorphism UI template
├── static/
│   ├── css/
│   │   └── style.css                 # Dark luxury theme styling
│   └── js/
│       └── app.js                    # Interactive AJAX and slider syncing
├── linear_regression_model.pkl       # Trained Linear Regression model weights
├── scaler.pkl                        # Fitted StandardScaler object
├── housing_data.csv                  # Indian real estate dataset (in ₹)
├── real_estate_price_prediction.ipynb# Main Jupyter Notebook
├── requirements.txt                  # Python dependencies
├── Procfile                          # Gunicorn WSGI startup configuration
└── .gitignore                        # Git exclusion rules
```

---

## 🚀 How to Run Locally

### 1. Clone repository & install dependencies
```bash
git clone https://github.com/YOUR_USERNAME/house-price-prediction.git
cd house-price-prediction

pip install -r requirements.txt
```
