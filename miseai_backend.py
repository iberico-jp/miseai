from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import pdf2image

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Update this path if your 'which pdftoppm' gives a different result
POPPLER_PATH = "/opt/homebrew/bin"

@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        filename = file.filename or ""
        print("Received file type:", file.content_type)
        print("Received filename:", repr(filename))
        if filename.lower().strip().endswith(".pdf"):
            print("Processing as PDF")
            images = pdf2image.convert_from_bytes(contents, poppler_path=POPPLER_PATH)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
        else:
            print("Processing as image")
            image = Image.open(io.BytesIO(contents))
            text = pytesseract.image_to_string(image)
        return {"text": text}
    except Exception as e:
        print(f"OCR error: {e}")
        return {"text": f"OCR error: {e}"}
