# quiz-protocoles

Application créée par David Bucari — © 2026 Koala Kids.

## Jeu de société

`jeu-societe.html` (+ dossier `jeu-societe/`) : jeu « Le Sentier du Koala », copie autonome de celui du dépôt gestion-stock. Affiché dans l’onglet **Jeu** de `admin.html` (iframe `?integre=1`) et partageable par lien. Les cartes sont dans `jeu-societe/jeu-societe-cartes.js`.

### Jeu en ligne (chacun sur son téléphone)

Le jeu a deux modes : un seul appareil, ou **chacun sur son téléphone**. En ligne, l'appareil de l'animateur fait tourner la partie (il est l'arbitre) et diffuse l'état par **Supabase Realtime Broadcast** (canal `kkjeu-<code à 5 lettres>`, 8 joueurs maximum) ; chaque téléphone affiche le plateau en direct et n'envoie que ses actions (dé, réponse) quand c'est son tour. Rien n'est écrit en base. Configuration : `window.KK_JEU_SUPABASE` dans `jeu-societe.html` (sans elle, le mode en ligne est masqué). Si l'animateur ferme son navigateur, la partie s'arrête ; il peut la reprendre avec le même code, et un joueur revient avec le lien `jeu-societe.html?code=ABCDE`. L'option `?test=bc` remplace Supabase par un canal local entre onglets, pour les essais.

La salle d’attente affiche aussi un **QR code** du lien de la partie (qrcodejs depuis cdnjs, comme dans gestion-stock) ; sans la bibliothèque, le code et le lien restent disponibles.

Chronomètre de réponse : réglé à l’accueil (sans limite, 30 s, 1 min, 1 min 30 ; 1 min par défaut). En ligne, chaque téléphone affiche son compte à rebours et c’est l’animateur qui tranche : temps écoulé = mauvaise réponse (retour à la case de départ du tour).

Deux façons de jouer (réglées à l’accueil) : **en opposition** (la première équipe arrivée gagne, classement final avec case atteinte, feuilles et réponses justes) ou **en collaboration** (un seul pion pour tout le groupe, qui doit atteindre l’eucalyptus avant la fin de `TOURS_COOP` = 16 tours ; bilan avec la contribution de chacun·e). Le nombre de tours se règle dans `jeu-societe/jeu-societe.js`.

Cartes **sommeil** et **alimentation** : rangées dans les thèmes existants (développement, pédagogie, protocoles, familles) et à la fin de `jeu-societe/jeu-societe-cartes.js`, avec deux sujets de discussion. Le jeu compte 99 cartes.

Cartes **hygiène** et **sécurité** (23 questions et 2 sujets de discussion) à la fin de `jeu-societe/jeu-societe-cartes.js`, rangées surtout dans le thème Protocoles ; le jeu compte 125 cartes.

Public visé : les enfants d’une micro-crèche, de **2 mois et demi à 3 ans (4 ans au maximum)** ; les cartes doivent rester pertinentes pour cette tranche d’âge (rappelé en tête de `jeu-societe-cartes.js`). Le jeu compte 130 cartes.
