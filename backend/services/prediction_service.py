# services/prediction_service.py

from ml.inference.predict import predict_price, load_model, build_intelligence
from datetime import datetime
import pandas as pd


def get_prediction(vegetable: str, arrival_date: str, mumbai_price: float):

    model = load_model(vegetable)

    if not model:
        return {"error": "Model not available for this vegetable"}

    future = pd.DataFrame({
        "ds": pd.to_datetime([arrival_date])
    })

    forecast = model.predict(future)

    predicted = float(forecast["yhat"].iloc[0])
    lower = float(forecast["yhat_lower"].iloc[0])
    upper = float(forecast["yhat_upper"].iloc[0])

    intelligence = build_intelligence(predicted, lower, upper, mumbai_price)

    return {
        "vegetable": vegetable,
        "arrival_date": arrival_date,
        "predicted_price": round(predicted, 2),
        "low": round(lower, 2),
        "high": round(upper, 2),
        **intelligence
    }
