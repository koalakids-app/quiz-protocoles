#!/usr/bin/env python3
"""
Transforme un script sql/partie-NN-*.sql en données de test (JSON), pour alimenter
tests/*.js sans accès à la base : on teste ainsi exactement ce que le script insérerait.

Deux types de fichiers sont reconnus :

  sequence   une séquence créée par une partie du type 26, 27 ou 28 (thème + séquence + blocs)
  quiz       un quiz de validation du type partie 29 (quiz + questions)

Utilisation :
  python3 outils/lire-sql.py sequence sql/partie-28-elearning-module1-seq3.sql donnees.json
  python3 outils/lire-sql.py quiz     sql/partie-29-quiz-validation-module1.sql  quiz.json

Pour tester une séquence : node outils/tests/sequence.js donnees.json
Limite : les scripts qui renumérotent ou modifient des blocs existants (parties 23, 24, 31)
ne sont pas rejoués ; seuls les blocs insérés en une fois sont lus.
"""
import json
import re
import sys


def lire(chemin):
    with open(chemin, encoding="utf-8") as f:
        return f.read()


def sequence(sql):
    """Une séquence et ses blocs : ('type', $kk${json}$kk$::jsonb, ordre), ..."""
    blocs = []
    for type_, contenu, ordre in re.findall(
            r"\('(\w+)', \$kk\$(\{.*?\})\$kk\$::jsonb, (\d+)\)", sql, re.S):
        blocs.append({"id": f"b{ordre}", "module_id": "m-test", "type": type_,
                      "contenu": json.loads(contenu), "ordre": int(ordre)})
    if not blocs:
        raise SystemExit("Aucun bloc trouvé : ce fichier n'est pas une séquence reconnue.")
    # Dans les scripts 26 à 28, l'accroche et le titre de la séquence suivent « values (tid, ».
    m = re.search(r"values \(tid, \$kk\$(.*?)\$kk\$,\s*\$kk\$(.*?)\$kk\$", sql, re.S)
    titre, accroche = (m.group(1), m.group(2)) if m else ("Séquence de test", "")
    # Les clés portent le nom exact des tables lues par les pages (voir faux-supabase.js).
    return {
        "theme": [{"id": "t-test", "nom": "Thème de test", "description": "", "quiz_id": None}],
        "module": [{"id": "m-test", "theme_id": "t-test", "titre": titre, "accroche": accroche,
                    "publie": True, "ordre": 0, "trame": None}],
        "bloc": blocs,
    }


def quiz(sql):
    """Un quiz et ses questions : (ordre, $kk$énoncé$kk$, $kk$[options]$kk$::jsonb, '[réponses]'::jsonb, multi)."""
    questions = []
    for ordre, enonce, options, reponses, multi in re.findall(
            r"\((\d+), \$kk\$(.*?)\$kk\$, \$kk\$(\[.*?\])\$kk\$::jsonb, '(\[.*?\])'::jsonb, (true|false)\)",
            sql, re.S):
        questions.append({"id": f"q{ordre}", "quiz_id": "quiz-test", "ordre": int(ordre),
                          "enonce": enonce, "options": json.loads(options),
                          "reponses": json.loads(reponses), "multi": multi == "true",
                          "image_url": None, "image_alt": None, "type_question": None,
                          "axe": None, "lectures": None, "module_id": None})
    if not questions:
        raise SystemExit("Aucune question trouvée : ce fichier n'est pas un quiz reconnu.")
    titre = re.search(r"insert into public\.quiz\(.*?\)\s*values \(\$kk\$(.*?)\$kk\$", sql, re.S)
    return {
        "quiz": [{"id": "quiz-test", "titre": titre.group(1) if titre else "Quiz de test",
                  "description": "", "publie": True, "mode": "score"}],
        "questions": questions,
    }


def main(argv):
    if len(argv) != 4 or argv[1] not in ("sequence", "quiz"):
        print(__doc__)
        return 2
    donnees = (sequence if argv[1] == "sequence" else quiz)(lire(argv[2]))
    with open(argv[3], "w", encoding="utf-8") as f:
        json.dump(donnees, f, ensure_ascii=False)
    n = len(donnees.get("bloc") or donnees.get("questions") or [])
    print(f"{argv[3]} écrit ({n} {'blocs' if argv[1] == 'sequence' else 'questions'})")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
