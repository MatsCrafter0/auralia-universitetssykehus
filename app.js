let tree={},flat=[];const $=id=>document.getElementById(id);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const route=(b,p)=>'#/'+b+'/'+p;function flatten(nodes,book){let out=[];for(const n of nodes){out.push({...n,book});out.push(...flatten(n.children||[],book))}return out}function navItem(n,b,depth=0){const active=decodeURIComponent(location.hash.slice(1))==='/'+b+'/'+n.path;const children=n.children||[];const current=decodeURIComponent(location.hash.slice(1));const expanded=children.some(c=>current==='/'+b+'/'+c.path||current.startsWith('/'+b+'/'+c.path+'/'));const link='<a class="'+(depth===0?'section ':'')+(active?'active':'')+'" href="'+route(b,n.path)+'"'+(active?' aria-current="page"':'')+'>'+esc(n.title)+'</a>';return children.length?'<div class="nav-group"><div class="nav-group-heading">'+link+'<button type="button" class="nav-toggle" aria-label="Vis eller skjul '+esc(n.title)+'" aria-expanded="'+expanded+'">⌄</button></div><div class="nested"'+(expanded?'':' hidden')+'>'+children.map(c=>navItem(c,b,depth+1)).join('')+'</div></div>':link}function renderNav(b,q=''){if(q){const matches=flatten(tree[b],b).filter(n=>n.title.toLowerCase().includes(q.toLowerCase()));$('nav').innerHTML=matches.map(n=>'<a href="'+route(b,n.path)+'">'+esc(n.title)+'</a>').join('')||'<p>Ingen treff</p>'}else $('nav').innerHTML=tree[b].map(n=>navItem(n,b)).join('')}async function render(){const hash=decodeURIComponent(location.hash.slice(1));const m=hash.match(/^\/(hovedhandbok|laerlinger|lover-og-regler)\/(.+)$/);const isEmployees=hash==='/ansattliste';const isContract=hash==='/arbeidskontrakt';$('home').hidden=!!m||isEmployees||isContract;$('reader').hidden=!m;$('employees').hidden=!isEmployees;$('contract').hidden=!isContract;document.body.classList.remove('menu-open');if(isEmployees){window.scrollTo(0,0);loadEmployees();return}if(isContract){window.scrollTo(0,0);return}if(!m)return;const [_,b,p]=m;const pages=flatten(tree[b],b);const ix=pages.findIndex(n=>n.path===p);if(ix<0){location.hash='#/';return}const page=pages[ix];$('bookTitle').textContent=b==='laerlinger'?'Lærlinghåndbok':b==='lover-og-regler'?'Lover og regler':'Hovedhåndbok';$('search').value='';renderNav(b);$('breadcrumbs').textContent=(b==='laerlinger'?'Lærlinghåndbok':b==='lover-og-regler'?'Lover og regler':'Hovedhåndbok')+' / '+(p.includes('/')?p.split('/').slice(0,-1).join(' / ').replaceAll('-',' ')+' / ':'')+page.title;$('page-toc').hidden=true;$('article').innerHTML='<p>Laster inn…</p>';try{const response=await fetch('innhold/'+b+'/'+p+'.md');if(!response.ok)throw Error('Siden ble ikke funnet');let md=await response.text();if(window.marked){marked.setOptions({gfm:true,breaks:false});$('article').innerHTML=marked.parse(md);for(const a of $('article').querySelectorAll('a[href]')){try{const u=new URL(a.href,location.href);if(!u.hostname.endsWith('gitbook.io')||!u.hostname.includes('auralia'))continue;const segments=decodeURIComponent(u.pathname).split('/').filter(Boolean);const book=segments.includes('bFQZOUHYM4q2rhjvjWcV')||u.hostname.includes('auralia-universitetssykehus-docs')?'hovedhandbok':segments.includes('taoYXLjcjzz2zNBS7uaT')||u.hostname.includes('laerling')?'laerlinger':b;const pages=flatten(tree[book]||[],book);const clean=x=>x.replace(/^\\d{2}-/,'').toLowerCase();const source=segments.map(clean);const target=pages.find(p=>{const dest=p.path.split('/').map(clean);return dest.length<=source.length&&dest.every((part,i)=>part===source[source.length-dest.length+i])});a.href=target?route(book,target.path):route(book,'velkommen');}catch(e){}}}else{$('article').textContent=md}renderPageToc()}catch(e){$('article').textContent='Kunne ikke laste inn siden: '+e.message}const prev=pages[ix-1],next=pages[ix+1];$('pager').innerHTML=(prev?'<a href="'+route(b,prev.path)+'">← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="'+route(b,next.path)+'">'+esc(next.title)+' →</a>':'');window.scrollTo(0,0)}$('search').addEventListener('input',e=>{const b=location.hash.split('/')[1];if(tree[b])renderNav(b,e.target.value)});$('menu').addEventListener('click',()=>document.body.classList.toggle('menu-open'));window.addEventListener('hashchange',render);fetch('navigasjon.json').then(r=>r.json()).then(j=>{tree=j;render()}).catch(()=>{$('home').innerHTML='<p>Kunne ikke laste inn navigasjonen.</p>'});
const employeeSheetId='1BHY4o3eRJWvleRgDok8kp4zFnQTw5z0ljbdf46zKVtc';
let employeeRows=[],employeeHeaders=[],employeeLoadedSheet='',employeeRequest=0;
const employeeAllowedSheets=['Direktoratet/Ledelsen','Avd. Lege','Avd. Psykiatrisk','Avd. Ambulanse/Paramedic','AMB Skolen','Ansattdata','Oppsigelse'];
const employeeSourceSheets={'Direktoratet/Ledelsen':'DirektoratetLedelsen','Avd. Psykiatrisk':'Avd. Psykriatisk','Avd. Ambulanse/Paramedic':'Avd. AmbulanseParamedic'};
const employeeFallbackData={"Avd. Psykiatrisk":"eJyVksFqg0AQhl9l8ShRdidpkvZmTwnUEnKVHJa4aUXrFmcb6CXP1XtfrKNbIWk1YWDB3fGfb+f3N8uCZylVMAkA3rTDQ9EYOqTavRorthaxNkiFpEbtHG1O6zBcn2izMhWanOSl+/5q+oKIhKdJmEdyEamlkPKhW8FukgX0yq8n6n3xvA6XIMZinAlt1xggPB9JFDW+/wdMewDZbWG5qZyO7d7ouvPb7D9QrHR1tA2a+q9jz0/pSiR8Kehyc4Gf9Z6ViiTc9vxLTNJHsaVh7QXs7qpZ33jMYz+F2OBnWWjXFFieQ+bXIP0nF/o2J1ajpHYaerSdtrJtZRMpyZMz6eM/wqB8ypPPePLxoAbl45EMyhc8+ZInv2fJgZcq8FIFXqrASxV4qQIvVeClCj7V3Q/EuGR2","Avd. Ambulanse/Paramedic":"eJyVk81OwkAURl9l0iWhzfwgoLsaTSARY9gSFiOMSiit6RSWPJd7X8wLbQ3IvRcnaaAM5/s6t6edzaJnKVXUjbTe2Mq/rUoHPya2+nCFmBbe587DQpp7W1Vwsh93OuM9nIxc5t0S8HX1/VW2CyIWdZvU/VgOYjUUUt4dj2jenUXwV308Qfa97jvWpd4ngu7UhxRV0Dndkljl/vOywLQFMO6hbOmyyibFwtn8OG+52HoxstmuKL3L/05c90/gkh7q1wIu7s7qe+3MSsVSX5+5aUwn92IKmy3Oym7YYevgbpnUuxDp5nWb2dy704oBV9HecGGvtSSK7IEa+Hyxpd3AyuJwex4fYiPDE7RbKmGCE73gBC2BSvSDE7QlKjEMTtyGJpQkE/DYNg+tab5j0WOM4zztG+dp2zhPu8Z52jTO055xnraM87RjnP81HP8vECpYcYIbTJ/gnF8EN9z2EZ7Ti+CcXQTn5CI45xbBObUITr+7GK45rwgeplWHadXMW9tQ6oRmpCI04xShGaUIzRhFaEYoQjM+L2nD6ERoxiZCMzIROsilCXJpglyaIJcmyKWpXc5/AI/JdVI="};
async function showEmployeeFallback(sheet,request){
 const encoded=employeeFallbackData[sheet];
 if(!encoded||request!==employeeRequest)return false;
 try{
  const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
  const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  const rows=JSON.parse(await new Response(stream).text());
  if(request!==employeeRequest)return true;
  employeeHeaders=['TN','Discord','Navn','Ansatt/Ledig','Distinksjon','Stilling','Kallesignal','Ansettelsesdato'];
  employeeRows=rows.map(row=>row.map((v,i)=>i===7&&/^\\d{4}-\\d{2}-\\d{2}/.test(v)?v.slice(8,10)+'.'+v.slice(5,7)+'.'+v.slice(0,4):v));
  employeeLoadedSheet=sheet;
  renderEmployees();
  $('employee-status').textContent+=' (lagret kopi fra Excel – ikke direkteoppdatert)';
  return true;
 }catch(e){return false}
}
function employeeRoleColor(role){
 const s=String(role||'').toLocaleLowerCase('no').trim();
 if(/^(helsedirektør|ass\.? helsedirektør|helse inspektør|medisinsk leder|amb rektor)$/.test(s))return 'rank-director';
 if(/avd\.? leder|opplæringsanvarlig|opplæringsansvarlig/.test(s))return 'rank-lead';
 if(s==='overlege')return 'rank-overlege';
 if(s==='lege')return 'rank-lege';
 if(s==='legestudent')return 'rank-student';
 if(s==='psykolog')return 'rank-psykolog';
 if(s==='paramedic')return 'rank-paramedic';
 if(s==='lærling'||s==='elev')return 'rank-laerling';
 if(/^amb\s*[123]$/.test(s))return 'rank-amb';
 return '';
}
function employeeGroup(role){
 const s=String(role||'').toLocaleLowerCase('no').trim();
 if(/^(helsedirektør|ass\.? helsedirektør|helse inspektør|medisinsk leder|amb rektor)$/.test(s))return 'direktorat';
 if(/avd\.? leder lege/.test(s))return 'leder-lege';
 if(/avd\.? leder psykiatrisk/.test(s))return 'leder-psykiatrisk';
 if(/avd\.? leder ambulanse/.test(s))return 'leder-ambulanse';
 if(/opplæringsanvarlig|opplæringsansvarlig/.test(s))return 'opplaering';
 if(/^(overlege|lege|legestudent|psykolog|paramedic|lærling|amb [123])$/.test(s))return s;
 return s;
}
function employeeProfile(row){
 const get=(re)=>{const i=employeeHeaders.findIndex(h=>re.test(String(h).trim()));return i>=0?String(row[i]??'').trim():''};
 const name=get(/^navn$|ansatt.*navn|discord.*navn/i)||'Ansatt';
 const fields=[['Tjenestenummer',get(/^(?:tn|tjeneste(?:nummer|nr))$/i)],['Kallesignal',get(/kallesignal/i)],['Stilling',get(/stilling|rolle|grad/i)],['Avdeling',$('employee-sheet').value],['Status',get(/ansatt\/ledig|status/i)],['Ansatt dato',get(/ansettelsesdato|ansatt dato|ansettelse/i)]];
 const courseNames=['Cad','Samband','160.0','LPS','LA-SAR','LA','LA Instruktør','Dykker','ILH','ILH Instruktør','Instruktør'];
 const courseCols=employeeHeaders.map((h,i)=>({h:String(h),v:String(row[i]??'').trim()})).filter(x=>courseNames.some(n=>n.toLowerCase()===x.h.toLowerCase())||/kurs|kompetanse|opplæring|godkjenn|sertif|utdanning|eksamen|prøve|bevis|hlr|akutt|utrykning/i.test(x.h));
 const courseLabel=v=>/^(?:1|true|ja|x|✓|✔|godkjent|bestått|fullført)$/i.test(v)?'Godkjent':/^(?:0|false|nei|ikke godkjent|ikke bestått|ikke fullført)$/i.test(v)?'Ikke Godkjent':v||'Ikke registrert';
 const statusColor=v=>/^(?:ja|bestått|godkjent|fullført|true|x|✓|✔|1)$/i.test(v)?'profile-course-ok':/under|pågår|opplæring/i.test(v)?'profile-course-progress':/^(?:nei|ikke bestått|ikke godkjent|false|0)$/i.test(v)?'profile-course-no':'';
 const old=document.getElementById('employee-profile');if(old)old.remove();
 const overlay=document.createElement('div');overlay.id='employee-profile';overlay.className='employee-profile-overlay';
 overlay.innerHTML='<section class="employee-profile-card" role="dialog" aria-modal="true" aria-label="Personalkort for '+esc(name)+'"><button type="button" class="employee-profile-close" aria-label="Lukk personalkort">×</button><div class="employee-profile-kicker">🏥 Auralia Universitetssykehus</div><h2>👤 '+esc(name)+'</h2><div class="employee-profile-fields">'+fields.filter(x=>x[1]).map(([k,v])=>'<div><small>'+esc(k)+'</small><strong>'+esc(v)+'</strong></div>').join('')+'</div><h3>🎓 Kurs og kompetanse</h3>'+(courseCols.length?'<div class="employee-profile-courses">'+courseCols.map(x=>'<div><span>'+esc(x.h)+'</span><strong class="'+statusColor(x.v)+'">'+esc(courseLabel(x.v))+'</strong></div>').join('')+'</div>':'<p>Ingen egne kurskolonner er registrert for denne avdelingen.</p>')+'</section>';
 document.body.appendChild(overlay);
 const close=()=>{overlay.remove();document.removeEventListener('keydown',onKey)};
 const onKey=e=>{if(e.key==='Escape')close()};
 overlay.addEventListener('click',e=>{if(e.target===overlay||e.target.closest('.employee-profile-close'))close()});
 document.addEventListener('keydown',onKey);overlay.querySelector('button').focus();
}
document.addEventListener('click',e=>{const tr=e.target.closest('#employee-table tbody tr[data-employee-index]');if(tr)employeeProfile(employeeRows[Number(tr.dataset.employeeIndex)])});
document.addEventListener('keydown',e=>{const tr=e.target.closest('#employee-table tbody tr[data-employee-index]');if(tr&&(e.key==='Enter'||e.key===' ')){e.preventDefault();employeeProfile(employeeRows[Number(tr.dataset.employeeIndex)])}});
function renderEmployees(){
 const scrollable=['Ansattdata','Oppsigelse'].includes($('employee-sheet').value);
 const tableWrap=$('employee-table').closest('.employee-table-wrap');
 if(tableWrap)tableWrap.classList.toggle('employee-table-scrollable',scrollable);
 const q=$('employee-search').value.trim().toLocaleLowerCase('no');
 const roleIndex=employeeHeaders.findIndex(h=>/stilling|rolle|grad/i.test(h));
 const badgeIndex=employeeHeaders.findIndex(h=>/distinksjon/i.test(h));
 const statusIndex=employeeHeaders.findIndex(h=>/ansatt\/ledig|status/i.test(h));
 const rows=employeeRows.map((row,index)=>({row,index})).filter(({row})=>row.some(v=>String(v).toLocaleLowerCase('no').includes(q)));
 const visibleColumns=employeeHeaders.map((h,i)=>i).filter(i=>!/^(?:Cad|Samband|160\.0|LPS|LA-SAR|LA|LA Instruktør|Dykker|ILH|ILH Instruktør|Instruktør)$/i.test(String(employeeHeaders[i]).trim()));
 let prevGroup='';
 $('employee-table').innerHTML='<thead><tr>'+visibleColumns.map(i=>'<th scope="col">'+esc(employeeHeaders[i])+'</th>').join('')+'</tr></thead><tbody>'+rows.map(({row,index})=>{
  const role=roleIndex>=0?row[roleIndex]:'';
  const rank=employeeRoleColor(role);
  const group=employeeGroup(role);
  const dropdownSheet=['Ansattdata','Oppsigelse'].includes($('employee-sheet').value);
  const separator=!dropdownSheet&&roleIndex>=0&&prevGroup&&group!==prevGroup;
  prevGroup=group;
  return '<tr data-employee-index="'+index+'" tabindex="0" role="button" aria-label="Åpne personalkort"'+(separator?' class="employee-group-start"':'')+'>'+visibleColumns.map(i=>{const v=row[i];
   let cl='';
   if(i===roleIndex&&dropdownSheet)cl=' class="employee-dropdown '+(rank||'rank-unassigned')+'"';
   else if(i===roleIndex&&rank)cl=' class="employee-role '+rank+'"';
   else if(i===badgeIndex)cl=' class="employee-distinction '+(String(role).toLocaleLowerCase('no').trim()==='helsedirektør'||/^ass\.? helsedirektør$/i.test(String(role).trim())?'rank-top':'rank-normal')+'"';
   else if(i===statusIndex){
    const status=String(v??'').trim().toLocaleLowerCase('no');
    const statusClasses={'ledig':'employee-vacant','ansatt':'employee-active','ferie':'employee-on-leave','permitert':'employee-permitted','vikar':'employee-substitute','sykemeldt':'employee-sick'};
    if(statusClasses[status])cl=' class="'+statusClasses[status]+'"';
   }
   return '<td'+cl+'>'+esc(v)+'</td>';
  }).join('')+'</tr>';
 }).join('')+'</tbody>';
 $('employee-status').textContent=rows.length+' av '+employeeRows.length+' rader vises i '+$('employee-sheet').value+'.';
}
function loadEmployees(force=false){
 const sheet=$('employee-sheet').value;if(!employeeAllowedSheets.includes(sheet))return;
 if(!force&&employeeLoadedSheet===sheet)return;
 const request=++employeeRequest;employeeLoadedSheet='';$('employee-table').innerHTML='';$('employee-status').textContent='Henter '+sheet+' fra Google Sheets…';
 const cb='auraliaSheetCallback'+request;
 const script=document.createElement('script');script.id='employee-data-script-'+request;
 let settled=false;
 const cleanup=()=>{delete window[cb];script.remove()};
 window[cb]=async function(res){
  if(settled||request!==employeeRequest)return;settled=true;cleanup();
  try{
   if(res.status!=='ok'||!res.table)throw Error('Google Sheets returnerte ingen data');
   const cols=res.table.cols||[];
   let rows=(res.table.rows||[]).map(r=>cols.map((_,i)=>{const v=r.c?.[i];return v?.f??v?.v??''})).filter(row=>row.some(v=>String(v).trim()));
   let headers=cols.map((col,i)=>col.label||col.id||'Kolonne '+(i+1));
   const headerAt=rows.findIndex(row=>row.some(v=>/^(navn|stilling|discord|ansatt\/ledig|kallesignal|tn)$/i.test(String(v).trim())));
   if(headerAt>=0&&headerAt<4){headers=rows[headerAt].map((v,i)=>String(v).trim()||headers[i]);rows=rows.slice(headerAt+1)}
   const courseNames={9:'Cad',10:'Samband',11:'160.0',12:'LPS',13:'LA-SAR',14:'LA',15:'LA Instruktør',16:'Dykker',17:'ILH',18:'ILH Instruktør',19:'Instruktør'};
   if(!['Ansattdata','Oppsigelse'].includes(sheet))headers=headers.map((h,i)=>courseNames[i]&&/^(?:[A-Z]{1,2}|Kolonne \d+|)$/i.test(String(h).trim())?courseNames[i]:h);
   const courseColumn=i=>!['Ansattdata','Oppsigelse'].includes(sheet)&&i>=9&&i<=19;
   const keep=headers.map((h,i)=>i).filter(i=>courseColumn(i)||rows.some(r=>String(r[i]??'').trim()!=='')||(!rows.length&&headers[i]));
   // GViz sometimes exposes the date column as its spreadsheet letter "V" instead of the header in row 2.
   // In the source workbook, column V is Ansettelsesdato on the department tabs.
   if(!['Ansattdata','Oppsigelse'].includes(sheet)){
    headers=headers.map((h,i)=>i===21&&/^(?:V|Kolonne 22|Ansettelsesdato)$/i.test(String(h).trim())?'Ansettelsesdato':h);
   }
   // A nonexistent sheet name can silently return the first worksheet. Never show directorate data as another department.
   const expectedRole={'Avd. Lege':/\b(?:overlege|lege)\b/i,'Avd. Psykiatrisk':/psykolog/i,'Avd. Ambulanse\/Paramedic':/paramedic/i,'AMB Skolen':/\b(?:lærling|elev)\b/i};
   if(sheet==='Avd. Ambulanse/Paramedic'&&!headers.some(h=>/^(stilling|kallesignal|tn)$/i.test(String(h).trim()))&&!rows.some(row=>row.some(v=>/paramedic|MED-30/i.test(String(v))))){
    throw Error('Ambulansefanen returnerte bare tomme kolonner. Kontroller at lenken peker til riktig fane.');
   }
   const expected=expectedRole[sheet];
   if(expected&&!rows.some(row=>row.some(value=>expected.test(String(value??''))))){
    throw Error('Feil regnearkfane: '+sheet+' fikk ikke sine egne stillinger.');
   }
   employeeHeaders=keep.map(i=>headers[i]);
   employeeRows=rows.map(row=>keep.map(i=>row[i]??'')).filter(row=>{
    if(!row.some(v=>String(v).trim()))return false;
    // Exclude footer/formatting rows containing only a distinction symbol.
    // A real employee slot has a job title, callsign, name or service number.
    const title=employeeHeaders.findIndex(h=>/^(stilling|stillingstittel|rolle)$/i.test(String(h).trim()));
    const call=employeeHeaders.findIndex(h=>/kallesignal/i.test(String(h)));
    const name=employeeHeaders.findIndex(h=>/^navn$/i.test(String(h).trim()));
    const number=employeeHeaders.findIndex(h=>/^(tn|tjenestenr\.?|tjenestenummer)$/i.test(String(h).trim()));
    const meaningful=[title,call,name,number].filter(i=>i>=0);
    return meaningful.length?meaningful.some(i=>String(row[i]??'').trim()):true;
   });
   employeeLoadedSheet=sheet;renderEmployees();
  }catch(e){if(!await showEmployeeFallback(sheet,request)){$('employee-table').innerHTML='';$('employee-status').textContent=String(e.message||'Kunne ikke hente denne fanen.');}}
 };
 const sheetSelector=sheet==='Avd. Ambulanse/Paramedic'?'gid=957259046&range=B2:V':'sheet='+encodeURIComponent(employeeSourceSheets[sheet]||sheet);
 script.src='https://docs.google.com/spreadsheets/d/'+employeeSheetId+'/gviz/tq?'+sheetSelector+'&tqx='+encodeURIComponent('out:json;responseHandler:'+cb)+'&tq='+encodeURIComponent('select *')+'&_='+Date.now();
 script.onerror=async()=>{if(settled||request!==employeeRequest)return;settled=true;cleanup();if(!await showEmployeeFallback(sheet,request))$('employee-status').textContent='Kunne ikke laste fanen. Kontroller tilgang i Google Sheets.'};
 document.head.appendChild(script);
 setTimeout(async()=>{if(settled||request!==employeeRequest)return;settled=true;cleanup();if(!await showEmployeeFallback(sheet,request))$('employee-status').textContent='Google Sheets svarte ikke for denne fanen.'},12000);
}
$('employee-sheet').addEventListener('change',()=>{employeeLoadedSheet='';loadEmployees(true)});
$('employee-search').addEventListener('input',()=>{if(employeeLoadedSheet)renderEmployees()});
$('employee-refresh').addEventListener('click',()=>loadEmployees(true));


