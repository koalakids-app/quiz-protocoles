-- ============================================================================
-- PARTIE 25 — Deux nouveaux types de blocs : « question » et « dialogue »
-- (formation e-learning). À exécuter AVANT d'ajouter des blocs de ces types.
--   question  : énoncé, réponses (une ou plusieurs justes), explication.
--               Correction immédiate dans la page ; rien n'est enregistré.
--   dialogue  : mise en situation (répliques entendues, consigne, réponse
--               possible affichée sur demande). La saisie reste sur l'appareil.
-- Relançable : la contrainte est remplacée par la même définition élargie.
-- ============================================================================

-- 25.1 Élargit la contrainte sur bloc.type. Attendu : aucune ligne retournée.
alter table public.bloc drop constraint if exists bloc_type_check;
alter table public.bloc add constraint bloc_type_check check (type = any (array[
  'texte', 'image', 'reflexion', 'retenir', 'citation', 'essayer',
  'scenes', 'comparaison', 'question', 'dialogue'
]::text[]));
-- FIN 25.1

-- 25c Contrôle (lecture seule). Attendu : la définition cite 'question' et 'dialogue'.
select conname, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.bloc'::regclass and conname = 'bloc_type_check';
-- FIN 25c
