import psycopg2
from psycopg2.extras import RealDictCursor


def get_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="agri_intel",
        user="postgres",
        password="Sameesultan333"   # 👈 change this
    )
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        vegetable TEXT,
        mumbai_price REAL,
        quantity INTEGER,
        arrival_date TEXT,
        actual_price REAL,
        profit REAL,
        status TEXT DEFAULT 'IN_TRANSIT'
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS market_rates (
        id SERIAL PRIMARY KEY,
        date TEXT,
        vegetable TEXT,
        min_price REAL,
        max_price REAL
    )
    """)

    conn.commit()
    conn.close()
