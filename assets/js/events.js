/* События: календарь, список месяца, плашка события по центру.
   Адрес события sobytiya.html#slug (на сайте /sobytiya/slug), календарь открывается на нужном месяце с плашкой.
   У событий с примерной датой пометка «≈», дату уточним по фактам. */
(function(){
"use strict";
const {$,$$,esc,t:T,ic}=A;
const main=$('#main');
const MON=['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь'];
const MONG=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONP=['январю','февралю','марту','апрелю','маю','июню','июлю','августу','сентябрю','октябрю','ноябрю','декабрю'];
const WD=['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const today=new Date(); today.setHours(0,0,0,0);
const parse=s=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);};
const dated=D.events.filter(e=>e.date).map(e=>Object.assign(e,{dt:parse(e.date)})).sort((a,b)=>a.dt-b.dt);
const undated=D.events.filter(e=>!e.date);
const key=d=>`${d.getFullYear()}-${d.getMonth()}`;
let view=new Date(today.getFullYear(),today.getMonth(),1);
const dstr=e=>`${e.approx?'примерно ':''}${e.dt.getDate()} ${MONG[e.dt.getMonth()]} ${e.dt.getFullYear()}`;

main.innerHTML=`<div class="page-h"><h1>События</h1><p class="found">Календарь событий района. Нажмите на событие, чтобы открыть подробности. Знак ≈ значит, что дата примерная</p></div>
  <div class="cal-wrap">
    <section class="cal" aria-label="Календарь">
      <div class="cal-h"><button class="round lg" type="button" id="prev" aria-label="Предыдущий месяц">${ic('left',20)}</button><h2 id="mon" aria-live="polite"></h2><button class="round lg" type="button" id="next" aria-label="Следующий месяц">${ic('right',20)}</button></div>
      <div class="cal-g" id="grid"></div>
      <div class="ribbon" id="ribbon"></div>
    </section>
    <aside class="evlist" id="list" aria-label="События месяца"></aside>
  </div>
  ${undated.length?`<section class="sec2" style="margin-top:36px"><h2>Даты уточняются</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));margin-top:6px" id="undated"></div></section>`:''}
  <section class="sec2" style="margin-top:36px"><h2>Все события по порядку</h2><div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr));margin-top:6px" id="all"></div></section>`;

const evBtn=e=>`<button type="button" class="evi${e.approx?' approx':''}" data-ev="${e.id}"><span class="dt${e.dt?'':' q'}">${e.dt?`<b>${e.approx?'≈':''}${e.dt.getDate()}</b><small>${MONG[e.dt.getMonth()].slice(0,3)}</small>`:`<b>?</b><small>дата</small>`}</span><span><strong>${esc(e.n)}</strong><span>${e.dt?dstr(e):'дата уточняется'} · ${T(e.place)}</span></span></button>`;
function draw(){
  const y=view.getFullYear(), m=view.getMonth();
  $('#mon').textContent=`${MON[m].charAt(0).toUpperCase()+MON[m].slice(1)} ${y}`;
  const first=(new Date(y,m,1).getDay()+6)%7, days=new Date(y,m+1,0).getDate(), cells=Math.ceil((first+days)/7)*7;
  let g=WD.map(w=>`<span class="wd">${w}</span>`).join('');
  for(let i=0;i<cells;i++){
    const d=new Date(y,m,1+i-first), inM=d.getMonth()===m;
    const evs=dated.filter(e=>+e.dt===+d);
    g+=`<div class="c${inM?'':' out'}${+d===+today?' today':''}"><span class="n">${d.getDate()}</span>${evs.slice(0,2).map(e=>`<button type="button" data-ev="${e.id}" class="${e.approx?'approx':''}" title="${esc(e.n)}${e.approx?', дата примерная':''}">${e.approx?'≈ ':''}${esc(e.n)}</button>`).join('')}${evs.length>2?`<span class="more">+${evs.length-2}</span>`:''}</div>`;
  }
  $('#grid').innerHTML=g;
  const inMonth=dated.filter(e=>key(e.dt)===key(view));
  const next=dated.find(e=>e.dt>=new Date(y,m+1,1));
  $('#ribbon').innerHTML=inMonth.length?inMonth.map(evBtn).join(''):`<p class="muted">В этом месяце событий нет</p>`;
  $('#list').innerHTML=`<h3>События месяца</h3>${inMonth.length?inMonth.map(evBtn).join(''):`<p class="muted">В этом месяце событий нет.</p>${next?`<p style="font-size:14px;margin-top:4px">Ближайшее событие</p>${evBtn(next)}<button type="button" class="tlink" id="jump">Перейти к ${MONP[next.dt.getMonth()]} ${next.dt.getFullYear()}</button>`:''}`}`;
  const j=$('#jump'); if(j) j.addEventListener('click',()=>{view=new Date(next.dt.getFullYear(),next.dt.getMonth(),1);draw();});
}
$('#prev').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()-1,1);draw();});
$('#next').addEventListener('click',()=>{view=new Date(view.getFullYear(),view.getMonth()+1,1);draw();});
if($('#undated')) $('#undated').innerHTML=undated.map(evBtn).join('');
$('#all').innerHTML=dated.filter(e=>e.dt>=today).map(evBtn).join('');
main.addEventListener('click',e=>{const b=e.target.closest('[data-ev]');if(b)location.hash=b.dataset.ev;});
draw();

