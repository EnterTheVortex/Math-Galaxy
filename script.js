let currentCategory = null;
let score = 0, streak = 0, highScore = 0, timeLeft = 60;
let timerInterval;
const categories = {
  addition: "+",
  subtraction: "-",
  multiplication: "×",
  division: "÷"
};

// Elements
const startMenu = document.getElementById("startMenu");
const gameModes = document.getElementById("gameModes");
const modeMenu = document.getElementById("modeMenu");
const settings = document.getElementById("settings");
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

// Navigation
function openGameModes(){ hideAllPages(); gameModes.classList.remove("hidden"); }
function backToStartMenu(){ hideAllPages(); startMenu.classList.remove("hidden"); }
function openSettings(){ hideAllPages(); settings.classList.remove("hidden"); }
function backToGameModes(){ hideAllPages(); gameModes.classList.remove("hidden"); }

function hideAllPages(){
  startMenu.classList.add("hidden");
  gameModes.classList.add("hidden");
  modeMenu.classList.add("hidden");
  settings.classList.add("hidden");
  game.classList.add("hidden");
}

function openModeMenu(cat){
  currentCategory = cat;
  hideAllPages();
  modeMenu.classList.remove("hidden");
  document.getElementById("modeTitle").innerText =
    `${cat.charAt(0).toUpperCase() + cat.slice(1)} Mode`;
}

function goBackToMenu(){
  clearInterval(timerInterval);
  hideAllPages();
  startMenu.classList.remove("hidden");
}

function startGame(cat, mode){
  hideAllPages();
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

  if(isMobile()) {
    answerInput.setAttribute("readonly", true);
  } else {
    answerInput.removeAttribute("readonly");
  }

  generateQuestion();
  setupKeypad();
}

function endGame(){
  clearInterval(timerInterval);
  hideAllPages();
  startMenu.classList.remove("hidden");
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

  if(!isMobile()) answerInput.focus();
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

    if(!highScoreContainer.classList.contains("hidden")){
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
    },400);
  }
}

// Keypad
function setupKeypad(){
  keypad.innerHTML = "";
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","✔"];
  keys.forEach(k=>{
    let keyEl = document.createElement("div");
    keyEl.classList.add("key");
    keyEl.innerText = k;
    const handleKey = ()=>{
      if(k==="←"){ answerInput.value = answerInput.value.slice(0,-1); }
      else if(k==="✔"){ checkAnswer(); }
      else { answerInput.value += k; }
    };
    keyEl.addEventListener("click", handleKey);
    keyEl.addEventListener("touchstart", handleKey);
    keypad.appendChild(keyEl);
  });
  keypad.classList.remove("hidden");
}

// Keyboard support (desktop)
answerInput.addEventListener("keydown", e=>{
  if(e.key === "Enter") checkAnswer();
});

// Accessibility
function setColorScheme(scheme){
  document.body.classList.remove("dark","highContrast");
  document.body.classList.add(scheme);
  localStorage.setItem("mathGalaxyColorScheme",scheme);
}
function setFontOption(option){
  document.body.classList.remove("defaultFont","largeFont","lexieFont");
  document.body.classList.add(option + "Font");
  localStorage.setItem("mathGalaxyFont",option);
}
function setMotionOption(option){
  if(option==="reduced") document.body.classList.add("reduce-motion");
  else document.body.classList.remove("reduce-motion");
  localStorage.setItem("mathGalaxyMotion",option);
}
document.addEventListener("DOMContentLoaded", ()=>{
  const cs = localStorage.getItem("mathGalaxyColorScheme") || "dark";
  const f = localStorage.getItem("mathGalaxyFont") || "default";
  const m = localStorage.getItem("mathGalaxyMotion") || "enabled";
  setColorScheme(cs);
  setFontOption(f);
  setMotionOption(m);
});

// Background
const spaceBg = document.getElementById("space-bg");
const planets = [];
const planetTypes = ["rocky","gas","icy","ringed"];
// Stars
for(let i=0; i<100; i++){
  let star = document.createElement("div");
  star.classList.add("star");
  star.style.top = Math.random()*window.innerHeight + "px";
  star.style.left = Math.random()*window.innerWidth + "px";
  spaceBg.appendChild(star);
}
// Planets
for(let i=0; i<6; i++){
  let planet = document.createElement("div");
  planet.classList.add("planet", planetTypes[i % planetTypes.length]);
  let size = 60 + Math.random()*100;
  planet.style.width = size+"px";
  planet.style.height = size+"px";
  let x = Math.random()*window.innerWidth;
  let y = Math.random()*window.innerHeight;
  planet.style.left = x+"px";
  planet.style.top = y+"px";
  spaceBg.appendChild(planet);
  planets.push({el: planet, x, y, dx: (Math.random()-0.5)*0.2, dy: (Math.random()-0.5)*0.2});
}
// Shooting stars
for(let i=0;i<3;i++){
  let s = document.createElement("div");
  s.classList.add("shooting-star");
  s.style.top = Math.random()*window.innerHeight/2+"px";
  s.style.left = (50+Math.random()*50)+"%";
  s.style.animationDelay = (i*5)+"s";
  spaceBg.appendChild(s);
}
function animatePlanets(){
  planets.forEach(p=>{
    p.x += p.dx; p.y += p.dy;
    if(p.x > window.innerWidth) p.x = -150;
    if(p.y > window.innerHeight) p.y = -150;
    if(p.x < -150) p.x = window.innerWidth;
    if(p.y < -150) p.y = window.innerHeight;
    p.el.style.left = p.x+"px";
    p.el.style.top = p.y+"px";
  });
  requestAnimationFrame(animatePlanets);
}
animatePlanets();
