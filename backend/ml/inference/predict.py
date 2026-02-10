import joblib
import pandas as pd
from datetime import datetime, timedelta
import pickle
from pathlib import Path

MODEL_PATH = "ml/models/prophet_model.pkl"


def predict_next(days=1):
    try:
        model = joblib.load(MODEL_PATH)
    except:
        return None

    future_date = datetime.today() + timedelta(days=days)

    future = pd.DataFrame({
        "ds": [future_date]
    })

    forecast = model.predict(future)

    return {
        "date": future_date.strftime("%Y-%m-%d"),
        "predicted_price": round(forecast["yhat"].iloc[0], 2),
        "low": round(forecast["yhat_lower"].iloc[0], 2),
        "high": round(forecast["yhat_upper"].iloc[0], 2),
    }



MODEL_DIR = Path(__file__).resolve().parent.parent / "models"


def load_model(vegetable):
    model_path = MODEL_DIR / f"{vegetable}.pkl"

    if not model_path.exists():
        return None

    with open(model_path, "rb") as f:
        model = pickle.load(f)

    return model


def predict_price(vegetable: str, target_date: str):
    model = load_model(vegetable)

    if not model:
        return None

    future = pd.DataFrame({
        "ds": pd.to_datetime([target_date], yearfirst=True)
    })

    forecast = model.predict(future)

    return float(forecast["yhat"].iloc[0])
