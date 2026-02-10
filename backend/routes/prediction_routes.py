from fastapi import APIRouter
from services import prediction_service

router = APIRouter(prefix="/ml", tags=["ML Prediction"])



@router.get("/predict")
def predict(vegetable: str, arrival_date: str, mumbai_price: float):
    return prediction_service.get_prediction(
        vegetable,
        arrival_date,
        mumbai_price
    )