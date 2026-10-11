-- ============================================================================
-- PARTIE 23 — Complément du module 1 « Développement et attachement »
-- Source : support « Le paradoxe de l'accueil collectif — de la rupture invisible
-- au havre de sécurité pour le jeune enfant » (séparation et attachement sécure :
-- Bowlby, Winnicott, Miriam Rasse, Charte nationale d'accueil du jeune enfant,
-- Martine Maurice). Complète la partie 13, qui reste inchangée.
-- Les séquences RESTENT EN BROUILLON.
-- À exécuter en 4 temps : 23.1, 23.2, 23.3, puis 23c.
-- Relançable : chaque temps ne fait rien s'il a déjà été exécuté
-- (repère : le titre du bloc ajouté) ; les mises à jour de trame et de
-- « À retenir » remplacent les valeurs, donc sans effet au second passage.
-- Prérequis : la partie 13 (13.1a à 13.3b) a déjà été exécutée.
-- Les prénoms Enzo et Julia sont ceux de vignettes du support, pas d'enfants du site.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 23.1 Séquence 1/3 (Apport). Ajoute : vignettes Enzo et Julia, citation Winnicott,
-- 4e point « À retenir », 4e idée de l'Apport.
-- Ordre final : texte, scenes, citation (Stern), citation (Winnicott), retenir,
-- reflexion, essayer. Contrôle : voir 23c (7 blocs).
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 1/3 %';
  if mid is null then raise notice '23.1 : séquence 1/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and contenu->>'titre' = 'Enzo et Julia : ce que dit leur réaction') then
    raise notice '23.1 : déjà exécuté'; return;
  end if;

  update public.bloc set ordre = ordre + 2 where module_id = mid and ordre >= 2;
  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre = 1;

  insert into public.bloc(module_id, type, contenu, ordre) values
  (mid, 'scenes', $kk${"titre": "Enzo et Julia : ce que dit leur réaction", "items": [{"lettre": "A", "titre": "Enzo, 9 mois, se fige puis pleure", "texte": "Enzo entre pour la première fois dans la section des bébés. Il balaie la pièce du regard, s'accroche aux bras de sa maman et, dès que son regard se pose sur un adulte inconnu, il se fige puis se met à pleurer.", "analyse": "ce n'est pas un caprice. Son système d'attachement s'active face à ce qu'il perçoit comme un danger : son regard attentif, son accrochage et ses pleurs disent sa peur et son besoin de protection."}, {"lettre": "B", "titre": "Julia, 20 mois, se jette par terre", "texte": "Le visage de Julia se fige quand sa mère annonce son départ. Elle s'accroche à ses jambes, puis se jette par terre quand elle disparaît. À plat ventre, elle crie, tape des pieds et des mains sur le sol.", "analyse": "elle proteste contre l'angoisse de perte. Elle est débordée : son corps exprime une colère et une frustration qu'elle ne peut ni nommer, ni réguler seule."}]}$kk$::jsonb, 1),
  (mid, 'citation', $kk${"texte": "« Un bébé (tout seul) cela n'existe pas. Il fait essentiellement partie d'une relation. »\nD. W. Winnicott"}$kk$::jsonb, 3);

  raise notice '23.1 : 2 blocs ajoutés';
end
$do$;

-- 4e point « À retenir » (remplace la liste : sans effet au second passage)
update public.bloc b
set contenu = jsonb_set(b.contenu, '{points}', $kk$["**La sécurité vient avant l'exploration :** un enfant insécurisé cherche d'abord à se sécuriser et n'est pas disponible pour jouer.", "**Chaque enfant est à un endroit différent :** « sécure » ou « insécure », on observe pour adapter notre accompagnement.", "**Répondre aux signaux** de façon chaleureuse et régulière : bras, mots, consolation. L'enfant apprend qu'il peut compter sur nous.", "**Un jeune enfant ne peut pas réguler seul ses émotions :** pleurs ou colère à la séparation ne sont pas un caprice. Il a besoin d'un adulte qui l'aide à se calmer."]$kk$::jsonb)
from public.module m
where b.module_id = m.id and m.titre like 'Module 1 % 1/3 %' and b.type = 'retenir';

