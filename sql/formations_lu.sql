-- ============================================================================
-- Suivi de lecture des micro-formations (module Formation et quiz)
-- ============================================================================
-- Jusqu'ici, une micro-formation (formations.html?module=...) ne laissait
-- aucune trace : ouvrir le lien affichait le contenu, sans rien enregistrer.
-- Impossible donc de savoir, côté gestion-stock, si une personne l'avait
-- effectivement lue.
--
-- Même mécanisme que les quiz (cf. resultats_par_ref.sql) : le lien transmis
-- porte un `ref` opaque — l'id de la fiche collaborateur/trice côté
-- gestion-stock — et la lecture est enregistrée dès que la page détecte
-- qu'on a atteint le bas du module. gestion-stock relit ensuite ce qui a été
-- lu via la fonction kk_formations_par_ref, qui ne renvoie jamais que les
-- lignes du `ref` demandé.
-- ============================================================================

create table if not exists public.formations_lu(
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.module(id) on delete cascade,
  ref text not null,
  lu_le timestamptz not null default now(),
  unique(module_id, ref)
);

alter table public.formations_lu enable row level security;

-- La page formations.html n'est jamais authentifiée (accès par lien, comme le
-- quiz) : l'enregistrement se fait donc avec la clé anonyme. Un `ref` vide
-- n'est jamais accepté — pas de lecture "anonyme" enregistrée sans rattachement.
create policy formations_lu_insert_anon on public.formations_lu
  for insert to anon
  with check (ref is not null and ref <> '');
grant insert on public.formations_lu to anon;

-- Pas de select direct pour l'anon : uniquement via la fonction ci-dessous,
-- qui filtre strictement par ref (même logique que kk_resultats_par_ref).
create or replace function public.kk_formations_par_ref(p_ref text)
returns table(
  id uuid,
  module_id uuid,
  module_titre text,
  lu_le timestamptz
)
language sql
security definer
set search_path = public
as $$
  select f.id, f.module_id, m.titre, f.lu_le
  from public.formations_lu f
  join public.module m on m.id = f.module_id
  where p_ref is not null and p_ref <> '' and f.ref = p_ref
  order by f.lu_le desc;
$$;

revoke all on function public.kk_formations_par_ref(text) from public;
grant execute on function public.kk_formations_par_ref(text) to anon, authenticated;
