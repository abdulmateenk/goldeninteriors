
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const R=n=>'Rs. '+n.toLocaleString('en-US');
const byId=id=>P.find(x=>x.id==id);
const med=(x,i=0,alt)=>x.photo?`<img src="${x.photo}" alt="${alt==null?x.n:alt}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"><span class="fbs" style="display:none">${x.svg}</span>`:x.svg?x.svg:x.imgs?`<img src="${x.imgs[i]||x.imgs[0]||''}" alt="${alt==null?x.n:alt}">`:`<img src="${IM[x.im[i]]}" alt="${alt==null?x.n:alt}" ${x.pos?`style="object-position:${x.pos}"`:''}>`;
/* discounts created in the admin Discount page */
const DR=(()=>{try{return JSON.parse(localStorage.getItem('gi-discounts')||'[]')}catch(e){return[]}})();
const TODAY=(()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')})();
function dOf(x,p){let best=null;DR.forEach(r=>{if(!r.active||(r.start&&TODAY<r.start)||(r.end&&TODAY>r.end))return;
 const hit=r.scope=='products'?(r.products||[]).includes(x.id):(r.categories||[]).includes(x.c);if(!hit)return;
 const np=r.type=='percent'?Math.round(p*(1-r.value/100)):Math.max(1,Math.round(p-r.value));if(np<p&&(!best||np<best.p))best={p:np,r:r,off:r.type=='percent'?Math.round(r.value)+'%':'Rs. '+Math.round(r.value).toLocaleString('en-US')}});return best}
const card=(x,i=0)=>`<a class="pc" href="product.html?id=${x.id}" style="animation-delay:${i*50}ms"><div class="im">${x.tag?`<span class="tag">${dOf(x,x.p)?'−'+dOf(x,x.p).off:x.tag}</span>`:(dOf(x,x.p)?`<span class="tag">−${dOf(x,x.p).off}</span>`:'')}${med(x)}</div><h3 title="${x.n}" class="${x.n.length>34?'lg':''}">${x.n}</h3><p class="pr">${x.from?'From ':''}${dOf(x,x.p)?R(dOf(x,x.p).p)+`<s>${R(x.p)}</s>`:R(x.p)+(x.o?`<s>${R(x.o)}</s>`:'')}</p></a>`;
const cards=a=>a.map(card).join('');
const MN=document.querySelector('main');const PG=MN.dataset.page;let KEY=MN.dataset.key||'';
/* shared header, footer */
$('#logo').src=IM.logo;$('#flogo').src=IM.logo;
function nav(k){$('#catl').innerHTML=CATS.map(c=>`<li><a href="${c[2]}" ${c[0]==k?'class="on" aria-current="page"':''}>${c[1]}</a></li>`).join('')}
nav(PG=='home'?'home':KEY);

const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});$$('.rv').forEach(el=>io.observe(el));
$('#bg').onclick=()=>{const o=$('#cats').classList.toggle('show');$('#bg').setAttribute('aria-expanded',o)};
/* ---- search: matches names, categories, descriptions and SKUs; understands plurals and related words ---- */
const CATSYN={vases:'vase sculpture flower pot ceramic',clocks:'wall clock time watch',decor:'decor ornament stem pampas lamp light stool',bathsets:'bath soap dispenser toothbrush holder tumbler set',alarm:'alarm table desk clock bedside shelf time',candle:'candle holder stand tealight candlestick',trays:'tray serving platter decorative',figurines:'figurine statue sculpture figure animal'};
const stem=w=>w.length>3&&w.endsWith('s')?w.slice(0,-1):w;
const tok=s=>String(s).toLowerCase().replace(/[^a-z0-9\s]+/g,' ').split(/\s+/).filter(Boolean).map(stem);
const catKey=c=>Object.keys(SLUG).find(k=>k==c)?SLUG[c]:'';
function searchP(q){const qt=tok(q);if(!qt.length)return[];const raw=q.trim().toLowerCase();
 return P.map(x=>{const nm=tok(x.n),ct=tok(x.c+' '+(CATSYN[catKey(x.c)]||'')),ds=tok(x.d||''),sk=((x.custom&&x.custom.variants)||[]).map(v=>v.sku.toLowerCase()).join(' ');let sc=0;
  for(const t of qt){let s=0;if(nm.some(w=>w.startsWith(t)))s=10;else if(nm.some(w=>w.includes(t)))s=6;else if(ct.some(w=>w.startsWith(t)))s=5;else if(ds.some(w=>w.startsWith(t)))s=2;else if(sk.includes(raw))s=8;if(!s)return null;sc+=s}
  return{x,sc}}).filter(Boolean).sort((a,b)=>b.sc-a.sc).map(r=>r.x)}
