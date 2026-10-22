# Outils de développement et de test

Ces outils servent à préparer et vérifier du contenu (séquences, quiz, échanges) **sans accès au vrai
projet Supabase**. Ils ont été construits pendant la création du module 1 en version e-learning
(parties 24 à 32 du dossier `sql/`) et sont prévus pour être réutilisés sur les modules suivants.

Rien ici n'est déployé avec le site : ce dossier n'est lu que par les développeurs.

## Contenu

| Fichier | Rôle |
|---|---|
| `contenu.py` | Écrire un contenu en Python (`txt`, `img`, `qst`, `dlg`, `disc`…) et **générer le script SQL** d'une séquence ou d'un quiz. |
| `lire-sql.py` | Faire le chemin inverse : lire un script `sql/partie-NN-*.sql` et en tirer des données de test (JSON). |
| `faux-supabase.js` | Faux client Supabase injecté dans les pages à la place de `supabase-js`. |
| `tests/sequence.js` | Teste une séquence dans `formations.html` (images, questions, mises en situation, échanges). |
| `tests/quiz.js` | Teste un quiz de validation dans `index.html`. |
| `tests/echanges.js` | Teste le bloc « Échange » côté participant (sécurité du texte, limite, robots). |
| `tests/admin-echanges.js` | Teste l'onglet « Échanges » de l'admin (relecture des messages). |
| `tests/admin-parcours.js` | Teste l'onglet « Parcours quiz » de l'admin (planning, envoi de la semaine, suivi). |
| `securite-bd/` | Banc d'essai des règles de sécurité de la base : PostgreSQL local jetable et essais d'abus. |
| `envoi-quiz/` | Fonctions serveur : `envoyer-quiz` (projet quiz) qui permet un mail avec deux liens (à déployer à la main, voir `LISEZ-MOI.md`). |
| `exemples/` | Contenu du module 1 écrit avec `contenu.py`, et `regenerer.py` qui le vérifie. |
| `module2/` | Contenu du module 2 e-learning (`seq1.py` à `seq3.py`, `quiz.py`, `visuels.py`), `generer.py` qui écrit les parties 33 à 37, et `decouper_visuels.py` qui découpe l'infographie en visuels de `images/module2/`. |

## Prérequis

- Python 3 et Node.js.
- Playwright et Chromium (déjà présents dans l'environnement Claude Code). Chemins par défaut :
  `PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright`, `CHROMIUM=/opt/pw-browsers/chromium`.
- Pour `securite-bd/` uniquement : PostgreSQL (paquet `postgresql`).

## Tester une séquence ou un quiz

```bash
python3 -m http.server 8765 &                       # depuis la racine du dépôt
python3 outils/lire-sql.py sequence sql/partie-28-elearning-module1-seq3.sql /tmp/seq.json
node outils/tests/sequence.js /tmp/seq.json         # avec un lien personnel : … m-test "ref=r1&prenom=Amina"

python3 outils/lire-sql.py quiz sql/partie-29-quiz-validation-module1.sql /tmp/quiz.json
node outils/tests/quiz.js /tmp/quiz.json

node outils/tests/echanges.js                       # données de test intégrées
node outils/tests/admin-echanges.js
```

Chaque test affiche une ligne ✔ ou ✘ par vérification et rend un code de sortie non nul en cas
d'échec. On teste ainsi **exactement ce que le script SQL insérerait**, avant de l'exécuter.

## Écrire une nouvelle séquence

1. Copier `exemples/module1_seq3.py`, remplacer le titre, l'accroche et la liste `BLOCS`.
2. Générer le script avec `contenu.sql_sequence(...)` (voir `exemples/regenerer.py` pour l'appel complet).
3. Le tester avec `lire-sql.py` et `tests/sequence.js`, puis le faire relire.

`python3 outils/exemples/regenerer.py` régénère les parties 28 et 29 et vérifie qu'elles sont
**identiques à l'octet près** aux fichiers du dépôt : c'est le contrôle du générateur.

Blocs disponibles : `texte`, `image`, `reflexion`, `retenir`, `citation`, `essayer`, `scenes`,
`comparaison`, `question` (correction immédiate), `dialogue` (mise en situation) et `discussion`
(échange entre participants, relu avant affichage). Les images vont dans `images/moduleN/`.

## Tester la sécurité de la base

```bash
bash outils/securite-bd/essais-abus-echanges.sh
```

Le script démarre une base PostgreSQL jetable qui reproduit les rôles `anon` et `authenticated`,
`auth.uid()` et les politiques de `module` et `bloc`, applique `sql/partie-30-echanges.sql`, puis
essaie 24 abus et contrôles (auto-validation, écriture hors d'un bloc d'échange, lecture de la table, messages
invalides, limite d'envois, droits d'un autre compte…). Chaque essai a un verdict attendu, et le
code de sortie est non nul si l'un d'eux n'est pas respecté. `PARTIE_30=fichier.sql` permet de
tester une version modifiée : le banc doit alors signaler les failles introduites.

Pour une autre table, copier `essais-abus-echanges.sh`, changer le fichier appliqué et les essais.

## Limites à connaître

- Le faux client n'est **pas** la base : les règles de sécurité, les contraintes et les déclencheurs
  ne sont pas simulés dans les tests de pages. C'est le rôle de `securite-bd/`.
- `lire-sql.py` ne rejoue pas les scripts qui renumérotent ou modifient des blocs existants
  (parties 23, 24 et 31) : il lit seulement les blocs insérés en une fois.
- Rien ici ne remplace une vérification sur le site déployé, avec la vraie base.

## Pièges de l'outil d'exécution SQL (`execute_sql` de Supabase)

À connaître quand un script est exécuté depuis Claude Code :

- La requête expire souvent (60 s). **Après une expiration, vérifier l'état de la base avant de
  relancer** : la requête peut ne s'être jamais appliquée, ou partiellement.
- Un `update` seul sur une colonne `jsonb` peut bloquer : l'envelopper dans `do $do$ … $do$;`.
- Découper les gros scripts en morceaux ; une instruction `create function` ou `create trigger`
  isolée passe mieux qu'une série d'instructions.
- Pour créer une table : **activer la sécurité (RLS) et retirer les droits par défaut tout de
  suite après**, car Supabase accorde par défaut tous les droits à `anon` et `authenticated`.
- Pour tester des droits sur la vraie base : `begin; set local role anon; … ; rollback;` (la
  transaction est annulée, rien n'est conservé).
