-- ============================================================================
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

-- ---------------------------------------------------------------------------
-- 36.1 Quiz et questions. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk$Quiz de validation : émotions, pleurs, cadre sans violence$kk$;
  if qid is null then
    insert into public.quiz(titre, description, publie, mode)
    values ($kk$Quiz de validation : émotions, pleurs, cadre sans violence$kk$,
            $kk$À faire une fois les trois séquences du module 2 suivies. 10 questions, corrigé immédiat. Seuil de réussite : 80 %.$kk$,
            false, 'score')
    returning id into qid;
  end if;
  if exists (select 1 from public.questions where quiz_id = qid) then raise notice '36.1 : questions déjà ajoutées'; return; end if;

  insert into public.questions(quiz_id, ordre, enonce, options, reponses, multi)
  select qid, v.ordre, v.enonce, v.options, v.reponses, v.multi
  from (values
  (0, $kk$Un bébé de 6 mois pleure en fin d'après-midi, sans cause évidente. Une collègue dit : « Il faut le laisser, sinon il prend l'habitude. » Quelle lecture est la plus juste ?$kk$, $kk$["Il prend déjà des habitudes : il faut lui apprendre à patienter.", "C'est une alarme : à cet âge, il ne peut pas calmer seul son mal-être, et c'est l'adulte qui l'aide à s'apaiser.", "Il teste les adultes pour voir jusqu'où il peut aller.", "Il cherche à attirer l'attention : le mieux est de l'ignorer."]$kk$::jsonb, '[1]'::jsonb, false),
  (1, $kk$Une professionnelle devance toujours les besoins d'un enfant, avant qu'il n'ait rien exprimé. Qu'en penser ?$kk$, $kk$["C'est idéal : l'enfant n'a jamais besoin de pleurer.", "Peu importe, l'essentiel est que ses besoins soient comblés.", "Il faut toujours attendre qu'il pleure longtemps avant d'intervenir.", "Répondre avant son appel ne lui permet pas de comprendre qu'il peut compter sur l'adulte quand il l'appelle : on répond à ses signaux, sans tarder."]$kk$::jsonb, '[3]'::jsonb, false),
  (2, $kk$Lola, 2 ans, hurle sur le tapis après un refus. Elle tape, elle essaie de mordre. Quelle posture est la plus adaptée ?$kk$, $kk$["Rester près d'elle, la protéger et protéger les autres, ne pas la laisser seule avec sa détresse.", "La mettre seule dans une autre pièce le temps qu'elle se calme.", "Lui faire un long discours sur ce qui est permis ou non.", "Ne pas réagir : une tempête se calme plus vite sans public."]$kk$::jsonb, '[0]'::jsonb, false),
  (3, $kk$Lesquels de ces signes peuvent traduire une émotion forte chez un enfant qui ne pleure pas ? (plusieurs réponses)$kk$, $kk$["Il se retire dans un coin, le regard baissé.", "Il joue calmement, absorbé par son jeu.", "Il recule dès qu'un adulte tend les bras.", "Il se raidit quand on s'approche."]$kk$::jsonb, '[0, 2, 3]'::jsonb, true),
  (4, $kk$Que désigne la posture de la « boussole » ?$kk$, $kk$["L'adulte organise un jeu riche et s'enthousiasme pour les découvertes de l'enfant.", "L'adulte reste à distance pour que l'enfant apprenne à se débrouiller seul.", "L'adulte nomme l'émotion, la reconnaît comme légitime, soutient l'enfant et lui indique la direction du réconfort.", "L'adulte détourne l'attention de l'enfant vers une autre activité."]$kk$::jsonb, '[2]'::jsonb, false),
  (5, $kk$Quelle organisation relève d'un cadre commun, protecteur et compréhensible ?$kk$, $kk$["Des limites et des modes d'intervention définis en équipe, sans injonctions contradictoires.", "Chaque adulte applique ses propres limites selon son humeur du jour.", "De nombreux interdits, pour que l'enfant ne doute jamais de ce qui est permis.", "Aucune limite : l'enfant découvre seul les règles."]$kk$::jsonb, '[0]'::jsonb, false),
  (6, $kk$Axel, 18 mois, tire les cheveux d'une camarade qui pleure. Quelle première réaction est la plus adaptée ?$kk$, $kk$["Lui demander de réfléchir à ce qu'il vient de faire.", "L'éloigner du groupe quelques minutes.", "Lui demander de faire un câlin à sa camarade pour réparer.", "S'accroupir près d'eux, redire que faire mal n'est pas permis, réconforter la camarade et rester aussi auprès d'Axel."]$kk$::jsonb, '[3]'::jsonb, false),
  (7, $kk$Parmi ces pratiques, lesquelles constituent des fautes professionnelles ? (plusieurs réponses)$kk$, $kk$["S'accroupir pour dire une limite en une phrase, avec un visage qui correspond.", "Mettre un enfant à l'écart pour qu'il se calme.", "Se moquer d'un enfant devant les autres.", "Faire un soin à un enfant sans lui dire ce qui lui arrive."]$kk$::jsonb, '[1, 2, 3]'::jsonb, true),
  (8, $kk$Deux collègues parlent d'un enfant assis près d'elles. Quelle attitude respecte l'enfant ?$kk$, $kk$["Parler de lui librement : à cet âge, il ne comprend pas encore.", "Éviter de parler négativement des enfants et de leurs parents devant eux, et inclure l'enfant dans la conversation.", "Chuchoter pour qu'il n'entende pas, mais continuer à en parler.", "Ne jamais parler d'un enfant entre collègues."]$kk$::jsonb, '[1]'::jsonb, false),
  (9, $kk$Au terme d'un cycle de tests, comment une équipe conclut-elle le mieux ?$kk$, $kk$["Chacun garde la pratique qui lui convient, sans en reparler.", "Elle désigne la collègue qui a le mieux réussi et copie sa méthode.", "Elle choisit une pratique commune, décrite en une phrase, tenue deux semaines, et chacun s'engage sur un geste précis.", "Elle abandonne tout geste qui n'a pas supprimé les pleurs."]$kk$::jsonb, '[2]'::jsonb, false)
  ) as v(ordre, enonce, options, reponses, multi);

  raise notice '36.1 : 10 questions ajoutées';
end
$do$;
-- FIN 36.1

-- ---------------------------------------------------------------------------
-- 36c Contrôle (lecture seule). Attendu : 1 quiz, mode score, 10 questions
-- dont 2 à réponses multiples, publie = false, themes_rattaches = 0.
-- ---------------------------------------------------------------------------
select q.titre, q.mode, q.publie, count(s.id) as questions,
       count(*) filter (where s.multi) as a_reponses_multiples,
       (select count(*) from public.theme t where t.quiz_id = q.id::text) as themes_rattaches
from public.quiz q left join public.questions s on s.quiz_id = q.id
where q.titre = $kk$Quiz de validation : émotions, pleurs, cadre sans violence$kk$
group by q.id, q.titre, q.mode, q.publie;
-- FIN 36c

-- ---------------------------------------------------------------------------
-- 36.2 Publication et rattachement aux thèmes e-learning et animé. À EXÉCUTER SEULEMENT
-- APRÈS RELECTURE. Le quiz devient accessible, et un lien « Quiz de validation »
-- apparaît à la fin du parcours et de la dernière microséquence animée. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
do $do$
declare qid public.quiz.id%type;
begin
  select id into qid from public.quiz where titre = $kk$Quiz de validation : émotions, pleurs, cadre sans violence$kk$;
  if qid is null then raise notice '36.2 : quiz introuvable, exécuter 36.1'; return; end if;
  update public.quiz set publie = true where id = qid;
  update public.theme set quiz_id = qid::text
  where nom in ($kk$Module 2 – Émotions, pleurs, cadre sans violence (e-learning)$kk$, $kk$Module 2 – Émotions, pleurs, cadre sans violence$kk$);
end
$do$;
-- FIN 36.2

-- ---------------------------------------------------------------------------
-- 36d Contrôle après publication (lecture seule). Attendu : 2 lignes (thème animé et thème
-- e-learning), toutes deux rattachées au quiz de validation, quiz publié.
-- ---------------------------------------------------------------------------
select t.nom, t.quiz_id, (t.quiz_id = q.id::text) as rattache_au_quiz_de_validation, q.publie as quiz_publie
from public.theme t
cross join public.quiz q
where q.titre = $kk$Quiz de validation : émotions, pleurs, cadre sans violence$kk$
  and t.nom like 'Module 2 – Émotions, pleurs, cadre sans violence%'
order by t.nom;
-- FIN 36d
