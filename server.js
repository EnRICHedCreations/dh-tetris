const http = require('node:http');

const port = Number(process.env.PORT) || 3000;

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#090b18">
  <title>Neon Stack — Tetris</title>
  <style>
    :root{color-scheme:dark;--ink:#f7f8ff;--muted:#9198b7;--panel:rgba(17,20,42,.76);--line:rgba(255,255,255,.09);--cyan:#50e3ff;--violet:#a77bff}
    *{box-sizing:border-box}html,body{height:100%;margin:0}body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;color:var(--ink);background:#080a16;overflow-x:hidden}
    body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 16% 12%,rgba(80,227,255,.17),transparent 30%),radial-gradient(circle at 82% 78%,rgba(167,123,255,.2),transparent 34%),linear-gradient(145deg,#080a16,#11152c)}
    .shell{min-height:100%;display:grid;place-items:center;padding:24px}.app{position:relative;width:min(100%,950px);display:grid;grid-template-columns:220px minmax(280px,380px) 220px;gap:20px;align-items:stretch}
    .panel,.board-wrap{border:1px solid var(--line);background:var(--panel);backdrop-filter:blur(22px);box-shadow:0 24px 80px rgba(0,0,0,.45);border-radius:24px}.panel{padding:22px;display:flex;flex-direction:column;gap:18px}.brand small{display:block;color:var(--cyan);font-weight:800;letter-spacing:.22em;text-transform:uppercase}.brand h1{font-size:32px;line-height:.95;margin:8px 0 5px;letter-spacing:-.055em}.brand p,.hint{color:var(--muted);margin:0;font-size:13px;line-height:1.55}
    .stat{padding:13px 0;border-top:1px solid var(--line)}.stat span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.15em}.stat strong{display:block;font-size:28px;letter-spacing:-.04em;margin-top:2px}.board-wrap{padding:14px;display:grid;place-items:center;position:relative;overflow:hidden}.board-wrap:after{content:"";position:absolute;inset:0;background:linear-gradient(120deg,transparent 35%,rgba(255,255,255,.035),transparent 65%);pointer-events:none}canvas{display:block;max-width:100%;height:auto;border-radius:14px}#board{background:#080a16;border:1px solid rgba(255,255,255,.07)}
    .next-title{font-size:11px;color:var(--muted);letter-spacing:.15em;text-transform:uppercase}.next-box{display:grid;place-items:center;min-height:112px;border-radius:16px;background:rgba(3,5,15,.4);border:1px solid var(--line)}
    .controls{display:grid;gap:8px}.keyrow{display:flex;align-items:center;justify-content:space-between;color:var(--muted);font-size:12px}.keys{display:flex;gap:4px}.key{min-width:26px;height:25px;display:grid;place-items:center;padding:0 7px;border-radius:7px;color:#dfe4ff;background:rgba(255,255,255,.07);border:1px solid var(--line);font-size:11px}
    button{font:inherit;color:var(--ink);border:0;cursor:pointer}.primary{margin-top:auto;padding:13px 16px;border-radius:13px;font-weight:800;background:linear-gradient(135deg,var(--cyan),#7d8cff 58%,var(--violet));box-shadow:0 10px 30px rgba(80,227,255,.18)}.primary:hover{filter:brightness(1.08)}
    .overlay{position:absolute;inset:14px;z-index:3;display:none;place-items:center;text-align:center;border-radius:14px;background:rgba(5,7,18,.82);backdrop-filter:blur(10px)}.overlay.show{display:grid}.overlay h2{font-size:38px;margin:0 0 6px;letter-spacing:-.055em}.overlay p{margin:0;color:var(--muted)}
    .touch{display:none;grid-column:1/-1;grid-template-columns:repeat(5,1fr);gap:8px}.touch button{height:48px;border-radius:13px;background:var(--panel);border:1px solid var(--line);font-size:18px;touch-action:manipulation}
    @media(max-width:780px){.shell{padding:14px}.app{grid-template-columns:minmax(110px,1fr) minmax(230px,320px)}.left{grid-row:1}.right{grid-row:1}.board-wrap{grid-column:2;grid-row:1}.left,.right{padding:14px}.brand h1{font-size:23px}.brand p,.controls{display:none}.stat strong{font-size:21px}.touch{display:grid}.next-box{min-height:80px}}
    @media(max-width:560px){body{overflow:auto}.app{grid-template-columns:1fr 95px;gap:10px}.left{grid-column:1/-1;display:grid;grid-template-columns:1fr repeat(3,auto);align-items:center}.left .stat{border:0;padding:0 8px}.left .primary{display:none}.board-wrap{grid-column:1;grid-row:2;padding:8px}.right{grid-column:2;grid-row:2}.right .primary{display:block}.hint{display:none}.touch{grid-row:3}.brand p{display:none}.brand h1{margin:5px 0 0}}
  </style>
</head>
<body><main class="shell"><section class="app">
  <aside class="panel left"><div class="brand"><small>Arcade 01</small><h1>NEON<br>STACK</h1><p>Clear lines. Build momentum. Own the grid.</p></div><div class="stat"><span>Score</span><strong id="score">0</strong></div><div class="stat"><span>Lines</span><strong id="lines">0</strong></div><div class="stat"><span>Level</span><strong id="level">1</strong></div><button class="primary" data-action="restart">New game</button></aside>
  <div class="board-wrap"><canvas id="board" width="300" height="600" aria-label="Tetris game board"></canvas><div id="overlay" class="overlay"><div><h2 id="overlayTitle">Paused</h2><p id="overlayText">Press P to resume</p></div></div></div>
  <aside class="panel right"><span class="next-title">Up next</span><div class="next-box"><canvas id="next" width="120" height="90"></canvas></div><div class="controls"><div class="keyrow"><span>Move</span><span class="keys"><b class="key">←</b><b class="key">→</b></span></div><div class="keyrow"><span>Soft drop</span><b class="key">↓</b></div><div class="keyrow"><span>Rotate</span><b class="key">↑</b></div><div class="keyrow"><span>Hard drop</span><b class="key">Space</b></div><div class="keyrow"><span>Pause</span><b class="key">P</b></div></div><p class="hint">Complete horizontal rows to score. Speed increases every ten lines.</p><button class="primary" data-action="restart">New game</button></aside>
  <div class="touch" aria-label="Touch controls"><button data-action="left">←</button><button data-action="rotate">↻</button><button data-action="down">↓</button><button data-action="right">→</button><button data-action="drop">⇣</button></div>
</section></main>
<script>
(()=>{'use strict';
const COLS=10,ROWS=20,SIZE=30,COLORS=['','#43d9ff','#ffd166','#b77dff','#5ce6a8','#ff687b','#ff9f43','#5988ff'];
const SHAPES=[[],[[1,1,1,1]],[[2,2],[2,2]],[[0,3,0],[3,3,3]],[[0,4,4],[4,4,0]],[[5,5,0],[0,5,5]],[[6,0,0],[6,6,6]],[[0,0,7],[7,7,7]]];
const canvas=document.querySelector('#board'),ctx=canvas.getContext('2d'),nextCanvas=document.querySelector('#next'),nctx=nextCanvas.getContext('2d');
const scoreEl=document.querySelector('#score'),linesEl=document.querySelector('#lines'),levelEl=document.querySelector('#level'),overlay=document.querySelector('#overlay'),overlayTitle=document.querySelector('#overlayTitle'),overlayText=document.querySelector('#overlayText');
let grid,piece,nextPiece,score,lines,level,last,dropTimer,paused,over,raf;
const empty=()=>Array.from({length:ROWS},()=>Array(COLS).fill(0));
const makePiece=()=>{const type=1+Math.floor(Math.random()*7);return{m:SHAPES[type].map(r=>[...r]),x:Math.floor((COLS-SHAPES[type][0].length)/2),y:0,type}};
function collision(p=piece){return p.m.some((r,y)=>r.some((v,x)=>v&&(p.y+y>=ROWS||p.x+x<0||p.x+x>=COLS||p.y+y>=0&&grid[p.y+y][p.x+x])))}
function drawCell(c,x,y,size=SIZE,g=ctx){g.fillStyle=COLORS[c];g.fillRect(x*size+1,y*size+1,size-2,size-2);const grad=g.createLinearGradient(x*size,y*size,(x+1)*size,(y+1)*size);grad.addColorStop(0,'rgba(255,255,255,.32)');grad.addColorStop(.45,'rgba(255,255,255,0)');g.fillStyle=grad;g.fillRect(x*size+2,y*size+2,size-4,size-4)}
function draw(){ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='rgba(255,255,255,.035)';for(let x=1;x<COLS;x++){ctx.beginPath();ctx.moveTo(x*SIZE,0);ctx.lineTo(x*SIZE,ROWS*SIZE);ctx.stroke()}for(let y=1;y<ROWS;y++){ctx.beginPath();ctx.moveTo(0,y*SIZE);ctx.lineTo(COLS*SIZE,y*SIZE);ctx.stroke()}grid.forEach((r,y)=>r.forEach((v,x)=>v&&drawCell(v,x,y)));if(piece&&!over){let ghost={...piece,y:piece.y};while(!collision(ghost))ghost.y++;ghost.y--;ctx.globalAlpha=.18;ghost.m.forEach((r,y)=>r.forEach((v,x)=>v&&drawCell(v,ghost.x+x,ghost.y+y)));ctx.globalAlpha=1;piece.m.forEach((r,y)=>r.forEach((v,x)=>v&&drawCell(v,piece.x+x,piece.y+y)))}drawNext()}
function drawNext(){nctx.clearRect(0,0,nextCanvas.width,nextCanvas.height);if(!nextPiece)return;const s=24,w=nextPiece.m[0].length*s,h=nextPiece.m.length*s,ox=(120-w)/2/s,oy=(90-h)/2/s;nextPiece.m.forEach((r,y)=>r.forEach((v,x)=>v&&drawCell(v,ox+x,oy+y,s,nctx)))}
function merge(){piece.m.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0)grid[piece.y+y][piece.x+x]=v}))}
function clearLines(){let count=0;for(let y=ROWS-1;y>=0;y--){if(grid[y].every(Boolean)){grid.splice(y,1);grid.unshift(Array(COLS).fill(0));count++;y++}}if(count){const points=[0,100,300,500,800];score+=points[count]*level;lines+=count;level=1+Math.floor(lines/10);updateStats()}}
function spawn(){piece=nextPiece||makePiece();piece.x=Math.floor((COLS-piece.m[0].length)/2);piece.y=0;nextPiece=makePiece();if(collision()){over=true;showOverlay('Game over','Press New Game to try again')}}
function lock(){merge();clearLines();spawn();draw()}
function down(){if(paused||over)return;piece.y++;if(collision()){piece.y--;lock()}else{score+=1;updateStats()}dropTimer=0}
function move(dx){if(paused||over)return;piece.x+=dx;if(collision())piece.x-=dx;draw()}
function rotate(){if(paused||over)return;const old=piece.m,oldX=piece.x;piece.m=piece.m[0].map((_,i)=>piece.m.map(r=>r[i]).reverse());for(const kick of [0,-1,1,-2,2]){piece.x=oldX+kick;if(!collision()){draw();return}}piece.m=old;piece.x=oldX}
function hardDrop(){if(paused||over)return;let distance=0;while(!collision()){piece.y++;distance++}piece.y--;score+=Math.max(0,(distance-1)*2);updateStats();lock()}
function updateStats(){scoreEl.textContent=score.toLocaleString();linesEl.textContent=lines;levelEl.textContent=level}
function showOverlay(title,text){overlayTitle.textContent=title;overlayText.textContent=text;overlay.classList.add('show')}
function togglePause(){if(over)return;paused=!paused;overlay.classList.toggle('show',paused);if(paused)showOverlay('Paused','Press P to resume');last=performance.now()}
function reset(){cancelAnimationFrame(raf);grid=empty();score=0;lines=0;level=1;paused=false;over=false;dropTimer=0;nextPiece=makePiece();overlay.classList.remove('show');updateStats();spawn();last=performance.now();raf=requestAnimationFrame(loop)}
function loop(time){const delta=time-last;last=time;if(!paused&&!over){dropTimer+=delta;if(dropTimer>Math.max(90,850-(level-1)*65)){piece.y++;if(collision()){piece.y--;lock()}dropTimer=0}}draw();raf=requestAnimationFrame(loop)}
document.addEventListener('keydown',e=>{const action={ArrowLeft:()=>move(-1),ArrowRight:()=>move(1),ArrowDown:down,ArrowUp:rotate,' ':hardDrop,p:togglePause,P:togglePause}[e.key];if(action){e.preventDefault();action()}});
document.querySelectorAll('[data-action]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();({left:()=>move(-1),right:()=>move(1),down,rotate,drop:hardDrop,restart:reset}[b.dataset.action])()}));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!paused&&!over)togglePause()});reset();
})();
</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    return res.end(JSON.stringify({ status: 'ok' }));
  }
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache', 'x-content-type-options': 'nosniff' });
    return res.end(page);
  }
  res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

server.listen(port, '0.0.0.0', () => console.log(`Neon Stack listening on port ${port}`));

function shutdown() { server.close(() => process.exit(0)); }
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
