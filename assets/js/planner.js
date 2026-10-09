/* ============================================================
   «Что посмотреть»: настоящая карта и составитель маршрута.
   Карта Leaflet, подложка OpenStreetMap, граница района из OSM.
   Километры и время считает код, бюджета нет (правка 86). Город старта можно ввести свой,
   он ищется по названию (в прототипе через поиск OpenStreetMap, на сайте через геокодер или ИИ).
   ============================================================ */
(function(){
"use strict";
const {$,$$,esc,nf,rub,ic}=A;
const root=$('#chto-posmotret'); if(!root) return;

const TYPE={}; D.types.forEach(t=>TYPE[t.id]=t);
const PL={}; D.places.forEach(p=>PL[p.id]=p);
/* на карте только места: события живут в календаре, а у каждого места одна метка (правка 87) */
const MP=D.places.filter(p=>p.t!=='event');
/* фильмы, снятые в месте: ссылка на фильм есть везде, где есть место (правка 89) */
const FILMS_OF=id=>D.films.filter(f=>(f.places||[]).includes(id));
const filmLinks=(id,cls='film-link')=>FILMS_OF(id).map(f=>`<a class="${cls}" href="filmy.html#${f.id}">${ic('play',13)}Фильм ${esc(f.n)}</a>`).join('');
const RAEVSKY=[54.0678,54.9421];
const hav=(a,b)=>{const r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;const x=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(x));};
const dist=(a,b)=>hav(a.ll,b.ll);
const nearest=(from,list)=>list.slice().sort((a,b)=>dist(from,a)-dist(from,b))[0];
const fmt=m=>{m=Math.round(m/5)*5;const h=Math.floor(m/60)%24,mm=m%60;return String(h).padStart(2,'0')+':'+String(mm).padStart(2,'0');};
const dur=m=>{m=Math.round(m/5)*5;const h=Math.floor(m/60),mm=m%60;return ((h?h+' ч':'')+(h&&mm?' ':'')+(mm?mm+' мин':''))||'0 мин';};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const dayWord=n=>n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'дня':'дней';
const S=A.state;
if(typeof S.days!=='number') S.days=parseInt(S.days)||1;

/* ---------- разметка ---------- */
root.innerHTML=`
  <div class="see-head"><h2>Что посмотреть</h2><p>Отметьте места на карте, и маршрут по времени соберётся сам</p></div>
  <div class="sent">Еду <span id="cFrom"></span> на <span id="cDays"></span> <span id="cWho"></span> <span id="cCar"></span></div>
  <div class="see-grid">
    <div class="mapcol">
      <div class="chips" id="flt" role="group" aria-label="Отбор мест на карте"></div>
      <div class="map" id="map" aria-label="Карта Альшеевского района с метками мест"></div>
      <details class="howto"><summary>Как пользоваться картой</summary><p>Наведите на метку, чтобы увидеть название, и нажмите на неё, чтобы открыть карточку места. Каждое место можно добавить в план один раз. Кнопка „+ В план“ добавляет место в маршрут. Пунктирная метка значит, что место скоро откроется. Карту можно двигать и приближать.</p></details>
    </div>
    <aside class="plan" id="plan" aria-live="polite"></aside>
  </div>
  <section class="exc-wrap" id="excWrap" hidden aria-label="Экскурсия по маршруту"><div class="exc" id="exc"><div class="exc-head"><h3>Экскурсия по маршруту</h3><button type="button" class="round" id="excClose" aria-label="Свернуть экскурсию">${ic('x',16)}</button></div><div class="exc-b"></div></div></section>`;

/* ---------- выпадающие списки с полем «свой вариант» ---------- */
function combo(host, o){
  host.className='combo';
  host.innerHTML=`<button type="button" class="pill" aria-haspopup="listbox" aria-expanded="false"><span></span>${ic('caret',14)}</button><div class="pop-list" role="listbox" hidden></div>`;
  const btn=$('.pill',host), list=$('.pop-list',host);
  const draw=()=>{
    list.innerHTML=o.options().map(op=>`<button type="button" role="option" data-v="${esc(op.v)}" aria-selected="${op.v===o.get()}">${esc(op.t)}</button>`).join('')+
      (o.custom?`<form class="own"><label>${esc(o.custom.label)}<input name="q" type="${o.custom.type||'text'}" ${o.custom.type==='number'?'min="1" max="14" inputmode="numeric"':''} placeholder="${esc(o.custom.ph)}" autocomplete="off"></label><button type="submit" class="btn dark">${esc(o.custom.btn)}</button><small class="own-msg" aria-live="polite"></small></form>`:'');
    $$('[data-v]',list).forEach(b=>b.addEventListener('click',()=>{o.set(b.dataset.v);close();}));
    const f=$('form',list); if(f) f.addEventListener('submit',async e=>{e.preventDefault();const v=f.q.value.trim();if(!v)return;const msg=$('.own-msg',f);msg.textContent=o.custom.wait||'';const ok=await o.custom.apply(v,msg);if(ok)close();});
  };
  const open=()=>{draw();list.hidden=false;btn.setAttribute('aria-expanded','true');document.addEventListener('click',outside,true);};
  const close=()=>{list.hidden=true;btn.setAttribute('aria-expanded','false');document.removeEventListener('click',outside,true);};
  const outside=e=>{if(!host.contains(e.target))close();};
  btn.addEventListener('click',()=>list.hidden?open():close());
  host.addEventListener('keydown',e=>{if(e.key==='Escape'){close();btn.focus();}});
  host.refresh=()=>{$('span',btn).textContent=o.label();};
  host.refresh();
  return host;
}
const WHO=[{v:'1',t:'один'},{v:'2',t:'вдвоём'},{v:'kids',t:'с детьми'},{v:'5',t:'компанией'}];
const CAR=[{v:'car',t:'на своей машине'},{v:'train',t:'на электричке'},{v:'bus',t:'на автобусе'}];
if(!CAR.some(c=>c.v===S.car)) S.car='car';
const cityOf=()=>typeof S.from==='object'&&S.from?S.from:(D.cities.find(c=>c.id===S.from)||D.cities[0]);
const cFrom=combo($('#cFrom'),{
  options:()=>D.cities.map(c=>({v:c.id,t:c.gen})), get:()=>typeof S.from==='string'?S.from:'', label:()=>cityOf().gen,
  set:v=>{S.from=v;changed();},
  custom:{label:'Свой город',ph:'например, Казань',btn:'Найти',wait:'Ищу город…',apply:async(q,msg)=>{
    try{
      const r=await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ru&countrycodes=ru,kz,by&q='+encodeURIComponent(q));
      const j=await r.json(); if(!j.length){msg.textContent='Не нашёл такой город, попробуйте написать иначе';return false;}
      const name=q.charAt(0).toUpperCase()+q.slice(1);
      S.from={id:'own',name,gen:'из города '+name,loc:'в городе '+name,ll:[+j[0].lat,+j[0].lon]}; changed(); return true;
    }catch(e){ msg.textContent='Поиск сейчас недоступен, выберите город из списка'; return false; }
  }}
});
const cDays=combo($('#cDays'),{
  options:()=>[1,2,3].map(n=>({v:String(n),t:n+' '+dayWord(n)})), get:()=>String(S.days), label:()=>S.days+' '+dayWord(S.days),
  set:v=>{S.days=+v;changed();},
  custom:{label:'Своё число дней',ph:'например, 5',btn:'Готово',type:'number',apply:async(q,msg)=>{const n=Math.round(+q);if(!(n>=1&&n<=14)){msg.textContent='Введите число от 1 до 14';return false;}S.days=n;changed();return true;}}
});
const cWho=combo($('#cWho'),{options:()=>WHO, get:()=>S.who, label:()=>(WHO.find(w=>w.v===S.who)||WHO[1]).t, set:v=>{S.who=v;changed();}});
const cCar=combo($('#cCar'),{options:()=>CAR, get:()=>S.car, label:()=>(CAR.find(w=>w.v===S.car)||CAR[0]).t, set:v=>{S.car=v;changed();}});
let excOn=false, excT=null;
function changed(){[cFrom,cDays,cWho,cCar].forEach(c=>c.refresh());excOn=false;render();}

/* ---------- карта ---------- */
const map=L.map('map',{zoomControl:true,scrollWheelZoom:false,attributionControl:true,minZoom:6,maxZoom:17});
A.baseLayer(map);
map.attributionControl.setPrefix(false);
L.control.scale({imperial:false,maxWidth:140}).addTo(map);
const B=window.ALSHEY_BOUNDARY;
L.polygon([[[85,-180],[85,180],[-85,180],[-85,-180]],B],{stroke:false,fillColor:'#F6F7F2',fillOpacity:.42,interactive:false}).addTo(map);
const district=L.polygon(B,{color:'#4E6B3A',weight:2.6,fill:false,interactive:false}).addTo(map);
map.fitBounds(district.getBounds(),{padding:[12,12]});
/* подсказка на карте (правка 100): пока карта «спит», колесо мыши листает страницу, а на телефоне
   один палец прокручивает страницу. Нажатие на карту или на подсказку будит карту, подсказка исчезает.
   Мышь ушла с карты или карта ушла с экрана: карта снова спит, подсказка появляется. */
const TOUCH=matchMedia('(hover:none) and (pointer:coarse)').matches;
const mapEl=map.getContainer();
const lock=document.createElement('button');
lock.type='button'; lock.className='map-lock';
lock.innerHTML=TOUCH
  ? `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V11m0-1a1.5 1.5 0 0 1 3 0v4.5c0 3.6-2.4 6.5-6 6.5-2.2 0-3.6-.9-4.9-2.6L4.3 15a1.6 1.6 0 0 1 2.4-2l2.3 2.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Нажмите, чтобы двигать карту</span>`
  : `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="6.5" y="3" width="11" height="18" rx="5.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 6.5v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Нажмите на карту или покрутите колёсико, чтобы приблизить</span>`;
mapEl.appendChild(lock);
L.DomEvent.disableClickPropagation(lock);
const wake=()=>{ map.scrollWheelZoom.enable(); if(TOUCH){ map.dragging.enable(); } mapEl.classList.add('awake'); };
const sleep=()=>{ map.scrollWheelZoom.disable(); if(TOUCH){ map.dragging.disable(); } mapEl.classList.remove('awake'); };
if(TOUCH) map.dragging.disable();
lock.addEventListener('click',wake);
map.on('click focus',wake);
/* пока мышь над картой, колесо работает только для карты: страница и всё остальное стоят на месте */
if(!TOUCH){
  mapEl.addEventListener('wheel',e=>{ e.preventDefault(); if(!mapEl.classList.contains('awake')){ wake(); } },{passive:false});
  mapEl.addEventListener('mouseleave',sleep);
}
else if('IntersectionObserver' in window) new IntersectionObserver(es=>es.forEach(e=>{ if(e.intersectionRatio<0.35) sleep(); }),{threshold:[0,0.35]}).observe(mapEl);

const CONEPIN='M14 1.6c1.1 0 1.8.6 2.4 1.7l9.4 19c.8 1.7-.3 3.4-2.2 3.4h-5.4L14 29.4l-4.2-3.7H4.4c-1.9 0-3-1.7-2.2-3.4l9.4-19c.6-1.1 1.3-1.7 2.4-1.7z';
const ICO={nature:'M3 19 9.5 8l4 6.5L16 11l5 8Z',museum:'M4 20h16M5.5 9.5h13M12 4l7.5 5h-15ZM7.5 10v8M12 10v8M16.5 10v8',sight:'M8.5 21 9.5 10h5l1 11M7.5 10h9M9.5 10V7l2.5-3 2.5 3v3',active:'M6 21V4M6 4.5h11l-2.2 3.8L17 12H6',cafe:'M7 3v7M5 3v4.5a2 2 0 0 0 4 0V3M7 10v11M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17',stay:'M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5',event:'M4 6h16v14H4ZM4 10.5h16M8.5 3v5M15.5 3v5'};
const pinSVG=(p,badge)=>{const soon=p.st==='soon';return `<svg viewBox="0 0 34 34" width="34" height="34" aria-hidden="true" focusable="false" overflow="visible">${badge?`<rect class="frame" x="-3" y="-3" width="40" height="40" rx="11" fill="#FFFDF7" stroke="#1F2B22" stroke-width="2.4"/>`:''}<g transform="translate(3 3)"${soon?' opacity=".75"':''}><path class="body" d="${CONEPIN}" fill="${TYPE[p.t].c}" stroke="#fff" stroke-width="1.6"${soon?' stroke-dasharray="3 2"':''}/><g transform="translate(9 12.6) scale(.42)"><path d="${ICO[p.t]}" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></g></g>${badge?`<g><circle cx="27" cy="8" r="7.5" fill="#1F2B22" stroke="#fff" stroke-width="1.5"/><text x="27" y="11.4" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="Tinos, Times New Roman, serif">${badge}</text></g>`:''}</svg>`;};
const markers={}, ANC={};
MP.forEach((p,i)=>{
  const k=MP.slice(0,i).filter(q=>hav(q.ll,p.ll)<0.3).length;
  ANC[p.id]=[17+(k?(k%2?-1:1)*15*Math.ceil(k/2):0),33];
  const m=L.marker(p.ll,{icon:L.divIcon({className:'pin',html:pinSVG(p,''),iconSize:[34,34],iconAnchor:ANC[p.id]}),title:p.n,keyboard:true,riseOnHover:true}).addTo(map);
  m.bindTooltip(p.n,{direction:'top',offset:[0,-30],className:'pin-tip',opacity:1});
  m.on('click',()=>{ m.closeTooltip(); wake(); showPop(p.id); });
  m.on('keypress',e=>{if(e.originalEvent.key==='Enter')showPop(p.id);});
  markers[p.id]=m;
});

/* ---------- фильтры ---------- */
let fType='all';
const flt=$('#flt');
flt.innerHTML=`<button type="button" class="chip" data-f="all" aria-pressed="true">Все места</button>`+D.types.filter(t=>t.id!=='event').map(t=>`<button type="button" class="chip" data-f="${t.id}" aria-pressed="false" style="--c:${t.c}"><i></i>${t.n}</button>`).join('');
flt.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  fType=b.dataset.f;$$('[data-f]',flt).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
  reapplyFilter(); hidePop();
});
function reapplyFilter(){MP.forEach(p=>{const off=fType!=='all'&&p.t!==fType;const el=markers[p.id].getElement();if(el)el.classList.toggle('dim',off);});}

