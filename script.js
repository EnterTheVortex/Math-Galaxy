let currentCategory = null;
let score = 0, streak = 0, highScore = 0, timeLeft = 60;
let timerInterval;
const categories = {
  addition: "+",
  subtraction: "-",
  multiplication: "×",
  division: "÷"
};

const menu = document.getElementById("menu");
const modeMenu = document.getElementById("modeMenu");
const game = document.getElementById("game");

const questionEl = document.getElementById("question");
const answerInput = document.getElementById("answer");
const feedback = document.getElementById("feedback");
const scoreEl = document.getElementById("score");
const streakEl = document.getElementById("streak");
const highScoreEl = document.getElementById("highScore");
const highScoreContainer = document.getElementById("highScoreContainer");
const timerContainer = document.getElementById("timerContainer");
const timerEl = document.getElementById("timer");
const keypad = document.getElementById("keypad");

function isMobile() { return window.innerWidth <= 600; }

function openModeMenu(cat){
  currentCategory = cat;
  menu.classList.add("hidden");
  modeMenu.classList.remove("hidden");
  document.getElementById("modeTitle").innerText =
    `${cat.charAt(0).toUpperCase() + cat.slice(1)} Mode`;
}

function goBackToMenu(){
  modeMenu.classList.add("hidden");
  game.classList.add("hidden");
  menu.classList.remove("hidden");
  clearInterval(timerInterval);
  document.body.classList.remove("mobile-game");
}

function startGame(cat, mode){
  modeMenu.classList.add("hidden");
  game.classList.remove("hidden");
  document.getElementById("categoryTitle").innerText =
    cat.charAt(0).toUpperCase() + cat.slice(1);

  score = 0; streak = 0;
  scoreEl.innerText = score;
  streakEl.innerText = streak;

  if(mode === "highscore"){
    timeLeft = 60;
    timerContainer.classList.remove("hidden");
    highScoreContainer.classList.remove("hidden");
    let key = `mathGalaxyHighScore_${cat}`;
    highScore = localStorage.getItem(key) || 0;
    highScoreEl.innerText = highScore;

    timerInterval = setInterval(()=>{
      timeLeft--;
      timerEl.innerText = timeLeft;
      if(timeLeft <= 0){
        clearInterval(timerInterval);
        endGame();
      }
    },1000);
  } else {
    timerContainer.classList.add("hidden");
    highScoreContainer.classList.add("hidden");
  }

  if(isMobile()) document.body.classList.add("mobile-game");
  else document.body.classList.remove("mobile-game");

  generateQuestion();
  setupKeypad();
}

function endGame(){
  game.classList.add("hidden");
  menu.classList.remove("hidden");
  clearInterval(timerInterval);
  document.body.classList.remove("mobile-game");
}

function generateQuestion(){
  let a = Math.floor(Math.random()*12)+1;
  let b = Math.floor(Math.random()*12)+1;
  let symbol = categories[currentCategory];
  let q, ans;

  switch(symbol){
    case "+": ans = a+b; q = `${a} + ${b}`; break;
    case "-": ans = a-b; q = `${a} - ${b}`; break;
    case "×": ans = a*b; q = `${a} × ${b}`; break;
    case "÷": ans = a; q = `${a*b} ÷ ${b}`; break;
  }

  questionEl.innerText = q;
  questionEl.dataset.answer = ans;
  answerInput.value = "";
  answerInput.focus();
}

function checkAnswer(){
  let userAns = parseInt(answerInput.value);
  let correctAns = parseInt(questionEl.dataset.answer);
  if(userAns === correctAns){
    feedback.innerText = "✅ Correct!";
    feedback.style.color = "#00FF00";
    score++;
    streak++;
    scoreEl.innerText = score;
    streakEl.innerText = streak;

    if(highScoreContainer && !highScoreContainer.classList.contains("hidden")){
      let key = `mathGalaxyHighScore_${currentCategory}`;
      if(score > highScore){
        highScore = score;
        localStorage.setItem(key, highScore);
        highScoreEl.innerText = highScore;
      }
    }

    setTimeout(generateQuestion,500);
  } else {
    streak = 0;
    streakEl.innerText = streak;
    feedback.innerText = "❌ Wrong!";
    feedback.style.color = "#FF4444";

    answerInput.classList.add("shake");
    setTimeout(()=>{
      answerInput.classList.remove("shake");
      answerInput.value = "";
    },500);
  }
}

function setupKeypad(){
  keypad.innerHTML = "";
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","✔"];
  keys.forEach(k=>{
    let keyEl = document.createElement("div");
    keyEl.classList.add("key");
    keyEl.innerText = k;
    keyEl.addEventListener("click", ()=>{
      if(k==="←"){ answerInput.value = answerInput.value.slice(0,-1); }
      else if(k==="✔"){ checkAnswer(); }
      else { answerInput.value += k; }
    });
    keypad.appendChild(keyEl);
  });
  keypad.classList.remove("hidden");
}

answerInput.addEventListener("keydown", e=>{
  if(e.key === "Enter") checkAnswer();
});

// Background planets, stars, shooting stars
const spaceBg = document.getElementById("space-bg");
const planets = [];
const planetTypes = ["rocky","gas","icy","ringed"];
for(let i=0; i<100; i++){
  let star = document.createElement("div");
  star.classList.add("star");
  star.style.top = Math.random()*100 + "vh";
  star.style.left = Math.random()*100 + "vw";
  spaceBg.appendChild(star);
}
for(let i=0; i<5; i++){
  let planet = document.createElement("div");
  planet.classList.add("planet");
  planet.classList.add(planetTypes[i % planetTypes.length]);
  let size = 60 + Math.random()*100;
  planet.style.width = size+"px";
  planet.style.height = size+"px";
  planet.style.top = Math.random()*100+"vh";
  planet.style.left = Math.random()*100+"vw";
  spaceBg.appendChild(planet);
  planets.push({el: planet, x: parseFloat(planet.style.left), y: parseFloat(planet.style.top), dx: (Math.random()-0.5)*0.2, dy: (Math.random()-0.5)*0.2});
}
for(let i=0;i<3;i++){
  let s = document.createElement("div");
  s.classList.add("shooting-star");
  s.style.top = Math.random()*50+"vh";
  s.style.left = (50+Math.random()*50)+"vw";
  s.style.animationDelay = (i*5)+"s";
  spaceBg.appendChild(s);
}
function animatePlanets(){
  planets.forEach(p=>{
    p.x += p.dx; p.y += p.dy;
    if(p.x > window.innerWidth) p.x = -100;
    if(p.y > window.innerHeight) p.y = -100;
    if(p.x < -150) p.x = window.innerWidth;
    if(p.y < -150) p.y = window.innerHeight;
    p.el.style.left = p.x+"px"; p.el.style.top = p.y+"px";
  });
  requestAnimationFrame(animatePlanets);
}
animatePlanets();
