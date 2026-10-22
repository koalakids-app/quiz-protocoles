'use strict';
/*
 * Teste l'onglet « Parcours quiz » de admin.html : planning, quiz introuvables ou en brouillon,
 * publication en une fois, envoi de la semaine (un mail par quiz, mêmes personnes) et suivi.
 *
 *   node outils/tests/admin-parcours.js
 */
const { URL_BASE, ok, bilan, ouvrir, page } = require('./_commun');

const quiz = [];
for (let t = 1; t <= 8; t++) quiz.push({ id: 'p' + t, titre: `Thème ${t} · Projet`, bloc: 'pedagogie', ordre: t, publie: t === 4 || t === 1, description: '', cree_le: '2026-10-01' });
// Protocoles : thèmes 9 à 16 ; le thème 16 est absent pour tester l'avertissement.
for (let t = 9; t <= 15; t++) quiz.push({ id: 'r' + t, titre: `Thème ${t} · Protocole`, bloc: 'protocoles', ordre: t - 8, publie: t === 9 || t === 10, description: '', cree_le: '2026-10-01' });

const donnees = {
  quiz,
  questions: [],
  resultats: [
    { quiz_id: 'p1', prenom: 'Amina', nom: 'Diallo', creche: 'Toulon', passe_le: '2026-10-27' },
    { quiz_id: 'r9', prenom: 'Amina', nom: 'Diallo', creche: 'Toulon', passe_le: '2026-10-28' },
    { quiz_id: 'p4', prenom: 'amina', nom: 'diallo ', creche: 'Toulon', passe_le: '2026-11-17' },
    { quiz_id: 'p1', prenom: 'Max', nom: 'Roux', creche: 'Hyères', passe_le: '2026-10-27' },
  ],
};
const fonctions = {
  'liste-destinataires': {
    creches: [{ name: 'Toulon' }],
    destinataires: [
      { ref: 'a', civilite: 'Mme', prenom: 'Amina', nom: 'Diallo', email: 'amina@ex.fr', creche: 'Toulon', statut: 'Éducatrice' },
      { ref: 'b', civilite: 'M.', prenom: 'Max', nom: 'Roux', email: 'max@ex.fr', creche: 'Toulon', statut: 'Éducateur' },
    ],
    envois: [],
  },
};

(async () => {
  const { navigateur, contexte } = await ouvrir(donnees, { session: true, fonctions }, { width: 1000, height: 900 });
  const erreurs = [], dialogues = [];
  const p = await page(contexte, erreurs, dialogues);
  await p.goto(`${URL_BASE}/admin.html`); await p.waitForTimeout(1500);

  ok((await p.locator('.tabs').innerText()).includes('Parcours quiz'), 'onglet « Parcours quiz » présent');
  await p.evaluate(() => goTab('parcours')); await p.waitForTimeout(600);
  const texte = await p.locator('#app').innerText();
  ok(texte.includes('Semaine 8') && texte.includes('Semaine 9') && texte.includes('26 – 30 oct.'), 'les 8 semaines et le rattrapage sont affichés');
  ok(texte.includes('1 quiz du planning sont introuvables'), 'le thème 16 manquant est signalé');
  ok(texte.includes('11 quiz du parcours sont encore en brouillon'), 'brouillons comptés : 15 quiz trouvés dont 4 publiés');

  // Semaine 2 = thèmes 2 et 13 : deux brouillons, envoi bloqué ; semaine 1 = thèmes 1 et 9 : prêt.
  const bouton = n => p.locator('.question-card', { hasText: `Semaine ${n} ` }).getByRole('button', { name: /Envoyer la semaine/ });
  ok(await bouton(2).isDisabled(), 'semaine 2 (brouillons) : envoi désactivé');
  ok(await bouton(5).isDisabled(), 'semaine 5 (quiz thème 16 absent) : envoi désactivé');
  ok(await bouton(1).isEnabled(), 'semaine 1 (deux quiz publiés) : envoi possible');

  // Suivi : « amina diallo » (casse, espace) est la même personne ; S1 complète, S4 à moitié.
  const ligneAmina = p.locator('tr', { hasText: 'Amina Diallo' });
  ok((await p.locator('tr', { hasText: 'Diallo' }).count()) === 1, 'une seule ligne pour Amina malgré la casse et les espaces');
  const cases = await ligneAmina.locator('td').allInnerTexts();
  ok(cases[1] === '✔' && cases[4] === '½' && cases[2] === '·', 'suivi : S1 ✔, S4 ½, S2 vide');

  // Envoi de la semaine 1.
  await bouton(1).click(); await p.waitForTimeout(600);
  const envoi = await p.locator('#app').innerText();
  ok(envoi.includes('Thème 1 · Projet') && envoi.includes('Thème 9 · Protocole') && envoi.includes('2 mails par personne'), 'écran d\'envoi : les deux quiz de la semaine');
  ok((await p.locator('#env-objet').inputValue()).includes('semaine 1'), 'objet prérempli avec la semaine');
  await p.locator('#env-all').check(); await p.waitForTimeout(200);
  await p.getByRole('button', { name: /Envoyer à 2 personnes/ }).click(); await p.waitForTimeout(800);
  const appels = await p.evaluate(() => window.__appels.filter(a => a.nom === 'envoyer-quiz'));
  ok(appels.length === 2 && appels[0].corps.item_id === 'p1' && appels[1].corps.item_id === 'r9', 'deux envois : thème 1 puis thème 9');
  ok(appels.every(a => a.corps.destinataires.length === 2), 'mêmes deux personnes pour chaque quiz');
  ok(appels[0].corps.objet.includes('Thème 1') && appels[1].corps.objet.includes('Thème 9') && !appels.some(a => /\{quiz\}/.test(a.corps.objet + a.corps.message)), '{quiz} remplacé par le titre dans l\'objet et le message');
  ok(appels.every(a => a.corps.message.includes('{lien}')), '{lien} conservé pour le serveur');
  ok((await p.locator('#app').innerText()).includes('4 envoyé'), 'récapitulatif : 4 mails envoyés');
  await p.getByRole('button', { name: 'Terminer' }).click(); await p.waitForTimeout(600);
  ok((await p.locator('h2').first().innerText()).includes('Parcours quiz'), 'Terminer ramène au parcours');

  // Publication en une fois.
  await p.getByRole('button', { name: /Publier les 11 quiz/ }).click(); await p.waitForTimeout(600);
  const maj = await p.evaluate(() => window.__ecritures.filter(e => e.op === 'update' && e.table === 'quiz').slice(-1)[0]);
  ok(maj && maj.patch.publie === true && maj.ids.length === 11, 'publication : les 11 brouillons du parcours passent en publié');
  ok(!(await p.locator('#app').innerText()).includes('encore en brouillon'), 'plus de brouillon affiché');

  ok(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  await navigateur.close();
  bilan();
})();
