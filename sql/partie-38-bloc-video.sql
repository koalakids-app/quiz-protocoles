-- ============================================================================
-- PARTIE 38 — Nouveau type de bloc « video » (formation e-learning)
--   Le bloc affiche soit un fichier MP4 hébergé dans le bucket
--   « videos-formations », soit une vidéo YouTube (lien « non répertoriée »).
-- Relançable.
-- ============================================================================

-- 38.1 Élargit la contrainte sur bloc.type. Attendu : aucune ligne retournée.
alter table public.bloc drop constraint if exists bloc_type_check;
alter table public.bloc add constraint bloc_type_check check (type = any (array[
  'texte', 'image', 'reflexion', 'retenir', 'citation', 'essayer',
  'scenes', 'comparaison', 'question', 'dialogue', 'discussion', 'video'
]::text[]));
-- FIN 38.1

-- 38.2 Bucket public pour les vidéos (limite 100 Mo par fichier).
-- Attendu : aucune ligne retournée.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos-formations', 'videos-formations', true, 104857600,
        array['video/mp4', 'video/webm'])
on conflict (id) do update
  set public = true, file_size_limit = 104857600,
      allowed_mime_types = array['video/mp4', 'video/webm'];
-- FIN 38.2

-- 38.3 Seuls les comptes connectés (admin) peuvent envoyer / modifier / supprimer.
-- La lecture est publique via l'URL du bucket public. Attendu : aucune ligne.
drop policy if exists "videos admin envoi" on storage.objects;
create policy "videos admin envoi" on storage.objects
  for insert to authenticated with check (bucket_id = 'videos-formations');
drop policy if exists "videos admin maj" on storage.objects;
create policy "videos admin maj" on storage.objects
  for update to authenticated using (bucket_id = 'videos-formations');
drop policy if exists "videos admin suppr" on storage.objects;
create policy "videos admin suppr" on storage.objects
  for delete to authenticated using (bucket_id = 'videos-formations');
-- FIN 38.3

-- 38c Contrôle (lecture seule). Attendu : 1 ligne, bucket public, 104857600.
select id, public, file_size_limit from storage.buckets where id = 'videos-formations';
-- FIN 38c
