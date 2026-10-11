'use strict';
/*
 * Teste une séquence (module) dans formations.html avec le faux client Supabase.
 *
 *   python3 outils/lire-sql.py sequence sql/partie-28-....sql donnees.json
 *   python3 -m http.server 8765 &          # depuis la racine du dépôt
 *   node outils/tests/sequence.js donnees.json [module_id] [paramètres d'adresse]
 *
 * Vérifie : chargement sans erreur JavaScript, pas de défilement horizontal, images
 * chargées, correction de toutes les questions (en répondant juste), ouverture des
 * mises en situation, présence ou absence du formulaire d'échange selon le lien.
 * Exemple avec un lien personnel : node outils/tests/sequence.js donnees.json m-test "ref=r1&prenom=Amina"
 */
const { URL_BASE, ok, bilan, ouvrir, page, defiler, lireJson } = require('./_commun');

(async () => {
  const [, , fichier, moduleId = 'm-test', parametres = ''] = process.argv;
  if (!fichier) { console.log('Usage : node sequence.js donnees.json [module_id] [paramètres]'); process.exit(2); }
  const donnees = lireJson(fichier);
  const { navigateur, contexte } = await ouvrir(donnees);
  const erreurs = [];
  const p = await page(contexte, erreurs);
  await p.goto(`${URL_BASE}/formations.html?module=${moduleId}${parametres ? '&' + parametres : ''}`);
  await p.waitForTimeout(1500);

  console.log('En-tête :', (await p.locator('.app-header').innerText()).replace(/\n+/g, ' | '));
  const n = await p.evaluate(() => ({
    questions: document.querySelectorAll('.m-q').length,
    dialogues: document.querySelectorAll('.m-dlg').length,
    reflexions: document.querySelectorAll('.m-pause').length,
    images: document.querySelectorAll('.m-fig').length,
    echanges: document.querySelectorAll('.m-disc').length,
    largeur: document.documentElement.scrollWidth,
  }));
  console.log('Contenu :', JSON.stringify(n));
  ok((await p.locator('h2').first().innerText()).length > 0, 'la séquence s’affiche');
  ok(n.largeur <= 430, 'pas de défilement horizontal (' + n.largeur + ' px)');

  await defiler(p);
  const cassees = await p.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
  ok(cassees.length === 0, 'toutes les images se chargent' + (cassees.length ? ' — cassées : ' + cassees.join(', ') : ''));

  // Réponses justes à toutes les questions (les bonnes réponses sont lisibles dans le DOM).
  const corrections = await p.evaluate(() => {
    const sorties = [];
    document.querySelectorAll('.m-q').forEach((q) => {
      q.querySelectorAll('.m-q-opt').forEach((o) => { if (o.dataset.juste === '1') qChoisir(o); });
      qValider(q.querySelector('.m-q-btn'));
      sorties.push(q.querySelector('.m-q-fb').textContent);
    });
    document.querySelectorAll('.m-dlg button.btn').forEach((b) => dlgReveler(b));
    return sorties;
  });
  ok(corrections.length === n.questions && corrections.every((c) => c === 'Bonne réponse.'),
     `les ${n.questions} questions se corrigent en « Bonne réponse. »`);
  ok(await p.evaluate(() => [...document.querySelectorAll('.m-dlg-rep')].every((r) => !r.hidden)),
     'les réponses possibles des mises en situation s’ouvrent');

  if (n.echanges) {
    const avecLien = /ref=/.test(parametres) && /prenom=/.test(parametres);
    ok((await p.locator('.m-disc-form').count()) === (avecLien ? n.echanges : 0),
       avecLien ? 'lien personnel : formulaire d’échange affiché' : 'sans lien personnel : pas de formulaire d’échange');
  }
  ok(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  await navigateur.close();
  bilan();
})();