/* ---------- плашка события ---------- */
let openId=null;
function plate(e,nav){
  if(e.dt){view=new Date(e.dt.getFullYear(),e.dt.getMonth(),1);draw();}
  const slides=e.imgs?e.imgs.map(s=>`<img src="${s}" alt="${esc(e.n)}">`):[A.scene(e.sc||'fest:day')];
  const when=e.dt?`${dstr(e)}${e.time?' · '+e.time:' · время уточним'}`:'дата уточняется';
  /* адрес, как попасть, где остановиться и карта мероприятия (правка 116) */
  const pl=e.mapId&&D.places.find(p=>p.id===e.mapId), ll=e.ll||(pl&&pl.ll)||null;
  A.overlay({title:'Событие',cls:'evp',hash:e.id,onClose:()=>{openId=null;},html:`
    ${A.gallery(slides)}
    <div class="in"><h2>${esc(e.n)}</h2><p class="when">${when}</p>
      ${e.approx?'<p class="note-ev">Дата примерная. Точную дату опубликуем, как только её объявят организаторы.</p>':''}
      <div class="where">${ic('pin',18)}<span>${T(e.place)}</span>${e.mapId?`<a class="btn" href="index.html#mesto/${e.mapId}">Показать на карте</a>`:''}</div>
      ${e.films?`<div class="films">${e.films.map(id=>D.films.find(f=>f.id===id)).filter(Boolean).map(f=>A.filmLink(f)).join('')}</div>`:''}${e.allFilms?`<div class="films"><a class="film-link" href="filmy.html">${ic('play',13)}Фильмы о людях района</a></div>`:''}
      ${e.txt.map(p=>`<p>${T(p)}</p>`).join('')}
      ${e.filler?'<p class="fine">Описание временное, уточним по фактам.</p>':''}
      <div class="ev-info">
        <section><h3>${ic('pin',18)}Адрес</h3><p>${T(e.addr||e.place)}</p></section>
        <section><h3>${ic('route',18)}Как попасть</h3><p>На машине из Уфы около двух часов. На электричке до станции Раевка или на автобусе до Раевского, дальше на такси: ${T(D.transit&&D.transit.taxi&&D.transit.taxi.phone||'[номер такси уточнить]')}.</p>
          <p class="btns">${ll?`<a class="btn" href="https://yandex.ru/maps/?rtext=${D.ufa[0]},${D.ufa[1]}~${ll[0]},${ll[1]}&rtt=auto" target="_blank" rel="noopener">${ic('ext',15)}Маршрут на машине</a>`:''}<a class="btn" href="https://rasp.yandex.ru/search/suburban/?fromName=%D0%A3%D1%84%D0%B0&toName=%D0%A0%D0%B0%D0%B5%D0%B2%D0%BA%D0%B0" target="_blank" rel="noopener">${ic('clock',15)}Электрички</a><a class="btn" href="https://rasp.yandex.ru/search/bus/?fromName=%D0%A3%D1%84%D0%B0&toName=%D0%A0%D0%B0%D0%B5%D0%B2%D1%81%D0%BA%D0%B8%D0%B9" target="_blank" rel="noopener">${ic('clock',15)}Автобусы</a></p></section>
        <section><h3>${ic('house',18)}Где остановиться</h3><p>Рядом готовятся гостиница «Триумф» и ЭтноКомплекс «Земля Альшея». <a href="razmeshchenie.html">Размещение</a></p></section>
        <section class="ev-map-s"><h3>${ic('pin',18)}Карта мероприятия</h3>${ll?`<div class="ev-map" id="evmap"></div>`:`<p class="fine">Точку на карте добавим, когда организаторы объявят площадку.</p>`}</section>
      </div>
      <div class="acts">${e.soc.length?e.soc.map(s=>`<a class="btn" href="${s.url}" target="_blank" rel="noopener">${ic('vk',20)}${esc(s.n)}</a>`).join(''):`<span class="fine">Группы события в соцсетях ${T('[уточнить]')}</span>`}</div>
    </div>`, init:b=>{ A.bindGallery(b);
      if(ll&&window.L){ setTimeout(()=>{ const m=L.map($('#evmap',b),{scrollWheelZoom:false,attributionControl:true}).setView(ll,14); A.baseLayer(m); m.attributionControl.setPrefix(false);
        L.marker(ll,{icon:L.divIcon({className:'ev-pin',html:`<span>${ic('calendar',16)}</span>`,iconSize:[34,34],iconAnchor:[17,34]})}).addTo(m).bindTooltip(e.n,{direction:'top',offset:[0,-30]}); },350); } }});
  openId=e.id;
  if(nav) A.markNav(); /* открыто переходом по якорю, поэтому «Назад» и «×» возвращают к календарю */
}
function route(ev){
  const id=decodeURIComponent(location.hash.slice(1)), e=D.events.find(x=>x.id===id);
  if(e){ if(openId!==id) plate(e,!!ev); }
  else if(openId && !['o-brende','partneram','kontakty','pasport-turista'].includes(id.split('/')[0])){ openId=null; A.closeOverlay(true); }
}
window.addEventListener('hashchange',route); route(null);
})();
