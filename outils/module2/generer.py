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
from contenu import sql_sequence  # noqa: E402
import seq1  # noqa: E402


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
-- Les prénoms (Mia, Rayan, Inès, Hugo) sont fictifs : ce ne sont pas des enfants du site.
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


if __name__ == "__main__":
    chemin = os.path.join(RACINE, "sql", "partie-33-elearning-module2-seq1.sql")
    with open(chemin, "w", encoding="utf-8") as f:
        f.write(partie33())
    print(chemin, "écrit")
