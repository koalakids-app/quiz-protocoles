-- ============================================================================
-- PARTIE 24 — Visuels du module 1 « Développement et attachement »
-- Source : illustrations du support « Le paradoxe de l'accueil collectif »
-- (séparation et attachement sécure), recadrées et enregistrées dans
-- images/module1/. Ajoute 12 blocs « image » aux trois séquences, placés à côté
-- du texte de leur thème, avec une légende qui les introduit.
-- Prérequis : parties 13 et 23 exécutées ; le dossier images/module1/ est publié
-- avec l'application (les adresses sont relatives à formations.html).
-- À exécuter en 4 temps : 24.1, 24.2, 24.3, puis 24c.
-- Relançable : les blocs existants sont renumérotés d'après leur contenu (et non
-- leur position), et chaque image n'est ajoutée qu'une fois (repère : son adresse).
-- Le statut « publie » des séquences n'est pas modifié.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 24.1 Séquence 1/3 (Apport). Ajoute 5 images.
-- Ordre final : texte, image, image, image, scenes, image, citation (Stern), citation (Winnicott), image, retenir, reflexion, essayer. Contrôle : voir 24c (12 blocs).
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 1/3 %';
  if mid is null then raise notice '24.1 : séquence 1/3 introuvable'; return; end if;

  update public.bloc b
  set ordre = case
    when b.type = 'texte' then 0
    when b.type = 'scenes' then 4
    when b.type = 'citation' and b.contenu->>'texte' like '%Stern' then 6
    when b.type = 'citation' and b.contenu->>'texte' like '%Winnicott' then 7
    when b.type = 'retenir' then 9
    when b.type = 'reflexion' then 10
    when b.type = 'essayer' then 11
    else b.ordre end
  where b.module_id = mid and b.type <> 'image';

  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/accueil-collectif.jpg", "alt": "Deux mains qui se rejoignent entre deux motifs colorés", "legende": "Accueillir, c'est d'abord séparer : l'enfant quitte ses premières figures d'attachement pour entrer dans un collectif."}$kk$::jsonb, 1
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/accueil-collectif.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/enzo.jpg", "alt": "Un bébé aux grands yeux, accroché à l'épaule de sa maman", "legende": "Enzo, 9 mois : son regard attentif, son accrochage et ses pleurs disent sa peur."}$kk$::jsonb, 2
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/enzo.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/julia.jpg", "alt": "Silhouette d'un tout-petit à quatre pattes au milieu de traits rouges et noirs agités", "legende": "Julia, 20 mois : une tempête intérieure qu'elle ne peut ni nommer, ni réguler seule."}$kk$::jsonb, 3
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/julia.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/cerveau.jpg", "alt": "Schéma d'un cerveau immature, où l'amygdale domine, et d'un cerveau mature, où le cortex préfrontal régule", "legende": "Pourquoi cette réaction ? Le cerveau émotionnel domine et le régulateur est encore en construction : l'enfant ne peut pas contrôler ses émotions, il a besoin d'un adulte co-régulateur."}$kk$::jsonb, 5
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/cerveau.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/base-securite.jpg", "alt": "Un adulte penché vers un enfant, reliés par un fil lumineux", "legende": "La base de sécurité : c'est parce qu'il a connu une dépendance sécurisante que l'enfant devient capable d'explorer et d'être seul."}$kk$::jsonb, 8
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/base-securite.jpg');

  raise notice '24.1 : terminé';
end
$do$;
-- FIN 24.1

