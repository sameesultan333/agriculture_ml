from fastapi import APIRouter
from ml.inference.predict import predict_price

router = APIRouter(prefix="/ml", tags=["ML"])


@router.get("/predict")
def prediction(vegetable: str, date: str):
    value = predict_price(vegetable, date)

    if value is None:
        return {"error": "Model not trained for this vegetable"}

    return {
        "vegetable": vegetable,
        "date": date,
        "predicted_price": value
    }
