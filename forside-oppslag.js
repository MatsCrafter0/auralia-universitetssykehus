import {initializeApp,getApps,getApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getFirestore,collection,query,where,onSnapshot} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {firebaseConfig} from './oppslag-config.js';

const section=document.getElementById('pinned-notices');
const list=document.getElementById('pinned-notices-list');
if(section&&list){
  const app=getApps().length?getApp():initializeApp(firebaseConfig);
  const db=getFirestore(app);
  // Only query published documents: matches public Firestore read rules.
  onSnapshot(query(collection(db,'oppslag'),where('published','==',true)),snapshot=>{
    const pinned=snapshot.docs.map(d=>d.data()).filter(post=>post.pinned===true)
      .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
    list.replaceChildren();
    section.hidden=pinned.length===0;
    for(const post of pinned){
      const article=document.createElement('article');
      article.className='pinned-notice';
      const meta=document.createElement('div');
      meta.className='pinned-notice-meta';
      meta.textContent='📌 FESTET OPPSLAG'+(post.category?' · '+post.category:'');
      const title=document.createElement('h3');
      title.textContent=post.title||'Kunngjøring';
      const body=document.createElement('p');
      body.textContent=post.body||'';
      article.append(meta,title,body);
      list.append(article);
    }
  },error=>{
    console.warn('Kunne ikke hente festede oppslag:',error.code||error.message);
    section.hidden=true;
  });
}
