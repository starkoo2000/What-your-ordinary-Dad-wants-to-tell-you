import {initializeApp} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {getAuth,signInAnonymously,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {getFirestore,collection,doc,setDoc,deleteDoc,getDoc,getCountFromServer,getDocs,query,where,orderBy,limit,serverTimestamp,addDoc} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
const config={apiKey:"AIzaSyC7PjKQvjsRxhc3nG1JaxXVZyUT5Q2jywA",authDomain:"dad-ost.firebaseapp.com",projectId:"dad-ost",storageBucket:"dad-ost.firebasestorage.app",messagingSenderId:"291905956678",appId:"1:291905956678:web:04d8b26d11b90a0af25347",measurementId:"G-J5WLBZWQJD"};
const app=initializeApp(config), auth=getAuth(app), db=getFirestore(app);
const titles=["그 겨울 속초","보내지 못한 편지","조금씩 어른이 되어가","가장 높은 곳과 낮은 곳을 정복한 사나이","선택한 길이 정답이 되도록","하늘로 쏘아올린 작은 성공","산 너머 산","지금 이 사람이 내 끝사랑","다시 한번 걸어가","나의 출사표","특별하게 태어나 평범하게 살아가기","너희에게 해주고 싶은 말"];
const list=document.getElementById("like-list");
list.replaceChildren(...titles.map((title,i)=>{let row=document.createElement("div");row.className="like-item";let name=document.createElement("span");name.textContent=`${i+1}. ${title}`;let b=document.createElement("button");b.className="heart-btn";b.type="button";b.disabled=true;b.dataset.track=String(i+1);b.textContent="♡ —";b.setAttribute("aria-pressed","false");row.append(name,b);return row;}));
let uid=null;
const status=(id,msg)=>document.getElementById(id).textContent=msg;
async function updateLikes(){
  for(let i=1;i<=12;i++){
    const b=list.querySelector(`[data-track="${i}"]`);
    try{
      const [count,mine]=await Promise.all([getCountFromServer(query(collection(db,"likes"),where("track","==",i))),getDoc(doc(db,"likes",`${i}_${uid}`))]);
      b.dataset.liked=mine.exists()?"1":"0";b.setAttribute("aria-pressed",mine.exists()?"true":"false");b.textContent=`${mine.exists()?"♥":"♡"} ${count.data().count}`;b.disabled=false;
    }catch(e){console.error(e);b.textContent="♡ 오류";}
  }
}
list.addEventListener("click",async e=>{
  const b=e.target.closest(".heart-btn");if(!b||!uid||b.disabled)return;
  b.disabled=true;let n=Number(b.dataset.track),ref=doc(db,"likes",`${n}_${uid}`);
  try{if(b.dataset.liked==="1")await deleteDoc(ref);else await setDoc(ref,{track:n,owner:uid,createdAt:serverTimestamp()});await updateLikes();}
  catch(e){console.error(e);status("like-status","좋아요 저장에 실패했어요. Firestore 규칙을 확인해주세요.");b.disabled=false;}
});
function dateKey(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Seoul",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());}
async function visitors(){
  const day=dateKey();
  try{
    await setDoc(doc(db,"visits",`${day}_${uid}`),{day,owner:uid,createdAt:serverTimestamp()}).catch(async e=>{if(e.code!=="permission-denied")throw e;});
    const [all,today]=await Promise.all([getCountFromServer(collection(db,"visits")),getCountFromServer(query(collection(db,"visits"),where("day","==",day)))]);
    document.getElementById("total-visitors").textContent=all.data().count.toLocaleString("ko-KR");
    document.getElementById("today-visitors").textContent=today.data().count.toLocaleString("ko-KR");
  }catch(e){console.error(e);}
}
async function loadGuestbook(){
  const box=document.getElementById("guest-entries");
  try{
    const result=await getDocs(query(collection(db,"guestbook"),orderBy("createdAt","desc"),limit(30)));
    box.replaceChildren();
    result.forEach(d=>{
      const v=d.data(),entry=document.createElement("article");entry.className="entry";
      const h=document.createElement("strong");h.textContent=v.name||"익명";
      const time=document.createElement("time");time.textContent=v.createdAt?.toDate?.().toLocaleDateString("ko-KR")||"방금";
      const message=document.createElement("p");message.textContent=v.message||"";
      entry.append(h,time,message);box.append(entry);
    });
    if(result.empty)box.textContent="첫 번째 감상평을 남겨주세요.";
  }catch(e){console.error(e);box.textContent="방명록을 불러오지 못했어요. Firestore 규칙을 확인해주세요.";}
}
const form=document.getElementById("guest-form");
form.addEventListener("submit",async e=>{
  e.preventDefault();if(!uid)return;
  const name=document.getElementById("guest-name").value.trim(),message=document.getElementById("guest-message").value.trim();
  if(!name||!message||name.length>24||message.length>500)return;
  const last=Number(localStorage.getItem("ostGuestLast")||0);
  if(Date.now()-last<60000){status("guest-status","연속 작성은 1분 후 가능해요.");return;}
  const b=document.getElementById("guest-submit");b.disabled=true;
  try{
    await addDoc(collection(db,"guestbook"),{name,message,owner:uid,createdAt:serverTimestamp()});
    localStorage.setItem("ostGuestLast",String(Date.now()));form.reset();status("guest-status","감상평이 등록됐어요.");await loadGuestbook();
  }catch(err){console.error(err);status("guest-status","등록 실패: Firebase 설정과 보안 규칙을 확인해주세요.");}
  finally{b.disabled=false;}
});
signInAnonymously(auth).catch(e=>{console.error(e);status("like-status","Firebase 익명 로그인을 확인해주세요.");});
onAuthStateChanged(auth,user=>{if(!user)return;uid=user.uid;updateLikes();visitors();loadGuestbook();});
