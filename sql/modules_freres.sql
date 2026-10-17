-- ============================================================================
-- Modules d'une même formation (même thème)
-- ============================================================================
-- Le quiz de validation porte sur toute la formation : gestion-stock ne le
-- demande qu'une fois toutes les parties du thème lues. Cette fonction renvoie,
-- pour chaque module demandé, les modules publiés de son thème (lui compris).
-- Aucun contenu n'est exposé, seulement des identifiants.
-- ============================================================================

create or replace function public.kk_modules_freres(p_ids uuid[])
returns table(module_id uuid, frere_id uuid)
language sql
security definer
set search_path = public
as $$
  select m.id, f.id
  from public.module m
  join public.module f on f.theme_id = m.theme_id and f.publie
  where m.id = any(p_ids);
$$;

revoke all on function public.kk_modules_freres(uuid[]) from public;
grant execute on function public.kk_modules_freres(uuid[]) to anon, authenticated;
