// ------------------------------
// Math Galaxy - main script.js
// ------------------------------

// ----- Background (canvas) -----
const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');
function resizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let stars = [], planets = [], shootingStars = [];
function initBackground(){
  stars = Array.from({length:120}, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, r: Math.random()*1.5+0.4, alpha: Math.random() }));
  planets = Array.from({length:5}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    r: 28 + Math.random()*40,
    color: `hsl(${Math.random()*360},70%,50%)`,
    dx: (Math.random()-0.5)*0.25, dy: (Math.random()-0.5)*0.25,
    highlight: 0.25 + Math.random()*0.5
  }));
  shootingStars = Array.from({length:4}, () => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height/2, length: 60 + Math.random()*80, speed: 5 + Math.random()*4, active: Math.random() < 0.5 }));
}
function drawBackground(){
  ctx.fillStyle = '#0b0c20'; ctx.fillRect(0,0,canvas.width,canvas.height);

  // stars
  stars.forEach(s => {
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`; ctx.fill();
    s.alpha += (Math.random()-0.5)*0.05; if(s.alpha<0.1) s.alpha=0.1; if(s.alpha>1) s.alpha=1;
  });

  // planets (spherical)
  planets.forEach(p => {
    const grad = ctx.createRadialGradient(p.x - p.r*0.35, p.y - p.r*0.35, p.r*0.08, p.x, p.y, p.r);
    grad.addColorStop(0, `rgba(255,255,255,${p.highlight})`); grad.addColorStop(1, p.color);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fillStyle = grad; ctx.fill();
    // soft rim shadow for depth
    ctx.beginPath(); ctx.arc(p.x + p.r*0.12, p.y + p.r*0.12, p.r*0.9, 0, Math.PI*2); ctx.fillStyle='rgba(0,0,0,0.06)'; ctx.fill();

    p.x += p.dx; p.y += p.dy;
    if(p.x < -p.r) p.x = canvas.width + p.r;
    if(p.x > canvas.width + p.r) p.x = -p.r;
    if(p.y < -p.r) p.y = canvas.height + p.r;
    if(p.y > canvas.height + p.r) p.y = -p.r;
  });

  // shooting stars (gradient tails)
  shootingStars.forEach(s => {
    if(s.active){
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.length, s.y + s.length);
      grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.beginPath();
      ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.length, s.y + s.length); ctx.stroke();
      s.x += s.speed; s.y += s.speed;
      if(s.x > canvas.width || s.y > canvas.height){
        s.x = Math.random()*canvas.width/2; s.y = Math.random()*canvas.height/2; s.active = Math.random() < 0.5;
      }
    } else if(Math.random() < 0.01) s.active = true;
  });
}
function animate(){ drawBackground(); requestAnimationFrame(animate); }
initBackground(); animate();


// ----- screen navigation -----
// showScreen must be global for inline onclick usage
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const node = document.getElementById(id);
  if(node) node.classList.add('active');
  // ensure page stays static (no scroll)
  window.scrollTo(0,0);
}
window.showScreen = showScreen; // expose to onclick


// ----- game & state -----
const categories = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
let currentCategory = '';
let mode = ''; // 'normal' or 'highscore'
let score = 0, streak = 0, answered = 0;
let timer = 60, timerInterval = null;
let tokens = parseInt(localStorage.getItem('tokens') || '0');
let collection = JSON.parse(localStorage.getItem('collection') || '[]');
let highScores = JSON.parse(localStorage.getItem('highScores') || '{}');

const answerInput = document.getElementById('answerInput');
const feedback = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const highScoreEl = document.getElementById('highScore');
const timerBox = document.getElementById('timerBox');
const timerEl = document.getElementById('timer');

function chooseCategory(cat){
  currentCategory = cat;
  document.getElementById('modeTitle').innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
  showScreen('modeMenu');
}
window.chooseCategory = chooseCategory;

function startGame(selectedMode){
  mode = selectedMode;
  score = 0; streak = 0; answered = 0;
  scoreEl.innerText = score; streakEl.innerText = streak;
  // show category highscore
  highScoreEl.innerText = highScores[currentCategory] || 0;

  document.getElementById('gameTitle').innerText = `${currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} - ${mode}`;
  showScreen('game');

  // timer only for highscore
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  if(mode === 'highscore'){
    timer = 60; timerEl.innerText = timer; timerBox.classList.add('timer-visible'); timerBox.classList.remove('timer-hidden');
    timerInterval = setInterval(()=>{
      timer--; timerEl.innerText = timer;
      if(timer <= 0){ endGame(); }
    }, 1000);
  } else {
    // normal mode: hide timer and ensure any running timer is stopped
    timerBox.classList.remove('timer-visible'); timerBox.classList.add('timer-hidden');
    if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  }

  generateQuestion();
}
window.startGame = startGame;

function generateQuestion(){
  let a = Math.floor(Math.random()*12)+1;
  let b = Math.floor(Math.random()*12)+1;
  let q = '', ans = 0;
  switch(currentCategory){
    case 'addition': q = `${a} + ${b}`; ans = a + b; break;
    case 'subtraction': q = `${a} - ${b}`; ans = a - b; break;
    case 'multiplication': q = `${a} × ${b}`; ans = a * b; break;
    case 'division': a = a * b; q = `${a} ÷ ${b}`; ans = a / b; break;
  }
  document.getElementById('question').innerText = q;
  answerInput.value = '';
  answerInput.dataset.answer = ans;
  feedback.innerText = '';
}

function handleCorrect(){
  score++; streak++; answered++;
  scoreEl.innerText = score; streakEl.innerText = streak;
  feedback.innerText = '✅ Correct!'; feedback.style.color = 'lightgreen';
  if(answered % 15 === 0){ tokens += 5; saveProgress(); }
  // update high score if in highscore mode
  if(mode === 'highscore'){
    const currentHigh = highScores[currentCategory] || 0;
    if(score > currentHigh){
      highScores[currentCategory] = score;
      localStorage.setItem('highScores', JSON.stringify(highScores));
      highScoreEl.innerText = score;
    }
  }
  setTimeout(generateQuestion, 400);
}

function handleWrong(){
  streak = 0; streakEl.innerText = streak;
  feedback.innerText = '❌ Wrong!'; feedback.style.color = 'salmon';
  answerInput.classList.add('shake');
  setTimeout(()=>{ answerInput.classList.remove('shake'); answerInput.value = ''; }, 350);
}

function checkAnswerValue(userVal){
  const correct = parseInt(answerInput.dataset.answer);
  if(isNaN(userVal)) { handleWrong(); return; }
  if(userVal === correct) handleCorrect();
  else handleWrong();
}
window.checkAnswerValue = checkAnswerValue;


function exitGame(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  showScreen('menu');
}
window.exitGame = exitGame;

function endGame(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval = null; }
  alert(`Time's up! Score: ${score}`);
  showScreen('menu');
}


// ----- keypad (pointer events to avoid double taps) -----
function buildKeypad(){
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","✔"];
  const container = document.getElementById('keypad');
  container.innerHTML = '';
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.innerText = k;
    // pointerdown prevents double-touch ghost clicks and is responsive
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      if(k === '←'){ answerInput.value = answerInput.value.slice(0,-1); return; }
      if(k === '✔'){ checkAnswerValue(parseInt(answerInput.value)); return; }
      answerInput.value += k;
    }, { passive: false });
    container.appendChild(btn);
  });
}
buildKeypad();

