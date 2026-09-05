(() => {
  const COLS=10,ROWS=20,SIZE=30;
  const boardCanvas=document.querySelector('#board'),ctx=boardCanvas.getContext('2d');
  const nextCanvas=document.querySelector('#next'),nextCtx=nextCanvas.getContext('2d');
  const scoreEl=document.querySelector('#score'),linesEl=document.querySelector('#lines'),levelEl=document.querySelector('#level');
  const overlay=document.querySelector('#overlay'),startBtn=document.querySelector('#start'),pauseBtn=document.querySelector('#pause');
  const COLORS=['','#43f5ff','#4d78ff','#ff9b3d','#ffe15a','#56e878','#b667ff','#ff4e86'];
  const SHAPES=[[],[[1,1,1,1]],[[2,0,0],[2,2,2]],[[0,0,3],[3,3,3]],[[4,4],[4,4]],[[0,5,5],[5,5,0]],[[0,6,0],[6,6,6]],[[7,7,0],[0,7,7]]];
  let grid,piece,nextPiece,score,lines,level,running=false,paused=false,last=0,dropCounter=0,raf;
  const empty=()=>Array.from({length:ROWS},()=>Array(COLS).fill(0));
  const randomPiece=()=>{const type=1+Math.floor(Math.random()*7);return{shape:SHAPES[type].map(r=>[...r]),type,x:0,y:0}};
  function resetPiece(){piece=nextPiece||randomPiece();nextPiece=randomPiece();piece.x=Math.floor((COLS-piece.shape[0].length)/2);piece.y=0;drawNext();if(collides(piece)){gameOver()}}
  function collides(p){return p.shape.some((row,y)=>row.some((v,x)=>v&&(p.y+y>=ROWS||p.x+x<0||p.x+x>=COLS||p.y+y>=0&&grid[p.y+y][p.x+x])))}
  function merge(){piece.shape.forEach((row,y)=>row.forEach((v,x)=>{if(v&&piece.y+y>=0)grid[piece.y+y][piece.x+x]=piece.type}))}
  function clearLines(){let cleared=0;for(let y=ROWS-1;y>=0;y--){if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(COLS).fill(0));cleared++;y++}}if(cleared){lines+=cleared;score+=[0,100,300,500,800][cleared]*level;level=Math.floor(lines/10)+1;updateStats()}}
  function drop(){piece.y++;if(collides(piece)){piece.y--;merge();clearLines();resetPiece()}dropCounter=0}
  function hardDrop(){let distance=0;while(!collides({...piece,y:piece.y+1})){piece.y++;distance++}score+=distance*2;updateStats();drop()}
  function move(dir){piece.x+=dir;if(collides(piece))piece.x-=dir}
  function rotate(){const old=piece.shape;piece.shape=old[0].map((_,i)=>old.map(r=>r[i]).reverse());for(const dx of [0,-1,1,-2,2]){piece.x+=dx;if(!collides(piece))return;piece.x-=dx}piece.shape=old}
  function cell(c,x,y,context=ctx,size=SIZE){context.fillStyle=COLORS[c];context.shadowColor=COLORS[c];context.shadowBlur=10;context.fillRect(x*size+1,y*size+1,size-2,size-2);context.shadowBlur=0;context.fillStyle='#ffffff45';context.fillRect(x*size+3,y*size+3,size-6,3)}
  function draw(){ctx.clearRect(0,0,boardCanvas.width,boardCanvas.height);ctx.strokeStyle='#101a37';for(let x=0;x<=COLS;x++){ctx.beginPath();ctx.moveTo(x*SIZE,0);ctx.lineTo(x*SIZE,ROWS*SIZE);ctx.stroke()}for(let y=0;y<=ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SIZE);ctx.lineTo(COLS*SIZE,y*SIZE);ctx.stroke()}grid.forEach((row,y)=>row.forEach((v,x)=>v&&cell(v,x,y)));piece?.shape.forEach((row,y)=>row.forEach((v,x)=>v&&cell(piece.type,piece.x+x,piece.y+y)))}
  function drawNext(){nextCtx.clearRect(0,0,120,120);const s=22,ox=(120-nextPiece.shape[0].length*s)/2/s,oy=(120-nextPiece.shape.length*s)/2/s;nextPiece.shape.forEach((r,y)=>r.forEach((v,x)=>v&&cell(nextPiece.type,ox+x,oy+y,nextCtx,s)))}
  function updateStats(){scoreEl.textContent=score.toLocaleString();linesEl.textContent=lines;levelEl.textContent=level}
  function loop(time=0){if(!running)return;const delta=time-last;last=time;if(!paused){dropCounter+=delta;if(dropCounter>Math.max(100,900-(level-1)*70))drop();draw()}raf=requestAnimationFrame(loop)}
  function start(){cancelAnimationFrame(raf);grid=empty();score=0;lines=0;level=1;nextPiece=randomPiece();running=true;paused=false;last=performance.now();dropCounter=0;updateStats();resetPiece();overlay.classList.add('hidden');pauseBtn.textContent='PAUSE';loop(last)}
  function togglePause(){if(!running)return;paused=!paused;pauseBtn.textContent=paused?'RESUME':'PAUSE';overlay.classList.toggle('hidden',!paused);if(paused){overlay.querySelector('h2').textContent='PAUSED';overlay.querySelector('p').textContent='The signal is holding.';startBtn.textContent='RESTART'}else{last=performance.now()}}
  function gameOver(){running=false;cancelAnimationFrame(raf);draw();overlay.classList.remove('hidden');overlay.querySelector('h2').textContent='GAME OVER';overlay.querySelector('p').textContent=`Final score: ${score.toLocaleString()}`;startBtn.textContent='PLAY AGAIN'}
  document.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key))e.preventDefault();if(!running||paused){if(e.key.toLowerCase()==='p')togglePause();return}if(e.key==='ArrowLeft')move(-1);else if(e.key==='ArrowRight')move(1);else if(e.key==='ArrowDown'){drop();score++;updateStats()}else if(e.key==='ArrowUp')rotate();else if(e.key===' ')hardDrop();else if(e.key.toLowerCase()==='p')togglePause();draw()});
  startBtn.addEventListener('click',start);pauseBtn.addEventListener('click',togglePause);grid=empty();draw();
})();
