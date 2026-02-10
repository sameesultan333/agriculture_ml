import sys
import os

# add backend root to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

import pandas as pd
from prophet import Prophet
import joblib
from db import get_connection
from prophet.plot import plot_plotly
import plotly.offline as pyo

MODEL_PATH = "ml/models/prophet_model.pkl"


def train_model():
    conn = get_connection()

    df = pd.read_sql_query("""
        SELECT date, vegetable, min_price, max_price
        FROM market_rates
    """, conn)

    conn.close()

    if df.empty:
        print("No data to train")
        return

    # ⭐ average market price
    df["y"] = (df["min_price"] + df["max_price"]) / 2
    df["ds"] = pd.to_datetime(df["date"], format="mixed", yearfirst=True)



    df = df[["ds", "y"]]

    model = Prophet()
    model.fit(df)
    future = model.make_future_dataframe(periods=30)
    forecast = model.predict(future)
    fig = model.plot(forecast)
    fig.show()


    joblib.dump(model, MODEL_PATH)

    print("Model trained & saved ✅")


if __name__ == "__main__":
    train_model()
