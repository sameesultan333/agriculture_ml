import re
import pytesseract
from PIL import Image


def parse_market_image(path):
    text = pytesseract.image_to_string(Image.open(path))

    lines = text.split("\n")

    data = []

    for line in lines:
        line = line.strip()

        if not line:
            continue

        # must contain price pattern
        price_match = re.search(r"(\d+\.?\d*)\s*-\s*(\d+\.?\d*)", line)
        if not price_match:
            continue

        min_price = float(price_match.group(1))
        max_price = float(price_match.group(2))

        # remove price from line
        line = line.replace(price_match.group(0), "").strip()

        words = line.split()

        if len(words) < 2:
            continue

        # find packing (contains KG or BOX or BAG)
        packing_index = None
        for i, w in enumerate(words):
            if any(k in w.upper() for k in ["KG", "BOX", "BAG"]):
                packing_index = i
                break

        if packing_index is None:
            continue

        vegetable = " ".join(words[:packing_index])
        packing = " ".join(words[packing_index:])

        # remove serial numbers if present
        vegetable = re.sub(r"^\d+\s*", "", vegetable).strip()

        if vegetable == "" or vegetable.lower() in ["old", "new"]:
            continue

        data.append({
            "vegetable": vegetable.title(),
            "packing": packing,
            "min_price": min_price,
            "max_price": max_price
        })

    return data
