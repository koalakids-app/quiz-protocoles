#!/usr/bin/env bash
# Essaie de contourner la partie 30 (échanges entre participants) sur une base locale jetable
# qui reproduit les rôles et les politiques de Supabase. Chaque essai a un verdict attendu :
#   ok     la requête doit réussir ;   refus   la requête doit être refusée (erreur, ou 0 ligne).
# Sortie : une ligne par essai, et un code de retour non nul si un verdict n'est pas respecté.
#   ./essais-abus-echanges.sh
# Pour tester une autre table : copier ce fichier, remplacer la partie appliquée et les essais.
set -uo pipefail
ICI="$(cd "$(dirname "$0")" && pwd)"
RACINE="$(cd "$ICI/../.." && pwd)"
export PG_DIR="${PG_DIR:-/tmp/outils-pg}" PG_PORT="${PG_PORT:-55432}"
"$ICI/postgres-local.sh" demarrer >/dev/null || exit 1
trap '"$ICI/postgres-local.sh" arreter >/dev/null' EXIT
psql_() { psql -h "$PG_DIR" -p "$PG_PORT" -U postgres -q -t -A "$@"; }

psql_ -v ON_ERROR_STOP=1 -f "$ICI/contexte.sql" >/dev/null || { echo "contexte.sql a échoué"; exit 1; }
PARTIE_30="${PARTIE_30:-$RACINE/sql/partie-30-echanges.sql}"   # variable utile pour tester une version modifiée
psql_ -v ON_ERROR_STOP=1 -f "$PARTIE_30" >/dev/null 2>&1 || { echo "$PARTIE_30 a échoué"; exit 1; }
# Deux blocs deviennent des blocs « discussion » (le type est autorisé par la partie 30).
psql_ -c "update public.bloc set type='discussion' where id in ('00000000-0000-0000-0000-0000000000b2','00000000-0000-0000-0000-0000000000b3');" >/dev/null

B1=00000000-0000-0000-0000-0000000000b1; B2=00000000-0000-0000-0000-0000000000b2; B3=00000000-0000-0000-0000-0000000000b3
M1=00000000-0000-0000-0000-0000000000a1; M2=00000000-0000-0000-0000-0000000000a2
ADMIN=d1d86385-9b4f-45e0-8feb-9a790da79ef7; AUTRE=11111111-1111-1111-1111-111111111111
echecs=0
# essai "nom" verdict rôle sub "sql"  — verdict : ok | refus (erreur ou 0 ligne affectée)
essai() {
  if [ -z "${5// }" ]; then printf '✘ %s (requête vide : erreur dans le script de test)\n' "$1"; echecs=$((echecs+1)); return; fi
  local sortie; sortie="$(psql_ -c "set role $3; select set_config('request.jwt.claim.sub','$4',false); $5" 2>&1)"
  local verdict=ok
  if echo "$sortie" | grep -qi "error"; then verdict=refus; fi
  # Une modification ou une suppression qui ne touche aucune ligne (le « with … returning » ci-dessous compte les lignes) est un refus.
  if [ "$verdict" = ok ] && [ "$2" = refus ] && [ "$(echo "$sortie" | tail -1)" = 0 ]; then verdict=refus; fi
  if [ "$verdict" = "$2" ]; then printf '✔ %s\n' "$1"; else printf '✘ %s (attendu : %s, obtenu : %s) — %s\n' "$1" "$2" "$verdict" "$(echo "$sortie" | tr '\n' ' ' | cut -c1-120)"; echecs=$((echecs+1)); fi
}
ins() { echo "insert into public.echanges(module_id,bloc_id,ref,prenom,message${6:-}) values ('$1','$2','$3','$4','$5'${7:-});"; }

