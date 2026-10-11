#!/usr/bin/env bash
# Base PostgreSQL locale jetable, pour tester des règles de sécurité (RLS) sans toucher à Supabase.
#   ./postgres-local.sh demarrer     crée et démarre la base (port 55432, dossier /tmp/outils-pg)
#   ./postgres-local.sh arreter      l'arrête et supprime le dossier
# Prérequis : PostgreSQL installé (paquet postgresql). Variables : PG_DIR, PG_PORT.
set -euo pipefail
DIR="${PG_DIR:-/tmp/outils-pg}"
PORT="${PG_PORT:-55432}"
BIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)"
[ -n "$BIN" ] || { echo "PostgreSQL introuvable (installer le paquet postgresql)"; exit 1; }

# En tant que root, PostgreSQL refuse de démarrer : on passe par l'utilisateur « postgres ».
executer() { if [ "$(id -u)" = 0 ]; then su postgres -c "$*"; else bash -c "$*"; fi; }

case "${1:-}" in
  demarrer)
    mkdir -p "$DIR"; [ "$(id -u)" = 0 ] && chown postgres "$DIR"
    executer "$BIN/initdb -D $DIR/data -A trust >/dev/null"
    executer "$BIN/pg_ctl -D $DIR/data -o '-p $PORT -k $DIR' -l $DIR/log.txt -w start" >/dev/null
    echo "Base démarrée : psql -h $DIR -p $PORT -U postgres" ;;
  arreter)
    executer "$BIN/pg_ctl -D $DIR/data -m fast stop" >/dev/null 2>&1 || true
    rm -rf "$DIR"; echo "Base arrêtée et supprimée" ;;
  *) echo "Usage : $0 demarrer|arreter"; exit 2 ;;
esac