-- ---------------------------------------------------------------------------
-- 24.2 Séquence 2/3 (Analyse d'une situation vécue). Ajoute 2 images.
-- Ordre final : texte, scenes, comparaison, image, image, comparaison, reflexion, essayer. Contrôle : voir 24c (8 blocs).
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 2/3 %';
  if mid is null then raise notice '24.2 : séquence 2/3 introuvable'; return; end if;

  update public.bloc b
  set ordre = case
    when b.type = 'texte' then 0
    when b.type = 'scenes' then 1
    when b.type = 'comparaison' and b.contenu->>'intro' like 'Pour accompagner%' then 2
    when b.type = 'comparaison' and b.contenu->>'intro' like '%Face à une tempête émotionnelle%' then 5
    when b.type = 'reflexion' then 6
    when b.type = 'essayer' then 7
    else b.ordre end
  where b.module_id = mid and b.type <> 'image';

  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/competences-emotionnelles.jpg", "alt": "Trois étapes du développement émotionnel : de 0 à 3 mois, de 3 à 24 mois, de 2 à 6 ans", "legende": "L'adulte construit la régulation émotionnelle par étapes : co-régulateur externe, puis miroir des émotions, jusqu'à la régulation par l'enfant lui-même."}$kk$::jsonb, 3
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/competences-emotionnelles.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/reactions-adulte.jpg", "alt": "Deux cerveaux : réactions soutenantes de l'adulte et réactions non soutenantes, avec leur impact", "legende": "Face à une tempête émotionnelle, la réaction de l'adulte apaise et construit, ou renforce l'insécurité."}$kk$::jsonb, 4
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/reactions-adulte.jpg');

  raise notice '24.2 : terminé';
end
$do$;
-- FIN 24.2

-- ---------------------------------------------------------------------------
-- 24.3 Séquence 3/3 (Test d'une pratique et retour d'expérience). Ajoute 5 images.
-- Ordre final : texte, texte (parents), image, texte (continuité), image, image, citation (Charte), image, retenir, reflexion, essayer, image, citation (Maurice). Contrôle : voir 24c (13 blocs).
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 3/3 %';
  if mid is null then raise notice '24.3 : séquence 3/3 introuvable'; return; end if;

  update public.bloc b
  set ordre = case
    when b.type = 'texte' and b.contenu->>'titre' like 'Arrivées et départs%' then 0
    when b.type = 'texte' and b.contenu->>'titre' like 'Confier son enfant%' then 1
    when b.type = 'texte' and b.contenu->>'titre' like 'Tisser un fil%' then 3
    when b.type = 'citation' and b.contenu->>'texte' like '%Charte%' then 6
    when b.type = 'retenir' then 8
    when b.type = 'reflexion' then 9
    when b.type = 'essayer' then 10
    when b.type = 'citation' and b.contenu->>'texte' like '%Martine Maurice' then 12
    else b.ordre end
  where b.module_id = mid and b.type <> 'image';

  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/parents.jpg", "alt": "Silhouette d'un parent dont la poitrine est occupée par un nœud de fils, un petit enfant à distance", "legende": "Confier son enfant est une épreuve : les angoisses du parent se communiquent à l'enfant."}$kk$::jsonb, 2
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/parents.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/pont-maison-creche.jpg", "alt": "Un pont entre une maison et une crèche, traversé par des enfants, au-dessus d'une poignée de main", "legende": "Le professionnel est un pont entre la maison et la crèche : il construit le « sentiment de continuité d'être » de l'enfant."}$kk$::jsonb, 4
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/pont-maison-creche.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/fils-continuite.jpg", "alt": "Les trois fils de la continuité : figure de sécurité de substitution, continuité relationnelle, continuité de l'environnement", "legende": "Trois fils à tisser : une figure de sécurité de substitution, des interactions prévisibles et chaleureuses, un cadre de vie stable."}$kk$::jsonb, 5
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/fils-continuite.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/alliance.jpg", "alt": "Mains d'adultes et main d'enfant superposées", "legende": "Une alliance avec les parents : construire la confiance, reconnaître leur expertise, soutenir la parentalité sans jugement."}$kk$::jsonb, 7
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/alliance.jpg');
  insert into public.bloc(module_id, type, contenu, ordre)
  select mid, 'image', $kk${"url": "images/module1/tuteur-resilience.jpg", "alt": "Une main ouverte portant une jeune pousse", "legende": "Le professionnel est un « tuteur de résilience » : une base de sécurité fiable pour que l'enfant grandisse."}$kk$::jsonb, 11
  where not exists (select 1 from public.bloc where module_id = mid and type = 'image' and contenu->>'url' = 'images/module1/tuteur-resilience.jpg');

  raise notice '24.3 : terminé';
end
$do$;
-- FIN 24.3

-- ---------------------------------------------------------------------------
-- 24c Contrôle (lecture seule). Attendu : blocs 12 / 8 / 13, dont 5 / 2 / 5 images.
-- ---------------------------------------------------------------------------
select m.titre, m.publie,
       (select count(*) from public.bloc b where b.module_id = m.id) as blocs,
       (select count(*) from public.bloc b where b.module_id = m.id and b.type = 'image') as images,
       (select string_agg(b.type, ' > ' order by b.ordre) from public.bloc b where b.module_id = m.id) as ordre_blocs
from public.module m where m.titre like 'Module 1 %/3 %' order by m.ordre;
-- FIN 24c
