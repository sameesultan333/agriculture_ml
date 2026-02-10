# ml/training/auto_train.py

import os
import pandas as pd
import joblib
from prophet import Prophet
from db import get_connection

MODEL_PATH = "ml/models/prophet_model.pkl"


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

        # =====================================================
        # BASIC CHECKS
        # =====================================================
        if df.empty:
            print("❌ No market data available")
            return

        print(f"📊 Total rows: {len(df)}")

        # =====================================================
        # CREATE TARGET
        # =====================================================
        df["y"] = (df["min_price"] + df["max_price"]) / 2

        # =====================================================
        # DATE CONVERSION
        # =====================================================
        df["ds"] = pd.to_datetime(df["date"], errors="coerce")

        # remove bad dates
        df = df.dropna(subset=["ds", "y"])

        if df.empty:
            print("❌ All rows invalid after cleaning")
            return

        unique_dates = df["ds"].nunique()
        print(f"📅 Unique days available: {unique_dates}")

        # =====================================================
        # MINIMUM HISTORY PROTECTION
        # =====================================================
        if unique_dates < 2:
            print("❌ Need at least 2 different days to train")
            print("⏳ Waiting for tomorrow's data...")
            return

        # =====================================================
        # FINAL DATA
        # =====================================================
        df = df[["ds", "y"]]

        print("🧠 Training Prophet model...")

        model = Prophet()
        model.fit(df)

        # =====================================================
        # ENSURE MODEL FOLDER EXISTS
        # =====================================================
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

        joblib.dump(model, MODEL_PATH)

        print("✅ Model trained successfully!")
        print("💾 Saved at:", MODEL_PATH)

    except Exception as e:
        print("⚠️ Auto training failed:", str(e))

    print("🤖 ===============================\n")
