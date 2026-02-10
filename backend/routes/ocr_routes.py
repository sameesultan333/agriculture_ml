from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from services.ocr_service import extract_market_rates
import pytesseract
from fastapi.responses import JSONResponse

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

router = APIRouter(prefix="/ocr", tags=["OCR"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        print(f"\n{'='*60}")
        print(f"OCR UPLOAD REQUEST: {file.filename}")
        print(f"{'='*60}")
        
        # Save uploaded file
        path = os.path.join(UPLOAD_DIR, file.filename)
        
        with open(path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"File saved to: {path}")
        print(f"File size: {os.path.getsize(path)} bytes")
        
        # Extract data with detailed logging
        print("\nStarting OCR extraction...")
        data = extract_market_rates(path)
        
        print(f"\nOCR COMPLETE: Found {len(data)} items")
        
        if len(data) == 0:
            print("WARNING: No data extracted!")
            # Return empty array instead of raising error
            return JSONResponse(content=[], status_code=200)
        
        return data
        
    except Exception as e:
        print(f"\n❌ ERROR in OCR processing:")
        import traceback
        traceback.print_exc()
        
        # Return empty array with error info
        error_response = {
            "error": str(e),
            "items": []
        }
        return JSONResponse(content=[], status_code=200)