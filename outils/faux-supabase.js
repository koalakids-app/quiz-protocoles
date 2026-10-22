'use strict';
/*
 * Faux client Supabase pour tester les pages (formations.html, index.html, admin.html)
 * sans accès au vrai projet. Le script retourné est injecté à la place de supabase-js
 * (voir tests/_commun.js) : les pages appellent alors db.from('table')… sur des données
 * fournies par le test.
 *
 *   const { scriptFauxSupabase } = require('../faux-supabase');
 *   const script = scriptFauxSupabase({ module: [...], bloc: [...] }, { session: true });
 *
 * donnees : un objet { nomDeTable: [lignes] }. Les vues se déclarent comme des tables
 *           (par exemple echanges_valides).
 * options :
 *   session          true : auth.getSession() renvoie une session (pour admin.html).
 *   erreursInsert    [{ table, champ, valeur, message }] : un insert dont la ligne a
 *                    champ === valeur renvoie cette erreur (simule la limite d'envois).
 *
 * Dans la page, après le chargement :
 *   window.__ecritures   liste des insert / upsert / update / delete reçus.
 *   window.__appels      appels de fonctions serveur (functions.invoke) : {nom, corps}.
 *   window.__refuse      true : update et delete ne touchent aucune ligne (simule un
 *                        compte non autorisé par les règles de sécurité).
 *
 * Limites : ce n'est PAS la base. Les règles de sécurité (RLS), les contraintes et les
 * déclencheurs ne sont pas simulés ici ; pour eux, voir securite-bd/.
 */
function scriptFauxSupabase(donnees, options = {}) {
  return `(function(){
  const D=${JSON.stringify(donnees)};
  const OPTS=${JSON.stringify(options)};
  window.__ecritures=[];window.__refuse=false;
  const egal=(a,b)=>String(a)===String(b);
  function table(nom){
    const filtres=[];let tri=null,asc=true,max=null,unique=false,op='select',patch=null;
    const lignes=()=>D[nom]||(D[nom]=[]);
    const q={
      select(){return q},
      eq(c,v){filtres.push(r=>egal(r[c],v));return q},
      in(c,l){filtres.push(r=>(l||[]).map(String).includes(String(r[c])));return q},
      order(c,o){tri=c;asc=!(o&&o.ascending===false);return q},
      limit(n){max=n;return q},
      single(){unique=true;return q},
      insert(l){
        const rows=Array.isArray(l)?l:[l];
        window.__ecritures.push({op:'insert',table:nom,lignes:rows});
        for(const e of (OPTS.erreursInsert||[])){
          if(e.table===nom&&rows.some(r=>egal(r[e.champ],e.valeur)))return Promise.resolve({data:null,error:{message:e.message}});
        }
        return Promise.resolve({data:null,error:null});
      },
      upsert(l){window.__ecritures.push({op:'upsert',table:nom,lignes:l});return Promise.resolve({data:null,error:null})},
      update(p){op='update';patch=p;return q},
      delete(){op='delete';return q},
      then(ok,ko){
        let r=lignes().filter(x=>filtres.every(f=>f(x)));
        if(op==='update'||op==='delete'){
          window.__ecritures.push({op,table:nom,patch,ids:r.map(x=>x.id)});
          if(window.__refuse)r=[];
          else if(op==='update')r.forEach(x=>Object.assign(x,patch));
          else D[nom]=lignes().filter(x=>!r.includes(x));
          return Promise.resolve({data:r.map(x=>({id:x.id})),error:null}).then(ok,ko);
        }
        if(tri)r=[...r].sort((a,b)=>(a[tri]>b[tri]?1:a[tri]<b[tri]?-1:0)*(asc?1:-1));
        if(max!=null)r=r.slice(0,max);
        const sortie=unique?{data:r[0]||null,error:r[0]?null:{message:'introuvable'}}:{data:r,error:null};
        return Promise.resolve(sortie).then(ok,ko);
      }
    };
    return q;
  }
  window.supabase={createClient(){return{
    from:table,
    rpc(){return Promise.resolve({data:null,error:null})},
    functions:{invoke(nom,o){
      const corps=(o&&o.body)||{};window.__appels=window.__appels||[];window.__appels.push({nom,corps});
      const reponses=OPTS.fonctions||{};
      if(nom==='liste-destinataires')return Promise.resolve({data:reponses[nom]||{creches:[],destinataires:[],envois:[]},error:null});
      return Promise.resolve({data:{resultats:(corps.destinataires||[]).map(d=>({email:d.email,prenom:d.prenom,nom:d.nom,etat:'envoye'}))},error:null});
    }},
    auth:{
      onAuthStateChange(){},
      getSession(){return Promise.resolve({data:{session:OPTS.session?{user:{id:'test-admin'}}:null}})},
      signOut(){return Promise.resolve({})}
    }};}};
})();`;
}
module.exports = { scriptFauxSupabase };