echo "— Ce que le public PEUT faire"
essai "le public dépose un message en attente (bloc discussion publié)" ok anon "" "$(ins $M1 $B2 ref-A Amina 'Un geste qui aide : parler doucement.')"
echo "— Ce que le public NE doit PAS pouvoir faire"
essai "déposer un message déjà « valide »" refus anon "" "$(ins $M1 $B2 ref-B Amina 'Auto-validé' ',statut' ",'valide'")"
essai "fixer lui-même la date de modération" refus anon "" "$(ins $M1 $B2 ref-B Amina 'Modéré' ',modere_le' ",now()")"
essai "écrire dans un bloc qui n'est pas « discussion »" refus anon "" "$(ins $M1 $B1 ref-B Amina 'Mauvais bloc')"
essai "écrire dans une séquence non publiée" refus anon "" "$(ins $M2 $B3 ref-B Amina 'Séquence brouillon')"
essai "mélanger module et bloc (incohérence)" refus anon "" "$(ins $M2 $B2 ref-B Amina 'Incohérent')"
essai "lire la table echanges" refus anon "" "select * from public.echanges;"
essai "modifier un message" refus anon "" "update public.echanges set statut='valide';"
essai "supprimer un message" refus anon "" "delete from public.echanges;"
essai "message trop court" refus anon "" "$(ins $M1 $B2 ref-C Amina 'ok')"
essai "message trop long (801 caractères)" refus anon "" "insert into public.echanges(module_id,bloc_id,ref,prenom,message) values ('$M1','$B2','ref-C','Amina',repeat('a',801));"
essai "prénom trop long (41 caractères)" refus anon "" "insert into public.echanges(module_id,bloc_id,ref,prenom,message) values ('$M1','$B2','ref-C',repeat('a',41),'Message valable');"
essai "prénom vide" refus anon "" "$(ins $M1 $B2 ref-C '   ' 'Message valable')"
essai "référence vide" refus anon "" "$(ins $M1 $B2 '' Amina 'Message valable')"
echo "— Limite d'envois : 5 par heure et par référence"
for i in 2 3 4 5; do psql_ -c "set role anon; $(ins $M1 $B2 ref-A Amina "Message numéro $i")" >/dev/null 2>&1; done
essai "6e message de la même référence dans l'heure" refus anon "" "$(ins $M1 $B2 ref-A Amina 'Message numéro 6')"
essai "une autre référence peut encore écrire" ok anon "" "$(ins $M1 $B2 ref-D Léa 'Autre personne')"
echo "— Vue publique"
essai "le public lit la vue echanges_valides" ok anon "" "select count(*) from public.echanges_valides;"
essai "la vue n'expose pas la référence" refus anon "" "select ref from public.echanges_valides;"
echo "— Administrateur et autre compte connecté"
essai "l'administrateur lit tous les messages" ok authenticated $ADMIN "select count(*) from public.echanges;"
essai "l'administrateur valide un message" ok authenticated $ADMIN "update public.echanges set statut='valide', modere_le=now() where ref='ref-A' and message like '%Un geste%';"
essai "un autre compte connecté ne peut pas valider (0 ligne)" refus authenticated $AUTRE "with x as (update public.echanges set statut='valide' where ref='ref-D' returning 1) select count(*) from x;"
essai "un autre compte connecté ne peut pas supprimer (0 ligne)" refus authenticated $AUTRE "with x as (delete from public.echanges returning 1) select count(*) from x;"
visible="$(psql_ -c "set role anon; select count(*) from public.echanges_valides;" 2>&1 | tail -1)"
if [ "$visible" = 1 ]; then echo "✔ le public ne voit que le message validé par l'administrateur"; else echo "✘ messages visibles pour le public : $visible (attendu : 1)"; echecs=$((echecs+1)); fi
psql_ -c "update public.module set publie=false where id='$M1';" >/dev/null
visible="$(psql_ -c "set role anon; select count(*) from public.echanges_valides;" 2>&1 | tail -1)"
if [ "$visible" = 0 ]; then echo "✔ une séquence dépubliée masque ses messages validés"; else echo "✘ messages visibles après dépublication : $visible (attendu : 0)"; echecs=$((echecs+1)); fi

echo; if [ "$echecs" = 0 ]; then echo "Tous les essais ont le verdict attendu"; else echo "$echecs essai(s) en échec"; fi
exit $(( echecs > 0 ))