/* ---------- карточка объекта ----------
   Открывается по нажатию на метку и закрывается крестиком или нажатием на карту.
   Описание спрятано под «Подробнее» (правка 71). Содержимое карточки собрано как узел страницы,
   поэтому кнопки не теряют обработчики, когда Leaflet пересчитывает размер карточки. */
let popId=null;
const pop=L.popup({className:'pop-leaf',closeButton:true,autoPan:true,autoPanPadding:[24,24],offset:[0,-30],maxWidth:270,minWidth:270});
function popHTML(p){
  const inR=A.inPlan(p.id), soon=p.st==='soon';
  const on = p.t==='stay' ? 'ночлег' : soon ? 'скоро' : `на месте ${dur(p.d)}`;
  const films=filmLinks(p.id);
  const btn = soon ? `<button class="btn" type="button" disabled>Скоро</button>` : `<button class="btn ${inR?'out':'dark'}" type="button" data-tog="${p.id}">${inR?'✓ В плане, убрать':'+ В план'}</button>`;
  const notes=[p.approx?'Точка на карте условная, координаты уточняем':'',p.demo?'Пример партнёра для прототипа':'',p.filler?'Описание временное, уточним по фактам':''].filter(Boolean);
  return `<div class="pop"><div class="im">${A.img((p.loc?[p.loc]:[]).concat(p.ph?[p.ph]:[]), p.sc, p.so, p.n)}</div><div class="b"><b>${esc(p.n)}</b>
    <span class="meta" style="--c:${TYPE[p.t].c}"><i></i><span>${TYPE[p.t].n} · ${on}${p.st==='near'?' · соседний район':''}</span></span>${films?`<span class="films">${films}</span>`:''}
    <div class="desc" hidden><p>${esc(p.txt)}</p>${p.emo?`<div class="emo"><span>Эмоции</span>${p.emo.map(e=>`<i>${esc(e)}</i>`).join('')}</div>`:''}${notes.map(n=>`<span class="note">${n}</span>`).join('')}</div>
    <div class="pop-acts">${btn}<button type="button" class="more" data-more aria-expanded="false">Подробнее</button></div></div></div>`;
}
function popNode(p){
  const t=document.createElement('template'); t.innerHTML=popHTML(p).trim(); const n=t.content.firstElementChild;
  const tog=n.querySelector('[data-tog]');
  if(tog) tog.addEventListener('click',e=>{ e.stopPropagation(); const added=A.toggle(tog.dataset.tog); A.toast(added?`«${p.n}» в плане. План справа от карты`:`«${p.n}» убрали из плана`); });
  const more=n.querySelector('[data-more]'), desc=n.querySelector('.desc');
  more.addEventListener('click',e=>{ e.stopPropagation(); desc.hidden=!desc.hidden; more.textContent=desc.hidden?'Подробнее':'Свернуть'; more.setAttribute('aria-expanded',String(!desc.hidden)); pop.update(); });
  n.querySelectorAll('img').forEach(i=>i.addEventListener('load',()=>pop.update(),{once:true}));
  return n;
}
function showPop(id){
  const open=popId===id&&map.hasLayer(pop), wasOpen=open&&!pop.getElement().querySelector('.desc').hidden;
  popId=id; pop.setLatLng(PL[id].ll).setContent(popNode(PL[id]));
  if(wasOpen){ const n=pop.getContent(); n.querySelector('.desc').hidden=false; const m=n.querySelector('[data-more]'); m.textContent='Свернуть'; m.setAttribute('aria-expanded','true'); }
  if(!map.hasLayer(pop)) pop.openOn(map); else pop.update();
}
function hidePop(){ map.closePopup(pop); popId=null; }
pop.on('remove',()=>{ popId=null; });
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popId)hidePop();});

