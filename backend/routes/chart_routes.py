from fastapi import APIRouter
from services.chart_service import get_price_chart

router = APIRouter(prefix="/chart", tags=["Charts"])


@router.get("/{vegetable}")
def chart(vegetable: str, days: int = 7):
    data = get_price_chart(vegetable, days)

    if not data:
        return {"error": "No data"}

    return data
