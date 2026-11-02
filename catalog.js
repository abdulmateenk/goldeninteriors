/* clock art */
function clk(o){const{sh='c',fr='#A67C2E',fc='#fff',tk='#1B1B1A',hd='#1B1B1A',ray=0,ro=0}=o;
 const cx=100,cy=100,rx=sh=='o'?72:86,ry=sh=='o'?90:86;let b='';
 if(sh=='a')b=`<path d="M14 190V90a86 86 0 0 1 172 0v100z" fill="${fr}"/><path d="M24 182V90a76 76 0 0 1 152 0v92z" fill="${fc}"/>`;
 else b=`<ellipse cx="100" cy="100" rx="${rx}" ry="${ry}" fill="${fr}"/><ellipse cx="100" cy="100" rx="${rx-9}" ry="${ry-9}" fill="${fc}"/>`;
 const c=sh=='a'?[100,118]:[100,100];let t='',r='';
 for(let i=0;i<12;i++){const a=i*Math.PI/6,l=i%3?5:10,R=sh=='a'?62:(sh=='o'?60:68),Ry=sh=='o'?78:R;
  const x1=c[0]+Math.sin(a)*R,y1=c[1]-Math.cos(a)*(sh=='o'?Ry:R),x2=c[0]+Math.sin(a)*(R-l),y2=c[1]-Math.cos(a)*((sh=='o'?Ry:R)-l);
  if(sh=='a'&&Math.cos(a)>.2&&Math.abs(Math.sin(a))<.9&&false)continue;
  t+=`<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${tk}" stroke-width="${i%3?1.6:3}"/>`}
 if(ray)for(let i=0;i<24;i++){const a=i*Math.PI/12;r+=`<path d="M${c[0]} ${c[1]}L${(c[0]+Math.sin(a)*70).toFixed(1)} ${(c[1]-Math.cos(a)*70).toFixed(1)}" stroke="${fr}" stroke-opacity=".35" stroke-width="2"/>`}
 if(ro)r+=`<circle cx="${c[0]}" cy="${c[1]}" r="52" fill="none" stroke="${fr}" stroke-opacity=".4"/>`;
 return `<svg viewBox="0 0 200 200" aria-hidden="true">${b}${r}${t}<path d="M${c[0]} ${c[1]}V${c[1]-38}" stroke="${hd}" stroke-width="4" stroke-linecap="round"/><path d="M${c[0]} ${c[1]}l24 14" stroke="${hd}" stroke-width="3" stroke-linecap="round"/><circle cx="${c[0]}" cy="${c[1]}" r="4.5" fill="${fr}"/></svg>`}