-- 4e idée de l'Apport (remplace la liste : sans effet au second passage)
update public.module
set trame = jsonb_set(
      jsonb_set(trame, '{deroule,1,idees}', $kk$["Port d'attache : l'enfant prend le risque d'explorer s'il sent l'adulte disponible et sait qu'il peut revenir à tout moment. Sans sécurité affective, toute son énergie va à la recherche de sécurisation et il n'est pas disponible pour jouer ; sans aventure possible, il ne peut pas explorer.", "Les enfants ne sont pas tous au même point : un attachement « sécure » permet de se sécuriser même en l'absence de l'adulte, un attachement « insécure » ne le permet pas encore. Savoir où en est chaque enfant permet d'adapter notre accompagnement.", "On sécurise en répondant aux signaux de l'enfant, de façon chaleureuse et régulière : le prendre dans les bras, le consoler, chercher à apaiser la cause de sa peine. Il comprend ainsi qu'il peut compter sur nous.", "Pourquoi la séparation est une épreuve : le cerveau du jeune enfant est immature, l'émotion domine et la régulation n'est pas encore là. Il a besoin d'un adulte qui l'apaise, et c'est parce qu'il a connu cette dépendance sécurisante qu'il pourra devenir autonome."]$kk$::jsonb),
      '{deroule,1,support}', $kk$"Projet pédagogique Koalakids, « De l'attachement à l'exploration » ; support « Le paradoxe de l'accueil collectif » (Bowlby, Winnicott). Vignettes Enzo et Julia : bloc « Enzo et Julia »."$kk$::jsonb)
where titre like 'Module 1 % 1/3 %';
-- FIN 23.1

