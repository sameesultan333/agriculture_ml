from fastapi import APIRouter
from schemas import MarketRateCreate
from services import market_service

router = APIRouter(prefix="/market", tags=["Market Rates"])


@router.post("/")
def create_market_rate(data: MarketRateCreate):
    market_service.create_rate(data)
    return {"message": "Rate saved"}


@router.get("/{date}")
def get_rates(date: str):
    return market_service.get_rates_by_date(date)
from services.trade_service import list_trades
from services.market_service import compare_trade_with_market


@router.get("/compare")
def compare_all():
    trades = list_trades()

    result = []

    for t in trades:
        if t["status"] != "ARRIVED":
            continue

        comp = compare_trade_with_market(t)

        if comp:
            result.append({
                "trade_id": t["id"],
                "vegetable": t["vegetable"],
                **comp
            })

    return result
