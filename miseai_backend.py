from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image
import io
import pdf2image
import requests
import os
from pydantic import BaseModel

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MiseAI - Professional Kitchen AI Assistant
# OCR + AI-powered recipe digitization and kitchen workflow optimization

class StructureRequest(BaseModel):
    text: str

@app.post("/ocr/")
async def ocr(file: UploadFile = File(...)):
    """
    Extracts text from uploaded images or PDFs using OCR.
    Supports: JPG, PNG, PDF, and other image formats.
    """
    try:
        contents = await file.read()
        filename = file.filename or ""

        if filename.lower().endswith(".pdf"):
            # Multi-page PDF support
            images = pdf2image.convert_from_bytes(contents)
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
        else:
            # Image file processing
            image = Image.open(io.BytesIO(contents))
            text = pytesseract.image_to_string(image)

        return {
            "text": text.strip(),
            "filename": filename,
            "success": True
        }
    except Exception as e:
        return {
            "text": "",
            "error": f"OCR processing failed: {str(e)}",
            "success": False
        }

@app.post("/structure/")
async def structure_recipe(data: StructureRequest):
    """
    Uses Groq AI to structure raw recipe text into organized JSON format.
    Optimized for professional kitchen workflows with metric units.
    """
    if not data.text.strip():
        return {"error": "No text provided", "success": False}

    # Enhanced prompt for professional kitchen use
    prompt = f"""
    You are a professional chef assistant. Extract and structure this recipe text into clean JSON format.

    Requirements:
    - Use ONLY metric units (kg, g, l, ml, cm, °C)
    - Separate ingredients with quantities and units
    - Break down instructions into clear, numbered steps
    - Include cooking times and temperatures where mentioned
    - Identify any allergens or dietary restrictions

    Recipe text:
    {data.text}

    Return JSON with this exact structure:
    {{
        "title": "Recipe name or 'Untitled Recipe'",
        "servings": "Number of servings if mentioned",
        "prep_time": "Preparation time if mentioned",
        "cook_time": "Cooking time if mentioned",
        "ingredients": [
            {{"item": "ingredient name", "quantity": "amount", "unit": "metric unit", "notes": "any prep notes"}}
        ],
        "instructions": [
            {{"step": 1, "action": "detailed instruction", "time": "timing if specified", "temp": "temperature if specified"}}
        ],
        "allergens": ["list of allergens if mentioned"],
        "dietary": ["vegetarian/vegan/gluten-free etc if applicable"]
    }}
    """

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            json={
                "model": "llama3-70b-8192",
                "messages": [
                    {"role": "system", "content": "You are a professional chef assistant specialized in recipe structuring. Always use metric units and provide clear, actionable instructions."},
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 1500,
                "temperature": 0.3
            },
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {os.getenv('GROQ_API_KEY')}"
            },
            timeout=30
        )

        if response.status_code == 200:
            ai_response = response.json()
            structured_content = ai_response.get('choices', [{}])[0].get('message', {}).get('content', '')

            return {
                "structured": structured_content,
                "raw_text": data.text,
                "success": True,
                "model": "groq-llama3-70b"
            }
        else:
            return {
                "error": f"Groq API error: {response.status_code}",
                "success": False
            }

    except requests.exceptions.Timeout:
        return {"error": "AI processing timeout - try with shorter text", "success": False}
    except Exception as e:
        return {"error": f"AI structuring failed: {str(e)}", "success": False}

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "service": "MiseAI Backend",
        "ai_provider": "Groq",
        "ocr_engine": "Tesseract"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
