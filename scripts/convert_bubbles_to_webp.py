"""Convertit les PNG des bulles + thumbnails en WebP lossless.

Mode lossless obligatoire :
  - Le canvas redessine ces images : toute compression lossy altèrerait
    le rendu (bord de la bulle, alpha, anti-aliasing).
  - Le gain WebP lossless sur du line-art avec alpha est typiquement
    50 à 75 % par rapport au PNG.

Les fichiers PNG d'origine sont conservés (fallback <picture>).
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
BUBBLES_DIR = ROOT / "bulles BD"
THUMBS_DIR = BUBBLES_DIR / "thumbs"

# 4_original.png est une sauvegarde locale, gitignored — on l'ignore.
SKIP = {"4_original.png"}


def convert(png_path: Path) -> tuple[int, int]:
    """Convertit en WebP lossless. Renvoie (taille_png, taille_webp) en octets."""
    webp_path = png_path.with_suffix(".webp")
    with Image.open(png_path) as im:
        # method=6 = compression la plus lente mais la plus dense.
        # exact=True : préserve les pixels RGB là où alpha=0 (sécurité
        # supplémentaire pour le canvas).
        im.save(webp_path, format="WEBP", lossless=True, quality=100, method=6, exact=True)
    return png_path.stat().st_size, webp_path.stat().st_size


def main() -> None:
    targets = []
    for p in sorted(BUBBLES_DIR.glob("*.png")):
        if p.name in SKIP:
            continue
        targets.append(p)
    for p in sorted(THUMBS_DIR.glob("*.png")):
        targets.append(p)

    print(f"{'fichier':<32} {'PNG':>10} {'WebP':>10} {'gain':>8}")
    print("-" * 64)
    total_png = total_webp = 0
    for p in targets:
        png_sz, webp_sz = convert(p)
        total_png += png_sz
        total_webp += webp_sz
        gain_pct = (1 - webp_sz / png_sz) * 100
        rel = p.relative_to(ROOT)
        print(f"{str(rel):<32} {png_sz/1024:>8.1f} KB {webp_sz/1024:>8.1f} KB {gain_pct:>6.1f}%")

    print("-" * 64)
    total_gain = (1 - total_webp / total_png) * 100
    print(f"{'TOTAL':<32} {total_png/1024:>8.1f} KB {total_webp/1024:>8.1f} KB {total_gain:>6.1f}%")


if __name__ == "__main__":
    main()
