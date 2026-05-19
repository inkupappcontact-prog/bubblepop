from PIL import Image
import sys

src = r"C:\Users\bloui\Desktop\app texte bulle\bulles BD\4.png"
dst = src

img = Image.open(src).convert("RGBA")
pixels = img.load()
w, h = img.size

threshold = 240
changed = 0
for y in range(h):
    for x in range(w):
        r, g, b, a = pixels[x, y]
        if r >= threshold and g >= threshold and b >= threshold:
            pixels[x, y] = (255, 255, 255, 0)
            changed += 1

img.save(dst, "PNG")
print(f"OK - {changed} pixels rendus transparents sur {w*h} ({changed*100/(w*h):.1f}%)")
