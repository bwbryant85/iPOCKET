/* ════════════ PAC-MAN ════════════
   Swipe to queue direction (like 2048).
   Proper maze, 4 ghosts with chase/scatter/frightened AI,
   pellets, power pellets, lives, score, levels.
   ════════════════════════════════════════ */
function initPacman() {

  /* ── Canvas setup ── */
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:#000;overflow:hidden;touch-action:none;';
  content.appendChild(wrap);

  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;flex-shrink:0;';
  wrap.appendChild(cv);
  const ctx = cv.getContext('2d');

  /* ── HUD below canvas ── */
  const hud = document.createElement('div');
  hud.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 20px calc(var(--sb,0px)+12px);background:#000;';
  hud.innerHTML = `
    <div style="display:flex;align-items:center;gap:6px;">
      <span style="font-size:1rem;">😀</span>
      <span id="pm-lives" style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:#ffd700;letter-spacing:.06em;">× 3</span>
    </div>
    <div style="font-family:'Orbitron',sans-serif;font-size:.72rem;color:#ffd700;letter-spacing:.1em;" id="pm-score">0</div>
    <div style="font-family:'Share Tech Mono',monospace;font-size:.72rem;color:rgba(255,255,255,.3);letter-spacing:.08em;" id="pm-level">LVL 1</div>`;
  wrap.appendChild(hud);

  /* ══ MAZE DEFINITION ══
     0=empty  1=wall  2=pellet  3=power pellet  4=ghost house  5=empty(no pellet)
     28 cols × 31 rows (classic ratio) */
  const RAW_MAZE = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,3,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,1,1,1,0,0,1,1,0,0,1,1,1,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,4,4,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,4,4,4,4,4,4,4,4,1,0,1,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,0,1,4,4,4,4,4,4,4,4,1,0,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,1,1,1,1,2,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,2,2,1,1,2,2,1,1,1,1,1,2,1,1,1,2,1],
    [1,3,2,2,1,2,2,2,2,2,2,2,2,0,0,2,2,2,2,2,2,2,2,2,1,2,2,3],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,1,1,2,1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1,1,2,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,1,1,1,1,1,2,1,1,1,1,2,1,1,2,1,1,1,1,2,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  ];

  const COLS = 28, ROWS = 31;

  /* ── Sizing: fit maze into available space ── */
  const availW = content.offsetWidth;
  const availH = content.offsetHeight - 89 - 52; // DI safe + hud
  const CELL = Math.floor(Math.min(availW / COLS, availH / ROWS));
  const mazeW = CELL * COLS, mazeH = CELL * ROWS;

  cv.width  = mazeW;
  cv.height = mazeH;
  cv.style.width  = mazeW + 'px';
  cv.style.height = mazeH + 'px';

  // Add Dynamic Island top padding to the wrap
  wrap.style.paddingTop = '89px';

  /* ── Maze state (mutable copy of pellets) ── */
  let maze, totalPellets, pelletsLeft;

  const resetMaze = () => {
    maze = RAW_MAZE.map(r => [...r]);
    totalPellets = 0;
    maze.forEach(r => r.forEach(c => { if (c===2||c===3) totalPellets++; }));
    pelletsLeft = totalPellets;
  };

  /* ── Colors ── */
  const WALL_COL  = '#1a1aff';
  const WALL_GLOW = '#4444ff';
  const PELLET    = '#ffb8ae';
  const POWER     = '#ffb8ae';

  /* ── Ghost config ── */
  const GHOST_NAMES  = ['Blinky','Pinky','Inky','Clyde'];
  const GHOST_COLORS = ['#ff0000','#ffb8ff','#00ffff','#ffb852'];
  const GHOST_SCATTER= [{r:0,c:25},{r:0,c:2},{r:ROWS-1,c:25},{r:ROWS-1,c:2}];

  /* ── State ── */
  let score=0, lives=3, level=1, gameState='waiting'; // waiting|playing|dying|levelup|over
  let pacX, pacY, pacDX, pacDY, pacNextDX, pacNextDY;
  let pacMouthOpen = 0, pacMouthDir = 1;
  let frightTimer = 0, frightDuration = 0;
  let ghostsEatenThisEnergizer = 0;
  let raf = null, lastTime = 0;
  let ghosts = [];
  let flashTimer = 0;

  /* ── Tunnel cols (wrap-around row 14) ── */
  const TUNNEL_ROW = 14;

  const isWall = (r,c) => {
    if (r<0||r>=ROWS) return true;
    if (c<0) c+=COLS;
    if (c>=COLS) c-=COLS;
    return maze[r][c]===1;
  };
  const isPassable = (r,c) => !isWall(r,c) && maze[r]?.[c] !== undefined;

  const initGhosts = () => {
    ghosts = GHOST_NAMES.map((name,i) => ({
      name, col: GHOST_COLORS[i],
      // Start in ghost house
      x: 13.5 + (i===0?0:i===1?0:i===2?-1:1),
      y: 13.5,
      dx:0, dy:0,
      mode:'house', // house|chase|scatter|frightened|eaten
      houseTimer: i * 80, // stagger release
      scatterTarget: GHOST_SCATTER[i],
      speed: 1,
    }));
  };

  const resetPositions = () => {
    pacX=14; pacY=23.5; pacDX=0; pacDY=0; pacNextDX=-1; pacNextDY=0;
    initGhosts();
    frightTimer=0; ghostsEatenThisEnergizer=0;
  };

  /* ── Draw ── */
  const drawMaze = () => {
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,mazeW,mazeH);

    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const cell=maze[r][c];
        const x=c*CELL, y=r*CELL;

        if(cell===1){
          // Wall with glow
          ctx.fillStyle=WALL_COL;
          ctx.fillRect(x,y,CELL,CELL);
          // Inner highlight
          ctx.strokeStyle=WALL_GLOW;
          ctx.lineWidth=1;
          ctx.strokeRect(x+.5,y+.5,CELL-1,CELL-1);
        } else if(cell===2){
          // Pellet
          ctx.beginPath();
          ctx.arc(x+CELL/2, y+CELL/2, CELL*.12, 0, Math.PI*2);
          ctx.fillStyle=PELLET;
          ctx.fill();
        } else if(cell===3){
          // Power pellet — pulsing
          const pulse = .7 + .3*Math.sin(Date.now()*.006);
          ctx.beginPath();
          ctx.arc(x+CELL/2, y+CELL/2, CELL*.28*pulse, 0, Math.PI*2);
          ctx.fillStyle=POWER;
          ctx.shadowColor=POWER;
          ctx.shadowBlur=10*pulse;
          ctx.fill();
          ctx.shadowBlur=0;
        }
      }
    }
  };

  const drawPac = () => {
    const x = pacX*CELL + CELL/2;
    const y = pacY*CELL + CELL/2;
    const r = CELL*.45;

    // Mouth angle
    const mouthAngle = (pacMouthOpen/12) * Math.PI*.6;
    let startA = mouthAngle/2;
    let endA   = Math.PI*2 - mouthAngle/2;

    // Rotate based on direction
    let rot = 0;
    if(pacDX===1)  rot=0;
    if(pacDX===-1) rot=Math.PI;
    if(pacDY===-1) rot=-Math.PI/2;
    if(pacDY===1)  rot=Math.PI/2;

    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.arc(0,0,r, startA, endA);
    ctx.closePath();
    ctx.fillStyle='#ffd700';
    ctx.shadowColor='#ffd700';
    ctx.shadowBlur=10;
    ctx.fill();
    ctx.shadowBlur=0;
    ctx.restore();
  };

  const drawGhosts = () => {
    ghosts.forEach(g => {
      const x = g.x*CELL + CELL/2;
      const y = g.y*CELL + CELL/2;
      const r = CELL*.45;
      const frightened = g.mode==='frightened';
      const eaten      = g.mode==='eaten';
      const flashing   = frightened && frightTimer < frightDuration*.35 && Math.floor(frightTimer*.02)%2===0;

      if(eaten){
        // Eyes only
        ctx.fillStyle='#fff';
        [-0.22,0.22].forEach(ox=>{
          ctx.beginPath();ctx.arc(x+ox*CELL,y-0.1*CELL,CELL*.1,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#00f';
          ctx.beginPath();ctx.arc(x+ox*CELL+(g.dx||0)*CELL*.05,y-0.1*CELL+(g.dy||0)*CELL*.05,CELL*.05,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';
        });
        return;
      }

      const col = frightened
        ? (flashing ? '#fff' : '#0000cc')
        : g.col;

      // Body
      ctx.beginPath();
      ctx.arc(x,y,r,Math.PI,0);
      ctx.lineTo(x+r, y+r);
      // Wavy bottom
      const segs=4;
      for(let i=0;i<segs;i++){
        const sx = x+r - (i+1)*(2*r/segs);
        const wavY = y+r + (i%2===0?-CELL*.15:CELL*.15);
        ctx.quadraticCurveTo(x+r-(i+.5)*(2*r/segs), wavY, sx, y+r);
      }
      ctx.closePath();
      ctx.fillStyle=col;
      ctx.shadowColor=col;
      ctx.shadowBlur=frightened?0:8;
      ctx.fill();
      ctx.shadowBlur=0;

      // Eyes (not on frightened)
      if(!frightened){
        ctx.fillStyle='#fff';
        [-0.22,0.22].forEach(ox=>{
          ctx.beginPath();ctx.arc(x+ox*CELL,y-0.08*CELL,CELL*.12,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#00f';
          ctx.beginPath();ctx.arc(x+ox*CELL+(g.dx||0)*CELL*.05,y-0.08*CELL+(g.dy||0)*CELL*.05,CELL*.06,0,Math.PI*2);ctx.fill();
          ctx.fillStyle='#fff';
        });
      } else {
        // X eyes when frightened
        ctx.strokeStyle=flashing?'#000':'#fff';
        ctx.lineWidth=1.5;
        [-0.22,0.22].forEach(ox=>{
          const ex=x+ox*CELL, ey=y-0.1*CELL, s=CELL*.07;
          ctx.beginPath();ctx.moveTo(ex-s,ey-s);ctx.lineTo(ex+s,ey+s);ctx.stroke();
          ctx.beginPath();ctx.moveTo(ex+s,ey-s);ctx.lineTo(ex-s,ey+s);ctx.stroke();
        });
      }
    });
  };

  const drawHUD = () => {
    document.getElementById('pm-score').textContent = score.toLocaleString();
    document.getElementById('pm-lives').textContent = '× ' + lives;
    document.getElementById('pm-level').textContent = 'LVL ' + level;
  };

  const drawOverlay = () => {
    if(gameState==='waiting'){
      ctx.fillStyle='rgba(0,0,0,.55)';
      ctx.fillRect(0,0,mazeW,mazeH);
      ctx.font=`bold ${CELL*1.2}px 'Orbitron',sans-serif`;
      ctx.fillStyle='#ffd700';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.shadowColor='#ffd700';
      ctx.shadowBlur=20;
      ctx.fillText('PAC-MAN',mazeW/2,mazeH*.36);
      ctx.shadowBlur=0;
      ctx.font=`${CELL*.65}px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.7)';
      ctx.fillText('SWIPE TO START',mazeW/2,mazeH*.5);
      ctx.font=`${CELL*.5}px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.3)';
      ctx.fillText('Swipe to change direction',mazeW/2,mazeH*.6);
    }
    if(gameState==='dying'){
      ctx.fillStyle='rgba(255,0,0,.18)';
      ctx.fillRect(0,0,mazeW,mazeH);
    }
    if(gameState==='over'){
      ctx.fillStyle='rgba(0,0,0,.75)';
      ctx.fillRect(0,0,mazeW,mazeH);
      ctx.font=`bold ${CELL*1.2}px 'Orbitron',sans-serif`;
      ctx.fillStyle='#ff4af8';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.shadowColor='#ff4af8';
      ctx.shadowBlur=24;
      ctx.fillText('GAME OVER',mazeW/2,mazeH*.38);
      ctx.shadowBlur=0;
      ctx.font=`${CELL*.7}px 'Share Tech Mono',monospace`;
      ctx.fillStyle='#ffd700';
      ctx.fillText(score.toLocaleString(),mazeW/2,mazeH*.5);
      ctx.font=`${CELL*.55}px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.5)';
      ctx.fillText('SWIPE TO RETRY',mazeW/2,mazeH*.62);
    }
    if(gameState==='levelup'){
      ctx.fillStyle='rgba(0,0,0,.6)';
      ctx.fillRect(0,0,mazeW,mazeH);
      ctx.font=`bold ${CELL*1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle='#00ffcc';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.shadowColor='#00ffcc';
      ctx.shadowBlur=22;
      ctx.fillText('LEVEL ' + level,mazeW/2,mazeH*.42);
      ctx.shadowBlur=0;
      ctx.font=`${CELL*.55}px 'Share Tech Mono',monospace`;
      ctx.fillStyle='rgba(255,255,255,.5)';
      ctx.fillText('SWIPE TO CONTINUE',mazeW/2,mazeH*.56);
    }
  };

  /* ── Movement helpers ── */
  const tryMove = (x, y, dx, dy) => {
    const nx = x + dx;
    const ny = y + dy;
    // Tunnel wrap
    if(Math.round(y)===TUNNEL_ROW){
      if(nx < 0)   return {x: COLS-0.01, y};
      if(nx >= COLS) return {x: 0.01, y};
    }
    const gr = Math.round(ny), gc = Math.round(nx);
    if(!isWall(gr,gc)) return {x:nx, y:ny};
    return null;
  };

  const PAC_SPEED_BASE = 0.09;
  const pacSpeed = () => PAC_SPEED_BASE + (level-1)*0.005;

  const updatePac = (dt) => {
    const spd = pacSpeed() * dt;
    pacMouthOpen += pacMouthDir * dt * .25;
    if(pacMouthOpen > 12) pacMouthDir=-1;
    if(pacMouthOpen < 0)  { pacMouthDir=1; pacMouthOpen=0; }

    // Try queued direction first
    if(pacNextDX!==pacDX || pacNextDY!==pacDY){
      const res = tryMove(pacX, pacY, pacNextDX*spd, pacNextDY*spd);
      // Only switch direction when aligned to grid center
      const gr=Math.round(pacY), gc=Math.round(pacX);
      const aligned = Math.abs(pacX-gc)<0.35 && Math.abs(pacY-gr)<0.35;
      if(res && aligned){
        pacDX=pacNextDX; pacDY=pacNextDY;
        pacX=res.x; pacY=res.y;
        eatCell();
        return;
      }
    }

    // Continue current direction
    const res = tryMove(pacX, pacY, pacDX*spd, pacDY*spd);
    if(res){ pacX=res.x; pacY=res.y; eatCell(); }
  };

  const eatCell = () => {
    const r=Math.round(pacY), c=Math.round(pacX);
    if(r<0||r>=ROWS||c<0||c>=COLS) return;
    if(maze[r][c]===2){
      maze[r][c]=0; score+=10; pelletsLeft--;
      if(pelletsLeft<=0) startLevelUp();
    } else if(maze[r][c]===3){
      maze[r][c]=0; score+=50; pelletsLeft--;
      frightDuration = Math.max(180, 500 - (level-1)*40);
      frightTimer    = frightDuration;
      ghostsEatenThisEnergizer = 0;
      ghosts.forEach(g=>{ if(g.mode!=='eaten'&&g.mode!=='house') g.mode='frightened'; });
      if(pelletsLeft<=0) startLevelUp();
    }
  };

  /* ── Ghost AI ── */
  const GHOST_SPEED = 0.07;
  const ghostSpeed = g => {
    if(g.mode==='frightened') return GHOST_SPEED * .55;
    if(g.mode==='eaten')      return GHOST_SPEED * 1.8;
    return GHOST_SPEED + (level-1)*0.004;
  };

  const ghostTarget = g => {
    if(g.mode==='scatter') return g.scatterTarget;
    if(g.mode==='frightened') return {r:Math.floor(Math.random()*ROWS),c:Math.floor(Math.random()*COLS)};
    if(g.mode==='eaten') return {r:13,c:13}; // return to house
    // Chase targets
    const pr=Math.round(pacY), pc=Math.round(pacX);
    if(g.name==='Blinky') return {r:pr,c:pc};
    if(g.name==='Pinky')  return {r:pr+pacDY*4,c:pc+pacDX*4};
    if(g.name==='Inky'){
      const blinky=ghosts[0];
      return {r:pr+Math.round(blinky.y-pr), c:pc+Math.round(blinky.x-pc)};
    }
    if(g.name==='Clyde'){
      const dist=Math.abs(g.x-pc)+Math.abs(g.y-pr);
      return dist>8?{r:pr,c:pc}:g.scatterTarget;
    }
    return {r:pr,c:pc};
  };

  const updateGhost = (g, dt) => {
    const spd = ghostSpeed(g) * dt;

    if(g.mode==='house'){
      g.houseTimer -= dt;
      if(g.houseTimer<=0){
        g.mode='scatter';
        g.x=13.5; g.y=11; g.dx=0; g.dy=-1;
      }
      return;
    }

    // Move ghost toward target using grid pathfinding (simple greedy)
    const gr=Math.round(g.y), gc=Math.round(g.x);
    const target=ghostTarget(g);

    // Only pick new direction at grid intersections
    if(Math.abs(g.x-gc)<spd*2 && Math.abs(g.y-gr)<spd*2){
      const dirs=[{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];
      const back={r:-g.dy,c:-g.dx};
      let best=null, bestDist=Infinity;
      dirs.forEach(d=>{
        if(d.r===back.r&&d.c===back.c) return; // no reversing unless frightened
        if(g.mode==='frightened'&&Math.random()<0.1) return;
        const nr=gr+d.r, nc=gc+d.c;
        if(isWall(nr,nc)) return;
        if(maze[nr]?.[nc]===4&&g.mode!=='eaten') return; // don't enter house unless eaten
        const dist=Math.abs(nr-target.r)+Math.abs(nc-target.c);
        if(dist<bestDist){bestDist=dist;best=d;}
      });
      if(best){g.dx=best.c;g.dy=best.r;}
    }

    // Move
    const nx=g.x+g.dx*spd, ny=g.y+g.dy*spd;
    const nr=Math.round(ny), nc=Math.round(nx);
    if(!isWall(nr,nc)){g.x=nx;g.y=ny;}
    else{
      // Snap and stop; next tick will pick new dir
      g.x=gc;g.y=gr;g.dx=0;g.dy=0;
    }

    // Tunnel
    if(Math.round(g.y)===TUNNEL_ROW){
      if(g.x<0) g.x=COLS-0.5;
      if(g.x>=COLS) g.x=0.5;
    }

    // Re-enter house check
    if(g.mode==='eaten' && Math.abs(g.x-13.5)<0.5 && Math.abs(g.y-13)<0.5){
      g.mode='scatter'; g.dx=0; g.dy=0;
    }
  };

  /* ── Collision ── */
  const checkCollisions = () => {
    ghosts.forEach(g=>{
      if(g.mode==='house'||g.mode==='eaten') return;
      const dist=Math.abs(g.x-pacX)+Math.abs(g.y-pacY);
      if(dist<0.75){
        if(g.mode==='frightened'){
          // Eat ghost
          ghostsEatenThisEnergizer++;
          const pts=[200,400,800,1600][Math.min(ghostsEatenThisEnergizer-1,3)];
          score+=pts;
          g.mode='eaten';
          haptic('light');
        } else {
          // Pac dies
          pacDied();
        }
      }
    });
  };

  /* ── Lifecycle ── */
  const pacDied = () => {
    if(gameState!=='playing') return;
    gameState='dying';
    haptic('heavy');
    setTimeout(()=>{
      lives--;
      if(lives<=0){
        gameState='over';
      } else {
        resetPositions();
        gameState='waiting';
      }
      drawHUD();
    }, 900);
  };

  const startLevelUp = () => {
    gameState='levelup';
    haptic('success');
  };

  const nextLevel = () => {
    level++;
    resetMaze();
    resetPositions();
    gameState='waiting';
    drawHUD();
  };

  const startGame = () => {
    score=0; lives=3; level=1;
    resetMaze();
    resetPositions();
    gameState='waiting';
    drawHUD();
  };

  /* ── Scatter/chase timer ── */
  let modeTimer=0;
  const MODE_SCHEDULE=[[7*60,20*60],[7*60,20*60],[5*60,999999]]; // [scatter, chase] frames

  const updateModeTimer = (dt) => {
    if(frightTimer>0){
      frightTimer-=dt;
      if(frightTimer<=0){
        frightTimer=0;
        ghosts.forEach(g=>{ if(g.mode==='frightened') g.mode='chase'; });
      }
      return;
    }
    modeTimer+=dt;
    // Simple alternation based on level
    const sch=MODE_SCHEDULE[Math.min(level-1,MODE_SCHEDULE.length-1)];
    const cycle=sch[0]+sch[1];
    const pos=modeTimer%cycle;
    const targetMode=pos<sch[0]?'scatter':'chase';
    ghosts.forEach(g=>{if(g.mode==='chase'||g.mode==='scatter') g.mode=targetMode;});
  };

  /* ── Game loop ── */
  const loop = (ts) => {
    const dt = Math.min((ts-lastTime), 32); // cap at ~2 frames
    lastTime = ts;

    if(gameState==='playing'){
      updatePac(dt);
      updateModeTimer(dt);
      ghosts.forEach(g=>updateGhost(g,dt));
      checkCollisions();
    }

    drawMaze();
    if(gameState!=='over') drawPac();
    drawGhosts();
    drawOverlay();
    drawHUD();

    raf = requestAnimationFrame(loop);
  };

  /* ── Swipe input ── */
  let swX=null, swY=null;
  wrap.addEventListener('touchstart',e=>{
    const t=e.touches[0]; swX=t.clientX; swY=t.clientY;
  },{passive:true});

  wrap.addEventListener('touchend',e=>{
    if(swX===null) return;
    const t=e.changedTouches[0];
    const dx=t.clientX-swX, dy=t.clientY-swY;
    const adx=Math.abs(dx), ady=Math.abs(dy);
    swX=null; swY=null;
    if(Math.max(adx,ady)<18) return;

    const isHoriz = adx>ady;

    if(gameState==='waiting'){
      resetPositions();
      gameState='playing';
      modeTimer=0;
    } else if(gameState==='over'){
      startGame();
      gameState='playing';
      modeTimer=0;
      return;
    } else if(gameState==='levelup'){
      nextLevel();
      gameState='playing';
      modeTimer=0;
      return;
    }

    if(isHoriz){
      pacNextDX = dx>0?1:-1;
      pacNextDY = 0;
    } else {
      pacNextDX = 0;
      pacNextDY = dy>0?1:-1;
    }
    haptic('light');
  },{passive:true});

  // Keyboard support
  const onKey = e => {
    const map={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const d=map[e.key];
    if(!d) return;
    e.preventDefault();
    if(gameState==='waiting'||gameState==='over'||gameState==='levelup'){
      if(gameState==='over') startGame();
      if(gameState==='levelup') nextLevel();
      resetPositions();
      gameState='playing'; modeTimer=0;
    }
    pacNextDX=d[0]; pacNextDY=d[1];
  };
  document.addEventListener('keydown',onKey);

  /* ── Boot ── */
  startGame();
  lastTime = performance.now();
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown',onKey);
  };
}