const CK=[
{id:'aurum-round-clock',n:'Birch Round Wall Clock',p:14500,o:17500,tag:'Sale',a:{fr:'#A67C2E'},d:'A classic round wall clock in a light wood frame with a clean white face and a small bird accent.',s:'Diameter 23.5 in. Silent quartz movement. 1 AA battery, not included.'},
{id:'noir-minimal-clock',n:'Linea Minimal Wall Clock',p:11500,a:{fr:'#1B1B1A',fc:'#F5F3EF',hd:'#A67C2E'},d:'A slim bronze rim around a soft pale face. Quiet and understated.',s:'Diameter 19.5 in. Silent quartz movement. Metal frame.'},
{id:'sunburst-clock',n:'Sunburst Gold Clock',p:21500,tag:'New',a:{fr:'#B8892F',fc:'#F6EBCF',ray:1},d:'A warm sunburst face with fine rays radiating from the centre.',s:'Diameter 27.5 in. Silent quartz movement. Brushed metal.'},
{id:'arch-wall-clock',n:'Arch Statement Clock',p:18500,tag:'New',a:{sh:'a',fr:'#A67C2E',fc:'#fff'},d:'An arched silhouette that suits modern and traditional rooms alike.',s:'Height 25.5 in. Width 17.5 in. Silent quartz movement.'},
{id:'oval-brass-clock',n:'Oval Brass Wall Clock',p:16500,a:{sh:'o',fr:'#C49A3F',fc:'#fff'},d:'A tall oval clock with a polished brass rim.',s:'Height 27.5 in. Width 20.5 in. Silent quartz movement.'},
{id:'walnut-ring-clock',n:'Walnut Ring Clock',p:13500,o:15500,tag:'Sale',a:{fr:'#6B4A2B',fc:'#F2EAD9',hd:'#6B4A2B'},d:'A walnut-toned wooden ring with a warm cream face.',s:'Diameter 21.5 in. Solid wood frame. Silent quartz movement.'},
{id:'sage-ring-clock',n:'Sage Linen Clock',p:12500,a:{fr:'#7F9484',fc:'#F3F1EA',ro:1,hd:'#3E4A41'},d:'A muted sage frame with a soft linen-look face.',s:'Diameter 19.5 in. Silent quartz movement.'},
{id:'grand-gold-clock',n:'Grand Gold Wall Clock',p:27500,a:{fr:'#D1A64A',fc:'#FBF6E8',ro:1},d:'An oversized statement clock with a double gold ring and a fine ivory dial.',s:'Diameter 35.5 in. Silent quartz movement. Metal frame.'}
].map(x=>({id:x.id,n:x.n,c:'Wall Clocks',p:x.p,o:x.o,tag:x.tag,d:x.d,s:x.s,a:x.a,svg:clk(x.a)}));
const NA=[
{id:'two-tone-floor-vase',n:'Two-Tone Glazed Floor Vase',c:'Vases',p:24500,o:29500,tag:'Sale',im:['s1'],d:'A tall glazed ceramic vase with a saffron top and a speckled stone base. Shown with dried pampas stems.',s:'Height 29.5 in. Opening 5.5 in. Glazed ceramic. Stems not included.'},
{id:'dried-pampas-stems',n:'Dried Pampas Stems',c:'Decor & Ornaments',p:3500,im:['s1p','s1'],d:'Long, soft dried stems that add height and texture to any floor vase.',s:'Bundle of 12. Length 35.5 in. Naturally dried, so colour varies.'},
{id:'ivory-floor-vase',n:'Ivory Sculpted Floor Vase',c:'Vases',p:18500,tag:'New',im:['s2v','s2'],d:'A tall matte vase with a narrow neck and a soft, hand-finished glaze.',s:'Height 31.5 in. Diameter 11 in. Matte ceramic. Branches not included.'},
{id:'chevron-vase-trio',n:'Chevron Vase Trio',c:'Vases',p:38000,o:44000,tag:'Sale',im:['s3'],pos:'50% 72%',d:'Three carved chevron vases in graduated sizes, finished in matte white. Display them together as a group.',s:'Set of 3. Heights 35, 60 and 31.5 in. Matte ceramic.'},
{id:'chevron-floor-vase',n:'Chevron Floor Vase',c:'Vases',p:16500,im:['s3l','s3'],d:'A large floor vase with a carved chevron pattern and a narrow neck, in matte white.',s:'Height 31.5 in. Diameter 15 in. Matte ceramic.'},
{id:'helix-floor-lamp',n:'Helix LED Floor Lamp',c:'Decor & Ornaments',p:29500,tag:'New',im:['s4'],pos:'62% 50%',d:'A twisting LED floor lamp with a warm, even glow. Switch it on and off with the foot pedal.',s:'Height 59 in. LED 3000K. Foot switch included. Metal frame.'},
{id:'tub-armchair',n:'Linen Tub Armchair',c:'Decor & Ornaments',p:46000,im:['s4c','s4'],d:'A rounded armchair in warm grey linen with slim walnut-tone legs. Includes a textured cushion.',s:'Width 30.5 in. Seat height 16.5 in. Linen blend, solid wood legs.'},
{id:'woven-stool',n:'Woven Rattan Stool',c:'Decor & Ornaments',p:12500,im:['s4w','s4'],pos:'80% 70%',d:'A handwoven rattan stool that works as a side table or a plant stand.',s:'Height 15 in. Diameter 14 in. Natural rattan.'}];
const P=NA.concat(CK);
let CATS=[['home','Home','/'],['new','New Arrival','new-arrival'],['bathsets','Bathsets','bathsets'],['alarm','Alarm & Table Clocks','alarm-table-clocks'],['decor','Decor & Ornaments','decor-ornaments'],['candle','Candle Stands','candle-stands'],['clocks','Wall Clocks','wall-clocks'],['trays','Trays','trays'],['vases','Vases','vases'],['figurines','Figurines','figurines']];
const LIST={new:['New Arrival','Our latest pieces.',()=>NA],bathsets:['Bathsets','Matching sets for a calm, finished bathroom.',()=>P.filter(x=>x.c=='Bathsets')],alarm:['Alarm & Table Clocks','Desk, bedside and shelf clocks.',()=>P.filter(x=>x.c=='Alarm & Table Clocks')],candle:['Candle Stands','Holders and stands for candles and tealights.',()=>P.filter(x=>x.c=='Candle Stands')],trays:['Trays','Serving and decorative trays.',()=>P.filter(x=>x.c=='Trays')],figurines:['Figurines','Sculpted figures and statement pieces.',()=>P.filter(x=>x.c=='Figurines')],clocks:['Wall Clocks','Timepieces that finish a wall.',()=>CK],decor:['Decor & Ornaments','Finishing touches for every corner.',()=>P.filter(x=>x.c=='Decor & Ornaments')],vases:['Vases','Floor vases and sculpted ceramics.',()=>P.filter(x=>x.c=='Vases')]};
const SLD_DEF=[{id:'d1',layout:'image',image:'IM:hero',title:'Golden Interiors New Arrival',link:'new-arrival',active:true},{id:'d2',layout:'text',image:'IM:deco',title:'Decor & Ornaments',subtitle:'Sculpted vases, dried stems and finishing touches for every corner.',button:'Shop now',link:'decor-ornaments',active:true},{id:'d3',layout:'text',image:'IM:ck3o',title:'Wall Clocks',subtitle:'Quiet, elegant timepieces that finish a wall.',button:'Shop now',link:'wall-clocks',active:true}];
CK.forEach(x=>{const m={'walnut-ring-clock':['ck1','ck1b'],'noir-minimal-clock':['ck2','ck2b'],'aurum-round-clock':['ck3','ck3b']}[x.id];if(m){x.photo=IM[m[0]];x.photo2=IM[m[1]];x.photo3=IM[m[0].replace(/b?$/,'')+'o']}});
[...CK].forEach(x=>{if(!x.photo){CK.splice(CK.indexOf(x),1);const i=P.indexOf(x);if(i>-1)P.splice(i,1)}else x.svg=''});
const FILE=Object.fromEntries(CATS.map(c=>[c[0],c[2]]));
const SLUG={'Bathsets':'bathsets','Alarm & Table Clocks':'alarm','Decor & Ornaments':'decor','Candle Stands':'candle','Wall Clocks':'clocks','Trays':'trays','Vases':'vases','Figurines':'figurines'};
const GUIDE={'Vases & Sculptures':[['Cleaning','Wipe with a soft, dry cloth.'],['Water use','For ceramic vases, ensure they are glazed before adding water. For resin, use for dry flowers only.'],['Handling','Always lift from the base; do not pick up sculptures by delicate limbs or thin parts.']],
'Lamps & Lighting':[['Safety','Always unplug before cleaning.'],['Shades','Use a lint roller or soft brush to remove dust from fabric shades.'],['Bulbs','Use the recommended wattage to prevent overheating the fixture.']],
'Wall Art':[['Placement','Hang away from direct sunlight to prevent fading.'],['Glass','Use a streak-free glass cleaner on a cloth (never spray directly onto the frame).'],['Canvas','Dust lightly with a clean, dry feather duster.']],
'Decorative Books':[['Storage','Keep in a cool, dry place away from humidity.'],['Care','Dust the spine and edges regularly to prevent buildup.']]};
const GROUP={'Vases':'Vases & Sculptures','Decor & Ornaments':'Vases & Sculptures','Figurines':'Vases & Sculptures','Wall Clocks':'Wall Art'};
const GBY={'helix-floor-lamp':'Lamps & Lighting'};
/* ---- product extras: gallery images, dimensions, material and care ---- */
const CKDIM={'aurum-round-clock':[['Diameter','23.5 in'],['Depth','1.5 in'],['Weight','1.2 kg']],'noir-minimal-clock':[['Diameter','19.5 in'],['Depth','1.5 in'],['Weight','0.9 kg']],'sunburst-clock':[['Diameter','27.5 in'],['Depth','2 in'],['Weight','1.6 kg']],'arch-wall-clock':[['Height','25.5 in'],['Width','17.5 in'],['Depth','1.5 in'],['Weight','1.3 kg']],'oval-brass-clock':[['Height','27.5 in'],['Width','20.5 in'],['Depth','1.5 in'],['Weight','1.4 kg']],'walnut-ring-clock':[['Diameter','21.5 in'],['Depth','2 in'],['Weight','1.5 kg']],'sage-ring-clock':[['Diameter','19.5 in'],['Depth','1.5 in'],['Weight','1.0 kg']],'grand-gold-clock':[['Diameter','35.5 in'],['Depth','2 in'],['Weight','2.4 kg']]};
const CARE={Vases:'Wipe with a soft, damp cloth. Avoid abrasive cleaners and keep away from direct heat. Not dishwasher safe.','Wall Clocks':'Dust with a soft, dry cloth. Do not use water or cleaners on the face. Replace the battery when the clock slows.',Lighting:'Switch off and unplug before cleaning. Wipe with a dry microfibre cloth.',Furniture:'Dust regularly. Spot clean spills straight away with a damp cloth and keep out of direct sunlight.','Decor & Ornaments':'Dust gently with a dry cloth and keep away from moisture.'};
const EX={
'two-tone-floor-vase':{im:['s1','s1v','s1r','s1t'],dim:[['Height','29.5 in'],['Opening','5.5 in'],['Widest diameter','12.5 in'],['Weight','4.5 kg']],mat:'Glazed ceramic with a speckled stone-effect base.'},
'dried-pampas-stems':{im:['s1p','s1t','s1','s1r'],dim:[['Length','35.5 in'],['Stems per bundle','12'],['Bundle width','10 in']],mat:'Naturally dried pampas grass.',care:'Keep dry and out of direct sunlight to hold the colour. Shake gently to remove dust. Do not spray with water.'},
'ivory-floor-vase':{im:['s2v','s2b','s2','s2m'],dim:[['Height','31.5 in'],['Diameter','11 in'],['Opening','4.5 in'],['Weight','5.2 kg']],mat:'Matte ceramic with a hand-finished glaze.'},
'chevron-vase-trio':{im:['s3','s3t','s3b','s3d'],dim:[['Large vase','31.5 in high'],['Medium vase','23.5 in high'],['Small vase','14 in high'],['Set weight','14 kg']],mat:'Matte white ceramic with a carved chevron pattern.'},
'chevron-floor-vase':{im:['s3l','s3d','s3b','s3'],dim:[['Height','31.5 in'],['Diameter','15 in'],['Opening','4.5 in'],['Weight','7 kg']],mat:'Matte white ceramic with a carved chevron pattern.'},
'helix-floor-lamp':{im:['s4','s4t','s4f','s4p'],dim:[['Height','59 in'],['Base diameter','11 in'],['Cable length','2 m'],['Weight','4 kg']],mat:'Powder-coated metal frame with an integrated LED strip.'},
'tub-armchair':{im:['s4c','s4k','s4','s4p'],dim:[['Width','30.5 in'],['Depth','29 in'],['Height','31.5 in'],['Seat height','16.5 in']],mat:'Linen-blend upholstery on a solid wood frame with slim wooden legs.',care:'Vacuum gently. Spot clean with a damp cloth. Keep away from direct sunlight.'},
'woven-stool':{im:['s4w','s4p','s4','s4f'],dim:[['Height','15 in'],['Diameter','14 in'],['Weight','2.2 kg']],mat:'Handwoven natural rattan.',care:'Dust with a dry cloth. Wipe spills straight away and let it air dry. Keep it dry and out of the sun.'}};
P.forEach(x=>{const e=EX[x.id]||{};if(e.im)x.im=e.im;x.dim=e.dim||CKDIM[x.id]||[];x.mat=e.mat||(x.c=='Wall Clocks'?'Metal or wood frame with a glass-covered face and silent quartz movement.':'');x.care=e.care||(GROUP[x.c]?'':(CARE[x.c]||''))});
/* where each product appears on the landing page */
P.forEach(x=>{x.show=(NA.includes(x)?['new']:[]).concat(CK.includes(x)?['clocks']:[],x.o?['sale']:[])});

