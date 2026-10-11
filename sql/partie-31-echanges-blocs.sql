-- ============================================================================
-- PARTIE 31 — Un bloc « Échange » dans chacune des trois séquences e-learning
-- du module 1. Chaque bloc invite les participants à partager un court message,
-- relu dans l'admin (onglet « Échanges ») avant d'être affiché.
--   1/3 : « Quel geste vous aide à rassurer un enfant à son arrivée ? »
--   2/3 : « Comment votre équipe s'organise-t-elle pour qu'un enfant trouve au
--           moins une base stable ? »
--   3/3 : « Quelle pratique commune votre équipe pourrait-elle choisir ? »
-- Chaque bloc est placé avant la section « Pour aller plus loin » (1/3 et 2/3) ou
-- juste après la réflexion sur la pratique commune (3/3) ; les blocs suivants sont
-- décalés d'un rang.
-- Prérequis : partie 30 exécutée (table, droits, type « discussion ») et
-- application déployée avec le type de bloc « discussion ».
-- À exécuter en 4 temps : 31.1, 31.2, 31.3, puis 31c.
-- Relançable : un bloc « Échange » n'est ajouté que si la séquence n'en contient pas.
-- Les séquences gardent leur statut (publiées) : l'échange est visible dès l'exécution.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 31.1 Séquence 1/3. Insère le bloc au rang 42 et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$ and m.titre = $kk$Module 1 – 1/3 · Apport (e-learning)$kk$;
  if mid is null then raise notice '31.1 : séquence 1/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'discussion') then raise notice '31.1 : déjà exécuté'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= 42;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'discussion', $kk${"label": "Échange avec les autres participants", "titre": "Partagez un geste", "consigne": "Quel geste vous aide à rassurer un enfant à son arrivée ? Partagez-le en une ou deux phrases, puis lisez ce que proposent les autres participants : vous y trouverez peut-être une idée à tester."}$kk$::jsonb, 42);

  raise notice '31.1 : bloc Échange ajouté';
end
$do$;
-- FIN 31.1

-- ---------------------------------------------------------------------------
-- 31.2 Séquence 2/3. Insère le bloc au rang 24 et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$ and m.titre = $kk$Module 1 – 2/3 · Analyse d'une situation vécue (e-learning)$kk$;
  if mid is null then raise notice '31.2 : séquence 2/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'discussion') then raise notice '31.2 : déjà exécuté'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= 24;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'discussion', $kk${"label": "Échange avec les autres participants", "titre": "Partagez une pratique d'équipe", "consigne": "Comment votre équipe s'organise-t-elle pour qu'un enfant trouve au moins une base stable ? Partagez une idée ou une pratique, sans nom d'enfant ni de collègue."}$kk$::jsonb, 24);

  raise notice '31.2 : bloc Échange ajouté';
end
$do$;
-- FIN 31.2

-- ---------------------------------------------------------------------------
-- 31.3 Séquence 3/3. Insère le bloc au rang 20 et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$ and m.titre = $kk$Module 1 – 3/3 · Test d'une pratique et retour d'expérience (e-learning)$kk$;
  if mid is null then raise notice '31.3 : séquence 3/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'discussion') then raise notice '31.3 : déjà exécuté'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= 20;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'discussion', $kk${"label": "Échange avec les autres participants", "titre": "Partagez une pratique commune", "consigne": "Quelle pratique commune votre équipe pourrait-elle choisir pour des arrivées et des départs plus sûrs ? Formulez-la en une phrase."}$kk$::jsonb, 20);

  raise notice '31.3 : bloc Échange ajouté';
end
$do$;
-- FIN 31.3

-- ---------------------------------------------------------------------------
-- 31c Contrôle (lecture seule). Attendu : blocs 44 / 26 / 28, un bloc « discussion »
-- par séquence, aucun doublon d'ordre.
-- ---------------------------------------------------------------------------
select m.titre, m.publie,
       (select count(*) from public.bloc b where b.module_id = m.id) as blocs,
       (select count(distinct b.ordre) from public.bloc b where b.module_id = m.id) as ordres_distincts,
       (select b.ordre from public.bloc b where b.module_id = m.id and b.type = 'discussion') as rang_echange,
       (select b.contenu->>'titre' from public.bloc b where b.module_id = m.id and b.type = 'discussion') as titre_echange
from public.module m join public.theme t on t.id = m.theme_id
where t.nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$ order by m.ordre;
-- FIN 31c
