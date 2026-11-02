/* Jeu de société « Le Sentier du Koala » — contenu des cartes.
 *
 * Q(cat, public, question, bonne réponse, mauvaise 1, mauvaise 2, à retenir)
 *   cat    : dev (développement) · ped (pédagogie) · pro (protocoles) · par (familles)
 *   public : 'e' équipe · 'p' parents · 'x' les deux
 * D(public, sujet, pistes)  : carte « Partage » sans bonne réponse (échange en groupe)
 *
 * Les cartes de pédagogie, de développement, de relation aux familles, de soins, de repas et de sommeil suivent le projet
 * éducatif et pédagogique Koalakids (01/10/2025) : modèle de l'accompagnement, attachement, partenariat avec les parents.
 * Public visé : les enfants d'une micro-crèche, de 2 mois et demi à 3 ans (4 ans au maximum) : les questions
 * et les « à retenir » doivent rester pertinents pour cette tranche d'âge.
 * Repères généraux de bonnes pratiques de la petite enfance : à faire relire par la direction
 * et à confronter aux protocoles propres à chaque établissement avant usage en formation.
 */
(function () {
  'use strict';
  var CARTES = [];
  function Q(cat, pub, q, bon, m1, m2, retenir) {
    CARTES.push({ id: CARTES.length, cat: cat, pub: pub, type: 'q', q: q, bon: bon, mauvaises: [m1, m2], retenir: retenir });
  }
  function D(pub, sujet, pistes) {
    CARTES.push({ id: CARTES.length, cat: 'partage', pub: pub, type: 'd', q: sujet, retenir: pistes });
  }

  /* ───────── 🧠 Développement ───────── */
  Q('dev', 'x', "À quel âge la plupart des enfants font-ils leurs premiers pas seuls ?",
    "Entre 12 et 18 mois", "Avant 9 mois", "Pas avant 24 mois",
    "La marche s'acquiert dans une large plage, le plus souvent entre 12 et 18 mois. Si l'enfant ne marche pas à 18 mois, on en parle au médecin.");
  Q('dev', 'x', "Un bébé de 8 mois pleure quand une personne inconnue s'approche. Que se passe-t-il ?",
    "L'angoisse de l'étranger : il distingue ses proches, c'est un progrès", "Il est trop gâté", "Il a un trouble de la sociabilité",
    "Vers 8 mois, l'enfant reconnaît ses figures d'attachement et se méfie des inconnus. Il faut le rassurer, pas le forcer à aller dans les bras.");
  Q('dev', 'x', "Vers quel âge un enfant dit-il ses premiers mots ?",
    "Autour de 12 mois", "Vers 6 mois", "Vers 3 ans",
    "Avant les premiers mots, il babille (dès 6-8 mois) et comprend bien plus de mots qu'il n'en dit. Un rythme varie d'un enfant à l'autre.");
  Q('dev', 'x', "Vers quel âge un enfant associe-t-il deux mots pour faire ses premières phrases ?",
    "Vers 2 ans, avec de grandes différences d'un enfant à l'autre", "Dès 8 mois", "Seulement après 4 ans",
    "Il comprend bien plus de mots qu'il n'en dit. On l'aide en lui parlant, en nommant ce qu'il vit et en reformulant ses essais, sans lui faire répéter.");
  Q('dev', 'x', "Quelle recommandation courante existe pour les écrans chez les tout-petits ?",
    "Pas d'écran avant 3 ans", "Dès 6 mois, en petites séquences", "Dès 1 an pour les dessins animés dits « éducatifs »",
    "Avant 3 ans, les écrans prennent la place des échanges, du jeu et du sommeil. Mieux vaut des livres, du jeu libre et du temps avec l'adulte.");
  Q('dev', 'x', "Quelle est la meilleure façon d'aider un enfant à bien parler ?",
    "Lui parler beaucoup, nommer ce qu'il fait, reformuler ses phrases", "Corriger chaque mot mal prononcé", "Lui répondre en déformant les mots pour qu'il comprenne",
    "On reformule simplement (« Oui, un gros camion ! ») sans faire répéter. Les mots justes et des phrases courtes nourrissent le langage.");
  Q('dev', 'e', "Selon l'approche de Pikler (motricité libre), un bébé qui ne tient pas encore assis seul est…",
    "Laissé libre de découvrir seul ses postures, sans être installé assis", "Installé assis avec des coussins pour le stimuler", "Maintenu assis chaque jour pour s'entraîner",
    "On ne met pas l'enfant dans une position qu'il ne maîtrise pas seul : il bouge mieux, plus sûr de lui, et la posture vient quand il est prêt.");
  Q('dev', 'p', "Mon bébé de 7 mois ne tient pas encore assis seul. Dois-je m'inquiéter ?",
    "Pas forcément : chaque enfant a son rythme, j'en parle au médecin au prochain rendez-vous", "Oui, il faut le caler assis tous les jours", "Oui, c'est forcément un retard grave",
    "La station assise sans appui arrive souvent entre 6 et 9 mois, parfois plus tard. En cas de doute, le médecin ou la PMI font le point.");
  Q('dev', 'x', "À partir de quel âge les enfants commencent-ils à jouer à « faire semblant » ensemble ?",
    "Autour de 2 ans, avec les premiers jeux d'imitation du réel", "Dès 6 mois", "Vers 5 ans",
    "Avant, ils jouent à côté les uns des autres et s'imitent. Vers 2 ans apparaissent les jeux symboliques, puis vers 3 ans les jeux de règles.");
  Q('dev', 'x', "Combien d'heures dort environ un enfant de 2 ans sur 24 heures, sieste comprise ?",
    "11 à 14 heures", "8 à 9 heures", "16 à 18 heures",
    "Les besoins varient d'un enfant à l'autre : on observe les signes de fatigue plutôt que de forcer ou de supprimer la sieste.");
  Q('dev', 'x', "Le doudou ou la tétine d'un enfant, c'est…",
    "Un objet transitionnel qui le rassure quand ses parents sont absents", "Une mauvaise habitude à supprimer vite", "Un jouet comme un autre",
    "L'enfant doit pouvoir se coucher avec son objet transitionnel, et certains n'en ont pas besoin. Proposé systématiquement à tout chagrin, il devient fétiche et prend la place de l'adulte, qui reste la figure d'attachement : par ses bras, ses mots et son empathie, il aide l'enfant à reconnaître et à apaiser sa peine.");
  Q('dev', 'x', "Propreté : quand l'enfant est-il prêt ?",
    "Quand il en montre les signes (reste sec, curieux, dit « pipi »), souvent entre 2 et 3 ans", "Dès 12 mois, il suffit de l'asseoir sur le pot", "Seulement après 4 ans",
    "La continence ne s'enseigne pas : l'enfant l'acquiert par lui-même, avec la maturation de son système nerveux. L'équipe l'accompagne, en partenariat avec les parents, en lui proposant régulièrement le pot ou les toilettes, sans pression ni comparaison.");
  Q('dev', 'x', "Vers quel âge un bébé commence-t-il à se retourner du dos sur le ventre ?",
    "Entre 4 et 6 mois", "À 1 mois", "Vers 10 mois",
    "Le retournement arrive en général entre 4 et 6 mois. Le bébé a besoin de temps au sol, libre de ses mouvements, pour y arriver.");

  /* ───────── 🎨 Pédagogie ───────── */
  Q('ped', 'e', "Le « panier des trésors » (Goldschmied) s'adresse à…",
    "Des bébés qui tiennent assis, environ 6-12 mois, avec des objets du quotidien", "Des enfants de 3 ans avec des jouets sonores", "Des bébés allongés avec des jouets en plastique colorés",
    "Brosse, anneaux, tissus, bois, métal : des objets de textures différentes à explorer librement, sans que l'adulte dirige le jeu.");
  Q('ped', 'e', "Comment aménager l'espace pour que l'enfant puisse agir sans solliciter sans cesse l'adulte ?",
    "Mobilier et matériel à sa hauteur, accessibles, sans danger", "Tout ranger en hauteur pour éviter les dégâts", "Servir l'enfant à chaque fois pour gagner du temps",
    "Un environnement adapté lui permet de faire par lui-même. Les enfants ne sont pas des marionnettes que l'on manipule : on tient compte de leur envie de faire seul.");
  Q('par', 'e', "Pourquoi installe-t-on des porte-manteaux et des sièges pour les parents dans la crèche ?",
    "Pour qu'ils se sentent chez eux et puissent s'attarder, s'asseoir près de leur enfant et se mettre à l'aise", "Pour qu'ils déposent leurs affaires et repartent plus vite", "Pour limiter les allées et venues dans les espaces de jeu",
    "L'ouverture de la crèche aux parents se pense aussi concrètement : confort, espace convivial, possibilité d'allaiter sur place et de participer à un temps de jeu ou à une sortie.");
  Q('ped', 'x', "La fessée et les violences éducatives ordinaires sont…",
    "Interdites par la loi depuis 2019", "Tolérées si elles sont rares", "Autorisées à la maison, interdites en crèche",
    "La loi du 10 juillet 2019 interdit les violences éducatives ordinaires (fessée, gifle, humiliations…). Pour notre projet, toute violence physique ou verbale et tout isolement d'un enfant sont des fautes professionnelles : on en parle en équipe et on demande de l'aide avant d'en arriver là.");
  Q('ped', 'x', "Pour les premières venues d'un enfant, qui décide des modalités d'entrée à la crèche ?",
    "Les parents « ont la main » : on construit avec eux, selon leurs souhaits et leurs contraintes", "L'équipe, avec un protocole d'adaptation identique pour toutes les familles", "La crèche, selon une durée standard de deux semaines",
    "Chaque famille est unique : les modalités ne se standardisent pas. Si les parents demandent un avis, la seule indication que l'équipe partage est de préférer la régularité (mêmes lieux, mêmes personnes) à la progressivité. On parle d'habituation ou de familiarisation plutôt que d'adaptation : l'enfant n'a pas à s'adapter, c'est un nouvel enfant qui arrive.");
  Q('par', 'e', "Pourquoi les enfants arrivent-ils de préférence à la crèche en ayant déjà pris leur premier repas ?",
    "Pour que les professionnels soient pleinement disponibles à l'accueil des familles", "Parce que la crèche ne propose jamais de petit déjeuner", "Pour gagner du temps sur le planning",
    "Si ce n'est pas possible, l'enfant peut le prendre à la crèche, selon la disponibilité des professionnels. L'accueil se fait à toute heure, sans guichet, selon le rythme de vie des parents.");
  Q('ped', 'x', "Que développe surtout le jeu libre ?",
    "Créativité, autonomie, langage et résolution de problèmes", "Rien, c'est du temps perdu", "Uniquement la motricité",
    "Quand l'enfant choisit son jeu, il expérimente, imagine et apprend à surmonter les difficultés. L'adulte est présent, il observe et sécurise.");
  Q('ped', 'e', "Observer un enfant sans intervenir sert à…",
    "Comprendre ses intérêts et ses besoins pour adapter l'accueil", "Le surveiller pour le sanctionner", "Noter ce qu'il fait de mal",
    "L'observation bienveillante nourrit les transmissions, le projet pédagogique et les choix d'aménagement.");
  Q('ped', 'x', "Quel type de jouet favorise le plus l'imagination ?",
    "Des objets simples et ouverts (cubes, tissus, boîtes, bois)", "Des jouets électroniques qui chantent et clignotent", "Des jouets très réalistes qui n'ont qu'un seul usage",
    "Plus le jouet est simple, plus l'enfant invente. Le tissu devient cape, couverture, cabane…");
  Q('ped', 'x', "Lire un livre à un bébé de 6 mois est…",
    "Utile : langage, attention et lien affectif dès les premiers mois", "Inutile avant 3 ans", "Utile seulement s'il reste immobile",
    "Même s'il mord le livre ! Lire tous les jours, avec des mots simples et des images, prépare le langage.");
  Q('ped', 'p', "Parler sa langue d'origine à la maison avec son enfant, c'est…",
    "Une richesse : l'enfant entend un langage riche et apprendra plus facilement d'autres langues", "À éviter pour ne pas retarder le français", "Réservé aux vacances",
    "On parle à l'enfant dans la langue où l'on est le plus à l'aise. Le français s'apprend aussi à la crèche et à l'école.");
  Q('par', 'e', "À quoi servent les tableaux d'informations journalières (repas, sommeil, soins) placés près des lieux de soin ?",
    "À permettre aux parents qui le souhaitent de trouver l'information sans attendre un professionnel, sans remplacer les échanges", "À remplacer les échanges avec les parents", "À contrôler le travail des professionnels",
    "Tous les parents n'ont pas besoin d'informations systématiques. Les tableaux servent aussi de repère aux professionnels, et les parents peuvent y inscrire eux-mêmes des informations (heure du biberon, du réveil).");
  Q('ped', 'e', "Pourquoi privilégie-t-on les enfants pieds nus (sans chaussettes ni collants) dans la crèche ?",
    "Pour limiter les glissades, favoriser de bons appuis et stimuler les capteurs sensori-moteurs des pieds", "Pour qu'ils aient moins chaud en hiver", "Pour faciliter le ménage",
    "Les chaussons ou chaussettes tiennent mal les chevilles et ne favorisent pas la voûte plantaire. Tous les enfants circulent librement dans toute la crèche toute la journée.");
  Q('ped', 'e', "Qui range les jouets à la crèche ?",
    "Les professionnels : on ne demande pas de « travail » à un jeune enfant", "Les enfants, pour apprendre la discipline dès 2 ans", "Chaque enfant range tout avant de passer au jeu suivant",
    "Les professionnels ramassent régulièrement les objets éparpillés et rangent hors de la vue des enfants ce qui n'est pas utilisé : voir, c'est vouloir, donc source de frustration. Aucune commande de type travail et aucun résultat ne sont attendus d'un jeune enfant.");
  Q('ped', 'e', "Dans une proposition de jeu, qu'est-ce qui aide les enfants à se concentrer ?",
    "Peu d'objets mais riches de possibilités, en plusieurs exemplaires, que l'on peut déplacer", "Tous les jouets de la crèche étalés pour qu'ils puissent choisir", "Un seul jouet très attractif pour toute la section",
    "Un jeune enfant ne sait pas encore inhiber ce qu'il voit : trop d'objets éparpillés l'empêchent de jouer. On réorganise et on enrichit régulièrement la proposition pour garder l'intérêt, en équilibrant régularité et nouveauté.");

  /* ───────── 🧼 Protocoles ───────── */
  Q('pro', 'x', "Un nourrisson doit être couché pour dormir…",
    "Sur le dos, sur un matelas ferme, sans oreiller ni couette", "Sur le ventre, c'est plus sécurisant", "Sur le côté, calé par des coussins",
    "Sur le dos, dans une gigoteuse, sans tour de lit ni peluche : ces règles réduisent le risque de mort inattendue du nourrisson.");
  Q('pro', 'x', "Quelle est la température idéale d'une chambre de bébé ?",
    "20 °C au maximum (environ 18-20 °C)", "24-26 °C, bien chauffée", "15 °C pour l'endurcir",
    "Notre projet demande de vérifier que la chambre n'excède pas 20 °C. Un bébé trop couvert ou dans une pièce trop chaude est exposé aux risques : on l'habille légèrement et on aère.");
  Q('pro', 'x', "Un enfant a de la fièvre. Premier réflexe ?",
    "Le découvrir un peu, le faire boire et surveiller sa tolérance", "Le couvrir pour le faire transpirer", "Le plonger dans un bain froid",
    "On regarde surtout l'état général. Avant 3 mois, une température de 38 °C ou plus impose un avis médical sans attendre. Tout médicament suit l'ordonnance ou le protocole médical.");
  Q('pro', 'x', "À partir de quelle température rectale parle-t-on de fièvre ?",
    "38 °C et plus", "37,2 °C", "39,5 °C",
    "À partir de 38 °C. Le thermomètre sert de repère, mais l'état général de l'enfant (agitation, abattement, douleur) compte autant.");
  Q('pro', 'x', "Un bébé de moins d'un an s'étouffe et ne peut plus tousser ni respirer. Quel geste ?",
    "5 claques dans le dos puis 5 compressions du thorax, en alternance, et appeler le 15", "Lui mettre les doigts dans la bouche", "Lui donner de l'eau pour faire passer",
    "Bébé à plat ventre sur l'avant-bras, tête plus basse que le thorax : 5 claques entre les omoplates. Si ça ne passe pas, retourner et faire 5 compressions du milieu du thorax. Appeler ou faire appeler le 15.");
  Q('pro', 'x', "Quel numéro d'urgence européen est gratuit pour toute détresse ?",
    "Le 112", "Le 17", "Le 119",
    "Le 112 fonctionne partout en Europe. Le 15 (SAMU) pour une urgence médicale, le 18 pour les pompiers, le 119 pour un enfant en danger.");
  Q('pro', 'x', "Brûlure légère par eau chaude. On…",
    "Refroidit tout de suite sous l'eau du robinet (ni glacée) au moins 10 minutes", "Applique du beurre ou du dentifrice", "Pose de la glace directement sur la peau",
    "Refroidir vite limite la profondeur de la brûlure. On ne retire pas un vêtement collé à la peau et on demande un avis médical si la brûlure est étendue, au visage ou sur un bébé.");
  Q('pro', 'x', "Combien de temps faut-il se laver les mains avec du savon ?",
    "Environ 30 secondes, puis séchage avec un papier à usage unique", "5 secondes suffisent", "Le savon n'est pas nécessaire",
    "Paumes, dos des mains, entre les doigts, ongles, poignets. C'est le geste n°1 contre la transmission des microbes.");
  Q('pro', 'e', "Au change d'un enfant, quand se laver les mains ?",
    "Avant et après chaque change", "Seulement après", "Seulement si la couche est très souillée",
    "Avant pour ne pas apporter de microbes à l'enfant, après pour ne pas en emporter ailleurs.");
  Q('pro', 'e', "Un parent laisse un médicament sans ordonnance. Que faire ?",
    "Ne pas le donner : il faut une ordonnance (ou un protocole médical) et une autorisation écrite", "Le donner, le parent est responsable", "Le donner si l'enfant a l'air mal",
    "Seuls les traitements prescrits (ou prévus par le protocole médical de la structure) sont administrés, avec l'accord écrit des parents.");
  Q('pro', 'e', "Un enfant a un PAI pour une allergie alimentaire. Au goûter…",
    "On applique strictement le PAI : aliments autorisés et trousse d'urgence accessible", "On adapte selon notre appréciation du risque", "On lui laisse goûter un tout petit morceau",
    "Le Projet d'accueil individualisé est écrit avec le médecin et la famille. Il s'applique à la lettre, et toute l'équipe sait où est la trousse.");
  Q('pro', 'x', "Après une chute sur la tête, quels signes imposent d'appeler le 15 ?",
    "Vomissements répétés, somnolence inhabituelle, perte de connaissance, saignement important", "Un pleur de 30 secondes", "Une petite bosse sans autre signe",
    "Même sans signe alarmant, on surveille l'enfant pendant 24 heures et on prévient les parents.");
  Q('pro', 'e', "Sur la table à langer, la règle absolue est de…",
    "Ne jamais lâcher l'enfant : une main toujours sur lui", "Le laisser quelques secondes pour attraper un body", "Compter sur la ceinture de sécurité",
    "Les chutes se produisent en un instant. On prépare tout ce qu'il faut avant de poser l'enfant.");
  Q('pro', 'e', "Suspicion de maltraitance sur un enfant : que faire ?",
    "Noter les faits objectifs, alerter la direction et transmettre une information préoccupante ; le 119 peut conseiller", "Interroger longuement l'enfant", "Attendre d'avoir une preuve avant d'en parler",
    "On ne mène pas d'enquête et on n'attend pas la certitude. Les faits sont notés tels qu'ils sont constatés, sans interprétation, et partagés avec la direction.");
  Q('pro', 'x', "Quel numéro gratuit permet de signaler ou de demander conseil pour un enfant en danger ?",
    "Le 119 (Allô enfance en danger)", "Le 114", "Le 3919",
    "Le 119 est joignable à toute heure. En cas de doute ou d'inquiétude pour un enfant, on peut appeler pour être conseillé, en plus d'alerter la direction.");
  Q('pro', 'x', "Un enfant a des poux. Faut-il l'écarter de la crèche ?",
    "Pas d'éviction obligatoire, mais un traitement dès que possible", "Oui, 15 jours", "Oui, il faut lui raser la tête",
    "On prévient l'équipe et on traite sans attendre : lotion adaptée, vérification des proches, lavage des bonnets et du linge.");
  Q('pro', 'x', "Un enfant a avalé un produit ménager. Que faire ?",
    "Appeler le 15 ou le centre antipoison, ne pas le faire vomir, garder l'emballage", "Lui faire boire du lait et le faire vomir", "Attendre de voir si ça passe",
    "Faire vomir aggrave souvent les brûlures. On garde l'emballage pour informer le médecin et on suit ses consignes.");
  Q('pro', 'x', "Un biberon préparé est resté à moitié plein après le repas. On…",
    "Jette ce qu'il reste", "Le garde au frais pour le prochain repas", "Le réchauffe plus fort pour tuer les microbes",
    "Dès que l'enfant a bu, sa salive apporte des bactéries. Un lait reconstitué se consomme dans l'heure qui suit sa préparation.");
  Q('pro', 'x', "Le miel avant un an, c'est…",
    "Interdit : risque de botulisme", "Autorisé après 6 mois", "Sans danger",
    "Il peut contenir des spores responsables du botulisme du nourrisson. À éviter aussi dans les gâteaux ou en tétine.");
  Q('pro', 'e', "À quelle température doit être conservé un aliment au réfrigérateur ?",
    "Entre 0 et 4 °C", "Entre 8 et 10 °C", "À −5 °C",
    "La chaîne du froid est un point central de la maîtrise sanitaire. Les températures se relèvent chaque jour, avec une action en cas d'écart.");
  Q('pro', 'x', "Soleil et bébé de moins d'un an…",
    "Pas d'exposition directe : ombre, vêtements couvrants, chapeau", "Un peu de bronzage aide la vitamine D", "Une crème d'indice 5 suffit",
    "La peau des bébés est fine et très sensible. On évite les heures les plus chaudes et on hydrate régulièrement.");

  /* ───────── 👨‍👩‍👧 Familles et partenariat ───────── */
  Q('par', 'p', "Dans la voiture, jusqu'à quel âge le siège bébé doit-il rester dos à la route ?",
    "Au moins 15 mois, et idéalement le plus longtemps possible", "Dès 6 mois, face à la route", "Seulement jusqu'à 3 mois",
    "Dos à la route, la tête et la nuque de l'enfant sont mieux protégées en cas de choc. C'est la norme i-Size.");
  Q('par', 'p', "Au bain, un bébé peut rester seul quelques secondes si l'eau est basse ?",
    "Jamais : quelques centimètres d'eau suffisent pour une noyade", "Oui, si l'eau est basse", "Oui, s'il tient assis",
    "Un bébé qui glisse ne crie pas. On prépare tout avant le bain, et on le sort avec soi s'il faut répondre au téléphone ou à la porte.");
  Q('par', 'p', "Mon enfant de 2 ans refuse un légume. Que faire ?",
    "Le proposer à nouveau, sans forcer ni punir (jusqu'à 8-10 fois)", "Le forcer à finir son assiette", "Arrêter définitivement après un refus",
    "La peur des aliments nouveaux est normale à cet âge. Voir, sentir, toucher, goûter… le goût vient par la répétition et le plaisir de manger ensemble.");
  Q('par', 'p', "Le brossage des dents d'un tout-petit…",
    "Dès la première dent, 2 fois par jour, avec une petite quantité de dentifrice fluoré (grain de riz avant 3 ans)", "Seulement à partir de 6 ans", "Sans dentifrice jusqu'à 10 ans",
    "Les dents de lait comptent : elles guident les dents définitives. On brosse pour l'enfant avant de le laisser faire seul, et on crache sans rincer.");
  Q('par', 'p', "Comment savoir si un jouet est dangereux pour un enfant de moins de 3 ans ?",
    "S'il passe dans un rouleau de papier toilette, il est trop petit : risque d'étouffement", "S'il fait plus de 10 cm", "On ne peut pas le savoir",
    "Les petites pièces, piles bouton et aimants sont particulièrement dangereux. On vérifie aussi l'âge indiqué sur l'emballage.");
  Q('par', 'p', "Que favorise l'endormissement le soir ?",
    "Un rituel calme et régulier (bain, histoire, câlin) sans écran", "Une série sur la tablette pour l'occuper", "Des jeux agités juste avant le lit",
    "Des gestes toujours dans le même ordre rassurent l'enfant, qui anticipe le moment du coucher.");
  Q('par', 'p', "Mon enfant a de la fièvre le matin : je lui donne un antipyrétique et le dépose à la crèche sans le dire ?",
    "Non : j'informe l'équipe, car la fièvre masquée peut cacher une maladie", "Oui, comme ça il tiendra la journée", "Oui, mais je ne dis rien pour ne pas être refusé",
    "Les professionnels doivent savoir ce que l'enfant a reçu et pourquoi. Un enfant malade se repose mieux à la maison.");
  Q('par', 'p', "Mon enfant revient grognon et fatigué à 17 h. C'est…",
    "Normal : la collectivité est intense, il a besoin de retrouvailles calmes", "La preuve que la crèche est trop dure", "Un caprice à corriger",
    "Il garde ses émotions toute la journée et les lâche quand il retrouve ses parents : un câlin, un goûter, un temps de calme suffisent souvent.");
  Q('par', 'p', "Cordon de tétine ou collier au cou d'un bébé…",
    "À éviter pendant le sommeil et le jeu : risque de strangulation", "Sans danger si surveillé", "Obligatoire pour les poussées dentaires",
    "Le cordon d'une tétine ne doit pas dépasser 22 cm, et rien autour du cou au lit.");
  Q('par', 'p', "Quand parler d'une inquiétude avec l'équipe de la crèche ?",
    "Dès qu'elle apparaît : le dialogue parents-professionnels est la clé", "À la fin de l'année", "Jamais, pour ne pas déranger",
    "Les professionnels connaissent bien votre enfant. Un rendez-vous peut être demandé à tout moment.");
  Q('par', 'e', "Une maman vous demande comment va un autre enfant de la section. Que répondez-vous ?",
    "Que vous ne donnez pas d'information sur les autres familles, et qu'elle peut en parler avec la direction ou l'autre parent", "Que tout va bien pour lui, vous le connaissez", "Que vous allez lui raconter ce qui s'est passé",
    "La discrétion professionnelle protège toutes les familles, même quand l'information semble banale.");
  Q('par', 'e', "Un parent vous confie une situation personnelle difficile. Votre posture ?",
    "Écouter avec bienveillance, rester dans votre rôle et orienter vers la direction ou les services adaptés", "Donner des conseils personnels", "En parler en salle de pause pour avoir l'avis de l'équipe",
    "Écouter ne veut pas dire résoudre. On redit ce qui est confidentiel et on relaie à la direction ce qui concerne l'enfant.");
  Q('par', 'e', "Un parent refuse que son enfant soit pris en photo. Vous…",
    "Respectez le choix indiqué dans l'autorisation de droit à l'image", "Prenez la photo en cachant le visage plus tard", "La prenez quand même pour le projet de la crèche",
    "Sans autorisation, pas de photo ni de publication. Les images d'enfants relèvent de la protection des données.");
  Q('par', 'e', "Un parent est régulièrement en retard le soir. Que faire ?",
    "En parler sans jugement, comprendre ses contraintes et chercher ensemble les ajustements nécessaires", "Attendre qu'il s'excuse", "Le critiquer devant les autres parents",
    "Dans un partenariat éducatif, on cherche à comprendre ce que vit le parent et à trouver ensemble des ajustements, sans le juger.");
  Q('par', 'x', "Un parent a une question administrative (contrat, facture). À qui s'adresse-t-il ?",
    "À l'interlocuteur dédié du siège, plutôt qu'à l'équipe qui accompagne les enfants", "À n'importe quel professionnel de la section, en pleine journée", "À l'enfant lui-même",
    "Les questions de santé relèvent de la référente santé et accueil inclusif, les conditions d'accueil de la responsable de la crèche, l'administratif du siège : chacun a son interlocuteur.");

  /* ───────── 💬 Partage ───────── */
  D('x', "Comment accueillir un parent qui découvre la crèche pour la première fois ?",
    "Pistes : lui dire bonjour et lui souhaiter la bienvenue, un coin « petit salon » sans barrière, lui laisser la parole, présenter les grandes lignes du projet éducatif sans le noyer d'informations, l'inviter à visiter à son rythme.");
  D('e', "Qu'est-ce qui rend l'espace de sieste vraiment accueillant pour un jeune enfant ?",
    "Pistes : son lit à lui, ses draps et son odeur, un lit placé pour voir entrer les personnes, la température (20 °C au maximum), son doudou, un rituel de coucher toujours identique, un adulte patient et confiant.");
  D('e', "Un enfant mord régulièrement. Qui prévenir, que dire aux parents des deux enfants et quelles actions mettre en place ?",
    "Pistes : noter quand et où ça arrive, repérer les déclencheurs, protéger les autres, parler aux deux familles avec les mêmes mots, proposer un geste ou un mot à l'enfant, valoriser les réussites.");
  D('p', "Quelle est votre plus grande difficulté du moment avec votre enfant (repas, sommeil, écrans…) ? Partagez une astuce qui marche chez vous.",
    "Pistes : on échange sans juger. L'important n'est pas la solution parfaite mais ce qui convient à votre enfant et à votre famille.");
  D('x', "Citez trois gestes du quotidien qui montrent à un enfant qu'on le respecte.",
    "Pistes : annoncer ce qu'on va faire avant de le toucher, se mettre à sa hauteur, lui laisser le temps de répondre, le laisser choisir, s'excuser quand on se trompe.");
  D('e', "Un parent critique une collègue devant d'autres parents. Comment réagissez-vous ?",
    "Pistes : rester calme, ne pas se justifier sur place, proposer un échange en privé, prévenir la direction, soutenir l'équipe sans minimiser le ressenti du parent.");
  D('x', "Quel jeu simple et gratuit pourriez-vous proposer à un enfant de 18 mois avec ce que vous avez sous la main ?",
    "Pistes : boîtes à remplir et vider, tissus à cacher, ballon en chaussettes, instruments en casseroles, comptines avec les doigts.");
  D('x', "Quels objets du quotidien ou de récupération, sans danger, proposeriez-vous à un bébé qui explore ?",
    "Pistes : des contenants variés (possibles et impossibles), des tissus, des objets en bois, en métal ou en carton, plusieurs exemplaires identiques. Ce ne sont pas des jouets mais des jeux par excellence : plus neutres, ils offrent plus de possibilités de manipulation.");
  D('e', "Une famille parle peu français. Comment s'assurer qu'elle a compris un protocole (médicament, urgence, allergie) ?",
    "Pistes : phrases courtes, pictogrammes, interprète ou proche présent, demander de reformuler, remettre un document traduit si possible.");
  D('p', "Comment préparez-vous votre enfant à un changement (crèche, école, naissance, déménagement) ?",
    "Pistes : en parler avec des mots simples, lire des livres sur le sujet, visiter, garder des repères, prévoir du temps de qualité.");
  D('e', "Un enfant refuse la sieste. Quelles alternatives respectueuses de son rythme proposez-vous ?",
    "Pistes : ne pas maintenir au lit un enfant qui n'a pas sommeil, le laisser jouer puis lui reproposer plus tard, observer ses signes de fatigue, garder les mêmes horaires et rituels, échanger avec la famille, lui laisser choisir son objet de sécurisation.");
  D('x', "Au lieu de dire « bravo », comment montrer à un enfant qu'on s'intéresse à son jeu ?",
    "Pistes : décrire ce qu'il fait avec des mots, s'émerveiller de ses idées, jouer au même jeu quand il nous y invite, respecter ses essais et ses erreurs. Le « bravo » installe l'enfant dans le système échec/réussite ; l'intérêt de l'adulte construit sa confiance en lui.");

  /* ───────── 😴 Sommeil et 🍽️ alimentation (rangés dans les thèmes existants) ───────── */
  Q('pro', 'x', "Que met-on dans le lit d'un bébé de 3 mois pour la nuit ?",
    "Une gigoteuse adaptée à la saison, et rien d'autre", "Un tour de lit et des peluches pour le protéger", "Un oreiller plat et une couette légère",
    "Un lit nu, un matelas ferme et une gigoteuse : tout objet mou (tour de lit, peluche, couette, oreiller) augmente le risque d'étouffement.");
  Q('dev', 'x', "À quel âge les bébés commencent-ils à faire des nuits plus longues (5-6 heures d'affilée) ?",
    "Souvent entre 3 et 6 mois, avec de grandes différences d'un enfant à l'autre", "Dès la naissance", "Pas avant 2 ans",
    "Le sommeil se construit progressivement. Comparer son bébé à celui des autres n'aide pas : on s'appuie sur ses besoins à lui.");
  Q('dev', 'x', "Un bébé de 8 mois se réveille plusieurs fois par nuit. C'est…",
    "Fréquent : son sommeil se construit par cycles courts et la séparation peut l'inquiéter", "Le signe qu'il a faim à chaque réveil", "La preuve qu'on le câline trop",
    "Un rituel du coucher rassurant, des repères réguliers et une présence calme aident l'enfant à se rendormir.");
  Q('dev', 'x', "Un enfant de 3 ans ne s'endort pas à la sieste. Que fait-on ?",
    "On ne le maintient pas au lit : il retourne jouer, et on l'accompagne à nouveau au sommeil plus tard, s'il montre des signes de fatigue", "On l'oblige à rester allongé les yeux fermés", "On le laisse pleurer dans sa chambre jusqu'à ce qu'il dorme",
    "Un enfant qui n'a pas sommeil a besoin de bouger et de jouer. Un adulte patient, constant et qui lui fait confiance le rassure plus que tout.");
  Q('dev', 'x', "Quels signes montrent qu'un tout-petit est fatigué ?",
    "Bâillements, yeux frottés, agitation ou irritabilité, regard dans le vide", "Il demande toujours lui-même à aller se coucher", "Il rit beaucoup et court partout : il est en pleine forme",
    "Un enfant trop fatigué peut devenir très excité. On le couche dès les premiers signes, sans attendre qu'il craque.");
  Q('par', 'p', "Pour endormir son enfant, quelle est la bonne méthode ?",
    "Il n'y en a pas une seule : un rituel rassurant et des repères réguliers comptent plus que la technique", "Le laisser pleurer des heures pour qu'il apprenne", "L'endormir toujours dans les bras, sans exception",
    "Chaque famille et chaque enfant sont différents. L'essentiel : un cadre prévisible, une présence rassurante et la possibilité, peu à peu, de s'endormir sans dépendre d'un seul geste.");
  Q('par', 'p', "Faire dormir un nourrisson dans le lit des parents, c'est…",
    "Déconseillé : il dort plus sûrement dans son propre lit, près des parents", "Recommandé pour qu'il dorme mieux", "Sans risque si l'on fait attention",
    "Le couchage partagé augmente le risque de mort inattendue du nourrisson (couette, oreillers, fatigue des parents). Un lit à côté du vôtre permet de rester proche.");
  Q('pro', 'e', "À quel rythme surveille-t-on la sieste dans notre projet pédagogique ?",
    "Toutes les 15 minutes, avec un protocole de surveillance de sieste journalier", "Toutes les heures", "Seulement quand un enfant pleure",
    "On vérifie aussi que la chambre ne dépasse pas 20 °C, que les lits sont éloignés des sources de chaleur et que l'enfant ne peut rien attraper de dangereux depuis son lit (fils de rideaux, objets sur les étagères).");
  Q('pro', 'x', "Des parents demandent de réveiller leur enfant plus tôt de sa sieste pour qu'il s'endorme mieux le soir. Que fait l'équipe ?",
    "Elle accepte, observe le rythme de l'enfant, en parle avec les parents et réveille toujours en douceur, entre deux cycles de sommeil", "Elle refuse : le sommeil d'un enfant ne se touche jamais", "Elle réveille brusquement tous les enfants à heure fixe",
    "Le sommeil de nuit est privilégié : une sieste trop tardive peut rendre le coucher du soir difficile. Si l'enfant doit se lever tôt, il doit pouvoir se coucher tôt.");
  Q('ped', 'e', "Pour l'endormissement en collectivité, on propose…",
    "Un accompagnement individuel dès les signes de fatigue, avec un lit à lui, son doudou et un rituel identique", "Un coucher collectif à heure fixe pour que tout le monde dorme", "Une salle lumineuse avec de la musique",
    "Chaque enfant a ses propres signes de fatigue. Dès qu'ils se déplacent, les enfants dorment en lits bas et peuvent se coucher et se lever seuls. On respecte leurs positions et leurs rituels d'endormissement.");
  Q('pro', 'x', "À quel âge peut-on commencer la diversification alimentaire ?",
    "Entre 4 et 6 mois (pas avant 4 mois révolus)", "Dès 2 mois", "Après 1 an",
    "Avant 4 mois, le système digestif n'est pas prêt. On introduit les aliments un par un, par petites quantités, sans forcer.");
  Q('pro', 'x', "Peut-on ajouter du sel ou du sucre dans les repas d'un bébé ?",
    "Non : on n'ajoute ni sel ni sucre", "Un peu de sel pour le goût", "Du sucre pour qu'il aime les légumes",
    "Les reins d'un bébé sont immatures et les goûts se forment tôt. On valorise les saveurs naturelles et les herbes.");
  Q('pro', 'x', "Quels aliments doivent être évités entiers avant 4-5 ans (risque d'étouffement) ?",
    "Les fruits à coque (cacahuètes, noisettes) et le raisin entier", "La compote", "Le yaourt nature",
    "On coupe les raisins, tomates cerises et saucisses dans la longueur, et on reste auprès de l'enfant qui mange.");
  Q('par', 'x', "Quelle boisson proposer à un enfant pour étancher sa soif ?",
    "L'eau", "Un jus de fruits à volonté", "Un soda léger",
    "L'eau suffit. Les jus et sodas habituent au goût sucré et favorisent les caries.");
  Q('pro', 'e', "Une maman apporte du lait maternel pour son bébé. À la réception, que faites-vous ?",
    "Vérifier l'étiquette (nom, date, heure) et le mettre tout de suite au réfrigérateur", "Le laisser sur le plan de travail jusqu'au repas", "Le mélanger à du lait infantile pour gagner de la place",
    "On respecte la chaîne du froid et le protocole de l'établissement sur la conservation et la réchauffe du lait maternel.");
  Q('pro', 'e', "Un enfant allergique à l'œuf (PAI) : le plat du jour contient de la mayonnaise. Que faire ?",
    "Ne pas lui en donner et lui servir un repas conforme à son PAI", "Retirer la mayonnaise et lui donner le reste", "Lui en donner un tout petit peu",
    "Même une trace peut déclencher une réaction. On évite aussi les contacts entre ustensiles et on garde la trousse d'urgence accessible.");
  Q('par', 'p', "Mon enfant refuse de manger. Que faire ?",
    "Éviter de forcer, de punir ou de promettre un dessert ; proposer, accompagner et manger ensemble", "Promettre un dessert s'il finit son assiette", "Le laisser grignoter toute la journée",
    "L'appétit varie d'un jour à l'autre. À table, un cadre calme, sans écran, avec des horaires réguliers aide à retrouver le plaisir de manger.");
  Q('ped', 'x', "Un bébé veut manger seul et met de la nourriture partout. L'adulte…",
    "Le laisse explorer avec les mains puis la cuillère : c'est un apprentissage", "Le nourrit lui-même pour que ce soit propre", "Lui interdit de toucher la nourriture",
    "Toucher, sentir, goûter : l'enfant découvre les aliments avec tous ses sens. On protège les vêtements et on reste tolérant face au désordre.");
  Q('pro', 'x', "Quel lait donner à un bébé de 8 mois qui n'est pas allaité ?",
    "Un lait infantile adapté à son âge", "Du lait de vache entier", "Une boisson végétale (amande, avoine, soja)",
    "Avant 1 an, le lait de vache et les boissons végétales ne couvrent pas les besoins du bébé (fer, graisses, vitamines).");
  Q('pro', 'e', "Avant de préparer ou de servir le repas des enfants, l'adulte…",
    "Se lave les mains au savon, surtout après un change", "Met simplement un tablier par-dessus sa tenue", "Passe un peu de gel sur des mains visiblement sales",
    "Un gel ne remplace pas le savon sur des mains souillées. L'hygiène des mains est la base de la sécurité des repas.");
  Q('pro', 'x', "Comment vérifier la température d'un biberon ?",
    "Quelques gouttes sur l'intérieur du poignet : tiède, ni chaud ni froid", "Le goûter avec la tétine", "Le passer 2 minutes au micro-ondes",
    "Le micro-ondes chauffe de façon inégale et crée des points brûlants. On chauffe au bain-marie ou au chauffe-biberon.");
  D('x', "Quels rituels du coucher ou de la sieste fonctionnent bien pour vous (en famille ou en crèche) ?",
    "Pistes : lumière tamisée, histoire ou chanson toujours identique, câlin, doudou, signaux de fin de journée, chuchoter pour annoncer ce qui va se passer.");
  D('x', "Comment rendre le temps du repas agréable pour un enfant qui mange peu ou refuse de goûter ?",
    "Pistes : manger avec lui, présenter de petites quantités, nommer les aliments, le laisser se servir, éviter les récompenses et les pressions, patience (8 à 10 essais).");

  /* ───────── 🧴 Hygiène et 🛡️ sécurité ───────── */
  Q('pro', 'e', "Un bébé a sucé un jouet. Que fait-on ?",
    "On le met de côté pour le laver et le désinfecter avant de le remettre en circulation", "On le remet aussitôt dans la caisse", "On l'essuie avec sa manche",
    "Les jouets portés à la bouche passent d'un enfant à l'autre : un bac « à laver » évite la transmission des microbes.");
  Q('pro', 'x', "Peut-on mélanger de l'eau de Javel avec un détartrant ou un autre produit ménager ?",
    "Jamais : le mélange peut dégager un gaz toxique", "Oui, ça nettoie mieux", "Oui, dans une pièce fermée",
    "On n'associe pas les produits, on suit le mode d'emploi et on aère. Les produits restent dans leur emballage d'origine.");
  Q('pro', 'x', "Où range-t-on les produits d'entretien ?",
    "Hors de portée des enfants, dans leur emballage d'origine, dans un placard fermé ou en hauteur", "Dans une bouteille d'eau vide pour gagner de la place", "Sous l'évier, la porte entrouverte",
    "Une bouteille d'eau ou de jus attire l'enfant : un produit ménager avalé est une urgence (15 ou centre antipoison).");
  Q('pro', 'x', "Après avoir mouché un enfant, l'adulte…",
    "Jette le mouchoir à usage unique et se lave les mains", "Garde le mouchoir dans sa poche pour le réutiliser", "Essuie simplement ses doigts sur son vêtement",
    "Un mouchoir à usage unique, une poubelle fermée et des mains lavées limitent la propagation des rhumes et des gastros.");
  Q('pro', 'x', "Dès 2-3 ans, quel geste apprend-on à un enfant qui tousse ou éternue ?",
    "Tousser ou éternuer dans son coude", "Dans ses mains", "À l'air libre, sans rien faire",
    "Le pli du coude évite de contaminer les mains, donc les objets et les autres enfants. Les adultes montrent l'exemple.");
  Q('pro', 'e', "Plusieurs enfants ont une gastro-entérite dans la section. Quelles mesures ?",
    "Renforcer le lavage des mains au savon, nettoyer et désinfecter les surfaces, isoler le linge souillé, prévenir la direction", "Ne rien changer, c'est banal", "Utiliser uniquement du gel hydroalcoolique",
    "Le savon est plus efficace que le gel sur certains virus. On pense aussi à informer les familles des consignes à suivre.");
  Q('pro', 'e', "Le matelas à langer est nettoyé…",
    "Après chaque change, ou protégé par un papier à usage unique changé à chaque enfant", "Une fois par jour", "Une fois par semaine",
    "Le plan à langer touche les fesses de chaque enfant : le nettoyage après chaque change est la règle.");
  Q('pro', 'e', "Pour la literie et le linge, la règle est…",
    "Une literie personnelle pour chaque enfant, changée dès qu'elle est souillée et régulièrement", "Un drap commun pour tous", "Un lavage uniquement en fin d'année",
    "Un enfant malade peut contaminer les autres par la literie. Les doudous sont aussi personnels, et lavés selon le protocole.");
  Q('par', 'p', "Où ranger les médicaments à la maison ?",
    "En hauteur, dans un placard fermé, hors de portée des enfants", "Dans le sac à main posé par terre", "Dans la salle de bain, à portée de main",
    "Les médicaments sont une cause fréquente d'intoxication des tout-petits. Même un sirop doux n'est pas anodin.");
  Q('pro', 'e', "À quelle fréquence aérer les pièces où vivent les enfants ?",
    "Chaque jour, au moins 10 minutes, même en hiver", "Seulement l'été", "Jamais, pour éviter de refroidir les enfants",
    "L'air des pièces se charge en humidité, microbes et polluants. On aère pendant que les enfants sont dans une autre pièce.");

  Q('par', 'p', "Que faire des prises électriques accessibles aux tout-petits ?",
    "Les équiper d'obturateurs ou de prises sécurisées", "Les laisser telles quelles : l'enfant apprendra à ne pas y toucher", "Les cacher derrière un rideau",
    "Un enfant explore avec les doigts : l'obturateur évite l'électrisation. Les rallonges et multiprises sont aussi rangées.");
  Q('pro', 'x', "Une barrière d'escalier doit être…",
    "Fixée en haut et en bas, et vérifiée régulièrement", "Posée de temps en temps quand on y pense", "Inutile dès que l'enfant sait marcher",
    "Les chutes dans les escaliers sont fréquentes entre 1 et 3 ans. On vérifie aussi que l'enfant ne peut pas l'escalader.");
  Q('par', 'p', "Fenêtres et balcons : que faire avec un jeune enfant ?",
    "Ne laisser aucun meuble sous la fenêtre et sécuriser l'ouverture (entrebâilleur, verrou)", "Compter sur le fait qu'il a peur du vide", "L'envoyer jouer sur le balcon seul",
    "Un enfant peut grimper en quelques secondes. Un meuble ou une chaise sous une fenêtre devient un escabeau.");
  Q('par', 'p', "Les cordons de rideaux ou de stores sont…",
    "Un risque de strangulation : ils doivent être hors de portée", "Sans danger s'ils sont courts", "Un jeu intéressant pour éveiller l'enfant",
    "On attache ou on enlève les cordons, et on éloigne le lit des rideaux.");
  Q('par', 'x', "Piscine gonflable, seau, baignoire : que faut-il retenir ?",
    "Un enfant peut se noyer en quelques centimètres d'eau et en silence : surveillance constante à portée de bras", "Dès qu'il est en brassards, il ne risque rien", "On peut s'éloigner brièvement si l'eau est basse",
    "La noyade est silencieuse. On vide les récipients après usage et on garde le regard sur l'enfant, sans téléphone.");
  Q('pro', 'x', "Dans une chaise haute, l'enfant doit être…",
    "Attaché avec le harnais complet et jamais laissé seul", "Assis sans harnais s'il se tient droit", "Laissé seul quelques minutes pour manger",
    "Le harnais empêche les glissades sous le plateau et les chutes. L'adulte reste à proximité.");
  Q('pro', 'e', "Une alarme incendie sonne dans la crèche. Quel est le bon réflexe ?",
    "Évacuer les enfants selon le plan d'évacuation et faire l'appel avec la liste des présents", "Éteindre soi-même le feu avant de faire sortir les enfants", "Rassembler les enfants à l'intérieur, loin des fenêtres",
    "La priorité est de mettre les enfants en sécurité. On prévient les secours (18 ou 112) et personne ne retourne à l'intérieur.");
  Q('pro', 'x', "Un enfant avale une pile bouton. Que faire ?",
    "Appeler le 15 tout de suite, sans le faire vomir ni manger", "Attendre qu'elle sorte naturellement", "Lui faire boire beaucoup d'eau",
    "Une pile bouton peut brûler l'œsophage en quelques heures. Les aimants avalés sont aussi une urgence. On garde l'emballage ou la référence.");
  Q('pro', 'e', "Un parent inconnu vient chercher un enfant. Vous…",
    "Ne le lui remettez que s'il est autorisé par les parents et que son identité est vérifiée", "Le lui remettez s'il connaît le prénom de l'enfant", "Le lui remettez s'il apporte le doudou",
    "On suit la liste des personnes autorisées. En cas de doute, on contacte les parents ou la direction avant toute remise.");
  Q('pro', 'e', "Un enfant allergique fait une réaction grave (visage gonflé, difficulté à respirer). Que faire ?",
    "Utiliser le stylo d'adrénaline prévu au PAI et appeler le 15", "Lui donner un antihistaminique et attendre", "Lui faire boire de l'eau et le laisser se reposer",
    "Chaque seconde compte : on suit le protocole du PAI, on note l'heure de l'injection et on reste avec l'enfant jusqu'à l'arrivée des secours.");
  Q('pro', 'x', "Un enfant saigne du nez. Que faire ?",
    "Pencher sa tête en avant et pincer les narines pendant environ 10 minutes", "Pencher sa tête en arrière", "Introduire un coton profondément dans la narine",
    "Tête en arrière, le sang coule dans la gorge. Si le saignement dure plus de 20 minutes ou suit un choc, on demande un avis médical.");
  Q('pro', 'x', "Par forte chaleur, un enfant est rouge, somnolent et agité. Que faire ?",
    "Le mettre au frais, le rafraîchir, le faire boire et appeler le 15", "Le couvrir pour qu'il transpire", "Le laisser dormir au soleil",
    "Un coup de chaleur est une urgence. En période de canicule, on propose de l'eau régulièrement et on évite les sorties aux heures chaudes.");
  Q('pro', 'e', "Après un accident ou un incident, que consigne-t-on ?",
    "Les faits, l'heure, les gestes réalisés, et on prévient les parents et la direction", "Rien si l'enfant va bien", "Uniquement le nom de l'enfant",
    "Une trace écrite précise protège l'enfant, la famille et l'équipe, et sert à améliorer la prévention.");
  Q('pro', 'e', "Lors d'une sortie à l'extérieur, que fait-on avant de partir ?",
    "Compter les enfants avec la liste (départ, pendant, retour) et emporter la trousse de secours et un téléphone", "Partir sans compter : on connaît les enfants", "Laisser les enfants marcher sans surveillance",
    "On compte à chaque étape et on garde les enfants dans son champ de vision, avec le taux d'encadrement prévu.");
  D('x', "À hauteur d'enfant (environ 80 cm du sol), quels dangers repérez-vous dans la pièce où vous êtes ?",
    "Pistes : prises, câbles, angles de meubles, objets coupants, produits à portée, fenêtres, petits objets au sol. Qu'est-ce qui peut être réglé tout de suite ?");
  D('e', "Racontez un « presque-accident » dont vous avez tiré une leçon. Qu'avez-vous changé ensuite ?",
    "Pistes : on parle de faits et d'organisation, pas de fautes. L'objectif est d'améliorer la prévention ensemble.");

  /* ───────── Pour tous les âges de la micro-crèche : dès 2 mois et demi, jusqu'à 3-4 ans ───────── */
  Q('dev', 'x', "Vers quel âge un bébé tient-il sa tête seul ?",
    "Vers 3-4 mois", "Dès la naissance", "Vers 8 mois",
    "Avant, on soutient toujours la tête et la nuque, au change, au portage et au biberon.");
  Q('pro', 'e', "Un bébé de 3 mois éveillé est posé sur le ventre sur un tapis. Qu'en pensez-vous ?",
    "C'est bénéfique tant qu'il est éveillé et surveillé : nuque et dos se renforcent", "C'est dangereux jusqu'à 1 an", "On peut l'y laisser dormir un moment",
    "Ce temps « ventre » éveillé aide la motricité. Pour dormir, on couche toujours le bébé sur le dos.");
  Q('dev', 'x', "Vers 4-6 mois, un bébé porte tout à la bouche. Pourquoi ?",
    "C'est sa façon d'explorer le monde : on lui propose des objets propres et adaptés à son âge", "C'est une mauvaise habitude à corriger", "Il a toujours faim",
    "La bouche est son principal outil d'exploration. On surveille la taille des objets et on lave les jouets régulièrement.");
  Q('ped', 'e', "Pendant les soins d'un petit bébé (change, habillage), on…",
    "Lui annonce ce qu'on fait, on le regarde et on lui parle : le soin devient un moment de relation", "Va vite sans rien dire pour gagner du temps", "Profite du soin pour parler avec ses collègues",
    "Les soins sont des temps privilégiés d'attention individuelle : respect du rythme, gestes doux, regards et paroles.");
  Q('pro', 'x', "Un enfant de 2 ans s'étouffe et ne peut plus tousser ni respirer. Quel geste ?",
    "5 claques dans le dos puis 5 compressions de l'abdomen (manœuvre de Heimlich), en alternance, et appeler le 15", "Le faire boire pour faire passer", "Lui passer les doigts au fond de la gorge",
    "Après 1 an, on alterne claques dans le dos et compressions abdominales. Pour un bébé de moins d'un an, ce sont les compressions du thorax.");

  /* ───────── Projet éducatif et pédagogique Koalakids (01/10/2025) ───────── */
  Q('dev', 'x', "Comment un enfant de moins de 3 ans apprend-il le mieux ?",
    "En jouant, en observant, en imitant et en répétant ses actions, dans un environnement sûr", "En suivant des leçons et les consignes de l'adulte", "En faisant des activités avec un résultat attendu",
    "Il apprend de façon implicite, par ses propres expériences : jouer et apprendre sont des synonymes pour lui. Il a besoin d'un équilibre entre régularité et nouveauté, et que l'on accepte ses « erreurs ».");
  Q('ped', 'e', "Parmi ces propositions, laquelle évite-t-on pour des enfants de moins de 3 ans ?",
    "Une activité avec un résultat attendu (« on fait un joli dessin pour maman »)", "Un jeu de manipulation avec des contenants variés", "Des objets de récupération sans danger",
    "Les activités de type scolaire et les productions ne correspondent pas à l'âge des enfants. L'enfant reste l'auteur de son jeu : les limites servent de cadre, et à l'intérieur il crée son jeu.");
  Q('ped', 'e', "Pour favoriser les échanges entre jeunes enfants, on propose…",
    "Plusieurs objets identiques en nombre suffisant, pour qu'ils puissent s'imiter", "Des objets tous différents, pour qu'ils apprennent à se les échanger", "Un seul objet très attractif, pour apprendre à attendre",
    "L'imitation simultanée est une forme de communication entre enfants de cet âge : la notion d'échange est encore trop abstraite. Cela évite aussi bien des conflits.");
  Q('ped', 'e', "Deux enfants de 2 ans se disputent un objet. Que fait l'adulte ?",
    "Il reste présent sans intervenir tout de suite, sauf danger ou blocage ; s'il intervient, il accompagne les deux enfants", "Il sépare aussitôt les enfants et punit celui qui a pris l'objet", "Il donne l'objet à celui qui l'avait en premier, sans un mot",
    "Les deux enfants sont en situation d'apprentissage. On leur laisse l'occasion de s'accorder et de trouver ensemble une solution.");
  Q('ped', 'x', "Doit-on exiger d'un enfant de 2 ans qu'il dise « merci » ou « pardon » ?",
    "Non : on les utilise nous-mêmes avec lui et entre adultes, et il imite peu à peu", "Oui, c'est la base de la politesse", "Oui, sinon il n'aura pas son goûter",
    "L'enfant apprend surtout par imprégnation et imitation. Lui demander de s'excuser ou de réfléchir à ses actes ne correspond pas à son développement.");
  Q('ped', 'e', "Combien de propositions de jeu sont ouvertes dès que possible le matin ?",
    "Au moins deux, pour ne pas concentrer tous les enfants au même endroit", "Une seule, plus facile à surveiller", "Autant que d'enfants",
    "Les enfants jouent là où se trouvent l'adulte et les objets. Deux propositions leur permettent de choisir et d'exercer leur autonomie.");
  Q('ped', 'e', "Pourquoi évite-t-on de regrouper tous les enfants pour le lavage des mains ou pour des « temps forts » ?",
    "Parce que les jeunes enfants ne fonctionnent pas encore en groupe : ces regroupements sont frustrants et stressants", "Parce que cela prend trop de place", "Parce que les enfants n'aiment pas se laver les mains",
    "Les soins, le repas et le sommeil se font individuellement, au rythme de chacun, avec une organisation « en orchestre » où chaque professionnel joue sa partition.");
  Q('ped', 'e', "Un enfant veut faire seul quelque chose qu'on pense trop difficile pour lui. Que propose-t-on ?",
    "Trouver l'astuce qui lui laisse une participation dans l'action", "Faire à sa place pour aller plus vite", "Lui interdire d'essayer",
    "Chaque enfant est à son maximum de développement : pas de comparaison, pas de brusquerie pour aller plus vite, pas de refus pour le ralentir.");
  Q('ped', 'e', "Quand change-t-on la couche d'un enfant ?",
    "Quand il en a réellement besoin ou qu'il le demande, de façon individuelle", "À heures fixes pour tous les enfants", "Quand le groupe passe en salle de bain",
    "Le change n'est ni systématique ni groupal : c'est un moment de relation individuelle. Si l'enfant est en plein jeu, on se demande si cela peut attendre.");
  Q('ped', 'e', "Un enfant refuse le change. Quels choix peut-on lui proposer ?",
    "Finir son jeu avant, choisir la personne, être changé debout ou allongé", "Aucun : le change est obligatoire et immédiat", "Choisir s'il veut être changé ou non",
    "Les choix portent sur la façon dont se déroule le soin. Un enfant qui marche peut être changé debout : c'est plus rapide et il est plus acteur.");
  Q('ped', 'e', "Quelle formule respecte le mieux l'enfant pendant un change ?",
    "« Je vais changer ta couche »", "« Je vais changer tes fesses »", "« Tu es tout sale, je te change »",
    "Nos mots reflètent la façon dont l'enfant et le soin sont considérés : c'est la couche qui est changée, et le langage doit permettre d'envisager le soin, pas juger un état de non-propreté.");
  Q('ped', 'e', "Avant de commencer un soin, l'adulte…",
    "Annonce à l'enfant ce qui va se passer et lui laisse la possibilité d'accepter", "Le prend et le change rapidement sans rien dire", "Le déshabille entièrement pour gagner du temps",
    "Pas de déshabillage inutile, une main toujours sur l'enfant, une température agréable, des gestes doux (le rouler sur le côté, sans le soulever par les pieds) : le soin est un moment de relation individuelle.");
  Q('ped', 'e', "Au repas, sur quoi l'enfant peut-il choisir ?",
    "Sur la façon de manger : coupé ou non, avec ou sans aide, cuillère ou fourchette, se servir seul", "Sur ce qu'il veut manger : il décide du menu", "Sur l'heure à laquelle toute la section déjeune",
    "Choisir ce qui est servi est la prérogative de l'adulte. Le choix porte sur la manière de manger, et l'autonomie consiste à choisir entre faire seul ou être aidé.");
  Q('ped', 'x', "Un enfant recrache un aliment qu'il n'aime pas. Que fait l'adulte ?",
    "Il l'accepte, ne force pas à goûter et représente régulièrement l'aliment", "Il lui fait finir son assiette", "Il le garde à table jusqu'à ce qu'il avale",
    "On entend le « non » du premier coup, sans chantage. Les enfants se méfient parfois d'aliments inconnus : on les leur présente régulièrement pour les familiariser.");
  Q('ped', 'e', "Comment s'assure-t-on que les jeunes enfants boivent entre les repas ?",
    "De l'eau est en libre accès (broc et verres, « bar à eau ») et on en propose à ceux qui ne demandent pas", "On ne donne de l'eau qu'au moment des repas", "On attend qu'ils réclament à boire",
    "Les jeunes enfants expriment peu leur soif : en dehors des repas, elle doit être prise en considération.");
  Q('pro', 'x', "Un bébé de 3 mois montre des signes de faim. Que fait-on ?",
    "On prépare son biberon tout de suite : avant 4 mois, pas de réserve, il ne peut pas attendre", "On attend l'heure prévue du biberon", "On lui donne un biberon préparé à l'avance",
    "On repère les signes de faim et on propose à manger avant qu'il ne réclame à cor et à cris. La préparation respecte les règles d'hygiène et de conservation.");
  Q('ped', 'e', "Pour donner la cuillère à un enfant, l'adulte…",
    "Se place à sa hauteur, face à lui, suit son rythme et reste en relation du début à la fin du repas", "Reste debout et enchaîne les cuillères pour gagner du temps", "Se relève pour préparer la suite pendant le repas",
    "Le nourrissage est une relation : l'enfant vit mal que l'adulte la rompe pour des raisons matérielles. On prévoit tout à portée de main et on propose dès que possible une double cuillère.");
  Q('pro', 'x', "Vers quel âge propose-t-on des aliments en texture granuleuse (écrasés) ?",
    "Vers 8 mois, après des purées lisses au début", "Dès le début de la diversification", "Seulement après 2 ans",
    "Diversification entre 4 et 6 mois, textures lisses puis granuleuses vers 8 mois, morceaux vers un an. L'enfant mange sans texture adaptée entre 2 et 3 ans.");
  Q('ped', 'e', "À table, on accepte que les enfants…",
    "Se salissent, manipulent les aliments, bougent et mangent à leur rythme", "Ne touchent pas la nourriture avec leurs mains", "Restent assis jusqu'à avoir fini leur assiette",
    "Il est normal que l'enfant se salisse : c'est à l'adulte de prévoir des facilités de nettoyage. Les enfants apprennent à manger en touchant et en imitant.");
  Q('pro', 'e', "Un enfant qui marche dort en lit bas. Porte-t-il une gigoteuse ?",
    "Non : il risquerait de tomber en voulant se lever ; on le couvre d'un drap ou d'une couverture selon la saison", "Oui, toujours, comme les bébés", "Oui, pour qu'il ne se lève pas",
    "Les bébés qui ne se déplacent pas dorment sur le dos, sans oreiller ni couette ni couverture. Les enfants qui marchent sortent seuls de leur lit bas : cela favorise leur autonomie.");
  Q('ped', 'e', "Quand couche-t-on un enfant ?",
    "Dès qu'il montre des signes de fatigue, encore éveillé, pour qu'il fasse le lien entre fatigue et sommeil", "À heure fixe pour tous", "Quand il s'est endormi dans nos bras",
    "Bâillements, yeux frottés, doudou réclamé, excitation, pâleur : chaque enfant a ses signes. L'enfant apprend à dormir par la répétition et les rituels de coucher et de lever.");
  Q('ped', 'e', "Si possible, comment place-t-on le lit d'un jeune enfant ?",
    "De façon qu'il voie entrer les personnes, pour que les visages n'apparaissent pas d'un coup au-dessus de sa tête", "Face au mur pour qu'il ne soit pas distrait", "Au centre de la pièce",
    "Son lit lui est propre : s'il est partagé avec un autre enfant, ses draps sont conservés pour son retour afin qu'il retrouve son odeur. L'enfant a besoin d'un nid sensoriel qui le sécurise.");
  Q('par', 'e', "Un parent demande comment faire arrêter la tétine. Quelle posture adopter ?",
    "Se positionner comme personne ressource : informer et accompagner son propre choix, sans donner de consigne", "Lui donner la bonne méthode : c'est vous la spécialiste", "Lui dire de faire comme à la crèche",
    "Nous ne sommes pas là pour donner des conseils mais pour accompagner les parents dans leur cheminement. On soutient leurs choix sans les juger, tant qu'ils ne relèvent pas de violences faites aux enfants : sinon, on en parle en équipe et on signale.");
  Q('par', 'e', "Que privilégie-t-on lors de la première rencontre avec une famille ?",
    "L'écoute de ce que les parents ont envie de dire, plutôt qu'un questionnaire préétabli", "Un questionnaire détaillé à remplir", "La lecture complète du règlement",
    "Laisser la main aux parents donne plus de renseignements et leur signifie que ce sont eux qui décident ce que l'équipe a besoin de savoir. On présente aussi les grandes lignes du projet éducatif, sans les noyer d'informations.");
  Q('par', 'e', "Où note-t-on les informations confidentielles (traitement, incident) ?",
    "Dans le cahier d'équipe, réservé aux professionnels", "Dans le cahier parental à l'entrée", "Sur le tableau des repas visible de tous",
    "Le cahier parental sert à la communication courante avec la famille ; le cahier d'équipe garantit la confidentialité. Chaque professionnel lit les deux chaque jour.");
  Q('par', 'e', "Un parent est mécontent à propos de la santé de son enfant. Qui lui répond ?",
    "La référente santé et accueil inclusif, à l'oral (appel ou rencontre), avec un écrit au besoin ; la réclamation est tracée", "Le premier collègue disponible, sans en garder trace", "Personne : on laisse passer quelques jours",
    "Pour les conditions d'accueil, c'est la responsable de la crèche, avec la coordinatrice pédagogique au besoin. Pour une question administrative, l'interlocuteur dédié du siège. Toutes les réclamations sont tracées.");
  Q('par', 'x', "À la crèche, jusqu'à quand un parent peut-il rester avec son enfant ?",
    "Aussi longtemps qu'il le souhaite, à tout moment de la journée, y compris pour allaiter", "Seulement pendant les premiers jours", "Uniquement aux horaires d'arrivée et de départ",
    "Les parents sont toujours les bienvenus et peuvent circuler librement. Ils décident aussi des modalités d'entrée de leur enfant et peuvent les modifier, en concertation avec l'équipe.");
  Q('par', 'e', "À quoi sert l'album de l'enfant ?",
    "À raconter sa vie à la crèche (photos, mots doux, anecdotes) : ouvert dès la première rencontre, en libre accès, remis à son départ", "À noter ses repas et ses siestes", "À garder ses dessins pour l'école",
    "C'est un outil de communication enfant-parents-professionnels qui s'inscrit dans le partenariat éducatif.");
  Q('par', 'e', "Une famille arrive en urgence, sans temps de préparation. Que fait l'équipe ?",
    "Elle l'accueille avec la même chaleur, sans ajouter d'inquiétude, et fait confiance à l'enfant pour tisser des liens", "Elle refuse tant que l'entrée n'est pas préparée", "Elle impose un protocole d'adaptation accéléré",
    "On s'appuie sur l'observation de l'enfant et sur ses signaux. On fera plus ample connaissance avec la famille au fil des arrivées et des départs.");
  D('e', "Racontez une situation où vous avez laissé l'enfant « vous guider » (modèle de l'accompagnement). Qu'est-ce que cela a changé ?",
    "Pistes : regarder ce que l'enfant fait avant d'intervenir, lui laisser le choix de la façon, accepter son rythme, se demander ce qu'il cherche à comprendre.");

  window.KK_JEU_CARTES = CARTES;

  /* Cartes « Chance » */
  window.KK_JEU_CHANCE = [
    { t: "Un grand sourire d'enfant te donne de l'énergie !", e: "Avance de 2 cases.", move: 2 },
    { t: "Une chanson commune détend tout le monde.", e: "Avance de 3 cases.", move: 3 },
    { t: "Le doudou est introuvable…", e: "Recule de 2 cases.", move: -2 },
    { t: "Embouteillage devant le portillon !", e: "Passe ton prochain tour.", passe: true },
    { t: "Journée parfaite, tout s'enchaîne.", e: "Rejoue !", rejoue: true },
    { t: "Un câlin réconfortant.", e: "Gagne une feuille d'eucalyptus 🌿.", feuille: 1 },
    { t: "Un oubli de dernière minute.", e: "Recule d'une case.", move: -1 },
    { t: "Un merci spontané d'un parent ou d'un collègue.", e: "Gagne une feuille 🌿 et avance d'une case.", feuille: 1, move: 1 }
  ];
})();
