from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import logging
from typing import Optional

from src.lib.supabase_client import supabase
from src.document.processor import extract_text_from_pdf_bytes
from src.ai_engine.openai_client import valuate_notes

# Explicitly load dotenv if we are running locally (fallback)
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SellMyNotes API",
    description="Backend microservice for OCR, PDF generation, and AI valuation.",
    version="0.1.0"
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SellMyNotes microservice is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

class WebhookPayload(BaseModel):
    type: str
    table: str
    record: dict
    schema: str
    old_record: Optional[dict] = None

async def process_note_background(record: dict):
    note_id = record.get("id")
    file_path = record.get("file_path")
    title = record.get("title", "Unknown Title")
    university = record.get("university", "Unknown University")
    
    if not supabase:
        logger.error("Supabase client not configured.")
        return

    try:
        logger.info(f"Downloading {file_path} from Supabase...")
        # 1. Download file bytes from Supabase
        res = supabase.storage.from_("raw_notes").download(file_path)
        pdf_bytes = res
        
        logger.info("Extracting text via PyMuPDF...")
        # 2. Extract Text
        text = extract_text_from_pdf_bytes(pdf_bytes, max_pages=15)
        if not text:
            logger.warning(f"No text extracted for note {note_id}")
            text = "Empty document or scanned image without OCR."

        logger.info("Pinging OpenAI for valuation...")
        # 3. Valuate Notes using AI
        valuation = await valuate_notes(text, title, university)
        suggested_price = valuation.get("suggested_price_zar", 50)
        
        logger.info(f"AI Valuation Complete: R{suggested_price}. Updating Database...")
        # 4. Update Database
        supabase.table("notes").update({
            "price_zar": suggested_price,
            "status": "published"
        }).eq("id", note_id).execute()
        
        logger.info(f"Successfully processed note {note_id}. Status set to 'published'.")
        
    except Exception as e:
        logger.error(f"Error processing note {note_id}: {e}")
        # Optionally update status to 'rejected' if we had a failure state

@app.post("/webhooks/process-note")
async def handle_process_note(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Supabase Webhook endpoint triggered on new 'notes' table inserts.
    """
    if payload.table != "notes" or payload.type != "INSERT":
        raise HTTPException(status_code=400, detail="Invalid webhook trigger type or table")
        
    record = payload.record
    if record.get("status") != "processing":
        return {"message": "Note is not in processing state. Ignored."}
        
    background_tasks.add_task(process_note_background, record)
    
    return {"status": "accepted", "message": f"Processing note {record.get('id')} in background"}
