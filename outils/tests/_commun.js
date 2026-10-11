'use strict';
/*
 * Outils communs aux tests de pages. Aucune dépendance autre que Playwright.
 *
 * Variables d'environnement (valeurs par défaut de l'environnement Claude Code) :
 *   URL_BASE            http://localhost:8765   serveur local : python3 -m http.server 8765
 *   PLAYWRIGHT_MODULE   /opt/node-tools/node_modules/playwright
 *   CHROMIUM            /opt/pw-browsers/chromium
 */
const fs = require('fs');
const path = require('path');
const { scriptFauxSupabase } = require('../faux-supabase');

const URL_BASE = process.env.URL_BASE || 'http://localhost:8765';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/node-tools/node_modules/playwright');

let echecs = 0;
function ok(condition, texte) {
  if (!condition) echecs++;
  console.log((condition ? '✔ ' : '✘ ') + texte);
  return condition;
}
function bilan() {
  console.log(echecs ? `\n${echecs} vérification(s) en échec` : '\nToutes les vérifications passent');
  process.exitCode = echecs ? 1 : 0;
}

/* Ouvre un navigateur dont les pages n'atteignent que le serveur local : tout appel externe
   est bloqué, et supabase-js est remplacé par le faux client alimenté par `donnees`. */
async function ouvrir(donnees, options = {}, viewport = { width: 430, height: 900 }) {
  const navigateur = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium' });
  const contexte = await navigateur.newContext({ viewport });
  // Playwright applique les routes en commençant par la dernière déclarée.
  await contexte.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  await contexte.route('**/supabase.min.js', (r) =>
    r.fulfill({ contentType: 'application/javascript', body: scriptFauxSupabase(donnees, options) }));
  return { navigateur, contexte };
}

/* Nouvelle page qui collecte les erreurs JavaScript et refuse les boîtes de dialogue. */
async function page(contexte, erreurs, dialogues = []) {
  const p = await contexte.newPage();
  p.on('pageerror', (e) => erreurs.push(e.message));
  p.on('dialog', (d) => { dialogues.push(d.type() + ': ' + d.message()); d.accept(); });
  return p;
}

/* Fait défiler la page : les images sont en chargement différé (loading="lazy"). */
async function defiler(p, pas = 500, max = 40000) {
  for (let y = 0; y < max; y += pas) {
    await p.evaluate((v) => window.scrollTo(0, v), y);
    await p.waitForTimeout(80);
  }
  await p.waitForTimeout(800);
  await p.evaluate(() => window.scrollTo(0, 0));
}

function lireJson(chemin) {
  return JSON.parse(fs.readFileSync(path.resolve(chemin), 'utf8'));
}

module.exports = { URL_BASE, ok, bilan, ouvrir, page, defiler, lireJson };