/* ---------- расчёт плана ----------
   В плане только места, которые выбрал человек, каждое один раз (правка 87).
   Обеды, ночлеги и подсказки сами не подставляются, бюджета нет (правка 86).
   Места идут по порядку от ближнего к дальнему и делятся по дням, ночлег встаёт в конец дня. */
function params(){
  const who=S.who, city=cityOf(), people=who==='kids'?4:+who;
  const far=hav(city.ll,RAEVSKY)>600;
  return{city,far,start:far?{name:'Уфа',ll:D.ufa,gen:'из Уфы',loc:'в Уфе'}:city,days:Math.max(1,S.days|0),people,kids:who==='kids',mode:S.car};
}
const isPT=P=>P.mode==='train'||P.mode==='bus';
/* Яндекс Расписания из выбранного города: электрички из Уфы, поезда из других городов
   через станцию Раевка, автобусы до Раевского. Если прямых рейсов нет, Яндекс так и покажет. */
function raspLink(P){
  const from=encodeURIComponent(P.city.name), train=P.mode==='train';
  const kind=train?(P.city.id==='ufa'?'suburban':'train'):'bus';
  const to=encodeURIComponent(train?'Раевка':'Раевский');
  return {url:`https://rasp.yandex.ru/search/${kind}/?fromName=${from}&toName=${to}`,
    label:train?(P.city.id==='ufa'?`Расписание электричек ${P.city.gen} до Раевки`:`Поезда ${P.city.gen} до станции Раевка`):`Автобусы ${P.city.gen} до Раевского`};
}
function leg(a,b,P){const d=hav(a.ll,b.ll);const km=d*(d>40?1.25:1.3);const min=Math.round(km/(km>60?70:50)*60)+5+(P.kids?15:0);return{km,min};}
function order(list,start){const rest=list.slice(),out=[];let cur=start;while(rest.length){rest.sort((a,b)=>dist(cur,a)-dist(cur,b));cur=rest.shift();out.push(cur);}return out;}
function titleFor(sel){const out=[];sel.forEach(p=>{if(p.kw&&!['обед','ночлег'].includes(p.kw)&&!out.includes(p.kw))out.push(p.kw);});const t=out.slice(0,3);if(!t.length)return 'День в районе';return cap(t.length>1?t.slice(0,-1).join(', ')+' и '+t[t.length-1]:t[0]);}
function build(P){
  const sel=[...new Set(S.ids)].map(id=>PL[id]).filter(p=>p&&p.st!=='soon'&&p.t!=='event');
  const stays=sel.filter(p=>p.t==='stay'), rest=sel.filter(p=>p.t!=='stay');
  const home={id:'city',ll:P.start.ll}, T=isPT(P)?D.transit[P.mode]:null, hub=T?{id:'hub',ll:T.ll,n:T.station}:null;
  const N=P.days, ord=order(rest,hub||home), per=Math.ceil(ord.length/N)||1;
  const perDay=Array.from({length:N},(_,i)=>ord.slice(i*per,(i+1)*per));
  const rows=[], warn=[]; let km=0, t=P.far?9*60:8*60, cur=home;
  const go=p=>{const l=leg(cur,p,P);km+=l.km;t+=l.min;cur=p;return l;};
  rows.push({k:'start',t,h:P.far?'Старт в Уфе':'Выезд '+P.start.gen+(T?', '+T.n:'')});
  if(hub){const d=hav(home.ll,hub.ll)*1.2;km+=d;t+=Math.round(d/T.speed*60)+20;cur=hub;rows.push({k:'hub',t,h:'Приезд, '+T.station});}
  perDay.forEach((list,di)=>{
    if(di>0){rows.push({day:'День '+(di+1)});t=9*60+30;}
    list.forEach(p=>{const l=go(p);rows.push({k:'visit',p,t,l});t+=p.d||60;});
    stays.filter((s,i)=>Math.min(i,N-1)===di).forEach(s=>{const l=go(s);rows.push({k:'visit',p:s,t,l,night:true});});
  });
  if(hub){const l=leg(cur,hub,P);km+=l.km;t+=l.min;rows.push({k:'hub',t,h:'Отправление, '+T.station});const d=hav(hub.ll,home.ll)*1.2;km+=d;t+=Math.round(d/T.speed*60)+20;}
  else{const back=leg(cur,home,P);km+=back.km;t+=back.min;}
  rows.push({k:'end',t});
  if(P.far&&N===1)warn.push(`${cap(P.city.gen)} за один день не успеть. Выберите 2 дня или больше`);
  if(stays.length&&N===1)warn.push('В плане есть ночлег, а поездка на один день. Выберите 2 дня');
  if(hub)warn.push(`Время в пути примерное. Если прямых рейсов ${P.city.gen} нет, Яндекс Расписания покажут, где пересесть. Обычно удобнее всего через Уфу`);
  return{rows,km,title:titleFor(sel),warn,hub,T};
}

