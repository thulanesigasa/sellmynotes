from PIL import Image
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

def rotate_image(image_bytes: bytes, degrees: int) -> bytes:
    """
    Rotates an image by the given clockwise degrees (90, 180, 270) using Pillow.
    Returns the rotated image as bytes, maintaining the original format.
    """
    if degrees not in [90, 180, 270]:
        return image_bytes

    try:
        # Load image from bytes
        image = Image.open(BytesIO(image_bytes))
        fmt = image.format or "JPEG"

        # Pillow rotate is counter-clockwise. To rotate clockwise by 'degrees':
        # we rotate by (360 - degrees).
        # expand=True ensures the image size adjusts to fit the rotated dimensions.
        rotated_image = image.rotate(360 - degrees, expand=True)

        output = BytesIO()
        rotated_image.save(output, format=fmt)
        rotated_bytes = output.getvalue()
        
        logger.info(f"Successfully rotated upload image by {degrees} degrees. Format: {fmt}")
        return rotated_bytes
        
    except Exception as e:
        logger.error(f"Image rotation failed: {e}", exc_info=True)
        return image_bytes
