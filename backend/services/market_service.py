from db import get_connection


def create_rate(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO market_rates (date, vegetable, min_price, max_price)
        VALUES (?, ?, ?, ?)
    """, (
        data.date,
        data.vegetable,
        data.min_price,
        data.max_price
    ))

    conn.commit()
    conn.close()


def get_rates_by_date(date):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM market_rates
        WHERE date = ?
        ORDER BY id DESC
    """, (date,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ⭐ SUPER IMPORTANT FUNCTION
def compare_trade_with_market(trade):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT min_price, max_price
        FROM market_rates
        WHERE vegetable = ? AND date = ?
        ORDER BY id DESC
        LIMIT 1
    """, (trade["vegetable"], trade["arrival_date"]))

    row = cursor.fetchone()
    conn.close()

    if not row:
        return None

    market_avg = (row["min_price"] + row["max_price"]) / 2
    market_profit = (market_avg - trade["mumbai_price"]) * trade["quantity"]
    missed = market_profit - (trade["profit"] or 0)

    return {
        "min_price": row["min_price"],
        "max_price": row["max_price"],
        "market_avg": market_avg,
        "market_profit": market_profit,
        "missed_profit": missed
    }
