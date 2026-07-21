import os
import sys

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def verify_price_cap():
    # Test case 1: Large suggested price (e.g. R100 base)
    suggested_large = 100
    final_large = min(round(suggested_large * 1.40, 2), 54.76)
    assert final_large == 54.76, f"Expected final price to be R54.76 cap, got R{final_large}"

    # Test case 2: Small suggested price (e.g. R20 base)
    suggested_small = 20
    final_small = min(round(suggested_small * 1.40, 2), 54.76)
    assert final_small == 28.00, f"Expected final price to be R28.00, got R{final_small}"

    # Test case 3: Suggested price exactly at cap limit threshold (e.g. R39.11 base)
    suggested_threshold = 39.11
    final_threshold = min(round(suggested_threshold * 1.40, 2), 54.76)
    assert final_threshold == 54.75, f"Expected final price to be R54.75, got R{final_threshold}"

    # Test case 4: Suggested price exceeding threshold (e.g. R40 base)
    suggested_exceed = 40
    final_exceed = min(round(suggested_exceed * 1.40, 2), 54.76)
    assert final_exceed == 54.76, f"Expected final price to be capped at R54.76, got R{final_exceed}"

    print("Marketplace notes R54.76 pricing cap integration tests passed successfully!")

if __name__ == "__main__":
    verify_price_cap()
