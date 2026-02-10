# services/market_service.py
from ml.training.auto_train import train_model
from db import get_connection


# =====================================================
# CREATE MARKET RATE
# =====================================================
def create_rate(data):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Convert data to dict if it's a Pydantic model
    if hasattr(data, 'dict'):
        data_dict = data.dict()
    else:
        data_dict = data
    
    # Extract values with defaults
    date = data_dict.get('date')
    vegetable = data_dict.get('vegetable')
    packing = data_dict.get('packing', "N/A")  # Default to "N/A" if missing
    min_price = data_dict.get('min_price')
    max_price = data_dict.get('max_price')
    
    # Validate required fields
    if not all([date, vegetable, min_price is not None, max_price is not None]):
        raise ValueError("Missing required fields")
    
    cursor.execute("""
        INSERT INTO market_rates (date, vegetable, packing, min_price, max_price)
        VALUES (%s, %s, %s, %s, %s)
    """, (date, vegetable, packing, min_price, max_price))

    conn.commit()
    conn.close()
       # 🤖 AUTO TRAIN MODEL
    try:
        print("🔥 New data inserted. Starting training...")
        train_model()
        print("✅ Training finished.")
    except Exception as e:
        print("⚠️ Auto training failed:", str(e))
# =====================================================
# GET RATES BY DATE
# =====================================================
def get_rates_by_date(date):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, date, vegetable, packing, min_price, max_price
        FROM market_rates
        WHERE date = %s
        ORDER BY id DESC
    """, (date,))

    rows = cursor.fetchall()
    conn.close()

    result = []
    for i, r in enumerate(rows, start=1):
        result.append({
            "sl_no": i,  # ⭐ serial number for UI
            "id": r[0],
            "date": r[1],
            "vegetable": r[2],
            "packing": r[3],
            "min_price": r[4],
            "max_price": r[5],
        })

    return result


# =====================================================
# GET LATEST RATE FOR VEGETABLE
# =====================================================
def get_latest_rate(vegetable, date):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT min_price, max_price
        FROM market_rates
        WHERE vegetable = %s AND date = %s
        ORDER BY id DESC
        LIMIT 1
    """, (vegetable, date))

    row = cursor.fetchone()
    conn.close()

    return row


# =====================================================
# ⭐ SUPER IMPORTANT – TRADE VS MARKET
# =====================================================
def compare_trade_with_market(trade):
    row = get_latest_rate(trade["vegetable"], trade["arrival_date"])

    if not row:
        return None

    min_price, max_price = row

    market_avg = (min_price + max_price) / 2
    market_profit = (market_avg - trade["mumbai_price"]) * trade["quantity"]
    missed = market_profit - (trade["profit"] or 0)

    return {
        "min_price": min_price,
        "max_price": max_price,
        "market_avg": market_avg,
        "market_profit": market_profit,
        "missed_profit": missed
    }




