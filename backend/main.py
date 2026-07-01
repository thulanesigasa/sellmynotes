from fastapi import FastAPI, HTTPException, BackgroundTasks, Header, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import logging
from typing import Optional
from io import BytesIO
from datetime import datetime

from src.lib.supabase_client import supabase
from src.document.processor import extract_text_from_pdf_bytes, add_watermark_to_pdf
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
    institution = record.get("institution", "Unknown Institution")
    
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
        valuation = await valuate_notes(text, title, institution)
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

@app.get("/delivery/download/{purchase_id}")
async def download_watermarked_note(purchase_id: str, authorization: str = Header(...)):
    """
    Validates ownership, adds a dynamic watermark, releases escrow, and serves the PDF.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.replace("Bearer ", "")
    
    # 1. Verify User
    try:
        user_res = supabase.auth.get_user(token)
        user = user_res.user
        if not user:
            raise HTTPException(status_code=401, detail="Unauthorized")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

    # 2. Fetch Purchase and verify ownership
    purchase_res = supabase.table("purchases").select("*, notes(file_path)").eq("id", purchase_id).single().execute()
    purchase = purchase_res.data
    
    if not purchase:
        raise HTTPException(status_code=404, detail="Purchase not found")
        
    if purchase.get("buyer_id") != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
        
    if purchase.get("status") not in ["completed", "released"]:
        raise HTTPException(status_code=402, detail="Payment not completed")

    # 3. Fetch raw PDF
    file_path = purchase.get("notes", {}).get("file_path")
    if not file_path:
        raise HTTPException(status_code=404, detail="File path missing")

    try:
        pdf_bytes = supabase.storage.from_("raw_notes").download(file_path)
    except Exception as e:
        logger.error(f"Error downloading from storage: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve document")

    # 4. Watermark PDF
    buyer_email = user.email or "Buyer"
    date_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    watermark_text = f"Purchased by {buyer_email} on {date_str}"
    
    watermarked_pdf = add_watermark_to_pdf(pdf_bytes, watermark_text)

    # 5. Release Escrow
    if purchase.get("status") == "completed":
        supabase.table("purchases").update({"status": "released"}).eq("id", purchase_id).execute()

    # 6. Stream Response
    return StreamingResponse(
        BytesIO(watermarked_pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"inline; filename=\"watermarked_{purchase_id}.pdf\""
        }
    )

