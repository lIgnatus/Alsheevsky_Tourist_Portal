/* Маршрут по знакам Альшея: паспорт и путеводитель в одном.
   Самостоятельный маршрут из 12 мест. Паспорт выдают в кафе «Триумф».
   Отметка на месте: код с таблички или проверка геопозиции в радиусе 300 м.
   Отметки хранятся в браузере. Знаки нарисованы по мотивам тамг, это не настоящие родовые знаки. */
(function(){
"use strict";
const {$,$$,esc,ic}=A;
const main=$('#main');
const PL={}; D.places.forEach(p=>PL[p.id]=p);
const R=D.route.map((r,i)=>Object.assign({},r,{i:i+1,p:PL[r.id]}));
const KEY='alshey.pasport.v1';
let got={}; try{got=JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(got));}catch(e){}};
const sign=(k,size=40,w=3.4)=>`<svg viewBox="0 0 40 40" width="${size}" height="${size}" aria-hidden="true" focusable="false"><path d="${D.signs[k]}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const TN={nature:'Природа',museum:'Музей',sight:'Достопримечательность',active:'Активный отдых',cafe:'Кафе, старт маршрута'};
const hav=(a,b)=>{const r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;const x=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(x));};
const count=()=>R.filter(r=>got[r.id]).length;
const nextReward=()=>D.rewards.find(w=>w.n>count());

main.innerHTML=`
<section class="t-hero">
  <div>
    <h1 class="t-display">Найди 12 знаков Альшея</h1>
    <p class="lead">Самостоятельный маршрут по Альшеевскому району. У каждого места свой знак, нарисованный по мотивам тамг. Возьмите паспорт в кафе «Триумф» в Раевском, отмечайте знаки на местах и получайте подарки.</p>
    <div class="t-prog" id="prog"></div>
    <div class="t-acts"><a class="t-btn fill" href="pasport.html" target="_blank" rel="noopener">${ic('copy',18)}Паспорт для печати</a><a class="t-btn" href="#put">Путеводитель по местам</a><a class="t-btn" href="#karta">Карта маршрута</a></div>
  </div>
  <div class="t-grid" id="grid"></div>
</section>
<section class="t-sec" id="kak"><h2 class="t-display">Как это работает</h2>
  <div class="t-steps">
    <div><i style="background:var(--t-red)"></i><b>Возьмите паспорт</b><p>Его выдают в кафе «Триумф», Раевский, Магистральная улица, 2В. Можно и распечатать самому.</p></div>
    <div><i style="background:var(--t-green)"></i><b>Найдите знак</b><p>У каждого места стоит табличка со знаком, QR-кодом и коротким кодом.</p></div>
    <div><i style="background:var(--t-navy)"></i><b>Отметьтесь</b><p>Наведите камеру на QR или введите код на этой странице. Ещё можно поставить штамп в бумажном паспорте у партнёров.</p></div>
    <div><i style="background:var(--t-mus)"></i><b>Получите подарки</b><p>За 3, 6 и 12 знаков. Подарки выдают в кафе «Триумф» по паспорту.</p></div>
  </div>
</section>
<section class="t-sec" id="karta"><h2 class="t-display">Карта маршрута</h2>
  <div class="t-map" id="tmap"></div>
  <p class="fine" style="margin-top:8px">Порядок точек удобен, если ехать из Раевского на машине. Весь маршрут занимает два дня. <a id="ya" target="_blank" rel="noopener">Открыть маршрут в Яндекс Картах</a></p>
</section>
<section class="t-sec" id="put"><h2 class="t-display">Путеводитель</h2><div class="t-guide" id="guide"></div></section>
<section class="t-sec" id="podarki"><h2 class="t-display">Подарки</h2><div class="t-rewards" id="rew"></div>
  <p class="t-note">Знаки нарисованы по мотивам тамг. Это не настоящие родовые знаки башкирских родов. Перед запуском маршрута знаки согласуем с краеведами, музеем района и знатоками башкирской культуры. Подарки и скидки в прототипе для примера.</p>
