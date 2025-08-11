from dotenv import load_dotenv  # ADD THIS LINE
from fastapi import FastAPI, UploadFile, File, HTTPException
# ... your other imports
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import tempfile
import cv2
import numpy as np
import pytesseract
from pdf2image import convert_from_path
from groq import Groq
import re
from datetime import datetime

load_dotenv()

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class RecipeRequest(BaseModel):
    prompt: str
    recipe_type: str = "recipe"

def enhanced_image_preprocessing(image):
    """Enhanced preprocessing for better OCR accuracy"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply Gaussian blur to reduce noise
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)

    # Apply adaptive thresholding
    thresh = cv2.adaptiveThreshold(
        blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
    )

    # Morphological operations to clean up
    kernel = np.ones((1, 1), np.uint8)
    cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    return cleaned

def detect_table_structure(image):
    """Enhanced table detection for recipe layouts"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Detect horizontal lines
    horizontal_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
    detected_lines = cv2.morphologyEx(gray, cv2.MORPH_OPEN, horizontal_kernel, iterations=2)

    # Detect vertical lines
    vertical_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))
    detected_vertical = cv2.morphologyEx(gray, cv2.MORPH_OPEN, vertical_kernel, iterations=2)

    # Combine lines
    table_mask = cv2.addWeighted(detected_lines, 0.5, detected_vertical, 0.5, 0.0)

    return table_mask

def count_requested_items(prompt):
    """Extract the number of items requested from the prompt"""
    # Look for patterns like "5 courses", "3 appetizers", "6 recipes", etc.
    patterns = [
        r'(\d+)\s*courses?',
        r'(\d+)\s*appetizers?',
        r'(\d+)\s*recipes?',
        r'(\d+)\s*dishes?',
        r'(\d+)\s*items?',
        r'(\d+)\s*cocktails?',
        r'(\d+)\s*desserts?'
    ]

    for pattern in patterns:
        match = re.search(pattern, prompt.lower())
        if match:
            return int(match.group(1))

    return None

def validate_response_completeness(response_text, expected_count):
    """Validate that the response contains the expected number of items"""
    if expected_count is None:
        return True

    # Count numbered items (1., 2., 3., etc.)
    numbered_items = len(re.findall(r'\b\d+\.\s', response_text))

    # Count items with headers/titles
    header_items = len(re.findall(r'\n[A-Z][^.\n]*(?:\n|$)', response_text))

    actual_count = max(numbered_items, header_items)

    print(f"🔍 Expected: {expected_count}, Found: {actual_count}")
    return actual_count >= expected_count

