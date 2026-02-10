from db import get_connection
from ml.inference.predict import load_model
import pandas as pd


def get_price_chart(vegetable: str, days=7):
    conn = get_connection()

    df = pd.read_sql_query("""
        SELECT date, (min_price + max_price)/2 as price
        FROM market_rates
        WHERE vegetable = %s
        ORDER BY date
    """, conn, params=(vegetable,))

    conn.close()

    if df.empty:
        return None

    history = [
        {"date": str(r["date"]), "price": float(r["price"])}
        for _, r in df.iterrows()
    ]

    model = load_model(vegetable)
    if not model:
        return {"history": history, "forecast": []}

    future = model.make_future_dataframe(periods=days)
    forecast = model.predict(future).tail(days)

    future_data = []
    band = []

    for _, r in forecast.iterrows():
        future_data.append({
            "date": str(r["ds"].date()),
            "price": float(r["yhat"])
        })

        band.append({
            "date": str(r["ds"].date()),
            "low": float(r["yhat_lower"]),
            "high": float(r["yhat_upper"])
        })

    return {
        "history": history,
        "forecast": future_data,
        "band": band
    }
