"""
Génère des thumbnails 256x256 pour les bulles BD.

Utilisé par le sélecteur de style dans index.html pour afficher
les aperçus sans charger les PNG sources 5000x5000 (~130 KB chacun).

Le canvas principal continue d'utiliser les sources pleine résolution
pour le rendu final (chargées en lazy depuis le JS).
"""
from PIL import Image
import os

SRC_DIR = r"C:\Users\bloui\Desktop\app texte bulle\bulles BD"
OUT_DIR = os.path.join(SRC_DIR, "thumbs")
SIZE = 256

os.makedirs(OUT_DIR, exist_ok=True)

for n in [1, 2, 3, 4]:
    src = os.path.join(SRC_DIR, f"{n}.png")
    out = os.path.join(OUT_DIR, f"{n}.png")
    img = Image.open(src).convert("RGBA")
    img.thumbnail((SIZE, SIZE), Image.LANCZOS)
    img.save(out, "PNG", optimize=True)
    size_kb = os.path.getsize(out) / 1024
    print(f"OK {n}.png : {img.size[0]}x{img.size[1]} ({size_kb:.1f} KB)")