@app.post("/generate-recipe")
async def generate_recipe(request: RecipeRequest):
    try:
        print(f"🍽️  Recipe request: {request.prompt}")
        print(f"📝 Recipe type: {request.recipe_type}")

        # Count requested items
        expected_count = count_requested_items(request.prompt)
        print(f"🔢 Expected items: {expected_count}")

        # Enhanced prompt with explicit completion requirements
        base_prompt = f"""You are a professional chef AI assistant specialized in creating detailed, professional recipes and menus.

CRITICAL COMPLETION REQUIREMENT:
- If the user asks for a specific number of items (e.g., "5 courses", "3 appetizers"), you MUST provide EXACTLY that number
- Number each item clearly (1., 2., 3., etc.)
- Complete ALL requested items before ending your response

User Request: {request.prompt}

Requirements:
- Use metric measurements (grams, ml, celsius)
- Include prep time, cook time, and serving size
- Provide clear, step-by-step instructions
- Suggest Japanese-friendly ingredients when applicable
- Professional presentation suitable for hotel/restaurant use

FORMAT: Structure your response with clear numbering for each requested item."""

        # Determine token limit based on complexity
        token_limit = 1500 if expected_count and expected_count > 3 else 1000
        if expected_count and expected_count >= 5:
            token_limit = 2500

        print(f"🔧 Using token limit: {token_limit}")

        # Generate response with enhanced parameters
        completion = groq_client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional chef AI. Always complete the full request. If asked for N items, provide exactly N items. Never cut responses short."
                },
                {
                    "role": "user",
                    "content": base_prompt
                }
            ],
            max_tokens=token_limit,
            temperature=0.7,
            top_p=0.9,
            frequency_penalty=0.1,
            presence_penalty=0.1
        )

        response_content = completion.choices[0].message.content
        print(f"✅ Generated response length: {len(response_content)} chars")

        # Validate completeness
        is_complete = validate_response_completeness(response_content, expected_count)

        if not is_complete and expected_count:
            print(f"⚠️  Incomplete response detected. Retrying...")

            # Retry with stricter prompt
            retry_prompt = f"""URGENT: Complete the full request. The user asked for {expected_count} items and you MUST provide exactly {expected_count} items.

{base_prompt}

REMEMBER: Provide all {expected_count} items. Number them 1., 2., 3., etc."""

            completion = groq_client.chat.completions.create(
                model="llama3-70b-8192",
                messages=[
                    {
                        "role": "system",
                        "content": f"You MUST provide exactly {expected_count} items. This is critical. Count them as you write."
                    },
                    {
                        "role": "user",
                        "content": retry_prompt
                    }
                ],
                max_tokens=token_limit + 500,  # Extra tokens for retry
                temperature=0.5,  # Lower temperature for more focused response
                top_p=0.8
            )

            response_content = completion.choices[0].message.content
            print(f"🔄 Retry response length: {len(response_content)} chars")

        return {
            "recipe": response_content,
            "timestamp": datetime.now().isoformat(),
            "expected_count": expected_count,
            "validation_passed": validate_response_completeness(response_content, expected_count)
        }

    except Exception as e:
        print(f"❌ Error in recipe generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Recipe generation failed: {str(e)}")

@app.post("/ocr-extract")
async def extract_text_ocr(file: UploadFile = File(...)):
    try:
        print(f"📄 Processing file: {file.filename}")

        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        extracted_text = ""

        try:
            if file.filename.lower().endswith('.pdf'):
                print("🔍 Processing PDF...")
                pages = convert_from_path(temp_file_path, dpi=300)

                for i, page in enumerate(pages):
                    page_array = np.array(page)

                    # Enhanced preprocessing
                    processed_image = enhanced_image_preprocessing(page_array)

                    # OCR with Japanese support
                    custom_config = r'--oem 3 --psm 6 -l jpn+eng'
                    page_text = pytesseract.image_to_string(processed_image, config=custom_config)

                    if page_text.strip():
                        extracted_text += f"\n--- Page {i+1} ---\n{page_text}\n"
                        print(f"✅ Page {i+1}: {len(page_text)} characters extracted")

            else:
                print("🖼️  Processing image...")
                image = cv2.imread(temp_file_path)
                if image is None:
                    raise HTTPException(status_code=400, detail="Invalid image file")

                # Enhanced preprocessing
                processed_image = enhanced_image_preprocessing(image)

                # Table detection
                table_mask = detect_table_structure(image)

                # OCR with Japanese support
                custom_config = r'--oem 3 --psm 6 -l jpn+eng'
                extracted_text = pytesseract.image_to_string(processed_image, config=custom_config)

                print(f"✅ Image processing complete: {len(extracted_text)} characters")

            # Clean up temp file
            os.unlink(temp_file_path)

            if not extracted_text.strip():
                return {"text": "", "warning": "No text could be extracted from the file"}

            print(f"🎯 Total extracted text: {len(extracted_text)} characters")
            return {"text": extracted_text.strip()}

        except Exception as ocr_error:
            os.unlink(temp_file_path)
            print(f"❌ OCR processing error: {str(ocr_error)}")
            raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(ocr_error)}")

    except Exception as e:
        print(f"❌ File processing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File processing failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting MiseAI Backend...")
    print("📡 API will be available at: http://localhost:8000")
    print("📋 Health check: http://localhost:8000/health")
    uvicorn.run(app, host="0.0.0.0", port=8000)
