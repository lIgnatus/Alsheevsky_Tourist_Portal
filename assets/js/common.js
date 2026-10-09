/* ============================================================
   Общее для всех страниц: иконки (4.5), шапка (5.1–5.3), подвал (5.32),
   оверлеи (3, 5.17–5.18), «О бренде» (6.3), «Стать партнёром» (6.4),
   «Контакты» (6.5), хранение плана (5.3), формы (5.7, 5.23).
   ============================================================ */
(function(){
"use strict";
const A = window.A = {};
const $ = A.$ = (s, r=document) => r.querySelector(s);
const $$ = A.$$ = (s, r=document) => [...r.querySelectorAll(s)];
/* Анимации мягкие и включены всегда (правка 76): при выключенных в системе эффектах анимации заказчик не видел заставку и плавность */
A.reduce = false;
A.esc = s => String(s==null?'':s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* [уточнить] в текстах подсвечивается как заглушка */
A.t = s => A.esc(s).replace(/\[([^\]]+)\]/g, '<span class="todo">[$1]</span>');
A.nf = n => Math.round(n).toLocaleString('ru-RU');
A.rub = n => A.nf(n) + ' ₽';
A.page = document.body.dataset.page || 'home';
A.isHome = A.page === 'home';

/* ---------- 4.5 иконки: линейные 24×24, линия 2 px ---------- */
const P = {
  mountain:'M3 19 9.5 8l4 6.5L16 11l5 8Z',
  columns:'M4 20h16M5.5 9.5h13M12 4l7.5 5h-15ZM7.5 10v8M12 10v8M16.5 10v8',
  tower:'M8.5 21 9.5 10h5l1 11M7.5 10h9M9.5 10V7l2.5-3 2.5 3v3M10.6 15h2.8',
  flag:'M6 21V4M6 4.5h11l-2.2 3.8L17 12H6',
  fork:'M7 3v7M5 3v4.5a2 2 0 0 0 4 0V3M7 10v11M17 21V3c-2.5 1.5-3.5 4.5-3.5 8H17',
  house:'M3.5 11 12 4l8.5 7M6 9.5V20h12V9.5M10 20v-5h4v5',
  calendar:'M4 6h16v14H4ZM4 10.5h16M8.5 3v5M15.5 3v5',
  route:'M6 20.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM18 8.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4ZM8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8',
  caret:'M6 9l6 6 6-6',
  plus:'M12 5v14M5 12h14', x:'M6 6l12 12M18 6 6 18',
  left:'M15 5l-7 7 7 7', right:'M9 5l7 7-7 7', arrow:'M5 12h14M13 6l6 6-6 6',
  copy:'M8 8h12v12H8ZM16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3',
  ext:'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  spark:'M11 2.5l2 5.6 5.5 2-5.5 2L11 17.7l-2-5.6-5.5-2 5.5-2zM19 14l.8 2.2 2.2.8-2.2.8L19 20l-.8-2.2-2.2-.8 2.2-.8z',
  play:'M8 5v14l11-7z',
  pin:'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  check:'M5 12.5l4.5 4.5L19 7.5', clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5',
  users:'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20c.9-3.3 3.3-5 6.5-5s5.6 1.7 6.5 5M16 4.3a3.5 3.5 0 0 1 0 6.4M17.5 15c2 .5 3.4 2.2 4 5',
  menu:'M4 7h16M4 12h16M4 17h16',
  phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
  mail:'M3 6h18v12H3ZM3 7l9 6 9-6',
  max:'M12 4a8 8 0 1 1-4.2 14.8L4 20l1.3-3.7A8 8 0 0 1 12 4Z',
  star:'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z'
};
const FILL = new Set(['play','star']);
A.ic = (name, s=20, cls='') => {
  if (name === 'vk') return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" focusable="false"><path d="M3.2 7h3c.4 3.3 1.9 5.1 3.1 5.4V7h2.9v2.9c1.2-.1 2.4-1.4 2.8-2.9h2.8c-.4 1.9-1.9 3.4-2.9 4 1 .5 2.7 1.7 3.3 4h-3.1c-.5-1.5-1.8-2.8-2.9-2.9V16h-.4C7 16 3.8 13.2 3.2 7z" fill="currentColor"/></svg>`;
  const d = P[name]; if (!d) return '';
  const f = FILL.has(name);
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${s}" height="${s}" aria-hidden="true" focusable="false"><path d="${d}" ${f?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}/></svg>`;
};
A.cone = (w=34, h=26) => `<svg viewBox="0 0 40 30" width="${w}" height="${h}" aria-hidden="true" focusable="false"><path d="M2 28C9 26 14 12 18.5 3.5Q20 1 21.5 3.5C26 12 31 26 38 28Z" fill="currentColor"/></svg>`;
/* ---------- логотип: варианты на выбор, по умолчанию «Гряда» (?logo=название меняет вариант) ---------- */
A.LOGOS = {
  gryada: { n:'Гряда', svg:(w,h)=>`<svg viewBox="0 0 48 30" width="${w}" height="${h}" aria-hidden="true" focusable="false"><path d="M1 28 C5 26 8 20 10.5 13 Q12 9 13.5 13 C14.6 16 15.6 19 17 21 L19 16.2 H25 L27 20 C28.5 18.6 29.8 17.8 31 17.4 L31 15.6 H32.6 L32.6 17.4 C34.2 17.9 35.4 19 36.5 20.5 L38.5 18.6 C40 17.4 41.5 17 43 17.6 C44.6 18.4 45.6 22 47 28 Z" fill="currentColor"/><path d="M30.6 15.6 L31.8 14.2 L33 15.6" fill="none" stroke="currentColor" stroke-width="1"/></svg>` },
  tamga:  { n:'Тамга', svg:(w,h)=>`<svg viewBox="0 0 32 32" width="${h}" height="${h}" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor"/><path d="M8.5 24 L16 8.5 L23.5 24 M16 16 V24" fill="none" stroke="var(--logo-sign,#E2C46B)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  pechat: { n:'Печать', svg:(w,h)=>`<svg viewBox="0 0 40 40" width="${h+6}" height="${h+6}" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="20" cy="20" r="14.5" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="1.5 2"/><path d="M8.5 27 C12 26 15 18 18.4 11.5 Q20 9 21.6 11.5 C25 18 28 26 31.5 27 Z" fill="currentColor"/><path d="M8 29.5 C13 28 16 31 20 29.5 S27 28 32 29.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>` },
  gravyura:{ n:'Гравюра', svg:(w,h)=>`<svg viewBox="0 0 40 30" width="${w}" height="${h}" aria-hidden="true" focusable="false"><defs><clipPath id="lgc"><path d="M2 28C9 26 14 12 18.5 3.5Q20 1 21.5 3.5C26 12 31 26 38 28Z"/></clipPath></defs><g clip-path="url(#lgc)" stroke="currentColor" stroke-width="1.3">${Array.from({length:13},(_,i)=>`<path d="M0 ${3+i*2.1}H40" opacity="${(1-i*0.05).toFixed(2)}"/>`).join('')}</g><path d="M2 28C9 26 14 12 18.5 3.5Q20 1 21.5 3.5C26 12 31 26 38 28" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>` },
  dema:   { n:'Гора и Дёма', svg:(w,h)=>`<svg viewBox="0 0 40 30" width="${w}" height="${h}" aria-hidden="true" focusable="false"><path d="M4 23C10 21 14 11 18.5 3.5Q20 1 21.5 3.5C26 11 30 21 36 23Z" fill="currentColor"/><path d="M2 27.5 C7 25 11 30 16 27.5 S25 25 30 27.5 S36 29 38 27.5" fill="none" stroke="#4F7BAE" stroke-width="2" stroke-linecap="round"/></svg>` }
};
/* «Гряда» в цвете: каждая гора своим цветом. Порядок цветов: Сусактау, Сатыртау, Нарыстау с беседкой, Ярыштау.
   Между горами тонкий зазор цвета фона (--logo-gap), чтобы цвета не сливались. */
A.GRYADA = {
  g1:{ n:'Гряда · земля и вода',   c:['#4E6B3A','#E2B84B','#C0573F','#3F73A8'] },
  g2:{ n:'Гряда · цвета тамги',    c:['#C8372D','#2F7A4A','#E2A92B','#24306E'] },
  g3:{ n:'Гряда · осень в степи',  c:['#6E7F2F','#D08A2E','#9B3B2A','#4D5F70'] },
  g4:{ n:'Гряда · акварель',       c:['#7FA06A','#E0BC6A','#D98C6F','#7FA3C4'] }
};
const gryadaColor = c => (w,h)=>`<svg viewBox="0 0 48 30" width="${w}" height="${h}" aria-hidden="true" focusable="false"><g stroke="var(--logo-gap,#F6F7F2)" stroke-width="1.2" stroke-linejoin="round" paint-order="stroke">
<path d="M13.5 28C16 24.5 17.6 19.5 19 16.2H25L26.6 19.6C28.2 23 30 26.4 32.5 28Z" fill="${c[1]}"/>
<path d="M33.5 28C35.4 23.6 37 19.6 38.5 18.6C40 17.4 41.5 17 43 17.6C44.6 18.4 45.6 22 47 28Z" fill="${c[3]}"/>
<path d="M24.5 28C26.5 24 28.6 18.3 31 17.4V15.6H32.6V17.4C35 18.1 37.6 23.2 40 28Z" fill="${c[2]}"/>
<path d="M1 28C5 26.2 8 20 10.5 13Q12 9 13.5 13C16 20 18.6 25.6 23 28Z" fill="${c[0]}"/></g>
<path d="M30.6 15.6L31.8 14.2L33 15.6" fill="none" stroke="${c[2]}" stroke-width="1" stroke-linejoin="round"/></svg>`;
Object.entries(A.GRYADA).forEach(([k,v])=>{ A.LOGOS[k]={n:v.n,c:v.c,svg:gryadaColor(v.c)}; });
/* Утверждён «Гряда · осень в степи» (правки 78 и 90). ?logo=… показывает другой вариант только на этой странице для сравнения,
   прежний выбор из браузера больше не подменяет утверждённый логотип */
A.logoKey = (()=>{ try{ localStorage.removeItem('alshey.logo'); }catch(e){} const q=new URLSearchParams(location.search).get('logo'); return A.LOGOS[q]?q:'g3'; })();
A.logo = (w=40, h=26) => A.LOGOS[A.logoKey].svg(w,h);
A.cone = A.logo;
/* фильмы, снятые в месте, и ссылка на фильм (правка 89) */
A.filmsOf = id => (D.films||[]).filter(f=>(f.places||[]).includes(id));
A.filmLink = (f, cls='film-link') => `<a class="${cls}" href="filmy.html#${f.id}">${A.ic('play',13)}Фильм ${A.esc(f.n)}</a>`;
A.stars = (r) => `<span class="stars" aria-label="Рейтинг ${r||0} из 5">${[1,2,3,4,5].map(i=>`<span class="${i<=r?'':'e'}">${A.ic('star',15)}</span>`).join('')}</span>`;

/* ---------- иллюстрации-заглушки, пока нет фото (из концепции «Сусактау-код») ---------- */
const PAL={
  day:{sky1:'#9CC3E4',sky2:'#E6EEF0',sun:'#FFF4CC',far:'#AFC3AC',mid:'#7F9D6C',near:'#5D7B48',subj:'#4F6E3C',water:'#6FA3C8',dark:'#2E3A2C',light:'#F6F3E8',accent:'#D9B45A'},
  green:{sky1:'#BBD6E8',sky2:'#EEF3EC',sun:'#FFF0BF',far:'#B9CBB0',mid:'#89A576',near:'#5E7D4A',subj:'#4C6A3A',water:'#79AACB',dark:'#24331F',light:'#FAF7EC',accent:'#E2C46B'},
  warm:{sky1:'#F4CF9C',sky2:'#FBEEDB',sun:'#FFF7E6',far:'#D8BE8C',mid:'#BF9858',near:'#93733F',subj:'#6C532E',water:'#8DB2C8',dark:'#3B2E1C',light:'#FFF8EA',accent:'#C8742E'},
  dusk:{sky1:'#3E4C6C',sky2:'#E8A76B',sun:'#FFD9A3',far:'#6B6377',mid:'#4E4A5B',near:'#2F3139',subj:'#3D3A47',water:'#8A90A8',dark:'#1E1F25',light:'#F4DDBC',accent:'#F0B35A'},
  mono:{sky1:'#C9C9C9',sky2:'#EDEDED',sun:'',far:'#B3B3B3',mid:'#8C8C8C',near:'#686868',subj:'#474747',water:'#A6A6A6',dark:'#222222',light:'#F4F4F4',accent:'#777777'},
  teal:{sky1:'#BFD9D3',sky2:'#EEF4F1',sun:'#FFF3C8',far:'#AFC8BE',mid:'#7FA595',near:'#4F7C6B',subj:'#2F5E50',water:'#6FA6B8',dark:'#163A31',light:'#F7F8F2',accent:'#E9B949'}
};
let SID=0;
const ridge=(seed,y0,amp,w=400,h=260,step=8)=>{let d=`M0 ${h} L0 ${y0}`;for(let x=0;x<=w;x+=step){const y=y0+amp*(.55*Math.sin(x/(31+seed*7)+seed)+.3*Math.sin(x/(11+seed*3)+seed*2.1)+.45*Math.sin(x/(83+seed*5)+seed*.7));d+=` L${x} ${y.toFixed(1)}`;}return d+` L${w} ${h} Z`;};
const coneP=(cx,top,base,half)=>`M${cx-half} ${base} C${cx-half*.5} ${base-14} ${cx-half*.17} ${top+28} ${cx-5} ${top+3} Q${cx} ${top-2} ${cx+5} ${top+3} C${cx+half*.17} ${top+28} ${cx+half*.55} ${base-14} ${cx+half*1.05} ${base} Z`;
const rng=seed=>{let s=seed%233280;return()=>{s=(s*9301+49297)%233280;return s/233280;};};
const trees=(c,xs,base,h)=>xs.map((x,i)=>`<path d="M${x} ${base} l14 0 l-7 -${h+(i%3)*8} z" fill="${c}"/>`).join('');
A.scene = function(spec, o){
  const [kind,pn]=(spec||'cone:day').split(':');o=o||{};const P=PAL[pn]||PAL.day,id='sg'+(++SID);
  const W=P.water,D=P.dark,L=P.light,Ac=P.accent,M=P.mid,N=P.near,S=P.subj;
  let s=`<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient></defs>`;
  if(kind==='craft'||kind==='food'){
    s+=`<rect width="400" height="260" fill="${P.sky2}"/><rect x="250" y="30" width="110" height="120" fill="${P.sky1}" opacity=".55"/><path d="M250 90h110M305 30v120" stroke="${L}" stroke-width="5"/><rect y="182" width="400" height="78" fill="${S}"/><rect y="182" width="400" height="6" fill="${D}" opacity=".35"/>`;
    if(kind==='craft')s+=`<rect x="58" y="112" width="64" height="74" rx="10" fill="${Ac}"/><rect x="54" y="102" width="72" height="14" rx="3" fill="${D}"/><rect x="70" y="134" width="40" height="24" fill="${L}" opacity=".85"/><path d="M168 188 C146 166 152 128 180 120 L180 106 L214 106 L214 120 C242 128 248 166 226 188 Z" fill="${M}"/><path d="M160 150 H234" stroke="${L}" stroke-width="4" opacity=".7"/><rect x="262" y="150" width="96" height="36" rx="6" fill="${N}"/><path d="M272 160 h76 M272 168 h76 M272 176 h76" stroke="${Ac}" stroke-width="2.5" stroke-dasharray="6 5"/>`;
    else s+=`<ellipse cx="150" cy="168" rx="58" ry="10" fill="${D}"/><path d="M92 168 Q150 222 208 168 Z" fill="${Ac}"/><path d="M128 150 q8 -12 0 -24 M150 146 q8 -12 0 -24 M172 150 q8 -12 0 -24" stroke="${L}" stroke-width="3" fill="none" opacity=".8"/><circle cx="292" cy="160" r="28" fill="${M}"/><path d="M318 152 l26 -12 l-4 10 z" fill="${M}"/><rect x="282" y="126" width="20" height="8" rx="3" fill="${D}"/><ellipse cx="60" cy="182" rx="34" ry="7" fill="${L}"/><g fill="${Ac}">${[0,1,2,3,4].map(i=>`<circle cx="${44+i*8}" cy="${174-(i%2)*4}" r="5"/>`).join('')}</g>`;
    return s+'</svg>';
  }
  s+=`<rect width="400" height="260" fill="url(#${id})"/>`;
  if(P.sun&&!o.nosun)s+=`<circle cx="305" cy="62" r="20" fill="${P.sun}"/>`;
  s+=`<path d="${ridge(2,150,12)}" fill="${P.far}"/>`;
  switch(kind){
    case 'film': case 'cone':{s+=`<path d="${coneP(190,58,214,190)}" fill="${M}"/><path d="${ridge(5,206,6)}" fill="${N}"/>`;
      if(kind==='film')s+=`<rect width="400" height="24" fill="#111"/><rect y="236" width="400" height="24" fill="#111"/>`+Array.from({length:16},(_,i)=>`<rect x="${8+i*25}" y="7" width="12" height="10" rx="2" fill="#EEE"/><rect x="${8+i*25}" y="243" width="12" height="10" rx="2" fill="#EEE"/>`).join('');break;}
    case 'lake':s+=`<path d="${ridge(4,176,6)}" fill="${M}"/><rect y="186" width="400" height="74" fill="${W}"/>`+[198,210,224,240].map((y,i)=>`<path d="M${40+i*30} ${y} h${120-i*10} M${230-i*12} ${y+5} h${90+i*8}" stroke="${L}" stroke-opacity=".5" stroke-width="2"/>`).join('');break;
    case 'water':s+=`<rect y="168" width="400" height="92" fill="${W}"/>`+[182,198,216,238].map((y,i)=>`<path d="M${20+i*50} ${y} h${140-i*12}" stroke="${L}" stroke-opacity=".45" stroke-width="2"/>`).join('');
      s+=o.tents?`<path d="M60 168 L92 120 L124 168 Z M150 168 L178 128 L206 168 Z" fill="${L}"/><path d="M92 120 V168 M178 128 V168" stroke="${D}" stroke-width="2"/>`:`<rect x="250" y="206" width="48" height="5" rx="2" fill="${D}"/><path d="M274 206 v-18" stroke="${D}" stroke-width="2.5"/><circle cx="274" cy="184" r="4" fill="${D}"/>`;break;
    case 'rocks':s+=`<path d="${ridge(6,190,5)}" fill="${N}"/><path d="M0 260 L0 70 L40 60 L70 90 L110 84 L150 120 L170 260 Z" fill="${M}"/><path d="M400 260 L400 80 L360 70 L320 100 L290 96 L250 140 L235 260 Z" fill="${S}"/><g stroke="${Ac}" stroke-width="3.2" fill="none" stroke-linecap="round"><path d="M44 134 l8 -16 l8 16 M52 126 v12"/><path d="M94 144 v20 M88 150 h12"/><path d="M58 174 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M66 166 v-8"/><path d="M330 150 v22 M342 150 v22 M330 161 h12"/></g>`;break;
    case 'station':s+=`<path d="${ridge(3,196,4)}" fill="${N}"/><rect x="96" y="132" width="170" height="68" fill="${S}"/><path d="M88 134 L181 104 L274 134 Z" fill="${D}"/>`+[0,1,2,3,4].map(i=>`<rect x="${110+i*31}" y="148" width="16" height="26" rx="8" fill="${L}" fill-opacity=".85"/>`).join('')+`<rect x="296" y="86" width="30" height="114" fill="${S}"/><rect x="288" y="74" width="46" height="18" fill="${D}"/><path d="M286 74 L311 58 L336 74Z" fill="${D}"/><path d="M0 222 H400 M0 236 H400" stroke="${D}" stroke-width="3"/>`;break;
    case 'house':s+=`<path d="${ridge(7,186,8)}" fill="${M}"/>${trees(N,[24,52,334,362],204,44)}<rect x="130" y="150" width="130" height="62" fill="${S}"/><path d="M118 152 L195 106 L272 152Z" fill="${D}"/><rect x="150" y="166" width="26" height="22" fill="${Ac}"/><rect x="214" y="166" width="26" height="22" fill="${Ac}" fill-opacity=".8"/><rect x="184" y="176" width="20" height="36" fill="${D}"/><path d="${ridge(8,212,4)}" fill="${N}"/>`;break;
    case 'yurt':s+=`<path d="${coneP(300,96,196,110)}" fill="${M}" opacity=".9"/><path d="${ridge(9,196,5)}" fill="${N}"/><path d="M120 202 V160 Q170 118 220 160 V202 Z" fill="${L}"/><path d="M120 160 Q170 118 220 160" fill="none" stroke="${D}" stroke-width="3"/><path d="M120 172 H220" stroke="${Ac}" stroke-width="5"/><rect x="160" y="178" width="20" height="24" fill="${D}"/>`;break;
    case 'field':s+=`<path d="${ridge(10,180,8)}" fill="${M}"/><path d="${ridge(11,214,5)}" fill="${N}"/><path d="M-10 250 C80 200 160 240 230 210 S360 190 410 200" fill="none" stroke="${L}" stroke-opacity=".55" stroke-width="3" stroke-dasharray="8 7"/>`;break;
    case 'fest':{const r=rng(7),cols=[Ac,L,W,S,D];s+=`<path d="${ridge(12,190,6)}" fill="${M}"/><rect x="196" y="30" width="6" height="200" fill="${D}"/>`;for(let i=0;i<70;i++)s+=`<circle cx="${(r()*400).toFixed(1)}" cy="${(222+r()*30).toFixed(1)}" r="${(5+r()*2.5).toFixed(1)}" fill="${cols[Math.floor(r()*5)]}"/>`;s+=`<path d="${ridge(13,240,3)}" fill="${N}"/>`;break;}
    case 'museum':s+=`<path d="${ridge(14,200,4)}" fill="${N}"/><path d="M100 104 L200 70 L300 104 Z" fill="${D}"/><rect x="104" y="104" width="192" height="10" fill="${S}"/>`+[0,1,2,3,4].map(i=>`<rect x="${118+i*36}" y="114" width="16" height="74" fill="${L}" fill-opacity=".9"/>`).join('')+`<rect x="96" y="188" width="208" height="10" fill="${S}"/><rect x="86" y="198" width="228" height="10" fill="${D}"/>`;break;
  }
  return s+'</svg>';
};
/* фото с запасной иллюстрацией: сначала своё фото, потом ссылка из реестра, потом рисунок */
A.img = (srcs, scene, so, alt='') => {
  const list = srcs.filter(Boolean);
  if (!list.length) return A.scene(scene, so);
  const rest = A.esc(JSON.stringify(list.slice(1)));
  return `<img src="${A.esc(list[0])}" alt="${A.esc(alt)}" loading="lazy" referrerpolicy="no-referrer" data-rest="${rest}" data-scene="${A.esc(scene||'cone:day')}" onerror="A.imgFail(this)">`;
};
A.imgFail = el => {
  let rest=[];try{rest=JSON.parse(el.dataset.rest||'[]');}catch(e){}
  if (rest.length){ el.dataset.rest=JSON.stringify(rest.slice(1)); el.src=rest[0]; return; }
  const t=document.createElement('template'); t.innerHTML=A.scene(el.dataset.scene); el.replaceWith(t.content.firstChild);
};

/* ---------- подложка карты ----------
   Если в data.js вписан ключ MapTiler, карта идёт с MapTiler.
   Без ключа работает OSM France: данные OpenStreetMap, подписи на русском, регистрация не нужна.
   Если тайлы не грузятся, карта сама переходит на следующий источник. */
A.baseLayer = map => {
  const M=D.map||{}, osm='© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">участники OpenStreetMap</a>', list=[];
  if(M.maptilerKey) list.push({url:`https://api.maptiler.com/maps/${M.maptilerStyle||'streets-v2'}/256/{z}/{x}/{y}.png?key=${M.maptilerKey}`,o:{maxZoom:19,attribution:'© <a href="https://www.maptiler.com/copyright/" target="_blank" rel="noopener">MapTiler</a> '+osm}});
  list.push({url:'https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png',o:{subdomains:'abc',maxZoom:19,attribution:osm+', OSM France'}});
  list.push({url:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',o:{maxZoom:19,attribution:'© Esri, '+osm}});
  let layer=null;
  const use=k=>{
    if(layer) map.removeLayer(layer);
    let bad=0, good=0;
    layer=L.tileLayer(list[k].url,list[k].o).addTo(map);
    layer.on('tileload',()=>good++);
    layer.on('tileerror',()=>{ if(++bad>=3 && !good && k<list.length-1) use(k+1); });
  };
  use(0);
};

/* ---------- план поездки (хранится в браузере, 5.3, 6.2) ---------- */
const KEY='alshey.plan.v2';
A.state = (()=>{ try{ return Object.assign({ids:[],from:'ufa',days:1,who:'2',car:'car',cons:8,price:62}, JSON.parse(localStorage.getItem(KEY)||'{}')); }catch(e){ return {ids:[],from:'ufa',days:1,who:'2',car:'car',cons:8,price:62}; } })();
A.save = () => { try{ localStorage.setItem(KEY, JSON.stringify(A.state)); }catch(e){} };
A.inPlan = id => A.state.ids.includes(id);
A.toggle = id => {
  const i=A.state.ids.indexOf(id), added = i<0;
  if (added) A.state.ids.push(id); else A.state.ids.splice(i,1);
  A.save(); A.updCounter(added); document.dispatchEvent(new CustomEvent('plan:change'));
  return added;
};
A.addMany = ids => { let n=0; ids.forEach(id=>{ if(!A.inPlan(id)){A.state.ids.push(id);n++;} }); if(n){A.save();A.updCounter(true);document.dispatchEvent(new CustomEvent('plan:change'));} return n; };
A.updCounter = bump => {
  const c=$('#counter'); if(!c) return;
  const n=A.state.ids.length, em=$('em',c);
  em.textContent=n; c.classList.toggle('on', n>0);
  c.setAttribute('aria-label', `Маршрут: ${n} ${n%10===1&&n%100!==11?'место':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'места':'мест'} в плане`);
  if (bump && !A.reduce){ em.classList.remove('bump'); void em.offsetWidth; em.classList.add('bump'); }
};

/* ---------- шапка: логотип и верхняя панель ----------
   Закреплена сверху и полупрозрачна. При прокрутке вниз уезжает, при прокрутке вверх возвращается.
   На главной поверх видео она прозрачная со светлым текстом. Кнопки «Маршрут» нет (правка 53). */
function header(){
  const h=$('#hdr'); if(!h) return;
  h.className='';
  h.innerHTML=`<div class="hdr wide">
    <a class="logo" href="index.html" aria-label="Альшеевский район, туристический портал, на главную">${A.logo()}<span><b>Альшеевский район</b><i>туристический портал</i></span></a>
    <button class="burger" type="button" aria-label="Меню" aria-expanded="false">${A.ic('menu',22)}</button>
    <nav class="topnav" aria-label="Верхняя панель">
      <button type="button" data-open="o-brende" aria-expanded="false">О бренде</button>
      <button type="button" data-open="partneram" aria-expanded="false">Стать партнёром</button>
      <button type="button" data-open="kontakty" aria-expanded="false">Контакты</button>
    </nav>
  </div>`;
  const nav=$('.topnav',h), bg=$('.burger',h);
  bg.addEventListener('click',()=>{const o=nav.classList.toggle('open');bg.setAttribute('aria-expanded',String(o));h.classList.add('solid');});
  $$('[data-open]',h).forEach(b=>b.addEventListener('click',()=>{nav.classList.remove('open');bg.setAttribute('aria-expanded','false');location.hash=b.dataset.open;}));
  let lastY=scrollY, busy=false;
  const upd=()=>{
    busy=false; const y=scrollY, open=nav.classList.contains('open');
    h.classList.toggle('solid', !A.isHome || y>30 || open);
    if(y>lastY+6 && y>140 && !open && !h.contains(document.activeElement)) h.classList.add('hide');
    else if(y<lastY-6 || y<=140) h.classList.remove('hide');
    document.documentElement.classList.toggle('hdr-shown', !h.classList.contains('hide') && y>140);
    lastY=y;
  };
  addEventListener('scroll',()=>{ if(!busy){ busy=true; requestAnimationFrame(upd); } },{passive:true});
  h.addEventListener('focusin',()=>h.classList.remove('hide'));
  upd();
}

/* ---------- подвал ---------- */
function footer(){
  const f=$('#ftr'); if(!f) return;
  f.className='foot';
  const y=new Date().getFullYear();
  f.innerHTML=`<div class="wrap in">
    <div><a class="logo" href="index.html">${A.logo()}<span><b>Альшеевский район</b><i>туристический портал</i></span></a></div>
    <nav aria-label="Разделы">${D.tiles.map(t=>`<a href="${t.href}">${t.n}</a>`).join('')}<a href="index.html#chto-posmotret">Что посмотреть</a><a href="tamgi.html">Маршрут по знакам</a></nav>
    <div class="soc"><a href="${D.contacts.ano.vk}" target="_blank" rel="noopener">${A.ic('vk',20)}ВКонтакте</a></div>
    <div class="low"><a href="#" data-todo="policy">Политика конфиденциальности</a><a href="#" data-todo="policy">Согласие на обработку персональных данных</a><span>© участники OpenStreetMap</span><span style="margin-left:auto">© ${y} Туристический портал Альшеевского района</span></div>
  </div>`;
  $$('[data-todo]',f).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();A.toast('Текст документа [уточнить]');}));
}

/* ---------- тост ---------- */
A.toast = msg => {
  let t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:90;background:#1F2B22;color:#fff;border-radius:12px;padding:10px 16px;font:500 14px "Tinos","Times New Roman",Times,serif;box-shadow:0 14px 30px -14px rgba(0,0,0,.5);transition:opacity .25s;max-width:90vw';document.body.appendChild(t);}
  t.innerHTML=A.t(msg); t.style.opacity='1'; clearTimeout(t._h); t._h=setTimeout(()=>t.style.opacity='0',2600);
};

/* ---------- 3 оверлеи ---------- */
let cur=null;
A.overlay = function(o){
  A.closeOverlay(true);
  const veil=document.createElement('div'); veil.className='veil';
  const box=document.createElement('div');
  box.className=(o.drawer?'drawer':'ovl')+(o.cls?' '+o.cls:'');
  box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label',o.title);
  box.innerHTML=`<div class="ovl-h">${o.drawer?`<b>${A.esc(o.title)}</b>`:`<span>${A.esc(o.title)}</span>`}<button class="round" type="button" data-x aria-label="Закрыть">${A.ic('x',18)}</button></div><div class="ovl-b">${o.html}</div>`;
  document.body.append(veil,box); document.body.classList.add('locked');
  const back=document.activeElement;
  cur={veil,box,o,back};
  /* сначала браузер рисует окно в начальном положении, потом оно плавно выезжает */
  void box.offsetWidth; requestAnimationFrame(()=>requestAnimationFrame(()=>{veil.classList.add('on');box.classList.add('on');}));
  veil.addEventListener('click',()=>A.closeOverlay());
  $('[data-x]',box).addEventListener('click',()=>A.closeOverlay());
  box.addEventListener('keydown',e=>{
    if(e.key==='Escape'){e.stopPropagation();A.closeOverlay();}
    if(e.key==='Tab'){const f=$$('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]',box).filter(x=>x.offsetParent!==null);if(!f.length)return;const a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  });
  $$('.topnav [data-open]').forEach(b=>b.setAttribute('aria-expanded',String(o.hash&&o.hash.split('/')[0]===b.dataset.open)));
  setTimeout(()=>$('[data-x]',box).focus({preventScroll:true}),30);
  if(o.init) o.init(box);
  return box;
};
A.closeOverlay = function(silent){
  if(!cur) return; const {veil,box,o,back}=cur; cur=null;
  veil.classList.remove('on'); box.classList.remove('on');
  setTimeout(()=>{veil.remove();box.remove();}, A.reduce?0:520);
  document.body.classList.remove('locked');
  $$('.topnav [data-open]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if(!silent && o.hash && location.hash.slice(1).split('/')[0]===o.hash.split('/')[0]){
    if(o.nav) history.back(); else history.replaceState(null,'',location.pathname+location.search);
  }
  if(o.onClose) o.onClose();
  if(back && back.focus && !silent) back.focus({preventScroll:true});
};
A.ovlHash = () => cur && cur.o.hash;
A.markNav = () => { if(cur) cur.o.nav = true; };

/* ---------- 6.3 О бренде: вкладки, окно на весь экран (правка 74) ---------- */
const TABS=[{id:'',n:'О бренде'},{id:'etnokompleks',n:'ЭтноКомплекс'},{id:'lyudi',n:'Люди проекта'}];
function brandTab(id){
  if(id==='etnokompleks') return `<h3>ЭтноКомплекс</h3><div class="soon">Скоро здесь появится информация</div>`;
  if(id==='lyudi') return `<h3>Люди проекта</h3><p class="muted" style="font-size:14px">Состав и подписи пришлёт заказчик <span class="todo">[уточнить]</span></p><div class="people">${D.people.map(p=>`<figure class="person" style="margin:0"><img src="${p.img}" alt="${A.esc(p.n)}" loading="lazy"><b>${A.esc(p.n)}</b><span>${A.esc(p.role)}</span></figure>`).join('')}</div>`;
  return `<h3>Земля Альшея, бренд территории</h3>
    <p>Альшеевский район носит имя Альшея Мергена Тохтанаева, башкирского батыра XVIII века. Он основал деревню Альшеево, с неё и начинается летопись района. «Земля Альшея» объединяет то, что сейчас делается в районе: фильмы о земляках, краеведческие встречи и будущий ЭтноКомплекс.</p>
    <p>Портал помогает понять, куда поехать, где остановиться и у кого купить то, что сделано здесь.</p>
    <p><span class="todo">[Рассказ о том, как появился бренд, пришлёт заказчик. Исторические факты берём только из проверенных источников.]</span></p>
    <div class="brand-logo">
      <div class="bl-sign">${A.logo(230,144)}</div>
      <div><h4>Логотип «Гряда»</h4>
        <p>Четыре горы района стоят в один ряд, как их видно с дороги: Сусактау, Сатыртау, Нарыстау с беседкой на вершине и Ярыштау. Каждая гора своим цветом, цвета взяты у осенней степи.</p>
        <div class="bl-sw">${(A.LOGOS[A.logoKey].c||[]).map((c,k)=>`<span><i style="background:${c}"></i>${['Сусактау','Сатыртау','Нарыстау','Ярыштау'][k]}</span>`).join('')}</div>
      </div>
    </div>`;
}
function openBrand(tab){
  const box=A.overlay({title:'О бренде',cls:'col page',hash:'o-brende'+(tab?'/'+tab:''),html:`
    <div class="b-col" aria-hidden="true">
      <div class="b-title">Земля<br>Альшея</div>
      <div class="stk" style="left:36%;top:64px;width:min(460px,46%);height:250px"><div class="cut"></div></div>
      <div class="stk w ticket" style="left:24%;top:190px;width:236px;transform:rotate(-6deg)"><div><small>Самаро-Уфимская ж. д.</small><b>Станция Аксёново</b><i>билет III класса</i></div></div>
      <figure class="stk r postcard" style="left:70%;top:26px;width:170px;margin:0;transform:rotate(8deg)"><div class="halftone" style="height:112px">${A.scene('station:mono')}</div><figcaption>открытка из архива · <span class="todo">[источник]</span></figcaption></figure>
      <div class="stk r" style="left:86%;top:170px;transform:rotate(12deg)"><svg width="52" height="120" viewBox="0 0 70 160"><path d="M26 4h18v30c0 6 16 14 16 34v80c0 6-4 9-10 9H20c-6 0-10-3-10-9V68c0-20 16-28 16-34z" fill="#F5F2EA"/><rect x="10" y="84" width="50" height="44" fill="#D3261B"/><text x="35" y="111" text-anchor="middle" font-family="Tinos, Times New Roman, serif" font-size="11" font-weight="700" fill="#F5F2EA">КУМЫСЪ</text></svg></div>
    </div>
    <div class="tabs" role="tablist">${TABS.map(t=>`<button type="button" role="tab" data-tab="${t.id}" aria-selected="${t.id===(tab||'')}">${t.n}</button>`).join('')}</div>
    <div class="tabp" role="tabpanel">${brandTab(tab||'')}</div>`});
  $$('[data-tab]',box).forEach(b=>b.addEventListener('click',()=>{
    $$('[data-tab]',box).forEach(x=>x.setAttribute('aria-selected',String(x===b)));
    const p=$('.tabp',box); p.classList.remove('swap'); p.innerHTML=brandTab(b.dataset.tab); void p.offsetWidth; p.classList.add('swap');
    cur.o.hash='o-brende'+(b.dataset.tab?'/'+b.dataset.tab:'');
    history.replaceState(null,'','#'+cur.o.hash);
  }));
}

/* ---------- 6.4 Стать партнёром: можно выбрать несколько вариантов ---------- */
function openPartner(){
  const sel=new Set(['craft']);
  const cond=()=>sel.size?D.partnerTypes.filter(t=>sel.has(t.id)).map(t=>`<h4>${A.esc(t.n)}</h4><ul>${t.cond.map(c=>`<li>${A.t(c)}</li>`).join('')}</ul>`).join(''):`<p class="muted" style="margin:0">Выберите один или несколько вариантов выше, и здесь появятся условия</p>`;
  const box=A.overlay({title:'Стать партнёром',cls:'page',hash:'partneram',html:`<div class="pt">
    <div>
      <h2>Станьте партнёром портала</h2>
      <p class="lead">Расскажем о вас гостям из Уфы, Самары, Казани и других городов. Заявки и вопросы будут приходить прямо к вам.</p>
      <span class="pcount">${A.esc(D.partnersNow)}</span>
      <p class="ptip">Можно выбрать несколько вариантов</p>
      <div class="ptypes" role="group" aria-label="Кто вы, можно выбрать несколько">${D.partnerTypes.map(t=>`<button type="button" class="ptype" data-pt="${t.id}" aria-pressed="${sel.has(t.id)}">${A.ic(t.ic,26)}<b>${t.n}</b></button>`).join('')}</div>
      <div class="pcond" id="pcond">${cond()}</div>
    </div>
    <form class="form" novalidate data-ok="Спасибо! Заявка отправлена, мы свяжемся с вами">
      <h3>Заявка</h3>
      <input type="hidden" name="type" value="${[...sel].join(',')}">
      ${A.field('Фамилия и имя','name',{req:1,ph:'Например, Хасанова Айгуль'})}
      ${A.field('Телефон','phone',{req:1,type:'tel'})}
      ${A.field('Контакт в соцсетях','social',{ph:'Ссылка на ВКонтакте, Telegram или MAX'})}
      ${A.field('Комментарий','comment',{area:1,ph:'Например: сдаём дом на шесть человек, есть баня, можем встретить с электрички в Раевке'})}
      ${A.agree()}
      <button class="btn dark full" type="submit">Отправить заявку</button>
    </form></div>`});
  $$('[data-pt]',box).forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.pt; if(sel.has(id)) sel.delete(id); else sel.add(id);
    b.setAttribute('aria-pressed',String(sel.has(id)));
    const pc=$('#pcond',box); pc.classList.remove('swap'); pc.innerHTML=cond(); void pc.offsetWidth; pc.classList.add('swap'); $('input[name="type"]',box).value=[...sel].join(',');
  }));
  A.bindForms(box);
}

