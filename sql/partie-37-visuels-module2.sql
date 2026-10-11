-- ============================================================================
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

-- ---------------------------------------------------------------------------
-- 37.1 Séquence 1/3. Insère l'image après le texte « Port d'attache, boussole » et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type; pos integer;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 2 – Émotions, pleurs, cadre sans violence (e-learning)$kk$ and m.titre = $kk$Module 2 – 1/3 · Apport (e-learning)$kk$;
  if mid is null then raise notice '37.1 : séquence 1/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module2/port-attache.jpg') then raise notice '37.1 : déjà exécuté'; return; end if;

  select b.ordre + 1 into pos from public.bloc b
  where b.module_id = mid and b.type = 'texte' and b.contenu->>'titre' = $kk$Port d'attache, boussole$kk$;
  if pos is null then raise notice '37.1 : bloc repère introuvable'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= pos;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'image', $kk${"url": "images/module2/port-attache.jpg", "alt": "Un enfant de dos s'aventure sur un chemin qui domine des vagues de papier découpé ; plus haut, deux enfants jouent. Texte : le professionnel « port d'attache » offre la sécurité affective indispensable pour permettre à l'enfant de s'aventurer.", "legende": "Le port d'attache offre la sécurité affective indispensable pour permettre à l'enfant de s'aventurer."}$kk$::jsonb, pos);

  raise notice '37.1 : image ajoutée au rang %', pos;
end
$do$;
-- FIN 37.1

-- ---------------------------------------------------------------------------
-- 37.2 Séquence 2/3. Insère l'image après le texte « Les règles s'apprennent après le monde » et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type; pos integer;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 2 – Émotions, pleurs, cadre sans violence (e-learning)$kk$ and m.titre = $kk$Module 2 – 2/3 · Analyse d'une situation vécue (e-learning)$kk$;
  if mid is null then raise notice '37.2 : séquence 2/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module2/guidage-accompagnement.jpg') then raise notice '37.2 : déjà exécuté'; return; end if;

  select b.ordre + 1 into pos from public.bloc b
  where b.module_id = mid and b.type = 'texte' and b.contenu->>'titre' = $kk$Les règles s'apprennent après le monde$kk$;
  if pos is null then raise notice '37.2 : bloc repère introuvable'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= pos;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'image', $kk${"url": "images/module2/guidage-accompagnement.jpg", "alt": "Titre « Accompagner le plein potentiel du jeune enfant » et encadré « Du guidage à l'accompagnement », à côté d'un paysage de vagues et de soleil en papier découpé.", "legende": "Du guidage à l'accompagnement : l'enfant guide le professionnel, qui s'adapte à son rythme et à sa pensée. Le jeune enfant est un être complet et compétent d'emblée."}$kk$::jsonb, pos);

  raise notice '37.2 : image ajoutée au rang %', pos;
end
$do$;
-- FIN 37.2

-- ---------------------------------------------------------------------------
-- 37.3 Séquence 3/3. Insère l'image après le texte « Prêter sa boussole » et décale les suivants. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type; pos integer;
begin
  select m.id into mid from public.module m join public.theme t on t.id = m.theme_id
  where t.nom = $kk$Module 2 – Émotions, pleurs, cadre sans violence (e-learning)$kk$ and m.titre = $kk$Module 2 – 3/3 · Test d'une pratique et retour d'expérience (e-learning)$kk$;
  if mid is null then raise notice '37.3 : séquence 3/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module2/phare-boussole.jpg') then raise notice '37.3 : déjà exécuté'; return; end if;

  select b.ordre + 1 into pos from public.bloc b
  where b.module_id = mid and b.type = 'texte' and b.contenu->>'titre' = $kk$Prêter sa boussole$kk$;
  if pos is null then raise notice '37.3 : bloc repère introuvable'; return; end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= pos;
  insert into public.bloc(module_id, type, contenu, ordre)
  values (mid, 'image', $kk${"url": "images/module2/phare-boussole.jpg", "alt": "Un phare dont le faisceau éclaire un enfant qui empile des cubes, et une boussole. Texte : le professionnel « phare » s'enthousiasme pour les recherches de l'enfant ; le professionnel « boussole » accueille toutes les émotions comme légitimes et guide les apprentissages sociaux.", "legende": "La boussole accueille toutes les émotions comme légitimes et guide les apprentissages sociaux. Le phare, lui, s'enthousiasme pour les recherches de l'enfant et étaye ses découvertes."}$kk$::jsonb, pos);

  raise notice '37.3 : image ajoutée au rang %', pos;
end
$do$;
-- FIN 37.3

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
where t.nom = $kk$Module 2 – Émotions, pleurs, cadre sans violence (e-learning)$kk$ order by m.ordre;
-- FIN 37c
