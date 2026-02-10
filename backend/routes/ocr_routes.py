from fastapi import APIRouter, UploadFile, File
import shutil
import os
from services.ocr_service import extract_market_rates
import pytesseract

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

router = APIRouter(prefix="/ocr", tags=["OCR"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
def upload_image(file: UploadFile = File(...)):
    path = os.path.join(UPLOAD_DIR, file.filename)


    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    data = extract_market_rates(path)

    return data
