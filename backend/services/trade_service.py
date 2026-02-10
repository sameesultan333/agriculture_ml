from db import get_connection


# ================================
# HELPERS
# ================================
def calculate_profit(mumbai_price, actual_price, quantity):
    return (actual_price - mumbai_price) * quantity


def rows_to_dict(cursor, rows):
    columns = [desc[0] for desc in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


# ================================
# TRADE SERVICES
# ================================

def create_trade(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO trades (vegetable, mumbai_price, quantity, arrival_date)
        VALUES (%s, %s, %s, %s)
    """, (
        data.vegetable,
        data.mumbai_price,
        data.quantity,
        data.arrival_date
    ))

    conn.commit()
    conn.close()


def list_trades():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT t.*,
               m.min_price AS market_min,
               m.max_price AS market_max
        FROM trades t
        LEFT JOIN market_rates m
            ON t.vegetable = m.vegetable
           AND t.arrival_date = m.date
        ORDER BY t.id DESC
    """)

    rows = cursor.fetchall()
    result = rows_to_dict(cursor, rows)

    conn.close()
    return result


def update_arrival(trade_id, actual_price):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT mumbai_price, quantity FROM trades WHERE id = %s",
        (trade_id,)
    )

    row = cursor.fetchone()

    if not row:
        conn.close()
        return None

    mumbai_price, quantity = row
    profit = calculate_profit(mumbai_price, actual_price, quantity)

    cursor.execute("""
        UPDATE trades
        SET actual_price = %s, profit = %s, status = 'ARRIVED'
        WHERE id = %s
    """, (actual_price, profit, trade_id))

    conn.commit()
    conn.close()
    return True


# ================================
# DASHBOARD
# ================================
def get_dashboard_metrics():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM trades")
    total = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM trades WHERE status = 'IN_TRANSIT'")
    in_transit = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM trades WHERE status = 'ARRIVED'")
    arrived = cursor.fetchone()[0]

    cursor.execute("SELECT COALESCE(SUM(profit), 0) FROM trades")
    total_profit = cursor.fetchone()[0]

    conn.close()

    return {
        "total_trades": total,
        "in_transit": in_transit,
        "arrived": arrived,
        "total_profit": total_profit
    }


# ================================
# ANALYTICS
# ================================
def vegetable_analytics():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT vegetable,
               COUNT(*) as total_trades,
               COALESCE(SUM(profit), 0) as total_profit
        FROM trades
        GROUP BY vegetable
    """)

    rows = cursor.fetchall()
    result = rows_to_dict(cursor, rows)

    conn.close()
    return result


# ================================
# MARKET RATE SERVICES
# ================================

def create_market_rate(data):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO market_rates (date, vegetable, min_price, max_price)
        VALUES (%s, %s, %s, %s)
    """, (
        data.date,
        data.vegetable,
        data.min_price,
        data.max_price
    ))

    conn.commit()
    conn.close()


def list_market_rates():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM market_rates
        ORDER BY date DESC
    """)

    rows = cursor.fetchall()
    result = rows_to_dict(cursor, rows)

    conn.close()
    return result
