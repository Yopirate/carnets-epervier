/* Import eBird: conservateur, CSV ou ZIP traité exclusivement dans le navigateur. */
(()=>{
'use strict';
const el=id=>document.getElementById(id);
const fileInput=el('ebirdFile'), preview=el('ebirdPreview'), commit=el('ebirdCommit'), status=el('ebirdImportStatus');
if(!fileInput||!preview||!commit||!status)return;
let pending=null;
const currentKey='epervier_observations_v1';
const needed=['Submission ID','Common Name','Scientific Name','Count','Location','Latitude','Longitude','Date'];
const territory={MA:'Maroc',ES:'Espagne',FR:'France',CN:'Chine',HR:'Croatie',TN:'Tunisie',GI:'Gibraltar',BA:'Bosnie-Herzégovine',PT:'Portugal',DZ:'Algérie',MR:'Mauritanie'};
const enc = s=>String(s??'').trim();
function parseCsv(data){
 data=data.replace(/^\uFEFF/,'');let records=[],row=[],field='',inQuote=false;
 for(let i=0;i<data.length;i++){
   let c=data[i];
   if(inQuote){if(c==='"'){if(data[i+1]==='"'){field+='"';i++}else inQuote=false}else field+=c}
   else if(c==='"')inQuote=true;
   else if(c===','){row.push(field);field=''}
   else if(c==='\r'||c==='\n'){if(c==='\r'&&data[i+1]==='\n')i++;row.push(field);field='';if(row.some(x=>x!==''))records.push(row);row=[]}
   else field+=c;
 }
 if(inQuote)throw new Error('Fichier CSV incomplet : guillemet non fermé');
 if(field!==''||row.length){row.push(field);records.push(row)}
 if(!records.length)throw new Error('Fichier CSV vide');
 let headers=records.shift().map(x=>x.trim());let missing=needed.filter(k=>!headers.includes(k));
 if(missing.length)throw new Error('Colonnes eBird manquantes : '+missing.join(', '));
 return records.filter(r=>r.some(x=>x!=='' )).map((r,idx)=>{
   let result={};headers.forEach((h,i)=>result[h]=r[i]??'');result.__row=idx+2;return result;
 });
}
async function readData(f){
 if(/\.csv$/i.test(f.name))return f.text();
 if(/\.zip$/i.test(f.name)){
  if(typeof JSZip==='undefined')throw new Error('Le module de lecture ZIP n’a pas chargé (connexion nécessaire). Décompresse le ZIP et choisis MyEBirdData.csv.');
  const archive=await JSZip.loadAsync(f);const files=Object.values(archive.files).filter(x=>!x.dir&&/\.csv$/i.test(x.name));
  const selected=files.find(x=>/(^|\/)MyEBirdData\.csv$/i.test(x.name))||files[0];
  if(!selected)throw new Error('Aucun CSV dans cette archive ZIP');
  return selected.async('string');
 }
 throw new Error('Choisir un CSV ou un ZIP eBird');
}
function stableId(r){
 // Un identifiant eBird pour chaque espèce d’une checklist, stable entre les imports.
 let parts=[r['Submission ID'],r['Scientific Name'],r['Location ID']||r['Location'],r['Date']].map(enc);
 // Rare cas de plusieurs lignes du même taxon dans la même liste: le doublon sera affiché et ignoré.
 return 'ebird:'+parts.map(x=>encodeURIComponent(x)).join('|');
}
function localZone(r){return ''} // Aucun rattachement régional inventé depuis un histogramme national.
function convert(r){
 let region=enc(r['State/Province']).split('-')[0];
 let certainty='Confirmée';let n=enc(r['Count']);
 let comments=[enc(r['Observation Details']),enc(r['Checklist Comments'])].filter(Boolean).join('\n\n');
 let alt=enc(r['Scientific Name']);let subs=enc(r['Submission ID']);
 let photo=enc(r['ML Catalog Numbers']);
 let method=[enc(r['Protocol']),enc(r['Duration (Min)'])?`Durée ${enc(r['Duration (Min)'])} min`:''].filter(Boolean).join(' · ');
 let time=enc(r['Time']);
 if(/AM|PM/i.test(time)){let m=time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(m){let hour=Number(m[1])%12+(m[3].toUpperCase()==='PM'?12:0);time=String(hour).padStart(2,'0')+':'+m[2]}};
 return {id:stableId(r),date:enc(r['Date']),time,species:enc(r['Common Name']),count:n||'X',country:territory[region]||region||'Non précisé',site:enc(r['Location']),lat:enc(r['Latitude']),lon:enc(r['Longitude']),zone:localZone(r),journey:'',certainty,behavior:'Autre',habitat:'',weather:'',distance:'',photo:photo?`Macaulay Library : ${photo}`:'',camera:'',settings:'',notes:comments,source:'eBird',ebirdSubmissionId:subs,ebirdLocationId:enc(r['Location ID']),scientificName:alt,ebirdStateProvince:enc(r['State/Province']),ebirdCounty:enc(r['County']),ebirdBreedingCode:enc(r['Breeding Code']),ebirdProtocol:method,ebirdAllObsReported:enc(r['All Obs Reported']),ebirdMacaulay:photo,ebirdTaxonomicOrder:enc(r['Taxonomic Order']),updatedAt:new Date().toISOString()};
}
function getExisting(){try{let d=JSON.parse(localStorage.getItem(currentKey)||'[]');if(!Array.isArray(d))throw Error('Données locales invalides');return d}catch(e){throw new Error('Impossible de lire les observations actuelles. Fais une sauvegarde avant import. '+e.message)}}
function analyzeRows(rows,existing){let seen=new Set(existing.map(x=>x.id)),dedup=new Set();let add=[],repeated=0,bad=0,duplicatesInFile=0;
 for(let r of rows){if(!enc(r['Submission ID'])||!enc(r['Scientific Name'])||!enc(r['Date'])||!enc(r['Location'])){bad++;continue}
   let o=convert(r);if(seen.has(o.id)){repeated++;continue}if(dedup.has(o.id)){duplicatesInFile++;continue}dedup.add(o.id);add.push(o)}
 return {add,repeated,bad,duplicatesInFile};
}
const show=message=>status.textContent=message;
fileInput.addEventListener('change',()=>{pending=null;commit.disabled=true;show('Fichier sélectionné. Clique sur « Analyser le fichier ».')});
preview.onclick=async()=>{
 pending=null;commit.disabled=true;const f=fileInput.files?.[0];if(!f){show('Sélectionne le fichier ZIP ou CSV de ton compte eBird.');return}
 try{
 show('Lecture et validation en cours…');let csv=await readData(f),rows=parseCsv(csv),existing=getExisting();let result=analyzeRows(rows,existing);
 pending={...result,total:rows.length,previous:existing.length};
 show(`${rows.length} lignes eBird détectées. ${existing.length} observations déjà conservées dans l’application. ${result.add.length} nouvelles observations à ajouter, ${result.repeated} déjà importées, ${result.duplicatesInFile} doublons dans le fichier, ${result.bad} lignes incomplètes. Aucune donnée n’a encore été modifiée.`);
 commit.disabled=!result.add.length;
 }catch(e){show('Erreur : '+e.message)}
};
commit.onclick=()=>{
 if(!pending?.add.length)return;
 try{
 let existing=getExisting();let nowIds=new Set(existing.map(x=>x.id));let newItems=pending.add.filter(x=>!nowIds.has(x.id));
 if(!newItems.length){show('Toutes ces observations sont déjà présentes.');commit.disabled=true;return}
 if(!confirm(`Ajouter ${newItems.length} observations eBird à tes ${existing.length} observations actuelles ? Les données présentes ne seront pas supprimées.`))return;
 let merged=existing.concat(newItems);
 localStorage.setItem(currentKey,JSON.stringify(merged));
 // Même tableau en mémoire que l'application principale (déclaré dans son script classique).
 if(typeof observations!=='undefined'){observations.length=0;observations.push(...merged);if(typeof refresh==='function')refresh()}
 pending=null;commit.disabled=true;
 show(`Import terminé : ${newItems.length} nouvelles observations ajoutées. Total : ${merged.length}. Fais immédiatement une sauvegarde JSON depuis le panneau ci-dessous.`);
 }catch(e){show('Import non effectué : '+e.message+' · Essayez la sauvegarde locale ou divisez le CSV.')}
};
})();
