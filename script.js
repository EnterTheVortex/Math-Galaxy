const menu = document.getElementById('menu');
const modeSelect = document.getElementById('modeSelect');
const gameScreen = document.getElementById('game');
const answerInput = document.getElementById('answerInput');
const keypad = document.getElementById('keypad');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const highScoreDisplay = document.getElementById('highScore');
const timerElement = document.getElementById('timer');
const timeLeftDisplay = document.getElementById('timeLeft');

let currentCategory = '';
let currentMode = 'normal';
let score = 0;
let streak = 0;
let currentAnswer = 0;
let timer = null;
let timeLeft = 60;

// ---------- Show Mode Select ----------
function showModeSelect(category){
  currentCategory = category;
  menu.classList.add('hidden');
  modeSelect.classList.remove('hidden');
  document.getElementById('modeCategoryTitle').innerText =
    category.charAt(0).toUpperCase() + category.slice(1);
}

// ---------- Start Game ----------
function startGame(category, mode){
  currentCategory = category;
  currentMode = mode;
  score = 0;
  streak = 0;

  modeSelect.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  keypad.style.display = 'inline-block';

  document.getElementById('categoryTitle').innerText =
    category.charAt(0).toUpperCase() + category.slice(1) +
    (mode === 'highscore' ? " (High Score Mode)" : "");

  scoreDisplay.innerText = score;
  streakDisplay.innerText = streak;

  // Load high score for this category+mode
  let key = `mathGalaxyHighScore_${category}_${mode}`;
  let saved = localStorage.getItem(key) || 0;
  highScoreDisplay.innerText = saved;

  // Timer for high score mode
  if(mode === 'highscore'){
    timeLeft = 60;
    timeLeftDisplay.innerText = timeLeft;
    timerElement.classList.remove('hidden');
    timer = setInterval(()=>{
      timeLeft--;
      timeLeftDisplay.innerText = timeLeft;
      if(timeLeft <= 0){
        clearInterval(timer);
        endHighScoreGame();
      }
    },1000);
  } else {
    timerElement.classList.add('hidden');
  }

  generateQuestion();
}

// ---------- End High Score Mode ----------
function endHighScoreGame(){
  feedback.innerText = "⏳ Time’s up! Final Score: " + score;
  feedback.style.color = "#FFD700";
  // save if new high score
  let key = `mathGalaxyHighScore_${currentCategory}_${currentMode}`;
  let saved = localStorage.getItem(key) || 0;
  if(score > saved){
    localStorage.setItem(key, score);
    highScoreDisplay.innerText = score;
    feedback.innerText += " 🏆 New High Score!";
  }
}

// ---------- Back to Menu ----------
function backToMenu(){
  if(timer) clearInterval(timer);
  gameScreen.classList.add('hidden');
  modeSelect.classList.add('hidden');
  menu.classList.remove('hidden');
  keypad.style.display = 'none';
}

// ---------- Generate Questions ----------
function generateQuestion(){
  let a = Math.floor(Math.random()*10)+1;
  let b = Math.floor(Math.random()*10)+1;
  let questionText = '';

  switch(currentCategory){
    case 'addition':
      currentAnswer = a+b; questionText = `${a} + ${b} = ?`; break;
    case 'subtraction':
      if(b>a)[a,b]=[b,a];
      currentAnswer = a-b; questionText = `${a} - ${b} = ?`; break;
    case 'multiplication':
      currentAnswer = a*b; questionText = `${a} × ${b} = ?`; break;
    case 'division':
      currentAnswer = a;
      let product = a*b;
      questionText = `${product} ÷ ${b} = ?`;
      break;
  }

  document.getElementById('question').innerText = questionText;
  answerInput.value = '';
  feedback.innerText = '';
}

