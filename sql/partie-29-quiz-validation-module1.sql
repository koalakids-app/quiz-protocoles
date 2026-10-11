-- ============================================================================
-- PARTIE 29 — Quiz de validation du module 1 « Développement et attachement »
-- (version e-learning). Même format que les autres quiz de validation : mode
-- « score », corrigé immédiat, seuil de réussite de 80 %.
-- 10 questions couvrant les trois séquences : séparation et régulation
-- émotionnelle (séquence 1), base de sécurité et constellation d'attachement
-- (séquences 1 et 2), parents, arrivées et départs, retour d'expérience
-- (séquence 3). Les questions reformulent les notions du parcours, sans
-- reprendre ses questions mot pour mot.
-- LE QUIZ EST CRÉÉ NON PUBLIÉ et n'est pas rattaché au thème : l'étape 29.2
-- (publication et rattachement) est à exécuter seulement après relecture.
-- À exécuter en 3 temps : 29.1, 29c, puis (après relecture) 29.2.
-- Relançable : le quiz n'est créé qu'une fois, les questions ne sont ajoutées
-- que si le quiz n'en contient aucune.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 29.1 Quiz et questions. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk$Quiz de validation : développement et attachement$kk$;
  if qid is null then
    insert into public.quiz(titre, description, publie, mode)
    values ($kk$Quiz de validation : développement et attachement$kk$,
            $kk$À faire une fois les trois séquences du module 1 suivies. 10 questions, corrigé immédiat. Seuil de réussite : 80 %.$kk$,
            false, 'score')
    returning id into qid;
  end if;
  if exists (select 1 from public.questions where quiz_id = qid) then raise notice '29.1 : questions déjà ajoutées'; return; end if;

  insert into public.questions(quiz_id, ordre, enonce, options, reponses, multi)
  select qid, v.ordre, v.enonce, v.options, v.reponses, v.multi
  from (values
  (0, $kk$Un enfant de 18 mois hurle et tape des pieds quand sa mère s'en va. Quelle lecture est la plus juste ?$kk$, $kk$["Il fait un caprice pour que sa mère reste.", "Il est débordé par une émotion qu'il ne peut pas réguler seul : il a besoin d'un adulte qui l'aide à se calmer.", "Il manque d'habitude de la collectivité : il faut le laisser pleurer.", "Il rejette la professionnelle qui l'accueille."]$kk$::jsonb, '[1]'::jsonb, false),
  (1, $kk$Un enfant de 2 ans est submergé par la colère. Quelle réaction de l'adulte est la plus soutenante ?$kk$, $kk$["Le punir pour qu'il comprenne que ce comportement n'est pas accepté.", "Lui dire que ce n'est rien et qu'il n'a pas de raison de pleurer.", "L'isoler dans un coin calme jusqu'à ce qu'il se calme.", "Accueillir son émotion sans jugement, la nommer et le réconforter."]$kk$::jsonb, '[3]'::jsonb, false),
  (2, $kk$Que désigne la « base de sécurité » en théorie de l'attachement ?$kk$, $kk$["L'adulte désigné par la direction comme référent de chaque enfant.", "Un lieu fermé de la crèche où l'enfant peut s'isoler.", "Un adulte sensible sur qui l'enfant peut compter : il s'éloigne pour explorer, en sachant qu'il peut revenir.", "Le doudou, qui remplace l'adulte absent."]$kk$::jsonb, '[2]'::jsonb, false),
  (3, $kk$Que signifie le « paradoxe de l'autonomie » ?$kk$, $kk$["Pour devenir capable d'être seul, l'enfant doit d'abord avoir fait l'expérience d'une dépendance sécurisante.", "Un enfant autonome n'a plus besoin de ses figures d'attachement.", "L'autonomie s'acquiert uniquement par le jeu libre.", "Plus on laisse un enfant seul tôt, plus il devient autonome."]$kk$::jsonb, '[0]'::jsonb, false),
  (4, $kk$Une enfant de 14 mois ne joue que si elle est contre l'adulte et pleure dès qu'il se lève. Que faire en priorité ?$kk$, $kk$["Lui donner son doudou à chaque fois, à la place de l'adulte.", "L'encourager à jouer seule pour qu'elle apprenne l'autonomie.", "Changer régulièrement d'adulte autour d'elle pour qu'elle s'habitue à tous.", "Lui offrir un ou deux adultes stables et disponibles, jusqu'à ce qu'elle se sente assez en sécurité pour jouer."]$kk$::jsonb, '[3]'::jsonb, false),
  (5, $kk$Qui peut faire partie de la constellation d'attachement d'un enfant ? (plusieurs réponses)$kk$, $kk$["Les professionnels qui s'occupent régulièrement de lui.", "Parfois d'autres enfants.", "Uniquement la personne désignée comme référente par la direction.", "Ses parents."]$kk$::jsonb, '[0, 1, 3]'::jsonb, true),
  (6, $kk$Une enfant ne se calme que dans les bras d'une collègue, pas dans ceux de sa référente. Quelle attitude de l'équipe est la plus adaptée ?$kk$, $kk$["Y voir une information : en tenir compte dans l'organisation et en informer les parents.", "Conclure que la référente doit être remplacée.", "Ne rien changer, pour ne pas créer de préférence.", "Demander à la référente de la garder jusqu'à ce que l'enfant s'y habitue."]$kk$::jsonb, '[0]'::jsonb, false),
  (7, $kk$Une maman confie : « J'ai peur qu'elle s'attache plus à vous qu'à moi. » Quelle réponse est la plus adaptée ?$kk$, $kk$["« Mais non, ne vous inquiétez pas, c'est normal. »", "« Elle s'attache à nous parce qu'elle passe la journée ici. »", "Nommer sa crainte, rappeler que l'attachement à la crèche complète celui qu'elle a avec vous sans le remplacer, et reconnaître sa place de parent.", "« Il faudrait que vous passiez plus de temps avec elle. »"]$kk$::jsonb, '[2]'::jsonb, false),
  (8, $kk$Le soir, un enfant de 20 mois s'accroche à la porte du coin jeux et refuse de partir. Comment l'interpréter le plus justement ?$kk$, $kk$["Il est mal attaché à son parent.", "Sa journée s'est mal passée.", "Il fait un caprice, il ne faut surtout pas céder.", "Il n'est pas capricieux : il a besoin de plus de temps et d'un rituel pour quitter le lieu."]$kk$::jsonb, '[3]'::jsonb, false),
  (9, $kk$Quelles phrases conviennent à un retour d'expérience en équipe ? (plusieurs réponses)$kk$, $kk$["« Au départ de sa mère, il a pleuré moins longtemps que la semaine dernière. »", "« Les enfants difficiles ne réagissent pas à cette pratique. »", "« J'ai testé de me placer sur un jeu dès l'arrivée : deux enfants sont venus me rejoindre. »", "« J'ai mal fait, je n'étais pas assez disponible. »"]$kk$::jsonb, '[0, 2]'::jsonb, true)
  ) as v(ordre, enonce, options, reponses, multi);

  raise notice '29.1 : 10 questions ajoutées';
end
$do$;
-- FIN 29.1

-- ---------------------------------------------------------------------------
-- 29c Contrôle (lecture seule). Attendu : 1 quiz, mode score, 10 questions
-- dont 2 à réponses multiples, publie = false, thème e-learning non rattaché.
-- ---------------------------------------------------------------------------
select q.titre, q.mode, q.publie, count(s.id) as questions,
       count(*) filter (where s.multi) as a_reponses_multiples,
       (select t.quiz_id from public.theme t where t.nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$) as quiz_du_theme
from public.quiz q left join public.questions s on s.quiz_id = q.id
where q.titre = $kk$Quiz de validation : développement et attachement$kk$
group by q.id, q.titre, q.mode, q.publie;
-- FIN 29c

-- ---------------------------------------------------------------------------
-- 29.2 Publication et rattachement au thème e-learning. À EXÉCUTER SEULEMENT
-- APRÈS RELECTURE. Le quiz devient accessible, et un lien « Quiz de validation »
-- apparaît à la fin du parcours. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk$Quiz de validation : développement et attachement$kk$;
  if qid is null then raise notice '29.2 : quiz introuvable, exécuter 29.1'; return; end if;
  update public.quiz set publie = true where id = qid;
  update public.theme set quiz_id = qid::text where nom = $kk$Module 1 – Développement et attachement (e-learning)$kk$;
end
$do$;
-- FIN 29.2
