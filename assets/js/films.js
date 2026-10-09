/* Фильмы (6.8): карусель (5.27), «Личность» (5.28), «Места съёмок» (5.29),
   «Пригласите наш фильм» (5.30), стиль коллажа (4.2, 5.31).
   Фильмы, ссылки и тексты — сайт АНО «Триумф». Адрес фильма — filmy.html#id. */
(function(){
"use strict";
const {$,$$,esc,t:T,ic}=A;
const main=$('#main'), F=D.films, PL={}; D.places.forEach(p=>PL[p.id]=p);
const STK=['r','','w','r',''];
let i=Math.max(0,F.findIndex(f=>f.id===location.hash.slice(1))), pi=0;

main.innerHTML=`<div class="k-head"><div><h1>Фильмы</h1><p style="font-size:17px;margin-top:12px;max-width:560px;color:#333">Фильмы о людях района. Листайте карусель, и под кадром появится рассказ о герое фильма</p></div>
  <a class="tk" href="sobytiya.html#kinofestival-2027" aria-label="Кинофестиваль «Земля Альшея» в календаре событий" style="color:inherit;text-decoration:none"><span class="stk w ticket" style="left:6px;top:14px;width:330px;transform:rotate(-3deg)"><div><small>I краеведческий кинофестиваль</small><b>«Земля Альшея»</b><i>Раевский · в календаре событий</i></div></span></a></div>
  <section class="car" id="car" aria-roledescription="карусель" aria-label="Фильмы">
    ${F.map((f,k)=>`<div class="slide" data-k="${k}" role="group" aria-label="${k+1} из ${F.length}, ${esc(f.n)}"><div class="stk ${STK[k%STK.length]} pic"><img src="${f.img}" alt="Кадр фильма ${esc(f.n)}"></div>${f.award?`<span class="tag">${esc(f.award)}</span>`:''}${f.watch?`<button type="button" class="playbig" data-play="${k}" aria-label="Смотреть фильм ${esc(f.n)}">${ic('play',30)}</button>`:''}</div>`).join('')}
    <button class="nav p" type="button" aria-label="Предыдущий фильм">${ic('left',20)}</button><button class="nav n" type="button" aria-label="Следующий фильм">${ic('right',20)}</button>
  </section>
  <div class="fmeta" id="meta" aria-live="polite"></div>
  <div class="dots" id="dots">${F.map((f,k)=>`<button type="button" aria-label="${esc(f.n)}"></button>`).join('')}</div>
  <section class="prs" id="prs" aria-label="Личность"></section>
  <section class="places" id="places" aria-label="Места съёмок"></section>
  <section class="invite" aria-label="Пригласите наш фильм"><div><small>Показ в вашем городе</small><h2>Позовите наше кино к себе</h2><p>Мы привозим фильмы в школы, клубы и библиотеки и остаёмся на разговор со зрителями. Оставьте заявку, и договоримся о показе.</p></div><button class="btn" type="button" id="inv">${ic('play',16)}Пригласить фильм</button></section>`;

function draw(){
  const n=F.length;
  $$('.slide').forEach(s=>{const k=+s.dataset.k,d=((k-i)%n+n)%n;s.className='slide '+(d===0?'c':d===1?'r1':d===n-1?'l1':d===2?'r2':d===n-2?'l2':'hid');});
  $$('#dots button').forEach((b,k)=>b.setAttribute('aria-current',String(k===i)));
  const f=F[i];
  $('#meta').innerHTML=`<h2>${esc(f.n)}</h2><p class="m">${[f.year,f.genre].filter(Boolean).map(esc).join(' · ')}</p>
    <div class="acts">${f.watch?`<button type="button" class="btn red big" data-play="${i}">${ic('play',18)}Смотреть фильм</button>`:`<span class="btn" aria-disabled="true">${esc(f.year)}</span>`}${f.trailer?`<button type="button" class="btn" data-trailer="${i}">Трейлер</button>`:''}</div>${f.awards?`<ul class="awards" aria-label="Награды фильма">${f.awards.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:''}${f.credits?`<p class="credits">${esc(f.credits)}</p>`:''}`;
  pi=0; person(); places();
  if(location.hash.slice(1)!==f.id&&!['o-brende','partneram','kontakty'].includes(location.hash.slice(1).split('/')[0])) history.replaceState(null,'','#'+f.id);
}
/* ---------- стопка фотокарточек слева: фото героя и кадры со съёмок (правка 91) ----------
   Спереди одна карточка, за ней видны ещё две. Нажатие на карточку, стрелки, свайп или ← → листают:
   верхняя карточка уходит в сторону и ложится под низ стопки. Кадры взяты с сайта АНО «Триумф». */
const DK_POS=['translate(-50%,-50%) rotate(-1.2deg)','translate(calc(-50% + 16px),calc(-50% - 10px)) rotate(4.5deg)','translate(calc(-50% - 14px),calc(-50% - 16px)) rotate(-5.5deg)'];
let dk={list:[],i:0};
function deckList(f,p){
  const L=[];
  if(p.img) L.push({src:p.img,ar:0.8,cap:p.cap||'',op:p.op});
  else if(f.img) L.push({src:f.img,ar:1.6,cap:'афиша фильма'});
  (f.stills||[]).forEach(([src,ar])=>L.push({src,ar,cap:'со съёмок фильма'}));
  return L;
}
function deckHTML(L){
  return `<button type="button" class="dk-full" aria-label="Открыть фото на весь экран" title="На весь экран"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
  <div class="deck" tabindex="0" role="group" aria-roledescription="стопка фотографий" aria-label="Фото к фильму, ${L.length} шт. Листайте стрелками">
    ${L.map((d,k)=>`<figure class="dk${d.cap?'':' nocap'}" data-k="${k}" style="--w:${Math.min(96,Math.round(112*d.ar))}%;--ar:${d.ar}"><img src="${d.src}" alt="${esc(F[i].n)}, фото ${k+1}" ${k>2?'loading="lazy" ':''}style="object-position:${d.op||'50% 35%'}">${d.cap?`<figcaption>${esc(d.cap)}</figcaption>`:''}</figure>`).join('')}
  </div>
  <div class="dk-bar">${L.length>1?`<button type="button" class="round" data-dk="-1" aria-label="Предыдущее фото">${ic('left',18)}</button><span class="dk-n mono"></span><button type="button" class="round" data-dk="1" aria-label="Следующее фото">${ic('right',18)}</button>`:''}</div>
`;
}
function deckDraw(dir){
  const box=$('#prs .deck'); if(!box) return; const n=dk.list.length;
  $$('.dk',box).forEach(c=>{
    const k=+c.dataset.k, rel=((k-dk.i)%n+n)%n;
    c.style.setProperty('--t',DK_POS[Math.min(rel,2)]);
    c.style.zIndex=String(n-rel); c.classList.toggle('hid',rel>2); c.classList.toggle('front',rel===0);
    c.classList.remove('fly-out','fly-in');
    if(dir===1&&rel===n-1){ void c.offsetWidth; c.classList.add('fly-out'); }
    if(dir===-1&&rel===0){ void c.offsetWidth; c.classList.add('fly-in'); }
  });
  const nn=$('#prs .dk-n'); if(nn) nn.textContent=`${dk.i+1} / ${n}`;
}
function deckGo(dir){ const n=dk.list.length; if(n<2) return; dk.i=(dk.i+dir+n)%n; deckDraw(dir); }

/* ---------- просмотр фото на весь экран (правка 102) ----------
   Значок с уголками, как в YouTube. Фото во весь экран на тёмном фоне, листается стрелками,
   свайпом и клавишами ← →, закрывается крестиком, Esc или нажатием мимо фото.
   Где браузер умеет, включается настоящий полноэкранный режим. */
function lightbox(L,start){
  let k=start; const f=F[i];
  const el=document.createElement('div'); el.className='lb'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Фото к фильму '+f.n);
  el.innerHTML=`<div class="lb-top"><span class="lb-n mono"></span><span class="lb-t">${esc(f.n)}</span><button type="button" class="lb-x" aria-label="Закрыть">${ic('x',22)}</button></div>
    <div class="lb-stage"><img alt=""><p class="lb-cap"></p></div>
    ${L.length>1?`<button type="button" class="lb-nav p" aria-label="Предыдущее фото">${ic('left',26)}</button><button type="button" class="lb-nav n" aria-label="Следующее фото">${ic('right',26)}</button>`:''}`;
  document.body.appendChild(el); document.body.classList.add('locked');
  const img=$('img',el), cap=$('.lb-cap',el), num=$('.lb-n',el);
  const show=dir=>{ const d=L[k]; img.classList.remove('in','l','r'); void img.offsetWidth; img.src=d.src; img.alt=f.n+', фото '+(k+1); cap.textContent=d.cap||''; num.textContent=`${k+1} / ${L.length}`; img.classList.add('in',dir<0?'l':'r'); };
  const go=dir=>{ if(L.length<2) return; k=(k+dir+L.length)%L.length; show(dir); };
  const close=()=>{ document.removeEventListener('keydown',key); if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); el.classList.remove('on'); document.body.classList.remove('locked'); setTimeout(()=>el.remove(),300); dk.i=k; deckDraw(0); $('#prs .dk-full')&&$('#prs .dk-full').focus({preventScroll:true}); };
  const key=e=>{ if(e.key==='Escape') close(); if(e.key==='ArrowRight') go(1); if(e.key==='ArrowLeft') go(-1); };
  document.addEventListener('keydown',key);
  $('.lb-x',el).addEventListener('click',close);
  el.addEventListener('click',e=>{ if(e.target===el||e.target.classList.contains('lb-stage')) close(); });
  const p=$('.lb-nav.p',el), n=$('.lb-nav.n',el); if(p) p.addEventListener('click',()=>go(-1)); if(n) n.addEventListener('click',()=>go(1));
  let x0=null; el.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  el.addEventListener('touchend',e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>40) go(dx<0?1:-1); x0=null; });
  show(1); requestAnimationFrame(()=>el.classList.add('on')); $('.lb-x',el).focus({preventScroll:true});
  if(el.requestFullscreen) el.requestFullscreen({navigationUI:'hide'}).catch(()=>{});
  document.addEventListener('fullscreenchange',function fc(){ if(!document.fullscreenElement&&el.isConnected&&el.classList.contains('on')){ document.removeEventListener('fullscreenchange',fc); close(); } });
}
function person(){
  const f=F[i], ids=f.persons, p=D.persons[ids[pi]];
  dk={list:deckList(f,p),i:0};
  $('#prs').innerHTML=`<div class="deckw">${deckHTML(dk.list)}</div>
    <div>${ids.length>1?`<div class="chips" role="group" aria-label="Личности фильма">${ids.map((id,k)=>`<button type="button" class="chip" data-p="${k}" aria-pressed="${k===pi}">${esc(D.persons[id].n)}</button>`).join('')}</div><div style="height:14px"></div>`:''}
      <h3>${esc(p.n)}</h3><p class="yrs">${T(p.years)}</p>${p.txt.map(x=>`<p>${T(x)}</p>`).join('')}</div>`;
  $$('[data-p]',$('#prs')).forEach(b=>b.addEventListener('click',()=>{pi=+b.dataset.p;person();}));
  const box=$('#prs .deck');
  deckDraw(0);
  box.addEventListener('click',()=>deckGo(1));
  $('#prs .dk-full').addEventListener('click',()=>lightbox(dk.list,dk.i));
  $$('[data-dk]',$('#prs')).forEach(b=>b.addEventListener('click',()=>deckGo(+b.dataset.dk)));
  box.addEventListener('keydown',e=>{ if(e.key==='ArrowRight'){e.preventDefault();deckGo(1);} if(e.key==='ArrowLeft'){e.preventDefault();deckGo(-1);} });
  let x0=null; box.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  box.addEventListener('touchend',e=>{ if(x0==null) return; const dx=e.changedTouches[0].clientX-x0; if(Math.abs(dx)>36){ e.preventDefault(); deckGo(dx<0?1:-1); } x0=null; });
}
function places(){
  const f=F[i], ps=f.places.map(id=>PL[id]).filter(Boolean), can=ps.filter(p=>p.st!=='soon');
  $('#places').innerHTML=`<h3>Места съёмок</h3><p>${T(f.placesNote)}</p>
    <div class="chips">${ps.map(p=>`<a class="chip" href="index.html#mesto/${p.id}">${ic('pin',14)}${esc(p.n)}</a>`).join('')}</div>
    <div class="acts">${ps.length?`<a class="btn" href="index.html#mesto/${ps[0].id}">${ic('pin',17)}Показать на карте</a>`:''}${can.length?`<button class="btn" type="button" id="addp">${ic('plus',17)}Добавить места в план</button>`:''}</div>`;
  const b=$('#addp'); if(b) b.addEventListener('click',()=>{const n=A.addMany(can.map(p=>p.id));A.toast(n?`Добавили в план мест ${n}. План на главной, в разделе «Что посмотреть»`:'Эти места уже в плане');});
}

/* плеер: фильм открывается прямо на странице */
const embed=url=>{ if(!url) return '';
  if(/video_ext\.php|rutube\.ru\/play\/embed|kinescope\.io\/embed/.test(url)) return url;
  const vk=url.match(/video(-?\d+)_(\d+)/); if(vk) return 'https://vkvideo.ru/video_ext.php?oid='+vk[1]+'&id='+vk[2]+'&hd=2';
  const rt=url.match(/rutube\.ru\/video\/([0-9a-f]{32})/); if(rt) return 'https://rutube.ru/play/embed/'+rt[1];
  return url; };
function play(url,title){
  A.overlay({title,cls:'player',html:`<div class="frame"><iframe src="${embed(url)}" title="${esc(title)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></div><p class="fine" style="padding:10px 16px">Если видео не запустилось, <a href="${url}" target="_blank" rel="noopener">откройте его на сайте плеера</a>.</p>`});
}
main.addEventListener('click',e=>{const b=e.target.closest('[data-play],[data-trailer]'); if(!b) return; e.stopPropagation();
  const f=F[+(b.dataset.play??b.dataset.trailer)]; if(b.dataset.play!==undefined) play(f.watch,'Фильм '+f.n); else play(f.trailer,'Трейлер '+f.n);});
const go=k=>{i=(k+F.length)%F.length;draw();};
$('.car .p').addEventListener('click',()=>go(i-1)); $('.car .n').addEventListener('click',()=>go(i+1));
$$('#dots button').forEach((b,k)=>b.addEventListener('click',()=>go(k)));
$$('.slide').forEach(s=>s.addEventListener('click',e=>{if(e.target.closest('[data-play]'))return;const k=+s.dataset.k;if(k!==i)go(k);}));
const car=$('#car');car.tabIndex=0;car.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(i-1);if(e.key==='ArrowRight')go(i+1);});
let x0=null;car.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});car.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));x0=null;});
window.addEventListener('hashchange',()=>{const k=F.findIndex(f=>f.id===location.hash.slice(1));if(k>=0&&k!==i)go(k);});
draw();

/* 5.30 форма приглашения фильма */
$('#inv').addEventListener('click',()=>{
  const box=A.overlay({title:'Пригласить фильм',html:`<div style="padding:24px;max-width:640px;margin:0 auto"><form class="form" novalidate data-ok="Заявка на показ отправлена. Мы свяжемся с вами" style="box-shadow:none">
    <h3>Заявка на показ</h3>
    ${A.field('Фильм','film',{options:F.filter(f=>f.watch).map(f=>f.n),req:1})}
    ${A.field('Организация','org',{req:1})}${A.field('Город','city',{req:1})}${A.field('Контакт: телефон или почта','contact',{req:1})}
    ${A.field('Желаемая дата','date',{type:'date'})}${A.field('Комментарий','comment',{area:1})}${A.agree()}
    <button class="btn dark full" type="submit">Отправить заявку</button></form></div>`});
  A.bindForms(box);
});
})();
