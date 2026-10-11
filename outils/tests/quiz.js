'use strict';
/*
 * Teste un quiz de validation dans index.html : démarrage, réponse juste à chaque question,
 * écran de résultats et enregistrement dans la table resultats.
 *
 *   python3 outils/lire-sql.py quiz sql/partie-29-quiz-validation-module1.sql quiz.json
 *   node outils/tests/quiz.js quiz.json
 */
const { URL_BASE, ok, bilan, ouvrir, page, lireJson } = require('./_commun');

(async () => {
  const [, , fichier] = process.argv;
  if (!fichier) { console.log('Usage : node quiz.js quiz.json'); process.exit(2); }
  const donnees = lireJson(fichier);
  const total = donnees.questions.length;
  const { navigateur, contexte } = await ouvrir(donnees);
  const erreurs = [];
  const p = await page(contexte, erreurs, erreurs);
  await p.goto(`${URL_BASE}/index.html?quiz=${donnees.quiz[0].id}`);
  await p.waitForTimeout(1500);
  ok((await p.locator('.start-screen').count()) === 1, 'l’écran d’accueil du quiz s’affiche');

  await p.fill('#inp-prenom', 'Test');
  await p.fill('#inp-nom', 'Quiz');
  await p.selectOption('#inp-statut', { index: 1 });
  await p.selectOption('#inp-creche', { index: 1 });
  await p.evaluate(() => startQuiz());
  await p.waitForTimeout(300);

  const corrections = [];
  for (let i = 0; i < total; i++) {
    const reponses = await p.evaluate(() => questions[current].reponses);
    for (const r of reponses) await p.evaluate((x) => choose(x), r);
    await p.evaluate(() => nextAction());                      // valider
    corrections.push((await p.locator('.feedback').innerText()).replace(/\n/g, ' '));
    await p.evaluate(() => nextAction());                      // suivant, ou résultats
    await p.waitForTimeout(150);
  }
  ok(corrections.length === total && corrections.every((c) => c.includes('Bonne réponse')),
     `les ${total} questions se corrigent en « Bonne réponse »`);
  const resultats = (await p.locator('.results').innerText()).replace(/\n+/g, ' | ');
  ok(resultats.includes(String(total)) && resultats.includes('100'), 'résultat : 100 % — ' + resultats.slice(0, 60));
  const ecrit = await p.evaluate(() => window.__ecritures.filter((e) => e.table === 'resultats'));
  ok(ecrit.length === 1 && ecrit[0].lignes[0].score === total && ecrit[0].lignes[0].total === total,
     'le résultat est enregistré dans resultats (score ' + total + '/' + total + ')');
  ok(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  await navigateur.close();
  bilan();
})();
