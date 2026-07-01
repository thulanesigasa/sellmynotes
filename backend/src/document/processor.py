import fitz  # PyMuPDF
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

def extract_text_from_pdf_bytes(pdf_bytes: bytes, max_pages: int = 10) -> str:
    """
    Extracts text from a PDF byte array. Limits extraction to max_pages to save AI tokens.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        num_pages = min(len(doc), max_pages)
        for i in range(num_pages):
            page = doc.load_page(i)
            text += page.get_text("text") + "\n"
        
        return text.strip()
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}", exc_info=True)
        raise Exception(f"Failed to extract text from PDF: {str(e)}")

def add_watermark_to_pdf(pdf_bytes: bytes, watermark_text: str) -> bytes:
    """
    Adds multiple diagonal small watermarks across all pages of the PDF.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        for page in doc:
            rect = page.rect
            width = rect.width
            height = rect.height
            
            # Add multiple diagonal watermarks in a grid
            for x in range(0, int(width), 150):
                for y in range(0, int(height), 150):
                    page.insert_text(
                        fitz.Point(x, y),
                        watermark_text,
                        fontsize=12,
                        fontname="helv",
                        color=(0.5, 0.5, 0.5), # Gray color
                        fill_opacity=0.3, # 30% opacity
                        rotate=45
                    )
                    
        return doc.write()
    except Exception as e:
        logger.error(f"Error adding watermark: {e}", exc_info=True)
        return pdf_bytes # Fallback to original if watermarking fails
