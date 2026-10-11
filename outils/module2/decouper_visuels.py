#!/usr/bin/env python3
"""
Découpe l'infographie « Accompagner le plein potentiel du jeune enfant » (webp, 1116 x 2000) en trois visuels
paysage pour le module 2, dans images/module2/ (1000 px de large, JPEG, moins de 100 Ko). Le filigrane du bas
de l'infographie est exclu des découpes.
    python3 outils/module2/decouper_visuels.py chemin/vers/infographie.webp
"""
import os, sys
from PIL import Image

RACINE = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DECOUPES = {   # nom : (gauche, haut, droite, bas) dans l'infographie d'origine
    "guidage-accompagnement": (0, 40, 1116, 665),
    "phare-boussole": (0, 640, 1116, 1268),
    "port-attache": (0, 1322, 1116, 1950),
}
LARGEUR = 1000

if __name__ == "__main__":
    src = Image.open(sys.argv[1]).convert("RGB")
    for nom, boite in DECOUPES.items():
        c = src.crop(boite)
        c = c.resize((LARGEUR, round(c.height * LARGEUR / c.width)), Image.LANCZOS)
        chemin = os.path.join(RACINE, "images", "module2", nom + ".jpg")
        for q in (86, 82, 78, 74, 70):
            c.save(chemin, "JPEG", quality=q, optimize=True)
            if os.path.getsize(chemin) < 100 * 1024:
                break
        print(f"{os.path.relpath(chemin, RACINE)} : {c.width}x{c.height}, {os.path.getsize(chemin) / 1024:.0f} Ko (qualité {q})")
