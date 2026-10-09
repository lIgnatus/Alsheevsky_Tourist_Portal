/* Главная: заставка с горой, видео на весь экран и плашки гор. */
(function(){
"use strict";
const {$,esc}=A;

/* ---------- видео: ролик идёт по кругу без звука ----------
   Ролик лежит прямо в разметке, браузер начинает грузить его сразу.
   Если браузер не дал запустить видео сам (экономия трафика, строгие настройки),
   показываем круглую кнопку запуска, а пока видно постер. */
const v=$('#heroVideo'), hero=$('#hero'), playBtn=$('.hero-play',hero);
const tryPlay=()=>{const p=v.play(); if(p&&p.catch) p.catch(()=>{ if(v.paused) playBtn.hidden=false; });};
v.muted=true;
const ok=()=>{hero.classList.add('playing');playBtn.hidden=true;};
['playing','timeupdate'].forEach(ev=>v.addEventListener(ev,ok));
if(!v.paused) ok();
if(v.readyState>=2) tryPlay(); else v.addEventListener('canplay',tryPlay,{once:true});
setTimeout(()=>{ if(v.paused&&v.currentTime===0) playBtn.hidden=false; },3500);
playBtn.addEventListener('click',()=>{v.muted=true;v.play();});

/* ---------- три ролика по кругу со сменой наплывом (правка 80) ----------
   Первый ролик стоит в разметке и стартует сразу. Следующий начинает грузиться заранее
   во втором видео, за секунду до конца текущего видео плавно меняются местами. */
const CLIPS=['hero','hero2','hero3'], Q=matchMedia('(max-width:767px)').matches?'720':'1080';
const v2=document.createElement('video'); v2.muted=true; v2.playsInline=true; v2.preload='auto'; v2.setAttribute('aria-hidden','true'); v2.setAttribute('playsinline','');
v.after(v2); v.loop=false; v.classList.add('on');
const vids=[v,v2]; let cur=0, k=0, switching=false;
const prep=(el,i)=>{ if(el.dataset.clip===String(i)) return; el.dataset.clip=i; el.autoplay=false; el.removeAttribute('autoplay'); el.src=`assets/video/${CLIPS[i]}-${Q}.mp4`; el.poster=`assets/video/${CLIPS[i]}-poster.jpg`; el.load(); };
const swap=()=>{
  const nv=vids[1-cur], nk=(k+1)%CLIPS.length;
  if(nv.dataset.clip!==String(nk)||nv.readyState<3){ const o=vids[cur]; o.currentTime=0; o.play().catch(()=>{}); prep(nv,nk); return; }
  switching=true; nv.currentTime=0; nv.play().catch(()=>{});
  nv.classList.add('on'); vids[cur].classList.remove('on');
  const old=vids[cur]; setTimeout(()=>{ old.pause(); switching=false; },1200);
  cur=1-cur; k=nk;
};
vids.forEach(el=>{
  el.addEventListener('timeupdate',()=>{ if(el!==vids[cur]||switching||!el.duration) return;
    const left=el.duration-el.currentTime;
    if(left<Math.max(6,el.duration/2)) prep(vids[1-cur],(k+1)%CLIPS.length);
    if(left<1) swap(); });
  el.addEventListener('ended',()=>{ if(el===vids[cur]&&!switching) swap(); });
});
['touchstart','click','scroll','keydown'].forEach(ev=>window.addEventListener(ev,()=>{ if(v.paused&&!v.ended) tryPlay(); },{once:true,passive:true}));
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&v.paused) tryPlay(); });

/* ---------- плашки гор: гравюра в цветах горы, мелко название горы (правка 106) ---------- */
const tiles=$('#tiles');
tiles.innerHTML=D.tiles.map((t,i)=>{const g=GORY[t.key];return `<a class="mc${t.ev?' ev':''}" href="${t.href}" style="--mc-c:${g.dark};--mc-l:${g.line};--i:${i}">
  <span class="art">${g.svg}</span>
  <span class="mc-txt"><b>${t.n}</b><span>${t.hint}</span><small class="gora-n">${esc(t.gora)}</small></span></a>`;}).join('');


/* ---------- первый экран целиком в окне: видео плюс плашки ----------
   Высоту видео считаем от того, сколько плашки выступают ниже него. */
const fit=()=>{
  const below=Math.max(0,tiles.getBoundingClientRect().bottom-hero.getBoundingClientRect().bottom);
  document.documentElement.style.setProperty('--below',Math.round(below)+'px');
};
fit(); addEventListener('resize',fit); document.fonts&&document.fonts.ready.then(fit);

/* ---------- заставка: гора, логотип и приветствие 4,5 с, потом выезжают плашки (правки 68 и 77) ----------
   Показывается при первом заходе за сеанс и при обновлении страницы. */
let seen=false; try{ seen=sessionStorage.getItem('alshey.intro')==='1'; sessionStorage.setItem('alshey.intro','1'); }catch(e){}
const nav=performance.getEntriesByType&&performance.getEntriesByType('navigation')[0];
if(nav&&nav.type==='reload') seen=false;
const enter=()=>tiles.classList.add('enter');
if(!seen && !location.hash){
  document.body.classList.add('intro');
  hero.insertAdjacentHTML('beforeend',`<div class="intro-box" aria-hidden="true"><span class="lg">${A.logo(120,76)}</span><p>Добро пожаловать на Землю Альшея</p><span class="bar"><i></i></span></div><button class="intro-skip" type="button">Пропустить</button>`);
  let done=false;
  const finish=()=>{
    if(done) return; done=true;
    scrollTo(0,0); document.body.classList.remove('intro'); enter();
    setTimeout(()=>{ hero.querySelectorAll('.intro-box,.intro-skip').forEach(x=>x.remove()); fit(); },1300);
  };
  setTimeout(finish,4500);
  $('.intro-skip',hero).addEventListener('click',finish);
  ['wheel','touchmove','keydown'].forEach(ev=>addEventListener(ev,finish,{once:true,passive:true}));
} else enter();
})();
