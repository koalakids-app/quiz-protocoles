#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Koalakids - quiz de repérage des besoins SANS NOTE (mode « profil »).

Usage : placez ce script dans le dossier qui contient index.html et admin.html
(copie locale de votre dépôt), puis :  python3 patch_profil.py

Prérequis : les parties 1 à 4 du script SQL (quiz_profil_parties.sql) ont été
exécutées dans Supabase. Sans elles, les quiz « score » actuels continuent de
fonctionner comme avant (le mode profil n'est actif que si quiz.mode = 'profil').

Tout ou rien : si un seul point d'ancrage est introuvable (ou trouvé plusieurs
fois), RIEN n'est modifié. Relancer le script sur des fichiers déjà modifiés est
sans effet.
"""
import sys, io

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
# index.html : passation sans note + écran de profil
# ======================================================================
I = 'index.html'
src_i = lire(I)
if 'renderQuizProfil' in src_i:
    print(I, ': déjà modifié, ignoré.')
    new_i = None
else:
    s = src_i

    # 1) styles du profil
    s = appliquer(s,
        ".quiz-item .chev{color:var(--orange);font-size:18px;flex-shrink:0}",
        r""".quiz-item .chev{color:var(--orange);font-size:18px;flex-shrink:0}
/* PROFIL (sans note) */
.profil{background:var(--surface);border-radius:16px;border:1px solid var(--border);padding:2rem 1.5rem}
.profil h2{font-size:22px;font-weight:700;color:var(--purple);text-align:center;margin-bottom:4px}
.profil .profil-sub{text-align:center;color:var(--text-muted);font-size:14px;margin-bottom:1rem}
.profil h3{font-size:15px;font-weight:700;color:var(--purple);margin:1.75rem 0 .75rem}
.axe-card{background:var(--surface-2);border:1px solid var(--border);border-radius:var(--radius);padding:12px 14px;margin-bottom:10px}
.axe-card p{font-size:14px;color:var(--text-muted);margin-top:6px;line-height:1.55}
.axe-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.axe-head strong{font-size:15px}
.axe-chip{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;padding:3px 10px;border-radius:20px;border:1px solid;white-space:nowrap}
.parcours-item{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;background:var(--surface-2);border:1.5px solid var(--border);border-radius:var(--radius);margin-bottom:8px}
.parcours-item strong{font-size:15px}
.parcours-niv{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:var(--orange-dark);margin-left:8px}
.parcours-mod{font-size:13px;color:var(--text-muted);margin-top:2px}
.parcours-vide{font-size:14px;color:var(--text-muted)}
.parcours-item a.btn{text-decoration:none;white-space:nowrap}
@media print{.app-header,.result-actions,.save-status{display:none!important}body{background:white}.profil{border:none;padding:0}}""",
        'index : styles')

    # 2) état : axes et modules liés
    s = appliquer(s,
        "let user={prenom:'',nom:'',creche:'',statut:''};",
        "let user={prenom:'',nom:'',creche:'',statut:''};\nlet axes=[],modulesAxes={};",
        'index : état')

    # 3) chargement des axes au démarrage (quiz de profil seulement)
    s = appliquer(s,
        "questions=r.data;",
        "questions=r.data;\n      axes=[];modulesAxes={};\n      if(quiz.mode==='profil')await chargerAxes();",
        'index : boot')

    # 4) écran d'accueil
    s = appliquer(s,
        '<div class="start-meta-item"><div class="dot"></div>Corrigé immédiat</div>',
        "<div class=\"start-meta-item\"><div class=\"dot\"></div>${isProfil()?'Sans note ni bonne réponse':'Corrigé immédiat'}</div>",
        'index : accueil')

    # 5) aiguillages
    s = appliquer(s, "function renderQuiz(){",
        "function renderQuiz(){\n  if(isProfil())return renderQuizProfil();",
        'index : renderQuiz')
    s = appliquer(s, "function renderResults(){",
        "function renderResults(){\n  if(isProfil())return renderProfil();",
        'index : renderResults')
    s = appliquer(s, "function nextAction(){",
        """function nextAction(){
  if(isProfil()){
    if(!hasAnswer(current))return;
    if(current===questions.length-1){state='results';render();}
    else{current++;render();}
    return;
  }""",
        'index : nextAction')

    # 6) code du mode profil
    s = appliquer(s,
        "function restartQuiz(){resetAnswers();state='start';render()}",
        r"""/* ===== MODE PROFIL (sans note) =====
   Aucune bonne ou mauvaise réponse : chaque option porte une « lecture »
   (point d'appui / en construction / à accompagner) et chaque question un
   « axe » de formation. Le résultat est un profil par axe, pas un score. */
const NIVEAUX={
  appui:{label:"Point d'appui",ordre:0,couleur:'var(--success-text)',fond:'var(--success-bg)',bord:'var(--success-border)'},
  construction:{label:'En construction',ordre:1,couleur:'var(--purple)',fond:'var(--purple-light)',bord:'rgba(74,63,159,.35)'},
  accompagner:{label:'À accompagner',ordre:2,couleur:'var(--orange-dark)',fond:'var(--orange-light)',bord:'var(--border-strong)'}
};
const TYPES_Q={situation:'Mise en situation',connaissance:'Connaissance',auto:'Je me positionne'};
const AIDES_Q={
  situation:"Choisis ce que tu fais le plus souvent, pas ce qu'il faudrait faire.",
  connaissance:"Choisis la réponse qui te paraît la plus juste. Si tu hésites, c'est une information utile pour la formation.",
  auto:"Choisis la réponse qui te ressemble le plus, sans te juger."
};
function isProfil(){return !!quiz&&quiz.mode==='profil'}

async function chargerAxes(){
  try{
    const a=await db.from('axe_formation').select('*').eq('quiz_id',quiz.id).order('ordre');
    axes=a.error?[]:(a.data||[]);
    const ids=axes.map(x=>x.module_id).filter(Boolean);
    modulesAxes={};
    if(ids.length){
      const m=await db.from('module').select('id,titre,accroche').in('id',ids).eq('publie',true);
      (m.data||[]).forEach(x=>{modulesAxes[x.id]=x});
    }
  }catch(e){axes=[];modulesAxes={}}
}
function lectureReponse(i){
  const q=questions[i],a=answers[i];
  if(a===null||a===undefined||!Array.isArray(q.lectures))return null;
  return q.lectures[a]||null;
}
/* Niveau d'un axe = la lecture la plus fréquente parmi les réponses.
   À égalité : si « point d'appui » et « à accompagner » arrivent à égalité, le
   profil est « en construction » (réponses mêlées) ; sinon le besoin le plus fort
   l'emporte. */
function niveauAxe(c){
  const max=Math.max(c.appui,c.construction,c.accompagner);
  const tete=['accompagner','construction','appui'].filter(n=>c[n]===max);
  if(tete.includes('appui')&&tete.includes('accompagner'))return 'construction';
  return tete[0];
}
function calculerProfil(){
  const parAxe={};
  questions.forEach((q,i)=>{
    const l=lectureReponse(i);
    if(!l||!NIVEAUX[l])return;
    const code=q.axe||'general';
    const o=parAxe[code]||(parAxe[code]={code:code,appui:0,construction:0,accompagner:0,total:0});
    o[l]++;o.total++;
  });
  const liste=Object.values(parAxe).map(o=>{
    const def=axes.find(a=>a.code===o.code)||{};
    o.def=def;o.libelle=def.libelle||o.code;o.ordre=def.ordre==null?99:def.ordre;
    o.module_id=def.module_id||null;o.niveau=niveauAxe(o);
    return o;
  });
  liste.sort((a,b)=>a.ordre-b.ordre);
  return liste;
}
function lienModule(id){
  let u=location.href.split('?')[0].split('#')[0];
  u=u.replace(/\/index(\.html)?\/?$/i,'/formations.html');
  if(!/formations\.html$/i.test(u))u=u.replace(/\/?$/,'/formations.html');
  return u+'?module='+encodeURIComponent(id)+(PRE.ref?'&ref='+encodeURIComponent(PRE.ref):'');
}

function renderQuizProfil(){
  const q=questions[current],isLast=current===questions.length-1;
  const chip=document.getElementById('header-chip');
  chip.style.display='block';chip.textContent=user.prenom;
  const sel=answers[current];
  const optsHtml=q.options.map((o,i)=>`<div class="option${sel===i?' selected':''}" onclick="choose(${i})"><div class="option-letter">${letters[i]}</div><div class="option-text">${esc(o)}</div></div>`).join('');
  const type=TYPES_Q[q.type_question]||'';
  const aide=AIDES_Q[q.type_question]||'';
  app().innerHTML=`
  <div class="progress-wrap">
    <div class="progress-meta">
      <span class="progress-label">Question ${current+1} sur ${questions.length}</span>
      <span class="progress-count">${Math.round((current+1)/questions.length*100)}%</span>
    </div>
    <div class="progress-bar"><div class="progress-fill" style="width:${(current+1)/questions.length*100}%"></div></div>
  </div>
  <div class="question-card">
    <div class="q-badge">${type?esc(type):'Question '+(current+1)}</div>
    <div class="q-text">${esc(q.enonce)}</div>
    ${q.image_url?`<img src="${esc(q.image_url)}" alt="${esc(q.image_alt||'')}" loading="lazy" style="display:block;width:100%;max-height:300px;object-fit:contain;background:#f6f6f8;border:1px solid var(--border);border-radius:10px;margin:0 0 1rem">`:''}
    <div class="options">${optsHtml}</div>
    ${aide?`<p style="font-size:12px;color:var(--text-light);margin-top:12px">${esc(aide)}</p>`:''}
  </div>
  <div class="nav">
    <button class="btn" onclick="navigate(-1)" ${current===0?'disabled':''}>← Précédent</button>
    <span class="pager">${current+1} / ${questions.length}</span>
    <button class="btn primary" onclick="nextAction()" ${hasAnswer(current)?'':'disabled'}>${isLast?'Voir mon profil →':'Suivant →'}</button>
  </div>`;
}

function renderProfil(){
  document.getElementById('header-chip').style.display='none';
  const profil=calculerProfil();
  const now=new Date().toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});
  const cartes=profil.map(p=>{
    const n=NIVEAUX[p.niveau];
    const texte=p.def['texte_'+p.niveau]||'';
    return `<div class="axe-card" style="border-left:5px solid ${n.bord}">
      <div class="axe-head"><strong>${esc(p.libelle)}</strong><span class="axe-chip" style="background:${n.fond};color:${n.couleur};border-color:${n.bord}">${n.label}</span></div>
      ${texte?`<p>${esc(texte)}</p>`:''}
    </div>`;
  }).join('');
  const aSuivre=profil.filter(p=>p.niveau!=='appui')
    .sort((a,b)=>NIVEAUX[b.niveau].ordre-NIVEAUX[a.niveau].ordre||a.ordre-b.ordre);
  const parcours=aSuivre.length?aSuivre.map(p=>{
    const m=p.module_id?modulesAxes[p.module_id]:null;
    return `<div class="parcours-item"><div><strong>${esc(p.libelle)}</strong><span class="parcours-niv">${NIVEAUX[p.niveau].label}</span>
      <div class="parcours-mod">${m?esc(m.titre):'Une formation sur mesure te sera proposée.'}</div></div>
      ${m?`<a class="btn purple" href="${esc(lienModule(m.id))}" target="_blank" rel="noopener">Ouvrir</a>`:''}</div>`;
  }).join(''):`<p class="parcours-vide">Sur ce thème, tu t'appuies déjà sur des repères solides : aucune formation n'est à prévoir pour l'instant.</p>`;
  app().innerHTML=`
  <div class="profil">
    <div class="result-icon" style="text-align:center">🧭</div>
    <h2>Ton profil</h2>
    <p class="profil-sub">${esc(quiz.titre)}</p>
    <div class="result-user-recap">
      <strong>${esc(user.prenom)} ${esc(user.nom)}</strong>
      ${esc(user.statut)}${user.creche?' · '+esc(user.creche):''} · ${now}
    </div>
    <p style="font-size:13px;color:var(--text-muted);text-align:center">Ce profil n'est pas une note : il montre sur quoi tu t'appuies déjà et ce qui peut t'aider à progresser.</p>
    <h3>Ce qui ressort, axe par axe</h3>
    ${cartes||'<p class="parcours-vide">Aucune réponse à analyser.</p>'}
    <h3>Mon parcours de formation</h3>
    ${parcours}
    <div id="save-status" class="save-status">Enregistrement en cours…</div>
    <div class="result-actions">
      <button class="btn purple" onclick="window.print()">Imprimer mon profil</button>
      <button class="btn" onclick="restartQuiz()">Recommencer</button>
    </div>
  </div>`;
  saveResultsProfil(profil);
}

