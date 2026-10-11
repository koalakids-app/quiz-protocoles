"""
Écrire le contenu d'une séquence e-learning ou d'un quiz en Python, puis générer le script
SQL sql/partie-NN-*.sql correspondant. C'est ainsi qu'ont été produites les parties 26 à 29.

Pourquoi : on rédige du contenu (textes, questions, mises en situation) sans jamais écrire
de JSON ni d'apostrophes échappées à la main ; le script généré est relançable et se termine
par un contrôle. Voir outils/exemples/ pour un exemple complet.

Utilisation :
    import sys; sys.path.insert(0, 'outils')
    from contenu import txt, img, cit, refl, qst, dlg, disc, sql_sequence

    BLOCS = [txt("Titre", "Paragraphe avec **gras**."), qst("Question ?", [("Faux", False), ("Juste", True)], "Explication.")]
    sql = sql_sequence(entete="-- ... commentaire d'en-tête ...\\n", partie=33, seq="1/3",
                       theme_nom="Module 2 – … (e-learning)", partie_theme=26,
                       titre="Module 2 – 1/3 · … (e-learning)", accroche="Phrase d'accroche.",
                       ordre=0, blocs=BLOCS, attendu=["séquence 1/3 avec N blocs (…), publie = false, sans trame."])
"""
import json


# ---------------------------------------------------------------------------
# Blocs (même format que ce que lisent formations.html et admin.html)
# ---------------------------------------------------------------------------
def txt(titre, *paragraphes):
    """Texte : titre et paragraphes. **gras** est interprété."""
    return ("texte", {"titre": titre, "paragraphes": list(paragraphes)})


def img(fichier, alt, legende, dossier="images/module1"):
    """Image : fichier dans le dossier images/… du dépôt (adresse relative à formations.html)."""
    return ("image", {"url": f"{dossier}/{fichier}.jpg", "alt": alt, "legende": legende})


def cit(texte):
    """Citation. Une retenue de ligne (\\n) sépare le texte de l'auteur."""
    return ("citation", {"texte": texte})


def refl(question, sous_titre, placeholder="Écrivez ce qui vous vient. Personne ne lira cette réponse."):
    """Temps de réflexion : zone de saisie qui reste sur l'appareil."""
    return ("reflexion", {"question": question, "sous_titre": sous_titre, "placeholder": placeholder})


def qst(enonce, options, explication):
    """Question à correction immédiate. options = [(texte, juste)] ; plusieurs justes = réponses multiples."""
    return ("question", {"enonce": enonce,
                         "options": [{"texte": t, "juste": j} for t, j in options],
                         "explication": explication})


def dlg(titre, contexte, repliques, consigne, reponse_modele, points):
    """Mise en situation. repliques = [(qui, texte)] ; points = points d'attention de la réponse possible."""
    return ("dialogue", {"label": "Mise en situation", "titre": titre, "contexte": contexte,
                         "repliques": [{"qui": q, "texte": t} for q, t in repliques],
                         "consigne": consigne, "reponse_modele": reponse_modele, "points": points})


def disc(titre, consigne, label="Échange avec les autres participants"):
    """Échange entre participants (messages relus dans l'admin). Voir partie 30 et 31."""
    return ("discussion", {"label": label, "titre": titre, "consigne": consigne})


# ---------------------------------------------------------------------------
# Générateurs de scripts SQL
# ---------------------------------------------------------------------------
def _j(o):
    return json.dumps(o, ensure_ascii=False)


def _verifier_guillemets(contenus):
    for c in contenus:
        if "$kk$" in _j(c):
            raise ValueError("Le contenu ne doit pas contenir la séquence « $kk$ » (utilisée pour citer le SQL).")


def _ligne_commentaire(lignes):
    return "\n-- ".join(lignes)


def sql_sequence(entete, partie, seq, theme_nom, partie_theme, titre, accroche, ordre, blocs, attendu):
    """
    Script d'une séquence en lecture seule : 1) la séquence dans un thème existant,
    2) ses blocs (ajoutés une seule fois), puis un contrôle. Reste en brouillon.

    entete        commentaire d'en-tête (se termine par une retenue de ligne)
    partie        numéro de la partie (ex. 28) ; seq : « 3/3 » ; ordre : rang dans le thème
    partie_theme  numéro de la partie qui a créé le thème (cité dans un message d'erreur)
    attendu       lignes du commentaire du contrôle final
    """
    _verifier_guillemets([c for _, c in blocs])
    n = len(blocs)
    lignes = ",\n".join(f"  ('{t}', $kk${_j(c)}$kk$::jsonb, {i})" for i, (t, c) in enumerate(blocs))
    return f"""{entete}
-- ---------------------------------------------------------------------------
-- {partie}.1 Séquence {seq} dans le thème e-learning. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare tid public.theme.id%type;
begin
  select id into tid from public.theme where nom = $kk${theme_nom}$kk$;
  if tid is null then raise notice '{partie}.1 : thème e-learning introuvable, exécuter la partie {partie_theme}'; return; end if;

  if not exists (select 1 from public.module where theme_id = tid and titre = $kk${titre}$kk$) then
    insert into public.module(theme_id, titre, accroche, publie, ordre, trame)
    values (tid, $kk${titre}$kk$,
            $kk${accroche}$kk$,
            false, {ordre}, null);
  end if;
end
$do$;
-- FIN {partie}.1

-- ---------------------------------------------------------------------------
-- {partie}.2 Blocs de la séquence. Attendu : aucune ligne retournée (blocs ajoutés une seule fois).
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk${theme_nom}$kk$ and m.titre = $kk${titre}$kk$;
  if mid is null then raise notice '{partie}.2 : séquence introuvable, exécuter {partie}.1'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid) then raise notice '{partie}.2 : déjà exécuté'; return; end if;

  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, v.type, v.contenu, v.ordre
  from (values
{lignes}
  ) as v(type, contenu, ordre);

  raise notice '{partie}.2 : {n} blocs ajoutés';
end
$do$;
-- FIN {partie}.2

-- ---------------------------------------------------------------------------
-- {partie}c Contrôle (lecture seule). Attendu : {_ligne_commentaire(attendu)}
-- ---------------------------------------------------------------------------
select m.titre, m.publie, (m.trame is null) as sans_trame, m.ordre,
       (select count(*) from public.bloc b where b.module_id = m.id) as blocs,
       (select string_agg(x.type || ' ' || x.n, ', ' order by x.type)
          from (select b.type, count(*) as n from public.bloc b where b.module_id = m.id group by b.type) x) as repartition
from public.module m join public.theme t on t.id = m.theme_id
where t.nom = $kk${theme_nom}$kk$ order by m.ordre;
-- FIN {partie}c
"""


