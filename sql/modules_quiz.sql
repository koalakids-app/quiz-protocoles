-- ============================================================================
-- Quiz de validation rattaché à une micro-formation
-- ============================================================================
-- Une micro-formation n'a pas de score : gestion-stock ne la considère faite
-- que si le quiz du thème auquel appartient le module est réussi (seuil
-- appliqué côté gestion-stock, 80 %) puis attesté par le/la collaborateur/trice.
-- Cette fonction renvoie, pour chaque module demandé, le quiz du thème
-- (theme.quiz_id) — null si aucun quiz n'y est rattaché. Aucune réponse du
-- quiz n'est exposée, seulement son identifiant et son titre.
-- ============================================================================

create or replace function public.kk_modules_quiz(p_ids uuid[])
returns table(module_id uuid, quiz_id uuid, quiz_titre text)
language sql
security definer
set search_path = public
as $$
  select m.id, t.quiz_id, q.titre
  from public.module m
  left join public.theme t on t.id = m.theme_id
  left join public.quiz q on q.id = t.quiz_id
  where m.id = any(p_ids);
$$;

revoke all on function public.kk_modules_quiz(uuid[]) from public;
grant execute on function public.kk_modules_quiz(uuid[]) to anon, authenticated;
