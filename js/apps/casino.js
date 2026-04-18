/* ════════════ CASINO 🎰 ════════════ */
function initCasino() {

  /* ── Shared wallet ── */
  let COINS = 1000;
  let activeGame = null;

  /* ── Root ── */
  const root = document.createElement('div');
  root.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;background:#050508;overflow:hidden;';
  content.appendChild(root);

  /* ── Inject styles ── */
  if (!document.getElementById('casino-styles')) {
    const st = document.createElement('style');
    st.id = 'casino-styles';
    st.textContent = `
      @keyframes cs-deal   { from{opacity:0;transform:translateY(-40px) rotate(-8deg)} to{opacity:1;transform:translateY(0) rotate(0)} }
      @keyframes cs-win    { 0%,100%{transform:scale(1)} 25%{transform:scale(1.18)} 75%{transform:scale(1.1)} }
      @keyframes cs-shake  { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
      @keyframes cs-spin-blur { from{filter:blur(4px);transform:translateY(-60px)} to{filter:blur(0);transform:translateY(0)} }
      @keyframes cs-coins  { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-80px) scale(1.4);opacity:0} }
      @keyframes cs-pulse  { 0%,100%{box-shadow:0 0 20px rgba(255,215,0,.4)} 50%{box-shadow:0 0 40px rgba(255,215,0,.9)} }
      @keyframes cs-reel   { 0%{transform:translateY(0)} 100%{transform:translateY(-100%)} }
      .cs-card-deal { animation: cs-deal .3s cubic-bezier(.34,1.56,.64,1) both; }
      .cs-win-anim  { animation: cs-win .5s ease both; }
      .cs-lose-anim { animation: cs-shake .4s ease both; }
    `;
    document.head.appendChild(st);
  }

  /* ══════════════════════════════════════
     HEADER
  ══════════════════════════════════════ */
  const header = document.createElement('div');
  header.style.cssText = 'flex-shrink:0;padding:89px 18px 0;background:#050508;';
  root.appendChild(header);

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:14px;';
  headerRow.innerHTML = `
    <button id="cs-back" style="display:none;font-family:'Orbitron',sans-serif;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:var(--cyan);background:transparent;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;padding:6px 0;text-shadow:var(--gc);">← Back</button>
    <div id="cs-title" style="font-family:'Orbitron',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;">🎰 Casino</div>
    <div id="cs-wallet" style="font-family:'Share Tech Mono',monospace;font-size:.85rem;color:#ffd700;text-shadow:0 0 12px rgba(255,215,0,.6);letter-spacing:.06em;">🪙 1,000</div>`;
  header.appendChild(headerRow);

  /* ── Game nav tabs (shown when in a game) ── */
  const gameTabs = document.createElement('div');
  gameTabs.style.cssText = 'display:none;flex;gap:6px;margin-bottom:14px;';
  gameTabs.id = 'cs-tabs';
  header.appendChild(gameTabs);

  /* ── Body ── */
  const body = document.createElement('div');
  body.style.cssText = 'flex:1;overflow:hidden;position:relative;';
  root.appendChild(body);

  /* ── Update wallet display ── */
  const updateWallet = (delta, el) => {
    COINS += delta;
    if (COINS < 0) COINS = 0;
    document.getElementById('cs-wallet').textContent = `🪙 ${COINS.toLocaleString()}`;
    // Floating coin animation
    if (delta !== 0 && el) {
      const float = document.createElement('div');
      const win = delta > 0;
      float.style.cssText = `position:fixed;font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;color:${win?'#ffd700':'#ff6b6b'};pointer-events:none;z-index:9999;animation:cs-coins .8s ease forwards;`;
      float.textContent = (win ? '+' : '') + delta.toLocaleString();
      const r = el.getBoundingClientRect();
      float.style.left = r.left + r.width/2 - 30 + 'px';
      float.style.top  = r.top + 'px';
      document.body.appendChild(float);
      setTimeout(() => float.remove(), 900);
    }
  };

  /* ════════════════════════════════════════
     LOBBY
  ════════════════════════════════════════ */
  const lobbyPanel = document.createElement('div');
  lobbyPanel.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:12px 16px 60px;display:flex;flex-direction:column;gap:14px;';
  body.appendChild(lobbyPanel);

  const GAMES = [
    { id:'slots',   name:'Slot Machine',  ico:'🎰', desc:'3 reels · Match symbols to win',   col:'#ffd700', grad:'linear-gradient(135deg,#4a2800,#1a0a00)' },
    { id:'hilo',    name:'Hi-Lo',          ico:'🃏', desc:'Higher or lower than the last card?',col:'#e53935', grad:'linear-gradient(135deg,#2a0000,#0a0000)' },
    { id:'blackjack',name:'Blackjack',     ico:'♠️', desc:'Beat the dealer · Get to 21',       col:'#00ffcc', grad:'linear-gradient(135deg,#003320,#000a08)' },
  ];

  // Header for lobby
  const lobbyHdr = document.createElement('div');
  lobbyHdr.style.cssText = 'font-family:"Share Tech Mono",monospace;font-size:.62rem;color:var(--dim);letter-spacing:.18em;text-transform:uppercase;margin-bottom:4px;';
  lobbyHdr.textContent = 'Choose a game';
  lobbyPanel.appendChild(lobbyHdr);

  GAMES.forEach(g => {
    const card = document.createElement('div');
    card.style.cssText = `padding:22px 20px;border-radius:22px;background:${g.grad};border:1px solid ${g.col}40;box-shadow:0 4px 24px rgba(0,0,0,.5),0 0 0 0 ${g.col};cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .15s,box-shadow .15s;position:relative;overflow:hidden;`;
    card.innerHTML = `
      <div style="position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,${g.col},transparent);"></div>
      <div style="display:flex;align-items:center;gap:16px;">
        <div style="font-size:2.8rem;line-height:1;flex-shrink:0;">${g.ico}</div>
        <div>
          <div style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.06em;color:${g.col};margin-bottom:5px;">${g.name}</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:rgba(255,255,255,.4);letter-spacing:.06em;">${g.desc}</div>
        </div>
        <div style="margin-left:auto;font-size:1.4rem;color:${g.col};opacity:.5;">›</div>
      </div>`;
    card.addEventListener('touchstart', () => { card.style.transform='scale(.97)'; }, {passive:true});
    card.addEventListener('touchend',   () => { card.style.transform=''; }, {passive:true});
    card.addEventListener('click', () => openGame(g.id));
    lobbyPanel.appendChild(card);
  });

  // Balance card
  const balCard = document.createElement('div');
  balCard.style.cssText = 'margin-top:8px;padding:18px 20px;border-radius:18px;background:rgba(255,215,0,.05);border:1px solid rgba(255,215,0,.15);text-align:center;';
  balCard.innerHTML = `
    <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,215,0,.5);letter-spacing:.18em;text-transform:uppercase;margin-bottom:6px;">Your Balance</div>
    <div id="cs-lobby-bal" style="font-family:'Orbitron',sans-serif;font-size:2rem;font-weight:900;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,.5);">🪙 1,000</div>
    <button id="cs-refill" style="margin-top:10px;font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.3);background:transparent;border:1px solid rgba(255,255,255,.08);padding:6px 16px;border-radius:12px;cursor:pointer;">Refill to 1,000</button>`;
  lobbyPanel.appendChild(balCard);

  document.getElementById('cs-refill').onclick = () => {
    if (COINS < 1000) { updateWallet(1000 - COINS, balCard); refreshLobbyBal(); haptic('success'); }
  };
  const refreshLobbyBal = () => {
    const el = document.getElementById('cs-lobby-bal');
    if (el) el.textContent = `🪙 ${COINS.toLocaleString()}`;
  };

  /* ── Game panels ── */
  const gamePanels = {};
  const makeGamePanel = () => {
    const p = document.createElement('div');
    p.style.cssText = 'position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:10px 16px 60px;transform:translateX(100%);transition:transform .32s cubic-bezier(.34,1.56,.64,1);';
    body.appendChild(p);
    return p;
  };

  /* ════════════════════════════════════════
     OPEN / CLOSE GAME
  ════════════════════════════════════════ */
  const openGame = id => {
    haptic('medium');
    activeGame = id;
    document.getElementById('cs-title').textContent = GAMES.find(g=>g.id===id)?.name || 'Game';
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:var(--cyan);text-shadow:var(--gc);flex:1;background:none;-webkit-text-fill-color:unset;';
    document.getElementById('cs-back').style.display = '';

    lobbyPanel.style.transition = 'transform .32s cubic-bezier(.34,1.56,.64,1)';
    lobbyPanel.style.transform  = 'translateX(-100%)';

    if (!gamePanels[id]) {
      gamePanels[id] = makeGamePanel();
      if (id === 'slots')     buildSlots(gamePanels[id]);
      if (id === 'hilo')      buildHiLo(gamePanels[id]);
      if (id === 'blackjack') buildBlackjack(gamePanels[id]);
    }
    gamePanels[id].style.transform = 'translateX(0)';
  };

  const closeGame = () => {
    haptic('light');
    if (gamePanels[activeGame]) gamePanels[activeGame].style.transform = 'translateX(100%)';
    lobbyPanel.style.transform = 'translateX(0)';
    document.getElementById('cs-title').innerHTML = '';
    document.getElementById('cs-title').style.cssText = 'font-family:"Orbitron",sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;flex:1;';
    document.getElementById('cs-title').textContent = '🎰 Casino';
    document.getElementById('cs-back').style.display = 'none';
    activeGame = null;
    refreshLobbyBal();
  };

  document.getElementById('cs-back').addEventListener('click', closeGame);

  /* ════════════════════════════════════════
     🎰 SLOT MACHINE
  ════════════════════════════════════════ */
  const buildSlots = wrap => {
    const SYMBOLS = ['🍒','🍋','🍊','🍇','⭐','💎','7️⃣','🔔'];
    const PAYS = {
      '7️⃣7️⃣7️⃣':50, '💎💎💎':30, '⭐⭐⭐':20,
      '🔔🔔🔔':15, '🍇🍇🍇':10, '🍊🍊🍊':8,
      '🍋🍋🍋':6,  '🍒🍒🍒':5,
      // Two match
      '💎💎':3, '7️⃣7️⃣':3, '⭐⭐':2,
      '🍒🍒':2, '🔔🔔':2,
    };
    let bet = 10, spinning = false;
    let reelVals = ['🍒','🍒','🍒'];

    const mkPayout = () => {
      const rows = Object.entries(PAYS).map(([k,v])=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);"><span style="font-size:.8rem;">${k}</span><span style="font-family:'Share Tech Mono',monospace;font-size:.65rem;color:#ffd700;">×${v}</span></div>`).join('');
      return `<div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--dim);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px;">Payouts (× bet)</div>${rows}`;
    };

    wrap.innerHTML = `
      <!-- Reel window -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:20px;padding-top:10px;">
        <!-- Reels -->
        <div style="position:relative;background:linear-gradient(180deg,#0a0800,#1a1200,#0a0800);border:2px solid rgba(255,215,0,.3);border-radius:20px;padding:8px;box-shadow:0 0 30px rgba(255,215,0,.1),inset 0 0 20px rgba(0,0,0,.8);">
          <!-- Scan line -->
          <div style="position:absolute;left:8px;right:8px;top:50%;transform:translateY(-50%);height:68px;background:rgba(255,215,0,.06);border:1px solid rgba(255,215,0,.2);border-radius:10px;pointer-events:none;z-index:2;"></div>
          <div style="display:flex;gap:8px;position:relative;z-index:1;" id="sl-reels">
            ${[0,1,2].map(i=>`<div id="sl-reel-${i}" style="width:72px;height:68px;display:flex;align-items:center;justify-content:center;font-size:2.6rem;border-radius:10px;background:rgba(255,255,255,.04);overflow:hidden;position:relative;">🍒</div>`).join('')}
          </div>
        </div>

        <!-- Win display -->
        <div id="sl-result" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;min-height:28px;text-align:center;"></div>

        <!-- Bet controls -->
        <div style="display:flex;align-items:center;gap:14px;">
          <button id="sl-bd" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
          <div style="text-align:center;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.52rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">BET</div>
            <div id="sl-bet" style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#ffd700;">10</div>
          </div>
          <button id="sl-bu" style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
          <button id="sl-max" style="font-family:'Orbitron',sans-serif;font-size:.5rem;letter-spacing:.1em;text-transform:uppercase;color:#ffd700;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.25);padding:8px 14px;border-radius:14px;cursor:pointer;-webkit-tap-highlight-color:transparent;">MAX</button>
        </div>

        <!-- Spin button -->
        <button id="sl-spin" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#ffd700,#ff8c00);border:none;padding:18px 52px;border-radius:50px;cursor:pointer;box-shadow:0 4px 24px rgba(255,165,0,.5);-webkit-tap-highlight-color:transparent;transition:transform .1s;animation:cs-pulse 2s infinite;">SPIN</button>

        <!-- Payout table -->
        <div style="width:100%;max-width:320px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:16px;padding:14px 16px;">
          ${mkPayout()}
        </div>
      </div>`;

    // Wire up
    const betEl   = document.getElementById('sl-bet');
    const resultEl = document.getElementById('sl-result');
    const spinBtn  = document.getElementById('sl-spin');

    const setBet = v => { bet = Math.max(5, Math.min(200, v)); betEl.textContent = bet; };
    document.getElementById('sl-bd').onclick  = () => { haptic('light'); setBet(bet - 5); };
    document.getElementById('sl-bu').onclick  = () => { haptic('light'); setBet(bet + 5); };
    document.getElementById('sl-max').onclick = () => { haptic('light'); setBet(200); };

    const spin = () => {
      if (spinning || COINS < bet) {
        if (COINS < bet) { resultEl.style.color='#ff6b6b'; resultEl.textContent='Not enough coins!'; }
        return;
      }
      spinning = true;
      haptic('medium');
      updateWallet(-bet, spinBtn);
      resultEl.textContent = '';

      // Animate reels with staggered stops
      const finalSymbols = [0,1,2].map(() => SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]);

      // Apply weighted "near miss" feel — 30% chance reels 0 and 1 match
      if (Math.random() < .3) finalSymbols[1] = finalSymbols[0];

      [0,1,2].forEach((i) => {
        const reel = document.getElementById(`sl-reel-${i}`);
        let ticks = 0;
        const maxTicks = 8 + i * 5;
        const interval = setInterval(() => {
          reel.textContent = SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
          reel.style.filter = 'blur(2px)';
          ticks++;
          if (ticks >= maxTicks) {
            clearInterval(interval);
            reel.textContent = finalSymbols[i];
            reel.style.filter = '';
            reel.style.animation = 'cs-spin-blur .2s ease';
            setTimeout(()=>reel.style.animation='', 200);
            if (i === 2) {
              // All reels stopped — evaluate
              setTimeout(() => evalSpin(finalSymbols, spinBtn), 150);
            }
          }
        }, 80);
      });
    };

    const evalSpin = (syms, refEl) => {
      let mult = 0;
      const key3 = syms.join('');
      const key2a = syms[0] === syms[1] ? syms[0]+syms[0] : null;
      const key2b = syms[1] === syms[2] ? syms[1]+syms[1] : null;

      if (PAYS[key3]) mult = PAYS[key3];
      else if (key2a && PAYS[key2a]) mult = PAYS[key2a];
      else if (key2b && PAYS[key2b]) mult = PAYS[key2b];

      if (mult > 0) {
        const prize = bet * mult;
        updateWallet(prize, refEl);
        resultEl.style.color = '#ffd700';
        resultEl.textContent = `🏆 ×${mult}  +${prize} coins!`;
        resultEl.style.animation = 'cs-win .5s ease';
        setTimeout(()=>resultEl.style.animation='', 500);
        haptic('success');
        // Flash reels gold
        [0,1,2].forEach(i => {
          const r = document.getElementById(`sl-reel-${i}`);
          r.style.background = 'rgba(255,215,0,.18)';
          r.style.boxShadow  = '0 0 20px rgba(255,215,0,.6)';
          setTimeout(()=>{ r.style.background='rgba(255,255,255,.04)'; r.style.boxShadow=''; }, 1200);
        });
      } else {
        resultEl.style.color = 'rgba(255,255,255,.3)';
        resultEl.textContent = 'No match. Try again.';
        haptic('light');
      }
      spinning = false;
    };

    spinBtn.addEventListener('click', spin);
    spinBtn.addEventListener('touchstart', ()=>spinBtn.style.transform='scale(.95)', {passive:true});
    spinBtn.addEventListener('touchend', ()=>spinBtn.style.transform='', {passive:true});
  };

  /* ════════════════════════════════════════
     🃏 HI-LO
  ════════════════════════════════════════ */
  const buildHiLo = wrap => {
    const SUITS  = ['♠','♥','♦','♣'];
    const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const VALUES = { A:1, '2':2, '3':3, '4':4, '5':5, '6':6, '7':7, '8':8, '9':9, '10':10, J:11, Q:12, K:13 };
    const SUIT_COLORS = { '♠':'#fff', '♣':'#fff', '♥':'#ff4444', '♦':'#ff4444' };

    let deck = [], currentCard = null, streak = 0, bet = 10, waiting = false;

    const mkDeck = () => {
      deck = [];
      SUITS.forEach(s => RANKS.forEach(r => deck.push({r,s,v:VALUES[r]})));
      // Shuffle
      for (let i = deck.length-1; i>0; i--) {
        const j = Math.floor(Math.random()*(i+1));
        [deck[i],deck[j]] = [deck[j],deck[i]];
      }
    };
    const drawCard = () => deck.length ? deck.pop() : (mkDeck(), deck.pop());

    const cardHTML = (card, hidden) => {
      if (hidden) return `<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:2rem;">🂠</div>`;
      const col = SUIT_COLORS[card.s];
      return `<div style="width:90px;height:130px;border-radius:14px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:8px;color:${col};animation:cs-deal .3s both;">
        <div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;">${card.r}<br><span style="font-size:1.2rem;">${card.s}</span></div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:2.2rem;">${card.s}</div>
        <div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;line-height:1;align-self:flex-end;transform:rotate(180deg);">${card.r}<br><span style="font-size:1.2rem;">${card.s}</span></div>
      </div>`;
    };

    const render = () => {
      wrap.innerHTML = '';
      mkDeck();
      currentCard = drawCard();
      streak = 0;
      waiting = false;
      renderState();
    };

    const renderState = () => {
      wrap.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;gap:18px;padding-top:10px;">
          <!-- Streak -->
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.6rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;">Streak</div>
            <div id="hl-streak" style="font-family:'Orbitron',sans-serif;font-size:1.1rem;font-weight:900;color:#ffd700;min-width:30px;text-align:center;">${streak}</div>
            ${streak>=3?`<div style="font-size:.7rem;color:#ffd700;">🔥</div>`:''}
          </div>

          <!-- Cards row -->
          <div style="display:flex;align-items:center;gap:14px;">
            <div id="hl-card">${cardHTML(currentCard, false)}</div>
            <div style="font-size:2rem;color:rgba(255,255,255,.2);">→</div>
            <div id="hl-next">${cardHTML(null, true)}</div>
          </div>

          <!-- Card info -->
          <div style="font-family:'Share Tech Mono',monospace;font-size:.7rem;color:var(--dim);letter-spacing:.1em;">
            Current: <span style="color:var(--text);">${currentCard.r}${currentCard.s}</span> (value ${currentCard.v})
          </div>

          <!-- Result -->
          <div id="hl-result" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;min-height:26px;text-align:center;"></div>

          <!-- Multiplier info -->
          <div style="font-family:'Share Tech Mono',monospace;font-size:.58rem;color:rgba(255,255,255,.25);text-align:center;">
            Streak bonus: ×${Math.max(1,streak)} on next win
          </div>

          <!-- Hi / Lo buttons -->
          <div style="display:flex;gap:12px;" id="hl-btns">
            <button id="hl-lo" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#0033cc,#001a66);border:2px solid #4488ff;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(0,100,255,.4);">▼ Lower</button>
            <button id="hl-hi" style="font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#cc0000,#660000);border:2px solid #ff4444;padding:16px 32px;border-radius:22px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 4px 20px rgba(255,0,0,.4);">▲ Higher</button>
          </div>

          <!-- Bet + Cashout -->
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;">
            <button id="hl-bd" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
            <div style="text-align:center;">
              <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div>
              <div id="hl-bet" style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:#ffd700;">${bet}</div>
            </div>
            <button id="hl-bu" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.1rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
            ${streak>0?`<button id="hl-cash" style="font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:#050508;background:#ffd700;border:none;padding:10px 20px;border-radius:16px;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 16px rgba(255,215,0,.5);">Cash Out ×${streak}</button>`:''}
          </div>
        </div>`;

      const setBet = v => { bet=Math.max(5,Math.min(200,v)); document.getElementById('hl-bet').textContent=bet; };
      document.getElementById('hl-bd').onclick = ()=>{ haptic('light'); setBet(bet-5); };
      document.getElementById('hl-bu').onclick = ()=>{ haptic('light'); setBet(bet+5); };

      const guess = choice => {
        if (waiting) return;
        if (COINS < bet) { document.getElementById('hl-result').style.color='#ff6b6b'; document.getElementById('hl-result').textContent='Not enough coins!'; return; }
        waiting = true;
        updateWallet(-bet, document.getElementById('hl-btns'));
        haptic('medium');

        const nextCard = drawCard();
        document.getElementById('hl-next').innerHTML = cardHTML(nextCard, false);

        setTimeout(() => {
          const resultEl = document.getElementById('hl-result');
          const isHigher = nextCard.v > currentCard.v;
          const isLower  = nextCard.v < currentCard.v;
          const isTie    = nextCard.v === currentCard.v;
          const correct  = (!isTie) && ((choice==='hi' && isHigher) || (choice==='lo' && isLower));

          if (isTie) {
            resultEl.style.color='#ffd700'; resultEl.textContent='🤝 Tie — bet returned!';
            updateWallet(bet, resultEl); streak=0; haptic('light');
          } else if (correct) {
            streak++;
            const prize = bet * Math.max(1, streak);
            updateWallet(prize, resultEl);
            resultEl.style.color='#ffd700'; resultEl.textContent=`✓ Correct! +${prize} (×${Math.max(1,streak)} streak)`;
            haptic('success');
          } else {
            resultEl.style.color='#ff6b6b'; resultEl.textContent=`✗ Wrong! ${nextCard.r}${nextCard.s} (${nextCard.v})`;
            streak=0; haptic('heavy');
          }

          currentCard = nextCard;
          setTimeout(() => { waiting=false; renderState(); }, 1200);
        }, 400);
      };

      document.getElementById('hl-hi').onclick = ()=>guess('hi');
      document.getElementById('hl-lo').onclick = ()=>guess('lo');
      const cashEl = document.getElementById('hl-cash');
      if (cashEl) cashEl.onclick = ()=>{
        haptic('success');
        const prize = bet * streak;
        updateWallet(prize, cashEl);
        streak=0; renderState();
      };
    };

    render();
  };

  /* ════════════════════════════════════════
     ♠ BLACKJACK
  ════════════════════════════════════════ */
  const buildBlackjack = wrap => {
    const SUITS  = ['♠','♥','♦','♣'];
    const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const SUIT_COLORS = { '♠':'#111', '♣':'#111', '♥':'#cc0000', '♦':'#cc0000' };

    let deck=[], playerHand=[], dealerHand=[], bet=20, gameState='idle'; // idle | playing | over

    const mkDeck=()=>{
      deck=[];
      SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s})));
      SUITS.forEach(s=>RANKS.forEach(r=>deck.push({r,s}))); // double deck
      for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}
    };
    const drawCard=()=>deck.length?deck.pop():(mkDeck(),deck.pop());

    const cardVal=(card)=>{
      if(['J','Q','K'].includes(card.r)) return 10;
      if(card.r==='A') return 11;
      return parseInt(card.r);
    };
    const handVal=(hand)=>{
      let total=hand.reduce((s,c)=>s+cardVal(c),0);
      let aces=hand.filter(c=>c.r==='A').length;
      while(total>21&&aces>0){total-=10;aces--;}
      return total;
    };
    const isBust=hand=>handVal(hand)>21;
    const isBlackjack=hand=>hand.length===2&&handVal(hand)===21;

    const cardHTML=(card,facedown=false)=>{
      if(facedown) return `<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#1a1260,#0a0830);border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">🂠</div>`;
      const col=SUIT_COLORS[card.s];
      return `<div style="width:58px;height:86px;border-radius:10px;background:linear-gradient(135deg,#fff,#f0f0f0);border:2px solid rgba(0,0,0,.1);display:flex;flex-direction:column;padding:5px;color:${col};font-family:'Orbitron',sans-serif;flex-shrink:0;animation:cs-deal .25s both;">
        <div style="font-size:.65rem;font-weight:900;line-height:1.1;">${card.r}${card.s}</div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">${card.s}</div>
        <div style="font-size:.65rem;font-weight:900;line-height:1.1;align-self:flex-end;transform:rotate(180deg);">${card.r}${card.s}</div>
      </div>`;
    };

    const handHTML=(hand,hideSecond=false)=>
      `<div style="display:flex;gap:6px;flex-wrap:wrap;">${hand.map((c,i)=>i===1&&hideSecond?cardHTML(c,true):cardHTML(c)).join('')}</div>`;

    mkDeck();

    const renderIdle=()=>{
      wrap.innerHTML=`
        <div style="display:flex;flex-direction:column;align-items:center;gap:22px;padding-top:20px;">
          <div style="font-size:4rem;">♠️</div>
          <div style="font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:900;color:var(--cyan);letter-spacing:.1em;">BLACKJACK</div>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.62rem;color:var(--dim);text-align:center;line-height:1.7;max-width:260px;">Get closer to 21 than the dealer.<br>Dealer stands on 17.<br>Blackjack pays 1.5×.</div>
          <div style="display:flex;align-items:center;gap:12px;">
            <button id="bj-bd" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">−</button>
            <div style="text-align:center;">
              <div style="font-family:'Share Tech Mono',monospace;font-size:.5rem;color:var(--dim);text-transform:uppercase;letter-spacing:.14em;">Bet</div>
              <div id="bj-bet" style="font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:900;color:#ffd700;">${bet}</div>
            </div>
            <button id="bj-bu" style="width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:var(--text);font-size:1.2rem;cursor:pointer;-webkit-tap-highlight-color:transparent;">+</button>
          </div>
          <button id="bj-deal" style="font-family:'Orbitron',sans-serif;font-size:.9rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:18px 52px;border-radius:50px;cursor:pointer;box-shadow:0 4px 24px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Deal</button>
          <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:rgba(255,255,255,.15);text-align:center;">Blackjack pays ×1.5 · Dealer stands on 17</div>
        </div>`;
      const setBet=v=>{bet=Math.max(5,Math.min(500,v));document.getElementById('bj-bet').textContent=bet;};
      document.getElementById('bj-bd').onclick=()=>{haptic('light');setBet(bet-5);};
      document.getElementById('bj-bu').onclick=()=>{haptic('light');setBet(bet+5);};
      document.getElementById('bj-deal').onclick=()=>{
        if(COINS<bet){return;}
        haptic('medium');
        updateWallet(-bet,document.getElementById('bj-deal'));
        playerHand=[drawCard(),drawCard()];
        dealerHand=[drawCard(),drawCard()];
        gameState='playing';
        renderPlaying();
      };
    };

    const renderPlaying=(revealDealer=false)=>{
      const pVal=handVal(playerHand);
      const dVal=handVal(dealerHand);
      const bust=isBust(playerHand);
      const bjack=isBlackjack(playerHand);
      wrap.innerHTML=`
        <div style="display:flex;flex-direction:column;gap:16px;padding-top:8px;">
          <!-- Dealer -->
          <div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:18px;padding:14px 16px;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">
              Dealer ${revealDealer?`— ${dVal}`:''}
            </div>
            ${handHTML(dealerHand,!revealDealer)}
          </div>
          <!-- Player -->
          <div style="background:rgba(0,255,204,.04);border:1px solid rgba(0,255,204,.12);border-radius:18px;padding:14px 16px;">
            <div style="font-family:'Share Tech Mono',monospace;font-size:.55rem;color:var(--dim);letter-spacing:.14em;text-transform:uppercase;margin-bottom:10px;">
              You — <span style="color:${pVal>21?'#ff6b6b':pVal===21?'#ffd700':'var(--cyan)'}">${pVal}</span>
            </div>
            ${handHTML(playerHand)}
          </div>
          <!-- Result -->
          <div id="bj-result" style="font-family:'Orbitron',sans-serif;font-size:.95rem;font-weight:900;letter-spacing:.1em;text-align:center;min-height:28px;"></div>
          <!-- Buttons -->
          <div id="bj-actions" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
            ${bust||bjack||revealDealer?
              `<button id="bj-again" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#050508;background:linear-gradient(135deg,#00ffcc,#00aa88);border:none;padding:16px 40px;border-radius:50px;cursor:pointer;box-shadow:0 4px 20px rgba(0,255,204,.4);-webkit-tap-highlight-color:transparent;">Play Again</button>`
            :
              `<button id="bj-hit" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#e53935,#8b0000);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(200,0,0,.4);-webkit-tap-highlight-color:transparent;">Hit</button>
               <button id="bj-stand" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#1565c0,#0d47a1);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(0,80,200,.4);-webkit-tap-highlight-color:transparent;">Stand</button>
               ${playerHand.length===2&&COINS>=bet?`<button id="bj-double" style="font-family:'Orbitron',sans-serif;font-size:.8rem;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(135deg,#6a0dad,#3a006d);border:none;padding:14px 28px;border-radius:20px;cursor:pointer;box-shadow:0 4px 16px rgba(100,0,200,.4);-webkit-tap-highlight-color:transparent;">Double</button>`:''}`
            }
          </div>
        </div>`;

      // Evaluate if bust or BJ
      const resultEl=document.getElementById('bj-result');
      if(bust){
        resultEl.style.color='#ff6b6b';resultEl.textContent='💥 Bust! Dealer wins.';
        haptic('heavy');
      } else if(bjack){
        const prize=Math.round(bet*1.5)+bet;
        updateWallet(prize,resultEl);
        resultEl.style.color='#ffd700';resultEl.textContent=`🃏 Blackjack! +${prize}`;
        haptic('success');
      } else if(revealDealer){
        resolveRound(resultEl);
      }

      // Wire buttons
      const hitBtn=document.getElementById('bj-hit');
      const standBtn=document.getElementById('bj-stand');
      const doubleBtn=document.getElementById('bj-double');
      const againBtn=document.getElementById('bj-again');

      if(hitBtn) hitBtn.onclick=()=>{
        haptic('medium'); playerHand.push(drawCard());
        if(isBust(playerHand)){renderPlaying(true);}else{renderPlaying(false);}
      };
      if(standBtn) standBtn.onclick=()=>{ haptic('medium'); dealerPlay(); };
      if(doubleBtn) doubleBtn.onclick=()=>{
        haptic('medium');
        updateWallet(-bet,doubleBtn);
        bet*=2;
        playerHand.push(drawCard());
        dealerPlay();
      };
      if(againBtn) againBtn.onclick=()=>{ gameState='idle'; bet=Math.min(bet,COINS>0?COINS:20); renderIdle(); };
    };

    const dealerPlay=()=>{
      // Dealer draws until ≥17
      while(handVal(dealerHand)<17){dealerHand.push(drawCard());}
      renderPlaying(true);
    };

    const resolveRound=(resultEl)=>{
      const pVal=handVal(playerHand);
      const dVal=handVal(dealerHand);
      if(isBust(dealerHand)||pVal>dVal){
        const prize=bet*2;
        updateWallet(prize,resultEl);
        resultEl.style.color='#00ffcc';resultEl.textContent=`🏆 You win! +${prize}`;
        haptic('success');
      } else if(pVal===dVal){
        updateWallet(bet,resultEl);
        resultEl.style.color='#ffd700';resultEl.textContent='🤝 Push — bet returned';
        haptic('light');
      } else {
        resultEl.style.color='#ff6b6b';resultEl.textContent=`💀 Dealer wins (${dVal} vs ${pVal})`;
        haptic('heavy');
      }
    };

    renderIdle();
  };

  /* ── Init ── */
  return () => {};
}
