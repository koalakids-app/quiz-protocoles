#!/usr/bin/env python3
"""
Génère les scripts SQL du module 2 e-learning à partir du contenu écrit en Python (seqN.py).
    python3 outils/module2/generer.py            # écrit sql/partie-33-… (séquence 1/3)
"""
import os, re, sys
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
sys.path.insert(0, os.path.join(ICI, ".."))
sys.path.insert(0, ICI)
from contenu import sql_quiz, sql_sequence  # noqa: E402
import seq1, seq2, seq3, quiz, visuels  # noqa: E402
import json  # noqa: E402


def comptage(blocs):
    n = {}
    for t, _ in blocs:
        n[t] = n.get(t, 0) + 1
    return ", ".join(f"{v} {k}" for k, v in sorted(n.items(), key=lambda kv: (-kv[1], kv[0])))


def partie33():
    s = seq1
    entete = f"""-- ============================================================================
-- PARTIE 33 — Version e-learning du module 2 : thème et séquence 1/3 (Apport)
-- Source : projet pédagogique Koala Kids (partie 3 : réponse aux besoins affectifs,
-- tempêtes émotionnelles, postures « port d'attache » et « boussole », violences
-- éducatives ordinaires) et séance animée 1/3 du module 2.
-- Crée un second thème, en parallèle de la séance animée de 45 min, avec une séquence
-- en lecture seule d'environ 30 minutes : {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),
-- dont 7 questions avec correction, 3 mises en situation, 3 temps de réflexion et un bloc « Échange ».
-- LA SÉQUENCE RESTE EN BROUILLON (publie = false).
-- Prérequis : parties 25 (types « question » et « dialogue ») et 30 (type « discussion »)
-- exécutées. Aucune image dans cette version.
-- À exécuter en 3 temps : 33.1, 33.2, puis 33c.
-- Relançable : le thème et la séquence ne sont créés qu'une fois, et les blocs
-- ne sont ajoutés que si la séquence n'en contient aucun.
-- Les prénoms (Mia, Rayan, Nina, Malo) sont fictifs : ce ne sont pas des enfants du site.
-- ============================================================================
"""
    gen = sql_sequence(entete=entete, partie=33, seq="1/3", theme_nom=s.THEME_NOM, partie_theme=33,
                       titre=s.MODULE_TITRE, accroche=s.ACCROCHE, ordre=s.ORDRE, blocs=s.BLOCS,
                       attendu=[f"séquence 1/3 avec {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),",
                                "publie = false, sans trame."])
    bloc1 = f"""-- ---------------------------------------------------------------------------
-- 33.1 Thème et séquence. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare tid public.theme.id%type;
begin
  select id into tid from public.theme where nom = $kk${s.THEME_NOM}$kk$;
  if tid is null then
    insert into public.theme(nom, description, ordre, programme)
    values ($kk${s.THEME_NOM}$kk$,
            $kk${s.THEME_DESC}$kk$,
            {s.THEME_ORDRE}, 'Programme de formation (Modules 1 à 10)')
    returning id into tid;
  end if;

  if not exists (select 1 from public.module where theme_id = tid and titre = $kk${s.MODULE_TITRE}$kk$) then
    insert into public.module(theme_id, titre, accroche, publie, ordre, trame)
    values (tid, $kk${s.MODULE_TITRE}$kk$,
            $kk${s.ACCROCHE}$kk$,
            false, {s.ORDRE}, null);
  end if;
end
$do$;
-- FIN 33.1

"""
    sortie, n = re.subn(r"-- -{70,}\n-- 33\.1 .*?-- FIN 33\.1\n\n", lambda m: bloc1, gen, flags=re.S)
    assert n == 1
    return sortie


def partie34():
    s = seq2
    entete = f"""-- ============================================================================
-- PARTIE 34 — Version e-learning du module 2 : séquence 2/3 (Analyse d'une situation vécue)
-- Source : projet pédagogique Koala Kids (partie 3 : apprentissage des règles sociales,
-- cadre commun, conflits entre enfants, violences éducatives ordinaires considérées comme
-- des fautes professionnelles) et séance animée 2/3 du module 2 (quatre questions d'analyse).
-- Séquence en lecture seule d'environ 30 minutes : {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),
-- dont 7 questions avec correction, 3 mises en situation, 3 temps de réflexion et un bloc « Échange ».
-- LA SÉQUENCE RESTE EN BROUILLON (publie = false).
-- Prérequis : partie 33 exécutée (thème e-learning du module 2), parties 25 et 30.
-- À exécuter en 3 temps : 34.1, 34.2, puis 34c.
-- Relançable : la séquence n'est créée qu'une fois, et les blocs ne sont ajoutés que si
-- la séquence n'en contient aucun.
-- Les prénoms (Kenzo, Elio, Maya, Sofia, Ismaël, Louise, Gabin) sont fictifs : ce ne sont pas des enfants du site.
-- ============================================================================
"""
    return sql_sequence(entete=entete, partie=34, seq="2/3", theme_nom=s.THEME_NOM, partie_theme=33,
                        titre=s.MODULE_TITRE, accroche=s.ACCROCHE, ordre=s.ORDRE, blocs=s.BLOCS,
                        attendu=[f"2 lignes (séquences 1/3 et 2/3) ; la 2/3 avec {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),",
                                 "publie = false, sans trame."])


