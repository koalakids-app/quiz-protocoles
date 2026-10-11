'use strict';
/*
 * Teste le bloc « Échange » côté participant (formations.html) avec des données de test
 * intégrées : messages validés (dont un message piégé contenant du HTML), formulaire avec
 * ou sans lien personnel, envoi, limite d'envois et champ piège contre les robots.
 *
 *   python3 -m http.server 8765 &      # depuis la racine du dépôt
 *   node outils/tests/echanges.js
 */
const { URL_BASE, ok, bilan, ouvrir, page } = require('./_commun');

const BLOC = 'b-echange';
const donnees = {
  theme: [{ id: 't1', nom: 'Thème test', description: '', quiz_id: null }],
  module: [{ id: 'm1', theme_id: 't1', titre: 'Séquence test', accroche: 'x', publie: true, ordre: 0, trame: null }],
  bloc: [
    { id: 'b-texte', module_id: 'm1', type: 'texte', ordre: 0, contenu: { titre: 'Intro', paragraphes: ['Texte.'] } },
    { id: BLOC, module_id: 'm1', type: 'discussion', ordre: 1,
      contenu: { titre: 'Partagez un geste', consigne: "Quel **geste** vous aide à rassurer un enfant à l'arrivée ?" } },
  ],
  echanges_valides: [
    { bloc_id: BLOC, prenom: 'Amina', message: "Je me mets à hauteur de l'enfant.\nEt je parle doucement.", cree_le: '2026-10-05T08:00:00Z' },
    { bloc_id: BLOC, prenom: '<b>Léa</b>', message: '<img src=x onerror="window.__xss=1"> <script>window.__xss=2</script> **pas de gras**', cree_le: '2026-10-06T08:00:00Z' },
    { bloc_id: 'autre-bloc', prenom: 'Zoé', message: "Message d'un autre bloc", cree_le: '2026-10-06T09:00:00Z' },
  ],
};
const options = { erreursInsert: [{ table: 'echanges', champ: 'ref', valeur: 'limite', message: 'echanges_limite : trop de messages en peu de temps' }] };
const ADRESSE = `${URL_BASE}/formations.html?module=m1`;

(async () => {
  const { navigateur, contexte } = await ouvrir(donnees, options);
  const erreurs = [];

  console.log('— Sans lien personnel');
  let p = await page(contexte, erreurs);
  await p.goto(ADRESSE); await p.waitForTimeout(1200);
  ok((await p.locator('.m-disc-form').count()) === 0, 'pas de formulaire');
  ok((await p.locator('.m-disc-aide').first().innerText()).includes('lien personnel'), 'invitation à utiliser le lien personnel');
  ok((await p.locator('.m-disc-msg').count()) === 2, 'seuls les 2 messages validés de CE bloc sont listés');
  ok(await p.evaluate(() => window.__xss === undefined), 'HTML piégé non exécuté');
  ok((await p.locator('.m-disc-liste img, .m-disc-liste script, .m-disc-liste b').count()) === 0, 'aucun élément HTML créé (texte échappé)');
  ok((await p.locator('.m-disc-liste').innerText()).includes('**pas de gras**'), 'le markdown n’est pas interprété dans les messages');
  ok((await p.locator('.m-disc-consigne strong').count()) === 1, 'la consigne de l’animateur accepte le gras');

  console.log('— Avec un lien personnel');
  p = await page(contexte, erreurs);
  await p.goto(ADRESSE + '&ref=r1&prenom=Amina&creche=Toulon'); await p.waitForTimeout(1200);
  ok((await p.locator('.m-disc-form').count()) === 1, 'formulaire affiché');
  ok((await p.locator('.m-disc-form label').innerText()).includes('Amina'), 'le prénom du lien est affiché');
  const message = "Je m'assois près de la porte et je dis bonjour.";
  await p.locator('textarea[name=message]').fill(message);
  ok((await p.locator('.m-disc-compte').innerText()).startsWith(String(message.length)), 'compteur de caractères');
  await p.locator('button[type=submit]').click(); await p.waitForTimeout(400);
  const ecritures = await p.evaluate(() => window.__ecritures);
  ok(ecritures.length === 1 && ecritures[0].table === 'echanges', 'un seul dépôt dans la table echanges');
  const l = ecritures[0].lignes[0];
  ok(l.ref === 'r1' && l.prenom === 'Amina' && l.creche === 'Toulon' && l.module_id === 'm1' && l.bloc_id === BLOC && l.message === message,
     'référence, prénom, crèche, module, bloc et message corrects');
  ok(!('statut' in l) && !('modere_le' in l), 'le navigateur ne fixe ni statut ni modération');
  ok((await p.locator('.m-disc-fb').innerText()).includes('relecture'), 'confirmation : visible après relecture');
  ok((await p.locator('.m-disc-msg.attente').count()) === 1, 'le message apparaît « en attente de relecture »');
  ok((await p.locator('textarea[name=message]').inputValue()) === '', 'champ vidé après envoi');

  console.log('— Champ piège (robots)');
  await p.locator('input[name=site]').evaluate((e) => { e.value = 'http://spam'; });
  await p.locator('textarea[name=message]').fill('Message de robot');
  await p.locator('button[type=submit]').click(); await p.waitForTimeout(300);
  ok((await p.evaluate(() => window.__ecritures)).length === 1, 'aucun dépôt supplémentaire');

  console.log('— Limite d’envois');
  p = await page(contexte, erreurs);
  await p.goto(ADRESSE + '&ref=limite&prenom=Max'); await p.waitForTimeout(1000);
  await p.locator('textarea[name=message]').fill('Un sixième message');
  await p.locator('button[type=submit]').click(); await p.waitForTimeout(400);
  ok((await p.locator('.m-disc-fb').innerText()).includes('plusieurs messages'), 'message clair pour la personne');
  ok((await p.locator('.m-disc-msg.attente').count()) === 0, 'aucun faux message « en attente »');
  ok(!(await p.locator('button[type=submit]').isDisabled()), 'le bouton se réactive après une erreur');

  ok(erreurs.length === 0, 'aucune erreur JavaScript' + (erreurs.length ? ' : ' + erreurs.join(' | ') : ''));
  await navigateur.close();
  bilan();
})();
