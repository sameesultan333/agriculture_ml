from fastapi import APIRouter
from services import prediction_service

router = APIRouter(prefix="/ml", tags=["ML Prediction"])


@router.get("/predict")
def predict():
    return prediction_service.get_prediction()