</section>`;

function drawTop(){
  const n=count(), nr=nextReward();
  $('#prog').innerHTML=`<b>Ваш паспорт: ${n} из 12</b><small>${nr?`Ещё ${nr.n-n} ${(nr.n-n)===1?'знак':(nr.n-n)<5?'знака':'знаков'}, и вы получите «${esc(nr.t)}»`:'Все знаки собраны. Покажите паспорт в кафе «Триумф» и заберите подарок'}</small><div class="t-bar">${R.map(r=>`<i class="${got[r.id]?'on':''}"></i>`).join('')}</div>`;
  $('#grid').innerHTML=R.map(r=>`<a class="t-sign ${r.color}${got[r.id]?' got':''}" href="#m-${r.id}" title="${esc(r.p.n)}"><em>${String(r.i).padStart(2,'0')}</em>${sign(r.sign)}<span>${esc(short(r.p.n))}</span></a>`).join('');
}
function short(n){return n.replace(/^Гора /,'').replace(/ \(.*\)$/,'').replace('Историко-краеведческий музей Альшеевского района','Музей района').replace('Водонапорная башня станции Раевка','Башня Раевки').replace('Слаковское водохранилище','Слак').replace('Гости у фермера Мустафина','Кумыс').replace('Крестовоздвиженская церковь','Воздвиженка').replace('Башкирские тамги','Тамги').replace('Каменная мечеть','Аврюзово').replace('Чеховский музей','Чехов');}
function drawGuide(){
  $('#guide').innerHTML=R.map(r=>{const p=r.p, g=got[r.id];return `<article class="t-card" id="m-${r.id}">
    <div class="big" style="color:var(--t-${r.color==='mustard'?'mus':r.color})">${sign(r.sign,96,3)}<em>знак ${String(r.i).padStart(2,'0')}</em></div>
    <div><h3>${esc(p.n)}</h3><p class="type">${TN[p.t]||''}${p.approx?' · точка на карте условная':''}</p>
      <p>${esc(p.txt)}</p>
      <p class="why">Почему такой знак. ${esc(r.why)}</p>
      <p><b>Как найти.</b> ${esc(r.how)}</p>
      ${A.filmsOf(p.id).length?`<p class="films">${A.filmsOf(p.id).map(f=>A.filmLink(f)).join('')}</p>`:''}
      <p><a href="index.html#mesto/${p.id}">Показать на большой карте</a></p></div>
    <div class="t-stamp">
      <div class="circle${g?' got':''}">${g?`Знак ${String(r.i).padStart(2,'0')}<br>получен<br>${esc(g)}`:'место<br>для отметки'}</div>
      ${g?'':`<form data-code="${r.id}"><input name="c" placeholder="код" aria-label="Код с таблички, место ${r.i}" autocomplete="off"><button class="t-btn fill" type="submit">Отметить</button></form>
      <button class="t-btn" type="button" data-geo="${r.id}">${ic('pin',16)}Я на месте</button>
      <small>В прототипе код с таблички ${esc(r.code)}</small>`}
      <small class="msg" aria-live="polite"></small>
    </div></article>`;}).join('');
  $$('form[data-code]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const r=R.find(x=>x.id===f.dataset.code);const v=f.c.value.trim().toUpperCase().replace(/\s/g,'');
    if(v===r.code.replace(/\s/g,'')) mark(r); else $('.msg',f.parentElement).textContent='Код не подошёл. Проверьте буквы и цифры на табличке';}));
  $$('[data-geo]').forEach(b=>b.addEventListener('click',()=>{const r=R.find(x=>x.id===b.dataset.geo), msg=$('.msg',b.parentElement);
    if(!navigator.geolocation){msg.textContent='Телефон не даёт узнать место, введите код';return;}
    msg.textContent='Проверяю, где вы…';
    navigator.geolocation.getCurrentPosition(pos=>{const d=hav([pos.coords.latitude,pos.coords.longitude],r.p.ll)*1000;
      if(d<=300) mark(r); else msg.textContent=`До места ещё ${d<1000?Math.round(d)+' м':(d/1000).toFixed(1).replace('.',',')+' км'}. Отметиться можно в радиусе 300 м`;},
      ()=>{msg.textContent='Не получилось узнать место. Введите код с таблички';},{enableHighAccuracy:true,timeout:10000});}));
}
function mark(r){
  const d=new Date(); got[r.id]=`${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`; save();
  const n=count(); const w=D.rewards.find(x=>x.n===n);
  A.toast(w?`Знак получен. У вас ${n} из 12, это подарок «${w.t}»`:`Знак получен. У вас ${n} из 12`);
  drawTop(); drawGuide(); drawMap(); $('#m-'+r.id).scrollIntoView({block:'center',behavior:A.reduce?'auto':'smooth'});
}
$('#rew').innerHTML=D.rewards.map(w=>`<div><b>${w.n}</b><h3>${esc(w.t)}</h3><p>${esc(w.d)}</p></div>`).join('');

/* карта маршрута */
let map, layer;
function drawMap(){
  if(!window.L) return;
  if(!map){
    map=L.map('tmap',{scrollWheelZoom:false});
    A.baseLayer(map);
    map.attributionControl.setPrefix(false); L.control.scale({imperial:false}).addTo(map);
    L.polygon(window.ALSHEY_BOUNDARY,{color:'#1E2550',weight:2,fill:false,dashArray:'6 6',interactive:false}).addTo(map);
    L.polyline(R.map(r=>r.p.ll),{color:'#C8372D',weight:3,dashArray:'2 8',lineCap:'round'}).addTo(map);
    map.fitBounds(L.latLngBounds(R.map(r=>r.p.ll)),{padding:[30,30]});
    map.on('click',()=>map.scrollWheelZoom.enable());
    layer=L.layerGroup().addTo(map);
  }
  layer.clearLayers();
  R.forEach(r=>L.marker(r.p.ll,{icon:L.divIcon({className:'t-mk',html:`<div class="${r.color}${got[r.id]?' got':''}" style="color:${got[r.id]?'':'var(--t-navy)'}">${sign(r.sign,22,4)}</div>`,iconSize:[34,34],iconAnchor:[17,17]}),title:`${r.i}. ${r.p.n}`}).bindTooltip(`${r.i}. ${esc(r.p.n)}`,{direction:'top',offset:[0,-16]}).on('click',()=>{location.hash='m-'+r.id;}).addTo(layer));
  $('#ya').href='https://yandex.ru/maps/?rtext='+R.map(r=>r.p.ll[0].toFixed(6)+','+r.p.ll[1].toFixed(6)).join('~')+'&rtt=auto';
}
drawTop(); drawGuide(); drawMap();
})();
