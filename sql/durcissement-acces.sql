-- ============================================================================
-- Durcissement des accès (audit du projet quiz, octobre 2026)
-- ============================================================================
-- 1. axe_formation : la règle « axe_formation_gestion » donnait tout (ALL, true)
--    à n'importe quel compte connecté. Elle est réservée au compte
--    administrateur, comme quiz, questions, module, bloc, echanges…
-- 2. Vidéos de formation : envoi, modification et suppression réservés au
--    compte administrateur (comme les images). La lecture reste publique.
-- 5. Droits inutiles de anon / authenticated (TRUNCATE, REFERENCES, TRIGGER) :
--    retirés des tables du schéma public, et pour les tables futures.
--
-- À appliquer dans le projet QUIZ (phbcqxjzobzwuzetgbem). Relançable.
-- Retour arrière : remettre les anciennes règles (voir fin du fichier).
-- ============================================================================

-- 1 ---------------------------------------------------------------------------
alter policy axe_formation_gestion on public.axe_formation
  using (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid)
  with check (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);

-- 2 ---------------------------------------------------------------------------
alter policy "videos admin envoi" on storage.objects
  with check (bucket_id = 'videos-formations'
              and auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);
alter policy "videos admin maj" on storage.objects
  using (bucket_id = 'videos-formations'
         and auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);
alter policy "videos admin suppr" on storage.objects
  using (bucket_id = 'videos-formations'
         and auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);

-- 5 ---------------------------------------------------------------------------
revoke truncate, references, trigger on all tables in schema public from anon, authenticated;
alter default privileges in schema public revoke truncate, references, trigger on tables from anon, authenticated;

-- Contrôle (lecture seule) : attendu, aucune ligne.
-- select table_name, grantee, privilege_type from information_schema.role_table_grants
--  where table_schema='public' and grantee in ('anon','authenticated')
--    and privilege_type in ('TRUNCATE','REFERENCES','TRIGGER');

-- Retour arrière ---------------------------------------------------------------
-- alter policy axe_formation_gestion on public.axe_formation using (true) with check (true);
-- alter policy "videos admin envoi" on storage.objects with check (bucket_id = 'videos-formations');
-- alter policy "videos admin maj"   on storage.objects using (bucket_id = 'videos-formations');
-- alter policy "videos admin suppr" on storage.objects using (bucket_id = 'videos-formations');