async function saveResultsProfil(profil){
  const detail={
    mode:'profil',
    axes:profil.map(p=>({code:p.code,libelle:p.libelle,niveau:p.niveau,appui:p.appui,construction:p.construction,accompagner:p.accompagner})),
    reponses:questions.map((q,i)=>({
      ordre:q.ordre,enonce:q.enonce,axe:q.axe||null,type:q.type_question||null,
      choix:answers[i],reponse:answers[i]==null?null:q.options[answers[i]],lecture:lectureReponse(i)
    }))
  };
  const el=()=>document.getElementById('save-status');
  try{
    /* score/total/pourcentage restent obligatoires dans la table : 0 pour un
       profil, qui n'a pas de note. Les quiz de profil sont exclus de la
       fonction kk_resultats_par_ref (partie 4 du script SQL). */
    const ligne={
      quiz_id:quiz.id,prenom:user.prenom,nom:user.nom,creche:user.creche||null,statut:user.statut||null,
      score:0,total:questions.length,pourcentage:0,detail:detail
    };
    if(PRE.ref)ligne.ref=PRE.ref;
    let{error}=await db.from('resultats').insert(ligne);
    if(error&&/ref/i.test(error.message||'')){
      delete ligne.ref;
      ({error}=await db.from('resultats').insert(ligne));
    }
    if(error)throw error;
    if(el()){el().textContent='✓ Profil enregistré';el().className='save-status ok'}
  }catch(e){
    if(el()){el().textContent='⚠ Erreur d\'enregistrement : '+e.message;el().className='save-status err'}
  }
}

