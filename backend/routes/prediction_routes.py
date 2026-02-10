from fastapi import APIRouter
from services.prediction_service import get_prediction

router = APIRouter(prefix="/ml", tags=["ML Prediction"])


@router.get("/predict")
def predict(
    vegetable: str,
    arrival_date: str,
    mumbai_price: float,
    qty: int
):
    return get_prediction(vegetable, arrival_date, mumbai_price, qty)
