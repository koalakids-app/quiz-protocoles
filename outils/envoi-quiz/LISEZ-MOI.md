# Mail unique avec deux quiz (parcours quiz)

`envoyer-quiz.ts` est la fonction du projet quiz (`phbcqxjzobzwuzetgbem`), copie de
`gestion-stock/docs/quiz-envoi/envoyer-quiz.ts` avec trois ajouts, sans rien changer d'autre :

- `item_id_2` : un deuxième quiz dans le même mail. Le message contient `{lien}` (1er quiz) et
  `{lien2}` (2e quiz), même `ref` pour la personne. Chaque quiz a sa ligne dans `envois_quiz`.
- `sonde: true` : répond `{ok:true, deux_liens:true}` sans rien envoyer.
- Les deux quiz doivent être publiés ; l'appel est refusé sinon.

## Mise en place

1. Déployer ce fichier comme fonction `envoyer-quiz` du projet quiz (Verify JWT activé, secrets
   inchangés), à la main comme la version actuelle.
2. Recopier le fichier dans `gestion-stock/docs/quiz-envoi/envoyer-quiz.ts` pour garder les deux
   dépôts d'accord.

Tant que cette version n'est pas déployée, « Envoyer la semaine » dans l'onglet Parcours quiz
détecte l'absence de réponse à la sonde et envoie deux mails (un par quiz) au lieu d'un.