function catMatches(q){const qt=tok(q);if(!qt.length)return[];return CATS.filter(c=>!['home','new'].includes(c[0])).filter(c=>{const w=tok(c[1]+' '+(CATSYN[c[0]]||''));return qt.every(t=>w.some(x=>x.startsWith(t)))})}
const h2=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function hl(t,q){const ws=tok(q).filter(w=>w.length>1);let o=h2(t);if(ws.length)o=o.replace(new RegExp('('+ws.map(w=>w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','ig'),'<mark>$1</mark>');return o}
function setMeta(n,c){let m=document.querySelector('meta[name="'+n+'"]');if(!m){m=document.createElement('meta');m.name=n;document.head.appendChild(m)}m.content=c}
{const sr=$('#sr'),si=$('#si'),sl=$('#sres');let act=-1;
 const opts=()=>[...sl.querySelectorAll('[role=option]')];
 function render(){const q=si.value.trim();act=-1;let h='';
  if(!q)h='<li class="sec" role="presentation">Popular</li>'+['vases','clocks','trays','candle'].map(k=>{const c=CATS.find(z=>z[0]==k);return`<li role="option"><a href="${c[2]}">${c[1]}</a></li>`}).join('');
  else{const cs=catMatches(q).slice(0,3),pr=searchP(q);
   if(cs.length)h+='<li class="sec" role="presentation">Collections</li>'+cs.map(c=>`<li role="option"><a href="${c[2]}">Browse all <b>${hl(c[1],q)}</b></a></li>`).join('');
   if(pr.length)h+='<li class="sec" role="presentation">Products</li>'+pr.slice(0,6).map(x=>`<li role="option"><a href="product.html?id=${x.id}"><span class="th">${med(x,0,'')}</span><span class="tx2"><b>${hl(x.n,q)}</b><small>${h2(x.c)} · ${x.from?'From ':''}${R(dOf(x,x.p)?dOf(x,x.p).p:x.p)}</small></span></a></li>`).join('')+`<li role="option"><a class="all" href="search.html?q=${encodeURIComponent(q)}">See all ${pr.length} result${pr.length>1?'s':''} for “${h2(q)}”</a></li>`;
   if(!cs.length&&!pr.length)h='<li class="none" role="presentation">No matches for “'+h2(q)+'”. Try “vase”, “tray” or “clock”.</li>'}
  sl.innerHTML=h;si.setAttribute('aria-expanded',h?'true':'false');opts().forEach((o,i)=>o.id='so'+i)}
 function mark(i){const o=opts();o.forEach(x=>x.classList.remove('on'));if(!o.length)return;act=(i+o.length)%o.length;o[act].classList.add('on');si.setAttribute('aria-activedescendant',o[act].id);o[act].scrollIntoView({block:'nearest'})}
 $('#sb').onclick=()=>{const o=sr.classList.toggle('o');if(o){si.focus();render()}};
 si.oninput=render;si.onfocus=render;
 si.onkeydown=e=>{if(e.key=='ArrowDown'){e.preventDefault();mark(act+1)}else if(e.key=='ArrowUp'){e.preventDefault();mark(act-1)}else if(e.key=='Enter'&&act>=0){e.preventDefault();location.href=opts()[act].querySelector('a').href}};
 $('#sf').onsubmit=e=>{e.preventDefault();const q=si.value.trim();if(q)location.href='search.html?q='+encodeURIComponent(q)};
 document.addEventListener('click',e=>{if(sr.classList.contains('o')&&!e.target.closest('#sr')&&!e.target.closest('#sb'))sr.classList.remove('o')})}
/* edits made to the sample products from the admin Products page */
try{const ov=JSON.parse(localStorage.getItem('gi-overrides')||'{}');P.slice().forEach(x=>{const o=ov[x.id];if(!o)return;
 if(o.hidden){[P,NA,CK].forEach(a=>{const i=a.indexOf(x);if(i>-1)a.splice(i,1)});return}
 if(o.name)x.n=o.name;if(o.price)x.p=o.price;if('compareAt' in o)x.o=o.compareAt||null;if('tag' in o)x.tag=o.tag||'';if(o.description)x.d=o.description;if(o.material!=null)x.mat=o.material;if(o.dimensions)x.dim=o.dimensions;if(o.stock!=null)x.stk=o.stock;if(Array.isArray(o.showOn)){x.show=o.showOn;if(o.showOn.includes('new')&&!NA.includes(x))NA.unshift(x);if(o.showOn.includes('clocks')&&!CK.includes(x))CK.push(x)}})}catch(e){}
/* products added from the admin area (kept in this browser until a backend is connected) */
try{(JSON.parse(localStorage.getItem('gi-products')||'[]')).forEach(c=>{const x={id:c.id,n:c.name,c:c.category,p:c.price,o:c.compareAt||null,tag:c.tag||'',imgs:c.images,d:c.description,dim:c.dimensions,sd:c.sizeDims,mat:c.material,care:c.care,custom:c,from:!!(c.variants&&new Set(c.variants.map(v=>v.price)).size>1)};x.show=Array.isArray(c.showOn)?c.showOn:(x.tag=='New'?['new']:[]).concat(x.c=='Wall Clocks'?['clocks']:[],x.o?['sale']:[]);P.push(x);if(x.c=='Wall Clocks'||x.show.includes('clocks'))CK.push(x);if(x.show.includes('new')||(!Array.isArray(c.showOn)&&x.tag=='New'))NA.unshift(x)})}catch(e){}
const SW=(a)=>a.map(v=>({label:v[0],swatch:v[1],color:v[2]}));
function optionsFor(x){const r=optionsFor0(x);return x.photo?r.filter(q=>q.name!='Frame'):r}
function optionsFor0(x){
 const IMG=(vals,idx)=>vals.map((v,i)=>Object.assign(v,{image:idx[i]}));
 if(x.c=='Vases')return[{name:'Finish',type:'swatch',values:IMG(SW([['Ivory','#E8E2D4'],['Sage','#9FB3A4'],['Charcoal','#3A3F3C']]),[0,1,3])},{name:'Size',type:'button',values:IMG([{label:'Small'},{label:'Medium'},{label:'Large'}],[0,1,2])}];
 if(x.c=='Wall Clocks')return[{name:'Frame',type:'swatch',values:SW([['Gold','#A67C2E','#A67C2E'],['Black','#1B1B1A','#1B1B1A'],['Walnut','#6B4A2B','#6B4A2B'],['Silver','#B7B7B2','#B7B7B2']])},{name:'Size',type:'button',values:[{label:'Small'},{label:'Medium'},{label:'Large'}]}];
 if(x.id=='helix-floor-lamp')return[{name:'Finish',type:'swatch',values:IMG(SW([['Black','#2A2A28'],['Gold','#A67C2E']]),[0,1])},{name:'Light',type:'button',values:IMG([{label:'Warm white 3000K'},{label:'Cool white 4000K'}],[0,2])}];
 if(x.id=='tub-armchair')return[{name:'Fabric',type:'swatch',values:IMG(SW([['Grey','#8A8478'],['Beige','#D8CDB8'],['Olive','#7C8160']]),[0,1,2])}];
 if(x.id=='woven-stool')return[{name:'Size',type:'button',values:IMG([{label:'Small'},{label:'Medium'},{label:'Large'}],[0,1,2])}];
 return[{name:'Bundle',type:'button',values:IMG([{label:'12 stems'},{label:'24 stems'}],[0,2])},{name:'Colour',type:'swatch',values:IMG(SW([['Natural','#CDA06A'],['Bleached','#E9DFC9']]),[0,1])}]}
function clockViews(a,color){const s=clk(Object.assign({},a,{fr:color||a.fr||'#A67C2E'}));const inner=s.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 return[s,s.replace('viewBox="0 0 200 200"','viewBox="45 45 110 110"'),`<svg viewBox="0 0 400 400" aria-hidden="true"><rect width="400" height="400" fill="#EAE5D9"/><rect y="318" width="400" height="82" fill="#CFC4AE"/><ellipse cx="200" cy="238" rx="96" ry="10" fill="#000" opacity=".08"/><g transform="translate(112 60) scale(.88)">${inner}</g><rect x="120" y="300" width="160" height="14" fill="#8C7650"/><rect x="132" y="314" width="8" height="40" fill="#8C7650"/><rect x="260" y="314" width="8" height="40" fill="#8C7650"/></svg>`]}
function localProduct(id){const x=P.find(p=>p.id==id);if(!x)return null;
 if(x.custom){const c=x.custom;return{id:c.id,name:c.name,category:c.category,price:c.price,compareAt:c.compareAt||null,tag:c.tag||'',description:c.description,pos:'',options:c.options||[],variants:c.variants||[],dimensions:c.dimensions||[],sizeDims:c.sizeDims||{},material:c.material,care:c.care,careGuide:GUIDE[GBY[x.id]||GROUP[x.c]]||null,stock:c.stock,images:c.images}}
 const o={id:x.id,name:x.n,category:x.c,price:x.p,compareAt:x.o||null,tag:x.tag||'',description:x.d,pos:x.pos||'',options:optionsFor(x),dimensions:x.dim,material:x.mat,care:x.care,careGuide:GUIDE[GBY[x.id]||GROUP[x.c]]||null,stock:x.stk!=null?x.stk:24};
 if(x.photo){o.images=[x.photo,x.photo2,x.photo3].filter(Boolean)}else if(x.svg&&x.a){const ph=x.photo?[x.photo].concat(x.photo2?[x.photo2]:[]):[];o.images=ph.concat(clockViews(x.a));o.recolor=c=>ph.concat(clockViews(x.a,c))}else if(x.svg){o.images=[x.svg]}else o.images=x.im.map(k=>IM[k]);return o}
/* ---- BACKEND HOOKS ----
   Set API_BASE to your server (e.g. 'https://api.goldeninteriors.pk/v1') and these calls go to it.
   Left empty, the site uses the sample products above. See backend-integration.md for the JSON shapes. */
const GI={API_BASE:'',EMAIL_ON:false /* set to true after the /api/order email function is deployed */,
 async getProduct(id){if(GI.API_BASE){try{const r=await fetch(GI.API_BASE+'/products/'+encodeURIComponent(id));if(r.ok)return await r.json()}catch(e){}}return localProduct(id)},
 async addToCart(line){if(GI.API_BASE){try{await fetch(GI.API_BASE+'/cart/items',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(line)})}catch(e){}}},
 emailOrder(o){if(!GI.EMAIL_ON||!/^https?:$/.test(location.protocol))return Promise.resolve(null);const c=new AbortController();setTimeout(()=>c.abort(),20000);return fetch('/api/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o),signal:c.signal}).then(r=>r.ok?r.json():null).catch(()=>null)},
 async placeOrder(o){if(GI.API_BASE){try{const r=await fetch(GI.API_BASE+'/orders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(o)});if(r.ok)return await r.json()}catch(e){}}return null},
 async checkout(lines){if(GI.API_BASE){try{const r=await fetch(GI.API_BASE+'/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:lines})});const j=await r.json();if(j&&j.url){location.href=j.url;return true}}catch(e){}}return false},
 async wishlist(id,on){if(GI.API_BASE){try{await fetch(GI.API_BASE+'/wishlist/'+encodeURIComponent(id),{method:on?'POST':'DELETE'})}catch(e){}}}};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),2200)}
/* cart (remembered across pages when the browser allows) */
let cart=[];try{cart=JSON.parse(localStorage.getItem('gi-cart')||'[]').filter(l=>l.sku&&byId(l.id))}catch(e){}
const save=()=>{try{localStorage.setItem('gi-cart',JSON.stringify(cart))}catch(e){}};
function renderC(){const n=cart.reduce((a,b)=>a+b.q,0);$('#cn').textContent=n;
 $('#items').innerHTML=cart.length?cart.map((l,i)=>{const x=byId(l.id);return`<div class="it"><a class="t" href="product.html?id=${x.id}">${med(x,0,'')}</a><div><b>${x.n}</b><br><span class="mut">${Object.values(l.sel||{}).join(' · ')}${l.sel&&Object.keys(l.sel).length?' · ':''}Qty ${l.q}</span><br><button data-r="${i}">Remove</button></div><span>${R(l.price*l.q)}</span></div>`}).join(''):'<p class="mut" style="padding:20px 0">Your cart is empty. Pick something from the collection.</p>';
 $('#st').textContent=R(cart.reduce((a,l)=>a+l.price*l.q,0))}
$('#items').onclick=e=>{const r=e.target.dataset.r;if(r!=null){cart.splice(+r,1);save();renderC()}};
$('#cb').onclick=()=>document.body.classList.add('co');
$('#cx').onclick=$('#ov').onclick=()=>document.body.classList.remove('co');
addEventListener('keydown',e=>{if(e.key=='Escape'){document.body.classList.remove('co');$('#sr').classList.remove('o')}});
$('#co').onclick=()=>{if(!cart.length){toast('Your cart is empty');return}location.href='checkout.html'};
renderC();
/* notification bar */
{const m=$$('.am');let k=0;if(m.length>1)setInterval(()=>{m[k].classList.remove('on');k=(k+1)%m.length;m[k].classList.add('on')},4000)}
/* HOME */
if(PG=='home'){
 
 const onHome=k=>{const ok=x=>x.show.includes(k)||(k=='sale'&&dOf(x,x.p));return P.filter(x=>x.custom&&ok(x)).reverse().concat(P.filter(x=>!x.custom&&ok(x)))};
 $('#g-new').innerHTML=cards(onHome('new').slice(0,8));$('#g-clocks').innerHTML=cards(onHome('clocks').slice(0,8));
 [['featured','g-feat']].forEach(([k,g])=>{const l=onHome(k).slice(0,8);if(l.length){$('#'+g).innerHTML=cards(l)}else $('#'+g).closest('section').style.display='none'});
 const COLL=[['Vases','vases','s2'],['Decor & Ornaments','decor','deco'],['Wall Clocks','clocks','ck3'],['New Arrival','new','s1']];
 $('#ct').innerHTML=COLL.map(c=>`<a class="cd" href="${FILE[c[1]]}" aria-label="${c[0]}">${c[2]?`<img src="${IM[c[2]]}" alt="">`:`<div class="cs">${med(CK[2],0,"")}</div>`}<span>${c[0]}<i>Shop →</i></span></a>`).join('')+onHome('explore').map(x=>`<a class="cd" href="product.html?id=${x.id}" aria-label="${x.n}"><div class="cs" style="padding:0">${med(x,0,'')}</div><span>${x.n}<i>Shop →</i></span></a>`).join('');
 let SL=null;try{SL=JSON.parse(localStorage.getItem('gi-slides')||'null')}catch(e){}
 if(!Array.isArray(SL))SL=SLD_DEF;SL=SL.map(z=>z.layout=='clocks'?Object.assign({},z,{layout:'text',image:'IM:ck3o'}):z);SL=SL.filter(z=>z.active!==false);
 const sImg=v=>v&&v.startsWith('IM:')?IM[v.slice(3)]:(v||'');
 $('#tr').innerHTML=SL.map(z=>{const im=sImg(z.image),t=h2(z.title||''),lk=z.link?h2(z.link):'';
  if(z.layout=='image')return`<a class="sd" ${lk?`href="${lk}"`:''} aria-label="${t}"><img class="bg" src="${im}" alt="${t}"></a>`;
  const rt=z.layout=='clocks'?`<div class="rt">${CK[0].svg+CK[2].svg+CK[3].svg}</div>`:(im?`<div class="rt" style="background-image:url('${im}');${z.image=='IM:ck3o'?'background-position:50% 20%':''}"></div>`:'');
  return`<div class="sd ${z.layout=='clocks'?'s3':'s2'}">${rt}<div class="tx"><small>Golden Interiors</small><h2>${t}</h2>${z.subtitle?`<p>${h2(z.subtitle)}</p>`:''}${z.button&&lk?`<a class="sb" href="${lk}" style="background:var(--gold)">${h2(z.button)}</a>`:''}</div></div>`}).join('');
 const tr=$('#tr'),N=Math.max(SL.length,1);let si=0,st;
 if(!SL.length)$('#sl').style.display='none';
 function slide(i){si=(i+N)%N;tr.style.transform=`translateX(-${si*100}%)`}
 function auto(){clearInterval(st);st=setInterval(()=>slide(si+1),5500)}
 let tx=null;$('#sl').addEventListener('touchstart',e=>tx=e.touches[0].clientX,{passive:true});
 $('#sl').addEventListener('touchend',e=>{if(tx==null)return;const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>40){slide(si+(d<0?1:-1));auto()}tx=null});
 $('#sl').onmouseenter=()=>clearInterval(st);$('#sl').onmouseleave=auto;slide(0);auto();
 const ct=$('#ct'),step=()=>ct.querySelector('.cd').offsetWidth+22;
 $('#cp').onclick=()=>ct.scrollBy({left:-step(),behavior:'smooth'});
 $('#cx2').onclick=()=>{ct.scrollLeft+ct.clientWidth>=ct.scrollWidth-4?ct.scrollTo({left:0,behavior:'smooth'}):ct.scrollBy({left:step(),behavior:'smooth'})};
 setInterval(()=>{if(!ct.matches(':hover'))$('#cx2').click()},4500);
 /* featured product + two category tiles */
 {const fx=onHome('featured')[0]||P.find(x=>x.c=='Vases')||P[0];
  if(fx){$('#feat1').style.display='';
   const ph=fx.photo?[fx.photo,fx.photo2,fx.photo3].filter(Boolean):null,n=ph?ph.length:(fx.im?fx.im.length:(fx.imgs?fx.imgs.length:1));
   const view=i=>ph?`<img src="${ph[i]}" alt="${h2(fx.n)}">`:med(fx,i,fx.n);
   $('#f1c').innerHTML=n>1?[...Array(Math.min(n,4))].map((_,i)=>`<button aria-label="Photo ${i+1}" aria-pressed="${i==0}" data-i="${i}">${view(i)}</button>`).join(''):'';
   $('#f1m').innerHTML=view(0);
   $('#f1c').onclick=e=>{const b=e.target.closest('button');if(!b)return;$('#f1m').innerHTML=view(+b.dataset.i);$$('#f1c button').forEach(k=>k.setAttribute('aria-pressed',k==b))};
   $('#f1cat').textContent=fx.c;$('#f1n').textContent=fx.n;
   const dd=dOf(fx,fx.p);$('#f1p').innerHTML=(fx.from?'From ':'')+(dd?R(dd.p)+`<s>${R(fx.p)}</s>`:R(fx.p)+(fx.o?`<s>${R(fx.o)}</s>`:''));
   $('#f1d').textContent=fx.d||'';
   $('#f1a').href=$('#f1b').href='product.html?id='+fx.id+'#opts';
   $('#f1b').textContent='Buy it now'}}
 ['#g-new','#g-feat','#g-clocks'].forEach(s=>{const g=$(s);if(!g)return;const w=document.createElement('div');w.className='gw';g.parentNode.insertBefore(w,g);w.appendChild(g);
  const mk=(c,t,d)=>{const b=document.createElement('button');b.className='cb '+c+' gb';b.type='button';b.setAttribute('aria-label',d>0?'Next products':'Previous products');b.textContent=t;b.onclick=()=>{const c0=g.querySelector('.pc');if(!c0)return;const st=c0.offsetWidth+14;d>0&&g.scrollLeft+g.clientWidth>=g.scrollWidth-4?g.scrollTo({left:0,behavior:'smooth'}):g.scrollBy({left:d*st,behavior:'smooth'})};w.appendChild(b)};mk('p','‹',-1);mk('n','›',1)});
 [['#t-v','Vases','Elegant Vases & more'],['#t-f','Figurines','Statement Pieces']].forEach(([s,c,t])=>{const p=P.find(x=>x.c==c);$(s).innerHTML=(p?med(p,0,''):`<img src="${IM.deco}" alt="">`)+`<span>${t}<i>Shop ${c} →</i></span>`});
}
/* CATEGORY PAGE */
if(PG=='list'){const L=LIST[KEY];$('#lt').textContent=L[0];$('#ls').textContent=L[1];const a=L[2]();
 $('#g-lst').innerHTML=a.length?cards(a):'<div class="empty"><h2>New pieces are on their way</h2><p class="mut">We are adding products to this collection. Browse our other collections in the meantime.</p><a class="btn" href="new-arrival.html" style="display:inline-block;margin-top:18px">Shop New Arrival</a></div>';
 $('#chips').innerHTML=CATS.filter(c=>c[0]!='home').map(c=>`<a href="${c[2]}" ${c[0]==KEY?'class="on"':''}>${c[1]}</a>`).join('');
 $('#cr').textContent=L[0]}
/* PRODUCT PAGE */
if(PG=='product'){(async()=>{
 const id=new URLSearchParams(location.search).get('id')||location.hash.replace('#','');const x=await GI.getProduct(id);
 if(!x){$('#pbox').innerHTML='<div class="lh"><h1>Product not found</h1><p class="mut" style="margin-top:10px"><a href="index.html" style="color:var(--gold)">Back to home</a></p></div>';return}
 KEY=SLUG[x.category]||'new';nav(KEY);document.title=x.name+' | '+x.category+' | Golden Interiors';
 const SZ=['One size','Small','Medium','Large'],V=Array.isArray(x.variants)?x.variants:[],VM=V.length>0;
 let ix=0,qty=1,views=x.images;const sel={};
 const isSvg=s=>s.trim().startsWith('<svg');
 const pic=(s,i)=>isSvg(s)?s:`<img src="${s}" alt="${x.name} photo ${i+1}" ${i==0&&x.pos?`style="object-position:${x.pos}"`:''}>`;
 const uniq=a=>[...new Set(a)];const nn=v=>v!=null&&v!=='';
 const lowV=VM?V.reduce((a,v)=>v.price<a.price?v:a,V[0]):null;
 const hasSizes=VM&&V.some(v=>v.size);const needSize=hasSizes&&new Set(V.map(v=>v.price)).size>1;
 /* variant mode: size and colour options come from the variant list (each variant has its own price, compare price, stock and SKU) */
 function buildOpts(){if(!VM)return x.options||[];const o=[];
  const sizes=uniq(V.map(v=>v.size).filter(Boolean)).sort((a,b)=>SZ.indexOf(a)-SZ.indexOf(b));
  if(sizes.length)o.push({name:'Size',type:'button',values:sizes.map(s=>({label:s,image:(V.find(v=>v.size==s)||{}).sizeImage,out:V.filter(v=>v.size==s).every(v=>v.stock<=0)}))});
  if(sizes.length&&!sel.Size)return o;
  const inSize=v=>!sizes.length||v.size==sel.Size;const cs=uniq(V.filter(v=>v.colour&&inSize(v)).map(v=>v.colour));
  if(cs.length)o.push({name:'Colour',type:'swatch',values:cs.map(c=>{const v=V.find(w=>w.colour==c&&inSize(w));return{label:c,swatch:v.swatch,image:v.colourImage,out:v.stock<=0}})});return o}
 let OPTS=[];
 function fixSel(){for(let k=0;k<2;k++){OPTS=buildOpts();OPTS.forEach(o=>{if(o.name=='Size'&&needSize&&!sel.Size)return;if(!o.values.find(v=>v.label==sel[o.name]))sel[o.name]=(o.values.find(v=>!v.out)||o.values[0]).label})}}
 if(!VM)(x.options||[]).forEach(o=>sel[o.name]=o.values[0].label);
 fixSel();
 const cur=()=>{if(!VM)return null;if(needSize&&!sel.Size)return null;return V.find(v=>(v.size||'')==(sel.Size||'')&&(v.colour||'')==(sel.Colour||''))||null};
 const startsFrom=()=>VM&&needSize&&!cur();
 const val=o=>o.values.find(v=>v.label==sel[o.name])||o.values[0];
 const rawPrice=()=>{const v=cur();if(v)return v.price;if(VM)return lowV.price;return x.price+OPTS.reduce((a,o)=>a+((val(o)||{}).priceDelta||0),0)};
 const dNow=()=>dOf({id:x.id,c:x.category},rawPrice());
 const price=()=>{const d=dNow();return d?d.p:rawPrice()};
 const cmp=()=>{if(dNow())return rawPrice();const v=cur();if(v)return v.compareAt||null;if(VM)return lowV.compareAt||null;return x.compareAt?x.compareAt+price()-x.price:null};
 const stockN=()=>{const v=cur();if(v)return v.stock;if(VM)return V.reduce((a,w)=>a+w.stock,0);return x.stock==null?20:x.stock};
 const sku=()=>{const v=cur();return v?v.sku:x.id+(OPTS.length?'-':'')+OPTS.map(o=>sel[o.name].toLowerCase().replace(/[^a-z0-9]+/g,'')).join('-')};
 const maxQ=()=>Math.max(1,Math.min(20,stockN()));
 $('#cc').innerHTML=`<a href="${FILE[KEY]}">${x.category}</a>`;$('#cn2').textContent=x.name;
 $('#cat').textContent=x.category;$('#pn').textContent=x.name;$('#pd').textContent=x.description;
 const SDm=x.sizeDims||{},SDk=['Small','Medium','Large'].filter(z=>SDm[z]&&(SDm[z].height||SDm[z].width));
 function drawDim(){const ex=(x.dimensions||[]).map(d=>`<tr><th>${d[0]}</th><td>${d[1]}</td></tr>`).join('');
  const sz=SDk.length?`<table class="dm sz"><thead><tr><th>Size</th><th>Height</th><th>Width</th></tr></thead><tbody>${SDk.map(z=>`<tr class="${sel.Size==z?'cur':''}"><th>${z}</th><td>${esc2(SDm[z].height)||'—'}</td><td>${esc2(SDm[z].width)||'—'}</td></tr>`).join('')}</tbody></table>`:'';
  $('#dim').outerHTML=`<div id="dim">${sz}${ex?`<table class="dm">${ex}</table>`:''}${!sz&&!ex?'<p class="mut" style="margin-top:10px">Dimensions coming soon.</p>':''}</div>`}
 const esc2=t=>String(t||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const grp=GBY[x.id]||GROUP[x.category],guide=x.careGuide||GUIDE[grp];
 $('#mc').innerHTML=`<h4>Material</h4><p>${x.material||'—'}</p>`+(guide?`<h4>Care guide${grp?' · '+grp:''}</h4><ul class="cg">${guide.map(g=>`<li><b>${g[0]}:</b> ${g[1]}</li>`).join('')}</ul>`:'')+(x.care?`<h4>${guide?'Extra notes':'Care'}</h4><p>${x.care}</p>`:'');
 function drawOpts(){$('#opts').innerHTML=OPTS.map((o,oi)=>`<div class="opt"><p class="ol">${o.name}: <b>${sel[o.name]||'Select'}</b></p><div class="${o.type=='swatch'?'sw':'bt'}" role="group" aria-label="${o.name}">${o.values.map((v,vi)=>o.type=='swatch'?`<button aria-label="${v.label}${v.out?' (sold out)':''}" title="${v.label}${v.out?' (sold out)':''}" aria-pressed="${v.label==sel[o.name]}" class="${v.out?'out':''}" data-o="${oi}" data-v="${vi}" style="background:${v.swatch}"></button>`:`<button aria-pressed="${v.label==sel[o.name]}" class="${v.out?'out':''}" title="${v.out?'Sold out':''}" data-o="${oi}" data-v="${vi}">${v.label}</button>`).join('')}</div></div>`).join('')+(startsFrom()?'<p class="hint">Select a size to see its colours, price and stock.</p>':'')}
 function draw(){OPTS=buildOpts();drawDim();ix=Math.min(ix,views.length-1);$('#main').innerHTML=pic(views[ix],ix);
  $('#thumbs').innerHTML=views.length>1?views.map((s,i)=>`<button aria-label="View photo ${i+1}" aria-pressed="${i==ix}" data-i="${i}">${pic(s,i)}</button>`).join(''):'';
  $$('.ga').forEach(b=>b.style.display=views.length>1?'block':'none');
  const c=cmp();$('#pp').innerHTML=(startsFrom()?'<span class="from">Starts from</span> ':'')+R(price())+(c&&c>price()?`<s>${R(c)}</s>`:'')+(dNow()?`<span class="dbadge">−${dNow().off} off</span>`:'');
  const n=stockN(),st=$('#stk');st.textContent=n<=0?'Out of stock':(n<=5?`Only ${n} left`:'In stock');st.className='stock'+(n<=0?' out':n<=5?' low':'');
  $('#add').disabled=$('#buy').disabled=n<=0;if(qty>maxQ())qty=maxQ();$('#q').value=qty;$('#q').max=maxQ();
  drawOpts()}
 draw();
 $('#opts').onclick=e=>{const b=e.target.closest('button');if(!b)return;{const er=$('#serr');if(er)er.remove()}const o=OPTS[+b.dataset.o],v=o.values[+b.dataset.v];sel[o.name]=v.label;
  if(VM&&o.name=='Size')fixSel();
  if(v.color&&x.recolor)views=x.recolor(v.color);if(nn(v.image))ix=Math.min(+v.image,views.length-1);draw()};
 $('#thumbs').onclick=e=>{const b=e.target.closest('button');if(b){ix=+b.dataset.i;draw()}};
 const step=d=>{ix=(ix+d+views.length)%views.length;draw()};$('#gp').onclick=()=>step(-1);$('#gn').onclick=()=>step(1);
 const mn=$('#main');mn.addEventListener('mousemove',e=>{const im=mn.querySelector('img');if(!im)return;const r=mn.getBoundingClientRect();im.style.transformOrigin=((e.clientX-r.left)/r.width*100)+'% '+((e.clientY-r.top)/r.height*100)+'%'});
 const q=$('#q');const setQ=n=>{qty=Math.max(1,Math.min(maxQ(),n||1));q.value=qty};
 $('#m1').onclick=()=>setQ(qty-1);$('#p1').onclick=()=>setQ(qty+1);q.onchange=()=>setQ(parseInt(q.value));
 const sizeMsg=()=>{let e=$('#serr');if(!e){e=document.createElement('p');e.id='serr';e.className='serr';e.setAttribute('role','alert');$('.cta2').before(e)}e.textContent='Please choose a size above, then press the button again.';$('#opts').classList.add('shake');setTimeout(()=>$('#opts').classList.remove('shake'),600)};
 async function add(){if(startsFrom()){toast('Please select a size first');sizeMsg();$('#opts').scrollIntoView({block:'center',behavior:'smooth'});return false}
  const line={sku:sku(),id:x.id,name:x.name,sel:Object.assign({},sel),price:price(),q:qty};const f=cart.find(l=>l.sku==line.sku);f?f.q=Math.min(99,f.q+qty):cart.push(line);save();renderC();await GI.addToCart(line);const b=$('#cn');b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),300);return true}
 $('#add').onclick=async()=>{if(await add())document.body.classList.add('co')};
 $('#buy').onclick=async()=>{if(await add())location.href='checkout.html'};
 const wl=()=>{try{return JSON.parse(localStorage.getItem('gi-wish')||'[]')}catch(e){return[]}};
 const hr=$('#hrt');hr.setAttribute('aria-pressed',wl().includes(x.id));
 hr.onclick=()=>{let l=wl();const on=!l.includes(x.id);l=on?l.concat(x.id):l.filter(k=>k!=x.id);try{localStorage.setItem('gi-wish',JSON.stringify(l))}catch(e){}hr.setAttribute('aria-pressed',on);GI.wishlist(x.id,on);toast(on?'Saved to your wishlist':'Removed from your wishlist')};
 $('#rel').innerHTML=cards(P.filter(y=>y.id!=x.id&&y.c==x.category).concat(P.filter(y=>y.id!=x.id&&y.c!=x.category)).slice(0,4));
 $('#morecat').innerHTML=CATS.filter(c=>c[0]!='home'&&c[0]!=KEY).map(c=>({c,p:P.find(y=>y.c==c[1])||P.find(y=>(SLUG[y.c]||'')==c[0])})).sort((a,b)=>!!b.p-!!a.p).slice(0,4).map((r,i)=>`<a href="${r.c[2]}" aria-label="${h2(r.c[1])}">${r.p?med(r.p,0,''):`<img src="${IM[['s1','s2','s3','deco'][i%4]]}" alt="">`}<span>${h2(r.c[1])}</span></a>`).join('');
 /* SEO: description and product structured data */
 setMeta('description',(x.name+'. '+(x.description||'')).slice(0,155));
 {const u='https://goldeninteriors.pk/product.html?id='+encodeURIComponent(x.id);let cl=document.querySelector('link[rel=canonical]');if(!cl){cl=document.createElement('link');cl.rel='canonical';document.head.appendChild(cl)}cl.href=u;
  [['og:title',document.title],['og:description',(x.description||'').slice(0,155)],['og:url',u]].forEach(([p,v])=>{let m=document.querySelector('meta[property="'+p+'"]');if(m)m.content=v});}
 const lowP=lowV?lowV.price:x.price,highP=lowV?Math.max(...V.map(v=>v.price)):x.price,inStock=(VM?V.reduce((a,w)=>a+w.stock,0):(x.stock==null?1:x.stock))>0;
 const ld={'@context':'https://schema.org','@type':'Product',name:x.name,description:x.description,sku:VM?V[0].sku:x.id,category:x.category,brand:{'@type':'Brand',name:'Golden Interiors'},
  offers:lowP!=highP?{'@type':'AggregateOffer',priceCurrency:'PKR',lowPrice:String(lowP),highPrice:String(highP),offerCount:V.length,availability:'https://schema.org/'+(inStock?'InStock':'OutOfStock')}:{'@type':'Offer',priceCurrency:'PKR',price:String(lowP),availability:'https://schema.org/'+(inStock?'InStock':'OutOfStock'),url:location.href}};
 const web=(x.images||[]).filter(s=>/^https?:/.test(s));if(web.length)ld.image=web;
 const sc=document.createElement('script');sc.type='application/ld+json';sc.textContent=JSON.stringify(ld);document.head.appendChild(sc);
})()}
/* header height for sticky blocks */
{const T=document.querySelector('.top');const hh=()=>{if(!T)return;const m=T.querySelector('.cats.show');document.documentElement.style.setProperty('--hh',(T.offsetHeight-(m?m.offsetHeight:0))+'px')};hh();addEventListener('resize',hh);addEventListener('load',hh);try{document.fonts.ready.then(hh)}catch(e){}try{new ResizeObserver(hh).observe(T)}catch(e){}}
/* CHECKOUT PAGE */
if(PG=='checkout'){
 const ST=(()=>{try{return JSON.parse(localStorage.getItem('gi-settings')||'{}')}catch(e){return{}}})();
 const DEL=Object.assign({karachi:400,other:600},ST.delivery||{}),BK=Object.assign({title:'',bank:'',number:'',iban:'',note:''},ST.bank||{});
 const WA='03312523286';
 const rows=()=>cart.map(l=>({l,x:byId(l.id)||{id:l.id,n:l.name||'Product',svg:'<svg viewBox="0 0 10 10"><rect width="10" height="10" fill="#eee"/></svg>'}}));
 const sub=()=>rows().reduce((a,r)=>a+r.l.price*r.l.q,0);
 const isKhi=c=>/^\s*karachi\s*$/i.test(c);
 const fee=c=>c.trim()?(isKhi(c)?DEL.karachi:DEL.other):null;
 const vname=l=>Object.values(l.sel||{}).filter(Boolean).join(' · ');
 const err=(id,m)=>{const e=$('#e-'+id);if(e)e.textContent=m||'';const i=$('#'+id);if(i)i.classList.toggle('bad',!!m)};
 function bankHtml(){const l=[['Account title',BK.title],['Bank',BK.bank],['Account number',BK.number],['IBAN',BK.iban]].filter(r=>r[1]);
  return l.length?`<dl class="bk">${l.map(r=>`<div><dt>${r[0]}</dt><dd>${h2(r[1])}</dd></div>`).join('')}</dl>${BK.note?`<p class="mut">${h2(BK.note)}</p>`:''}<p class="mut">After you transfer, send the receipt on WhatsApp ${WA} with your order number.</p>`:`<p class="mut">Our bank account details will be shown here.</p>`}
 function summary(){const r=rows(),c=$('#city')?$('#city').value:'',f=fee(c);
  $('#sl3').innerHTML=r.map(({l,x})=>`<div class="si"><div class="sp">${med(x,0,'')}<b>${l.q}</b></div><div class="sn"><span>${h2(x.n)}${vname(l)?' – '+h2(vname(l)):''}</span>${l.q>1?`<small>Qty ${l.q} × ${R(l.price)}</small>`:''}</div><span class="sx">${R(l.price*l.q)}</span></div>`).join('');
  $('#s-del').textContent=f==null?'Enter your city':R(f);$('#s-del-n').textContent=f==null?'':'– '+(c.trim().replace(/\b\w/g,m=>m.toUpperCase()));$('#s-tot').textContent=R(sub()+(f||0))}
 function showBank(){const b=document.querySelector('input[name=pay]:checked').value=='Bank transfer';$('#bkb').style.display=b?'block':'none';$('#bkb .in').innerHTML=bankHtml();$$('.po').forEach(o=>o.classList.toggle('on',o.querySelector('input').checked))}
 function init(){
  if(!rows().length){$('#cg').style.display='none';$('#empty').style.display='block';return}
  $('#cg').style.display='grid';$('#empty').style.display='none';$('#dnote').textContent='Delivery: Karachi '+R(DEL.karachi)+', outside Karachi '+R(DEL.other)+'.';summary();showBank();
  $('#cf').addEventListener('input',e=>{if(e.target.id=='city')summary();if(e.target.id)err(e.target.id,'')});
  $('#cf').addEventListener('change',e=>{if(e.target.name=='pay')showBank()});
  $('#place').onclick=place;$('#place2').onclick=place}
 async function place(){try{await place2()}catch(e){console.error(e);$('#place').disabled=false;$('#place2').disabled=false;$('#place').textContent='Place order';toast('Something went wrong. Please try again.')}}
 async function place2(){
  const v=id=>$('#'+id).value.trim(),ph=v('phone').replace(/[\s-]/g,'');let bad=null;
  const chk=(id,ok,m)=>{if(!ok){err(id,m);bad=bad||id}else err(id,'')};
  chk('name',v('name').length>=2,'Enter your full name.');
  chk('phone',/^\+?\d{10,13}$/.test(ph),'Enter a valid phone number, for example 03XX XXXXXXX.');
  if(v('email'))chk('email',/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email')),'Enter a valid email address or leave it empty.');
  chk('addr',v('addr').length>=6,'Enter your address: flat or house, street number and landmark.');
  chk('city',v('city').length>=2,'Enter your city.');
  if(bad){const el=$('#'+bad);el.scrollIntoView({block:'center',behavior:'smooth'});el.focus({preventScroll:true});return}
  const pay=document.querySelector('input[name=pay]:checked').value,f=fee(v('city')),items=rows().map(({l,x})=>({name:x.n+(vname(l)?' – '+vname(l):''),qty:l.q,price:l.price,sku:l.sku,id:l.id}));
  const num=a=>{try{return JSON.parse(localStorage.getItem(a)||'[]')}catch(e){return[]}};
  const ids=num('gi-orders').concat(num('gi-orders-new')).map(o=>parseInt(String(o.id).replace(/\D/g,''))||0);
  const order={id:'GI-'+(Math.max(1000,...ids)+1),date:new Date().toISOString().slice(0,10),customer:v('name'),phone:v('phone'),email:v('email'),city:v('city').replace(/\b\w/g,c=>c.toUpperCase()),address:v('addr'),notes:v('notes'),items,delivery:f,payment:pay,status:'Pending'};
  $('#place').disabled=true;$('#place2').disabled=true;$('#place').textContent='Placing order…';
  await GI.placeOrder(order);const mailP=GI.emailOrder(order);
  try{const nw=num('gi-orders-new');nw.unshift(order);localStorage.setItem('gi-orders-new',JSON.stringify(nw))}catch(e){}
  /* take the quantities out of the stock of products added from the admin area */
  try{const pr=num('gi-products');let ch=false;items.forEach(i=>{const c=pr.find(p=>p.id==i.id);if(!c||!c.variants)return;const vv=c.variants.find(w=>w.sku==i.sku);if(vv){vv.stock=Math.max(0,vv.stock-i.qty);c.stock=c.variants.reduce((a,w)=>a+w.stock,0);ch=true}});if(ch)localStorage.setItem('gi-products',JSON.stringify(pr))}catch(e){}
  const tot=items.reduce((a,i)=>a+i.price*i.qty,0)+f;
  cart=[];save();renderC();
  $('#cg').style.display='none';const d=$('#done');d.style.display='block';
  d.innerHTML=`<div class="ok3"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.500"/></svg></div><h2>Thank you, ${h2(order.customer.split(' ')[0])}!</h2><p class="mut">Your order <b>${order.id}</b> has been placed. It will be processed and delivered within 3 to 5 days. We will call you on ${h2(order.phone)} to confirm.</p>
  <div class="cbx" style="text-align:left;margin-top:26px"><h3>Order summary</h3>${items.map(i=>`<div class="si" style="grid-template-columns:1fr auto"><div class="sn"><span>${h2(i.name)}</span><small>Qty ${i.qty}</small></div><span class="sx">${R(i.price*i.qty)}</span></div>`).join('')}
  <div class="tl"><span>Delivery Charges – ${h2(order.city)}</span><span>${R(f)}</span></div><div class="tl big"><span>Sub-Total</span><span>${R(tot)}</span></div>
  <p class="mut" style="margin-top:12px">Payment: <b>${pay}</b><br>Delivering to: ${h2(order.address)}, ${h2(order.city)}</p>
  ${pay=='Bank transfer'?`<div class="bkb" style="display:block;margin-top:14px"><h4>Please transfer ${R(tot)} to</h4>${bankHtml()}</div>`:''}</div>
  <p class="mut" id="mailnote" style="margin-top:16px"></p><a class="btn" href="index.html" style="display:inline-block;margin-top:22px">Continue shopping</a>`;scrollTo({top:0,behavior:'smooth'});
  mailP.then(j=>{const n=$('#mailnote');if(n&&j&&j.customerEmailed)n.textContent='We have also emailed your order confirmation to '+order.email+'.'})}
 init()}
/* SEARCH RESULTS PAGE */
if(PG=='search'){const q=(new URLSearchParams(location.search).get('q')||'').trim();$('#si').value=q;const r=q?searchP(q):[];
 const t=q?`Search results for “${q}”`:'All products';$('#st').textContent=t;document.title=`${q?'Search: '+q:'Search'} | Golden Interiors`;
 $('#sc').textContent=q?(r.length?`${r.length} product${r.length>1?'s':''} found`:'No products found.'):'Browse the whole collection.';
 const list=q?r:P;$('#g-s').innerHTML=cards(list);
 if(q&&!r.length)$('#nores').innerHTML='<p class="mut">Try a simpler word such as “vase”, “tray” or “clock”, or browse a collection:</p><div class="chips">'+CATS.filter(c=>!['home','new'].includes(c[0])).map(c=>`<a href="${c[2]}">${c[1]}</a>`).join('')+'</div>'}

/* shrink long card titles to fit one line */
(function(){let t;const fit=()=>{return;document.querySelectorAll('.pc h3').forEach(h=>{h.style.fontSize='';let f=parseFloat(getComputedStyle(h).fontSize);while(h.scrollWidth>h.clientWidth+1&&f>14){f-=.5;h.style.fontSize=f+'px'}})};
 const go=()=>{clearTimeout(t);t=setTimeout(fit,40)};new MutationObserver(go).observe(document.body,{childList:true,subtree:true});addEventListener('resize',go);addEventListener('load',go);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(go);go()})();

/* newsletter */
(function(){const f=document.getElementById('nl');if(!f)return;f.addEventListener('submit',async e=>{e.preventDefault();const i=document.getElementById('nle'),m=document.getElementById('nlm'),v=i.value.trim();
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){m.style.color='#e58a7e';m.textContent='Please enter a valid email address.';return}
 try{const l=JSON.parse(localStorage.getItem('gi-subs')||'[]');if(!l.some(s=>s.email==v)){l.push({email:v,date:new Date().toISOString().slice(0,10)});localStorage.setItem('gi-subs',JSON.stringify(l))}}catch(e){}
 try{if(GI.API_BASE)await fetch(GI.API_BASE+'/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v})})}catch(e){}
 i.value='';m.style.color='#F6CC66';m.textContent='Thank you for subscribing.'})})();

/* footer quick links + their pages */
(function(){const L=()=>{try{const l=JSON.parse(localStorage.getItem('gi-links')||'null');return Array.isArray(l)?l:LINKS_DEF}catch(e){return LINKS_DEF}};
 const e2=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 const ql=document.getElementById('ql');if(ql)ql.innerHTML=L().filter(z=>z.active!==false).map(z=>`<li><a href="policies.html?id=${encodeURIComponent(z.id)}">${e2(z.title)}</a></li>`).join('');
 const pb=document.getElementById('plb');if(pb){const id=new URLSearchParams(location.search).get('id'),z=L().find(x=>x.id==id)||L().filter(x=>x.active!==false)[0];
  if(!z){document.getElementById('plt').textContent='Page not found';document.getElementById('plc').textContent='Not found'}
  else{document.title=z.title+' | Golden Interiors';document.getElementById('plt').textContent=z.title;document.getElementById('plc').textContent=z.title;
   pb.innerHTML=String(z.content||'').split(/\n\s*\n/).map(p=>`<p>${e2(p.trim()).replace(/\n/g,'<br>')}</p>`).join('')}}})();