/* footer quick links (managed in Admin > Quick Links, saved in localStorage key gi-links) */
const LINKS_DEF=[
{id:'shipping',title:'Shipping Policies',active:true,content:'Orders are processed and delivered within 3 to 5 days. Delivery within Karachi is Rs. 400 and delivery outside Karachi is Rs. 600. We confirm every order by phone before it is dispatched, so please give a phone number that is reachable.\n\nYou can pay by cash on delivery, or by bank transfer to our account and send us the receipt on WhatsApp with your order number.'},
{id:'terms',title:'Terms and Conditions',active:true,content:'By placing an order you confirm that the details you give are correct. Prices are in Pakistani rupees and may change without notice. Colours can look slightly different on different screens. We may cancel an order if an item is out of stock, and we will tell you if that happens.'}];

/* header categories managed from the admin (saved on the server, cached in this browser) */
const BASECATS=CATS.slice();
const SUBS={};
const CFG=(()=>{try{const a=JSON.parse(localStorage.getItem('gi-cats')||'null');return Array.isArray(a)&&a.length?a:null}catch(e){return null}})();
if(CFG){const base=Object.fromEntries(BASECATS.map(c=>[c[0],c]));
 CATS=[BASECATS[0]].concat(CFG.filter(c=>c&&c.key&&c.name).map(c=>{const b=base[c.key];SUBS[c.key]=(Array.isArray(c.sub)?c.sub:[]).filter(s=>s&&s.name&&s.url);return[c.key,String(c.name),b?b[2]:'category?c='+c.key,c.value||'']}))}
