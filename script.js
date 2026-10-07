const tracks = [
  {title:"그 겨울 속초", cover:"chapter-1.png", file:"1. 그 겨울 속초.mp3"},
  {title:"보내지 못한 편지", cover:"chapter-3.png", file:"2. 보내지 못한 편지.mp3"},
  {title:"조금씩 어른이 되어가", cover:"chapter-8.png", file:"3. 조금씩 어른이 되어가.mp3"},
  {title:"가장 높은 곳과 낮은 곳을 정복한 사나이", cover:"chapter-4.png", file:"4. 가장 높은 곳과 낮은 곳을 정복한 사나이.mp3"},
  {title:"선택한 길이 정답이 되도록", cover:"chapter-5.png", file:"5. 선택한 길이 정답이 되도록.mp3"},
  {title:"하늘로 쏘아올린 작은 성공", cover:"chapter-2.png", file:"6. 하늘로 쏘아올린 작은 성공.mp3"},
  {title:"산 너머 산", cover:"chapter-12.png", file:"7. 산 너머 산.mp3"},
  {title:"지금 이 사람이 내 끝사랑", cover:"chapter-6.png", file:"8. 지금 이 사람이 내 끝사랑.mp3"},
  {title:"다시 한번 걸어가", cover:"chapter-9.png", file:"9. 다시 한번 걸어가.mp3"},
  {title:"나의 출사표", cover:"chapter-10.png", file:"10. 나의 출사표.mp3"},
  {title:"특별하게 태어나 평범하게 살아가기", cover:"chapter-11.png", file:"11. 특별하게 태어나 평범하게 살아가기.mp3"},
  {title:"너희에게 해주고 싶은 말", cover:"chapter-13.png", file:"12. 너희에게 해주고 싶은 말.mp3"}
];
let current=0;
const audio=document.getElementById('album-audio'), title=document.getElementById('now-title'), cover=document.getElementById('now-cover'), count=document.getElementById('now-track'), toggle=document.getElementById('toggle-play');
function srcFor(i){return encodeURI(tracks[i].file);}
function loadTrack(i, autoplay=false){current=(i+tracks.length)%tracks.length; audio.src=srcFor(current); title.textContent=tracks[current].title; cover.src=tracks[current].cover; cover.alt=tracks[current].title+' 표지'; count.textContent=`TRACK ${String(current+1).padStart(2,'0')} / 12`; if(autoplay){audio.play().catch(()=>{toggle.textContent='▶ 재생';});}}
function startAlbum(){document.getElementById('album-player').scrollIntoView({behavior:'smooth',block:'start'}); if(!audio.src) loadTrack(current,false); audio.play().then(()=>toggle.textContent='❚❚ 일시정지').catch(()=>toggle.textContent='▶ 재생');}
document.getElementById('play-all-hero').addEventListener('click',startAlbum);
toggle.addEventListener('click',()=>{if(audio.paused) startAlbum(); else {audio.pause();toggle.textContent='▶ 계속듣기';}});
document.getElementById('prev-track').addEventListener('click',()=>loadTrack(current-1,true));
document.getElementById('next-track').addEventListener('click',()=>loadTrack(current+1,true));
audio.addEventListener('play',()=>toggle.textContent='❚❚ 일시정지');
audio.addEventListener('pause',()=>{if(!audio.ended)toggle.textContent='▶ 계속듣기';});
audio.addEventListener('ended',()=>{if(current<tracks.length-1)loadTrack(current+1,true);else{toggle.textContent='▶ 처음부터';current=0;loadTrack(0,false);}});
audio.addEventListener('error',()=>{toggle.textContent='재생 오류 · 곡별 듣기 이용';});
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const t=document.querySelector(a.getAttribute('href'));if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}}));
