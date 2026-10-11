#!/usr/bin/env python3
"""
Régénère les scripts des parties 28 (séquence 3/3 e-learning) et 29 (quiz de validation) à
partir de leur contenu écrit en Python (module1_seq3.py, module1_quiz.py), puis les compare
aux fichiers du dépôt. Sert à la fois d'exemple d'utilisation de outils/contenu.py et de
contrôle : si le générateur est correct, les fichiers sont identiques à l'octet près.

    python3 outils/exemples/regenerer.py            # compare seulement
    python3 outils/exemples/regenerer.py --ecrire   # réécrit les fichiers (à éviter sur main)

L'en-tête de chaque script (commentaire de présentation) est relu depuis le fichier existant :
c'est du texte libre rédigé à la main, le générateur ne produit que le reste.
"""
import os
import sys

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
sys.path.insert(0, os.path.join(ICI, ".."))
sys.path.insert(0, ICI)

from contenu import sql_quiz, sql_sequence  # noqa: E402
import module1_quiz as quiz  # noqa: E402
import module1_seq3 as seq3  # noqa: E402


def entete(chemin, repere):
    """Texte qui précède la première section (« -- NN.1 »)."""
    with open(chemin, encoding="utf-8") as f:
        s = f.read()
    return s[: s.index(repere)]


def main(ecrire):
    cibles = []

    f28 = os.path.join(RACINE, "sql", "partie-28-elearning-module1-seq3.sql")
    cibles.append((f28, sql_sequence(
        entete=entete(f28, "\n-- ---------------------------------------------------------------------------\n-- 28.1"),
        partie=28, seq="3/3", theme_nom=seq3.THEME_NOM, partie_theme=26,
        titre=seq3.MODULE_TITRE, accroche=seq3.ACCROCHE, ordre=seq3.ORDRE, blocs=seq3.BLOCS,
        attendu=["séquence 3/3 avec 27 blocs (9 texte, 6 question,",
                 "3 reflexion, 3 dialogue, 1 scenes, 1 comparaison, 1 image, 1 citation, 1 retenir,",
                 "1 essayer), publie = false, sans trame."])))

    f29 = os.path.join(RACINE, "sql", "partie-29-quiz-validation-module1.sql")
    cibles.append((f29, sql_quiz(
        entete=entete(f29, "\n-- ---------------------------------------------------------------------------\n-- 29.1"),
        partie=29, quiz_titre=quiz.QUIZ_TITRE, quiz_desc=quiz.QUIZ_DESC,
        theme_nom=seq3.THEME_NOM, questions=quiz.QUESTIONS,
        attendu=["1 quiz, mode score, 10 questions",
                 "dont 2 à réponses multiples, publie = false, thème e-learning non rattaché."])))

    echecs = 0
    for chemin, genere in cibles:
        nom = os.path.relpath(chemin, RACINE)
        with open(chemin, encoding="utf-8") as f:
            existant = f.read()
        if genere == existant:
            print(f"✔ {nom} : identique à l'octet près")
        else:
            echecs += 1
            print(f"✘ {nom} : différent")
            for i, (a, b) in enumerate(zip(genere, existant)):
                if a != b:
                    print(f"   première différence au caractère {i} : généré « {genere[i:i+60]!r} » / existant « {existant[i:i+60]!r} »")
                    break
            else:
                print(f"   longueurs différentes : {len(genere)} / {len(existant)}")
            if ecrire:
                with open(chemin, "w", encoding="utf-8") as f:
                    f.write(genere)
                print("   réécrit")
    return 1 if echecs and not ecrire else 0


if __name__ == "__main__":
    sys.exit(main("--ecrire" in sys.argv))
