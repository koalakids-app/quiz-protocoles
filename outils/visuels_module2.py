#!/usr/bin/env python3
"""
Dessine les visuels du module 2 (papier découpé, aplats, grain léger, ombres nettes) avec Pillow.
Palette stricte : violet #4A3C8C, orange #F28A1F, pêche #F9B26B, crème #FFF6E9, gris #6B6F76 (touche).
Aucun texte ; silhouettes de dos ; sujet décalé à droite, espace vide à gauche pour le texte.
    python3 outils/visuels_module2.py            # écrit images/module2/*.jpg
"""
import math, os, random
from PIL import Image, ImageDraw, ImageChops

VIOLET, ORANGE, PECHE, CREME, GRIS = "#4A3C8C", "#F28A1F", "#F9B26B", "#FFF6E9", "#6B6F76"
W, H, S = 1200, 675, 3          # taille finale, facteur de sur-échantillonnage
RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Toile:
    def __init__(self):
        self.im = Image.new("RGB", (W * S, H * S), CREME)

    def forme(self, couleur, dessin, ombre=(5, 7)):
        """dessin(d, k) trace la forme en blanc sur un masque ; k convertit les coordonnées."""
        m = Image.new("L", self.im.size, 0)
        dessin(ImageDraw.Draw(m), S)
        if ombre:
            dec = ImageChops.offset(m, ombre[0] * S, ombre[1] * S)
            sombre = Image.new("RGB", self.im.size, VIOLET)
            self.im.paste(sombre, (0, 0), dec.point(lambda v: int(v * 0.16)))
        self.im.paste(Image.new("RGB", self.im.size, couleur), (0, 0), m)

    # --- briques ---
    def disque(self, c, x, y, r, ombre=(5, 7)):
        self.forme(c, lambda d, k: d.ellipse([(x - r) * k, (y - r) * k, (x + r) * k, (y + r) * k], fill=255), ombre)

    def trait(self, c, pts, e, ombre=(5, 7)):
        """Chemin épais aux bouts ronds."""
        def f(d, k):
            for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
                d.line([x0 * k, y0 * k, x1 * k, y1 * k], fill=255, width=int(e * k))
            for x, y in pts:
                d.ellipse([(x - e / 2) * k, (y - e / 2) * k, (x + e / 2) * k, (y + e / 2) * k], fill=255)
        self.forme(c, f, ombre)

    def arc(self, c, cx, cy, r, a0, a1, e, ombre=(5, 7)):
        pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a)))
               for a in [a0 + (a1 - a0) * i / 40 for i in range(41)]]
        self.trait(c, pts, e, ombre)

    def enfant(self, c, x, base, h, ombre=(5, 7)):
        """Silhouette de dos : tête, corps arrondi, deux jambes."""
        def f(d, k):
            r = 0.17 * h
            d.ellipse([(x - r) * k, (base - h) * k, (x + r) * k, (base - h + 2 * r) * k], fill=255)
            d.rounded_rectangle([(x - .22 * h) * k, (base - .78 * h) * k, (x + .22 * h) * k, (base - .30 * h) * k],
                                radius=int(.12 * h * k), fill=255)
            for dx in (-.10, .10):
                d.rounded_rectangle([(x + dx * h - .065 * h) * k, (base - .40 * h) * k,
                                     (x + dx * h + .065 * h) * k, base * k], radius=int(.06 * h * k), fill=255)
        self.forme(c, f, ombre)

    def adulte_accroupi(self, c, x, base, h, vers=-1, ombre=(5, 7)):
        """Adulte accroupi, de profil, tourné vers la gauche (vers=-1) ou la droite (vers=1)."""
        s = -vers  # on dessine face à gauche puis on inverse
        def X(dx): return x + s * dx * h
        tete = (X(0.00), base - 0.98 * h)
        epaule = (X(0.06), base - 0.78 * h)
        hanche = (X(0.30), base - 0.30 * h)
        genou = (X(-0.12), base - 0.34 * h)
        pied = (X(-0.10), base - 0.03 * h)
        self.disque(c, tete[0], tete[1], 0.13 * h, ombre)
        self.trait(c, [epaule, hanche], 0.34 * h, ombre)
        self.trait(c, [hanche, genou], 0.20 * h, ombre)
        self.trait(c, [genou, pied], 0.17 * h, ombre)
        return epaule

    def fin(self, chemin):
        im = self.im.resize((W, H), Image.LANCZOS)
        rnd = random.Random(7)
        grain = Image.effect_noise((W, H), 9).convert("L")        # bruit centré sur 128
        grain = grain.point(lambda v: int(max(0, min(255, 128 + (v - 128) * .55))))
        g = Image.merge("RGB", (grain, grain, grain))
        im = ImageChops.add(ImageChops.multiply(im, ImageChops.invert(Image.new("RGB", (W, H), "#F6F6F6"))).point(lambda v: 0), im)  # no-op sûr
        im = Image.blend(im, ImageChops.overlay(im, g), 0.35)
        im.save(chemin, "JPEG", quality=80, optimize=True, subsampling=0)
        print(f"{os.path.relpath(chemin, RACINE)} : {os.path.getsize(chemin) / 1024:.0f} Ko")


