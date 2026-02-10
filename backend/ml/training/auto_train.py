import os
import re
import pandas as pd
import joblib
from prophet import Prophet
from db import get_connection

MODEL_DIR = "ml/models"


def safe_filename(name: str):
    """convert vegetable name to valid file name"""
    name = name.upper()
    name = re.sub(r"[^\w]+", "_", name)
    return name


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

        # =====================================================
        # PREPARE TARGET
        # =====================================================
        df["y"] = (df["min_price"] + df["max_price"]) / 2
        df["ds"] = pd.to_datetime(df["date"], errors="coerce")

        df = df.dropna(subset=["ds", "y", "vegetable"])

        if df.empty:
            print("❌ No valid rows after cleaning")
            return

        vegetables = sorted(df["vegetable"].unique())

        print(f"🥕 Vegetables found: {len(vegetables)}")

        os.makedirs(MODEL_DIR, exist_ok=True)

        trained = 0
        skipped = 0

        # =====================================================
        # TRAIN PER VEGETABLE
        # =====================================================
        for veg in vegetables:
            veg_df = df[df["vegetable"] == veg][["ds", "y"]].copy()

            unique_days = veg_df["ds"].nunique()

            if unique_days < 2:
                print(f"⚠️ Skipping {veg} → need at least 2 days")
                skipped += 1
                continue

            try:
                print(f"🧠 Training → {veg} ({unique_days} days)")

                model = Prophet()
                model.fit(veg_df)

                filename = safe_filename(veg) + ".pkl"
                path = os.path.join(MODEL_DIR, filename)

                joblib.dump(model, path)

                print(f"✅ Saved → {filename}")
                trained += 1

            except Exception as veg_error:
                print(f"❌ Failed for {veg}:", veg_error)
                skipped += 1

        print("\n🏁 Training Summary")
        print("✅ Trained:", trained)
        print("⚠️ Skipped:", skipped)

    except Exception as e:
        print("💥 Fatal training error:", str(e))

    print("🤖 ===============================\n")
