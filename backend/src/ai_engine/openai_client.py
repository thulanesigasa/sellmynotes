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
        logger.error(f"OpenAI API Error: {e}")
        # Fallback value if AI fails
        return {"suggested_price_zar": 50, "quality_score": 5, "reasoning": f"Fallback due to AI error: {e}"}
