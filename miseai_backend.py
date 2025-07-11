from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import requests

app = FastAPI()

# Allow CORS for local development (so frontend can talk to backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local dev; restrict in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read()))
    text = pytesseract.image_to_string(image)
    return {"text": text}

@app.post("/structure/")
async def structure(data: dict):
    prompt = (
        "Extract all ingredients (with quantity and unit) and all step-by-step instructions "
        "from this recipe as JSON with keys 'ingredients' and 'steps'.\n\n"
        f"{data['text']}\n\nOutput:"
    )
    response = requests.post(
        'http://localhost:11434/api/generate',
        json={'model': 'llama3', 'prompt': prompt, 'stream': False}
    )
    return {"structured": response.json()['response']}
