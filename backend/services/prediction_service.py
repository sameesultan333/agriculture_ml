# services/prediction_service.py

from ml.inference.predict import build_intelligence, predict_for_date

from datetime import datetime
import pandas as pd

def get_prediction(vegetable: str, arrival_date: str, mumbai_price: float, qty: int):

    result = predict_for_date(vegetable, arrival_date)

    if not result:
        return {"error": "Model not ready"}

    predicted = result["predicted"]
    lower = result["lower"]
    upper = result["upper"]

    intelligence = build_intelligence(
        predicted,
        lower,
        upper,
        mumbai_price,
        qty
    )

    return {
        "vegetable": vegetable,
        "arrival_date": arrival_date,
        "predicted_price": round(predicted, 2),
        "low": round(lower, 2),
        "high": round(upper, 2),
        **intelligence
    }