def partie35():
    s = seq3
    entete = f"""-- ============================================================================
-- PARTIE 35 — Version e-learning du module 2 : séquence 3/3 (Test d'une pratique et retour d'expérience)
-- Source : projet pédagogique Koala Kids (partie 3 : accompagner les enfants dans leurs émotions,
-- tempêtes émotionnelles, posture « boussole », attention portée aux paroles) et séance animée 3/3
-- du module 2 (retour d'expérience en quatre questions, pratique commune sur deux semaines).
-- Séquence en lecture seule d'environ 30 minutes : {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),
-- dont 7 questions avec correction, 3 mises en situation, 3 temps de réflexion et un bloc « Échange ».
-- LA SÉQUENCE RESTE EN BROUILLON (publie = false).
-- Prérequis : partie 33 exécutée (thème e-learning du module 2), parties 25 et 30.
-- À exécuter en 3 temps : 35.1, 35.2, puis 35c.
-- Relançable : la séquence n'est créée qu'une fois, et les blocs ne sont ajoutés que si
-- la séquence n'en contient aucun.
-- Les prénoms (Ilyès, Anaïs, Naël) sont fictifs : ce ne sont pas des enfants du site.
-- ============================================================================
"""
    return sql_sequence(entete=entete, partie=35, seq="3/3", theme_nom=s.THEME_NOM, partie_theme=33,
                        titre=s.MODULE_TITRE, accroche=s.ACCROCHE, ordre=s.ORDRE, blocs=s.BLOCS,
                        attendu=[f"3 lignes (séquences 1/3, 2/3 et 3/3) ; la 3/3 avec {len(s.BLOCS)} blocs ({comptage(s.BLOCS)}),",
                                 "publie = false, sans trame."])


def partie36():
    entete = """-- ============================================================================
-- PARTIE 36 — Quiz de validation du module 2 « Émotions, pleurs, cadre sans violence »
-- (version e-learning). Même format que les autres quiz de validation : mode « score »,
-- corrigé immédiat, seuil de réussite de 80 %.
-- 10 questions couvrant les trois séquences : le pleur comme signal et la réponse de
-- l'adulte, les tempêtes émotionnelles et le corps qui parle (séquence 1), le cadre commun,
-- la reprise sans punir et les fautes professionnelles (séquence 2), la boussole, les
-- paroles devant l'enfant et la pratique commune (séquence 3). Les questions reformulent
-- les notions du parcours avec d'autres cas, sans reprendre ses questions mot pour mot.
-- LE QUIZ EST CRÉÉ NON PUBLIÉ et n'est rattaché à aucun thème : l'étape 36.2
-- (publication et rattachement aux DEUX thèmes, e-learning et animé) est à exécuter
-- seulement après relecture. Un seul quiz sert aux deux versions : leurs résultats sont
-- enregistrés ensemble dans la table resultats.
-- À exécuter en 3 temps : 36.1, 36c, puis (après relecture) 36.2 et 36d.
-- Prérequis : partie 33 exécutée (thème e-learning). Le thème animé existe déjà.
-- Relançable : le quiz n'est créé qu'une fois, les questions ne sont ajoutées
-- que si le quiz n'en contient aucune.
-- ============================================================================
"""
    gen = sql_quiz(entete=entete, partie=36, quiz_titre=quiz.QUIZ_TITRE, quiz_desc=quiz.QUIZ_DESC,
                   theme_nom=seq1.THEME_NOM, questions=quiz.QUESTIONS,
                   attendu=["1 quiz, mode score, 10 questions",
                            "dont 2 à réponses multiples, publie = false, themes_rattaches = 0."])
    anime = quiz.THEME_ANIME
    # contrôle : aucun thème rattaché
    gen = gen.replace(f"(select t.quiz_id from public.theme t where t.nom = $kk${seq1.THEME_NOM}$kk$) as quiz_du_theme",
                      "(select count(*) from public.theme t where t.quiz_id = q.id::text) as themes_rattaches")
    # 36.2 : les deux thèmes
    ancien = f"  update public.theme set quiz_id = qid::text where nom = $kk${seq1.THEME_NOM}$kk$;\n"
    assert ancien in gen
    gen = gen.replace(ancien, f"  update public.theme set quiz_id = qid::text\n  where nom in ($kk${seq1.THEME_NOM}$kk$, $kk${anime}$kk$);\n")
    gen = gen.replace("-- 36.2 Publication et rattachement au thème e-learning.", "-- 36.2 Publication et rattachement aux thèmes e-learning et animé.")
    gen = gen.replace("apparaît à la fin du parcours.", "apparaît à la fin du parcours et de la dernière microséquence animée.")
    controle2 = f"""
-- ---------------------------------------------------------------------------
-- 36d Contrôle après publication (lecture seule). Attendu : 2 lignes (thème animé et thème
-- e-learning), toutes deux rattachées au quiz de validation, quiz publié.
-- ---------------------------------------------------------------------------
select t.nom, t.quiz_id, (t.quiz_id = q.id::text) as rattache_au_quiz_de_validation, q.publie as quiz_publie
from public.theme t
cross join public.quiz q
where q.titre = $kk${quiz.QUIZ_TITRE}$kk$
  and t.nom like 'Module 2 – Émotions, pleurs, cadre sans violence%'
order by t.nom;
-- FIN 36d
"""
    return gen + controle2


