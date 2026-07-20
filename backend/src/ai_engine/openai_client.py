import os
import json
import logging
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Fetch API key securely from environment
api_key = os.environ.get("OPENAI_API_KEY")
client = AsyncOpenAI(api_key=api_key) if api_key else None

async def valuate_notes(text: str, title: str, institution: str) -> dict:
    """
    Analyzes extracted text using OpenAI and determines a ZAR value.
    Expects a JSON response.
    """
    if not client:
        logger.error("OpenAI client not initialized. Missing API Key.")
        return {"suggested_price_zar": 50, "quality_score": 5, "reasoning": "Fallback due to missing API Key."}
        
    system_prompt = (
        "You are an expert academic evaluator for a South African student marketplace. "
        "Analyze the provided text snippet from a set of study notes. "
        "Determine a fair market value in ZAR (South African Rand) between R50 and R300 based on detail, "
        "clarity, and perceived effort. Respond strictly in JSON format with exactly these keys: "
        "'suggested_price_zar' (integer), 'quality_score' (1-10 integer), and 'reasoning' (string)."
    )
    
    user_prompt = f"Title: {title}\nInstitution: {institution}\n\nExcerpt:\n{text[:4000]}"
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        if not result_content:
             raise ValueError("Empty response from OpenAI")
             
        return json.loads(result_content)
    except Exception as e:
        logger.error(f"OpenAI API Error: {e}", exc_info=True)
        raise Exception(f"OpenAI Valuation failed: {str(e)}")

async def analyze_notes_for_upload(text: str, filename: str) -> dict:
    """
    Extracts metadata (title, institution, course code, description) and valuates note quality/price.
    Expects a JSON response.
    """
    if not client:
        logger.error("OpenAI client not initialized. Missing API Key.")
        return {
            "suggested_title": filename.split(".")[0].replace("_", " ").title(),
            "suggested_institution": "",
            "suggested_course_code": "",
            "suggested_description": "Study notes uploaded from document.",
            "suggested_price_zar": 50,
            "quality_score": 5,
            "reasoning": "Fallback due to missing API Key."
        }
        
    system_prompt = (
        "You are an AI note analyzer on a South African student peer-to-peer marketplace. "
        "Your task is to analyze the text snippet of an uploaded note and extract standard metadata. "
        "Determine:\n"
        "1. A clean, descriptive 'suggested_title' (e.g. 'Intro to Microeconomics Summary').\n"
        "2. The South African 'suggested_institution' if mentioned (e.g. 'University of Cape Town', 'Stellenbosch University', 'UNISA', etc.).\n"
        "3. The 'suggested_course_code' if mentioned (e.g. 'ECO1010F', 'COS1511', 'INF1002S'). Normalize to uppercase with no spaces.\n"
        "4. A clean 'suggested_description' summarizing the key chapters/topics covered in a professional tone.\n"
        "5. A fair base market value in ZAR 'suggested_price_zar' (integer between R50 and R300) based on detail and neatness.\n"
        "6. A 'quality_score' (1-10 integer).\n"
        "7. A brief 'reasoning' (string) explaining the suggested price.\n\n"
        "Respond strictly in JSON format matching these exact keys."
    )
    
    user_prompt = f"Filename: {filename}\n\nExcerpt:\n{text[:4000]}"
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        result_content = response.choices[0].message.content
        if not result_content:
             raise ValueError("Empty response from OpenAI")
             
        return json.loads(result_content)
    except Exception as e:
        logger.error(f"OpenAI API Error in analyze: {e}", exc_info=True)
        raise Exception(f"OpenAI Analysis failed: {str(e)}")
