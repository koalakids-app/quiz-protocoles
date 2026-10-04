#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Koalakids - envoi groupé d'une formation (parcours).

Usage : placez ce script dans le dossier qui contient formations.html et admin.html
(copie locale de votre dépôt), puis :  python3 patch_parcours.py

Tout ou rien : si un seul point d'ancrage est introuvable (ou trouvé plusieurs fois),
RIEN n'est modifié. Relancer le script sur des fichiers déjà modifiés est sans effet.
"""
import sys, io, os

def lire(p):
    with io.open(p, encoding='utf-8', newline='') as f:
        return f.read()

def ecrire(p, s):
    with io.open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(s)

def appliquer(src, ancre, nouveau, nom):
    n = src.count(ancre)
    if n != 1:
        sys.exit("ECHEC (%s) : point d'ancrage trouvé %d fois au lieu d'une. Rien n'a été modifié." % (nom, n))
    return src.replace(ancre, nouveau, 1)

# ======================================================================
# formations.html
# ======================================================================
F = 'formations.html'
f = lire(F)
if 'showTheme(' in f:
    print(F, ': déjà modifié, ignoré.')
    f_new = None
else:
    # 1) styles
    f = appliquer(f,
        ".m-end-actions a.btn{text-decoration:none}\n",
        """.m-end-actions a.btn{text-decoration:none}
