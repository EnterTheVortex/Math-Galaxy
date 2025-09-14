/* ---------- Basic & Screen system ---------- */
:root{
  --accent1: #ffd54f;
  --accent2: #ff9800;
  --bg: #0b0c20;
}
* { box-sizing: border-box; }
html,body { height:100%; }
body {
  margin:0; padding:0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: #fff;
  overflow: hidden; /* app is static, no page scroll */
}

/* screen show/hide */
.screen { display:none; padding:12px; text-align:center; }
.screen.active { display:block; }

/* header */
.glow {
  font-size: 3.2rem;
  margin: 18px 0;
  color: var(--accent1);
  text-shadow: 0 0 8px var(--accent1), 0 0 18px #ffd27a;
}

/* titles */
.screen-title {
  font-size: 2.1rem;
  color: var(--accent1);
  text-shadow: 0 0 6px var(--accent1);
  margin-bottom: 16px;
}

/* menu buttons */
.menu-buttons { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; margin-bottom:12px; }
.menu-buttons button, .backBtn, button {
  background: linear-gradient(45deg,#ffb74d,#ff9800);
  color:#fff;
  border: none;
  border-radius:28px;
  padding:12px 22px;
  font-size:1.1rem;
  box-shadow: 0 6px rgba(0,0,0,0.25);
  cursor:pointer;
  transition: transform .12s ease, box-shadow .12s ease;
}
.menu-buttons button:active, .backBtn:active { transform: translateY(2px); box-shadow: 0 3px rgba(0,0,0,0.25); }

/* game area */
.question-display { font-size: 2.8rem; font-weight:700; color:#00ffd1; text-shadow:0 0 8px #00ffd1; margin:18px 0; }
#scoreBoard { font-size:1.25rem; margin-bottom:8px; }
#timerBox.timer-visible { display:block; font-size:1.15rem; margin-bottom:8px; }
#timerBox { display:none; }

/* answer box */
.answer-box {
  font-size:2rem;
  width:220px;
  text-align:center;
  border-radius:10px;
  border: none;
  padding:8px;
  margin-bottom:8px;
  background: rgba(255,255,255,0.06);
  color: #fff;
  outline: none;
}
.answer-box.shake { animation: shake .35s; }
@keyframes shake { 20%{ transform:translateX(-6px);} 40%{ transform:translateX(6px);} 60%{transform:translateX(-4px);} 80%{transform:translateX(4px);} 100%{transform:translateX(0);} }

/* keypad */
.keypad { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; margin-top:12px; }
.keypad button {
  width:72px; height:72px;
  font-size:1.5rem;
  border-radius:12px;
  border:none;
  background: linear-gradient(135deg,#6a11cb,#2575fc);
  color:#fff;
  box-shadow: 0 6px rgba(0,0,0,0.25);
  cursor:pointer;
  touch-action: manipulation; /* prevent double-tap issues */
}
.keypad button:active { transform: translateY(2px); box-shadow: 0 3px rgba(0,0,0,0.25); }

/* collection grid */
.animal-grid { display:grid; gap:8px; grid-template-columns: repeat(auto-fill, minmax(80px,1fr)); margin-top:12px; }
.animal-card {
  background:#222; color:#fff; border-radius:10px; height:110px;
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  font-size:1rem; padding:8px;
}

/* reveal */
.reveal-inner{ width:100%; height:100%; transition: transform .9s; transform-style:preserve-3d; }
.reveal-card.flip .reveal-inner { transform: rotateY(180deg); }
.reveal-front, .reveal-back { position:absolute; width:100%; height:100%; backface-visibility:hidden; border-radius:10px; display:flex; align-items:center; justify-content:center; }

/* settings */
.settings-group { display:flex; gap:12px; flex-wrap:wrap; justify-content:center; margin:12px 0; }

/* accessibility classes */
body.dark-mode { background: #08101b; color:#fff; }
body.high-contrast { background:#000; color:#FFD700; }
body.large-font { font-size:1.25rem; }
body.lexie-font { font-family: 'Lexie Readable', Arial, sans-serif; }
body.reduce-motion * { animation:none !important; transition:none !important; }

/* canvas / bg */
canvas#spaceCanvas { position:fixed; top:0; left:0; width:100%; height:100%; z-index:-1; }

/* responsive */
@media (max-width: 600px) {
  .glow { font-size:2.1rem; }
  .screen-title { font-size:1.6rem; }
  .question-display { font-size:1.8rem; }
  .keypad button { width:56px; height:56px; font-size:1.2rem; }
  .answer-box { width:160px; font-size:1.4rem; }
  .menu-buttons button { padding:10px 14px; font-size:1rem; border-radius:22px; }
}
