# EXEMPLE d'écriture d'un quiz de validation : le quiz de la partie 29 (module 1).
# Chaque question : (énoncé, [(option, juste)], rotation, multi). Les positions des bonnes réponses
# sont réparties entre A, B, C et D par TARGET (questions à réponse unique).
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from contenu import quiz_questions

QUIZ_TITRE = "Quiz de validation : développement et attachement"
QUIZ_DESC = "À faire une fois les trois séquences du module 1 suivies. 10 questions, corrigé immédiat. Seuil de réussite : 80 %."
# (énoncé, [(option, juste)], rotation, multi)
Q = [
 ("Un enfant de 18 mois hurle et tape des pieds quand sa mère s'en va. Quelle lecture est la plus juste ?",
  [("Il fait un caprice pour que sa mère reste.", False),
   ("Il est débordé par une émotion qu'il ne peut pas réguler seul : il a besoin d'un adulte qui l'aide à se calmer.", True),
   ("Il manque d'habitude de la collectivité : il faut le laisser pleurer.", False),
   ("Il rejette la professionnelle qui l'accueille.", False)], 0, False),
 ("Un enfant de 2 ans est submergé par la colère. Quelle réaction de l'adulte est la plus soutenante ?",
  [("Lui dire que ce n'est rien et qu'il n'a pas de raison de pleurer.", False),
   ("L'isoler dans un coin calme jusqu'à ce qu'il se calme.", False),
   ("Accueillir son émotion sans jugement, la nommer et le réconforter.", True),
   ("Le punir pour qu'il comprenne que ce comportement n'est pas accepté.", False)], 2, False),
 ("Que désigne la « base de sécurité » en théorie de l'attachement ?",
  [("Un lieu fermé de la crèche où l'enfant peut s'isoler.", False),
   ("Un adulte sensible sur qui l'enfant peut compter : il s'éloigne pour explorer, en sachant qu'il peut revenir.", True),
   ("Le doudou, qui remplace l'adulte absent.", False),
   ("L'adulte désigné par la direction comme référent de chaque enfant.", False)], 3, False),
 ("Que signifie le « paradoxe de l'autonomie » ?",
  [("Plus on laisse un enfant seul tôt, plus il devient autonome.", False),
   ("Pour devenir capable d'être seul, l'enfant doit d'abord avoir fait l'expérience d'une dépendance sécurisante.", True),
   ("Un enfant autonome n'a plus besoin de ses figures d'attachement.", False),
   ("L'autonomie s'acquiert uniquement par le jeu libre.", False)], 1, False),
 ("Une enfant de 14 mois ne joue que si elle est contre l'adulte et pleure dès qu'il se lève. Que faire en priorité ?",
  [("L'encourager à jouer seule pour qu'elle apprenne l'autonomie.", False),
   ("Changer régulièrement d'adulte autour d'elle pour qu'elle s'habitue à tous.", False),
   ("Lui offrir un ou deux adultes stables et disponibles, jusqu'à ce qu'elle se sente assez en sécurité pour jouer.", True),
   ("Lui donner son doudou à chaque fois, à la place de l'adulte.", False)], 2, False),
 ("Qui peut faire partie de la constellation d'attachement d'un enfant ? (plusieurs réponses)",
  [("Ses parents.", True),
   ("Les professionnels qui s'occupent régulièrement de lui.", True),
   ("Parfois d'autres enfants.", True),
   ("Uniquement la personne désignée comme référente par la direction.", False)], 1, True),
 ("Une enfant ne se calme que dans les bras d'une collègue, pas dans ceux de sa référente. Quelle attitude de l'équipe est la plus adaptée ?",
  [("Demander à la référente de la garder jusqu'à ce que l'enfant s'y habitue.", False),
   ("Y voir une information : en tenir compte dans l'organisation et en informer les parents.", True),
   ("Conclure que la référente doit être remplacée.", False),
   ("Ne rien changer, pour ne pas créer de préférence.", False)], 3, False),
 ("Une maman confie : « J'ai peur qu'elle s'attache plus à vous qu'à moi. » Quelle réponse est la plus adaptée ?",
  [("« Mais non, ne vous inquiétez pas, c'est normal. »", False),
   ("« Elle s'attache à nous parce qu'elle passe la journée ici. »", False),
   ("Nommer sa crainte, rappeler que l'attachement à la crèche complète celui qu'elle a avec vous sans le remplacer, et reconnaître sa place de parent.", True),
   ("« Il faudrait que vous passiez plus de temps avec elle. »", False)], 1, False),
 ("Le soir, un enfant de 20 mois s'accroche à la porte du coin jeux et refuse de partir. Comment l'interpréter le plus justement ?",
  [("Il fait un caprice, il ne faut surtout pas céder.", False),
   ("Il n'est pas capricieux : il a besoin de plus de temps et d'un rituel pour quitter le lieu.", True),
   ("Il est mal attaché à son parent.", False),
   ("Sa journée s'est mal passée.", False)], 0, False),
 ("Quelles phrases conviennent à un retour d'expérience en équipe ? (plusieurs réponses)",
  [("« J'ai testé de me placer sur un jeu dès l'arrivée : deux enfants sont venus me rejoindre. »", True),
   ("« J'ai mal fait, je n'étais pas assez disponible. »", False),
   ("« Au départ de sa mère, il a pleuré moins longtemps que la semaine dernière. »", True),
   ("« Les enfants difficiles ne réagissent pas à cette pratique. »", False)], 2, True),
]
TARGET = {0:1, 1:3, 2:2, 3:0, 4:3, 6:0, 7:2, 8:3}   # place voulue de la bonne réponse (questions à réponse unique)
QUESTIONS = quiz_questions(Q, TARGET)
