/* ---------- Canvas Background ---------- */
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [], planets = [], shootingStars = [];

function initBackground() {
  stars = Array.from({length:120}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.5 + 0.5,
    alpha: Math.random()
  }));

  planets = Array.from({length:5}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: 30 + Math.random()*40,
    color: `hsl(${Math.random()*360},70%,50%)`,
    dx: (Math.random()-0.5)*0.2,
    dy: (Math.random()-0.5)*0.2,
    highlight: Math.random()*0.5 + 0.3
  }));

  shootingStars = Array.from({length:4}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height/2,
    length: 80 + Math.random()*40,
    speed: 6 + Math.random()*4,
    active: Math.random()<0.5
  }));
}

function drawBackground() {
  ctx.fillStyle = "#0b0c20";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    s.alpha += (Math.random()-0.5)*0.05;
    if(s.alpha < 0.1) s.alpha=0.1;
    if(s.alpha > 1) s.alpha=1;
  });

  planets.forEach(p => {
    let grad = ctx.createRadialGradient(p.x - p.r/3, p.y - p.r/3, p.r*0.1, p.x, p.y, p.r);
    grad.addColorStop(0, "rgba(255,255,255," + p.highlight + ")");
    grad.addColorStop(1, p.color);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x+2, p.y+2, p.r*0.9, 0, Math.PI*2);
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fill();

    p.x += p.dx; p.y += p.dy;
    if(p.x<-p.r) p.x=canvas.width+p.r;
    if(p.x>canvas.width+p.r) p.x=-p.r;
    if(p.y<-p.r) p.y=canvas.height+p.r;
    if(p.y>canvas.height+p.r) p.y=-p.r;
  });

  shootingStars.forEach(s => {
    if(s.active){
      let gradient = ctx.createLinearGradient(s.x, s.y, s.x - s.length, s.y + s.length);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.length, s.y + s.length);
      ctx.stroke();
      s.x += s.speed; s.y += s.speed;
      if(s.x>canvas.width || s.y>canvas.height){
        s.x = Math.random()*canvas.width/2;
        s.y = Math.random()*canvas.height/2;
        s.active = Math.random()<0.5;
      }
    } else if(Math.random()<0.01) s.active=true;
  });
}

function animate() {
  drawBackground();
  requestAnimationFrame(animate);
}
initBackground();
animate();

/* ---------- Screen Navigation ---------- */
const screens = document.querySelectorAll(".screen");
function showScreen(id){
  screens.forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.getElementById(id).classList.add("active");
}

/* ---------- Game Logic ---------- */
let currentCategory="", mode="", score=0, streak=0, timer=60, timerInterval;
let tokens=0, answered=0;

// High score storage per category
let highScores = JSON.parse(localStorage.getItem("highScores") || "{}");

const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const highScoreDisplay = document.getElementById("highScore");
const timerDisplay = document.getElementById("timer");
const timerBox = document.getElementById("timerBox");

function chooseCategory(cat){
  currentCategory = cat;
  document.getElementById("modeTitle").innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
  showScreen("modeMenu");
}

function startGame(selectedMode){
  mode = selectedMode;
  score = 0; streak = 0; answered = 0;
  scoreDisplay.innerText = score;
  streakDisplay.innerText = streak;
  highScoreDisplay.innerText = highScores[currentCategory] || 0;

  document.getElementById("gameTitle").innerText = `${currentCategory} - ${mode}`;
  showScreen("game");

  if(mode==="highscore"){
    timer = 60;
    timerDisplay.innerText = timer;
    timerBox.classList.remove("hidden");
    timerInterval = setInterval(()=>{
      timer--;
      timerDisplay.innerText = timer;
      if(timer<=0) endGame();
    },1000);
  } else {
    timerBox.classList.add("hidden");
  }

  generateQuestion();
}

function generateQuestion(){
  let a=Math.floor(Math.random()*12)+1;
  let b=Math.floor(Math.random()*12)+1;
  let q="", ans=0;
  switch(currentCategory){
    case "addition": q=`${a} + ${b}`; ans=a+b; break;
    case "subtraction": q=`${a} - ${b}`; ans=a-b; break;
    case "multiplication": q=`${a} × ${b}`; ans=a*b; break;
    case "division": a=a*b; q=`${a} ÷ ${b}`; ans=a/b; break;
  }
  document.getElementById("question").innerText = q;
  answerInput.value = "";
  answerInput.dataset.answer = ans;
  feedback.innerText = "";
}

function checkAnswer(userVal){
  let correct = parseInt(answerInput.dataset.answer);
  if(userVal === correct){
    score++; streak++; answered++;
    scoreDisplay.innerText = score; streakDisplay.innerText = streak;
    feedback.innerText = "✅ Correct!";
    feedback.style.color="lightgreen";

    if(answered % 15 === 0) {
      tokens +=5;
      saveProgress();
    }

    if(mode==="highscore" && score > (highScores[currentCategory] || 0)){
      highScores[currentCategory] = score;
      localStorage.setItem("highScores", JSON.stringify(highScores));
      highScoreDisplay.innerText = highScores[currentCategory];
    }

    setTimeout(generateQuestion, 500);
  } else {
    streak=0; streakDisplay.innerText = streak;
    feedback.innerText = "❌ Wrong!";
    feedback.style.color="red";
    answerInput.classList.add("shake");
    setTimeout(()=>{ answerInput.classList.remove("shake"); answerInput.value=""; }, 400);
  }
}

function exitGame(){
  if(mode==="highscore") clearInterval(timerInterval);
  showScreen("menu");
}

function endGame(){
  if(mode==="highscore") clearInterval(timerInterval);
  alert(`Time's up! Score: ${score}`);
  exitGame();
}

/* ---------- Keypad ---------- */
function buildKeypad(){
  const keypad=document.getElementById("keypad");
  keypad.innerHTML="";
  ["1","2","3","4","5","6","7","8","9","0","←","✔"].forEach(k=>{
    let btn = document.createElement("button");
    btn.innerText = k;
    btn.addEventListener("click", ()=>handleKey(k));
    keypad.appendChild(btn);
  });
}
function handleKey(k){
  if(k==="←"){ answerInput.value = answerInput.value.slice(0,-1); return; }
  if(k==="✔"){ checkAnswer(parseInt(answerInput.value)); return; }
  answerInput.value += k;
}
buildKeypad();

// Desktop keyboard support
document.addEventListener("keydown", e => {
  if(document.getElementById("game").classList.contains("hidden")) return;
  if(e.key >= "0" && e.key <= "9") answerInput.value += e.key;
  if(e.key==="Backspace") answerInput.value = answerInput.value.slice(0,-1);
  if(e.key==="Enter") checkAnswer(parseInt(answerInput.value));
});

/* ---------- Tokens ---------- */
let collection = JSON.parse(localStorage.getItem("collection") || "[]");
tokens = parseInt(localStorage.getItem("tokens") || "0");
function saveProgress(){
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("tokens", tokens);
  document.getElementById("tokenCount").innerText = tokens;
}
