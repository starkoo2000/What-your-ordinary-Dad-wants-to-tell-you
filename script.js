"use strict";
const tracks=window.OST_TRACKS||[],lyrics=window.OST_LYRICS||[];
const $=id=>document.getElementById(id),audio=$('albumAudio');
let current=0,repeatMode='off',shuffle=false,shuffleQueue=[],history=[],lastLine=-1,hasStarted=false;
try{repeatMode=['off','all','one'].includes(localStorage.getItem('ostRepeat'))?localStorage.getItem('ostRepeat'):'off';shuffle=localStorage.getItem('ostShuffle')==='1';}catch{}
const baseUrl='https://starkoo2000.github.io/What-your-ordinary-Dad-wants-to-tell-you/';
function time(v){if(!Number.isFinite(v))return '0:00';return `${Math.floor(v/60)}:${String(Math.floor(v%60)).padStart(2,'0')}`;}
function status(s){$('playerStatus').textContent=s||'';}
function shareUrl(i){return baseUrl+'?track='+(i+1);}
async function share(title,url){try{if(navigator.share){await navigator.share({title,text:'책과 함께 듣는 OST · '+title,url});return;}if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(url);status('공유 링크를 복사했어요.');return;}window.prompt('링크를 복사해주세요',url);}catch(e){if(e.name!=='AbortError')window.prompt('링크를 복사해주세요',url);}}
function updateModes(){const r=$('repeatBtn'),s=$('shuffleBtn');r.textContent=repeatMode==='one'?'↻₁':'↻';r.classList.toggle('active',repeatMode!=='off');r.setAttribute('aria-label',`반복 재생: ${repeatMode==='off'?'끄기':repeatMode==='all'?'전체 반복':'한 곡 반복'}`);r.title=r.getAttribute('aria-label');s.classList.toggle('active',shuffle);s.setAttribute('aria-pressed',String(shuffle));}
function updateMedia(){if(!('mediaSession'in navigator))return;const t=tracks[current];try{navigator.mediaSession.metadata=new MediaMetadata({title:t.title,artist:'구형모 · Original Soundtrack',album:'너희들에게 보내는 평범한 아빠의 속마음',artwork:[{src:new URL(t.art,location.href).href,sizes:'512x512',type:'image/png'}]});navigator.mediaSession.playbackState=audio.paused?'paused':'playing';}catch(e){console.warn('Media Session metadata',e);}}
let lyricAutoScroll=true;
const timedLyrics=window.OST_TIMED_LYRICS||[];
function renderLyrics(){
 const container=$('lyrics-text');container.replaceChildren();
 const timed=timedLyrics[current];
 if(Array.isArray(timed)&&timed.length){
   let prevSection=null;
   timed.forEach((line,i)=>{
     if(line.section&&line.section!==prevSection){const h=document.createElement('div');h.className='lyric-section';h.textContent=line.section;container.append(h);}
     prevSection=line.section;
     const p=document.createElement('button');p.type='button';p.className='lyric-line timed';p.dataset.line=i;
     p.textContent=line.text;p.title=`${time(line.t)} 위치로 이동`;
     p.setAttribute('aria-label',`${line.text}, ${time(line.t)}부터 재생`);
     p.addEventListener('click',()=>{audio.currentTime=line.t;syncLyrics(true);if(audio.paused)play();});
     container.append(p);
   });
   $('syncIndicator').textContent=`● ${timed.length}줄 싱크 연결됨`;
 }else{
   const lines=(lyrics[current]||'가사 준비 중').split('\n');let idx=0;
   const headings=/^(Verse(?:\s*\d+)?|Pre(?:-Chorus)?(?:\s*\d+)?|Chorus(?:\s*\d+)?|Final(?:\s+Chorus|\s+Hook|\s+Refrain|\s+Declaration)?|Bridge|Climax|Male|Female|Together|Male Rap|Spoken|Outro|Intro|Hook|Rap|Instrumental|Refrain)$/i;
   for(const raw of lines){const line=raw.trim();if(!line)continue;const p=document.createElement('div');if(headings.test(line)){p.className='lyric-section';p.textContent=line;}else{p.className='lyric-line';p.dataset.line=idx++;p.textContent=line;}container.append(p);}
   $('syncIndicator').textContent='시간표가 없는 곡입니다.';
 }
 lastLine=-1;container.scrollTop=0;$('liveLyric').textContent='재생 버튼을 누르면 가사가 나타납니다.';syncLyrics(true);
}
function syncLyrics(force=false){
 const times=timedLyrics[current];if(!Array.isArray(times)||!times.length)return;
 const t=audio.currentTime;
 let lo=0,hi=times.length-1,idx=-1;
 while(lo<=hi){const mid=(lo+hi)>>1;if(times[mid].t<=t){idx=mid;lo=mid+1;}else hi=mid-1;}
 if(idx===lastLine&&!force)return;
 lastLine=idx;
 const el=$('lyrics-text');
 el.querySelectorAll('.lyric-line.current').forEach(x=>x.classList.remove('current'));
 const active=el.querySelector(`[data-line="${idx}"]`);
 $('liveLyric').textContent=idx<0?'곧 노래가 시작됩니다…':times[idx].text;
 if(active){active.classList.add('current');active.setAttribute('aria-current','true');}
 el.querySelectorAll('.lyric-line[aria-current="true"]').forEach(x=>{if(x!==active)x.removeAttribute('aria-current');});
 if(active&&lyricAutoScroll&&!$('lyricsBody').hidden){
   const target=active.offsetTop-el.offsetTop-el.clientHeight/2+active.offsetHeight/2;
   el.scrollTo({top:Math.max(0,target),behavior:force?'instant':'smooth'});
 }
}
function syncPlay(){const paused=audio.paused;$('playBtn').textContent=paused?'▶':'Ⅱ';$('playBtn').setAttribute('aria-label',paused?'재생':'일시정지');$('miniPlay').textContent=paused?'▶':'Ⅱ';$('miniPlay').setAttribute('aria-label',paused?'재생':'일시정지');$('miniSubtitle').textContent=paused?'일시정지':'재생 중';updateMedia();}
function setTrack(i,autoplay=false,remember=true){if(!tracks.length)return;const old=current;current=(i+tracks.length)%tracks.length;if(remember&&old!==current)history.push(old);const t=tracks[current];audio.src='./'+encodeURIComponent(t.file);audio.load();$('nowArt').src=t.art;$('nowArt').alt=t.title+' 표지';$('nowTitle').textContent=t.title;$('nowNo').textContent=`TRACK ${String(current+1).padStart(2,'0')} / 12`;$('miniArt').src=t.art;$('miniTitle').textContent=t.title;$('downloadBtn').href=`https://drive.google.com/uc?export=download&id=${encodeURIComponent(t.fid)}`;$('downloadBtn').setAttribute('aria-label',t.title+' MP3 다운로드 (Google Drive)');document.querySelectorAll('.track-tile').forEach((e,n)=>e.classList.toggle('active',n===current));$('elapsed').textContent='0:00';$('duration').textContent='0:00';$('seek').value='0';$('seek').style.setProperty('--progress','0%');renderLyrics();updateMedia();status('');if(autoplay)play();else syncPlay();}
async function play(){try{await audio.play();hasStarted=true;$('miniPlayer').hidden=false;status('');}catch(e){console.warn('Playback blocked or failed',e);status('재생이 중단됐어요. 재생 버튼을 다시 누르거나 MP3 파일명을 확인해주세요.');syncPlay();}}
function togglePlay(){if(audio.paused)play();else audio.pause();}
function nextIndex(){if(!shuffle)return current+1<tracks.length?current+1:(repeatMode==='all'?0:null);if(!shuffleQueue.length){if(repeatMode!=='all')return null;fillShuffle();}return shuffleQueue.shift();}
function fillShuffle(){shuffleQueue=tracks.map((_,i)=>i).filter(i=>i!==current);for(let i=shuffleQueue.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffleQueue[i],shuffleQueue[j]]=[shuffleQueue[j],shuffleQueue[i]];}}
function next(manual=false){let i;if(shuffle){if(!shuffleQueue.length)fillShuffle();i=shuffleQueue.shift();}else{i=current+1<tracks.length?current+1:(manual||repeatMode==='all'?0:null);}if(i!==null&&i!==undefined)setTrack(i,true);else{audio.pause();audio.currentTime=0;syncPlay();}}
function previous(){if(audio.currentTime>3){audio.currentTime=0;return;}if(shuffle&&history.length){setTrack(history.pop(),true,false);return;}setTrack((current-1+tracks.length)%tracks.length,true);}
function initTracks(){const grid=$('trackGrid');tracks.forEach((t,i)=>{const tile=document.createElement('article');tile.className='track-tile';const b=document.createElement('button');b.className='track-card';b.type='button';b.dataset.index=i;const img=document.createElement('img');img.src=t.art;img.alt=t.title+' 표지';img.loading='lazy';const detail=document.createElement('div');detail.className='track-details';const small=document.createElement('small');small.textContent=`TRACK ${String(i+1).padStart(2,'0')}`;const h=document.createElement('h3');h.textContent=t.title;detail.append(small,h);b.append(img,detail);b.addEventListener('click',()=>{setTrack(i,true);$('album-player').scrollIntoView({behavior:'smooth'});});const actions=document.createElement('div');actions.className='track-actions';const like=document.createElement('button');like.className='heart-btn';like.type='button';like.dataset.track=i+1;like.disabled=true;like.setAttribute('aria-pressed','false');like.textContent='♡ —';const shareBtn=document.createElement('button');shareBtn.className='share-small';shareBtn.type='button';shareBtn.textContent='↗ 공유';shareBtn.addEventListener('click',()=>share(t.title,shareUrl(i)));actions.append(like,shareBtn);tile.append(b,actions);grid.append(tile);});}
initTracks();$('playBtn').addEventListener('click',togglePlay);$('miniPlay').addEventListener('click',togglePlay);$('prevBtn').addEventListener('click',previous);$('nextBtn').addEventListener('click',()=>next(true));$('miniNext').addEventListener('click',()=>next(true));$('repeatBtn').addEventListener('click',()=>{repeatMode=repeatMode==='off'?'all':repeatMode==='all'?'one':'off';try{localStorage.setItem('ostRepeat',repeatMode);}catch{}updateModes();});$('shuffleBtn').addEventListener('click',()=>{shuffle=!shuffle;shuffleQueue=[];if(shuffle)fillShuffle();try{localStorage.setItem('ostShuffle',shuffle?'1':'0');}catch{}updateModes();});$('shareAlbum').addEventListener('click',()=>share('12곡의 인생 OST',baseUrl));$('shareTrackBtn').addEventListener('click',()=>share(tracks[current].title,shareUrl(current)));$('seek').addEventListener('input',e=>{if(Number.isFinite(audio.duration))audio.currentTime=audio.duration*Number(e.target.value)/1000;});$('lyricsAutoScroll').addEventListener('click',()=>{lyricAutoScroll=!lyricAutoScroll;$('lyricsAutoScroll').textContent=lyricAutoScroll?'자동 스크롤 켜짐':'자동 스크롤 꺼짐';$('lyricsAutoScroll').setAttribute('aria-pressed',String(lyricAutoScroll));if(lyricAutoScroll)syncLyrics(true);});$('lyricsToggle').addEventListener('click',()=>{const hidden=$('lyricsBody').hidden=!$('lyricsBody').hidden;$('lyricsToggle').textContent=hidden?'펼치기':'접기';$('lyricsToggle').setAttribute('aria-expanded',String(!hidden));if(!hidden)syncLyrics(true);});
audio.addEventListener('timeupdate',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0){$('seek').value=Math.round(audio.currentTime/audio.duration*1000);$('seek').style.setProperty('--progress',(audio.currentTime/audio.duration*100)+'%');$('elapsed').textContent=time(audio.currentTime);$('duration').textContent=time(audio.duration);}syncLyrics();});audio.addEventListener('loadedmetadata',()=>{$('duration').textContent=time(audio.duration);});audio.addEventListener('play',syncPlay);audio.addEventListener('pause',syncPlay);audio.addEventListener('ended',()=>{if(repeatMode==='one'){audio.currentTime=0;play();return;}const i=nextIndex();if(i===null){audio.pause();audio.currentTime=0;syncPlay();}else setTrack(i,true);});audio.addEventListener('error',()=>{if(audio.error)status('음원을 불러오지 못했어요. 파일명·업로드 상태·인터넷 연결을 확인해주세요.');});
if('mediaSession'in navigator){const actions={play:()=>play(),pause:()=>audio.pause(),previoustrack:previous,nexttrack:()=>next(true),seekto:d=>{if(Number.isFinite(d.seekTime))audio.currentTime=d.seekTime;},seekbackward:d=>{audio.currentTime=Math.max(0,audio.currentTime-(d.seekOffset||10));},seekforward:d=>{audio.currentTime=Math.min(audio.duration||Infinity,audio.currentTime+(d.seekOffset||10));}};for(const [name,handler]of Object.entries(actions))try{navigator.mediaSession.setActionHandler(name,handler);}catch{}}
updateModes();const n=Number(new URLSearchParams(location.search).get('track'));setTrack(Number.isInteger(n)&&n>=1&&n<=tracks.length?n-1:0,false);if(n>=1&&n<=tracks.length){setTimeout(()=>$('album-player').scrollIntoView({block:'start'}),200);}
