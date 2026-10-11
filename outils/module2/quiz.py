# Quiz de validation du module 2 (partie 36). 10 questions, mode score, seuil 80 %.
# Chaque question : (énoncé, [(option, juste)], rotation, multi). Les positions des bonnes réponses sont
# réparties entre A, B, C et D par TARGET (questions à réponse unique). Les questions reformulent les
# notions des trois séquences avec d'autres cas, sans reprendre les questions du parcours.
# Rédigé librement, à valider : tous les énoncés, options et cas.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from contenu import quiz_questions

QUIZ_TITRE = "Quiz de validation : émotions, pleurs, cadre sans violence"
QUIZ_DESC = "À faire une fois les trois séquences du module 2 suivies. 10 questions, corrigé immédiat. Seuil de réussite : 80 %."
THEME_ANIME = "Module 2 – Émotions, pleurs, cadre sans violence"
Q = [
 ("Un bébé de 6 mois pleure en fin d'après-midi, sans cause évidente. Une collègue dit : « Il faut le laisser, sinon il prend l'habitude. » Quelle lecture est la plus juste ?",
  [("Il prend déjà des habitudes : il faut lui apprendre à patienter.", False),
   ("C'est une alarme : à cet âge, il ne peut pas calmer seul son mal-être, et c'est l'adulte qui l'aide à s'apaiser.", True),
   ("Il teste les adultes pour voir jusqu'où il peut aller.", False),
   ("Il cherche à attirer l'attention : le mieux est de l'ignorer.", False)], 0, False),
 ("Une professionnelle devance toujours les besoins d'un enfant, avant qu'il n'ait rien exprimé. Qu'en penser ?",
  [("C'est idéal : l'enfant n'a jamais besoin de pleurer.", False),
   ("Peu importe, l'essentiel est que ses besoins soient comblés.", False),
   ("Il faut toujours attendre qu'il pleure longtemps avant d'intervenir.", False),
   ("Répondre avant son appel ne lui permet pas de comprendre qu'il peut compter sur l'adulte quand il l'appelle : on répond à ses signaux, sans tarder.", True)], 0, False),
 ("Lola, 2 ans, hurle sur le tapis après un refus. Elle tape, elle essaie de mordre. Quelle posture est la plus adaptée ?",
  [("Rester près d'elle, la protéger et protéger les autres, ne pas la laisser seule avec sa détresse.", True),
   ("La mettre seule dans une autre pièce le temps qu'elle se calme.", False),
   ("Lui faire un long discours sur ce qui est permis ou non.", False),
   ("Ne pas réagir : une tempête se calme plus vite sans public.", False)], 0, False),
 ("Lesquels de ces signes peuvent traduire une émotion forte chez un enfant qui ne pleure pas ? (plusieurs réponses)",
  [("Il se raidit quand on s'approche.", True),
   ("Il se retire dans un coin, le regard baissé.", True),
   ("Il joue calmement, absorbé par son jeu.", False),
   ("Il recule dès qu'un adulte tend les bras.", True)], 1, True),
 ("Que désigne la posture de la « boussole » ?",
  [("L'adulte organise un jeu riche et s'enthousiasme pour les découvertes de l'enfant.", False),
   ("L'adulte reste à distance pour que l'enfant apprenne à se débrouiller seul.", False),
   ("L'adulte nomme l'émotion, la reconnaît comme légitime, soutient l'enfant et lui indique la direction du réconfort.", True),
   ("L'adulte détourne l'attention de l'enfant vers une autre activité.", False)], 0, False),
 ("Quelle organisation relève d'un cadre commun, protecteur et compréhensible ?",
  [("Des limites et des modes d'intervention définis en équipe, sans injonctions contradictoires.", True),
   ("Chaque adulte applique ses propres limites selon son humeur du jour.", False),
   ("De nombreux interdits, pour que l'enfant ne doute jamais de ce qui est permis.", False),
   ("Aucune limite : l'enfant découvre seul les règles.", False)], 0, False),
 ("Axel, 18 mois, tire les cheveux d'une camarade qui pleure. Quelle première réaction est la plus adaptée ?",
  [("Lui demander de réfléchir à ce qu'il vient de faire.", False),
   ("L'éloigner du groupe quelques minutes.", False),
   ("Lui demander de faire un câlin à sa camarade pour réparer.", False),
   ("S'accroupir près d'eux, redire que faire mal n'est pas permis, réconforter la camarade et rester aussi auprès d'Axel.", True)], 0, False),
 ("Parmi ces pratiques, lesquelles constituent des fautes professionnelles ? (plusieurs réponses)",
  [("Se moquer d'un enfant devant les autres.", True),
   ("Faire un soin à un enfant sans lui dire ce qui lui arrive.", True),
   ("S'accroupir pour dire une limite en une phrase, avec un visage qui correspond.", False),
   ("Mettre un enfant à l'écart pour qu'il se calme.", True)], 2, True),
 ("Deux collègues parlent d'un enfant assis près d'elles. Quelle attitude respecte l'enfant ?",
  [("Parler de lui librement : à cet âge, il ne comprend pas encore.", False),
   ("Éviter de parler négativement des enfants et de leurs parents devant eux, et inclure l'enfant dans la conversation.", True),
   ("Chuchoter pour qu'il n'entende pas, mais continuer à en parler.", False),
   ("Ne jamais parler d'un enfant entre collègues.", False)], 0, False),
 ("Au terme d'un cycle de tests, comment une équipe conclut-elle le mieux ?",
  [("Chacun garde la pratique qui lui convient, sans en reparler.", False),
   ("Elle désigne la collègue qui a le mieux réussi et copie sa méthode.", False),
   ("Elle choisit une pratique commune, décrite en une phrase, tenue deux semaines, et chacun s'engage sur un geste précis.", True),
   ("Elle abandonne tout geste qui n'a pas supprimé les pleurs.", False)], 0, False),
]
TARGET = {0: 1, 1: 3, 2: 0, 4: 2, 5: 0, 6: 3, 8: 1, 9: 2}   # place voulue de la bonne réponse (questions à réponse unique)
QUESTIONS = quiz_questions(Q, TARGET)
