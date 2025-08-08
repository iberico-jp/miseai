from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import pdf2image
import requests

app = FastAPI()

# Allow all CORS (safe for dev; restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MiseAI - Mobile AI Assistant for Chefs
# Digitize, edit, and share recipes, kitchen events, and inventory - optimized for the modern chef workflow.

@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded image or PDF file using OCR.
    """
    try:
        contents = await file.read()
        filename = file.filename or ""
        # PDF support
        if filename.lower().strip().endswith(".pdf"):
            images = pdf2image.convert_from_bytes(contents)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
        else:
            image = Image.open(io.BytesIO(contents))
            text = pytesseract.image_to_string(image)
        return {"text": text}
    except Exception as e:
        return {"text": f"OCR error: {e}"}

@app.post("/structure/")
async def structure(data: dict):
    """
    Sends OCR text to a local LLM (Ollama) for AI structuring of recipes.
    """
    prompt = (
        "Extract all ingredients (with quantity and unit) and all step-by-step instructions "
        "from this recipe as JSON with keys 'ingredients' and 'steps'.\n\n"
        f"{data['text']}\n\nOutput:"
    )
    try:
        response = requests.post(
            'http://localhost:11434/api/generate',
            json={'model': 'llama3', 'prompt': prompt, 'stream': False}
        )
        return {"structured": response.json().get('response', response.text)}
    except Exception as e:
        return {"structured": f"AI error: {e}"}