CATS.forEach(c=>{if(c[0]=='home')return;if(LIST[c[0]]){LIST[c[0]][0]=c[1];return}
 const v=c[3]||c[1];LIST[c[0]]=[c[1],'Browse our '+c[1]+' collection.',()=>P.filter(x=>x.c==v)];SLUG[v]=c[0]});
/* store-wide message shown on every product card (editable in Admin > Discount) */
const PROMO_DEF={on:true,text:'10% OFF on 30,000+ purchase (Applied at check out)'};
const PROMO=(()=>{try{const p=JSON.parse(localStorage.getItem('gi-promo')||'null');if(p&&typeof p==='object')return{on:!!p.on,text:String(p.text||'')}}catch(e){}return PROMO_DEF})();

/* automatic order discount at checkout (editable in Admin > Discount) */
const RULE_DEF={on:true,min:30000,pct:10};
const RULE=(()=>{try{const r=JSON.parse(localStorage.getItem('gi-rule')||'null');if(r&&typeof r==='object'&&r.min>0&&r.pct>0&&r.pct<100)return{on:!!r.on,min:+r.min,pct:+r.pct}}catch(e){}return RULE_DEF})();
const ruleOff=s=>RULE.on&&s>=RULE.min?Math.round(s*RULE.pct/100):0;