/* ---------- отрисовка плана ---------- */
const planEl=$('#plan'); let PLAN=null,PP=null;
const endName=P=>P.far?'Снова в Уфе':'Дома '+(P.start.loc||('в городе '+P.start.name));
function rowHTML(r){
  if(r.day) return `<li class="daylb caps">${r.day}</li>`;
  if(r.k==='start'||r.k==='hub') return `<li><time>${fmt(r.t)}</time><i class="d" style="--c:#8A948B"></i><b>${esc(r.h)}</b><span></span></li>`;
  if(r.k==='end') return `<li><time>${fmt(r.t)}</time><i class="d" style="--c:#8A948B"></i><b>${esc(endName(PP))}</b><span></span></li>`;
  const f=filmLinks(r.p.id,'film-link sm');
  return `<li><time>${fmt(r.t)}</time><i class="d n" style="--c:${TYPE[r.p.t].c}">${r.n}</i><b>${r.night?'Ночлег, ':''}${esc(r.p.n)}${f?`<span class="films">${f}</span>`:''}</b><button type="button" data-rm="${r.p.id}" aria-label="Убрать «${esc(r.p.n)}» из плана">×</button></li>`;
}
function yandex(plan,P){const pts=[P.start.ll].concat(plan.hub?[plan.hub.ll]:[]).concat(plan.rows.filter(r=>r.p).map(r=>r.p.ll)).concat(plan.hub?[plan.hub.ll]:[]).concat([P.start.ll]);return 'https://yandex.ru/maps/?rtext='+pts.map(ll=>ll[0].toFixed(6)+','+ll[1].toFixed(6)).join('~')+'&rtt='+(isPT(P)?'mt':'auto');}
function planText(plan,P){
  const who={1:'один',2:'вдвоём',4:'с детьми',5:'компанией'}[P.people]||'';
  const L=[`Поездка «${plan.title}»`,`Еду ${P.city.gen} на ${P.days} ${dayWord(P.days)}, ${who}, ${(CAR.find(c=>c.v===P.mode)||CAR[0]).t}`,''];
  plan.rows.forEach(r=>{ if(r.day){L.push('',r.day);return;}
    const n=r.k==='end'?endName(P):r.p?(r.night?'Ночлег, ':'')+r.p.n:r.h;
    L.push(`${fmt(r.t)}  ${n}`);
    if(r.p) FILMS_OF(r.p.id).forEach(f=>L.push(`       фильм ${f.n}: filmy.html#${f.id}`)); });
  if(plan.hub){ const r=raspLink(P); L.push('',`${r.label}: ${r.url}`); }
  L.push('',`Маршрут в Яндекс Картах ${yandex(plan,P)}`);
  return L.join('\n');
}
function render(){
  const P=params(); PP=P;
  A.save();
  S.ids=[...new Set(S.ids)].filter(id=>PL[id]&&PL[id].t!=='event');
  const sel=S.ids.filter(id=>PL[id].st!=='soon');
  MP.forEach(p=>markers[p.id].setIcon(L.divIcon({className:'pin',html:pinSVG(p,''),iconSize:[34,34],iconAnchor:ANC[p.id]})));
  if(!sel.length){
    PLAN=null; $('#excWrap').hidden=true;
    planEl.innerHTML=`<header><small class="caps muted">Ваш план · ${P.days} ${dayWord(P.days)}</small></header><p class="empty">Пока пусто. Нажмите на метку на карте, откроется карточка места с кнопкой „+ В план“</p>`;
    reapplyFilter(); if(popId)showPop(popId); return;
  }
  const plan=build(P); PLAN=plan;
  let n=0; plan.rows.forEach(r=>{if(r.k==='visit')r.n=++n;});
  plan.rows.forEach(r=>{ if(r.k==='visit') markers[r.p.id].setIcon(L.divIcon({className:'pin in',html:pinSVG(r.p,r.n),iconSize:[34,34],iconAnchor:ANC[r.p.id]})); });
  reapplyFilter();
  planEl.innerHTML=`<header><small class="caps muted">Ваш план · ${P.days} ${dayWord(P.days)} · мест ${sel.length}</small><h3>${esc(plan.title)}</h3></header>
    <ol class="stops">${plan.rows.map(rowHTML).join('')}</ol>
    ${plan.warn.map(w=>`<p class="warn">${w}</p>`).join('')}
    ${plan.hub?(()=>{const r=raspLink(P);return `<a class="btn rasp" href="${r.url}" target="_blank" rel="noopener">${ic('clock',17)}${esc(r.label)}${ic('ext',15)}</a>`;})():''}
    <div class="acts"><button class="btn" type="button" id="bCopy">${ic('copy',17)}<span>Скопировать план</span></button><a class="btn" id="bYa" href="${yandex(plan,P)}" target="_blank" rel="noopener">${ic('ext',17)}Открыть в Яндекс Картах</a><button class="btn wheat" type="button" id="bGen">${ic('spark',17)}Сгенерировать экскурсию</button></div>
`;
  $$('[data-rm]',planEl).forEach(b=>b.addEventListener('click',()=>A.toggle(b.dataset.rm)));
  $('#bCopy').addEventListener('click',copyPlan);
  $('#bGen').addEventListener('click',()=>excursion(true));
  if(excOn) excursion(false);
  if(popId) showPop(popId);
}
function copyPlan(){
  const b=$('#bCopy'),txt=planText(PLAN,PP);
  const fallback=()=>{let ta=$('.copybox',planEl);if(!ta){ta=document.createElement('textarea');ta.className='copybox';ta.readOnly=true;ta.setAttribute('aria-label','Текст плана');$('.acts',planEl).after(ta);}ta.value=txt;ta.focus();ta.select();};
  const done=()=>{$('span',b).textContent='План скопирован';setTimeout(()=>{if(b.isConnected)$('span',b).textContent='Скопировать план';},1800);};
  if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(txt).then(done,fallback); else fallback();
}
/* ---------- экскурсия по маршруту (правка 72) ----------
   В прототипе текст собирает код из проверенных карточек: описание места, герои фильмов,
   знаки маршрута по тамгам, советы и дорога между точками. Можно выбрать «Взрослым» или «Детям»
   и «Коротко» или «Подробно», послушать голосом браузера, скопировать и скачать.
   На сайте тот же набор карточек уйдёт на сервер, и текст напишет языковая модель (ТЗ 6.2). */