// keyboard support (desktop)
document.addEventListener('keydown', (e) => {
  // only if game screen active
  if(!document.getElementById('game').classList.contains('active')) return;
  if(e.key >= '0' && e.key <= '9'){ answerInput.value += e.key; e.preventDefault(); }
  else if(e.key === 'Backspace'){ answerInput.value = answerInput.value.slice(0,-1); e.preventDefault(); }
  else if(e.key === 'Enter'){ checkAnswerValue(parseInt(answerInput.value)); e.preventDefault(); }
});


// ----- collection / tokens / packs -----
const animals = ["Lion","Tiger","Elephant","Giraffe","Monkey","Panda","Kangaroo","Penguin","Zebra","Hippo","Rhino","Crocodile","Owl","Eagle","Shark","Dolphin","Whale","Bear","Wolf","Fox"];
const animalCards = {
  "Lion":{img:"🦁", color:"linear-gradient(135deg,#f9d423,#ff4e50)"},
  "Tiger":{img:"🐯", color:"linear-gradient(135deg,#ff6a00,#ee0979)"},
  "Elephant":{img:"🐘", color:"linear-gradient(135deg,#a8c0ff,#3f2b96)"},
  "Giraffe":{img:"🦒", color:"linear-gradient(135deg,#f7971e,#ffd200)"},
  "Monkey":{img:"🐵", color:"linear-gradient(135deg,#654321,#d9a760)"},
  "Panda":{img:"🐼", color:"linear-gradient(135deg,#000,#fff)"},
  "Kangaroo":{img:"🦘", color:"linear-gradient(135deg,#e96443,#904e95)"},
  "Penguin":{img:"🐧", color:"linear-gradient(135deg,#83a4d4,#b6fbff)"},
  "Zebra":{img:"🦓", color:"linear-gradient(135deg,#000,#fff)"},
  "Hippo":{img:"🦛", color:"linear-gradient(135deg,#a1c4fd,#c2e9fb)"},
  "Rhino":{img:"🦏", color:"linear-gradient(135deg,#757f9a,#d7dde8)"},
  "Crocodile":{img:"🐊", color:"linear-gradient(135deg,#11998e,#38ef7d)"},
  "Owl":{img:"🦉", color:"linear-gradient(135deg,#373b44,#4286f4)"},
  "Eagle":{img:"🦅", color:"linear-gradient(135deg,#ff512f,#dd2476)"},
  "Shark":{img:"🦈", color:"linear-gradient(135deg,#2c3e50,#3498db)"},
  "Dolphin":{img:"🐬", color:"linear-gradient(135deg,#56ccf2,#2f80ed)"},
  "Whale":{img:"🐋", color:"linear-gradient(135deg,#83a4d4,#b6fbff)"},
  "Bear":{img:"🐻", color:"linear-gradient(135deg,#5d4157,#a8caba)"},
  "Wolf":{img:"🐺", color:"linear-gradient(135deg,#232526,#414345)"},
  "Fox":{img:"🦊", color:"linear-gradient(135deg,#f12711,#f5af19)"}
};

