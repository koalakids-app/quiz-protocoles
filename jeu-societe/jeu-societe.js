/* Jeu de société « Le Sentier du Koala » : plateau, dé, cartes, bilan.
 *
 * Deux façons de jouer, avec le même moteur :
 *  - « un seul appareil » : une tablette passe de main en main ;
 *  - « chacun son téléphone » : l'appareil de l'animateur fait tourner la partie (il est l'arbitre)
 *    et diffuse l'état du jeu par Supabase Realtime (Broadcast, rien n'est écrit en base) ; chaque
 *    téléphone affiche le jeu en direct et envoie ses actions (dé, réponse) quand c'est son tour.
 *
 * Tout l'affichage est calculé à partir de l'objet `etat`. Les cartes sont dans jeu-societe-cartes.js.
 * Configuration du jeu en ligne : window.KK_JEU_SUPABASE = { url, key } (sinon le mode en ligne est masqué). */
(function () {
  'use strict';

  var CARTES = window.KK_JEU_CARTES || [];
  var CHANCE = window.KK_JEU_CHANCE || [];
  var CFG = window.KK_JEU_SUPABASE || null;
  var LIB_QR = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  var LIB_SUPABASE = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  var MODE_TEST = /[?&]test=bc/.test(location.search);      // canal local entre onglets, pour les essais
  var EN_LIGNE_DISPO = !!CFG || MODE_TEST;

  var THEMES = {
    dev:    { nom: 'Développement', ico: '🧠' },
    ped:    { nom: 'Pédagogie',     ico: '🎨' },
    pro:    { nom: 'Protocoles',    ico: '🧼' },
    par:    { nom: 'Familles',      ico: '👨‍👩‍👧' },
    partage:{ nom: 'Partage',       ico: '💬' },
    chance: { nom: 'Chance',        ico: '🍀' }
  };
  var THEMES_QUIZ = ['dev', 'ped', 'pro', 'par'];

  var PUBLICS = {
    equipe:  { nom: 'Entre professionnel·les', ico: '🧑‍🏫', desc: "Formation d'équipe, réunion, temps d'analyse de pratiques", tags: ['e', 'x'] },
    parents: { nom: 'Avec des parents',        ico: '👨‍👩‍👧', desc: "Atelier ou café des parents", tags: ['p', 'x'] },
    mixte:   { nom: 'Équipe et parents',       ico: '🤝', desc: "Tous les sujets, pour échanger ensemble", tags: ['e', 'p', 'x'] }
  };

  var PIONS = ['🐨', '🦉', '🦊', '🐘', '🦒', '🐼', '🦘', '🐧'];
  var MAX_LOCAL = 6, MAX_LIGNE = 8;
  var COLONNES = 6;
  var FIN = 41;                       // case 0 = départ, case 41 = arrivée
  var MOTIF = ['dev', 'pro', 'ped', 'par', 'chance', 'pro', 'dev', 'partage', 'ped', 'par'];
  var PLAN = [];
  PLAN[0] = 'depart';
  for (var i = 1; i < FIN; i++) PLAN[i] = MOTIF[(i - 1) % MOTIF.length];
  PLAN[FIN] = 'arrivee';

  var CLE = 'kk_jeu_partie';          // animateur ou appareil unique (localStorage)
  var CLE_CLIENT = 'kk_jeu_client';   // joueur sur son téléphone (sessionStorage)
  var DES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
  var LETTRES_CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

  var app = document.getElementById('app');
  var voile = document.getElementById('voile');
  var modale = document.getElementById('modale');
  var btnFin = document.getElementById('btnFin');

  var etat = null;                    // partie en cours (identique chez tous les joueurs)
  var hote = true;                    // faux pour un joueur qui a rejoint une partie en ligne
  var canal = null;                   // transport en ligne
  var monId = null;
  var attente = null;                 // action attendue par l'arbitre : { types, res }
  var enBoucle = false;
  var config = { mode: 'local', public: 'equipe', nb: 3, noms: [], nom: '', code: '', erreur: '' };
  var qrCache = { lien: null, node: null };
  var pistes = null, reglesOuvertes = false, derniereCarte = '', dernierToast = 0, timerDe = null, focusAvant = null;

  /* ───────── Outils ───────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pause(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function melange(t) {
    var a = t.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; }
    return a;
  }
  function essayer(fn) { try { return fn(); } catch (e) { return null; } }
  function enLigne() { return !!(etat && etat.enligne); }
  function idxMoi() { return etat ? etat.joueurs.findIndex(function (j) { return j.id === monId; }) : -1; }
  function peutAgir() { return !enLigne() || idxMoi() === etat.tour; }
  function estAnimateur() { return !enLigne() || hote; }
  function nomJoueur(j) { return j ? j.nom : ''; }

  function genererId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  monId = essayer(function () { var v = sessionStorage.getItem('kk_jeu_id'); if (!v) { v = genererId(); sessionStorage.setItem('kk_jeu_id', v); } return v; }) || genererId();

  function sauver() {
    if (!etat || (enLigne() && !hote)) return;
    essayer(function () { localStorage.setItem(CLE, JSON.stringify(etat)); });
  }
  function chargerSauvegarde() { return essayer(function () { var s = localStorage.getItem(CLE); return s ? JSON.parse(s) : null; }); }
  function oublier() { essayer(function () { localStorage.removeItem(CLE); sessionStorage.removeItem(CLE_CLIENT); }); }
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2400);
  }
  function garderEveille() {
    essayer(function () { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(function () {}); });
  }

  /* ───────── Transport en ligne ───────── */
  function chargerLib() {
    return new Promise(function (ok, ko) {
      if (window.supabase && window.supabase.createClient) return ok();
      var s = document.createElement('script');
      s.src = LIB_SUPABASE; s.onload = function () { ok(); }; s.onerror = function () { ko(new Error('Bibliothèque en ligne indisponible')); };
      document.head.appendChild(s);
    });
  }
  async function ouvrirCanal(code, onMsg) {
    var EVENTS = ['etat', 'action', 'join', 'refus'];
    if (MODE_TEST) {
      var bc = new BroadcastChannel('kkjeu-' + code);
      bc.onmessage = function (m) { onMsg(m.data.ev, m.data.p); };
      return { send: function (ev, p) { bc.postMessage({ ev: ev, p: JSON.parse(JSON.stringify(p)) }); }, fermer: function () { bc.close(); } };
    }
    if (!CFG) throw new Error("Le jeu en ligne n'est pas configuré sur cette page.");
    await chargerLib();
    var cl = window.supabase.createClient(CFG.url, CFG.key, { realtime: { params: { eventsPerSecond: 20 } } });
    var ch = cl.channel('kkjeu-' + code, { config: { broadcast: { self: false } } });
    EVENTS.forEach(function (ev) { ch.on('broadcast', { event: ev }, function (m) { onMsg(ev, m.payload); }); });
    await new Promise(function (ok, ko) {
      var t = setTimeout(function () { ko(new Error('Connexion impossible')); }, 10000);
      ch.subscribe(function (st) {
        if (st === 'SUBSCRIBED') { clearTimeout(t); ok(); }
        else if (st === 'CHANNEL_ERROR' || st === 'TIMED_OUT') { clearTimeout(t); ko(new Error('Connexion impossible')); }
      });
    });
    return {
      send: function (ev, p) { ch.send({ type: 'broadcast', event: ev, payload: p }); },
      fermer: function () { essayer(function () { cl.removeChannel(ch); }); }
    };
  }
  function fermerCanal() { if (canal) { canal.fermer(); canal = null; } }

  function surMessage(ev, p) {
    if (!p) return;
    if (hote) {
      if (ev === 'join') accueillir(p);
      else if (ev === 'action' && etat && p.a) {
        var i = etat.joueurs.findIndex(function (j) { return j.id === p.id; });
        if (i >= 0) recevoir(p.a, i);
      }
    } else if (ev === 'etat') {
      if (p.code && config.code && p.code !== config.code) return;
      if (!etat || (p.rev || 0) >= (etat.rev || 0)) { etat = p; rendre(); }
    } else if (ev === 'refus' && p.id === monId) {
      quitterEnLigne(p.raison || 'Partie inaccessible.');
    }
  }
  function diffuser() { if (canal && hote && etat) canal.send('etat', etat); }
  function envoyerJoin() { if (canal && !hote) canal.send('join', { id: monId, nom: config.nom }); }

  /* ───────── Mise à jour de l'état (arbitre) ───────── */
  function maj() {
    etat.rev = (etat.rev || 0) + 1;
    sauver();
    diffuser();
    rendre();
  }
  function ajouterToast(t) {
    etat.toast = { n: ((etat.toast && etat.toast.n) || 0) + 1, t: t };
    maj();
  }
  function nouvelEtat(extra) {
    var e = { rev: 0, phase: 'jeu', public: config.public, joueurs: [], tour: 0, nbTours: 0, vus: {}, stats: {}, rates: [], premier: -1, fini: false,
      de: null, carte: null, toast: null, enligne: false, code: null };
    THEMES_QUIZ.concat(['partage']).forEach(function (k) { e.stats[k] = { ok: 0, total: 0 }; });
    Object.keys(extra || {}).forEach(function (k) { e[k] = extra[k]; });
    return e;
  }

  /* ───────── Actions ───────── */
  function att(types) {
    if (etat.fini) return Promise.resolve(null);
    return new Promise(function (res) { attente = { types: types, res: res }; });
  }
  function recevoir(a, idx) {
    if (!a || !etat) return;
    if (a.type === 'fin' || a.type === 'passer') {
      if (enLigne() && idx !== 0) return;                  // réservé à l'animateur
      if (a.type === 'fin') { terminerPartie(); return; }
      if (attente) { var r0 = attente; attente = null; r0.res({ passer: true }); }
      return;
    }
    if (!attente || attente.types.indexOf(a.type) < 0) return;
    if (enLigne() && idx !== etat.tour) return;            // seul le joueur dont c'est le tour agit
    var r = attente; attente = null; r.res(a);
  }
  function agir(a) {
    if (enLigne() && !hote) { if (canal) canal.send('action', { id: monId, a: a }); return; }
    recevoir(a, enLigne() ? idxMoi() : -1);
  }

  /* ───────── Déroulement d'une partie (arbitre) ───────── */
  async function boucle() {
    if (enBoucle) return;
    enBoucle = true;
    try {
      while (!etat.fini) {
        try { await tourDeJeu(); }
        catch (e) { if (window.console) console.error(e); etat.carte = null; suivant(); }
      }
    } finally { enBoucle = false; }
  }
  async function tourDeJeu() {
    var j = etat.joueurs[etat.tour];
    etat.de = null; etat.carte = null;
    maj();
    if (j.passe) {
      j.passe = false;
      ajouterToast(j.nom + ' passe son tour');
      await pause(1100);
      suivant();
      return;
    }
    var a = await att(['lancer']);
    if (etat.fini) return;
    if (!a || a.passer) { suivant(); return; }
    var valeur = 1 + Math.floor(Math.random() * 6);
    etat.origine = j.pos;                                  // case de départ du tour : on y revient après une mauvaise réponse
    etat.de = { valeur: valeur, roule: true, n: ((etat.de && etat.de.n) || 0) + 1 };
    maj();
    await pause(750);
    etat.de.roule = false;
    maj();
    await deplacer(j, valeur);
    if (etat.fini) return;
    await resoudre(j);
  }
  async function deplacer(j, delta) {
    var sens = delta >= 0 ? 1 : -1;
    for (var n = Math.abs(delta); n > 0; n--) {
      var suivante = j.pos + sens;
      if (suivante < 0 || suivante > FIN) break;
      j.pos = suivante;
      maj();
      await pause(260);
    }
  }
  async function resoudre(j) {
    if (j.pos >= FIN) { arrivee(j); return; }
    var type = PLAN[j.pos], rejoue = false, ok;
    if (type === 'chance') rejoue = await carteChance(j);
    else if (type === 'partage') await carteDiscussion(j);
    else if (type !== 'depart') {
      ok = await carteQuestion(j, type);
      if (etat.fini) return;
      if (ok) {
        j.feuilles++;
        if (j.pos < FIN) { ajouterToast('Bonne réponse : +1 🌿 et 1 case de bonus'); await deplacer(j, 1); }
      } else if (ok === false && etat.origine < j.pos) {
        ajouterToast('Mauvaise réponse : retour ' + libelleCase(etat.origine));
        await pause(600);
        await deplacer(j, etat.origine - j.pos);
      }
    }
    if (etat.fini) return;
    if (j.pos >= FIN) { arrivee(j); return; }
    if (rejoue) { etat.de = null; etat.carte = null; ajouterToast(j.nom + ' rejoue !'); await pause(500); return; }
    suivant();
  }
  function libelleCase(n) { return n === 0 ? 'au départ' : 'à la case ' + n; }
  function suivant() {
    etat.nbTours++;
    etat.tour = (etat.tour + 1) % etat.joueurs.length;
    etat.de = null; etat.carte = null;
    maj();
  }
  function arrivee(j) {
    etat.premier = etat.joueurs.indexOf(j);
    terminerPartie();
  }
  function terminerPartie() {
    etat.fini = true;
    etat.phase = 'bilan';
    etat.carte = null;
    var r = attente; attente = null;
    if (r) r.res(null);
    maj();
  }

  function piocher(cat) {
    var tags = PUBLICS[etat.public].tags;
    var pool = CARTES.filter(function (c) { return c.cat === cat && tags.indexOf(c.pub) >= 0; });
    var vus = etat.vus[cat] || [];
    var restantes = pool.filter(function (c) { return vus.indexOf(c.id) < 0; });
    if (!restantes.length) { vus = []; restantes = pool; }
    if (!restantes.length) return null;
    var c = restantes[Math.floor(Math.random() * restantes.length)];
    vus.push(c.id);
    etat.vus[cat] = vus;
    return c;
  }

  async function carteQuestion(j, cat) {
    var c = piocher(cat);
    if (!c) return null;
    var ordre = melange([0, 1, 2]);
    etat.carte = { kind: 'q', cat: cat, id: c.id, ordre: ordre, rep: null };
    maj();
    var a = await att(['repondre']);
    if (etat.fini || !a || a.passer || !(a.i >= 0 && a.i <= 2)) { etat.carte = null; return null; }
    etat.carte.rep = a.i;
    var bon = ordre[a.i] === 0;
    if (!bon && etat.origine < j.pos) etat.carte.retour = etat.origine;
    var s = etat.stats[cat] || (etat.stats[cat] = { ok: 0, total: 0 });
    s.total++;
    if (bon) s.ok++; else if (etat.rates.indexOf(c.id) < 0) etat.rates.push(c.id);
    maj();
    await att(['continuer']);
    etat.carte = null;
    return bon;
  }
  async function carteDiscussion(j) {
    var c = piocher('partage');
    if (!c) return;
    etat.carte = { kind: 'd', id: c.id };
    maj();
    var a = await att(['ok']);
    etat.carte = null;
    if (etat.fini || !a || a.passer) return;
    j.feuilles++;
    etat.stats.partage.total++;
    etat.stats.partage.ok++;
  }
  async function carteChance(j) {
    var idx = Math.floor(Math.random() * CHANCE.length), c = CHANCE[idx];
    etat.carte = { kind: 'c', idx: idx };
    maj();
    var a = await att(['ok']);
    etat.carte = null;
    if (etat.fini) return false;
    if (a && a.passer) { maj(); return false; }
    if (c.feuille) j.feuilles += c.feuille;
    if (c.passe) j.passe = true;
    maj();
    if (c.move) await deplacer(j, c.move);
    return !!c.rejoue;
  }

  /* ───────── Accueil ───────── */
  function lireChamps() {
    document.querySelectorAll('#noms input').forEach(function (inp, i) { config.noms[i] = inp.value; });
    var n = document.getElementById('monNom'); if (n) config.nom = n.value;
    var c = document.getElementById('codePartie'); if (c) config.code = c.value;
  }
  function ecranAccueil() {
    btnFin.hidden = true;
    var sauvee = chargerSauvegarde();
    var client = essayer(function () { return JSON.parse(sessionStorage.getItem(CLE_CLIENT)); });
    var h = '<section class="accueil">' +
      '<div class="big" aria-hidden="true">🐨🌿</div>' +
      '<h2>Le Sentier du Koala</h2>' +
      '<p class="sous">Un jeu de société pour grandir ensemble : développement de l\'enfant, pédagogie, protocoles et relation aux familles.</p>';
    if (config.erreur) h += '<div class="bloc erreur" role="alert">⚠ ' + esc(config.erreur) + '</div>';
    if (sauvee && sauvee.joueurs && sauvee.phase !== 'bilan') {
      h += '<div class="bloc"><h3>Une partie est en cours</h3><p>' + sauvee.joueurs.length + ' joueur·ses · ' +
        esc(PUBLICS[sauvee.public] ? PUBLICS[sauvee.public].nom : '') + (sauvee.enligne ? ' · en ligne, code ' + esc(sauvee.code) : '') + '</p>' +
        '<div class="actions" style="margin-top:10px"><button class="bt" id="btnReprendre" type="button">▶ Reprendre la partie</button>' +
        '<button class="bt bt-second" id="btnOublier" type="button">Effacer</button></div></div>';
    }
    if (client && client.code && EN_LIGNE_DISPO) {
      h += '<div class="bloc"><h3>Partie en ligne ' + esc(client.code) + '</h3>' +
        '<div class="actions" style="margin-top:10px"><button class="bt" id="btnRevenir" type="button">▶ Revenir dans la partie</button></div></div>';
    }
    if (EN_LIGNE_DISPO) {
      h += '<div class="bloc"><h3>Comment jouez-vous ?</h3><div class="choix-liste" role="group" aria-label="Mode de jeu">' +
        modeBouton('local', '📱', 'Sur un seul appareil', 'Une tablette ou un téléphone qui passe de main en main') +
        modeBouton('creer', '🎉', 'Chacun sur son téléphone : je lance la partie', 'Vous recevez un code à partager aux joueurs') +
        modeBouton('rejoindre', '🔑', 'Je rejoins une partie', 'Vous avez reçu un code ou un lien') + '</div></div>';
    }
    if (config.mode === 'rejoindre') {
      h += '<div class="bloc"><h3>Rejoindre la partie</h3><div class="noms">' +
        '<label>Code <input id="codePartie" type="text" maxlength="5" value="' + esc(config.code) + '" placeholder="ABCDE" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:4px;font-weight:800"></label>' +
        '<label>Prénom <input id="monNom" type="text" maxlength="24" value="' + esc(config.nom) + '" placeholder="Votre prénom" autocomplete="given-name"></label></div></div>' +
        '<div class="actions"><button class="bt bt-gros" id="btnRejoindre" type="button">🔑 <span>Rejoindre</span></button></div>';
    } else {
      h += '<div class="bloc"><h3>' + (config.mode === 'creer' ? '1' : '1') + '. Qui joue ?</h3><div class="choix-liste" role="group" aria-label="Public">';
      Object.keys(PUBLICS).forEach(function (k) {
        var p = PUBLICS[k];
        h += '<button class="choix" type="button" data-public="' + k + '" aria-pressed="' + (config.public === k) + '">' +
          '<span class="ic" aria-hidden="true">' + p.ico + '</span><span><b>' + esc(p.nom) + '</b><small>' + esc(p.desc) + '</small></span></button>';
      });
      h += '</div></div>';
      if (config.mode === 'creer') {
        h += '<div class="bloc"><h3>2. Votre prénom</h3><div class="noms"><label><span class="pion" aria-hidden="true">' + PIONS[0] + '</span>' +
          '<input id="monNom" type="text" maxlength="24" value="' + esc(config.nom) + '" placeholder="Votre prénom" autocomplete="given-name"></label></div>' +
          '<p style="font-size:13px;color:var(--muted);margin-top:8px">Vous êtes l\'animateur·rice : gardez votre téléphone ouvert pendant la partie. Les autres rejoindront avec le code à l\'écran (jusqu\'à ' + MAX_LIGNE + ' joueur·ses).</p></div>';
        h += '<div class="actions"><button class="bt bt-gros" id="btnCreer" type="button">🎉 <span>Créer la partie</span></button></div>';
      } else {
        h += '<div class="bloc"><h3>2. Combien d\'équipes ?</h3><div class="nb-equipes">' +
          '<button type="button" id="moins" aria-label="Une équipe de moins">−</button>' +
          '<output id="nb" aria-live="polite">' + config.nb + '</output>' +
          '<button type="button" id="plus" aria-label="Une équipe de plus">+</button></div><div class="noms" id="noms"></div></div>';
        h += '<div class="bloc"><h3>Les cases du plateau</h3><div class="cat-liste">';
        Object.keys(THEMES).forEach(function (k) {
          h += '<div class="cat-pastille l-' + k + '"><span aria-hidden="true">' + THEMES[k].ico + '</span>' + THEMES[k].nom + '</div>';
        });
        h += '</div></div>';
        h += '<div class="actions"><button class="bt bt-gros" id="btnJouer" type="button">🎲 <span>Commencer la partie</span></button></div>';
      }
    }
    h += '</section>';
    app.innerHTML = h;
    config.erreur = '';

    if (document.getElementById('noms') && config.mode === 'local') dessinerNoms();
    app.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () { lireChamps(); config.mode = b.getAttribute('data-mode'); ecranAccueil(); });
    });
    app.querySelectorAll('[data-public]').forEach(function (b) {
      b.addEventListener('click', function () {
        config.public = b.getAttribute('data-public');
        app.querySelectorAll('[data-public]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      });
    });
    on('moins', function () { changerNb(-1); });
    on('plus', function () { changerNb(1); });
    on('btnJouer', demarrerLocal);
    on('btnCreer', creerEnLigne);
    on('btnRejoindre', function () { lireChamps(); rejoindre(config.code, config.nom); });
    on('btnReprendre', function () { reprendre(sauvee); });
    on('btnOublier', function () { oublier(); ecranAccueil(); });
    on('btnRevenir', function () { rejoindre(client.code, client.nom); });
  }
  function on(id, fn) { var e = document.getElementById(id); if (e) e.addEventListener('click', fn); }
  function modeBouton(mode, ico, titre, desc) {
    return '<button class="choix" type="button" data-mode="' + mode + '" aria-pressed="' + (config.mode === mode) + '">' +
      '<span class="ic" aria-hidden="true">' + ico + '</span><span><b>' + esc(titre) + '</b><small>' + esc(desc) + '</small></span></button>';
  }
  function changerNb(d) {
    lireChamps();
    config.nb = Math.max(2, Math.min(MAX_LOCAL, config.nb + d));
    document.getElementById('nb').textContent = config.nb;
    dessinerNoms();
  }
  function dessinerNoms() {
    var h = '';
    for (var i = 0; i < config.nb; i++) {
      h += '<label><span class="pion" aria-hidden="true">' + PIONS[i] + '</span><span style="position:absolute;left:-9999px">Nom de l\'équipe ' + (i + 1) + '</span>' +
        '<input type="text" maxlength="24" value="' + esc(config.noms[i] || '') + '" placeholder="Équipe ' + (i + 1) + '" autocomplete="off"></label>';
    }
    document.getElementById('noms').innerHTML = h;
  }

  function demarrerLocal() {
    lireChamps();
    var joueurs = [];
    for (var i = 0; i < config.nb; i++) {
      var nom = (config.noms[i] || '').trim() || ('Équipe ' + (i + 1));
      joueurs.push({ id: 'l' + i, nom: nom, pion: PIONS[i], pos: 0, feuilles: 0, passe: false });
    }
    hote = true;
    etat = nouvelEtat({ public: config.public, joueurs: joueurs });
    garderEveille();
    maj();
    boucle();
  }

  /* ───────── Partie en ligne : animateur ───────── */
  function genererCode() {
    var c = '';
    for (var i = 0; i < 5; i++) c += LETTRES_CODE.charAt(Math.floor(Math.random() * LETTRES_CODE.length));
    return c;
  }
  async function creerEnLigne() {
    lireChamps();
    var nom = (config.nom || '').trim();
    if (!nom) { config.erreur = 'Saisissez votre prénom.'; ecranAccueil(); return; }
    var code = genererCode();
    app.innerHTML = '<div class="accueil"><p class="sous">Création de la partie…</p></div>';
    try { canal = await ouvrirCanal(code, surMessage); }
    catch (e) { config.erreur = "Impossible de créer la partie en ligne (" + e.message + ")."; ecranAccueil(); return; }
    hote = true;
    config.code = code;
    etat = nouvelEtat({ phase: 'lobby', public: config.public, enligne: true, code: code,
      joueurs: [{ id: monId, nom: nom, pion: PIONS[0], pos: 0, feuilles: 0, passe: false }] });
    garderEveille();
    maj();
  }
  function pionLibre() {
    for (var i = 0; i < PIONS.length; i++) {
      if (!etat.joueurs.some(function (j) { return j.pion === PIONS[i]; })) return PIONS[i];
    }
    return '🐾';
  }
  function accueillir(p) {
    if (!p.id || !etat) return;
    var nom = String(p.nom || '').trim().slice(0, 24) || 'Joueur';
    var j = etat.joueurs.find(function (x) { return x.id === p.id; });
    if (j) { if (etat.phase === 'lobby') j.nom = nom; }
    else if (etat.phase === 'lobby' && etat.joueurs.length < MAX_LIGNE) {
      etat.joueurs.push({ id: p.id, nom: nom, pion: pionLibre(), pos: 0, feuilles: 0, passe: false });
    } else {
      canal.send('refus', { id: p.id, raison: etat.phase === 'lobby' ? 'La partie est complète (' + MAX_LIGNE + ' joueur·ses).' : 'La partie a déjà commencé.' });
      return;
    }
    maj();
  }
  function lancerPartieEnLigne() {
    if (!hote || etat.phase !== 'lobby' || etat.joueurs.length < 2) return;
    etat.phase = 'jeu';
    etat.tour = 0;
    maj();
    boucle();
  }

  /* ───────── Partie en ligne : joueur ───────── */
  async function rejoindre(code, nom) {
    code = String(code || '').toUpperCase().replace(/[^A-Z]/g, '');
    nom = String(nom || '').trim();
    config.code = code; config.nom = nom; config.mode = 'rejoindre';
    if (code.length !== 5) { config.erreur = 'Le code comporte 5 lettres.'; ecranAccueil(); return; }
    if (!nom) { config.erreur = 'Saisissez votre prénom.'; ecranAccueil(); return; }
    app.innerHTML = '<div class="accueil"><div class="big" aria-hidden="true">🔑</div><p class="sous">Connexion à la partie ' + esc(code) + '…</p></div>';
    try { canal = await ouvrirCanal(code, surMessage); }
    catch (e) { config.erreur = 'Connexion impossible (' + e.message + ').'; ecranAccueil(); return; }
    hote = false;
    etat = null;
    essayer(function () { sessionStorage.setItem(CLE_CLIENT, JSON.stringify({ code: code, nom: nom })); });
    garderEveille();
    envoyerJoin();
    setTimeout(function () {
      if (!etat && canal && !hote) { fermerCanal(); config.erreur = "Aucune partie trouvée avec ce code (ou l'animateur n'est pas connecté)."; ecranAccueil(); }
    }, 7000);
  }
  function quitterEnLigne(raison) {
    fermerCanal();
    essayer(function () { sessionStorage.removeItem(CLE_CLIENT); });
    etat = null; hote = true;
    config.erreur = raison || '';
    ecranAccueil();
  }

  async function reprendre(sauvee) {
    etat = sauvee; hote = true;
    etat.carte = null; etat.de = null;
    if (etat.enligne) {
      etat.joueurs[0].id = monId;                       // l'animateur est toujours le premier joueur
      config.code = etat.code;
      try { canal = await ouvrirCanal(etat.code, surMessage); }
      catch (e) { etat = null; config.erreur = 'Reconnexion impossible (' + e.message + ').'; ecranAccueil(); return; }
    }
    garderEveille();
    maj();
    if (etat.phase === 'jeu') boucle();
  }

  /* ───────── Affichage ───────── */
  function rendre() {
    if (!etat) return;
    btnFin.hidden = !(etat.phase === 'jeu' && estAnimateur());
    if (etat.phase === 'lobby') { rendreLobby(); return; }
    if (etat.phase === 'bilan') { rendreBilan(); return; }
    rendreJeu();
  }

  function rendreLobby() {
    if (!voile.hidden) fermerModale();
    var lien = lienPartie();
    var h = '<section class="accueil"><div class="big" aria-hidden="true">🎉</div><h2>Salle d\'attente</h2>' +
      '<div class="bloc" style="text-align:center"><p>Code de la partie</p><div class="code-grand" aria-label="Code ' + esc(etat.code.split('').join(' ')) + '">' + esc(etat.code) + '</div>' +
      '<div class="qr" id="qr" role="img" aria-label="QR code pour rejoindre la partie"></div>' +
      '<p style="font-size:13px;color:var(--muted);margin-top:6px">Scannez le QR code avec l\'appareil photo du téléphone, ou ouvrez ce jeu, choisissez « Je rejoins une partie » et saisissez le code.</p>' +
      (hote ? '<div class="actions" style="margin-top:10px"><button class="bt bt-second" id="btnLien" type="button">🔗 Copier le lien</button>' +
        (navigator.share ? '<button class="bt bt-second" id="btnPartager" type="button">📤 Partager</button>' : '') + '</div>' : '') + '</div>' +
      '<div class="bloc"><h3>Joueur·ses (' + etat.joueurs.length + '/' + MAX_LIGNE + ')</h3><ul class="score">' +
      etat.joueurs.map(function (j) {
        return '<li><span class="p" aria-hidden="true">' + j.pion + '</span><span class="nom">' + esc(j.nom) + (j.id === monId ? ' (vous)' : '') + '</span>' + (j.id === etat.joueurs[0].id ? '<span class="case-n">animateur·rice</span>' : '') + '</li>';
      }).join('') + '</ul></div>';
    if (hote) {
      h += '<div class="actions"><button class="bt bt-gros" id="btnGo" type="button"' + (etat.joueurs.length < 2 ? ' disabled' : '') + '>🎲 <span>Lancer la partie</span></button></div>' +
        (etat.joueurs.length < 2 ? '<p class="sous" style="margin-top:8px">Il faut au moins 2 joueur·ses.</p>' : '');
    } else {
      h += '<p class="sous">En attente du lancement par ' + esc(nomJoueur(etat.joueurs[0])) + '…</p>';
    }
    h += '</section>';
    app.innerHTML = h;
    dessinerQr(lien);
    on('btnGo', lancerPartieEnLigne);
    on('btnLien', function () {
      var m = essayer(function () { return navigator.clipboard.writeText(lien); });
      if (m && m.then) m.then(function () { toast('Lien copié'); }, function () { toast(lien); }); else toast(lien);
    });
    on('btnPartager', function () { essayer(function () { navigator.share({ title: 'Le Sentier du Koala', text: 'Rejoins la partie ' + etat.code, url: lien }); }); });
  }
  /* QR code du lien de la partie (qrcodejs, comme les autres QR de l'application) ; dessiné une fois, puis réutilisé */
  function chargerQr() {
    return new Promise(function (ok) {
      if (window.QRCode) return ok(true);
      var s = document.createElement('script');
      s.src = LIB_QR; s.onload = function () { ok(!!window.QRCode); }; s.onerror = function () { ok(false); };
      document.head.appendChild(s);
    });
  }
  async function dessinerQr(lien) {
    var zone = document.getElementById('qr');
    if (!zone) return;
    if (qrCache.lien === lien && qrCache.node) { zone.appendChild(qrCache.node); return; }
    if (!(await chargerQr())) { zone.remove(); return; }       // sans bibliothèque : le code et le lien suffisent
    var n = document.createElement('div');
    new window.QRCode(n, { text: lien, width: 200, height: 200, colorDark: '#2B2740', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    qrCache = { lien: lien, node: n };
    zone = document.getElementById('qr');
    if (zone) { zone.innerHTML = ''; zone.appendChild(n); }
  }
  function lienPartie() {
    var u = new URL(location.href);
    u.search = ''; u.hash = '';
    u.searchParams.set('code', etat.code);
    return u.href;
  }

  function squelette() {
    app.innerHTML = '<div class="jeu"><div id="plateau" class="plateau" role="img" aria-label="Plateau de jeu, 42 cases du départ à l\'arrivée"></div>' +
      '<div class="panneau"><div class="tour" id="tour"></div><ul class="score" id="score" aria-label="Score des joueurs"></ul>' +
      '<div class="legende" aria-hidden="true">' + Object.keys(THEMES).map(function (k) { return '<span class="l-' + k + '">' + THEMES[k].ico + ' ' + THEMES[k].nom + '</span>'; }).join('') + '</div></div></div>';
  }
  function rendreJeu() {
    if (!document.getElementById('plateau')) squelette();
    dessinerPlateau();
    dessinerPanneau();
    rendreCarte();
    if (etat.toast && etat.toast.n !== dernierToast) { dernierToast = etat.toast.n; toast(etat.toast.t); }
  }
  function coordonnees(i) {
    var r = Math.floor(i / COLONNES);
    var c = r % 2 === 0 ? i % COLONNES : COLONNES - 1 - (i % COLONNES);
    var rangees = Math.ceil((FIN + 1) / COLONNES);
    return { ligne: rangees - r, col: c + 1 };
  }
  function dessinerPlateau() {
    var h = '', cur = etat.joueurs[etat.tour];
    for (var i = 0; i <= FIN; i++) {
      var t = PLAN[i], p = coordonnees(i), ico, cl;
      if (t === 'depart') { ico = '🏠'; cl = 't-bord'; }
      else if (t === 'arrivee') { ico = '🌳'; cl = 't-bord'; }
      else { ico = THEMES[t].ico; cl = 't-' + t; }
      var pions = etat.joueurs.map(function (j) { return j.pos === i ? '<span>' + j.pion + '</span>' : ''; }).join('');
      h += '<div class="case ' + cl + (cur && cur.pos === i ? ' courant' : '') + (pions ? ' avec-pion' : '') + '" style="grid-row:' + p.ligne + ';grid-column:' + p.col + '">' +
        '<span class="n">' + i + '</span><span class="ic">' + ico + '</span><span class="pions">' + pions + '</span></div>';
    }
    document.getElementById('plateau').innerHTML = h;
  }
  function dessinerPanneau() {
    var j = etat.joueurs[etat.tour], actif = peutAgir(), ligne = enLigne(), msg;
    if (j.passe) msg = j.nom + ' passera son tour.';
    else if (etat.de && etat.de.roule) msg = 'Le dé roule…';
    else if (etat.de) msg = 'Résultat : ' + etat.de.valeur;
    else if (!ligne) msg = 'À vous de jouer ! Lancez le dé.';
    else msg = actif ? 'À vous de jouer ! Lancez le dé.' : 'Au tour de ' + j.nom + '.';
    var face = etat.de ? DES[etat.de.valeur - 1] : DES[5];
    var occupe = !!(etat.de || etat.carte) || (!actif);
    document.getElementById('tour').innerHTML = '<div class="qui">' + j.pion + ' ' + esc(j.nom) + (ligne && actif ? ' <small>(vous)</small>' : '') + '</div>' +
      '<div class="msg" aria-live="polite">' + esc(msg) + '</div>' +
      '<div class="de-zone"><div class="de' + (etat.de && etat.de.roule ? ' roule' : '') + '" id="de" role="img" aria-label="Dé">' + face + '</div>' +
      '<button class="bt bt-gros" data-act="lancer" type="button"' + (occupe ? ' disabled' : '') + '>🎲 <span>Lancer le dé</span></button></div>' +
      (ligne && hote && !actif ? '<p style="margin-top:10px"><button class="bt bt-second" data-act="passer" type="button">⏭ Passer le tour de ' + esc(j.nom) + '</button></p>' : '');
    clearInterval(timerDe);
    if (etat.de && etat.de.roule) {
      timerDe = setInterval(function () { var d = document.getElementById('de'); if (d) d.textContent = DES[Math.floor(Math.random() * 6)]; }, 80);
    }
    document.getElementById('score').innerHTML = etat.joueurs.map(function (x, i) {
      return '<li class="' + (i === etat.tour ? 'actif' : '') + '"><span class="p" aria-hidden="true">' + x.pion + '</span>' +
        '<span class="nom">' + esc(x.nom) + (ligne && x.id === monId ? ' (vous)' : '') + '</span><span class="f">' + x.feuilles + ' 🌿</span>' +
        '<span class="case-n">case ' + x.pos + '/' + FIN + '</span></li>';
    }).join('');
  }

  /* Carte affichée à tous ; seul le joueur dont c'est le tour peut répondre */
  function rendreCarte() {
    if (reglesOuvertes) return;
    var c = etat.carte;
    if (!c) { if (!voile.hidden) fermerModale(); derniereCarte = ''; return; }
    var j = etat.joueurs[etat.tour], actif = peutAgir();
    var sig = JSON.stringify([c, actif, pistes === c.id, etat.tour]);
    if (sig === derniereCarte && !voile.hidden) return;
    derniereCarte = sig;
    var h = '', th;
    if (c.kind === 'q') {
      var q = CARTES[c.id], lettres = ['A', 'B', 'C'];
      th = THEMES[c.cat];
      h = '<span class="chip t-' + c.cat + '"><span aria-hidden="true">' + th.ico + '</span> ' + th.nom + '</span>' +
        '<h2 id="modaleTitre">' + esc(q.q) + '</h2>' +
        '<p class="aide">' + (c.rep !== null ? '' : (actif ? j.pion + ' ' + esc(j.nom) + ' : concertez-vous, puis choisissez une réponse.' : 'C\'est à ' + j.pion + ' ' + esc(j.nom) + ' de répondre. Vous pouvez en discuter ensemble !')) + '</p>' +
        '<div class="opts">';
      c.ordre.forEach(function (idx, i) {
        var texte = idx === 0 ? q.bon : q.mauvaises[idx - 1];
        var cls = 'opt', verdict = '';
        if (c.rep !== null) {
          if (idx === 0) { cls += ' bon'; verdict = '<span class="verdict" aria-hidden="true">✓</span>'; }
          else if (i === c.rep) { cls += ' faux'; verdict = '<span class="verdict" aria-hidden="true">✗</span>'; }
        }
        h += '<button class="' + cls + '" type="button" data-act="repondre" data-i="' + i + '"' + ((c.rep !== null || !actif) ? ' disabled' : '') + '>' +
          '<span class="l" aria-hidden="true">' + lettres[i] + '</span><span>' + esc(texte) + '</span>' + verdict + '</button>';
      });
      h += '</div>';
      if (c.rep !== null) {
        var bon = c.ordre[c.rep] === 0;
        h += '<div class="resultat ' + (bon ? 'ok' : 'ko') + '" role="status">' + (bon ? 'Bravo ! +1 🌿' : 'Pas tout à fait…' + (c.retour != null ? ' Retour ' + libelleCase(c.retour) + '.' : '')) + '</div>' +
          '<div class="retenir"><b>À retenir.</b> ' + esc(q.retenir) + '</div>' +
          '<div class="pied">' + (actif ? '<button class="bt" type="button" data-act="continuer" id="cont">Continuer</button>' : '<span class="aide">En attente de ' + esc(j.nom) + '…</span>') + '</div>';
      }
    } else if (c.kind === 'd') {
      var d = CARTES[c.id];
      th = THEMES.partage;
      h = '<span class="chip t-partage"><span aria-hidden="true">' + th.ico + '</span> ' + th.nom + '</span>' +
        '<h2 id="modaleTitre">' + esc(d.q) + '</h2>' +
        '<p class="aide">Pas de bonne ou mauvaise réponse : chacun·e s\'exprime à son tour, sans jugement.</p>' +
        (pistes === c.id ? '<div class="retenir">' + esc(d.retenir) + '</div>' : '') +
        '<div class="pied">' + (pistes === c.id ? '' : '<button class="bt bt-second" type="button" data-act="pistes">💡 Voir des pistes</button>') +
        (actif ? '<button class="bt" type="button" data-act="ok">Nous en avons parlé · +1 🌿</button>' : '<span class="aide">En attente de ' + esc(j.nom) + '…</span>') + '</div>';
    } else {
      var ch = CHANCE[c.idx];
      h = '<span class="chip t-chance"><span aria-hidden="true">🍀</span> Chance</span>' +
        '<h2 id="modaleTitre">' + esc(ch.t) + '</h2><p><b>' + esc(ch.e) + '</b></p>' +
        '<div class="pied">' + (actif ? '<button class="bt" type="button" data-act="ok">D\'accord</button>' : '<span class="aide">En attente de ' + esc(j.nom) + '…</span>') + '</div>';
    }
    ouvrirModale(h);
    var cont = document.getElementById('cont');
    if (cont) cont.focus();
  }
  function ouvrirModale(html) {
    if (voile.hidden) focusAvant = document.activeElement;
    modale.innerHTML = html;
    voile.hidden = false;
    modale.focus();
  }
  function fermerModale() {
    voile.hidden = true;
    modale.innerHTML = '';
    if (focusAvant && focusAvant.focus) essayer(function () { focusAvant.focus(); });
  }

  /* ───────── Bilan ───────── */
  function rendreBilan() {
    if (!voile.hidden) fermerModale();
    var joueurs = etat.joueurs;
    var meilleur = joueurs.reduce(function (m, x) { return x.feuilles > m.feuilles ? x : m; }, joueurs[0]);
    var gagnants = joueurs.filter(function (x) { return x.feuilles === meilleur.feuilles; });
    var arrive = etat.premier >= 0 ? joueurs[etat.premier] : null;
    var h = '<section class="bilan"><div class="accueil"><div class="big" aria-hidden="true">🌳</div></div>' +
      '<h2>' + (arrive ? 'Bravo, ' + esc(arrive.nom) + ' !' : 'Fin de la partie') + '</h2>' +
      '<p class="sous" style="text-align:center;color:var(--muted)">' + (arrive ? 'Arrivé·e en premier au grand eucalyptus.' : 'Voici le bilan de votre partie.') + '</p>' +
      '<div class="podium">' +
      (arrive ? '<div class="prix"><div class="ic" aria-hidden="true">' + arrive.pion + '</div><b>Le premier à l\'arrivée</b>' + esc(arrive.nom) + '</div>' : '') +
      '<div class="prix"><div class="ic" aria-hidden="true">🌿</div><b>Le plus de feuilles</b>' +
      gagnants.map(function (x) { return x.pion + ' ' + esc(x.nom); }).join(', ') + ' · ' + meilleur.feuilles + ' 🌿</div></div>';

    h += '<div class="bloc"><h3>Vos résultats par thème</h3>';
    THEMES_QUIZ.concat(['partage']).forEach(function (k) {
      var s = etat.stats[k] || { ok: 0, total: 0 };
      var pct = s.total ? Math.round(100 * s.ok / s.total) : 0;
      h += '<div class="theme-ligne"><span>' + THEMES[k].ico + ' ' + THEMES[k].nom + '</span>' +
        '<span class="barre" aria-hidden="true"><i style="width:' + pct + '%"></i></span>' +
        '<span class="v">' + (s.total ? s.ok + '/' + s.total : '—') + '</span></div>';
    });
    h += '</div>';

    var rates = etat.rates.map(function (id) { return CARTES[id]; }).filter(Boolean);
    h += '<div class="bloc"><h3>À retenir ' + (rates.length ? '(' + rates.length + ')' : '') + '</h3>';
    if (rates.length) {
      h += '<p>Les questions qui ont posé problème, avec la bonne réponse :</p><div class="revoir">' + rates.map(function (c) {
        return '<article><h4>' + THEMES[c.cat].ico + ' ' + esc(c.q) + '</h4><p class="r">✓ ' + esc(c.bon) + '</p><p>' + esc(c.retenir) + '</p></article>';
      }).join('') + '</div>';
    } else {
      h += '<p>Aucune erreur sur les questions : bravo, tout le monde est au point ! 🎉</p>';
    }
    h += '</div>';
    h += '<div class="bloc"><h3>Mon engagement</h3><p style="margin-bottom:8px">Une chose que je vais changer ou essayer dès demain :</p>' +
      '<label for="engagement" style="position:absolute;left:-9999px">Mon engagement</label>' +
      '<textarea id="engagement" maxlength="400" placeholder="Écrivez ici (rien n\'est enregistré)"></textarea></div>';
    h += '<div class="actions"><button class="bt bt-gros" id="btnRejouer" type="button">🔄 <span>Nouvelle partie</span></button>' +
      '<button class="bt bt-second" id="btnImprimer" type="button">🖨️ <span>Imprimer le bilan</span></button></div></section>';
    if (app.getAttribute('data-bilan') === String(etat.rev)) return;
    app.innerHTML = h;
    app.setAttribute('data-bilan', String(etat.rev));
    on('btnRejouer', function () { fermerCanal(); oublier(); etat = null; hote = true; app.removeAttribute('data-bilan'); ecranAccueil(); });
    on('btnImprimer', function () { window.print(); });
    window.scrollTo(0, 0);
  }

  /* ───────── Clics, règles et en-tête ───────── */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]');
    if (!b || !etat) return;
    var t = b.getAttribute('data-act');
    if (t === 'pistes') { if (etat.carte) { pistes = etat.carte.id; rendreCarte(); } return; }
    if (t === 'fermer-regles') { reglesOuvertes = false; fermerModale(); rendreCarte(); return; }
    var a = { type: t };
    if (b.getAttribute('data-i') != null) a.i = +b.getAttribute('data-i');
    agir(a);
  });
  document.getElementById('btnRegles').addEventListener('click', function () {
    reglesOuvertes = true;
    ouvrirModale('<h2 id="modaleTitre">Règles du jeu</h2>' +
      '<ol class="regles">' +
      '<li><b>But du jeu :</b> atteindre le grand eucalyptus 🌳 (case ' + FIN + ') en premier, en récoltant un maximum de feuilles 🌿.</li>' +
      '<li><b>À son tour</b>, le joueur lance le dé et avance de ce nombre de cases. En ligne, chacun voit le jeu en direct sur son téléphone.</li>' +
      '<li><b>Cases thèmes</b> (🧠 développement, 🎨 pédagogie, 🧼 protocoles, 👨‍👩‍👧 familles) : une question à 3 réponses. Concertez-vous avant de répondre. Bonne réponse : +1 🌿 et une case de bonus. Mauvaise réponse : retour à la case de départ du tour.</li>' +
      '<li><b>Case Partage</b> 💬 : un sujet à discuter, sans bonne ou mauvaise réponse. Celui qui anime la discussion gagne 1 🌿.</li>' +
      '<li><b>Case Chance</b> 🍀 : une carte surprise, bonne ou moins bonne.</li>' +
      '<li><b>Après chaque question</b>, lisez le « à retenir » : c\'est là que se passe l\'apprentissage.</li>' +
      '<li><b>Fin :</b> le premier arrivé gagne, et celui qui a le plus de feuilles reçoit aussi un prix. Un bilan des points à retenir est affiché.</li>' +
      '</ol>' +
      '<p class="aide">Les contenus sont des repères généraux. En cas de doute, les protocoles de votre établissement et l\'avis des professionnels de santé prévalent.</p>' +
      '<div class="pied"><button class="bt" type="button" data-act="fermer-regles">Compris</button></div>');
  });
  btnFin.addEventListener('click', function () {
    if (!etat || !estAnimateur()) return;
    if (window.confirm('Terminer la partie maintenant et afficher le bilan ?')) agir({ type: 'fin' });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && reglesOuvertes) { reglesOuvertes = false; fermerModale(); if (etat) rendreCarte(); }
  });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState !== 'visible' || !canal) return;
    if (hote) diffuser(); else envoyerJoin();          // le téléphone se réveille : on se resynchronise
  });

  /* ───────── Démarrage ───────── */
  var paramCode = (new URLSearchParams(location.search).get('code') || '').toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5);
  if (paramCode && EN_LIGNE_DISPO) { config.mode = 'rejoindre'; config.code = paramCode; }
  var partie = chargerSauvegarde();
  if (partie && partie.phase === 'bilan' && !paramCode) { etat = partie; hote = true; rendre(); }
  else ecranAccueil();
})();
