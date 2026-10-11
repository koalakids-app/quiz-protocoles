-- ============================================================================
-- PARTIE 32 — Quiz de validation rattaché au thème animé du module 1
-- Rattache le quiz « Quiz de validation : développement et attachement » (partie 29)
-- au thème « Module 1 – Développement et attachement » (séances animées de 45 min),
-- comme il l'est déjà au thème e-learning (étape 29.2).
-- Effet : la dernière microséquence et la page du thème proposent « Passer le quiz
-- de validation ». Un seul quiz sert aux deux versions : leurs résultats sont
-- enregistrés ensemble dans la table resultats.
-- Prérequis : partie 29 exécutée (quiz créé et publié, étape 29.2).
-- À exécuter en 2 temps : 32.1, puis 32c.
-- Relançable : ne fait rien si le thème a déjà un quiz (le même ou un autre).
-- Pour annuler : update public.theme set quiz_id = null
--                where nom = 'Module 1 – Développement et attachement';
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 32.1 Rattachement. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type; actuel text;
begin
  select id into qid from public.quiz where titre = $kk$Quiz de validation : développement et attachement$kk$;
  if qid is null then raise notice '32.1 : quiz introuvable, exécuter la partie 29'; return; end if;

  select quiz_id into actuel from public.theme where nom = $kk$Module 1 – Développement et attachement$kk$;
  if not found then raise notice '32.1 : thème animé introuvable'; return; end if;
  if actuel is not null then
    raise notice '32.1 : le thème a déjà un quiz (%), rien à faire', actuel;
    return;
  end if;

  update public.theme set quiz_id = qid::text
  where nom = $kk$Module 1 – Développement et attachement$kk$ and quiz_id is null;
  raise notice '32.1 : quiz rattaché au thème animé';
end
$do$;
-- FIN 32.1

-- ---------------------------------------------------------------------------
-- 32c Contrôle (lecture seule). Attendu : 2 lignes (thème animé et thème e-learning),
-- toutes deux rattachées au quiz de validation, quiz publié.
-- ---------------------------------------------------------------------------
select t.nom, t.quiz_id, (t.quiz_id = q.id::text) as rattache_au_quiz_de_validation, q.publie as quiz_publie
from public.theme t
cross join public.quiz q
where q.titre = 'Quiz de validation : développement et attachement'
  and t.nom like 'Module 1 – Développement et attachement%'
order by t.nom;
-- FIN 32c
