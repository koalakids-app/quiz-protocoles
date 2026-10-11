# Visuels du module 2 (partie 37) : une image par séquence, placée juste après un bloc de texte repère.
# Source : infographie « Accompagner le plein potentiel du jeune enfant » fournie par la direction,
# découpée par decouper_visuels.py dans images/module2/. Légendes : reprennent le texte de l'infographie.
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import seq1, seq2, seq3

THEME_NOM = seq1.THEME_NOM
IMAGES = [
 dict(partie_sous="37.1", seq="1/3", titre=seq1.MODULE_TITRE, ancre="Port d'attache, boussole", fichier="port-attache",
      alt="Un enfant de dos s'aventure sur un chemin qui domine des vagues de papier découpé ; plus haut, deux enfants jouent. Texte : le professionnel « port d'attache » offre la sécurité affective indispensable pour permettre à l'enfant de s'aventurer.",
      legende="Le port d'attache offre la sécurité affective indispensable pour permettre à l'enfant de s'aventurer."),
 dict(partie_sous="37.2", seq="2/3", titre=seq2.MODULE_TITRE, ancre="Les règles s'apprennent après le monde", fichier="guidage-accompagnement",
      alt="Titre « Accompagner le plein potentiel du jeune enfant » et encadré « Du guidage à l'accompagnement », à côté d'un paysage de vagues et de soleil en papier découpé.",
      legende="Du guidage à l'accompagnement : l'enfant guide le professionnel, qui s'adapte à son rythme et à sa pensée. Le jeune enfant est un être complet et compétent d'emblée."),
 dict(partie_sous="37.3", seq="3/3", titre=seq3.MODULE_TITRE, ancre="Prêter sa boussole", fichier="phare-boussole",
      alt="Un phare dont le faisceau éclaire un enfant qui empile des cubes, et une boussole. Texte : le professionnel « phare » s'enthousiasme pour les recherches de l'enfant ; le professionnel « boussole » accueille toutes les émotions comme légitimes et guide les apprentissages sociaux.",
      legende="La boussole accueille toutes les émotions comme légitimes et guide les apprentissages sociaux. Le phare, lui, s'enthousiasme pour les recherches de l'enfant et étaye ses découvertes."),
]