/* ---------- Контакты: Гридина и АНО отдельно, из соцсетей только ВКонтакте ---------- */
function openContacts(){
  const C=D.contacts;
  const row=(v,kind)=>`<div class="ct-row"><a class="ct-v" href="${kind==='tel'?'tel:'+v.replace(/[^\d+]/g,''):'mailto:'+v}">${A.ic(kind==='tel'?'phone':'mail',17)}<span>${A.esc(v)}</span></a><button class="btn" type="button" data-copy="${A.esc(v)}">${A.ic('copy',15)}Копировать</button></div>`;
  const vk=p=>`<a class="btn vkb" href="${p.vk}" target="_blank" rel="noopener">${A.ic('vk',20)}${A.esc(p.vkName)}</a>`;
  const box=A.overlay({drawer:true,title:'Контакты',hash:'kontakty',html:`<div class="ct">
    <section class="ct-blk"><h4>${A.esc(C.gridina.name)}</h4><small>${A.esc(C.gridina.role)}</small>${row(C.gridina.phone,'tel')}${vk(C.gridina)}</section>
    <section class="ct-blk"><h4>${A.esc(C.ano.name)}</h4><small>${A.esc(C.ano.role)}</small>${row(C.ano.email,'mail')}${vk(C.ano)}</section>
  </div>`});
  $$('[data-copy]',box).forEach(b=>b.addEventListener('click',()=>A.copy(b.dataset.copy).then(()=>{b.lastChild.textContent='Скопировано';setTimeout(()=>b.lastChild.textContent='Копировать',1600);})));
}
A.copy = txt => (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).catch(()=>{const t=document.createElement('textarea');t.value=txt;document.body.appendChild(t);t.select();try{document.execCommand('copy');}catch(e){}t.remove();});

