from fastapi import APIRouter
from schemas import TradeCreate, ArrivalUpdate
from services import trade_service

router = APIRouter()


@router.post("/trades")
def create_trade(data: TradeCreate):
    trade_service.create_trade(data)
    return {"message": "Trade created"}


@router.get("/trades")
def get_trades():
    rows = trade_service.list_trades()
    return [dict(row) for row in rows]


@router.put("/arrival/{trade_id}")
def arrival(trade_id: int, data: ArrivalUpdate):
    result = trade_service.update_arrival(trade_id, data.actual_price)

    if not result:
        return {"error": "Trade not found"}

    return {"message": "Arrival updated"}


@router.get("/dashboard")
def dashboard():
    return trade_service.get_dashboard_metrics()


@router.get("/analytics/vegetables")
def veg_analytics():
    return trade_service.vegetable_analytics()