function saveProgress(){
  localStorage.setItem('collection', JSON.stringify(collection));
  localStorage.setItem('tokens', String(tokens));
  document.getElementById('tokenCount').innerText = tokens;
}

function renderCollection(){
  const grid = document.getElementById('animalGrid');
  grid.innerHTML = '';
  animals.forEach(a => {
    const div = document.createElement('div');
    div.className = 'animal-card';
    if(!collection.includes(a)){
      div.innerText = '❓';
    } else {
      div.style.background = animalCards[a].color;
      div.innerHTML = `<div style="font-size:1.8rem">${animalCards[a].img}</div><div>${a}</div>`;
    }
    grid.appendChild(div);
  });
  document.getElementById('tokenCount').innerText = tokens;
}

function buyPack(){
  if(tokens < 15){ alert('Not enough tokens'); return; }
  tokens -= 15;
  const newCards = [];
  // pick 3 random distinct unseen cards (or allow duplicates if all collected)
  for(let i=0;i<3;i++){
    const available = animals.filter(a => !collection.includes(a));
    if(available.length === 0) break;
    const pick = available[Math.floor(Math.random()*available.length)];
    collection.push(pick);
    newCards.push(pick);
  }
  saveProgress(); renderCollection(); showPackReveal(newCards);
}
window.buyPack = buyPack;

function showPackReveal(cards){
  const grid = document.getElementById('revealGrid');
  grid.innerHTML = '';
  cards.forEach((c,i) => {
    const card = document.createElement('div'); card.className = 'reveal-card';
    const inner = document.createElement('div'); inner.className = 'reveal-inner';
    const front = document.createElement('div'); front.className = 'reveal-front'; front.innerText = '❓';
    const back = document.createElement('div'); back.className = 'reveal-back'; back.style.background = animalCards[c].color; back.innerHTML = `<div style="font-size:1.6rem">${animalCards[c].img}</div><div>${c}</div>`;
    inner.appendChild(front); inner.appendChild(back); card.appendChild(inner); grid.appendChild(card);
    setTimeout(()=> card.classList.add('flip'), i * 700);
  });
  showScreen('packReveal');
}
window.showPackReveal = showPackReveal;

function finishReveal(){ showScreen('collection'); }
window.finishReveal = finishReveal;


// ----- accessibility toggles -----
document.getElementById('darkMode').addEventListener('change', e => document.body.classList.toggle('dark-mode', e.target.checked));
document.getElementById('contrastMode').addEventListener('change', e => document.body.classList.toggle('high-contrast', e.target.checked));
document.getElementById('largeFont').addEventListener('change', e => document.body.classList.toggle('large-font', e.target.checked));
document.getElementById('lexieFont').addEventListener('change', e => document.body.classList.toggle('lexie-font', e.target.checked));
document.getElementById('reduceMotion').addEventListener('change', e => document.body.classList.toggle('reduce-motion', e.target.checked));


// ----- startup -----
document.addEventListener('DOMContentLoaded', () => {
  // ensure initial state
  renderCollection();
  saveProgress();
  // Ensure only menu visible initially
  showScreen('menu');
  // update token count and highscore fields
  document.getElementById('tokenCount').innerText = tokens;
  // set the highscore label if a category is selected later
});