/* ---------- 5.7 поля и формы ---------- */
A.field = (label, name, o={}) => {
  const id='f-'+name+'-'+(++SID);
  const ctl = o.area ? `<textarea id="${id}" name="${name}"${o.req?' required':''}${o.ph?` placeholder="${A.esc(o.ph)}"`:''}></textarea>`
    : o.options ? `<select id="${id}" name="${name}"${o.req?' required':''}>${o.options.map(x=>`<option>${A.esc(x)}</option>`).join('')}</select>`
    : `<input id="${id}" name="${name}" type="${o.type||'text'}"${o.req?' required':''}${o.min!=null?` min="${o.min}"`:''}${o.val!=null?` value="${o.val}"`:''}${o.type==='tel'?' inputmode="tel" autocomplete="tel" placeholder="+7 900 123-45-67"':''}${o.ph?` placeholder="${A.esc(o.ph)}"`:''}${name==='name'?' autocomplete="name"':''}>`;
  return `<div class="fld"><label for="${id}">${A.esc(label)}${o.req?' *':''}</label>${ctl}<span class="err"></span></div>`;
};
A.agree = () => `<label class="agree"><input type="checkbox" name="agree" required><span>Согласен на обработку персональных данных и с <a href="#" data-todo-policy>политикой конфиденциальности</a> *</span></label>`;
A.bindForms = root => $$('form.form',root).forEach(f=>{
  $$('[data-todo-policy]',f).forEach(a=>a.addEventListener('click',e=>{e.preventDefault();A.toast('Текст политики [уточнить]');}));
  f.addEventListener('submit',e=>{
    e.preventDefault(); let ok=true, first=null;
    $$('.fld',f).forEach(w=>{const c=$('input,textarea,select',w);let msg='';
      if(c.required&&!c.value.trim()) msg='Заполните поле';
      else if(c.type==='tel'&&c.value.trim()&&c.value.replace(/\D/g,'').length<10) msg='Введите номер полностью, например +7 900 123-45-67';
      w.classList.toggle('bad',!!msg);$('.err',w).textContent=msg;if(msg){ok=false;first=first||c;}});
    const ag=$('.agree',f);if(ag){const c=$('input',ag);ag.classList.toggle('bad',!c.checked);if(!c.checked){ok=false;first=first||c;}}
    if(!ok){first.focus();return;}
    f.innerHTML=`<div class="sent-ok">${A.ic('check',36)}<b>${A.esc(f.dataset.ok||'Заявка отправлена. Мы свяжемся с вами')}</b></div>`;
  });
});

