from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
OUT = r"C:\Users\bloui\Desktop\app texte bulle\og-image.png"

# Dégradé bleu (vertical) cohérent avec l'accent de l'app (#3B82F6 → #1D4ED8)
img = Image.new("RGB", (W, H), "#60A5FA")
draw = ImageDraw.Draw(img)
c1 = (96, 165, 250)   # #60A5FA — bleu clair (haut)
c2 = (29, 78, 216)    # #1D4ED8 — accent-lo de l'app (bas)
for y in range(H):
    t = y / H
    r = int(c1[0] + (c2[0] - c1[0]) * t)
    g = int(c1[1] + (c2[1] - c1[1]) * t)
    b = int(c1[2] + (c2[2] - c1[2]) * t)
    draw.line([(0, y), (W, y)], fill=(r, g, b))

# Charge la bulle 1 (parole) et l'insère au centre
bubble_path = r"C:\Users\bloui\Desktop\app texte bulle\bulles BD\1.png"
bubble = Image.open(bubble_path).convert("RGBA")
# Rend le blanc transparent dans la bulle pour qu'elle se fonde sur le dégradé
px = bubble.load()
bw, bh = bubble.size
for y in range(bh):
    for x in range(bw):
        r, g, b, a = px[x, y]
        if r > 240 and g > 240 and b > 240:
            px[x, y] = (255, 255, 255, 0)

# Redimensionne la bulle (plus grosse pour meilleure présence visuelle)
bubble_w = 580
bubble_h = int(bh * (bubble_w / bw))
bubble = bubble.resize((bubble_w, bubble_h), Image.LANCZOS)

# Inverse les pixels noirs en blanc pour contraste sur fond violet
px = bubble.load()
for y in range(bubble_h):
    for x in range(bubble_w):
        r, g, b, a = px[x, y]
        if a > 0 and r < 50:
            px[x, y] = (255, 255, 255, a)

bx = (W - bubble_w) // 2
by = 50
img.paste(bubble, (bx, by), bubble)

# Polices comic-like dispos sur Windows
fonts_to_try = [
    "C:/Windows/Fonts/comicbd.ttf",
    "C:/Windows/Fonts/comic.ttf",
    "C:/Windows/Fonts/segoeuib.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]
title_font = None
for fp in fonts_to_try:
    if os.path.exists(fp):
        title_font = ImageFont.truetype(fp, 90)
        sub_font = ImageFont.truetype(fp, 38)
        tag_font = ImageFont.truetype(fp, 28)
        break

if title_font is None:
    title_font = ImageFont.load_default()
    sub_font = ImageFont.load_default()
    tag_font = ImageFont.load_default()

# Titre centré dans la zone supérieure (intérieur de la bulle)
title = "BubblePop!"
bbox = draw.textbbox((0, 0), title, font=title_font)
tw = bbox[2] - bbox[0]
th = bbox[3] - bbox[1]
tx = (W - tw) // 2
# Centre vertical de la zone rectangulaire de la bulle (qui occupe ~70% de la hauteur de l'image bulle)
bubble_inner_center_y = by + int(bubble_h * 0.40)
ty = bubble_inner_center_y - th // 2
draw.text((tx, ty), title, fill="white", font=title_font)

# Sous-titre sous la bulle
tagline = "Comic Speech Bubble Generator"
bbox = draw.textbbox((0, 0), tagline, font=sub_font)
tw = bbox[2] - bbox[0]
draw.text(((W - tw) // 2, H - 110), tagline, fill="white", font=sub_font)

footer = "Free  •  Transparent PNG  •  No signup"
bbox = draw.textbbox((0, 0), footer, font=tag_font)
tw = bbox[2] - bbox[0]
draw.text(((W - tw) // 2, H - 55), footer, fill=(255, 255, 255), font=tag_font)

img.save(OUT, "PNG", optimize=True)
print(f"OK - og-image.png créé ({W}x{H})")