// ---------- Check Answer ----------
function checkAnswer(){
  if(Number(answerInput.value) === currentAnswer){
    score += 10+streak*2;
    streak++;
    feedback.innerText = '✅ Correct!';
    feedback.style.color = '#00FF00';
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;

    // save high score if better (normal mode too)
    let key = `mathGalaxyHighScore_${currentCategory}_${currentMode}`;
    let saved = localStorage.getItem(key) || 0;
    if(score > saved){
      localStorage.setItem(key, score);
      highScoreDisplay.innerText = score;
    }

    if(currentMode === 'normal') setTimeout(generateQuestion,500);
    else if(currentMode === 'highscore') generateQuestion();
  } else {
    streak = 0;
    streakDisplay.innerText = streak;
    feedback.innerText = '❌ Wrong!';
    feedback.style.color = '#FF4444';

    answerInput.classList.add('shake');
    setTimeout(()=>{
      answerInput.classList.remove('shake');
      answerInput.value = '';
    },500);
  }
}

// ---------- Keypad Input ----------
document.querySelectorAll('.key').forEach(key => {
  key.addEventListener('click', () => {
    if (key.id === 'backspace') {
      answerInput.value = answerInput.value.slice(0, -1);
    } else if (key.id === 'enter') {
      checkAnswer();
    } else {
      answerInput.value += key.innerText;
    }
  });
});

// ---------- Keyboard Input ----------
document.addEventListener('keydown', e => {
  if(gameScreen.classList.contains('hidden')) return; // ignore on menu
  if(e.key >= '0' && e.key <= '9') answerInput.value += e.key;
  else if(e.key === 'Backspace') answerInput.value = answerInput.value.slice(0,-1);
  else if(e.key === 'Enter') checkAnswer();
});

// ---------- Space Background ----------
const spaceBg = document.getElementById('space-bg');

// Stars
for(let i=0; i<120; i++){
  let star = document.createElement('div');
  star.classList.add('star');
  let size = Math.random()*2+1;
  star.style.width = size+'px';
  star.style.height = size+'px';
  star.style.top = Math.random()*100 + 'vh';
  star.style.left = Math.random()*100 + 'vw';
  star.style.animationDuration = (1 + Math.random()*2) + 's';
  spaceBg.appendChild(star);
}

// Planets drifting
const planetColors = [
  'radial-gradient(circle at 30% 30%, #ff9999, #660000)',
  'radial-gradient(circle at 30% 30%, #99ccff, #003366)',
  'radial-gradient(circle at 30% 30%, #ffff99, #666600)',
  'radial-gradient(circle at 30% 30%, #cc99ff, #330066)'
];

let planets = [];
for(let i=0; i<4; i++){
  let planet = document.createElement('div');
  planet.classList.add('planet');
  let size = 60 + Math.random()*100;
  planet.style.width = size+'px';
  planet.style.height = size+'px';
  planet.style.top = Math.random()*100 + 'vh';
  planet.style.left = Math.random()*100 + 'vw';
  planet.style.background = planetColors[i % planetColors.length];
  spaceBg.appendChild(planet);
  planets.push({el: planet, x: parseFloat(planet.style.left), y: parseFloat(planet.style.top), 
                dx: (Math.random()-0.5)*0.05, dy: (Math.random()-0.5)*0.05});
}

function movePlanets(){
  planets.forEach(p=>{
    p.x += p.dx;
    p.y += p.dy;
    if(p.x>100) p.x=-10;
    if(p.x<-20) p.x=110;
    if(p.y>100) p.y=-10;
    if(p.y<-20) p.y=110;
    p.el.style.left = p.x+'vw';
    p.el.style.top = p.y+'vh';
  });
  requestAnimationFrame(movePlanets);
}
movePlanets();

// Shooting stars
setInterval(()=>{
  let shootingStar = document.createElement('div');
  shootingStar.classList.add('shooting-star');
  shootingStar.style.top = Math.random()*50 + 'vh';
  shootingStar.style.left = Math.random()*100 + 'vw';
  spaceBg.appendChild(shootingStar);
  setTimeout(()=> shootingStar.remove(), 3000);
}, 5000);
