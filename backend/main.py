from fastapi import FastAPI
from routes.trade_routes import router as trade_router
from fastapi.middleware.cors import CORSMiddleware
from db import init_db   # ✅ import from db.py
from routes.market_routes import router as market_router
from routes.prediction_routes import router as prediction_router
from routes.ml_routes import router as ml_router
from routes.ocr_routes import router as ocr_router
from routes.chart_routes import router as chart_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Agri Price Intelligence")


# CORS
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ create tables
init_db()


@app.get("/health")
def health():
    return {"status": "ok"}

app.include_router(market_router)
app.include_router(trade_router)
app.include_router(prediction_router)
app.include_router(ml_router)
app.include_router(ocr_router)
app.include_router(chart_router)