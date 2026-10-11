'use strict';
/*
 * Teste l'onglet « Échanges » de admin.html (relecture des messages) avec une session
 * simulée et des données de test intégrées : liste et filtres, validation, refus, retrait,
 * suppression, compte non autorisé, éditeur et aperçu du bloc « discussion ».
 *
 *   node outils/tests/admin-echanges.js
 */
const { URL_BASE, ok, bilan, ouvrir, page } = require('./_commun');

const donnees = {
  module: [{ id: 'm1', titre: 'Module 1 – 1/3 · Apport (e-learning)' }, { id: 'm2', titre: 'Module 1 – 3/3 · Test (e-learning)' }],
  bloc: [
    { id: 'b1', type: 'discussion', contenu: { consigne: "Quel geste vous aide à rassurer un enfant à son arrivée ?" } },
    { id: 'b2', type: 'discussion', contenu: { consigne: 'Quelle pratique commune choisir ?' } },
  ],
  echanges: [
    { id: 'e1', module_id: 'm1', bloc_id: 'b1', ref: 'ref-1', prenom: 'Amina', creche: 'Toulon', message: "Je me mets à hauteur de l'enfant.\nEt je parle doucement.", statut: 'en_attente', cree_le: '2026-10-11T08:00:00Z' },
    { id: 'e2', module_id: 'm1', bloc_id: 'b1', ref: 'ref-2', prenom: '<b>Léa</b>', creche: null, message: '<img src=x onerror="window.__xss=1"> piégé', statut: 'en_attente', cree_le: '2026-10-11T09:00:00Z' },
    { id: 'e3', module_id: 'm2', bloc_id: 'b2', ref: 'ref-3', prenom: 'Max', creche: 'Hyères', message: "Un adulte installé sur un jeu dès l'arrivée.", statut: 'valide', cree_le: '2026-10-10T08:00:00Z' },
    { id: 'e4', module_id: 'm2', bloc_id: 'b2', ref: 'ref-4', prenom: 'Zoé', creche: null, message: 'Message refusé.', statut: 'refuse', cree_le: '2026-10-09T08:00:00Z' },
  ],
};

(async () => {
  const { navigateur, contexte } = await ouvrir(donnees, { session: true }, { width: 1000, height: 900 });
  const erreurs = [], dialogues = [];
  const p = await page(contexte, erreurs, dialogues);
  await p.goto(`${URL_BASE}/admin.html`); await p.waitForTimeout(1500);

  ok((await p.locator('.tabs').innerText()).includes('Échanges'), 'onglet « Échanges » présent');
  await p.evaluate(() => goTab('echanges')); await p.waitForTimeout(500);
  ok((await p.locator('h2').first().innerText()).includes('Échanges entre participants'), 'vue Échanges affichée');
  ok((await p.locator('.question-card').count()) === 2, 'filtre par défaut « à relire » : 2 messages');
  ok((await p.evaluate(() => window.__xss === undefined)) && (await p.locator('.question-card img, .question-card b').count()) === 0, 'message piégé affiché en texte, non exécuté');
  const filtre = await p.locator('select').first().innerText();
  ok(filtre.includes('À relire (2)') && filtre.includes('Validés (1)') && filtre.includes('Refusés (1)'), 'compteurs par statut dans le filtre');
  ok((await p.locator('.question-card').first().innerText()).includes('Quel geste vous aide'), 'la consigne du bloc est rappelée');

  const derniere = () => p.evaluate(() => window.__ecritures.slice(-1)[0]);
  await p.locator('.question-card').first().getByRole('button', { name: 'Valider' }).click(); await p.waitForTimeout(300);
  let e = await derniere();
  ok(e.op === 'update' && e.patch.statut === 'valide' && !!e.patch.modere_le && e.ids[0] === 'e2', 'Valider : statut=valide + date de modération sur le bon message (le plus récent est en tête)');
  ok((await p.locator('.question-card').count()) === 1, 'le message validé quitte la liste « à relire »');

  await p.locator('.question-card').first().getByRole('button', { name: 'Refuser' }).click(); await p.waitForTimeout(300);
  e = await derniere();
  ok(e.patch.statut === 'refuse' && e.ids[0] === 'e1', 'Refuser : statut=refuse');

  await p.locator('select').first().selectOption('valide'); await p.waitForTimeout(200);
  ok((await p.locator('.question-card').count()) === 2, 'filtre « Validés » : 2 messages');
  await p.locator('.question-card').first().getByRole('button', { name: 'Retirer' }).click(); await p.waitForTimeout(300);
  ok((await derniere()).patch.statut === 'refuse', 'Retirer un message validé : il repasse en refusé');

  await p.locator('select').first().selectOption(''); await p.waitForTimeout(200);
  const avant = await p.locator('.question-card').count();
  await p.locator('.question-card').last().getByRole('button', { name: 'Supprimer' }).click(); await p.waitForTimeout(300);
  ok((await derniere()).op === 'delete' && dialogues.slice(-1)[0].startsWith('confirm'), 'Supprimer : confirmation puis suppression');
  ok((await p.locator('.question-card').count()) === avant - 1, 'le message supprimé disparaît');

  await p.evaluate(() => { window.__refuse = true; });
  await p.locator('select').first().selectOption('refuse'); await p.waitForTimeout(200);
  await p.locator('.question-card').first().getByRole('button', { name: 'Valider' }).click(); await p.waitForTimeout(300);
  ok(dialogues.slice(-1)[0].includes('pas autorisé'), 'compte non autorisé : message clair, pas de faux succès');

  const r = await p.evaluate(() => {
    const b = { type: 'discussion', contenu: blocVide('discussion') };
    b.contenu.consigne = 'Quel **geste** ?'; curBlocs = [b];
    return { editeur: editorFor(b, 0), apercu: blocHTML(b), type: !!TYPES.discussion };
  });
  ok(r.type, 'type « discussion » listé dans les types de blocs');
  ok(r.editeur.includes('Consigne') && r.editeur.includes('Rappel') && r.editeur.includes('Étiquette'), 'éditeur : étiquette, titre, consigne, rappel');
  ok(r.apercu.includes('m-disc') && r.apercu.includes('<strong>geste</strong>') && r.apercu.includes('disabled'), 'aperçu : consigne en gras, zone de saisie désactivée');

  ok(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  await navigateur.close();
  bilan();
})();
