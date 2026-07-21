import os
import base64
import json
import logging
from .openai_client import client

logger = logging.getLogger(__name__)

async def detect_image_rotation(image_bytes: bytes) -> int:
    """
    Analyzes the orientation of text inside an image using GPT-4o-mini Vision.
    Returns the clockwise rotation needed: 0, 90, 180, or 270 degrees.
    """
    if not client:
        logger.error("OpenAI client not initialized. Missing API Key.")
        return 0

    try:
        # Encode image bytes to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        system_prompt = (
            "You are an expert academic document layout analyzer.\n"
            "Analyze the orientation of the text inside the uploaded image of a study note.\n"
            "Determine if the image needs rotation to align the text properly so it is readable horizontally (left-to-right).\n"
            "Choose the clockwise rotation angle in degrees needed to make the words straight.\n"
            "The only allowed values are: 0, 90, 180, 270.\n"
            "Respond strictly in JSON format with exactly this key: \"rotation_degrees\" (integer)."
        )

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": system_prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}",
                                "detail": "low"
                            }
                        }
                    ]
                }
            ],
            response_format={"type": "json_object"}
        )

        result_content = response.choices[0].message.content
        if not result_content:
            raise ValueError("Empty response from OpenAI Vision")

        data = json.loads(result_content)
        rotation = data.get("rotation_degrees", 0)
        
        if rotation not in [0, 90, 180, 270]:
            logger.warning(f"Unexpected rotation angle returned by AI: {rotation}. Defaulting to 0.")
            return 0
            
        logger.info(f"AI Vision rotation detection output: {rotation} degrees")
        return rotation
        
    except Exception as e:
        logger.error(f"OpenAI Vision analysis failure: {e}", exc_info=True)
        return 0
