from pydantic import BaseModel
from datetime import date
from typing import Optional


class TradeCreate(BaseModel):
    vegetable: str
    mumbai_price: float
    quantity: int
    arrival_date: date


class ArrivalUpdate(BaseModel):
    actual_price: float


class TradeResponse(BaseModel):
    id: int
    vegetable: str
    mumbai_price: float
    quantity: int
    arrival_date: date
    status: str
    actual_price: Optional[float]
    profit: Optional[float]
class MarketRateCreate(BaseModel):
    date: str
    vegetable: str
    min_price: float
    max_price: float