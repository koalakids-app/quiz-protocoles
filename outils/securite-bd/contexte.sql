-- Contexte minimal qui reproduit, pour les essais de sécurité, ce que Supabase fournit :
--   * les rôles « anon » (visiteur sans compte) et « authenticated » (compte connecté) ;
--   * la fonction auth.uid(), lue dans le paramètre request.jwt.claim.sub ;
--   * les droits par défaut de Supabase sur les nouvelles tables (tout, pour anon et authenticated) ;
--   * les tables module et bloc avec leurs politiques de production (lecture publique des
--     séquences publiées, tout pour le compte administrateur).
-- Le compte administrateur est celui des politiques du projet (d1d86385-9b4f-45e0-8feb-9a790da79ef7).
-- À adapter si d'autres tables entrent dans l'essai.
create role anon nologin; create role authenticated nologin;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema public, auth to anon, authenticated;
grant execute on function auth.uid() to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;

create table public.module (id uuid primary key default gen_random_uuid(), titre text not null, publie boolean not null default false);
create table public.bloc (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.module(id) on delete cascade,
  type text not null, contenu jsonb, ordre int not null default 0,
  constraint bloc_type_check check (type = any (array['texte','image','reflexion','retenir','citation','essayer','scenes','comparaison','question','dialogue']::text[]))
);
alter table public.module enable row level security;
alter table public.bloc enable row level security;
create policy "lecture modules publies" on public.module for select to anon, authenticated using (publie = true);
create policy "admin module" on public.module for all to authenticated
  using (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid) with check (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);
create policy "lecture blocs publies" on public.bloc for select to anon, authenticated
  using (exists (select 1 from public.module where module.id = bloc.module_id and module.publie = true));
create policy "admin bloc" on public.bloc for all to authenticated
  using (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid) with check (auth.uid() = 'd1d86385-9b4f-45e0-8feb-9a790da79ef7'::uuid);

-- Données de test : une séquence publiée (deux blocs), une séquence en brouillon (un bloc).
insert into public.module(id, titre, publie) values
  ('00000000-0000-0000-0000-0000000000a1', 'Publiée', true),
  ('00000000-0000-0000-0000-0000000000a2', 'Brouillon', false);
insert into public.bloc(id, module_id, type) values
  ('00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000a1', 'texte'),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-0000000000a1', 'texte'),
  ('00000000-0000-0000-0000-0000000000b3', '00000000-0000-0000-0000-0000000000a2', 'texte');