-- ---------------------------------------------------------------------------
-- 23.2 Séquence 2/3 (Analyse d'une situation vécue). Ajoute : comparaison
-- « Face à la tempête émotionnelle » et une idée sur la figure co-régulatrice.
-- Ordre final : texte, scenes, comparaison, comparaison, reflexion, essayer. Contrôle : 6 blocs.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 2/3 %';
  if mid is null then raise notice '23.2 : séquence 2/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and contenu->>'intro' like 'Face à une tempête émotionnelle%') then
    raise notice '23.2 : déjà exécuté'; return;
  end if;

  update public.bloc set ordre = ordre + 1 where module_id = mid and ordre >= 3;

  insert into public.bloc(module_id, type, contenu, ordre) values
  (mid, 'comparaison', $kk${"intro": "Face à une tempête émotionnelle, la réaction de l'adulte apaise et construit, ou renforce l'insécurité.", "plutot": ["Accueillir l'émotion sans jugement : « Tu as le droit d'être en colère. »", "La nommer.", "Réconforter, puis aider à trouver des stratégies.", "Se dire que consoler n'est pas du laxisme : c'est aider le cerveau de l'enfant à mûrir."], "eviter": ["Nier ou minimiser : « Ce n'est rien. »", "Punir.", "Isoler l'enfant.", "Attendre qu'il se calme seul : il ne le peut pas encore."]}$kk$::jsonb, 3);

  raise notice '23.2 : 1 bloc ajouté';
end
$do$;

update public.module
set trame = jsonb_set(trame, '{deroule,1,idees}', $kk$["L'attachement du jeune enfant est multiple : il s'attache à ses parents, à d'autres adultes, parfois à d'autres enfants. Les professionnels qui s'occupent régulièrement de lui sont d'autres étoiles de sa constellation d'attachement. Ce sont toujours les enfants qui choisissent.", "Si l'enfant est encore insécure : le professionnel qui l'accompagne depuis son premier accueil poursuit, ou l'équipe observe s'il choisit une autre personne (il s'endort mieux avec elle, se calme plus dans ses bras). S'il semble perdu, on nomme un ou des professionnels qui deviennent ses figures d'attachement, jusqu'à ce qu'il retrouve assez de sécurité pour jouer. Les parents sont associés et informés.", "L'enfant a d'autres moyens de se sécuriser : le pouce, la sucette, le doudou. Mais un doudou proposé systématiquement à tout chagrin finit par prendre la place de l'adulte, qui reste la figure d'attachement et le meilleur moyen de s'apaiser.", "Une figure de sécurité de substitution est un adulte stable et disponible que l'enfant investit. Elle l'aide à réguler ses émotions : elle accueille ce qu'il ressent sans jugement, le nomme, le réconforte."]$kk$::jsonb)
where titre like 'Module 1 % 2/3 %';
-- FIN 23.2

-- ---------------------------------------------------------------------------
-- 23.3 Séquence 3/3 (Test d'une pratique et retour d'expérience). Ajoute : vécu des
-- parents, trois fils de continuité, citation de la Charte, citation Martine Maurice,
-- 4e point « À retenir », 4e étape « À essayer », 4e idée de l'Apport.
-- Ordre final : texte, texte (parents), texte (continuité), citation (Charte), retenir,
-- reflexion, essayer, citation (Maurice). Contrôle : 8 blocs.
-- ---------------------------------------------------------------------------
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module where titre like 'Module 1 % 3/3 %';
  if mid is null then raise notice '23.3 : séquence 3/3 introuvable'; return; end if;
  if exists (select 1 from public.bloc where module_id = mid and contenu->>'titre' = 'Confier son enfant : ce que vivent les parents') then
    raise notice '23.3 : déjà exécuté'; return;
  end if;

  update public.bloc set ordre = ordre + 3 where module_id = mid and ordre >= 1;

  insert into public.bloc(module_id, type, contenu, ordre) values
  (mid, 'texte', $kk${"titre": "Confier son enfant : ce que vivent les parents", "paragraphes": ["La séparation n'est pas seulement l'épreuve de l'enfant. Pour les parents, confier son enfant est chargé d'émotions complexes : **la culpabilité** d'aller à l'encontre de l'instinct de protection, **la peur** de perdre l'amour de son enfant ou de se sentir « dépossédé », et **la fragilisation** du sentiment de compétence, surtout face aux pleurs.", "Ces angoisses se communiquent à l'enfant : un parent stressé amplifie l'angoisse de son enfant. **Accueillir l'enfant, c'est donc aussi accueillir son parent.**"]}$kk$::jsonb, 1),
  (mid, 'texte', $kk${"titre": "Tisser un fil de continuité entre la maison et la crèche", "paragraphes": ["Pour un jeune enfant, la discontinuité (des lieux, des personnes, des rythmes) peut faire obstacle au sentiment de sécurité intérieure. Notre mission est de tisser des fils entre la maison et la crèche : **une figure de sécurité** stable et disponible, **des interactions prévisibles et chaleureuses**, surtout pendant les soins, et **un cadre de vie stable** avec des repères, des rituels et des règles cohérentes.", "Concrètement : la période de familiarisation, la qualité des transmissions et le respect de l'objet transitionnel."]}$kk$::jsonb, 2),
  (mid, 'citation', $kk${"texte": "« Je me sens bien accueilli quand ma famille est bien accueillie, car mes parents constituent mon point d'origine et mon port d'attache. »\nCharte nationale d'accueil du jeune enfant"}$kk$::jsonb, 3),
  (mid, 'citation', $kk${"texte": "« …lui permettre d'éprouver ce « quoi qu'il t'arrive, tu peux compter sur moi ! » […] Tu es quelqu'un qui compte et parce que j'ai confiance en ta capacité à être : Vas, vis et deviens… »\nMartine Maurice"}$kk$::jsonb, 7);

  raise notice '23.3 : 4 blocs ajoutés';
end
$do$;

-- 4e point « À retenir »
update public.bloc b
set contenu = jsonb_set(b.contenu, '{points}', $kk$["**Un adulte stable et disponible sur un jeu** dès l'arrivée du premier enfant : le jeu aide à se séparer et à se retrouver.", "**Les rituels appartiennent aux familles :** nous les soutenons, nous ne les imposons pas.", "**Accueillir chaque venue** de l'enfant, le consoler au besoin, le laisser repartir en son temps.", "**Accueillir l'enfant, c'est accueillir sa famille :** reconnaître que les parents sont les premiers éducateurs, construire la confiance, les accompagner sans jugement."]$kk$::jsonb)
from public.module m
where b.module_id = m.id and m.titre like 'Module 1 % 3/3 %' and b.type = 'retenir';

-- 4e étape « À essayer »
update public.bloc b
set contenu = jsonb_set(b.contenu, '{etapes}', $kk$[{"titre": "Un adulte sur un jeu dès l'arrivée.", "texte": "Quelqu'un de stable et disponible est installé avant le premier enfant."}, {"titre": "Soutenir le rituel de la famille.", "texte": "Je laisse la famille faire à sa manière, sans l'initier à sa place."}, {"titre": "Tisser un fil de continuité.", "texte": "Je transmets au parent un détail de la journée de l'enfant, et je respecte son objet transitionnel."}, {"titre": "En reparler en équipe.", "texte": "À la prochaine réunion, quelques minutes pour dire ce qu'on garde."}]$kk$::jsonb)
from public.module m
where b.module_id = m.id and m.titre like 'Module 1 % 3/3 %' and b.type = 'essayer';

-- 4e idée de l'Apport
update public.module
set trame = jsonb_set(
      jsonb_set(trame, '{deroule,1,idees}', $kk$["Dès l'arrivée du premier enfant, au moins une proposition de jeu avec un adulte présent, stable et disponible : le jeu est un bon espace pour se séparer et se retrouver. L'adulte accueille parents et enfants par sa présence et ses paroles de bienvenue.", "Les rituels d'au revoir et de retrouvailles appartiennent aux familles : ce sont les parents, et parfois l'enfant, qui les choisissent. Notre rôle est de les soutenir et d'en parler en cas de difficulté. Un enfant qui ne veut pas venir ou partir n'est pas capricieux : il a besoin de plus de temps et de rituel.", "L'adulte peut faire confiance à l'enfant et soutenir son exploration sans le garder tout près, tant que l'environnement est sûr et qu'il est disponible : il accueille l'enfant à chacune de ses venues et le console pour qu'il reparte en son temps.", "Les parents vivent aussi la séparation (culpabilité, peur, doute sur leur compétence) et leurs angoisses se communiquent à l'enfant. Accueillir l'enfant, c'est accueillir sa famille ; on tisse la continuité entre la maison et la crèche par la familiarisation, les transmissions et le respect de l'objet transitionnel."]$kk$::jsonb),
      '{deroule,1,support}', $kk$"Projet pédagogique Koalakids, « De l'attachement à l'exploration » ; support « Le paradoxe de l'accueil collectif » (Charte nationale d'accueil du jeune enfant, Martine Maurice)."$kk$::jsonb)
where titre like 'Module 1 % 3/3 %';
-- FIN 23.3

-- ---------------------------------------------------------------------------
-- 23c Contrôle (lecture seule). Attendu : 3 séquences, blocs 7 / 6 / 8, publie = false,
-- séquence 1 avec 4 idées dans l'Apport, séquence 3 avec 4 points « À retenir ».
-- ---------------------------------------------------------------------------
select m.titre, m.publie,
       (select count(*) from public.bloc b where b.module_id = m.id) as blocs,
       jsonb_array_length(m.trame #> '{deroule,1,idees}') as idees_apport,
       (select string_agg(b.type, ' > ' order by b.ordre) from public.bloc b where b.module_id = m.id) as ordre_blocs
from public.module m where m.titre like 'Module 1 %/3 %' order by m.ordre;
-- FIN 23c