/* ---------- 5.22 галерея ---------- */
A.gallery = function(slides){
  const n=slides.length;
  return `<div class="gal" data-gal tabindex="0" aria-roledescription="галерея">${slides.map((s,i)=>`<div class="sl${i?'':' on'}">${s}</div>`).join('')}
    ${n>1?`<button class="nav p" type="button" aria-label="Предыдущее фото">${A.ic('left',20)}</button><button class="nav n" type="button" aria-label="Следующее фото">${A.ic('right',20)}</button>`:''}</div>
    ${n>1?`<div class="dots">${slides.map((_,i)=>`<button type="button" aria-label="Фото ${i+1}" aria-current="${!i}"></button>`).join('')}</div>`:''}`;
};
A.bindGallery=root=>$$('[data-gal]',root).forEach(g=>{
  const sl=$$('.sl',g), dots=$$('.dots button',g.parentElement); let i=0;
  const go=k=>{i=(k+sl.length)%sl.length;sl.forEach((s,j)=>s.classList.toggle('on',j===i));dots.forEach((d,j)=>d.setAttribute('aria-current',String(j===i)));};
  const p=$('.nav.p',g),n=$('.nav.n',g); if(p)p.addEventListener('click',()=>go(i-1)); if(n)n.addEventListener('click',()=>go(i+1));
  dots.forEach((d,j)=>d.addEventListener('click',()=>go(j)));
  g.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')go(i-1);if(e.key==='ArrowRight')go(i+1);});
  let x0=null;g.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});g.addEventListener('touchend',e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)go(i+(dx<0?1:-1));x0=null;});
});


