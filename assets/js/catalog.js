/* ============================================================
   Маркетплейсы: Туры (6.6), Сувениры (6.9), Размещение (6.10).
   Каталог: 5.20 карточка, 5.21 фильтры. Страница объекта: 5.22 галерея,
   5.23 форма заявки, 5.24 отзывы. Адрес объекта — #slug (на сайте /раздел/slug).
   ============================================================ */
(function(){
"use strict";
const {$,$$,esc,t:T,ic,rub,nf}=A;
const page=A.page, main=$('#main');

/* проекция для «Рядом» (та же, что на карте) */
const GA={x:347.4,y:132,lat:54.177863,lon:54.666216},GK=642.4;
const merc=l=>Math.log(Math.tan(Math.PI/4+l*Math.PI/360))*180/Math.PI;
const imerc=m=>(2*Math.atan(Math.exp(m*Math.PI/180))-Math.PI/2)*180/Math.PI;
const toLL=([x,y])=>[imerc(merc(GA.lat)-(y-GA.y)/GK),GA.lon+(x-GA.x)/GK];
const hav=(a,b)=>{const r=Math.PI/180,dLa=(b[0]-a[0])*r,dLo=(b[1]-a[1])*r;const x=Math.sin(dLa/2)**2+Math.cos(a[0]*r)*Math.cos(b[0]*r)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.sqrt(x));};
const PL={};D.places.forEach(p=>{p.LL=p.ll||toLL(p.xy);PL[p.id]=p;});

/* ---------- настройки разделов ---------- */
const CFG={
  tury:{
    title:'Туры', items:D.tours, types:D.tourTypes, typeKey:'type', typeLbl:'Тип',
    note:'Карточки туров здесь для примера. Настоящие туры, цены и авторов добавят партнёры. Типы туров для фильтра [уточнить].',
    price:t=>'от '+rub(t.price), loc:t=>t.place, sub:t=>`${t.authorKind==='житель'?'Автор живёт в районе':'Гид'} · ${t.dur} ч`,
    img:t=>A.img(t.imgs||[],t.sc||'cone:day','',t.n), extraFilter:true
  },
  suveniry:{
    title:'Сувениры', items:D.goods, types:D.crafts, typeKey:'craft', typeLbl:'Ремесло',
    note:'Товары здесь для примера. Ремёсла взяты из реестра ремесленников района. Имена, фото и контакты мастеров публикуем только с их согласия.',
    price:g=>rub(g.price), loc:()=>'Альшеевский район', sub:g=>`${g.craft} · имя мастера после его согласия`,
    img:g=>A.scene(g.sc), how:true
  },
  razmeshchenie:{
    title:'Размещение', items:D.stays, types:D.stayTypes, typeKey:'type', typeLbl:'Тип',
    note:'Размещение готовится. Здесь будут гостиница «Триумф» и ЭтноКомплекс «Земля Альшея», а также дома и базы партнёров района.',
    price:s=>s.soon?'<span class="soon-b">скоро</span>':rub(s.price)+'<small>за сутки</small>', loc:s=>s.place, sub:s=>s.soon?'открытие готовится':`до ${s.cap} гостей`,
    img:s=>A.img(s.imgs||[],s.sc,s.so,s.n)
  }
}[page];
const typeOf=x=>x[CFG.typeKey];

/* ---------- каталог ---------- */
let F={};
function catalog(){
  F={type:'all',min:'',max:'',sort:'new',dur:'all'}; shown=null;
  document.title=`${CFG.title} · Туристический портал Альшеевского района`;
  main.innerHTML=`<div class="page-h"><h1>${CFG.title}</h1><p class="found" id="found"></p></div>
    <p class="demo-note">${ic('spark',18)}<span>${T(CFG.note)}</span></p>
    ${CFG.how?`<section class="how" aria-label="Как работает лавка"><h2>Как работает лавка</h2><ol><li>Мастер выставляет работы бесплатно</li><li>Покупатель оформляет заказ на сайте</li><li>Портал передаёт заказ мастеру и договаривается о доставке или самовывозе</li></ol><p>Портал работает как агент: небольшая комиссия входит в цену и берётся только с проданного</p></section><div style="height:18px"></div>`:''}
    <div class="filters" role="search">
      <div class="grp"><span class="lbl">${CFG.typeLbl}:</span><button type="button" class="chip" data-t="all" aria-pressed="true">Все</button>${CFG.types.map(t=>`<button type="button" class="chip" data-t="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('')}</div>
      <div class="rt">
        ${CFG.extraFilter?`<label class="lbl">Длительность <select id="fDur"><option value="all">любая</option><option value="s">до 3 ч</option><option value="m">3–6 ч</option><option value="l">больше 6 ч</option></select></label>`:''}
        <span class="lbl">Цена${page==='razmeshchenie'?' за сутки':''}</span><input id="fMin" type="number" min="0" placeholder="от" aria-label="Цена от" inputmode="numeric"><input id="fMax" type="number" min="0" placeholder="до" aria-label="Цена до" inputmode="numeric">
        <select id="fSort" aria-label="Сортировка"><option value="new">По новизне</option><option value="cheap">Сначала дешевле</option><option value="exp">Сначала дороже</option><option value="name">По названию</option></select>
      </div>
    </div>
    <div class="grid" id="grid"></div>`;
  $$('[data-t]').forEach(b=>b.addEventListener('click',()=>{F.type=b.dataset.t;$$('[data-t]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));list();}));
  ['fMin','fMax'].forEach(id=>$('#'+id).addEventListener('input',e=>{F[id==='fMin'?'min':'max']=e.target.value;list();}));
  $('#fSort').addEventListener('change',e=>{F.sort=e.target.value;list();});
  if($('#fDur'))$('#fDur').addEventListener('change',e=>{F.dur=e.target.value;list();});
  /* пока всё размещение только планируется, цену и сортировку не показываем */
  if(CFG.items.every(x=>x.soon)) $$('.filters .rt').forEach(x=>x.hidden=true);
  list();
}
function list(){
  let it=CFG.items.filter(x=>(F.type==='all'||typeOf(x)===F.type)&&(F.min===''||x.price>=+F.min)&&(F.max===''||x.price<=+F.max)
    &&(F.dur==='all'||(F.dur==='s'&&x.dur<=3)||(F.dur==='m'&&x.dur>3&&x.dur<=6)||(F.dur==='l'&&x.dur>6)));
  if(F.sort==='cheap')it.sort((a,b)=>a.price-b.price);else if(F.sort==='exp')it.sort((a,b)=>b.price-a.price);else if(F.sort==='name')it.sort((a,b)=>a.n.localeCompare(b.n,'ru'));
  $('#found').textContent=`Найдено: ${it.length}`;
  $('#grid').innerHTML=it.length?it.map(x=>`<a class="card" href="#${x.id}">
    <div class="ph">${CFG.img(x)}<span class="badge-t">${esc(typeOf(x))}</span></div>
    <div class="bd"><div class="tt"><h3>${esc(x.n)}</h3><span class="pr">${CFG.price(x)}</span></div>
      <span class="loc">${ic('pin',15)}${T(CFG.loc(x))}</span>
      <span class="sub">${esc(CFG.sub(x))}</span>
      ${x.soon?'':`<span>${A.stars(x.rating||0)}${x.reviews?`<small>${x.reviews} отзыва</small>`:'<small>пока без отзывов</small>'}</span>`}</div></a>`).join('')
    :`<p class="nores" style="grid-column:1/-1">Ничего не нашлось. Измените фильтры.</p>`;
}

/* ---------- 5.24 отзывы ---------- */
const REV=[{n:'Ирина',d:'август 2026',r:5,t:'[Пример отзыва для прототипа]'},{n:'Марат',d:'июль 2026',r:5,t:'[Пример отзыва для прототипа]'},{n:'Ольга',d:'июнь 2026',r:4,t:'[Пример отзыва для прототипа]'}];
function reviews(x){
  const list=REV.slice(0,x.reviews||0);
  return `<section class="sec2"><h2>Отзывы</h2>${list.length?`<p>${A.stars(x.rating)} <span class="mono">${x.rating.toFixed(1)}</span> <span class="muted">· ${list.length} отзыва</span></p><div class="revs">${list.map(r=>`<article class="rev"><header><b>${r.n}</b><small>${r.d}</small>${A.stars(r.r)}</header><p>${T(r.t)}</p></article>`).join('')}</div>`:'<p class="muted">Пока нет отзывов.</p>'}
    <form class="form" novalidate data-ok="Спасибо! Отзыв опубликуем после проверки" style="box-shadow:none;max-width:560px"><h3 style="font-size:18px">Оставить отзыв</h3>
      <div class="fld"><span>Оценка *</span><select name="stars" required aria-label="Оценка"><option value="">выберите</option><option>5</option><option>4</option><option>3</option><option>2</option><option>1</option></select><span class="err"></span></div>
      ${A.field('Отзыв','text',{area:1,req:1})}${A.field('Имя','name',{req:1})}
      <button class="btn dark" type="submit">Отправить отзыв</button><p class="fine">Отзыв публикуется после проверки</p></form></section>`;
}

/* ---------- страница объекта ---------- */
function detail(x){
  document.title=`${x.n} · ${CFG.title} · Туристический портал Альшеевского района`;
  const crumb=`<p class="crumb"><a href="#">${CFG.title}</a>${ic('right',14)}<span>${esc(x.n)}</span></p>`;
  let left='',form='',info='';
  if(page==='tury'){
    left=A.gallery((x.imgs&&x.imgs.length?x.imgs:['']).map(s=>s?A.img([s],x.sc||'cone:day','',x.n):A.scene(x.sc||'cone:day')))+`
      <section class="sec2"><h2>Описание</h2><p>${esc(x.txt)}</p></section>
      <section class="sec2"><h2>Программа</h2><ol class="prog">${x.prog.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
      <section class="sec2"><h2>Длительность и что включено</h2><p>${x.dur} ч · ${x.incl.map(esc).join(', ')}</p></section>
      <section class="sec2"><h2>Место старта</h2><p>${T(x.place)}</p><p><a class="btn" href="index.html#mesto/${x.stops[0]}">${ic('pin',17)}Показать на карте</a> <button class="btn" type="button" data-addplan>${ic('plus',17)}Добавить места тура в план</button></p></section>
      ${(()=>{const fs=[...new Set(x.stops.flatMap(id=>A.filmsOf(id)))];return fs.length?`<section class="sec2"><h2>Кино по маршруту</h2><p>Места этого тура есть в фильмах о людях района.</p><div class="films">${fs.map(f=>A.filmLink(f)).join('')}</div></section>`:'';})()}
      <section class="sec2"><h2>Об авторе</h2><div class="author"><span class="av">${ic('user',28)}</span><div><b>${esc(x.author)}</b><p class="muted" style="font-size:14px">${T('[фото и рассказ о себе пришлёт автор]')}</p></div></div></section>
      ${reviews(x)}`;
    info=`<span class="type">${esc(x.type)}</span><h1>${esc(x.n)}</h1><span class="loc muted">${ic('pin',15)} ${T(x.place)}</span><span class="pr">от ${rub(x.price)}</span><span class="verified">${ic('check',16)}Проверено администрацией</span>`;
    form=`<form class="form" novalidate><h3>Оставить заявку</h3>${A.field('Дата','date',{type:'date',req:1})}${A.field('Количество человек','people',{type:'number',min:1,val:2,req:1})}${A.field('Имя','name',{req:1})}${A.field('Телефон','phone',{type:'tel',req:1})}${A.agree()}<button class="btn dark full" type="submit">Отправить заявку</button></form>`;
  }
  if(page==='suveniry'){
    left=A.gallery([A.scene(x.sc),A.scene(x.sc.replace(/:.*/,':green'))])+`
      <section class="sec2"><h2>О товаре</h2><p>${T('[описание товара пришлёт мастер]')}</p></section>
      <section class="sec2"><h2>О мастере</h2><div class="author"><span class="av">${ic('user',28)}</span><div><b>${esc(x.craft)}</b><p class="muted" style="font-size:14px">Имя, фото и рассказ мастера публикуются только с его согласия</p></div></div></section>`;
    info=`<span class="type">${esc(x.craft)}</span><h1>${esc(x.n)}</h1><span class="pr">${rub(x.price)}</span><span class="fine">Онлайн-оплата ${T('[уточнить]')}</span>`;
    form=`<form class="form" novalidate data-ok="Заказ отправлен. Мы свяжемся с вами"><h3>Заказать</h3>${A.field('Количество','qty',{type:'number',min:1,val:1,req:1})}${A.field('Имя','name',{req:1})}${A.field('Телефон','phone',{type:'tel',req:1})}${A.field('Способ получения','way',{options:['Доставка','Самовывоз'],req:1})}${A.agree()}<button class="btn dark full" type="submit">Заказать</button></form>`;
  }
  if(page==='razmeshchenie'){
    const ll=x.mapId&&PL[x.mapId]?PL[x.mapId].LL:toLL(x.xy);
    const near=D.places.filter(p=>p.st==='open'&&['nature','museum','sight','active'].includes(p.t)).map(p=>({p,d:hav(ll,p.LL)})).sort((a,b)=>a.d-b.d).slice(0,4);
    left=A.gallery([...(x.imgs||[]).map(s=>A.img([s],x.sc,x.so,x.n)),A.scene(x.sc,x.so)])+`
      <section class="sec2"><h2>Описание</h2><p>${esc(x.txt)}</p></section>
      ${x.soon?'':`<section class="sec2"><h2>Удобства</h2><div class="amen">${x.amen.map(a=>`<span>${esc(a)}</span>`).join('')}</div></section>
      <section class="sec2"><h2>Вместимость</h2><p>до ${x.cap} гостей</p></section>`}
      <section class="sec2"><h2>Рядом</h2><div class="chips">${near.map(o=>`<a class="chip" href="index.html#mesto/${o.p.id}">${esc(o.p.n)} · <span class="mono">${o.d<1?'<1':nf(o.d)} км</span></a>`).join('')}</div></section>
      ${x.soon?'':reviews(x)}`;
    info=`<span class="type">${esc(x.type)}</span><h1>${esc(x.n)}</h1><span class="loc muted">${ic('pin',15)} ${esc(x.place)}</span>${x.soon?'<span class="pr soon-b">скоро открытие</span>':`<span class="pr">${rub(x.price)} / сутки</span>`}`;
    form=x.soon?`<form class="form" novalidate data-ok="Спасибо! Напишем, когда откроется бронирование"><h3>Узнать об открытии</h3><p class="fine" style="margin:-4px 0 6px">Оставьте контакт, и мы напишем, когда можно будет забронировать.</p>${A.field('Имя','name',{req:1})}${A.field('Телефон или соцсеть','contact',{req:1})}${A.agree()}<button class="btn dark full" type="submit">Сообщите мне</button></form>`:`<form class="form" novalidate><h3>Оставить заявку</h3><div class="fld2">${A.field('Заезд','in',{type:'date',req:1})}${A.field('Выезд','out',{type:'date',req:1})}</div>${A.field('Гости','guests',{type:'number',min:1,val:2,req:1})}${A.field('Имя','name',{req:1})}${A.field('Телефон','phone',{type:'tel',req:1})}${A.agree()}<button class="btn dark full" type="submit">Отправить заявку</button></form>`;
  }
  main.innerHTML=`<div class="page-h" style="padding-bottom:12px">${crumb}</div>
    ${x.soon?'':`<p class="demo-note">${ic('spark',18)}<span>Карточка для примера</span></p>`}
    <div class="obj"><div><div class="obj-info obj-m">${info}</div>${left}</div><aside><div class="obj-info obj-d">${info}</div><div id="obj-form">${form}</div></aside></div>
    <a class="m-cta" href="#obj-form">${x.soon?'Сообщить об открытии':page==='suveniry'?'Заказать':'Оставить заявку'}${x.soon?'':` · ${page==='razmeshchenie'?rub(x.price)+' / сутки':page==='tury'?'от '+rub(x.price):rub(x.price)}`}</a>`;
  A.bindGallery(main); A.bindForms(main);
  /* кнопка заявки внизу экрана на телефоне прячется, когда форма уже видна */
  const cta=$('.m-cta',main), fw=$('#obj-form',main);
  cta.addEventListener('click',e=>{ e.preventDefault(); fw.scrollIntoView({behavior:'smooth',block:'start'}); });
  if('IntersectionObserver' in window) new IntersectionObserver(es=>es.forEach(en=>cta.classList.toggle('hide',en.isIntersecting)),{threshold:.15}).observe(fw);
  const ap=$('[data-addplan]',main); if(ap) ap.addEventListener('click',()=>{const n=A.addMany(x.stops);A.toast(n?`Добавили в план мест ${n}. План на главной, в разделе «Что посмотреть»`:'Эти места уже в плане');});
  window.scrollTo(0,0);
}

let shown=null;
function route(){
  const id=decodeURIComponent(location.hash.slice(1));
  if(['o-brende','partneram','kontakty'].includes(id.split('/')[0])) return;
  const x=CFG.items.find(i=>i.id===id);
  if(x){ if(shown!==x.id){ shown=x.id; detail(x); } } else { if(!$('#grid')) catalog(); }
}
window.addEventListener('hashchange',route); route();
})();
