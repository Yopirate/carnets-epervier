/* Les Carnets de l'Épervier v2 — add-on sans modification des observations v1 */
(()=>{
'use strict';
const byId=id=>document.getElementById(id);
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rapaces=typeof RAPACES!=='undefined'?RAPACES:[];
const choice=byId('encySpecies'),search=byId('encySearch');
const priority={
 'Aquila chrysaetos':{size:'Envergure env. 180–230 cm',habitat:'Montagnes, plateaux et escarpements rocheux ; grandes zones de chasse ouvertes.',identification:'Grand aigle sombre à longues ailes ; nuque dorée chez l’adulte. Chez le jeune, plages blanches aux ailes et à la queue, variables avec l’âge.',food:'Mammifères de taille moyenne, oiseaux et charognes occasionnelles.',movement:'Principalement résident dans ses territoires ; dispersion des immatures.',field:'Observer à distance les crêtes et versants thermiques, surtout le matin, sans s’approcher des aires.'},
 'Aquila fasciata':{size:'Envergure env. 145–180 cm',habitat:'Falaises méditerranéennes, garrigues et paysages rocheux ouverts.',identification:'Silhouette athlétique, longue queue et ailes larges ; adulte avec dessous clair fortement contrasté et bande sombre terminale à la queue.',food:'Oiseaux et petits à moyens mammifères, notamment pigeons et lapins.',movement:'Plutôt sédentaire, jeunes en dispersion.',field:'Chercher les couples dans les paysages de falaises ; ne pas divulguer les sites de nidification.'},
 'Gypaetus barbatus':{size:'Envergure env. 235–285 cm',habitat:'Hautes montagnes et falaises, notamment Pyrénées et massifs où l’espèce est présente.',identification:'Très longue queue cunéiforme, longues ailes effilées ; adulte à poitrine rousse et tête claire barrée de noir.',food:'Principalement os et restes de carcasses.',movement:'Territorial chez les adultes, dispersion possible des jeunes.',field:'Chercher au-dessus des falaises et des cirques ; exploiter les longues focales et respecter les zones protégées.'},
 'Neophron percnopterus':{size:'Envergure env. 150–170 cm',habitat:'Milieux ouverts chauds, plateaux, falaises, pâturages et vallées arides.',identification:'Adulte blanc et noir, face nue jaune, queue cunéiforme ; immature sombre évoluant progressivement.',food:'Charognes, déchets organiques, petits animaux et œufs.',movement:'Migrateur transsaharien pour de nombreuses populations ; saison de présence variable selon régions.',field:'Privilégier les zones ouvertes près des falaises et les périodes de passage, sans appâtage.'},
 'Gyps fulvus':{size:'Envergure env. 230–280 cm',habitat:'Falaises de reproduction, vallées montagneuses et espaces pastoraux.',identification:'Très grande aile aux rémiges sombres, vol plané stable, cou long couvert de duvet et collerette claire.',food:'Charognes de grands mammifères.',movement:'Résident et dispersif ; les jeunes peuvent parcourir de grandes distances.',field:'Observer les ascendances thermiques au-dessus des versants et des cols.'},
 'Aegypius monachus':{size:'Envergure env. 250–295 cm',habitat:'Massifs boisés et vastes terrains ouverts, présence géographique très localisée.',identification:'Immense vautour uniformément sombre, ailes larges rectangulaires, queue courte.',food:'Charognes de grands et moyens mammifères.',movement:'Résident dans les noyaux de reproduction et dispersif ailleurs.',field:'Comparer taille, profil alaire et couleur avec le Vautour fauve ; occurrence au Maroc à vérifier au cas par cas.'},
 'Falco peregrinus':{size:'Envergure env. 80–120 cm',habitat:'Falaises maritimes ou montagneuses, villes et zones fréquentées par les oiseaux.',identification:'Faucon puissant à moustache noire, ailes pointues et poitrine barrée ; grande variabilité des sous-espèces.',food:'Principalement oiseaux capturés en vol.',movement:'Sédentaire, hivernant ou migrateur selon populations.',field:'Surveiller perchoirs dominants, falaises et trajets d’oiseaux ; attention à la différence avec le Lanier.'},
 'Falco biarmicus':{size:'Envergure env. 90–115 cm',habitat:'Steppes rocheuses, semi-déserts et falaises des régions chaudes.',identification:'Faucon élancé à tête souvent claire, moustache moins forte que chez le pèlerin, nuque roussâtre variable.',food:'Oiseaux, reptiles et petits mammifères.',movement:'Essentiellement résident et dispersif local.',field:'Chercher aux marges des falaises et dans les plaines rocailleuses ; identification photographique prudente.'},
 'Pandion haliaetus':{size:'Envergure env. 145–170 cm',habitat:'Côtes, estuaires, lacs et grands réservoirs poissonneux.',identification:'Dessous largement blanc, poignets marqués de sombre, ailes longues anguleuses ; plonge sur les poissons.',food:'Poissons presque exclusivement.',movement:'Migrateur et hivernant dans une grande partie de l’Afrique.',field:'Chercher depuis un point fixe près des plans d’eau, aux moments d’activité de pêche.'},
 'Pernis apivorus':{size:'Envergure env. 115–135 cm',habitat:'Forêts, mosaïques de boisements et milieux ouverts.',identification:'Petite tête de type pigeon, longue queue barrée ; plumage très variable, à distinguer de la Buse variable.',food:'Larves de guêpes et autres insectes.',movement:'Migrateur transsaharien ; passages en groupes aux détroits.',field:'Au détroit de Gibraltar, privilégier les conditions favorables aux ascendances et aux migrations.'}
};
const familyInfo={'Aigles & grands rapaces':'Grands rapaces et aigles : compare la forme des ailes, la queue, les proportions et les différents plumages selon l’âge.','Vautours':'Vautours : recherche les profils de vol, la structure de la queue et des ailes ainsi que les comportements de prospection.','Faucons':'Faucons : compare moustache, forme des ailes, fréquence des battements et silhouettes en chasse.','Busards':'Busards : vol bas de prospection ; la détermination varie beaucoup selon l’âge et le sexe.'};
function buildSelector(q='',picked=''){
 let filtered=rapaces.filter(s=>(s.name+' '+s.latin+' '+s.group).toLocaleLowerCase('fr').includes(q.toLocaleLowerCase('fr')));
 const groups=new Map();filtered.forEach(s=>{if(!groups.has(s.group))groups.set(s.group,[]);groups.get(s.group).push(s)});
 choice.replaceChildren();for(const [grp,items] of groups){let g=document.createElement('optgroup');g.label=grp;items.forEach(s=>{let o=document.createElement('option');o.value=s.latin;o.textContent=`${s.name} · ${s.latin}`;g.appendChild(o)});choice.appendChild(g)}
 if(picked&&filtered.some(x=>x.latin===picked))choice.value=picked;
 if(!choice.value&&filtered.length)choice.value=filtered[0].latin;
 showSpecies();
}
function resource(label,url){return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)} ↗</a>`}
let photoRequest=0;
async function wikimediaPhoto(latin){
 const n=++photoRequest,el=byId('encyPhoto');el.innerHTML='<p class="muted small">Recherche d’une photographie librement consultable…</p>';
 try{
  const api='https://commons.wikimedia.org/w/api.php?'+new URLSearchParams({action:'query',generator:'search',gsrsearch:latin+' bird',gsrnamespace:'6',gsrlimit:'8',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640',format:'json',origin:'*'});
  const controller=new AbortController();const handle=setTimeout(()=>controller.abort(),9000);let res=await fetch(api,{signal:controller.signal});clearTimeout(handle);if(!res.ok)throw Error();let json=await res.json();if(n!==photoRequest)return;
  const vals=Object.values(json.query?.pages||{});const found=vals.find(x=>/\.(jpg|jpeg|png|webp)$/i.test(x.title||'')&&x.imageinfo?.[0]?.thumburl);
  if(!found)throw Error();const info=found.imageinfo[0];let title=found.title;
  let credit=info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g,'')||'Auteur indiqué sur Wikimedia Commons';
  el.innerHTML=`<a href="${escapeHTML(info.descriptionurl)}" target="_blank" rel="noopener noreferrer"><img class="ency-photo" alt="Photographie associée à ${escapeHTML(latin)} — Wikimedia Commons" src="${escapeHTML(info.thumburl)}" loading="lazy"></a><p class="ency-credit">Wikimedia Commons : ${escapeHTML(title)} · ${escapeHTML(credit.slice(0,160))}. Voir la page source pour la licence et l’identification.</p>`;
 }catch(e){if(n===photoRequest)el.innerHTML='<p class="muted">Photo intégrée indisponible. Ouvre la recherche Wikimedia Commons ci-dessous.</p>'}
}
function showSpecies(){const s=rapaces.find(x=>x.latin===choice.value);const body=byId('encyBody');if(!s){body.innerHTML='<p>Aucune espèce ne correspond à cette recherche.</p>';return}
 let p=priority[s.latin];let commons='https://commons.wikimedia.org/wiki/Special:MediaSearch?'+new URLSearchParams({type:'image',search:s.latin});
 let birds='https://www.oiseaux.net/rechercher/?'+new URLSearchParams({q:s.latin});
 let ebird='https://ebird.org/species/'+encodeURIComponent(s.latin.replace(/ /g,'_'));
 let macaulay='https://search.macaulaylibrary.org/catalog?'+new URLSearchParams({taxonCode:s.latin,mediaType:'audio'});
 let xeno='https://xeno-canto.org/explore?'+new URLSearchParams({query:s.latin});
 body.innerHTML=`<div class="ency-hero"><h3>${escapeHTML(s.name)}</h3><em>${escapeHTML(s.latin)}</em><div class="ency-facts"><div><strong>Famille / groupe</strong>${escapeHTML(s.group)}</div><div><strong>Région du catalogue</strong>${escapeHTML(s.region)}</div><div><strong>Envergure indicative</strong>${escapeHTML(p?.size||'À documenter pour cette espèce')}</div></div></div>
 <div id="encyPhoto"></div>
 ${p?`<h3>Reconnaissance sur le terrain</h3><p>${escapeHTML(p.identification)}</p><h3>Habitat</h3><p>${escapeHTML(p.habitat)}</p><h3>Régime alimentaire</h3><p>${escapeHTML(p.food)}</p><h3>Déplacements et migration</h3><p>${escapeHTML(p.movement)}</p><h3>Conseils d’observation</h3><p>${escapeHTML(p.field)}</p>`:
 `<p class="note"><strong>Fiche en cours d’enrichissement.</strong> ${escapeHTML(familyInfo[s.group]||'Le catalogue contient cette espèce et son nom scientifique ; consulte les bases spécialisées pour l’identification, les dimensions, l’aire de présence et les sons. Aucune description spécifique n’a été inventée.')}</p>`}
 <h3>Photographies, sons et références</h3><div class="ency-links">${resource('Photographies libres · Wikimedia',commons)}${resource('Fiches · Oiseaux.net','https://www.oiseaux.net/')}${resource('Observations · eBird','https://ebird.org/explore')}${resource('Sons · Xeno-canto',xeno)}${resource('Macaulay Library','https://search.macaulaylibrary.org/catalog')}</div><p class="small muted">Oiseaux.net : rechercher « ${escapeHTML(s.latin)} » sur le site. Les liens ouvrent des ressources tierces ; certaines peuvent exiger une recherche complémentaire. Vérifier le statut de conservation et les caractères diagnostiques avec des sources taxonomiques à jour. Aucune donnée de nidification sensible n’est affichée.</p>`;
 wikimediaPhoto(s.latin);
}
search.addEventListener('input',()=>buildSelector(search.value,choice.value));choice.addEventListener('change',showSpecies);
byId('openSpeciesInfo')?.addEventListener('click',()=>{const name=byId('species').value;let s=rapaces.find(x=>x.name===name||x.latin===name);search.value='';buildSelector('',s?.latin);tab('encyclopedia')});
const ds=byId('docSpeciesList');ds.innerHTML=rapaces.map(s=>`<option value="${escapeHTML(s.name)}"></option>`).join('');
buildSelector();
// Carte interactive
let map=null,pointsLayer=null;
const tileAttrib='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>';
function ensureMap(){if(!byId('topoMap'))return;if(typeof L==='undefined'){byId('mapStatus').textContent='Fond de carte indisponible : Leaflet nécessite une connexion Internet. Les observations restent visibles ci-dessous.';return}
 if(map){setTimeout(()=>map.invalidateSize(),60);updatePoints();return}
 map=L.map('topoMap',{zoomControl:true}).setView([34.0,-4.7],5);
 const standard=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:tileAttrib});
 const terrain=L.tileLayer('https://tile.openmaps.fr/opentopomap/{z}/{x}/{y}.png',{maxZoom:16,attribution:tileAttrib+' · <a href="https://opentopomap.org/">OpenTopoMap</a> (CC-BY-SA)'});
 standard.addTo(map);L.control.layers({'OpenStreetMap':standard,'Relief · OpenTopoMap':terrain},null,{collapsed:false}).addTo(map);
 pointsLayer=L.layerGroup().addTo(map);updatePoints();
 }
function updatePoints(){if(!map||!pointsLayer)return;pointsLayer.clearLayers();let pts=[];
 let data=typeof observations!=='undefined'?observations:[];
 data.forEach(o=>{const lat=Number(o.lat),lon=Number(o.lon);if(o.lat===''||o.lon===''||!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return;
 let m=L.circleMarker([lat,lon],{radius:7,color:'#fff',weight:2,fillColor:o.certainty==='Confirmée'?'#235941':'#b48b43',fillOpacity:0.95}).addTo(pointsLayer);
 m.bindPopup(`<strong>${escapeHTML(o.species)}</strong><br>${escapeHTML(o.date)} · ${escapeHTML(o.site)}<br>${escapeHTML(o.certainty||'')}`);pts.push([lat,lon])});
 byId('mapStatus').textContent=`${pts.length} observation(s) géolocalisée(s) sur le fond de carte. Les fiches restent privées sur cet appareil.`;
}
byId('mapMorocco').onclick=()=>{ensureMap();map?.setView([31.3,-6.2],6)};
byId('mapSpain').onclick=()=>{ensureMap();map?.setView([40.2,-3.4],6)};
byId('mapBoth').onclick=()=>{ensureMap();map?.setView([36.1,-5.0],5)};
byId('mapAllPoints').onclick=()=>{ensureMap();let layers=pointsLayer?.getLayers()||[];if(layers.length)map.fitBounds(L.featureGroup(layers).getBounds().pad(.18));else byId('mapStatus').textContent='Aucun point GPS enregistré pour cadrer la carte.'};
// L'application v1 active les onglets : déclencher l'initialisation après cet événement.
document.querySelectorAll('[data-tab="map"]').forEach(b=>b.addEventListener('click',()=>setTimeout(ensureMap,100)));
const obsForm=byId('obsForm');obsForm?.addEventListener('submit',()=>setTimeout(updatePoints,30));
// Documents: stockage IndexedDB (sans publication GitHub)
const DB='epervier_documents_v2',STORE='publications';let dbPromise=null;
function openDb(){if(!('indexedDB'in window))return Promise.reject(Error('IndexedDB indisponible'));if(dbPromise)return dbPromise;dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});return dbPromise}
async function getDocs(){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function putDoc(obj){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(obj);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
async function getDoc(id){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly'),r=t.objectStore(STORE).get(id);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}
async function removeDoc(id){const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}
function formatSize(s){return s>1048576?(s/1048576).toFixed(1)+' Mo':(s/1024).toFixed(0)+' Ko'}
async function renderDocs(){try{let d=await getDocs(),q=byId('docFilter').value.toLocaleLowerCase('fr');d=d.filter(x=>([x.title,x.species,x.region,x.author,x.note].join(' ').toLocaleLowerCase('fr').includes(q))).sort((a,b)=>b.added.localeCompare(a.added));byId('docCount').textContent=`${d.length} document(s) dans la bibliothèque de ce navigateur.`;
 const root=byId('docList');root.innerHTML=d.length?d.map(x=>`<div class="doc-entry"><strong>${escapeHTML(x.title)}</strong><span class="small muted">${escapeHTML(x.species||'Divers')} · ${escapeHTML(x.region||'Région non précisée')} · ${escapeHTML(x.author||'Auteur non précisé')} · ${formatSize(x.file.size)} · ${escapeHTML(x.added.slice(0,10))}</span><p class="small">${escapeHTML(x.note||'')}</p><div class="actions"><button type="button" class="btn secondary" data-open-doc="${escapeHTML(x.id)}">Ouvrir / télécharger</button><button type="button" class="btn danger" data-del-doc="${escapeHTML(x.id)}">Supprimer</button></div></div>`).join(''):'<div class="empty">Aucun document enregistré pour cette recherche.</div>';
 root.querySelectorAll('[data-open-doc]').forEach(b=>b.onclick=async()=>{const x=await getDoc(b.dataset.openDoc);if(!x)return;let url=URL.createObjectURL(x.file),a=document.createElement('a');a.href=url;a.download=x.file.name||x.title;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000)});
 root.querySelectorAll('[data-del-doc]').forEach(b=>b.onclick=async()=>{if(!confirm('Supprimer ce document de la bibliothèque locale ?'))return;await removeDoc(b.dataset.delDoc);renderDocs()});
 }catch(e){byId('docList').textContent='Impossible d’accéder à la bibliothèque : '+e.message}}
byId('docForm').addEventListener('submit',async ev=>{ev.preventDefault();let f=byId('docFile').files[0];if(!f)return;if(f.size>35*1024*1024){alert('Fichier de plus de 35 Mo : choisir une version plus légère.');return}
 let obj={id:crypto.randomUUID?crypto.randomUUID():'doc-'+Date.now(),title:byId('docTitle').value.trim(),species:byId('docSpecies').value.trim(),region:byId('docRegion').value.trim(),author:byId('docAuthor').value.trim(),note:byId('docNote').value.trim(),added:new Date().toISOString(),file:f};
 try{await putDoc(obj);byId('docForm').reset();await renderDocs();alert('Document sauvegardé localement dans ce navigateur. Garde une copie originale sur ton PC.')}catch(e){alert('Stockage impossible (quota ou permission). '+e.message)}});
byId('docFilter').addEventListener('input',renderDocs);byId('docRefresh').addEventListener('click',renderDocs);
renderDocs();
})();
