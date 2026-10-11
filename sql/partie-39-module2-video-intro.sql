-- ============================================================================
-- PARTIE 39 — Vidéo d'introduction « L'enfant explorateur » (module 2, séquence 1/3)
-- Place un bloc « video » en TOUTE PREMIÈRE position de la séquence. L'adresse
-- reste vide : tant qu'elle est vide, rien ne s'affiche pour les apprenants.
-- Ensuite, dans l'admin : ouvrir cette séquence, bloc « Vidéo » en haut,
-- « Choisir un fichier MP4 », puis Enregistrer.
-- Prérequis : partie 33 (séquence 1/3) et partie 38 (type « video »).
-- Relançable : n'ajoute le bloc que si la séquence n'en a pas déjà un.
-- ============================================================================

-- 39.1 Attendu : aucune ligne retournée.
do $do$
declare mid public.module.id%type;
begin
  select id into mid from public.module
   where titre = $kk$Module 2 – 1/3 · Apport (e-learning)$kk$;
  if mid is null then
    raise exception 'Séquence 1/3 du module 2 introuvable : exécuter la partie 33 avant.';
  end if;
  if not exists (select 1 from public.bloc where module_id = mid and type = 'video') then
    update public.bloc set ordre = ordre + 1 where module_id = mid;
    insert into public.bloc(module_id, type, contenu, ordre)
    values (mid, 'video',
            $kk${"url": "", "titre": "L'enfant explorateur", "legende": ""}$kk$::jsonb, 0);
  end if;
end
$do$;
-- FIN 39.1

-- 39c Contrôle (lecture seule). Attendu : le bloc « video » a l'ordre 0.
select b.ordre, b.type, b.contenu->>'titre' as titre
from public.bloc b join public.module m on m.id = b.module_id
where m.titre = $kk$Module 2 – 1/3 · Apport (e-learning)$kk$
order by b.ordre limit 3;
-- FIN 39c
