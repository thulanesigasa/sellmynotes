import fitz  # PyMuPDF
import logging

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
        logger.error(f"Error extracting PDF text: {e}")
        return ""