const EXO={who:'adult',len:'short'};
const plain=t=>String(t||'').replace(/\[([^\]]+)\]/g,'').replace(/\s+/g,' ').trim();
/* делим на предложения, но не рвём инициалы вроде «А. П. Чехов» */
const sents=t=>plain(t).split(/(?<=[^А-ЯЁA-Z\s][.!?])\s+(?=[А-ЯЁA-Z«])/).filter(Boolean);
const ROUTE_OF=id=>(D.route||[]).find(r=>r.id===id);
function quiz(p){
  const s=sents(p.txt).find(x=>/\d/.test(x)&&x.split(' ').length<=22); if(!s) return null;
  const m=s.match(/(\d[\d,]*)\s*(м|км|метр[а-яё]*|год[а-яё]*|га|лет)(?![а-яё])/i); if(!m) return null;
  return {q:s.replace(m[0],'…'),a:m[0].trim()};
}
function exStop(r,next,o){
  const p=r.p, S=sents(p.txt), kids=o.who==='kids', long=o.len==='long';
  const tell=kids ? S.filter(x=>x.split(' ').length<=20).slice(0,long?3:2) : S.slice(0,long?S.length:2);
  if(!tell.length) tell.push(S[0]||'');
  const out={title:`${r.n}. ${p.n}`,time:`${fmt(r.t)}–${fmt(r.t+p.d)}`,blocks:[]};
  out.blocks.push(['Что рассказать',tell.join(' ')]);
  FILMS_OF(p.id).forEach(f=>{ const per=(f.persons||[]).map(id=>D.persons[id]).filter(Boolean)[0];
    out.blocks.push(['Кино',`Здесь снимали фильм ${f.n}${f.year?', '+f.year:''}.${long&&per?' '+sents(per.txt[0]).slice(0,kids?1:2).join(' '):''} ${f.watch?'Посмотреть его можно на портале в разделе «Фильмы».':'Подробнее о фильме в разделе «Фильмы».'}`,`filmy.html#${f.id}`]); });
  if(p.emo) out.blocks.push([kids?'Что почувствуем':'Эмоции',cap(p.emo.join(', '))+'.']);
  /* рассказы краеведов: одобренные цитаты из постов ВКонтакте (assets/js/posts.js, правка 97) */
  const posts=(window.POSTS&&POSTS[p.id]||[]).filter(q=>!kids||q.t.length<=260).slice(0,long?2:1);
  posts.forEach(q=>out.blocks.push(['Краеведы рассказывают',`«${q.t.replace(/[«»]/g,'"')}» Так пишет ${q.src}, ${q.date.split('-').reverse().join('.')}.`,q.url,'Пост ВКонтакте']));
  const rt=ROUTE_OF(p.id); if(rt) out.blocks.push(['Знак маршрута',`Здесь знак ${rt.code} маршрута по знакам Альшея. ${plain(rt.why)} Отметьте его в паспорте.`]);
  if(kids){ const q=quiz(p); if(q) out.blocks.push(['Вопрос детям',`Угадайте, что пропущено: «${q.q.replace(/…\.$/,'…')}» Ответ: ${q.a}.`]); }
  if(p.tip) out.blocks.push(['Совет',plain(p.tip)]);
  if(next&&next.l) out.blocks.push(['Дальше',`${next.p?next.p.n:'дорога домой'}: ${nf(next.l.km)} км, около ${dur(next.l.min)} в пути.`]);
  return out;
}
function exBuild(o){
  const P=PP, rows=PLAN.rows, visits=rows.filter(r=>r.k==='visit'), km=PLAN.km;
  const head={title:PLAN.title,lead:`${visits.length} ${visits.length===1?'остановка':visits.length<5?'остановки':'остановок'}, ${P.days} ${dayWord(P.days)}, около ${nf(km)} км. Выезд ${P.start.gen} в ${fmt(rows[0].t)}.`+(o.who==='kids'?' Короткие рассказы, вопросы в дорогу и что посмотреть своими глазами.':' Читайте вслух в машине перед каждой остановкой.')};
  const items=[];
  rows.forEach((r,i)=>{ if(r.day) items.push({day:r.day});
    else if(r.k==='visit'&&r.night) items.push({small:`${fmt(r.t)} Ночлег, ${r.p.n}.`});
    else if(r.k==='visit'&&r.p.t==='cafe') items.push({small:`${fmt(r.t)} ${r.p.n}. ${sents(r.p.txt)[0]||''}`});
    else if(r.k==='visit') items.push(exStop(r,rows.slice(i+1).find(x=>x.l),o)); });
  const tail=`Около ${fmt(rows[rows.length-1].t)} вы ${P.far?'снова в Уфе':'дома'}. Если понравилось, загляните в раздел «Сувениры», там вещи мастеров района.`;
  return {head,items,tail};
}
function exText(x){
  const L=[`Экскурсия «${x.head.title}»`,x.head.lead,''];
  x.items.forEach(it=>{ if(it.day) L.push(it.day.toUpperCase(),''); else if(it.small) L.push(it.small,''); else { L.push(`${it.title} · ${it.time}`); it.blocks.forEach(b=>L.push(`${b[0]}. ${b[1]}${b[2]&&/^https?:/.test(b[2])?' '+b[2]:''}`)); L.push(''); } });
  L.push(x.tail); return L.join('\n');
}
function exHTML(x){
  return [`<header class="exh"><b>«${esc(x.head.title)}»</b><p>${esc(x.head.lead)}</p></header>`]
    .concat(x.items.map(it=> it.day?`<p class="caps exday">${esc(it.day)}</p>` : it.small?`<p class="exsm">${esc(it.small)}</p>` :
      `<article><b>${esc(it.title)} · ${it.time}</b>${it.blocks.map(b=>`<p${b[0]==='Совет'||b[0]==='Дальше'?' class="tip"':''}><em>${esc(b[0])}.</em> ${esc(b[1])}${b[2]?` <a href="${b[2]}"${/^https?:/.test(b[2])?' target="_blank" rel="noopener"':''}>${b[3]||'Смотреть'}</a>`:''}</p>`).join('')}</article>`))
    .concat([`<p class="exsm">${esc(x.tail)}</p>`]);
}
let exCur=null, speaking=false;
function speakStop(){ if(window.speechSynthesis) speechSynthesis.cancel(); speaking=false; const b=$('#exSay'); if(b) b.lastChild.textContent='Слушать'; }
function excursion(animate){
  excOn=true; const box=$('#exc'), wrap=$('#excWrap'); if(!box||!PLAN) return; clearTimeout(excT); speakStop(); wrap.hidden=false; const body=$('.exc-b',box);
  exCur=exBuild(EXO);
  const bar=`<div class="exbar"><div class="seg" role="group" aria-label="Для кого">${[['adult','Взрослым'],['kids','Детям']].map(([v,t])=>`<button type="button" data-who="${v}" aria-pressed="${EXO.who===v}">${t}</button>`).join('')}</div>
    <div class="seg" role="group" aria-label="Длина">${[['short','Коротко'],['long','Подробно']].map(([v,t])=>`<button type="button" data-len="${v}" aria-pressed="${EXO.len===v}">${t}</button>`).join('')}</div>
    <span class="sp"></span><button type="button" class="btn" id="exSay">${ic('play',15)}<span>Слушать</span></button><button type="button" class="btn" id="exCopy">${ic('copy',15)}<span>Скопировать</span></button><button type="button" class="btn" id="exDl">${ic('ext',15)}<span>Скачать</span></button></div>`;
  const parts=exHTML(exCur).concat([`<details class="howto exhow"><summary>Как экскурсия будет работать на сайте</summary><p>Сейчас текст собирает код из проверенных карточек мест, героев фильмов, знаков маршрута и рассказов краеведов из постов ВКонтакте. Посты разобраны скриптом: он находит абзацы о каждом месте, отсеивает объявления и спорные версии, а в базу попадают только цитаты, которые одобрил редактор. На сайте этот же набор вместе с порядком остановок, временем и выбором «взрослым или детям» уйдёт на сервер. Языковая модель напишет живой рассказ только по этим источникам и сошлётся на них, без выдуманных фактов, и озвучит его. Готовый текст сохранится, и при том же маршруте придёт сразу.</p></details>`]);
  const bind=()=>{
    $$('[data-who]',box).forEach(b=>b.onclick=()=>{EXO.who=b.dataset.who;excursion(false);});
    $$('[data-len]',box).forEach(b=>b.onclick=()=>{EXO.len=b.dataset.len;excursion(false);});
    $('#exCopy').onclick=()=>A.copy(exText(exCur)).then(()=>A.toast('Текст экскурсии скопирован'));
    $('#exDl').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([exText(exCur)],{type:'text/plain;charset=utf-8'}));a.download='Экскурсия '+exCur.head.title+'.txt';document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);};
    const say=$('#exSay');
    if(!window.speechSynthesis){ say.disabled=true; say.title='Браузер не умеет читать вслух'; }
    say.onclick=()=>{
      if(speaking){ speakStop(); return; }
      const u=new SpeechSynthesisUtterance(exText(exCur)); u.lang='ru-RU'; u.rate=1;
      const v=speechSynthesis.getVoices().find(v=>/^ru/i.test(v.lang)); if(v) u.voice=v; else A.toast('В браузере нет русского голоса, прочитаем как получится');
      u.onend=speakStop; speechSynthesis.speak(u); speaking=true; say.lastChild.textContent='Стоп';
    };
  };
  if(!animate){ body.innerHTML=bar+parts.join(''); bind(); return; }
  body.innerHTML='<p class="thinking"><i></i><i></i><i></i>Собираю экскурсию по вашему маршруту…</p>'; let i=0;
  excT=setTimeout(function step(){ if(i===0){ body.innerHTML=bar; bind(); }
    if(i<parts.length){ const t=document.createElement('template'); t.innerHTML=parts[i]; const el=t.content.firstElementChild; el.classList.add('new'); body.appendChild(el); i++; excT=setTimeout(step,160); } },900);
  wrap.scrollIntoView({behavior:'smooth',block:'start'});
}
$('#excClose').addEventListener('click',()=>{ speakStop(); excOn=false; $('#excWrap').hidden=true; $('#plan').scrollIntoView({behavior:'smooth',block:'nearest'}); });
document.addEventListener('plan:change',()=>{excOn=false;speakStop();$('#excWrap').hidden=true;render();});
render();

/* ссылка на объект карты: index.html#mesto/{id} (на сайте /mesta/{slug}) */
function openFromHash(){const m=location.hash.match(/^#mesto\/([\w-]+)/);if(!m||!PL[m[1]])return;
  $('#map').scrollIntoView({behavior:A.reduce?'auto':'smooth',block:'center'});
  setTimeout(()=>{map.setView(PL[m[1]].ll,12);showPop(m[1]);},A.reduce?0:450);}
window.addEventListener('hashchange',openFromHash); openFromHash();
if(location.hash==='#plan'){setTimeout(()=>planEl.scrollIntoView({block:'start'}),60);}
window.addEventListener('resize',()=>map.invalidateSize());
})();