/* ---------- фон: схема участка у Сусактау и Сатыртау в цветах высоты (правка 79).
   ?fon=b1…b5 включает прежние исполнения для сравнения, ?fon=0 убирает фон ---------- */
A.FONS={map:'схема у Сусактау',b1:'B1, тонкие линии',b2:'B2, как на топокарте',b3:'B3, рельеф по краям',b4:'B4, цвет по высоте',b5:'B5, штрих гравюры'};
function fon(){
  const q=new URLSearchParams(location.search).get('fon'); let v=null;
  try{ localStorage.removeItem('alshey.fon'); }catch(e){} v=q;
  if(v==='0') return;
  const chosen=!!A.FONS[v]&&v!=='map';
  if(!chosen) v='map';
  document.body.classList.add('fon-'+v);
  if(!chosen) return;
  const t=document.createElement('a'); t.className='fon-badge'; t.href='soglasovanie/fon.html'; t.innerHTML=`Фон ${A.FONS[v]} <u>сравнить</u>`; document.body.appendChild(t);
}

/* ---------- маршрутизация по якорю (3: ссылкой можно поделиться, «Назад» закрывает) ---------- */
function route(ev){
  const h=location.hash.slice(1), [k,sub]=h.split('/');
  const want = k==='o-brende'||k==='partneram'||k==='kontakty' ? h : null;
  if(!want){ if(cur&&cur.o.hash&&['o-brende','partneram','kontakty'].includes(cur.o.hash.split('/')[0])) A.closeOverlay(true); return; }
  if(A.ovlHash()===want) return;
  if(k==='o-brende') openBrand(sub||''); else if(k==='partneram') openPartner(); else openContacts();
  if(cur) cur.o.nav = !!ev;
}
A.route = route;

document.addEventListener('DOMContentLoaded',()=>{
  header(); footer(); fon();
  window.addEventListener('hashchange',route);
  route(null);
  window.addEventListener('storage',e=>{ if(e.key===KEY){ try{A.state=Object.assign(A.state,JSON.parse(e.newValue||'{}'));}catch(_){} A.updCounter(false); document.dispatchEvent(new CustomEvent('plan:change')); } });
});
})();
