-- ============================================================================
-- Parcours de formation par collaborateur/trice (lecture depuis gestion-stock)
-- ============================================================================
-- gestion-stock (base Supabase distincte) veut afficher, sur la fiche de
-- chaque collaborateur/trice, l'historique de ses quiz passés ici. Le seul
-- lien fiable entre un résultat et une personne est `resultats.ref` : un
-- identifiant opaque transmis dans l'URL du quiz (`?ref=...`), déjà utilisé
-- pour rattacher un résultat à un dossier de stage (cf. le commentaire sur
-- `PRE.ref` dans index.html) — on réutilise le même mécanisme pour les
-- fiches collaborateurs.
--
-- admin.html lit `resultats` derrière une connexion authentifiée (direction).
-- gestion-stock, elle, n'a pas de session sur CE projet Supabase : ses pages
-- interrogent donc cette fonction avec la clé anonyme. Pour ne jamais exposer
-- l'ensemble de la table à l'anon key, la fonction ne renvoie que les lignes
-- dont le `ref` correspond exactement à celui demandé (un identifiant opaque,
-- non devinable) — jamais un listing ouvert.
-- ============================================================================

alter table public.resultats add column if not exists ref text;
create index if not exists resultats_ref_idx on public.resultats (ref);

create or replace function public.kk_resultats_par_ref(p_ref text)
returns table(
  id uuid,
  quiz_id uuid,
  quiz_titre text,
  score int,
  total int,
  pourcentage int,
  passe_le timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.id, r.quiz_id, q.titre, r.score, r.total, r.pourcentage, r.passe_le
  from public.resultats r
  join public.quiz q on q.id = r.quiz_id
  where p_ref is not null and p_ref <> '' and r.ref = p_ref
  order by r.passe_le desc;
$$;

revoke all on function public.kk_resultats_par_ref(text) from public;
grant execute on function public.kk_resultats_par_ref(text) to anon, authenticated;