def pleur_message():
    t = Toile()
    cx, base, h = 740, 575, 230
    t.disque(PECHE, 905, 575, 70, ombre=None)                              # tapis rond, sol
    t.arc(PECHE, cx, base - h + 40, 78, 205, 335, 15)
    t.arc(ORANGE, cx, base - h + 40, 118, 210, 330, 15)
    t.arc(PECHE, cx, base - h + 40, 158, 215, 325, 15)
    t.enfant(ORANGE, cx, base, h)
    t.adulte_accroupi(VIOLET, 905, base, 300, vers=-1)
    t.fin(os.path.join(RACINE, "images/module2/pleur-message.jpg"))


def cadre_protecteur():
    t = Toile()
    base = 580
    t.arc(PECHE, 790, base - 10, 215, 188, 352, 24)                       # dôme : le cadre
    t.enfant(ORANGE, 715, base, 190)
    t.enfant(PECHE, 810, base, 215)
    ep = t.adulte_accroupi(VIOLET, 1005, base, 300, vers=-1)
    t.trait(VIOLET, [ep, (930, 410), (880, 370)], 38)                      # le bras qui accompagne
    t.fin(os.path.join(RACINE, "images/module2/cadre-protecteur.jpg"))


def boussole():
    t = Toile()
    cx, cy, r = 800, 285, 150
    t.disque(VIOLET, cx, cy, r)
    t.disque(CREME, cx, cy, r - 26, ombre=None)
    a = math.radians(35)
    ux, uy, vx, vy = math.sin(a), -math.cos(a), math.cos(a), math.sin(a)
    def pt(l, w): return (cx + ux * l + vx * w, cy + uy * l + vy * w)
    t.forme(ORANGE, lambda d, k: d.polygon([(x * k, y * k) for x, y in (pt(100, 0), pt(0, 26), pt(0, -26))], fill=255), ombre=None)
    t.forme(PECHE, lambda d, k: d.polygon([(x * k, y * k) for x, y in (pt(-100, 0), pt(0, 26), pt(0, -26))], fill=255), ombre=None)
    t.disque(VIOLET, cx, cy, 11, ombre=None)
    t.enfant(ORANGE, 640, 590, 210)
    ep = t.adulte_accroupi(VIOLET, 1010, 590, 300, vers=-1)
    t.trait(VIOLET, [ep, (990, 400), (945, 330)], 34)
    t.fin(os.path.join(RACINE, "images/module2/boussole.jpg"))


if __name__ == "__main__":
    pleur_message(); cadre_protecteur(); boussole()
