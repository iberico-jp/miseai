from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import pdf2image
import requests

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... your /ocr/ endpoint ...

@app.post("/structure/")
async def structure(data: dict):
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