.p-nav{font-size:13px;color:var(--text-muted);margin:0 0 1rem}
.p-nav a{color:var(--purple);font-weight:600;text-decoration:none}
.p-list{display:flex;flex-direction:column;gap:10px;margin:1.25rem 0}
.p-item{display:flex;gap:14px;align-items:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:1rem 1.1rem;text-decoration:none;color:inherit}
.p-item:hover{border-color:var(--orange)}
.p-num{flex:0 0 auto;width:32px;height:32px;border-radius:50%;background:var(--purple);color:#fff;font-weight:700;font-size:14px;display:flex;align-items:center;justify-content:center}
.p-item.lu .p-num{background:#2E8B57}
.p-item h4{font-size:15px;font-weight:700;color:var(--purple);margin:0 0 3px}
.p-item p{font-size:13px;color:var(--text-muted);margin:0;line-height:1.5}
.p-lu{font-size:12px;color:#2E8B57;font-weight:700;margin-top:4px}
.p-bar{position:sticky;bottom:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:10px 12px;margin-top:1rem;box-shadow:0 -4px 14px rgba(74,63,159,.10)}
.p-bar a.btn,.p-bar span.btn{text-decoration:none;padding:9px 14px;font-size:13.5px}
.p-bar .off{opacity:.35;pointer-events:none}
.p-bar .pos{font-size:12.5px;color:var(--text-muted);font-weight:600;text-align:center}
""", 'css')

    # 2) outils de lien + vue parcours, insérés avant la vue module
    f = appliquer(f,
        "/* ---------- VUE : MODULE ---------- */\nlet _curModuleId=null;\n",
        """/* ---------- PARCOURS (liens groupés) ---------- */
/* Le paramètre ref (lien personnel) et quiz (quiz de fin de parcours, facultatif)
   sont conservés d'un module à l'autre. */
const PRE_QUIZ=(new URLSearchParams(location.search).get('quiz')||'').trim();
function lienPage(page,params){
  const q=new URLSearchParams();
  Object.keys(params).forEach(k=>q.set(k,params[k]));
  if(PRE_REF)q.set('ref',PRE_REF);
  return page+'?'+q.toString();
}
const lienModule=id=>lienPage('formations.html',PRE_QUIZ?{module:id,quiz:PRE_QUIZ}:{module:id});
const lienTheme=id=>lienPage('formations.html',PRE_QUIZ?{theme:id,quiz:PRE_QUIZ}:{theme:id});
const lienQuiz=()=>lienPage('index.html',{quiz:PRE_QUIZ});

async function modulesDuTheme(themeId){
  const{data}=await db.from('module').select('id,titre,accroche,ordre').eq('theme_id',themeId).eq('publie',true).order('ordre');
  return data||[];
}

async function showTheme(id){
  _curModuleId=null;
  const{data:t,error}=await db.from('theme').select('*').eq('id',id).single();
  if(error||!t)return erreur("Ce lien n'est pas valide ou la formation n'est plus disponible.");
  const mods=await modulesDuTheme(id);
  if(!mods.length)return erreur("Cette formation n'est pas encore disponible.");
  let lus=new Set();
  if(PRE_REF){
    try{
      const{data:l}=await db.from('formations_lu').select('module_id').eq('ref',PRE_REF);
      (l||[]).forEach(x=>lus.add(x.module_id));
    }catch(e){}
  }
  setHead(t.nom,'Formation Koalakids',mods.length+' module'+(mods.length>1?'s':''));
  document.title=t.nom+' \\u2014 Koalakids';
  const prochain=mods.find(m=>!lus.has(m.id))||mods[0];
  const dejaCommence=lus.size>0&&prochain!==mods[0];
  app().innerHTML=`<div class="container">
    <div class="m-hero">
      <div class="m-tag">Formation</div>
      <h2>${esc(t.nom)}</h2>
      ${t.description?`<p>${mdBold(t.description)}</p>`:''}
    </div>
    <p class="p-nav">${mods.length} module${mods.length>1?'s':''} \\u00e0 suivre dans l'ordre. Vous pouvez vous arr\\u00eater et reprendre quand vous voulez.</p>
    <div class="p-list">${mods.map((m,i)=>`
      <a class="p-item${lus.has(m.id)?' lu':''}" href="${esc(lienModule(m.id))}">
        <div class="p-num">${lus.has(m.id)?'\\u2713':i+1}</div>
        <div><h4>${esc(m.titre)}</h4>${m.accroche?`<p>${mdBold(m.accroche)}</p>`:''}${lus.has(m.id)?'<div class="p-lu">Lu</div>':''}</div>
      </a>`).join('')}</div>
    <div class="m-end-actions" style="margin-bottom:1rem">
      <a class="btn primary" href="${esc(lienModule(prochain.id))}">${dejaCommence?'Reprendre : ':'Commencer : '}${esc(prochain.titre)}</a>
    </div>
    <p class="m-foot">Micro-formation Koalakids \\u00b7 ${esc(t.nom)}</p></div>`;
  window.scrollTo(0,0);
}

/* ---------- VUE : MODULE ---------- */
let _curModuleId=null;
""", 'vue parcours')

    # 3) module : position dans le parcours + module suivant
    f = appliquer(f,
        "  const nom=t?t.nom:'';\n  setHead(m.titre,'Micro-formation'",
        """  const nom=t?t.nom:'';
  // Position dans le parcours (modules publiés du même thème)
  let freres=[];
  try{freres=await modulesDuTheme(m.theme_id);}catch(e){}
  const pos=freres.findIndex(x=>x.id===id);
  const suivant=pos>=0?freres[pos+1]:null;
  const precedent=pos>0?freres[pos-1]:null;
  const enParcours=freres.length>1&&pos>=0;
  setHead(m.titre,'Micro-formation'""", 'module: freres')

    # barre de navigation permanente (precedent / suivant)
    f = appliquer(f,
        "${nom?' \\u00b7 '+esc(nom):''}</p></div>`;\n  window.scrollTo(0,0);\n  // Module",
        "${nom?' \\u00b7 '+esc(nom):''}</p>\n"
        "    ${enParcours?`<div class=\"p-bar\">\n"
        "      ${precedent?`<a class=\"btn\" href=\"${esc(lienModule(precedent.id))}\">\\u2190 Pr\\u00e9c\\u00e9dent</a>`:'<span class=\"btn off\">\\u2190 Pr\\u00e9c\\u00e9dent</span>'}\n"
        "      <span class=\"pos\">Module ${pos+1} / ${freres.length}</span>\n"
        "      ${suivant?`<a class=\"btn primary\" href=\"${esc(lienModule(suivant.id))}\">Suivant \\u2192</a>`:(PRE_QUIZ?`<a class=\"btn primary\" href=\"${esc(lienQuiz())}\">Passer le quiz \\u2192</a>`:'<span class=\"btn off\">Suivant \\u2192</span>')}\n"
        "    </div>`:''}</div>`;\n  window.scrollTo(0,0);\n  // Module", 'module: barre')

    f = appliquer(f,
        "      ${nom?`<div class=\"m-tag\">Th\\u00e8me : ${esc(nom)}</div>`:''}\n      <h2>${esc(m.titre)}</h2>",
        "      ${nom?`<div class=\"m-tag\">Th\\u00e8me : ${esc(nom)}</div>`:''}\n"
        "      ${enParcours?`<p class=\"p-nav\" style=\"margin:0 0 .5rem\">Module ${pos+1} sur ${freres.length} \\u00b7 <a href=\"${esc(lienTheme(m.theme_id))}\">Voir tous les modules</a></p>`:''}\n"
        "      <h2>${esc(m.titre)}</h2>", 'module: position')

    f = appliquer(f,
        "      <div class=\"m-end-actions\">\n        <button class=\"btn\" onclick=\"window.scrollTo({top:0,behavior:'smooth'})\">Relire depuis le d\\u00e9but</button>\n      </div>",
        "      <div class=\"m-end-actions\">\n"
        "        ${suivant?`<a class=\"btn primary\" href=\"${esc(lienModule(suivant.id))}\">Module suivant : ${esc(suivant.titre)} \\u2192</a>`:''}\n"
        "        ${!suivant&&enParcours&&PRE_QUIZ?`<a class=\"btn primary\" href=\"${esc(lienQuiz())}\">Passer le quiz de validation \\u2192</a>`:''}\n"
        "        <button class=\"btn\" onclick=\"window.scrollTo({top:0,behavior:'smooth'})\">Relire depuis le d\\u00e9but</button>\n"
        "        ${enParcours?`<a class=\"btn\" href=\"${esc(lienTheme(m.theme_id))}\">Tous les modules</a>`:''}\n"
        "      </div>", 'module: boutons')

    # 4) routage
    f = appliquer(f,
        "  const id=new URLSearchParams(location.search).get('module');\n  if(id)showModule(id);else showAccueil();",
        "  const q=new URLSearchParams(location.search);\n  const id=q.get('module'),th=q.get('theme');\n  if(id)showModule(id);else if(th)showTheme(th);else showAccueil();",
        'routage')
    f_new = f

# ======================================================================
# admin.html
# ======================================================================
A = 'admin.html'
a = lire(A)
if 'copyThemeLink' in a:
    print(A, ': déjà modifié, ignoré.')
    a_new = None
else:
    # 1) boutons dans l'en-tête de la liste des modules
    a = appliquer(a,
        '        <button class="btn" onclick="importModuleJSON()">⇩ Importer (JSON IA)</button>\n',
        '        <button class="btn" onclick="copyThemeLink(\'${curTheme.id}\')">🔗 Copier le lien du parcours</button>\n'
        '        <button class="btn" onclick="envoyerParcours()">✉ Envoyer le parcours par mail</button>\n'
        '        <button class="btn" onclick="importModuleJSON()">⇩ Importer (JSON IA)</button>\n', 'admin: entete modules')

    # 2) bouton sur la carte du thème
    a = appliquer(a,
        '''onclick="editTheme('${t.id}')">Renommer</button>\n''',
        '''onclick="editTheme('${t.id}')">Renommer</button>
        <button class="btn" style="padding:7px 14px;font-size:13px" onclick="copyThemeLink('${t.id}')">🔗 Lien du parcours</button>\n''', 'admin: carte theme')

    # 3) modèle de message du parcours + reprise par le bouton "modèle"
    a = appliquer(a,
        "const MODELE_CANDIDAT=[",
        """function modeleParcours(nom,nb){
  return `Bonjour {prenom},\\n\\nVous trouverez ci-dessous le lien de la formation « ${nom} ». Elle se compose de ${nb} modules courts, à suivre dans l'ordre : le lien ouvre le premier module, puis chaque module vous propose d'enchaîner avec le suivant. Vous pouvez vous arrêter et reprendre quand vous voulez depuis ce même lien.\\n\\n{lien}\\n\\nMerci de la suivre dans les meilleurs délais.\\n\\nCordialement,\\nL'équipe Koalakids`;
}
const MODELE_CANDIDAT=[""", 'admin: modele parcours')

    a = appliquer(a,
        "  else{ENV.message=modeleMessage(ENV.kind,ENV.titre);ENV.objet=ENV.kind==='quiz'?'Votre questionnaire - Koalakids':'Votre formation - Koalakids';}",
        "  else{ENV.message=ENV.parcours?modeleParcours(ENV.parcours.nom,ENV.parcours.nb):modeleMessage(ENV.kind,ENV.titre);ENV.objet=ENV.kind==='quiz'?'Votre questionnaire - Koalakids':'Votre formation - Koalakids';}",
        'admin: envModele')

    # 4) fonctions
    a = appliquer(a,
        "async function editContent(id){",
        """async function copyThemeLink(themeId){
  const t=themes.find(x=>x.id===themeId)||(curTheme&&curTheme.id===themeId?curTheme:null);
  let url=moduleBase()+'?theme='+themeId;
  // Quiz de fin de parcours (facultatif) : proposé après le dernier module.
  let qs=quizzes;
  if(!qs||!qs.length){
    try{const{data}=await db.from('quiz').select('id,titre,publie').order('cree_le',{ascending:false});qs=data||[];}catch(e){qs=[];}
  }
  qs=qs.filter(q=>q.publie);
  if(qs.length){
    const rep=prompt('Quiz proposé à la fin du parcours (facultatif).\\nTapez le numéro, ou laissez vide pour aucun :\\n\\n'+qs.map((q,i)=>(i+1)+'. '+q.titre).join('\\n'),'');
    const n=parseInt(rep,10);
    if(n>=1&&n<=qs.length)url+='&quiz='+qs[n-1].id;
  }
  let avert='';
  try{
    const{data:ms}=await db.from('module').select('publie').eq('theme_id',themeId);
    const brouillons=(ms||[]).filter(m=>!m.publie).length;
    if(!(ms||[]).some(m=>m.publie))avert='\\n\\n\\u26a0 Aucun module publié : le lien ne fonctionnera pas.';
    else if(brouillons)avert='\\n\\n\\u26a0 '+brouillons+' module'+(brouillons>1?'s':'')+' en brouillon : '+(brouillons>1?'ne seront':'ne sera')+' pas visible'+(brouillons>1?'s':'')+' dans le parcours.';
  }catch(e){}
  navigator.clipboard.writeText(url).then(
    ()=>alert('Lien du parcours copié :\\n'+url+avert),
    ()=>prompt('Copiez ce lien :',url));
}

function envoyerParcours(){
  const pub=curModules.filter(m=>m.publie);
  if(!pub.length)return alert('Publiez au moins un module : le lien envoyé ne fonctionnerait pas.');
  if(pub.length<curModules.length&&!confirm((curModules.length-pub.length)+' module(s) sont encore en brouillon et ne seront pas dans le parcours.\\n\\nContinuer ?'))return;
  // Le mail part avec le lien du premier module (lien personnel, géré par le serveur) ;
  // chaque module propose ensuite le suivant.
  openEnvoi('module',pub[0].id);
  if(ENV){
    ENV.parcours={nom:curTheme.nom,nb:pub.length};
    ENV.titre=curTheme.nom+' (parcours de '+pub.length+' module'+(pub.length>1?'s':'')+')';
    ENV.objet='Votre formation - Koalakids';
    ENV.message=modeleParcours(curTheme.nom,pub.length);
  }
}

async function editContent(id){""", 'admin: fonctions')
    a_new = a

# ----------------------------------------------------------------------
# Tout est validé : on écrit (sauvegarde .bak au passage)
# ----------------------------------------------------------------------
for nom, contenu in ((F, f_new), (A, a_new)):
    if contenu is None:
        continue
    ecrire(nom + '.bak', lire(nom))
    ecrire(nom, contenu)
    print(nom, ': modifié (sauvegarde :', nom + '.bak)')
print('Terminé.')