/* Håndboksøk, kapittelnavigasjon og innholdsfortegnelse */
function renderPageToc(){
 const toc=$('page-toc');if(!toc)return;
 const heads=[...$('article').querySelectorAll('h2,h3')];toc.replaceChildren();
 if(heads.length<3){toc.hidden=true;return}
 const label=document.createElement('strong');label.textContent='På denne siden';toc.append(label);
 heads.forEach((h,i)=>{const id='avsnitt-'+i;h.id=id;const a=document.createElement('a');a.href='#'+id;a.textContent=h.textContent;a.className=h.tagName==='H3'?'toc-sub':'';a.addEventListener('click',e=>{e.preventDefault();h.scrollIntoView({behavior:'smooth',block:'start'});history.replaceState(null,'',location.pathname+location.search+location.hash.split('#avsnitt-')[0]);});toc.append(a)});
 toc.hidden=false;
}
$('nav').addEventListener('click',e=>{const btn=e.target.closest('.nav-toggle');if(!btn)return;const nested=btn.closest('.nav-group').querySelector('.nested');nested.hidden=!nested.hidden;btn.setAttribute('aria-expanded',String(!nested.hidden))});
const searchDialog=$('global-search-dialog'),searchInput=$('global-search-input'),searchResults=$('global-search-results'),searchStatus=$('global-search-status');
let searchIndex=null,searchLoading=null,searchBook='all',searchRequest=0;
const searchNormalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/æ/g,'ae').replace(/ø/g,'o').replace(/å/g,'a').toLowerCase();
function searchOpen(){searchDialog.hidden=false;document.body.classList.add('search-open');searchInput.focus();if(!searchIndex&&!searchLoading)loadSearchIndex()}
function searchClose(){searchDialog.hidden=true;document.body.classList.remove('search-open');$('global-search-open').focus()}
$('global-search-open').addEventListener('click',searchOpen);
$('sidebar-global-search').addEventListener('click',searchOpen);
$('global-search-close').addEventListener('click',searchClose);
searchDialog.querySelector('[data-close-search]').addEventListener('click',searchClose);
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchOpen()}else if(e.key==='Escape'&&!searchDialog.hidden)searchClose()});
searchDialog.querySelectorAll('[data-book]').forEach(btn=>btn.addEventListener('click',()=>{searchBook=btn.dataset.book;searchDialog.querySelectorAll('[data-book]').forEach(b=>b.classList.toggle('active',b===btn));showSearchResults()}));
searchInput.addEventListener('input',showSearchResults);
async function loadSearchIndex(){
 if(searchLoading)return searchLoading;
 searchStatus.textContent='Klargjør søk i håndbøkene…';
 searchLoading=(async()=>{
  const pages=[...flatten(tree.hovedhandbok||[],'hovedhandbok'),...flatten(tree.laerlinger||[],'laerlinger'),...flatten(tree['lover-og-regler']||[],'lover-og-regler')];
  const results=new Array(pages.length);let next=0,done=0;
  async function worker(){while(next<pages.length){const i=next++,p=pages[i];try{const response=await fetch('innhold/'+p.book+'/'+p.path+'.md');if(!response.ok)throw Error('HTTP '+response.status);const md=await response.text();const plain=md.replace(/!\[[^\]]*\]\([^)]*\)/g,' ').replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[#*_`>|]/g,' ').replace(/\s+/g,' ').trim();results[i]={...p,plain,normalized:searchNormalize(p.title+' '+plain)}}catch(e){results[i]=null}done++;if(done%12===0)searchStatus.textContent='Indekserer håndbøker: '+done+' av '+pages.length+' sider…'}}
  await Promise.all(Array.from({length:6},worker));searchIndex=results.filter(Boolean);searchLoading=null;showSearchResults();
 })().catch(e=>{searchLoading=null;searchStatus.textContent='Kunne ikke klargjøre søket. Prøv igjen senere.';console.warn(e)});
 return searchLoading;
}
function showSearchResults(){
 const q=searchNormalize(searchInput.value.trim());searchResults.replaceChildren();
 if(!searchIndex){if(!searchLoading)loadSearchIndex();return}
 if(!q){searchStatus.textContent='Skriv et søkeord for å søke i '+searchIndex.length+' håndboksider.';return}
 const words=q.split(/\s+/).filter(Boolean);
 const matches=searchIndex.filter(p=>(searchBook==='all'||p.book===searchBook)&&words.every(w=>p.normalized.includes(w))).map(p=>({p,score:words.reduce((n,w)=>n+(searchNormalize(p.title).includes(w)?10:1),0)})).sort((a,b)=>b.score-a.score||a.p.title.localeCompare(b.p.title,'no')).slice(0,35);
 searchStatus.textContent=matches.length?(matches.length===35?'Viser de 35 første treffene.':matches.length+' treff funnet.'):'Ingen treff. Prøv et annet søkeord.';
 for(const {p} of matches){const a=document.createElement('a');a.href=route(p.book,p.path);a.className='global-search-result';const title=document.createElement('strong');title.textContent=p.title;const meta=document.createElement('small');meta.textContent=(p.book==='hovedhandbok'?'Hovedhåndbok':p.book==='lover-og-regler'?'Lover og regler':'Lærlinghåndbok')+' · '+p.path.split('/').slice(0,-1).join(' / ').replaceAll('-',' ');const desc=document.createElement('span');const pos=p.normalized.indexOf(words[0]);desc.textContent=p.plain.slice(Math.max(0,pos-65),Math.max(0,pos-65)+175)+(p.plain.length>175?'…':'');a.append(title,meta,desc);a.addEventListener('click',searchClose);searchResults.append(a)}
}
