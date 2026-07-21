import os
import sys
from io import BytesIO
from PIL import Image

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.document.image_transformer import rotate_image

def verify():
    # 1. Create a dummy image of size 100x200
    img = Image.new('RGB', (100, 200), color = 'red')
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='JPEG')
    original_bytes = img_byte_arr.getvalue()

    # 2. Test 90 degrees rotation (should swap to 200x100)
    rotated_90 = rotate_image(original_bytes, 90)
    img_90 = Image.open(BytesIO(rotated_90))
    assert img_90.size == (200, 100), f"Expected 90 degrees rotation to swap size to (200, 100), got {img_90.size}"

    # 3. Test 180 degrees rotation (should keep 100x200)
    rotated_180 = rotate_image(original_bytes, 180)
    img_180 = Image.open(BytesIO(rotated_180))
    assert img_180.size == (100, 200), f"Expected 180 degrees rotation to keep size (100, 200), got {img_180.size}"

    # 4. Test 270 degrees rotation (should swap to 200x100)
    rotated_270 = rotate_image(original_bytes, 270)
    img_270 = Image.open(BytesIO(rotated_270))
    assert img_270.size == (200, 100), f"Expected 270 degrees rotation to swap size to (200, 100), got {img_270.size}"

    print("Image auto-rotation Pillow transformation tests passed successfully!")

if __name__ == "__main__":
    verify()
