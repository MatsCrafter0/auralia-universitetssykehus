'use strict';
const names=['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'];
const weekdays=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
const pad=n=>String(n).padStart(2,'0');
const iso=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
const utcDate=(y,m,d)=>new Date(Date.UTC(y,m,d));
const addDays=(date,n)=>new Date(date.getTime()+n*86400000);
const key=date=>date.toISOString().slice(0,10);
function easter(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k+7)%7,m=Math.floor((a+11*h+22*l)/451),month=Math.floor((h+l-7*m+114)/31),day=(h+l-7*m+114)%31+1;return utcDate(y,month-1,day)}
function events(y){
 const all=new Map();function add(date,title,type,description=''){const k=typeof date==='string'?date:key(date);if(!all.has(k))all.set(k,[]);all.get(k).push({title,type,description})}
 const fixed=(m,d,title,type='holiday',description='')=>add(iso(y,m-1,d),title,type,description);
 const e=easter(y);const movable=(offset,title,type='holiday')=>add(addDays(e,offset),title,type);
 fixed(1,1,'Første nyttårsdag');fixed(5,1,'Arbeidernes dag');fixed(5,17,'Grunnlovsdagen');fixed(12,25,'Første juledag');fixed(12,26,'Andre juledag');
 movable(-7,'Palmesøndag','observance');movable(-3,'Skjærtorsdag');movable(-2,'Langfredag');movable(-1,'Påskeaften','observance');movable(0,'Første påskedag');movable(1,'Andre påskedag');movable(39,'Kristi himmelfartsdag');movable(48,'Pinseaften','observance');movable(49,'Første pinsedag');movable(50,'Andre pinsedag');
 fixed(2,6,'Samenes nasjonaldag','observance');fixed(3,8,'Den internasjonale kvinnedagen','observance');fixed(5,8,'Frigjøringsdagen','observance');fixed(6,23,'Sankthansaften','observance');fixed(6,24,'Sankthans','observance');fixed(10,24,'FN-dagen','observance');fixed(10,31,'Halloween','observance');fixed(12,24,'Julaften','observance');fixed(12,31,'Nyttårsaften','observance');
 const nthSunday=(month,n)=>{const first=utcDate(y,month,1).getUTCDay();return 1+(7-first)%7+(n-1)*7};
 fixed(2,nthSunday(1,2),'Morsdag','observance');fixed(11,nthSunday(10,2),'Farsdag','observance');
 const advent=addDays(utcDate(y,11,25),-((utcDate(y,11,25).getUTCDay()+7)%7)-21);
 for(let n=0;n<4;n++)add(addDays(advent,7*n),(n+1)+'. søndag i advent','observance');
 // A single confirmed user-provided launch date, not repeated annually.
 if(y===2027)add('2027-01-06','Lansering av Unit 2.0','event','Unit 2.0 lanseres. Egen markering for Auralia.');
 return all;
}
const $=id=>document.getElementById(id);
const now=new Date();let year=now.getFullYear(),month=now.getMonth(),selected=iso(year,month,now.getDate());
const yearSelect=$('year');for(let y=2020;y<=2045;y++){const option=document.createElement('option');option.value=y;option.textContent=y;yearSelect.append(option)}
function dateLabel(k){const [y,m,d]=k.split('-').map(Number);return d+'. '+names[m-1]+' '+y}
function eventList(container,entries,showDate=false){container.replaceChildren();if(!entries.length){const p=document.createElement('p');p.textContent='Ingen registrerte hendelser.';container.append(p);return}for(const [k,event] of entries){const box=document.createElement('div');box.className='entry';const title=document.createElement('b');title.textContent=event.title;const meta=document.createElement('small');meta.textContent=(showDate?dateLabel(k)+' · ':'')+(event.type==='holiday'?'Helligdag / høytidsdag':event.type==='event'?'Sykehusaktivitet':'Merkedag');box.append(title,meta);if(event.description){const p=document.createElement('p');p.textContent=event.description;box.append(p)}container.append(box)}}
function render(){const ev=events(year);$('month-label').textContent=names[month][0].toUpperCase()+names[month].slice(1)+' '+year;yearSelect.value=year;const cal=$('calendar');cal.replaceChildren();const first=utcDate(year,month,1);const offset=(first.getUTCDay()+6)%7;const count=new Date(Date.UTC(year,month+1,0)).getUTCDate();const todayKey=iso(now.getFullYear(),now.getMonth(),now.getDate());
 for(let i=0;i<Math.ceil((offset+count)/7)*7;i++){const date=utcDate(year,month,1-offset+i),k=key(date),items=ev.get(k)||[],inMonth=date.getUTCMonth()===month;const btn=document.createElement('button');btn.type='button';btn.className='calendar-day'+(!inMonth?' outside':'')+(date.getUTCDay()===0?' sunday':'')+(items.some(x=>x.type==='holiday')?' holiday':'')+(k===todayKey?' today':'')+(k===selected?' selected':'');btn.setAttribute('aria-label',dateLabel(k)+(items.length?', '+items.map(x=>x.title).join(', '):''));const num=document.createElement('span');num.className='num';num.textContent=date.getUTCDate();btn.append(num);for(const item of items.slice(0,2)){const t=document.createElement('span');t.className='mini '+item.type;t.textContent=item.title;btn.append(t)}if(items.length>2){const t=document.createElement('span');t.className='mini';t.textContent='+'+(items.length-2)+' til';btn.append(t)}btn.addEventListener('click',()=>{if(!inMonth){year=date.getUTCFullYear();month=date.getUTCMonth()}selected=k;render()});cal.append(btn)}
 $('day-label').textContent=dateLabel(selected);const selectedEvents=(ev.get(selected)||[]).map(e=>[selected,e]);if(!selectedEvents.length&&utcDate(...selected.split('-').map((v,i)=>i===1?Number(v)-1:Number(v))).getUTCDay()===0)selectedEvents.push([selected,{title:'Søndag',type:'holiday'}]);eventList($('day-events'),selectedEvents);
 const monthly=[...ev.entries()].filter(([k])=>k.startsWith(year+'-'+pad(month+1)+'-')).flatMap(([k,arr])=>arr.map(x=>[k,x])).sort((a,b)=>a[0].localeCompare(b[0]));eventList($('month-events'),monthly,true);
}
function move(n){const d=utcDate(year,month+n,1);year=d.getUTCFullYear();month=d.getUTCMonth();selected=iso(year,month,1);render()}
$('prev').addEventListener('click',()=>move(-1));$('next').addEventListener('click',()=>move(1));$('today').addEventListener('click',()=>{year=now.getFullYear();month=now.getMonth();selected=iso(year,month,now.getDate());render()});yearSelect.addEventListener('change',()=>{year=Number(yearSelect.value);selected=iso(year,month,1);render()});render();