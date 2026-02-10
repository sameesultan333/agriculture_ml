import os
import pandas as pd
import joblib
from prophet import Prophet
from db import get_connection

MODEL_DIR = "ml/models"


def train_model():
    print("\n🤖 ===============================")
    print("🤖 AUTO TRAINING STARTED")
    print("🤖 ===============================")

    try:
        conn = get_connection()

        df = pd.read_sql_query("""
            SELECT date, vegetable, min_price, max_price
            FROM market_rates
            ORDER BY date
        """, conn)

        conn.close()

        if df.empty:
            print("❌ No market data available")
            return

        print(f"📊 Total rows: {len(df)}")

        # average
        df["y"] = (df["min_price"] + df["max_price"]) / 2
        df["ds"] = pd.to_datetime(df["date"], errors="coerce")

        df = df.dropna(subset=["ds", "y"])

        if df.empty:
            print("❌ No valid rows after cleaning")
            return

        vegetables = df["vegetable"].unique()

        print(f"🥕 Vegetables to train: {len(vegetables)}")

        os.makedirs(MODEL_DIR, exist_ok=True)

        for veg in vegetables:
            veg_df = df[df["vegetable"] == veg][["ds", "y"]]

            unique_days = veg_df["ds"].nunique()

            if unique_days < 2:
                print(f"⚠️ Skipping {veg} → not enough history")
                continue

            print(f"🧠 Training {veg}...")

            model = Prophet()
            model.fit(veg_df)

            path = f"{MODEL_DIR}/{veg}.pkl"
            joblib.dump(model, path)

            print(f"✅ Saved → {veg}.pkl")

        print("\n🏁 Training complete.")

    except Exception as e:
        print("⚠️ Auto training failed:", str(e))

    print("🤖 ===============================\n")
