CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vegetable TEXT NOT NULL,
    mumbai_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    arrival_date DATE NOT NULL,
    status TEXT DEFAULT 'IN_TRANSIT',
    actual_price REAL,
    profit REAL
);
