import sys
from PIL import Image
from collections import Counter

def rgb_to_hex(rgb):
    return '#{:02x}{:02x}{:02x}'.format(rgb[0], rgb[1], rgb[2])

def get_dominant_colors(image_path, num_colors=4):
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize((100, 100))  # Resize for speed
        
        pixels = list(img.getdata())
        counts = Counter(pixels)
        
        # Get most common colors
        common = counts.most_common(num_colors)
        
        hex_colors = [rgb_to_hex(c[0]) for c in common]
        return hex_colors
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    image_path = "/Users/loagomontsho/.gemini/antigravity/brain/5ae563d2-8f3f-4a45-a4c5-e90cbae6cf16/uploaded_image_1763754374572.png"
    colors = get_dominant_colors(image_path)
    print(colors)
