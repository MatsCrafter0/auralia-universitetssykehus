let tree={},flat=[];const $=id=>document.getElementById(id);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const route=(b,p)=>'#/'+b+'/'+p;function flatten(nodes,book){let out=[];for(const n of nodes){out.push({...n,book});out.push(...flatten(n.children||[],book))}return out}function navItem(n,b,depth=0){const active=decodeURIComponent(location.hash.slice(1))==='/'+b+'/'+n.path;return '<a class="'+(depth===0?'section ':'')+(active?'active':'')+'" href="'+route(b,n.path)+'">'+esc(n.title)+'</a>'+(n.children?.length?'<div class="nested">'+n.children.map(c=>navItem(c,b,depth+1)).join('')+'</div>':'')}function renderNav(b,q=''){if(q){const matches=flatten(tree[b],b).filter(n=>n.title.toLowerCase().includes(q.toLowerCase()));$('nav').innerHTML=matches.map(n=>'<a href="'+route(b,n.path)+'">'+esc(n.title)+'</a>').join('')||'<p>Ingen treff</p>'}else $('nav').innerHTML=tree[b].map(n=>navItem(n,b)).join('')}async function render(){const hash=decodeURIComponent(location.hash.slice(1));const m=hash.match(/^\/(hovedhandbok|laerlinger)\/(.+)$/);const isEmployees=hash==='/ansattliste';$('home').hidden=!!m||isEmployees;$('reader').hidden=!m;$('employees').hidden=!isEmployees;document.body.classList.remove('menu-open');if(isEmployees){window.scrollTo(0,0);loadEmployees();return}if(!m)return;const [_,b,p]=m;const pages=flatten(tree[b],b);const ix=pages.findIndex(n=>n.path===p);if(ix<0){location.hash='#/';return}const page=pages[ix];$('bookTitle').textContent=b==='laerlinger'?'Lærlinghåndbok':'Hovedhåndbok';$('search').value='';renderNav(b);$('breadcrumbs').textContent=(b==='laerlinger'?'Lærlinghåndbok':'Hovedhåndbok')+' / '+page.title;$('article').innerHTML='<p>Laster inn…</p>';try{const response=await fetch('innhold/'+b+'/'+p+'.md');if(!response.ok)throw Error('Siden ble ikke funnet');let md=await response.text();if(window.marked){marked.setOptions({gfm:true,breaks:false});$('article').innerHTML=marked.parse(md);for(const a of $('article').querySelectorAll('a[href]')){try{const u=new URL(a.href);if(u.hostname.endsWith('gitbook.io')){const match=u.pathname.match(/\/(?:bFQZOUHYM4q2rhjvjWcV|taoYXLjcjzz2zNBS7uaT|B9AcgTL7PfAVc5tVEx2c)\/(.*)$/);if(match){const dest=match[1].replace(/\/$/,'');const book=u.pathname.includes('bFQZOUHYM4q2rhjvjWcV')?'hovedhandbok':'laerlinger';if(flatten(tree[book],book).some(p=>p.path===dest)){a.href=route(book,dest);}}}}catch(e){}}}else{$('article').textContent=md}}catch(e){$('article').textContent='Kunne ikke laste inn siden: '+e.message}const prev=pages[ix-1],next=pages[ix+1];$('pager').innerHTML=(prev?'<a href="'+route(b,prev.path)+'">← '+esc(prev.title)+'</a>':'<span></span>')+(next?'<a href="'+route(b,next.path)+'">'+esc(next.title)+' →</a>':'');window.scrollTo(0,0)}$('search').addEventListener('input',e=>{const b=location.hash.split('/')[1];if(tree[b])renderNav(b,e.target.value)});$('menu').addEventListener('click',()=>document.body.classList.toggle('menu-open'));window.addEventListener('hashchange',render);fetch('navigasjon.json').then(r=>r.json()).then(j=>{tree=j;render()}).catch(()=>{$('home').innerHTML='<p>Kunne ikke laste inn navigasjonen.</p>'});
const employeeSheetId='1BHY4o3eRJWvleRgDok8kp4zFnQTw5z0ljbdf46zKVtc';
let employeeRows=[],employeeHeaders=[],employeeLoadedSheet='',employeeRequest=0;
const employeeAllowedSheets=['Direktoratet/Ledelsen','Avd. Lege','Avd. Psykiatrisk','Avd. Ambulanse/Paramedic','AMB Skolen','Ansattdata','Oppsigelse'];
function employeeRoleColor(role){
 const s=String(role||'').toLocaleLowerCase('no').trim();
 if(!s)return '';
 if(/helsedirektør|ass\\.?\\s*helsedirektør/.test(s))return 'role-gold';
 if(/helse\\s*inspektør|medisinsk\\s*leder|amb\\s*rektor/.test(s))return 'role-gold';
 if(/avd\\.?\\s*leder|ass\\.?\\s*avd\\.?\\s*leder|opplæringsansvarlig/.test(s))return 'role-orange';
 return 'role-default';
}
function renderEmployees(){
 const q=$('employee-search').value.trim().toLocaleLowerCase('no');
 const rows=employeeRows.filter(row=>row.some(v=>String(v).toLocaleLowerCase('no').includes(q)));
 const roleIndex=employeeHeaders.findIndex(h=>/stilling|rolle|grad/i.test(h));
 const badgeIndex=employeeHeaders.findIndex(h=>/distinksjon/i.test(h));
 const statusIndex=employeeHeaders.findIndex(h=>/ansatt\\/ledig|status/i.test(h));
 $('employee-table').innerHTML='<thead><tr>'+employeeHeaders.map(h=>'<th scope="col">'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>{
  const role=roleIndex>=0?row[roleIndex]:'';
  const color=employeeRoleColor(role);
  return '<tr>'+row.map((v,i)=>{
   let cl='';
   if(i===roleIndex&&color)cl=' class="employee-role '+color+'"';
   else if(i===badgeIndex&&color)cl=' class="employee-distinction '+color+'"';
   else if(i===statusIndex){const status=String(v).toLocaleLowerCase('no');if(status.includes('ledig'))cl=' class="employee-vacant"';else if(status.includes('ansatt'))cl=' class="employee-active"'}
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
