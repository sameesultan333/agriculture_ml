import joblib
import pandas as pd
from pathlib import Path
import os

MODEL_DIR = "ml/models"

# ==============================
# LOAD MODEL
# ==============================


def load_model(vegetable: str):
    path = os.path.join(MODEL_DIR, f"{vegetable}.pkl")

    if not os.path.exists(path):
        return None

    return joblib.load(path)

# ==============================
# PREDICT FOR A DATE
# ==============================

def predict_for_date(vegetable: str, target_date: str):
    model = load_model(vegetable)

    if not model:
        return None

    future = pd.DataFrame({
        "ds": pd.to_datetime([target_date])
    })

    forecast = model.predict(future)

    return {
        "predicted": float(forecast["yhat"].iloc[0]),
        "lower": float(forecast["yhat_lower"].iloc[0]),
        "upper": float(forecast["yhat_upper"].iloc[0]),
    }

# ==============================
# BUSINESS INTELLIGENCE
# ==============================
def build_intelligence(predicted, lower, upper, mumbai_price, qty):
    diff = predicted - mumbai_price

    trend = "UP 📈" if diff > 0 else "DOWN 📉"
    decision = "BUY ✅" if diff > 0 else "WAIT ⚠️"

    risk = upper - lower
    anomaly = abs(diff) > (predicted * 0.25)

    expected_profit = diff * qty

    return {
        "trend": trend,
        "decision": decision,
        "risk": round(risk, 2),
        "anomaly": anomaly,
        "expected_profit": round(expected_profit, 2)
    }