def partie37():
    entete = """-- ============================================================================
-- PARTIE 37 — Visuels du module 2 « Émotions, pleurs, cadre sans violence » (e-learning)
-- Source : infographie « Accompagner le plein potentiel du jeune enfant », découpée en trois
-- visuels (images/module2/, moins de 100 Ko, adresses relatives à formations.html). Ajoute
-- un bloc « image » à chacune des trois séquences, placé juste après le texte de son thème,
-- avec une légende qui reprend le texte de l'infographie :
--   1/3 : « Le port d'attache » (après « Port d'attache, boussole ») ;
--   2/3 : « Du guidage à l'accompagnement » (après « Les règles s'apprennent après le monde ») ;
--   3/3 : « Phare et boussole » (après « Prêter sa boussole »).
-- Prérequis : parties 33, 34 et 35 exécutées ; le dossier images/module2/ est publié avec
-- l'application (donc cette partie est à exécuter APRÈS la fusion de la PR qui l'ajoute).
-- À exécuter en 4 temps : 37.1, 37.2, 37.3, puis 37c.
-- Relançable : chaque image n'est ajoutée qu'une fois (repère : son adresse) ; les blocs
-- suivants sont décalés d'un rang. Le statut « publie » des séquences n'est pas modifié.
-- ============================================================================
"""
    morceaux = [entete]
    for im in visuels.IMAGES:
        url = f"images/module2/{im['fichier']}.jpg"
        contenu = json.dumps({"url": url, "alt": im["alt"], "legende": im["legende"]}, ensure_ascii=False)
        morceaux.append(f"""
-- ---------------------------------------------------------------------------
-- {im['partie_sous']} Séquence {im['seq']}. Insère l'image après le texte « {im['ancre']} » et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type; pos integer;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk${visuels.THEME_NOM}$kk$ and m.titre = $kk${im['titre']}$kk$;
  if mid is null then raise notice '{im['partie_sous']} : séquence {im['seq']} introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = '{url}') then raise notice '{im['partie_sous']} : déjà exécuté'; return; end if;

  select b.ordre + 1 into pos from public.bloc b
  where b.module_id = mid and b.type = 'texte' and b.contenu->>'titre' = $kk${im['ancre']}$kk$;
  if pos is null then raise notice '{im['partie_sous']} : bloc repère introuvable'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= pos;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'image', $kk${contenu}$kk$::jsonb, pos);

  raise notice '{im['partie_sous']} : image ajoutée au rang %', pos;
end
$do$;
-- FIN {im['partie_sous']}
""")
    morceaux.append(f"""
-- ---------------------------------------------------------------------------
-- 37c Contrôle (lecture seule). Attendu : 3 lignes (30 / 28 / 29 blocs), un bloc « image »
-- par séquence placé juste après son texte repère, aucun doublon d'ordre, publie = false.
-- ---------------------------------------------------------------------------
select m.titre, m.publie,
       (select count(*) from public.bloc b where b.module_id = m.id) as blocs,
       (select count(distinct b.ordre) from public.bloc b where b.module_id = m.id) as ordres_distincts,
       (select b.ordre from public.bloc b where b.module_id = m.id and b.type = 'image') as rang_image,
       (select b.contenu->>'url' from public.bloc b where b.module_id = m.id and b.type = 'image') as image,
       (select a.contenu->>'titre' from public.bloc a where a.module_id = m.id
          and a.ordre = (select i.ordre - 1 from public.bloc i where i.module_id = m.id and i.type = 'image')) as texte_precedent
from public.module m join public.theme t on t.id = m.theme_id
where t.nom = $kk${visuels.THEME_NOM}$kk$ order by m.ordre;
-- FIN 37c
""")
    return "".join(morceaux)


if __name__ == "__main__":
    for nom, f in (("partie-33-elearning-module2-seq1.sql", partie33), ("partie-34-elearning-module2-seq2.sql", partie34),
                   ("partie-35-elearning-module2-seq3.sql", partie35),
                   ("partie-36-quiz-validation-module2.sql", partie36),
                   ("partie-37-visuels-module2.sql", partie37)):
        chemin = os.path.join(RACINE, "sql", nom)
        with open(chemin, "w", encoding="utf-8") as fh:
            fh.write(f())
        print(chemin, "écrit")