function restartQuiz(){resetAnswers();state='start';render()}""",
        'index : fonctions profil')
    new_i = s

# ======================================================================
# admin.html : import, édition et résultats des quiz de profil
# ======================================================================
A = 'admin.html'
src_a = lire(A)
if 'renderResultsProfil' in src_a:
    print(A, ': déjà modifié, ignoré.')
    new_a = None
else:
    s = src_a

    # 1) état
    s = appliquer(s,
        "let themes=[],curTheme=null,curModules=[];",
        "let themes=[],curTheme=null,curModules=[];\nlet curAxes=[],allModules=[];",
        'admin : état')

    # 2) liste des quiz : repère « profil sans note »
    s = appliquer(s,
        """<span style="color:${q.publie?'var(--success-text)':'var(--text-light)'}">${q.publie?'● Publié':'○ Brouillon'}</span>""",
        """${q.mode==='profil'?'<span style="color:var(--purple);font-weight:600">Profil sans note</span> · ':''}<span style="color:${q.publie?'var(--success-text)':'var(--text-light)'}">${q.publie?'● Publié':'○ Brouillon'}</span>""",
        'admin : liste')

    # 3) import JSON : quiz de profil
    s = appliquer(s,
        "— ou un tableau de plusieurs quiz.",
        "— ou un tableau de plusieurs quiz. Quiz de profil (sans note) : ajouter <code>\"mode\":\"profil\"</code>, <code>\"axes\":[{\"code\",\"libelle\",\"texte_appui\",\"texte_construction\",\"texte_accompagner\"}]</code> et, pour chaque question, <code>\"type_question\"</code>, <code>\"axe\"</code> et <code>\"lectures\"</code> (une valeur « appui », « construction » ou « accompagner » par option) à la place de <code>reponses</code>.",
        'admin : aide import')
    s = appliquer(s,
        "if(!Array.isArray(qq.reponses)||!qq.reponses.length||qq.reponses.some(r=>!Number.isInteger(r)||r<0||r>=qq.options.length)){",
        """if(q.mode==='profil'){
          const okL=Array.isArray(qq.lectures)&&qq.lectures.length===qq.options.length&&qq.lectures.every(l=>['appui','construction','accompagner'].includes(l));
          if(!okL){alert(`⚠ Question ${i+1} du quiz "${q.titre}" : "lectures" doit contenir une valeur (appui, construction ou accompagner) par option.`);input.value='';return;}
          if(typeof qq.axe!=='string'||!qq.axe.trim()){alert(`⚠ Question ${i+1} du quiz "${q.titre}" : "axe" manquant.`);input.value='';return;}
        }
        if(q.mode!=='profil'&&(!Array.isArray(qq.reponses)||!qq.reponses.length||qq.reponses.some(r=>!Number.isInteger(r)||r<0||r>=qq.options.length))){""",
        'admin : validation import')
    s = appliquer(s,
        "titre:q.titre.trim(),description:(q.description||'').trim(),publie:!!q.publie",
        "titre:q.titre.trim(),description:(q.description||'').trim(),publie:!!q.publie,...(q.mode==='profil'?{mode:'profil',bloc:q.bloc||null,ordre:Number.isInteger(q.ordre)?q.ordre:null}:{})",
        'admin : insert quiz')
    s = appliquer(s,
        "reponses:qq.reponses,",
        "reponses:Array.isArray(qq.reponses)?qq.reponses:[],",
        'admin : insert reponses')
    s = appliquer(s,
        "image_alt:qq.image_alt||null",
        "image_alt:qq.image_alt||null,\n          ...(q.mode==='profil'?{type_question:qq.type_question||null,axe:qq.axe.trim(),lectures:qq.lectures}:{})",
        'admin : insert questions profil')
    s = appliquer(s,
        "if(qsErr)throw qsErr;",
        """if(qsErr)throw qsErr;
        if(q.mode==='profil'&&Array.isArray(q.axes)&&q.axes.length){
          const axPayload=q.axes.map((a,k)=>({quiz_id:qrow.id,code:String(a.code).trim(),libelle:String(a.libelle||a.code),ordre:Number.isInteger(a.ordre)?a.ordre:k+1,texte_appui:a.texte_appui||null,texte_construction:a.texte_construction||null,texte_accompagner:a.texte_accompagner||null}));
          const{error:axErr}=await db.from('axe_formation').insert(axPayload);
          if(axErr)throw axErr;
        }""",
        'admin : insert axes')

    # 4) édition d'un quiz de profil
    s = appliquer(s,
        "curQuestions=data||[];",
        "curQuestions=data||[];\n  curAxes=[];allModules=[];\n  if(curQuiz.mode==='profil')await chargerAxesEdit(id);",
        'admin : openQuiz')
    s = appliquer(s,
        "function renderEdit(){",
        "function renderEdit(){\n  const isP=curQuiz.mode==='profil';",
        'admin : renderEdit')
    s = appliquer(s,
        """<input type="${q.multi?'checkbox':'radio'}" name="ans-${i}" ${q.reponses.includes(j)?'checked':''}
          onchange="setAnswer(${i},${j},this.checked)" style="width:16px;height:16px;accent-color:var(--orange);flex-shrink:0">""",
        """${isP?lectureSelect(i,j,q):`<input type="${q.multi?'checkbox':'radio'}" name="ans-${i}" ${q.reponses.includes(j)?'checked':''}
          onchange="setAnswer(${i},${j},this.checked)" style="width:16px;height:16px;accent-color:var(--orange);flex-shrink:0">`}""",
        'admin : lecture par option')
    s = appliquer(s,
        'style="font-size:12px;color:var(--text-muted);display:flex;align-items:center;gap:4px"',
        """style="font-size:12px;color:var(--text-muted);display:${isP?'none':'flex'};align-items:center;gap:4px\"""",
        'admin : masquer plusieurs réponses')
    s = appliquer(s,
        "onchange=\"setEnonce(${i},this.value)\">${esc(q.enonce)}</textarea>",
        "onchange=\"setEnonce(${i},this.value)\">${esc(q.enonce)}</textarea>\n      ${isP?metaProfil(i,q):''}",
        'admin : axe et type')
    s = appliquer(s,
        "${qs||'<div class=\"center-msg\">Aucune question. Ajoutez la première.</div>'}",
        "${isP?panneauAxes():''}\n    ${qs||'<div class=\"center-msg\">Aucune question. Ajoutez la première.</div>'}",
        'admin : panneau des axes')
    s = appliquer(s,
        "function addOption(i){curQuestions[i].options.push('');renderEdit()}",
        "function addOption(i){const q=curQuestions[i];q.options.push('');if(Array.isArray(q.lectures))q.lectures.push('construction');renderEdit()}",
        'admin : addOption')
    s = appliquer(s,
        "q.options.splice(j,1);",
        "q.options.splice(j,1);\n  if(Array.isArray(q.lectures))q.lectures.splice(j,1);",
        'admin : delOption')
    s = appliquer(s,
        "if(!q.reponses.length)q.reponses=[0];",
        "if(!q.reponses.length&&curQuiz.mode!=='profil')q.reponses=[0];",
        'admin : delOption reponses')
    s = appliquer(s,
        "reponses:[0],multi:false,image_url:null,image_alt:null,ordre:curQuestions.length,_new:true}",
        "reponses:curQuiz.mode==='profil'?[]:[0],multi:false,image_url:null,image_alt:null,ordre:curQuestions.length,_new:true,...(curQuiz.mode==='profil'?{type_question:'situation',axe:(curAxes[0]&&curAxes[0].code)||null,lectures:['appui','construction','accompagner','accompagner']}:{})}",
        'admin : addQ')
    s = appliquer(s,
        "const payload={quiz_id:curQuiz.id,enonce:q.enonce,options:q.options,reponses:q.reponses,multi:q.multi,ordre:i,image_url:q.image_url||null,image_alt:q.image_alt||null};",
        "const payload={quiz_id:curQuiz.id,enonce:q.enonce,options:q.options,reponses:q.reponses,multi:q.multi,ordre:i,image_url:q.image_url||null,image_alt:q.image_alt||null};\n      if(curQuiz.mode==='profil'){payload.type_question=q.type_question||null;payload.axe=q.axe||null;payload.lectures=q.lectures||null;}",
        'admin : saveAll questions')
    s = appliquer(s,
        "msg.className='save-status ok';msg.textContent='✓ Modifications enregistrées';",
        "if(curQuiz.mode==='profil')await sauverAxes();\n    msg.className='save-status ok';msg.textContent='✓ Modifications enregistrées';",
        'admin : saveAll axes')

    # 5) résultats d'un quiz de profil
    s = appliquer(s,
        "function renderResults(){",
        "function renderResults(){\n  if(curQuiz&&curQuiz.mode==='profil')return renderResultsProfil();",
        'admin : renderResults')
    s = appliquer(s,
        "function showDetail(id){",
        "function showDetail(id){\n  if(curQuiz&&curQuiz.mode==='profil'){const rp=results.find(x=>x.id===id);if(rp)return detailProfil(rp);}",
        'admin : showDetail')
    s = appliquer(s,
        "function exportCSV(){",
        "function exportCSV(){\n  if(curQuiz&&curQuiz.mode==='profil')return exportCSVProfil();",
        'admin : exportCSV')

    # 6) fonctions du mode profil (admin), avant la section Formations
    s = appliquer(s,
        """/* ==========================================================
   FORMATIONS — Thèmes & Modules""",
        r"""/* ==========================================================
   QUIZ DE PROFIL (sans note) — édition et résultats
   ========================================================== */
const NIV_ADM={
  appui:{label:"Point d'appui",c:'var(--success-text)',bg:'var(--success-bg)'},
  construction:{label:'En construction',c:'var(--purple)',bg:'var(--purple-light)'},
  accompagner:{label:'À accompagner',c:'var(--orange-dark)',bg:'var(--orange-light)'}
};
const TYPES_ADM={situation:'Mise en situation',connaissance:'Connaissance',auto:'Auto-positionnement'};
const chipNiv=n=>{const v=NIV_ADM[n];return v?`<span style="display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:${v.bg};color:${v.c};white-space:nowrap">${v.label}</span>`:'<span style="color:var(--text-light)">—</span>'};

async function chargerAxesEdit(id){
  const a=await db.from('axe_formation').select('*').eq('quiz_id',id).order('ordre');
  curAxes=a.error?[]:(a.data||[]);
  const m=await db.from('module').select('id,titre,theme_id,publie').order('titre');
  allModules=m.error?[]:(m.data||[]);
}
function lectureSelect(i,j,q){
  const v=(q.lectures||[])[j]||'construction';
  return `<select class="form-select" style="width:auto;padding:5px 8px;font-size:12px;flex-shrink:0" onchange="setLecture(${i},${j},this.value)">${['appui','construction','accompagner'].map(n=>`<option value="${n}" ${v===n?'selected':''}>${NIV_ADM[n].label}</option>`).join('')}</select>`;
}
function setLecture(i,j,v){
  const q=curQuestions[i];
  if(!Array.isArray(q.lectures))q.lectures=q.options.map(()=>'construction');
  q.lectures[j]=v;
}
function setAxeQ(i,v){curQuestions[i].axe=v}
function setTypeQ(i,v){curQuestions[i].type_question=v}
function metaProfil(i,q){
  const ax=curAxes.map(a=>`<option value="${esc(a.code)}" ${q.axe===a.code?'selected':''}>${esc(a.libelle)}</option>`).join('')
    +(q.axe&&!curAxes.some(a=>a.code===q.axe)?`<option value="${esc(q.axe)}" selected>${esc(q.axe)}</option>`:'');
  const ty=Object.keys(TYPES_ADM).map(k=>`<option value="${k}" ${q.type_question===k?'selected':''}>${TYPES_ADM[k]}</option>`).join('');
  return `<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">
    <select class="form-select" style="width:auto;padding:5px 8px;font-size:12px" onchange="setTypeQ(${i},this.value)">${ty}</select>
    <select class="form-select" style="width:auto;max-width:100%;padding:5px 8px;font-size:12px" onchange="setAxeQ(${i},this.value)">${ax}</select>
    <span style="font-size:12px;color:var(--text-light);align-self:center">Chaque option porte une lecture (à droite de la lettre).</span>
  </div>`;
}
function setAxeChamp(k,champ,v){curAxes[k][champ]=v}
function panneauAxes(){
  if(!curAxes.length)return `<div class="question-card" style="margin-bottom:1rem"><strong>Axes de formation</strong>
    <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Aucun axe défini pour ce quiz. Importez le quiz avec ses axes (JSON) ou exécutez le script SQL du thème.</p></div>`;
  const optsMod=a=>['<option value="">— Aucun (formation à créer) —</option>'].concat(allModules.map(m=>`<option value="${esc(m.id)}" ${a.module_id===m.id?'selected':''}>${esc(m.titre)}${m.publie?'':' (brouillon)'}</option>`)).join('');
  const ta=(k,champ,lib,val)=>`<div class="form-group" style="margin:8px 0 0"><label class="form-label" style="font-size:11px">${lib}</label>
    <textarea class="form-input" rows="2" style="font-size:13px;resize:vertical" onchange="setAxeChamp(${k},'${champ}',this.value)">${esc(val)}</textarea></div>`;
  const cartes=curAxes.map((a,k)=>`<div style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-top:10px;background:var(--surface-2)">
      <div style="font-size:11px;color:var(--text-light)">Code : ${esc(a.code)}</div>
      <div class="form-group" style="margin:6px 0 0"><label class="form-label" style="font-size:11px">Libellé de l'axe</label>
        <input class="form-input" style="font-size:14px" value="${esc(a.libelle)}" onchange="setAxeChamp(${k},'libelle',this.value)"></div>
      <div class="form-group" style="margin:8px 0 0"><label class="form-label" style="font-size:11px">Formation liée (parcours proposé à la personne)</label>
        <select class="form-select" style="font-size:13px" onchange="setAxeChamp(${k},'module_id',this.value||null)">${optsMod(a)}</select></div>
      ${ta(k,'texte_appui',"Texte si « point d'appui »",a.texte_appui)}
      ${ta(k,'texte_construction','Texte si « en construction »',a.texte_construction)}
      ${ta(k,'texte_accompagner','Texte si « à accompagner »',a.texte_accompagner)}
    </div>`).join('');
  return `<div class="question-card" style="margin-bottom:1.25rem"><strong>Axes de formation</strong>
    <p style="font-size:12px;color:var(--text-muted);margin-top:4px">Ce que la personne lit sur son profil, et la formation proposée quand l'axe est « en construction » ou « à accompagner ».</p>${cartes}</div>`;
}
async function sauverAxes(){
  for(const a of curAxes){
    const r=await db.from('axe_formation').update({
      libelle:a.libelle,texte_appui:a.texte_appui||null,texte_construction:a.texte_construction||null,
      texte_accompagner:a.texte_accompagner||null,module_id:a.module_id||null
    }).eq('id',a.id);
    if(r.error)throw r.error;
  }
}

const axesDe=r=>(r&&r.detail&&Array.isArray(r.detail.axes))?r.detail.axes:[];
function axesVus(){
  const vus=[];
  results.forEach(r=>axesDe(r).forEach(a=>{if(!vus.some(x=>x.code===a.code))vus.push({code:a.code,libelle:a.libelle})}));
  return vus;
}
function renderResultsProfil(){
  const list=filtered();
  const creches=[...new Set(results.map(r=>r.creche).filter(Boolean))].sort();
  const statuts=[...new Set(results.map(r=>r.statut).filter(Boolean))].sort();
  const vus=axesVus();
  const nomCourt=r=>`${esc(r.prenom)} ${esc(r.nom)}`;
  const synth=vus.map(ax=>{
    const par={appui:[],construction:[],accompagner:[]};
    list.forEach(r=>{const a=axesDe(r).find(x=>x.code===ax.code);if(a&&par[a.niveau])par[a.niveau].push(nomCourt(r));});
    const n=par.appui.length+par.construction.length+par.accompagner.length;
    const pct=k=>n?Math.round(par[k].length/n*100):0;
    const barre=['appui','construction','accompagner'].map(k=>par[k].length?`<div title="${NIV_ADM[k].label} : ${par[k].length}" style="width:${pct(k)}%;background:${NIV_ADM[k].bg};color:${NIV_ADM[k].c};font-size:11px;font-weight:700;text-align:center;padding:3px 0;overflow:hidden">${par[k].length}</div>`:'').join('');
    return `<div style="padding:10px 4px;border-bottom:1px solid var(--border)">
      <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:6px"><strong style="font-size:13px">${esc(ax.libelle)}</strong>
        <span style="font-size:12px;color:var(--text-muted)">${n} personne${n>1?'s':''}</span></div>
      <div style="display:flex;border-radius:6px;overflow:hidden;border:1px solid var(--border)">${barre||'<div style="padding:3px 8px;font-size:11px;color:var(--text-light)">—</div>'}</div>
      ${par.accompagner.length?`<div style="font-size:12px;color:var(--orange-dark);margin-top:6px"><strong>À accompagner :</strong> ${par.accompagner.join(', ')}</div>`:''}
      ${par.construction.length?`<div style="font-size:12px;color:var(--purple);margin-top:3px"><strong>En construction :</strong> ${par.construction.join(', ')}</div>`:''}
    </div>`;
  }).join('');
  const rows=list.map(r=>`<tr style="border-bottom:1px solid var(--border)">
      <td style="padding:8px;font-size:13px"><strong>${nomCourt(r)}</strong></td>
      <td style="padding:8px;font-size:12px;color:var(--text-muted)">${esc(r.statut||'—')}</td>
      <td style="padding:8px;font-size:12px;color:var(--text-muted)">${esc(r.creche||'—')}</td>
      <td style="padding:8px;font-size:12px;color:var(--text-muted);white-space:nowrap">${new Date(r.passe_le).toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'2-digit'})}</td>
      ${vus.map(ax=>{const a=axesDe(r).find(x=>x.code===ax.code);return `<td style="padding:8px;text-align:center">${chipNiv(a&&a.niveau)}</td>`}).join('')}
      <td style="padding:8px;text-align:right"><button class="btn" style="padding:3px 8px;font-size:11px" onclick="showDetail('${r.id}')">Détail</button></td>
    </tr>`).join('');
  app().innerHTML=`
    <button class="btn" style="margin-bottom:1rem" onclick="view='list';loadQuizzes()">← Retour</button>
    <h2 style="font-size:19px;color:var(--purple);margin-bottom:.25rem">${esc(curQuiz.titre)}</h2>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:1rem">${list.length} profil${list.length>1?'s':''} · quiz sans note</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div class="form-group" style="flex:1;min-width:220px;max-width:320px">
        <label class="form-label">Filtrer par statut</label>
        <select class="form-select" onchange="filterStatut=this.value;renderResults()">
          <option value="">Tous les statuts</option>
          ${statuts.map(c=>`<option value="${esc(c)}" ${c===filterStatut?'selected':''}>${esc(c)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group" style="flex:1;min-width:220px;max-width:320px">
        <label class="form-label">Filtrer par crèche</label>
        <select class="form-select" onchange="filterCreche=this.value;renderResults()">
          <option value="">Toutes les crèches</option>
          ${creches.map(c=>`<option value="${esc(c)}" ${c===filterCreche?'selected':''}>${esc(c)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div style="display:flex;gap:8px;margin-bottom:1rem"><button class="btn" onclick="exportCSV()">Exporter en CSV</button></div>
    ${list.length?`<h3 style="font-size:15px;color:var(--purple);margin:.5rem 0">Besoins par axe de formation</h3>
      <div class="question-card" style="padding:8px 12px;margin-bottom:1.25rem">${synth}</div>
      <h3 style="font-size:15px;color:var(--purple);margin:.5rem 0">Profil de chaque personne</h3>
      <div class="question-card" style="padding:8px;overflow-x:auto"><table style="width:100%;border-collapse:collapse">
        <tr style="text-align:left;font-size:11px;color:var(--text-light);text-transform:uppercase"><th style="padding:6px 8px">Personne</th><th style="padding:6px 8px">Statut</th><th style="padding:6px 8px">Crèche</th><th style="padding:6px 8px">Date</th>${vus.map(a=>`<th style="padding:6px 8px;text-align:center">${esc(a.libelle)}</th>`).join('')}<th></th></tr>
        ${rows}</table></div>`:'<div class="center-msg">Aucun profil pour ce filtre.</div>'}`;
}
function detailProfil(r){
  const ax=axesDe(r);
  if(!ax.length)return alert('Aucun détail enregistré pour ce résultat.');
  const txt=ax.map(a=>`${a.libelle} : ${(NIV_ADM[a.niveau]||{}).label||a.niveau} (appui ${a.appui}, en construction ${a.construction}, à accompagner ${a.accompagner})`).join('\n');
  alert(`${r.prenom} ${r.nom}\n\n${txt}`);
}
function exportCSVProfil(){
  const list=filtered(),vus=axesVus();
  const head=['Prénom','Nom','Statut','Crèche','Date'].concat(vus.map(a=>a.libelle));
  const lines=[head.join(';')];
  list.forEach(r=>{
    const niv=vus.map(ax=>{const a=axesDe(r).find(x=>x.code===ax.code);return a?((NIV_ADM[a.niveau]||{}).label||a.niveau):''});
    lines.push([r.prenom,r.nom,r.statut||'',r.creche||'',new Date(r.passe_le).toLocaleString('fr-FR')].concat(niv)
      .map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';'));
  });
  const blob=new Blob(['﻿'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='profils-'+curQuiz.titre.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.csv';
  a.click();
}

/* ==========================================================
   FORMATIONS — Thèmes & Modules""",
        'admin : fonctions profil')
    new_a = s

# ======================================================================
# Écriture (tout ou rien : rien n'est écrit avant que tout ait réussi)
# ======================================================================
if new_i is not None:
    ecrire(I, new_i); print(I, ': modifié.')
if new_a is not None:
    ecrire(A, new_a); print(A, ': modifié.')
print("Terminé. Rechargez les pages avec Ctrl+Maj+R après publication sur GitHub Pages.")
