from fastapi import APIRouter
from ml.inference.predict import predict_for_date

router = APIRouter(prefix="/ml", tags=["ML"])


@router.get("/predict")
def prediction(vegetable: str, date: str):
    value = predict_for_date(date)

    if value is None:
        return {"error": "Model not trained for this vegetable"}

    return {
        "vegetable": vegetable,
        "date": date,
        "predicted_price": value
    }
