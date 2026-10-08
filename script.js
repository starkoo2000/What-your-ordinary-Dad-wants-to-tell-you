const tracks = [{"title": "그 겨울 속초", "file": "1. 그 겨울 속초.mp3", "art": "chapter-1.png"}, {"title": "보내지 못한 편지", "file": "2. 보내지 못한 편지.mp3", "art": "chapter-3.png"}, {"title": "조금씩 어른이 되어가", "file": "3. 조금씩 어른이 되어가.mp3", "art": "chapter-8.png"}, {"title": "가장 높은 곳과 낮은 곳을 정복한 사나이", "file": "4. 가장 높은 곳과 낮은 곳을 정복한 사나이.mp3", "art": "chapter-4.png"}, {"title": "선택한 길이 정답이 되도록", "file": "5. 선택한 길이 정답이 되도록.mp3", "art": "chapter-5.png"}, {"title": "하늘로 쏘아올린 작은 성공", "file": "6. 하늘로 쏘아올린 작은 성공.mp3", "art": "chapter-2.png"}, {"title": "산 너머 산", "file": "7. 산 너머 산.mp3", "art": "chapter-12.png"}, {"title": "지금 이 사람이 내 끝사랑", "file": "8. 지금 이 사람이 내 끝사랑.mp3", "art": "chapter-6.png"}, {"title": "다시 한번 걸어가", "file": "9. 다시 한번 걸어가.mp3", "art": "chapter-9.png"}, {"title": "나의 출사표", "file": "10. 나의 출사표.mp3", "art": "chapter-10.png"}, {"title": "특별하게 태어나 평범하게 살아가기", "file": "11. 특별하게 태어나 평범하게 살아가기.mp3", "art": "chapter-11.png"}, {"title": "너희에게 해주고 싶은 말", "file": "12. 너희에게 해주고 싶은 말.mp3", "art": "chapter-13.png"}];
const audio=document.getElementById("albumAudio");
const nowArt=document.getElementById("nowArt"), nowTitle=document.getElementById("nowTitle"), nowNo=document.getElementById("nowNo");
const playBtn=document.getElementById("playBtn"), prevBtn=document.getElementById("prevBtn"), nextBtn=document.getElementById("nextBtn");
let current=0;

function setTrack(i, autoplay=false){
  current=(i+tracks.length)%tracks.length;
  const t=tracks[current];
  // Same-origin relative path: browser safely encodes Korean/spaces itself.
  audio.src = "./" + t.file;
  nowArt.src=t.art; nowTitle.textContent=t.title; nowNo.textContent=`TRACK ${String(current+1).padStart(2,"0")} / 12`;
  document.querySelectorAll(".track-card").forEach((x,n)=>x.classList.toggle("active",n===current));
  audio.load();
  if(autoplay) audio.play().catch(()=>{ playBtn.textContent="▶ 재생"; });
}
function sync(){playBtn.textContent=audio.paused?"▶ 재생":"❚❚ 일시정지"}
playBtn.addEventListener("click",()=>{ if(audio.paused) audio.play().catch(e=>alert("재생할 수 없습니다. MP3 파일명과 GitHub 업로드 상태를 확인해주세요.")); else audio.pause(); });
prevBtn.addEventListener("click",()=>setTrack(current-1,true));
nextBtn.addEventListener("click",()=>setTrack(current+1,true));
audio.addEventListener("play",sync); audio.addEventListener("pause",sync);
audio.addEventListener("ended",()=>{ if(current<tracks.length-1) setTrack(current+1,true); else {current=0;setTrack(0,false);} });
audio.addEventListener("error",()=>{console.error("Audio failed:", audio.currentSrc);});
document.querySelectorAll(".track-card").forEach((b,i)=>b.addEventListener("click",()=>{setTrack(i,true);document.getElementById("album-player").scrollIntoView({behavior:"smooth"});}));
document.getElementById("startAlbum").addEventListener("click",(e)=>{e.preventDefault();setTrack(0,true);document.getElementById("album-player").scrollIntoView({behavior:"smooth"});});
setTrack(0,false);

function showLyrics(){
  const title=document.getElementById("lyrics-title"), content=document.getElementById("lyrics-text");
  if(title && content){title.textContent=tracks[current].title;content.textContent=(window.OST_LYRICS||[])[current]||"가사 준비 중";}
}
const originalSetTrack=setTrack;
setTrack=function(i,autoplay=false){originalSetTrack(i,autoplay);showLyrics();};
showLyrics();
