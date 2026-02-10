from ml.inference.predict import predict_next


def get_prediction():
    result = predict_next()

    if not result:
        return {"error": "Model not trained"}

    return result
