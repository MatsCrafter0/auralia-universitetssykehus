let tree={},flat=[];const $=id=>document.getElementById(id);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const route=(b,p)=>'#/'+b+'/'+p;function flatten(nodes,book){let out=[];for(const n of nodes){out.push({...n,book});out.push(...flatten(n.children||[],book))}return out}function navItem(n,b,depth=0){const active=decodeURIComponent(location.hash.slice(1))==='/'+b+'/'+n.path;return '<a class="'+(depth===0?'section ':'')+(active?'active':'')+'" href="'+route(b,n.path)+'">'+esc(n.title)+'</a>'+(n.children?.length?'<div class="nested">'+n.children.map(c=>navItem(c,b,depth+1)).join('')+'</div>':'')}function renderNav(b,q=''){if(q){const matches=flatten(tree[b],b).filter(n=>n.title.toLowerCase().includes(q.toLowerCase()));$('nav').innerHTML=matches.map(n=>'<a href="'+route(b,n.path)+'">'+esc(n.title)+'</a>').join('')||'<p>Ingen treff</p>'}else $('nav').innerHTML=tree[b].map(n=>navItem(n,b)).join('')}async function render(){const hash=decodeURIComponent(location.hash.slice(1));const m=hash.match(/^\/(hovedhandbok|laerlinger)\/(.+)$/);const isEmployees=hash==='/ansattliste';const isContract=hash==='/arbeidskontrakt';$('home').hidden=!!m||isEmployees||isContract;$('reader').hidden=!m;$('employees').hidden=!isEmployees;$('contract').hidden=!isContract;document.body.classList.remove('menu-open');if(isEmployees){window.scrollTo(0,0);loadEmployees();return}if(isContract){window.scrollTo(0,0);return}if(!m)return;const [_,b,p]=m;const pages=flatten(tree[b],b);const ix=pages.findIndex(n=>n.path===p);if(ix<0){location.hash='#/';return}const page=pages[ix];$('bookTitle').textContent=b==='laerlinger'?'Lærlinghåndbok':'Hovedhåndbok';$('search').value='';renderNav(b);$('breadcrumbs').textContent=(b==='laerlinger'?'Lærlinghåndbok':'Hovedhåndbok')+' / '+page.title;$('article').innerHTML='<p>Laster inn…</p>';try{const response=await fetch('innhold/'+b+'/'+p+'.md');if(!response.ok)throw Error('Siden ble ikke funnet');let md=await response.text();if(window.marked){marked.setOptions({gfm:true,breaks:false});$('article').innerHTML=marked.parse(md);for(const a of $('article').querySelectorAll('a[href]')){try{const u=new URL(a.href,location.href);if(!u.hostname.endsWith('gitbook.io')||!u.hostname.includes('auralia'))continue;const segments=decodeURIComponent(u.pathname).split('/').filter(Boolean);const book=segments.includes('bFQZOUHYM4q2rhjvjWcV')||u.hostname.includes('auralia-universitetssykehus-docs')?'hovedhandbok':segments.includes('taoYXLjcjzz2zNBS7uaT')||u.hostname.includes('laerling')?'laerlinger':b;const pages=flatten(tree[book]||[],book);const clean=x=>x.replace(/^\\d{2}-/,'').toLowerCase();const source=segments.map(clean);const target=pages.find(p=>{const dest=p.path.split('/').map(clean);return dest.length<=source.length&&dest.every((part,i)=>part===source[source.length-dest.length+i])});a.href=target?route(book,target.path):route(book,'velkommen');}catch(e){}}}else{$('article').textContent=md}}catch(e){$('article').textContent='Kunne ikke laste inn siden: '+e.message}const prev=pages[ix-1],next=pages[ix+1];$('pager').innerHTML=(prev?'<a href="'+route(b,prev.path)+'">← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="'+route(b,next.path)+'">'+esc(next.title)+' →</a>':'');window.scrollTo(0,0)}$('search').addEventListener('input',e=>{const b=location.hash.split('/')[1];if(tree[b])renderNav(b,e.target.value)});$('menu').addEventListener('click',()=>document.body.classList.toggle('menu-open'));window.addEventListener('hashchange',render);fetch('navigasjon.json').then(r=>r.json()).then(j=>{tree=j;render()}).catch(()=>{$('home').innerHTML='<p>Kunne ikke laste inn navigasjonen.</p>'});
const employeeSheetId='1BHY4o3eRJWvleRgDok8kp4zFnQTw5z0ljbdf46zKVtc';
let employeeRows=[],employeeHeaders=[],employeeLoadedSheet='',employeeRequest=0;
const employeeAllowedSheets=['Direktoratet/Ledelsen','Avd. Lege','Avd. Psykiatrisk','Avd. Ambulanse/Paramedic','AMB Skolen','Ansattdata','Oppsigelse'];
function employeeRoleColor(role){
 const s=String(role||'').toLocaleLowerCase('no').trim();
 if(/^(helsedirektør|ass\.? helsedirektør|helse inspektør|medisinsk leder|amb rektor)$/.test(s))return 'rank-director';
 if(/avd\.? leder|opplæringsanvarlig|opplæringsansvarlig/.test(s))return 'rank-lead';
 if(s==='overlege')return 'rank-overlege';
 if(s==='lege')return 'rank-lege';
 if(s==='legestudent')return 'rank-student';
 if(s==='psykolog')return 'rank-psykolog';
 if(s==='paramedic')return 'rank-paramedic';
 if(s==='lærling')return 'rank-laerling';
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
function renderEmployees(){
 const q=$('employee-search').value.trim().toLocaleLowerCase('no');
 const roleIndex=employeeHeaders.findIndex(h=>/stilling|rolle|grad/i.test(h));
 const badgeIndex=employeeHeaders.findIndex(h=>/distinksjon/i.test(h));
 const statusIndex=employeeHeaders.findIndex(h=>/ansatt\/ledig|status/i.test(h));
 const rows=employeeRows.filter(row=>row.some(v=>String(v).toLocaleLowerCase('no').includes(q)));
 let prevGroup='';
 $('employee-table').innerHTML='<thead><tr>'+employeeHeaders.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'<th scope="col">Kursstatus</th></tr></thead><tbody>'+rows.map(row=>{
  const role=roleIndex>=0?row[roleIndex]:'';
  const rank=employeeRoleColor(role);
  const group=employeeGroup(role);
  const dropdownSheet=['Ansattdata','Oppsigelse'].includes($('employee-sheet').value);
  const separator=!dropdownSheet&&roleIndex>=0&&prevGroup&&group!==prevGroup;
  prevGroup=group;
  const courseIndices=employeeHeaders.map((h,i)=>/kurs|opplæring|sertifikat|kompetanse/i.test(h)?i:-1).filter(i=>i>=0);const courseSummary=courseIndices.length?courseIndices.map(i=>employeeHeaders[i]+': '+(String(row[i]??'').trim()||'Ikke registrert')).join(' · '):'Ikke registrert i ansattlisten';return '<tr'+(separator?' class="employee-group-start"':'')+'>'+row.map((v,i)=>{
   let cl='';
   if(i===roleIndex&&dropdownSheet)cl=' class="employee-dropdown '+(rank||'rank-unassigned')+'"';
   else if(i===roleIndex&&rank)cl=' class="employee-role '+rank+'"';
   else if(i===badgeIndex)cl=' class="employee-distinction '+(String(role).toLocaleLowerCase('no').trim()==='helsedirektør'||/^ass\.? helsedirektør$/i.test(String(role).trim())?'rank-top':'rank-normal')+'"';
   else if(i===statusIndex){const status=String(v).toLocaleLowerCase('no');if(status.includes('ledig'))cl=' class="employee-vacant"';else if(status.includes('ansatt'))cl=' class="employee-active"'}
   return '<td'+cl+'>'+esc(v)+'</td>';
  }).join('')+'<td>'+esc(courseSummary)+'</td></tr>';
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
 window[cb]=function(res){
  if(settled||request!==employeeRequest)return;settled=true;cleanup();
  try{
   if(res.status!=='ok'||!res.table)throw Error('Google Sheets returnerte ingen data');
   const cols=res.table.cols||[];
   let rows=(res.table.rows||[]).map(r=>cols.map((_,i)=>{const v=r.c?.[i];return v?.f??v?.v??''})).filter(row=>row.some(v=>String(v).trim()));
   let headers=cols.map((col,i)=>col.label||col.id||'Kolonne '+(i+1));
   const headerAt=rows.findIndex(row=>row.some(v=>/^(navn|stilling|discord|ansatt\/ledig|kallesignal|tn)$/i.test(String(v).trim())));
   if(headerAt>=0&&headerAt<4){headers=rows[headerAt].map((v,i)=>String(v).trim()||headers[i]);rows=rows.slice(headerAt+1)}
   const keep=headers.map((h,i)=>i).filter(i=>rows.some(r=>{const v=String(r[i]??'').trim();return v!==''&&v!=='TRUE'&&v!=='FALSE'&&v!=='true'&&v!=='false'})||(!rows.length&&headers[i]));
   // GViz sometimes exposes the date column as its spreadsheet letter "V" instead of the header in row 2.
   // In the source workbook, column V is Ansettelsesdato on the department tabs.
   if(!['Ansattdata','Oppsigelse'].includes(sheet)){
    headers=headers.map((h,i)=>i===21&&/^(?:V|Kolonne 22|Ansettelsesdato)$/i.test(String(h).trim())?'Ansettelsesdato':h);
   }
   employeeHeaders=keep.map(i=>headers[i]);employeeRows=rows.map(row=>keep.map(i=>row[i]??'')).filter(row=>row.some(v=>String(v).trim()));
   employeeLoadedSheet=sheet;renderEmployees();
  }catch(e){$('employee-status').textContent='Kunne ikke hente denne fanen. Kontroller lesetilgangen i Google Sheets.'}
 };
 script.src='https://docs.google.com/spreadsheets/d/'+employeeSheetId+'/gviz/tq?sheet='+encodeURIComponent(sheet)+'&tqx='+encodeURIComponent('out:json;responseHandler:'+cb)+'&tq='+encodeURIComponent('select *')+'&_='+Date.now();
 script.onerror=()=>{if(settled||request!==employeeRequest)return;settled=true;cleanup();$('employee-status').textContent='Kunne ikke laste fanen. Kontroller tilgang i Google Sheets.'};
 document.head.appendChild(script);
 setTimeout(()=>{if(settled||request!==employeeRequest)return;settled=true;cleanup();$('employee-status').textContent='Google Sheets svarte ikke for denne fanen.'},12000);
}
$('employee-sheet').addEventListener('change',()=>{employeeLoadedSheet='';loadEmployees(true)});
$('employee-search').addEventListener('input',()=>{if(employeeLoadedSheet)renderEmployees()});
$('employee-refresh').addEventListener('click',()=>loadEmployees(true));

