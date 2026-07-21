from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, BackgroundTasks, Header, Depends, File, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import logging
import os
from typing import Optional
from io import BytesIO
from datetime import datetime

from src.lib.supabase_client import supabase
from src.document.processor import extract_text_from_pdf_bytes, add_watermark_to_pdf
from src.document.image_transformer import rotate_image
from src.ai_engine.openai_client import valuate_notes, analyze_notes_for_upload
from src.ai_engine.vision_client import detect_image_rotation
from src.utils.mailer import send_receipt_email, send_note_published_email

import json

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": record.levelname,
            "message": record.getMessage(),
            "name": record.name
        }
        if record.exc_info:
            log_record["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(log_record)

log_handler = logging.StreamHandler()
log_handler.setFormatter(JSONFormatter())
logging.basicConfig(level=logging.INFO, handlers=[log_handler], force=True)
logger = logging.getLogger(__name__)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="SellMyNotes API",
    description="Backend microservice for OCR, PDF generation, and AI valuation.",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SellMyNotes microservice is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/api/notes/analyze")
async def analyze_uploaded_note(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(None)
):
    """
    Synchronously extracts text (OCR) and runs AI valuation on an uploaded document file.
    """
    if authorization:
        if not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid token format")
        token = authorization.replace("Bearer ", "")
        try:
            # Simple auth check if JWT is provided
            user_res = supabase.auth.get_user(token)
            if not user_res.user:
                raise HTTPException(status_code=401, detail="Unauthorized")
        except Exception as e:
            logger.error(f"Auth error in analyze endpoint: {e}")
            raise HTTPException(status_code=401, detail="Invalid token")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    filename = file.filename.lower()
    text = ""
    straightened_image_url = None
    
    try:
        if filename.endswith(".pdf"):
            logger.info("Extracting text from PDF upload...")
            text = extract_text_from_pdf_bytes(file_bytes, max_pages=15)
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            logger.info("Extracting text from image upload (Mock OCR)...")
            text = "Image-based study notes. Substantial mathematical formulas, diagrams, and handwritten notes visible."
            
            # Detect rotation orientation
            rotation_degrees = await detect_image_rotation(file_bytes)
            if rotation_degrees in [90, 180, 270]:
                file_bytes = rotate_image(file_bytes, rotation_degrees)
                
                # Encode rotated image bytes to base64 data URL
                import base64
                mime_type = "image/png" if filename.endswith(".png") else "image/jpeg"
                b64_data = base64.b64encode(file_bytes).decode("utf-8")
                straightened_image_url = f"data:{mime_type};base64,{b64_data}"
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, JPG, or PNG.")

        if not text:
            text = "Empty document or scanned image without searchable text."
            
    except Exception as ocr_err:
        logger.error(f"OCR/Extraction failure: {ocr_err}")
        raise HTTPException(status_code=500, detail=f"OCR processing failed: {str(ocr_err)}")

    try:
        logger.info("Calling OpenAI for real-time note analysis...")
        valuation = await analyze_notes_for_upload(text, file.filename)
        
        suggested_price = valuation.get("suggested_price_zar", 50)
        final_price = min(round(suggested_price * 1.40, 2), 54.76)
        
        desc = valuation.get("suggested_description")
        if not desc or len(desc.strip()) < 10:
            desc = "### Study Notes Summary\n- **Comprehensive Material:** Detailed coverage of course lectures and modules.\n- **Preparation Resource:** Perfect for exam review and homework practice."

        return {
            "status": "success",
            "ocr_text": text[:50000],
            "straightened_image": straightened_image_url,
            "extracted_metadata": {
                "title": valuation.get("suggested_title", file.filename.split(".")[0].replace("_", " ").title()),
                "institution": valuation.get("suggested_institution", ""),
                "course_code": valuation.get("suggested_course_code", ""),
                "description": desc,
                "ai_review_comment": valuation.get("ai_review_comment", "Excellent comprehensive lecture notes with clear topic structures."),
                "ai_review_rating": valuation.get("ai_review_rating", 5)
            },
            "valuation": {
                "base_price_zar": suggested_price,
                "final_price_zar": final_price,
                "quality_score": valuation.get("quality_score", 5),
                "reasoning": valuation.get("reasoning", "High quality comprehensive study notes.")
            }
        }
    except Exception as ai_err:
        logger.error(f"AI Valuation failure: {ai_err}")
        raise HTTPException(status_code=500, detail=f"Valuation failed: {str(ai_err)}")

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
        res = supabase.storage.from_("raw_notes").download(file_path)
        pdf_bytes = res
        
        logger.info("Extracting text via PyMuPDF...")
        text = extract_text_from_pdf_bytes(pdf_bytes, max_pages=15)
        if not text:
            logger.warning(f"No text extracted for note {note_id}")
            text = "Empty document or scanned image without OCR."

        logger.info("Pinging OpenAI for valuation...")
        valuation = await valuate_notes(text, title, institution)
        suggested_price = valuation.get("suggested_price_zar", 50)
        
        final_price = round(suggested_price * 1.40, 2)
        
        logger.info(f"Smart Valuation Complete. Base: R{suggested_price}, Final: R{final_price}. Updating Database...")
        supabase.table("notes").update({
            "price_zar": final_price,
            "status": "draft"
        }).eq("id", note_id).execute()
        
        logger.info(f"Successfully processed note {note_id}. Status set to 'draft'.")
        
    except Exception as e:
        logger.error(f"FATAL ERROR processing note {note_id}: {e}", exc_info=True)
        try:
            supabase.table("notes").update({
                "status": "failed",
                "description": f"Failed to process document automatically. Support team notified."
            }).eq("id", note_id).execute()
            logger.info(f"Note {note_id} marked as 'failed' due to processing failure.")
        except Exception as db_err:
            logger.error(f"Failed to update note status to 'failed' for {note_id}: {db_err}", exc_info=True)


@app.post("/webhooks/process-note")
async def handle_process_note(
    payload: WebhookPayload, 
    background_tasks: BackgroundTasks,
    x_webhook_secret: Optional[str] = Header(None)
):
    """
    Supabase Webhook endpoint triggered on new 'notes' table inserts.
    """
    secret = os.environ.get("WEBHOOK_SECRET", "super-secret-key-123")
    if secret and x_webhook_secret != secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    if payload.table != "notes" or payload.type != "INSERT":
        raise HTTPException(status_code=400, detail="Invalid webhook trigger type or table")
        
    record = payload.record
    if record.get("status") != "processing":
        return {"message": "Note is not in processing state. Ignored."}
        
    background_tasks.add_task(process_note_background, record)
    
    return {"status": "accepted", "message": f"Processing note {record.get('id')} in background"}

async def handle_published_email_background(record: dict):
    note_id = record.get("id")
    seller_id = record.get("seller_id")
    title = record.get("title", "Your Note")
    
    if not supabase or not seller_id:
        return
        
    # 1. Fetch seller email & notify
    try:
        user_res = supabase.auth.admin.get_user_by_id(seller_id)
        seller_email = user_res.user.email
        if seller_email:
            note_url = f"https://sellmynotes.co.za/note/{note_id}"
            await send_note_published_email(seller_email, title, note_url)
    except Exception as e:
        logger.error(f"Failed to fetch seller email or send publish notification for {note_id}: {e}")

    # 2. Auto-insert AI review if comments/ratings exist
    ai_comment = record.get("ai_review_comment")
    ai_rating = record.get("ai_review_rating")
    if ai_comment and ai_rating:
        try:
            # Prevent duplicate review insertions
            existing = supabase.table("reviews").select("id").eq("note_id", note_id).is_("buyer_id", "null").execute()
            if not existing.data:
                supabase.table("reviews").insert({
                    "note_id": note_id,
                    "buyer_id": None, # NULL indicates platform AI reviewer
                    "rating": ai_rating,
                    "comment": ai_comment
                }).execute()
                logger.info(f"Successfully inserted automated AI review for note {note_id}")
        except Exception as rev_err:
            logger.error(f"Failed to auto-insert AI review for {note_id}: {rev_err}", exc_info=True)

@app.post("/webhooks/note-published")
async def handle_note_published(
    payload: WebhookPayload, 
    background_tasks: BackgroundTasks,
    x_webhook_secret: Optional[str] = Header(None)
):
    """
    Supabase Webhook endpoint triggered on 'notes' table status updates to 'published'.
    """
    secret = os.environ.get("WEBHOOK_SECRET", "super-secret-key-123")
    if secret and x_webhook_secret != secret:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    if payload.table != "notes" or payload.type != "UPDATE":
        raise HTTPException(status_code=400, detail="Invalid webhook trigger type or table")
        
    record = payload.record
    old_record = payload.old_record or {}
    
    # Check if status changed to published
    if record.get("status") == "published" and old_record.get("status") != "published":
        background_tasks.add_task(handle_published_email_background, record)
        return {"status": "accepted", "message": f"Sending published email for note {record.get('id')}"}
        
    return {"message": "Not a status change to published. Ignored."}

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

    # 5. Release Escrow & send receipt email
    buyer_email = user.email or "buyer@student.co.za"
    note_amount = purchase.get("amount_zar", 0)
    note_title_str = purchase.get("notes", {}).get("file_path", "Note").split("/")[-1]

    if purchase.get("status") == "completed":
        supabase.table("purchases").update({"status": "released"}).eq("id", purchase_id).execute()
        logger.info(f"Escrow released for purchase {purchase_id}")

        # Generate a 24-hour signed URL pointing to the delivery page (browser download)
        download_url = f"https://sellmynotes.co.za/library"
        try:
            signed = supabase.storage.from_("raw_notes").create_signed_url(file_path, expires_in=86400)
            if signed and signed.get("signedURL"):
                download_url = signed["signedURL"]
        except Exception as sign_err:
            logger.warning(f"Could not generate signed URL for email: {sign_err}")

        # Fire-and-forget receipt email (non-blocking)
        import asyncio
        asyncio.create_task(
            send_receipt_email(
                to_email=buyer_email,
                note_title=note_title_str,
                amount_zar=note_amount,
                purchase_id=purchase_id,
                download_url=download_url,
            )
        )

    # 6. Stream Response
    return StreamingResponse(
        BytesIO(watermarked_pdf),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="watermarked_{purchase_id}.pdf"'
        }
    )