def quiz_questions(questions, positions=None):
    """
    Prépare les questions d'un quiz. questions = [(énoncé, [(option, juste)], rotation, multi)].
    positions : {numéro de question: place voulue de la bonne réponse} pour répartir les
    bonnes réponses entre A, B, C et D (questions à réponse unique). Renvoie des dictionnaires
    {ordre, enonce, options, reponses, multi}.
    """
    positions = positions or {}
    sortie = []
    for i, (enonce, opts, rotation, multi) in enumerate(questions):
        n = len(opts)
        if not multi and i in positions:
            c = [j for j, (_, ok) in enumerate(opts) if ok][0]
            rotation = (c - positions[i]) % n
        k = rotation % n
        o = opts[k:] + opts[:k]
        sortie.append({"ordre": i, "enonce": enonce, "options": [t for t, _ in o],
                       "reponses": [j for j, (_, ok) in enumerate(o) if ok], "multi": multi})
    return sortie


def sql_quiz(entete, partie, quiz_titre, quiz_desc, theme_nom, questions, attendu):
    """
    Script d'un quiz de validation : 1) quiz non publié et ses questions, un contrôle, puis
    2) l'étape de publication et de rattachement au thème, À EXÉCUTER APRÈS RELECTURE.
    questions : liste produite par quiz_questions(). attendu : lignes du commentaire du contrôle.
    """
    n = len(questions)
    lignes = ",\n".join(
        f"  ({q['ordre']}, $kk${q['enonce']}$kk$, $kk${_j(q['options'])}$kk$::jsonb, '{_j(q['reponses'])}'::jsonb, "
        f"{'true' if q['multi'] else 'false'})" for q in questions)
    return f"""{entete}
-- ---------------------------------------------------------------------------
-- {partie}.1 Quiz et questions. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk${quiz_titre}$kk$;
  if qid is null then
    insert into public.quiz(titre, description, publie, mode)
    values ($kk${quiz_titre}$kk$,
            $kk${quiz_desc}$kk$,
            false, 'score')
    returning id into qid;
  end if;
  if exists (select 1 from public.questions where quiz_id = qid) then raise notice '{partie}.1 : questions déjà ajoutées'; return; end if;

  insert into public.questions(quiz_id, ordre, enonce, options, reponses, multi)
  select qid, v.ordre, v.enonce, v.options, v.reponses, v.multi
  from (values
{lignes}
  ) as v(ordre, enonce, options, reponses, multi);

  raise notice '{partie}.1 : {n} questions ajoutées';
end
$do$;
-- FIN {partie}.1

-- ---------------------------------------------------------------------------
-- {partie}c Contrôle (lecture seule). Attendu : {_ligne_commentaire(attendu)}
-- ---------------------------------------------------------------------------
select q.titre, q.mode, q.publie, count(s.id) as questions,
       count(*) filter (where s.multi) as a_reponses_multiples,
       (select t.quiz_id from public.theme t where t.nom = $kk${theme_nom}$kk$) as quiz_du_theme
from public.quiz q left join public.questions s on s.quiz_id = q.id
where q.titre = $kk${quiz_titre}$kk$
group by q.id, q.titre, q.mode, q.publie;
-- FIN {partie}c

-- ---------------------------------------------------------------------------
-- {partie}.2 Publication et rattachement au thème e-learning. À EXÉCUTER SEULEMENT
-- APRÈS RELECTURE. Le quiz devient accessible, et un lien « Quiz de validation »
-- apparaît à la fin du parcours. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk${quiz_titre}$kk$;
  if qid is null then raise notice '{partie}.2 : quiz introuvable, exécuter {partie}.1'; return; end if;
  update public.quiz set publie = true where id = qid;
  update public.theme set quiz_id = qid::text where nom = $kk${theme_nom}$kk$;
end
$do$;
-- FIN {partie}.2
"""
