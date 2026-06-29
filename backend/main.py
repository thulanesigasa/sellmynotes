from fastapi import FastAPI

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
