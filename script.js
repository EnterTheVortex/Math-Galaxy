let currentCategory = '';
let currentMode = '';
let score = 0, streak = 0, highScore = 0;
let timeLeft = 60, timerInterval;
let num1, num2, correctAnswer;

const menu = document.getElementById('menu');
const modeSelect = document.getElementById('modeSelect');
const game = document.getElementById('game');
const modeTitle = document.getElementById('modeTitle');
const categoryTitle = document.getElementById('categoryTitle');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer');
const feedback = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const streakEl = document.getElementById('streak');
const timerEl = document.getElementById('timer');
const timerContainer = document.getElementById('timerContainer');
const highScoreEl = document.getElementById('highScore');
const keypad = document.getElementById('keypad');

// ---- Menu Handling ----
function openCategory(cat){
  currentCategory = cat;
  menu.classList.add('hidden');
  modeSelect.classList.remove('hidden');
  modeTitle.innerText = `Choose Mode: ${cat}`;
}

function startGame(cat, mode){
  currentMode = mode;
  score = 0; streak = 0;
  scoreEl.innerText = score;
  streakEl.innerText = streak;
  feedback.innerText = '';
  answerInput.value = '';

  modeSelect.classList.add('hidden');
  game.classList.remove('hidden');
  categoryTitle.innerText = `${cat.toUpperCase()} - ${mode.toUpperCase()} MODE`;

  // Load high score
  let key = `mathGalaxyHighScore_${cat}_${mode}`;
  highScore = localStorage.getItem(key) || 0;
  highScoreEl.innerText = highScore;

  if(mode === 'highscore'){
    timeLeft = 60;
    timerContainer.classList.remove('hidden');
    timerEl.innerText = timeLeft;
    timerInterval = setInterval(()=>{
      timeLeft--;
      timerEl.innerText = timeLeft;
      if(timeLeft <= 0){
        clearInterval(timerInterval);
        endGame();
      }
    },1000);
  } else {
    timerContainer.classList.add('hidden');
  }

  keypad.classList.remove('hidden');
  generateQuestion();
}

function goHome(){
  modeSelect.classList.add('hidden');
  game.classList.add('hidden');
  menu.classList.remove('hidden');
}

function endGame(){
  clearInterval(timerInterval);
  game.classList.add('hidden');
  menu.classList.remove('hidden');
}

// ---- Question Generation ----
function generateQuestion(){
  num1 = Math.floor(Math.random()*12)+1;
  num2 = Math.floor(Math.random()*12)+1;

  switch(currentCategory){
    case 'addition': correctAnswer = num1+num2; questionEl.innerText=`${num1} + ${num2} = ?`; break;
    case 'subtraction': correctAnswer = num1-num2; questionEl.innerText=`${num1} - ${num2} = ?`; break;
    case 'multiplication': correctAnswer = num1*num2; questionEl.innerText=`${num1} × ${num2} = ?`; break;
    case 'division': num1 = num1*num2; correctAnswer = num1/num2; questionEl.innerText=`${num1} ÷ ${num2} = ?`; break;
  }
}

// ---- Answer Handling ----
function checkAnswer(){
  let userAns = parseInt(answerInput.value);
  if(userAns === correctAnswer){
    score++; streak++;
    feedback.innerText = '✅ Correct!';
    feedback.style.color = '#00FF00';
    scoreEl.innerText = score;
    streakEl.innerText = streak;

    // Update high score
    let key = `mathGalaxyHighScore_${currentCategory}_${currentMode}`;
    if(score > highScore){
      highScore = score;
      localStorage.setItem(key,highScore);
      highScoreEl.innerText = highScore;
    }

    setTimeout(generateQuestion,500);
    answerInput.value='';
  } else {
    streak=0;
    streakEl.innerText = streak;
    feedback.innerText = '❌ Wrong!';
    feedback.style.color = '#FF4444';
    answerInput.classList.add('shake');
    setTimeout(()=>{
      answerInput.classList.remove('shake');
      answerInput.value='';
    },500);
  }
}

// ---- Keypad Input ----
document.querySelectorAll('.key').forEach(btn=>{
  btn.addEventListener('click',()=>{
    let val = btn.innerText;
    if(val === '⌫'){
      answerInput.value = answerInput.value.slice(0,-1);
    } else if(val === '⏎'){
      checkAnswer();
    } else {
      answerInput.value += val;
    }
  });
});

// ---- Keyboard Support (Desktop) ----
document.addEventListener('keydown', (e)=>{
  if(game.classList.contains('hidden')) return;
  if(e.key >= '0' && e.key <= '9'){
    answerInput.value += e.key;
  } else if(e.key === 'Backspace'){
    answerInput.value = answerInput.value.slice(0,-1);
  } else if(e.key === 'Enter'){
    checkAnswer();
  }
});

// ---- Space Background Generator ----
const spaceBg = document.getElementById('space-bg');
let planets = [];

// Stars
for(let i=0; i<120; i++){
  let star = document.createElement('div');
  star.classList.add('star');
  star.style.top = Math.random()*100+'vh';
  star.style.left = Math.random()*100+'vw';
  star.style.animationDuration = (1+Math.random()*3)+'s';
  spaceBg.appendChild(star);
}

// Planets
const planetTypes = ["rocky","gas","icy","ringed"];
for(let i=0; i<5; i++){
  let planet = document.createElement('div');
  planet.classList.add('planet', planetTypes[i%planetTypes.length]);
  let size = 80+Math.random()*120;
  planet.style.width = size+'px';
  planet.style.height = size+'px';
  let x = Math.random()*100;
  let y = Math.random()*100;
  planet.style.left = x+'vw';
  planet.style.top = y+'vh';
  spaceBg.appendChild(planet);

  planets.push({el:planet, x:x, y:y, dx:(Math.random()-0.5)*0.02, dy:(Math.random()-0.5)*0.02});
}

// Move planets
function animatePlanets(){
  planets.forEach(p=>{
    p.x += p.dx;
    p.y += p.dy;
    if(p.x > 110) p.x = -10;
    if(p.x < -10) p.x = 110;
    if(p.y > 110) p.y = -10;
    if(p.y < -10) p.y = 110;
    p.el.style.left = p.x+'vw';
    p.el.style.top = p.y+'vh';
  });
  requestAnimationFrame(animatePlanets);
}
animatePlanets();

// Shooting Stars
setInterval(()=>{
  let shootingStar = document.createElement('div');
  shootingStar.classList.add('shooting-star');
  shootingStar.style.top = Math.random()*50+'vh';
  shootingStar.style.left = Math.random()*100+'vw';
  spaceBg.appendChild(shootingStar);
  setTimeout(()=>shootingStar.remove(),3000);
},4000);
