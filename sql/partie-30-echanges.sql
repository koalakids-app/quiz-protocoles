-- ============================================================================
-- PARTIE 30 — Échanges entre participants (version e-learning)
-- Un bloc « discussion » invite les participants à partager un court message.
-- Règles :
--   * seules les personnes arrivées par leur lien personnel peuvent écrire
--     (référence « ref » et prénom fournis par le lien) ;
--   * chaque message est relu dans l'admin avant d'être visible (« en_attente »
--     -> « valide » ou « refuse ») ;
--   * le public ne lit que les messages validés, jamais la référence du dossier ;
--   * on n'écrit ni nom d'enfant ni nom de collègue (rappel affiché dans le bloc).
-- Sécurité :
--   * la table public.echanges n'est lisible et modifiable que par l'admin ;
--   * le public peut seulement DÉPOSER un message « en_attente », dans un bloc
--     « discussion » d'une séquence publiée ;
--   * le public lit les messages validés par la vue public.echanges_valides, qui
--     n'expose ni la référence ni la crèche ;
--   * un déclencheur limite à 5 messages par heure pour une même référence.
-- À exécuter en 4 temps : 30.1, 30.2, 30.3, puis 30c.
-- Relançable (create if not exists, drop policy if exists, create or replace).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 30.1 Autorise le type de bloc « discussion ». Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
alter table public.bloc drop constraint if exists bloc_type_check;
alter table public.bloc add constraint bloc_type_check check (type = any (array[
  'texte', 'image', 'reflexion', 'retenir', 'citation', 'essayer',
  'scenes', 'comparaison', 'question', 'dialogue', 'discussion'
]::text[]));
-- FIN 30.1

-- ---------------------------------------------------------------------------
-- 30.2 Table des messages et droits. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
create table if not exists public.echanges (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.module(id) on delete cascade,
  bloc_id uuid not null references public.bloc(id) on delete cascade,
  ref text not null,
  prenom text not null,
  creche text,
  message text not null,
  statut text not null default 'en_attente',
  cree_le timestamptz not null default now(),
  modere_le timestamptz,
  constraint echanges_statut_check check (statut in ('en_attente', 'valide', 'refuse')),
  constraint echanges_ref_check check (char_length(ref) between 1 and 120),
  constraint echanges_prenom_check check (char_length(btrim(prenom)) between 1 and 40),
  constraint echanges_creche_check check (creche is null or char_length(creche) <= 80),
  constraint echanges_message_check check (char_length(btrim(message)) between 3 and 800)
);
create index if not exists echanges_bloc_statut_idx on public.echanges (bloc_id, statut, cree_le);
create index if not exists echanges_ref_idx on public.echanges (ref, cree_le);

alter table public.echanges enable row level security;

-- Aucun droit par défaut : on n'accorde que le nécessaire.
revoke all on table public.echanges from anon, authenticated;
grant insert on table public.echanges to anon, authenticated;
grant select, update, delete on table public.echanges to authenticated;

-- Le public (et tout compte connecté) peut seulement déposer un message en attente,
-- dans un bloc « discussion » d'une séquence publiée.
drop policy if exists "depot echange" on public.echanges;
create policy "depot echange" on public.echanges
  for insert to anon, authenticated
  with check (
    statut = 'en_attente'
    and modere_le is null
    and exists (
      select 1
      from public.bloc b
      join public.module m on m.id = b.module_id
      where b.id = echanges.bloc_id
        and b.module_id = echanges.module_id
        and b.type = 'discussion'
        and m.publie = true
    )
  );

-- L'administrateur lit, valide, refuse et supprime (même compte que les autres tables).
drop policy if exists "admin echanges" on public.echanges;
create policy "admin echanges" on public.echanges
  for all to authenticated
  using (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid)
  with check (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);

-- Limite : 5 messages par heure pour une même référence. La fonction s'exécute avec
-- les droits de son propriétaire, car le public n'a pas le droit de lire la table.
create or replace function public.echanges_limite()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if (select count(*) from public.echanges
      where ref = new.ref and cree_le > now() - interval '1 hour') >= 5 then
    raise exception 'echanges_limite : trop de messages en peu de temps'
      using errcode = 'P0001';
  end if;
  return new;
end
$fn$;
revoke all on function public.echanges_limite() from public, anon, authenticated;

drop trigger if exists echanges_limite_trg on public.echanges;
create trigger echanges_limite_trg before insert on public.echanges
  for each row execute function public.echanges_limite();
-- FIN 30.2

-- ---------------------------------------------------------------------------
-- 30.3 Vue publique : messages validés d'une séquence publiée, sans la référence
-- ni la crèche. Attendu : aucune ligne retournée.
-- ---------------------------------------------------------------------------
create or replace view public.echanges_valides as
  select e.id, e.module_id, e.bloc_id, e.prenom, e.message, e.cree_le
  from public.echanges e
  where e.statut = 'valide'
    and exists (select 1 from public.module m where m.id = e.module_id and m.publie = true);

revoke all on table public.echanges_valides from anon, authenticated;
grant select on table public.echanges_valides to anon, authenticated;
-- FIN 30.3

-- ---------------------------------------------------------------------------
-- 30c Contrôle (lecture seule). Attendu : RLS activée ; droits de anon = insert
-- seulement sur la table, select seulement sur la vue ; 2 politiques ; 1 déclencheur ;
-- la contrainte de type cite 'discussion'.
-- ---------------------------------------------------------------------------
select 'rls_activee' as controle, c.relrowsecurity::text as valeur
from pg_class c where c.oid = 'public.echanges'::regclass
union all
select 'droits_anon_table', coalesce(string_agg(g.privilege_type, ', ' order by g.privilege_type), 'aucun')
from information_schema.role_table_grants g
where g.table_schema = 'public' and g.table_name = 'echanges' and g.grantee = 'anon'
  and g.privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
union all
select 'droits_anon_vue', coalesce(string_agg(g.privilege_type, ', ' order by g.privilege_type), 'aucun')
from information_schema.role_table_grants g
where g.table_schema = 'public' and g.table_name = 'echanges_valides' and g.grantee = 'anon'
union all
select 'politiques', string_agg(p.policyname, ', ' order by p.policyname)
from pg_policies p where p.schemaname = 'public' and p.tablename = 'echanges'
union all
select 'declencheur', string_agg(t.tgname, ', ')
from pg_trigger t where t.tgrelid = 'public.echanges'::regclass and not t.tgisinternal
union all
select 'type_discussion_autorise', (pg_get_constraintdef(oid) like '%discussion%')::text
from pg_constraint where conrelid = 'public.bloc'::regclass and conname = 'bloc_type_check';
-- FIN 30c
