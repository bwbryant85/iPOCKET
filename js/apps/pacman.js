/* ════════════ PAC-MAN v2 ════════════
   Fixed: touch on canvas (not wrap), speed normalized per-second,
   BFS ghost pathfinding so ghosts never spin in open areas.
   Swipe to queue direction like 2048.
   ════════════════════════════════════ */
function initPacman() {

  /* ══ LAYOUT ══ */
  const wrap = document.createElement('div');
  wrap.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;align-items:center;background:#000;overflow:hidden;';
  content.appendChild(wrap);

  // Top padding for Dynamic Island
  const topPad = document.createElement('div');
  topPad.style.cssText = 'flex-shrink:0;height:89px;width:100%;background:#000;';
  wrap.appendChild(topPad);

  const cv = document.createElement('canvas');
  cv.style.cssText = 'display:block;flex-shrink:0;touch-action:none;';
  wrap.appendChild(cv);
  const ctx = cv.getContext('2d');

  const hud = document.createElement('div');
  hud.style.cssText = 'flex-shrink:0;display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 20px calc(var(--sb,0px)+10px);background:#000;';
  hud.innerHTML = `
    <div style="display:flex;align-items:center;gap:5px;">
      <span style="font-size:.95rem;">😀</span>
      <span id="pm-lives" style="font-family:'Share Tech Mono',monospace;font-size:.9rem;color:#ffd700;letter-spacing:.06em;">× 3</span>
    </div>
    <div id="pm-score" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;color:#ffd700;letter-spacing:.1em;">0</div>
    <div id="pm-level" style="font-family:'Share Tech Mono',monospace;font-size:.75rem;color:rgba(255,255,255,.35);letter-spacing:.1em;">LVL 1</div>`;
  wrap.appendChild(hud);

  /* ══ MAZE ══
     0=open  1=wall  2=pellet  3=power  4=ghost-house-interior  5=open(no pellet)
     28 × 31 */
  const BASE = [
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
    [1,1,1,1,1,2,1,1,0,1,1,4,4,4,4,4,4,1,1,0,1,1,2,1,1,1,1,1],
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
  const TUNNEL_ROW = 14;

  /* ── Cell size: fit exactly into space above HUD ── */
  const availW = content.offsetWidth;
  const availH = content.offsetHeight - 89 - 48; // DI top + hud bottom
  const CELL = Math.floor(Math.min(availW / COLS, availH / ROWS));
  const MW = CELL * COLS, MH = CELL * ROWS;
  cv.width = MW; cv.height = MH;
  cv.style.width = MW + 'px'; cv.style.height = MH + 'px';

  /* ══ STATE ══ */
  let maze, totalPellets, pelletsLeft;
  let score = 0, lives = 3, level = 1;
  // 'waiting' | 'playing' | 'dying' | 'levelup' | 'over'
  let state = 'waiting';
  let raf = null, lastTS = 0;

  // Pac-Man position in tile units (floats), direction in tiles/sec
  let px, py, pdx, pdy, queueDX, queueDY;
  const PAC_SPEED = 7.5; // tiles per second

  // Mouth animation
  let mouthAngle = 0.4, mouthDir = 1;

  // Ghosts
  let ghosts = [];
  let frightMs = 0, frightTotal = 0;

  // Death animation timer
  let dyingTimer = 0;

  /* ══ MAZE HELPERS ══ */
  const resetMaze = () => {
    maze = BASE.map(r => [...r]);
    totalPellets = 0;
    maze.forEach(r => r.forEach(c => { if (c === 2 || c === 3) totalPellets++; }));
    pelletsLeft = totalPellets;
  };

  const isWall = (r, c) => {
    // Tunnel wrap
    c = ((c % COLS) + COLS) % COLS;
    if (r < 0 || r >= ROWS) return true;
    return maze[r][c] === 1;
  };

  const canEnter = (r, c, forGhost, ghostMode) => {
    c = ((c % COLS) + COLS) % COLS;
    if (r < 0 || r >= ROWS) return false;
    const v = maze[r][c];
    if (v === 1) return false;
    // Ghosts can't enter house unless eaten/returning
    if (forGhost && v === 4 && ghostMode !== 'eaten') return false;
    return true;
  };

  /* ══ BFS pathfinding for ghosts ══ */
  const bfs = (sr, sc, tr, tc, forGhost, ghostMode, forbidReverse, rdx, rdy) => {
    // Returns {dr, dc} for the best first step toward (tr, tc)
    const key = (r,c) => r * COLS + c;
    const visited = new Set();
    const queue = [{r:sr, c:sc, firstDR:null, firstDC:null}];
    visited.add(key(sr, sc));
    const DIRS = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];

    while (queue.length) {
      const cur = queue.shift();
      if (cur.r === tr && cur.c === tc && cur.firstDR !== null) {
        return {dr: cur.firstDR, dc: cur.firstDC};
      }
      for (const d of DIRS) {
        const nr = cur.r + d.r, nc = ((cur.c + d.c) % COLS + COLS) % COLS;
        if (visited.has(key(nr, nc))) continue;
        if (!canEnter(nr, nc, forGhost, ghostMode)) continue;
        // Don't reverse if forbidReverse and this is the first step
        if (forbidReverse && cur.firstDR === null && d.r === -rdx && d.c === -rdy) continue;
        visited.add(key(nr, nc));
        const fdr = cur.firstDR === null ? d.r : cur.firstDR;
        const fdc = cur.firstDC === null ? d.c : cur.firstDC;
        queue.push({r:nr, c:nc, firstDR:fdr, firstDC:fdc});
      }
    }
    // No path — pick any valid direction
    for (const d of DIRS) {
      const nr = cur => cur.r + d.r;
      if (canEnter(sr + d.r, sc + d.c, forGhost, ghostMode)) {
        return {dr: d.r, dc: d.c};
      }
    }
    return {dr: 0, dc: 0};
  };

  /* ══ GHOST SETUP ══ */
  const GHOST_COLS  = ['#ff0000','#ffb8ff','#00ffff','#ffb852'];
  const GHOST_NAMES = ['Blinky','Pinky','Inky','Clyde'];
  // Scatter corners
  const SCATTER = [{r:1,c:26},{r:1,c:1},{r:ROWS-2,c:26},{r:ROWS-2,c:1}];

  const initGhosts = () => {
    ghosts = GHOST_NAMES.map((name, i) => ({
      name, color: GHOST_COLS[i],
      // Float grid position
      x: 13.5 + (i === 1 ? 0 : i === 2 ? -1 : i === 3 ? 1 : 0),
      y: 13,
      // Current tile direction
      dr: 0, dc: 0,
      // Mode: house | scatter | chase | frightened | eaten
      mode: 'house',
      // Delay before leaving house (seconds)
      houseDelay: i === 0 ? 0 : i === 1 ? 3 : i === 2 ? 6 : 10,
      scatter: SCATTER[i],
      // House exit target
      exitX: 13.5, exitY: 11,
    }));
  };

  const GHOST_SPEED = 6.5; // tiles/sec normal
  const ghostSpeed = g => {
    if (g.mode === 'frightened') return GHOST_SPEED * 0.5;
    if (g.mode === 'eaten')      return GHOST_SPEED * 2.2;
    if (g.mode === 'house')      return GHOST_SPEED * 0.4;
    return GHOST_SPEED + (level - 1) * 0.3;
  };

  const ghostTarget = g => {
    const pr = Math.round(py), pc = Math.round(px);
    if (g.mode === 'scatter' || g.mode === 'frightened') return g.scatter;
    if (g.mode === 'eaten')   return {r: 13, c: 13};
    if (g.name === 'Blinky')  return {r: pr, c: pc};
    if (g.name === 'Pinky')   return {r: pr + Math.round(pdy)*4, c: pc + Math.round(pdx)*4};
    if (g.name === 'Inky') {
      const b = ghosts[0];
      const pivR = pr + Math.round(pdy)*2, pivC = pc + Math.round(pdx)*2;
      return {r: 2*pivR - Math.round(b.y), c: 2*pivC - Math.round(b.x)};
    }
    if (g.name === 'Clyde') {
      const dist = Math.abs(g.x - pc) + Math.abs(g.y - pr);
      return dist > 8 ? {r:pr, c:pc} : g.scatter;
    }
    return {r: pr, c: pc};
  };

  /* ══ RESET POSITIONS ══ */
  const resetPositions = () => {
    px = 14; py = 23; pdx = 0; pdy = 0;
    queueDX = -1; queueDY = 0;
    mouthAngle = 0.4; mouthDir = 1;
    frightMs = 0;
    initGhosts();
  };

  /* ══ UPDATE PAC ══ */
  const updatePac = dt => {
    // Animate mouth
    mouthAngle += mouthDir * dt * 3.5;
    if (mouthAngle > 0.68) mouthDir = -1;
    if (mouthAngle < 0.04) mouthDir = 1;

    const spd = PAC_SPEED * dt;
    const cr = Math.round(py), cc = Math.round(px);

    // Try to switch to queued direction when near cell center
    const aligned = Math.abs(px - cc) < 0.35 && Math.abs(py - cr) < 0.35;
    if (aligned && (queueDX !== pdx || queueDY !== pdy)) {
      const nr = cr + queueDY, nc = cc + queueDX;
      if (!isWall(nr, ((nc % COLS) + COLS) % COLS)) {
        pdx = queueDX; pdy = queueDY;
        // Snap to center to avoid drift
        px = cc; py = cr;
      }
    }

    // Move
    if (pdx !== 0 || pdy !== 0) {
      const nr = py + pdy * spd;
      const nc = px + pdx * spd;
      const tr = Math.round(nr), tc = ((Math.round(nc) % COLS) + COLS) % COLS;
      if (!isWall(tr, tc)) {
        py = nr;
        px = nc;
        // Tunnel wrap
        if (Math.round(py) === TUNNEL_ROW) {
          if (px < -0.5)       px = COLS - 0.5;
          if (px > COLS - 0.5) px = -0.5;
        }
      } else {
        // Snap to center of current cell
        py = cr; px = cc;
      }
    }

    // Eat
    const er = Math.round(py), ec = ((Math.round(px) % COLS) + COLS) % COLS;
    if (er >= 0 && er < ROWS) {
      const cell = maze[er][ec];
      if (cell === 2) {
        maze[er][ec] = 0; score += 10; pelletsLeft--;
        if (pelletsLeft <= 0) { state = 'levelup'; haptic('success'); }
      } else if (cell === 3) {
        maze[er][ec] = 0; score += 50; pelletsLeft--;
        frightTotal = Math.max(5000, 10000 - (level-1)*1000);
        frightMs = frightTotal;
        ghosts.forEach(g => { if (g.mode !== 'eaten' && g.mode !== 'house') { g.mode = 'frightened'; }});
        if (pelletsLeft <= 0) { state = 'levelup'; haptic('success'); }
      }
    }
  };

  /* ══ UPDATE GHOSTS ══ */
  const updateGhosts = dt => {
    if (frightMs > 0) {
      frightMs -= dt * 1000;
      if (frightMs <= 0) {
        frightMs = 0;
        ghosts.forEach(g => { if (g.mode === 'frightened') g.mode = 'chase'; });
      }
    }

    ghosts.forEach(g => {
      const spd = ghostSpeed(g) * dt;

      // House logic
      if (g.mode === 'house') {
        g.houseDelay -= dt;
        if (g.houseDelay <= 0) {
          // Move to exit
          g.x += (g.exitX - g.x) * Math.min(1, spd * 2);
          g.y += (g.exitY - g.y) * Math.min(1, spd * 2);
          if (Math.abs(g.x - g.exitX) < 0.1 && Math.abs(g.y - g.exitY) < 0.1) {
            g.x = g.exitX; g.y = g.exitY;
            g.mode = 'scatter'; g.dr = -1; g.dc = 0;
          }
        }
        return;
      }

      // At each tile center, pick new direction via BFS
      const gr = Math.round(g.y), gc = ((Math.round(g.x) % COLS) + COLS) % COLS;
      const atCenter = Math.abs(g.x - gc) < spd * 1.5 && Math.abs(g.y - gr) < spd * 1.5;

      if (atCenter) {
        // Snap to center
        g.x = gc; g.y = gr;

        const tgt = ghostTarget(g);
        const tr = Math.max(0, Math.min(ROWS-1, tgt.r));
        const tc = ((tgt.c % COLS) + COLS) % COLS;

        // Frightened: random valid direction (no reversing)
        if (g.mode === 'frightened') {
          const dirs = [{r:-1,c:0},{r:1,c:0},{r:0,c:-1},{r:0,c:1}];
          const valid = dirs.filter(d => {
            if (d.r === -g.dr && d.c === -g.dc) return false;
            return canEnter(gr + d.r, gc + d.c, true, g.mode);
          });
          if (valid.length > 0) {
            const pick = valid[Math.floor(Math.random() * valid.length)];
            g.dr = pick.r; g.dc = pick.c;
          }
        } else {
          // BFS toward target
          const step = bfs(gr, gc, tr, tc, true, g.mode, true, g.dr, g.dc);
          if (step.dr !== 0 || step.dc !== 0) {
            g.dr = step.dr; g.dc = step.dc;
          }
        }
      }

      // Move ghost
      const nx = g.x + g.dc * spd;
      const ny = g.y + g.dr * spd;
      const ngr = Math.round(ny), ngc = ((Math.round(nx) % COLS) + COLS) % COLS;

      if (canEnter(ngr, ngc, true, g.mode)) {
        g.x = nx; g.y = ny;
        // Tunnel
        if (Math.round(g.y) === TUNNEL_ROW) {
          if (g.x < -0.5)       g.x = COLS - 0.5;
          if (g.x > COLS - 0.5) g.x = -0.5;
        }
      } else {
        g.dr = 0; g.dc = 0; // stop, will re-route next tick
      }

      // Re-enter house check for eaten ghosts
      if (g.mode === 'eaten' && Math.abs(g.x - 13.5) < 0.5 && Math.abs(g.y - 13) < 0.5) {
        g.mode = 'scatter'; g.dr = 0; g.dc = 0;
      }
    });
  };

  /* ══ COLLISIONS ══ */
  let ghostEatCombo = 0;
  const checkCollisions = () => {
    ghosts.forEach(g => {
      if (g.mode === 'house' || g.mode === 'eaten') return;
      const dist = Math.abs(g.x - px) + Math.abs(g.y - py);
      if (dist < 0.8) {
        if (g.mode === 'frightened') {
          ghostEatCombo++;
          const pts = [200,400,800,1600][Math.min(ghostEatCombo-1, 3)];
          score += pts;
          g.mode = 'eaten';
          haptic('light');
        } else {
          if (state !== 'playing') return;
          state = 'dying';
          dyingTimer = 1.2;
          haptic('heavy');
        }
      }
    });
  };

  /* ══ DRAW ══ */
  const WALL_COLOR = '#1919cc';
  const WALL_INNER = '#3333ff';

  const drawMaze = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, MW, MH);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const v = maze[r][c];
        const x = c * CELL, y = r * CELL;
        if (v === 1) {
          ctx.fillStyle = WALL_COLOR;
          ctx.fillRect(x, y, CELL, CELL);
          // Subtle inner glow edge
          ctx.strokeStyle = WALL_INNER;
          ctx.lineWidth = 0.8;
          ctx.strokeRect(x + 0.5, y + 0.5, CELL - 1, CELL - 1);
        } else if (v === 2) {
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, CELL * 0.11, 0, Math.PI*2);
          ctx.fillStyle = '#ffb8ae';
          ctx.fill();
        } else if (v === 3) {
          const p = 0.65 + 0.35 * Math.sin(Date.now() * 0.007);
          ctx.beginPath();
          ctx.arc(x + CELL/2, y + CELL/2, CELL * 0.3 * p, 0, Math.PI*2);
          ctx.fillStyle = '#ffb8ae';
          ctx.shadowColor = '#ffb8ae';
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  };

  const drawPac = () => {
    if (state === 'dying') {
      // Dying animation: shrink
      const prog = 1 - (dyingTimer / 1.2);
      ctx.save();
      ctx.translate(px * CELL + CELL/2, py * CELL + CELL/2);
      ctx.rotate(Math.PI * prog * 2);
      ctx.scale(1 - prog * 0.7, 1 - prog * 0.7);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, CELL * 0.45, 0.1, Math.PI * 2 - 0.1);
      ctx.closePath();
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.restore();
      return;
    }
    const x = px * CELL + CELL/2;
    const y = py * CELL + CELL/2;
    const r = CELL * 0.44;
    let rot = 0;
    if (pdx === 1)  rot = 0;
    if (pdx === -1) rot = Math.PI;
    if (pdy === -1) rot = -Math.PI/2;
    if (pdy === 1)  rot = Math.PI/2;
    // If stopped, default facing left
    if (pdx === 0 && pdy === 0) rot = Math.PI;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, mouthAngle, Math.PI*2 - mouthAngle);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  };

  const drawGhosts = () => {
    ghosts.forEach(g => {
      const x = g.x * CELL + CELL/2;
      const y = g.y * CELL + CELL/2;
      const r = CELL * 0.44;
      const fright  = g.mode === 'frightened';
      const eaten   = g.mode === 'eaten';
      const flashing = fright && frightMs < frightTotal * 0.35 && Math.floor(Date.now() / 250) % 2 === 0;

      if (eaten) {
        // Just eyes
        ctx.fillStyle = '#fff';
        [-0.2, 0.2].forEach(ox => {
          ctx.beginPath(); ctx.arc(x + ox*CELL, y - 0.08*CELL, CELL*0.09, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#00f';
          ctx.beginPath(); ctx.arc(x + ox*CELL + g.dc*CELL*0.04, y - 0.08*CELL + g.dr*CELL*0.04, CELL*0.05, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff';
        });
        return;
      }

      const col = fright ? (flashing ? '#fff' : '#0000bb') : g.color;

      // Body
      ctx.beginPath();
      ctx.arc(x, y, r, Math.PI, 0);
      ctx.lineTo(x + r, y + r * 0.9);
      const segs = 4, segW = r * 2 / segs;
      for (let i = 0; i < segs; i++) {
        const waveX = x + r - (i + 0.5) * segW;
        const waveY = y + r * 0.9 + (i % 2 === 0 ? -CELL * 0.12 : CELL * 0.12);
        ctx.quadraticCurveTo(waveX, waveY, x + r - (i + 1) * segW, y + r * 0.9);
      }
      ctx.closePath();
      ctx.fillStyle = col;
      ctx.shadowColor = col;
      ctx.shadowBlur = fright ? 0 : 6;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (!fright) {
        // Eyes
        ctx.fillStyle = '#fff';
        [-0.2, 0.2].forEach(ox => {
          ctx.beginPath(); ctx.arc(x + ox*CELL, y - 0.08*CELL, CELL*0.1, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#00f';
          ctx.beginPath(); ctx.arc(x + ox*CELL + g.dc*CELL*0.04, y - 0.08*CELL + g.dr*CELL*0.04, CELL*0.055, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fff';
        });
      } else {
        // X eyes
        ctx.strokeStyle = flashing ? '#000' : '#fff';
        ctx.lineWidth = 1.5;
        [-0.2, 0.2].forEach(ox => {
          const ex = x + ox*CELL, ey = y - 0.09*CELL, s = CELL*0.07;
          ctx.beginPath(); ctx.moveTo(ex-s, ey-s); ctx.lineTo(ex+s, ey+s); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ex+s, ey-s); ctx.lineTo(ex-s, ey+s); ctx.stroke();
        });
      }
    });
  };

  const drawOverlay = () => {
    const overlayText = (line1, col1, line2, col2, line3) => {
      ctx.fillStyle = 'rgba(0,0,0,.72)';
      ctx.fillRect(0, 0, MW, MH);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowBlur = 18; ctx.shadowColor = col1;
      ctx.font = `900 ${CELL * 1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle = col1;
      ctx.fillText(line1, MW/2, MH * 0.37);
      ctx.shadowBlur = 0;
      if (line2) {
        ctx.font = `${CELL * 0.72}px 'Share Tech Mono',monospace`;
        ctx.fillStyle = col2;
        ctx.fillText(line2, MW/2, MH * 0.51);
      }
      if (line3) {
        ctx.font = `${CELL * 0.52}px 'Share Tech Mono',monospace`;
        ctx.fillStyle = 'rgba(255,255,255,.35)';
        ctx.fillText(line3, MW/2, MH * 0.62);
      }
    };

    if (state === 'waiting') {
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(0, 0, MW, MH);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `900 ${CELL * 1.1}px 'Orbitron',sans-serif`;
      ctx.fillStyle = '#ffd700';
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 20;
      ctx.fillText('PAC-MAN', MW/2, MH * 0.35);
      ctx.shadowBlur = 0;
      ctx.font = `${CELL * 0.62}px 'Share Tech Mono',monospace`;
      ctx.fillStyle = 'rgba(255,255,255,.7)';
      ctx.fillText('SWIPE TO START', MW/2, MH * 0.48);
      ctx.font = `${CELL * 0.46}px 'Share Tech Mono',monospace`;
      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.fillText('Swipe to steer  ·  Queue turns', MW/2, MH * 0.58);
    }
    if (state === 'over')    overlayText('GAME OVER','#ff4af8', score.toLocaleString(), '#ffd700', 'SWIPE TO RETRY');
    if (state === 'levelup') overlayText('LEVEL ' + level, '#00ffcc', '', '', 'SWIPE TO CONTINUE');
  };

  const updateHUD = () => {
    document.getElementById('pm-score').textContent = score.toLocaleString();
    document.getElementById('pm-lives').textContent = '× ' + lives;
    document.getElementById('pm-level').textContent = 'LVL ' + level;
  };

  /* ══ GAME LOOP ══ */
  const loop = ts => {
    const dt = Math.min((ts - lastTS) / 1000, 0.05); // seconds, capped at 50ms
    lastTS = ts;

    if (state === 'playing') {
      updatePac(dt);
      updateGhosts(dt);
      checkCollisions();
    }

    if (state === 'dying') {
      dyingTimer -= dt;
      if (dyingTimer <= 0) {
        lives--;
        if (lives <= 0) { state = 'over'; }
        else { resetPositions(); state = 'waiting'; }
        updateHUD();
      }
    }

    drawMaze();
    drawPac();
    drawGhosts();
    drawOverlay();
    updateHUD();

    raf = requestAnimationFrame(loop);
  };

  /* ══ SWIPE INPUT — attached to CANVAS ══ */
  let swX = null, swY = null;

  // Use pointer events for reliability on iOS PWA
  const onTouchStart = e => {
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    swX = t.clientX; swY = t.clientY;
  };
  const onTouchEnd = e => {
    if (swX === null) return;
    const t = e.changedTouches ? e.changedTouches[0] : e;
    const dx = t.clientX - swX, dy = t.clientY - swY;
    swX = null; swY = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return;

    if (state === 'waiting') {
      state = 'playing';
      ghostEatCombo = 0;
    } else if (state === 'over') {
      score = 0; lives = 3; level = 1;
      resetMaze(); resetPositions();
      state = 'playing'; ghostEatCombo = 0;
    } else if (state === 'levelup') {
      level++;
      resetMaze(); resetPositions();
      state = 'playing'; ghostEatCombo = 0;
      frightMs = 0;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      queueDX = dx > 0 ? 1 : -1; queueDY = 0;
    } else {
      queueDX = 0; queueDY = dy > 0 ? 1 : -1;
    }
    haptic('light');
  };

  // Attach to CANVAS (not wrap) so touch registers correctly
  cv.addEventListener('touchstart', onTouchStart, { passive: false });
  cv.addEventListener('touchend',   onTouchEnd,   { passive: false });
  cv.addEventListener('mousedown',  onTouchStart);
  cv.addEventListener('mouseup',    onTouchEnd);

  // Keyboard
  const onKey = e => {
    const map = { ArrowLeft:[-1,0], ArrowRight:[1,0], ArrowUp:[0,-1], ArrowDown:[0,1] };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    if (state === 'waiting')  { state = 'playing'; ghostEatCombo = 0; }
    if (state === 'over')     { score=0;lives=3;level=1; resetMaze();resetPositions(); state='playing'; ghostEatCombo=0; }
    if (state === 'levelup')  { level++;resetMaze();resetPositions(); state='playing';ghostEatCombo=0;frightMs=0; }
    queueDX = d[0]; queueDY = d[1];
  };
  document.addEventListener('keydown', onKey);

  /* ── Init ── */
  resetMaze();
  resetPositions();
  lastTS = performance.now();
  raf = requestAnimationFrame(loop);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('keydown', onKey);
  };
}
