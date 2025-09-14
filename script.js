/* =====================
   Background Animation
   ===================== */
const canvas = document.getElementById("spaceBackground");
const ctx = canvas.getContext("2d");
let planets = [], stars = [], shootingStars = [];
let motionEnabled = true;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function random(min, max) { return Math.random() * (max - min) + min; }

function createBackground() {
  stars = Array.from({length: 100}, () => ({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    r: random(0.5, 1.5),
    twinkle: Math.random()
  }));

  planets = Array.from({length: 5}, () => ({
    x: random(0, canvas.width),
    y: random(0, canvas.height),
    r: random(20, 40),
    color: `hsl(${Math.floor(random(0,360))}, 70%, 50%)`,
    dx: random(-0.2, 0.2),
    dy: random(-0.2, 0.2)
  }));
}
createBackground();

function drawBackground() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // stars
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
    ctx.fillStyle = "white";
    ctx.globalAlpha = 0.5 + 0.5 * Math.sin(Date.now()/200 + s.twinkle*10);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // planets
  planets.forEach(p => {
    ctx.beginPath();
    let grad = ctx.createRadialGradient(p.x, p.y, p.r*0.2, p.x, p.y, p.r);
    grad.addColorStop(0, "white");
    grad.addColorStop(1, p.color);
    ctx.fillStyle = grad;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
    if (motionEnabled) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -50) p.x = canvas.width+50;
      if (p.y < -50) p.y = canvas.height+50;
      if (p.x > canvas.width+50) p.x = -50;
      if (p.y > canvas.height+50) p.y = -50;
    }
  });

  requestAnimationFrame(drawBackground);
}
drawBackground();

/* =====================
   Game Logic
   ===================== */
let currentCategory = "", currentMode = "", timerInterval;
let score = 0, streak = 0, highScores = JSON.parse(localStorage.getItem("mathGalaxyHighScores") || "{}");
let tokens = parseInt(localStorage.getItem("mathGalaxyTokens") || "0");
let collection = JSON.parse(localStorage.getItem("mathGalaxyCollection") || "[]");
const animals = [
  "Lion","Tiger","Elephant","Giraffe","Monkey",
  "Panda","Kangaroo","Penguin","Zebra","Hippo",
  "Rhino","Crocodile","Owl","Eagle","Shark",
  "Dolphin","Whale","Bear","Wolf","Fox"
];

function hideAllPages() {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
}
function backToStartMenu() {
  hideAllPages();
  document.getElementById("startMenu").classList.remove("hidden");
}
function openGameModes() {
  hideAllPages();
  document.getElementById("gameModes").classList.remove("hidden");
}
function openCategory(cat) {
  currentCategory = cat;
  hideAllPages();
  document.getElementById("categoryTitle").innerText = cat.charAt(0).toUpperCase()+cat.slice(1);
  document.getElementById("categoryModes").classList.remove("hidden");
}
function backToGameModes() {
  hideAllPages();
  document.getElementById("gameModes").classList.remove("hidden");
}

function startGame(mode) {
  currentMode = mode;
  score = 0; streak = 0;
  document.getElementById("score").innerText = score;
  document.getElementById("streak").innerText = streak;
  document.getElementById("feedback").innerText = "";
  document.getElementById("answerInput").value = "";
  document.getElementById("gameTitle").innerText =
    `${currentCategory.toUpperCase()} - ${mode.toUpperCase()}`;

  hideAllPages();
  document.getElementById("gamePage").classList.remove("hidden");
  document.querySelector(".title").style.display = "none"; // hide on mobile

  if (mode === "highscore") {
    document.getElementById("timer").classList.remove("hidden");
    document.getElementById("highScoreWrapper").classList.remove("hidden");
    let hs = highScores[currentCategory] || 0;
    document.getElementById("highScore").innerText = hs;
    startTimer();
  } else {
    document.getElementById("timer").classList.add("hidden");
    document.getElementById("highScoreWrapper").classList.add("hidden");
  }

  generateQuestion();
}

function exitGame() {
  clearInterval(timerInterval);
  backToStartMenu();
  document.querySelector(".title").style.display = "block";
}

function generateQuestion() {
  let a = Math.floor(Math.random()*12)+1;
  let b = Math.floor(Math.random()*12)+1;
  let q, ans;
  switch(currentCategory) {
    case "addition": q = `${a} + ${b}`; ans = a+b; break;
    case "subtraction": q = `${a} - ${b}`; ans = a-b; break;
    case "multiplication": q = `${a} × ${b}`; ans = a*b; break;
    case "division": q = `${a*b} ÷ ${a}`; ans = b; break;
  }
  document.getElementById("question").innerText = q;
  document.getElementById("question").dataset.answer = ans;
}

function checkAnswer() {
  let input = document.getElementById("answerInput");
  let userAns = parseInt(input.value);
  let correctAns = parseInt(document.getElementById("question").dataset.answer);
  let feedback = document.getElementById("feedback");

  if (userAns === correctAns) {
    feedback.innerText = "✅ Correct!";
    feedback.style.color = "#4CAF50";
    score++; streak++;
    document.getElementById("score").innerText = score;
    document.getElementById("streak").innerText = streak;

    // tokens
    if (score % 15 === 0) updateTokens(5);

    if (currentMode === "highscore") {
      if (score > (highScores[currentCategory] || 0)) {
        highScores[currentCategory] = score;
        localStorage.setItem("mathGalaxyHighScores", JSON.stringify(highScores));
        document.getElementById("highScore").innerText = score;
      }
    }
    input.value = "";
    generateQuestion();
  } else {
    streak = 0;
    document.getElementById("streak").innerText = streak;
    feedback.innerText = "❌ Wrong!";
    feedback.style.color = "#FF4444";
    input.classList.add("shake");
    setTimeout(()=>{ input.classList.remove("shake"); input.value=""; },400);
  }
}

function startTimer() {
  let time = 60;
  document.getElementById("timer").innerText = `⏱️ ${time}s`;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    time--;
    document.getElementById("timer").innerText = `⏱️ ${time}s`;
    if (time <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Score: "+score);
      exitGame();
    }
  },1000);
}

/* =====================
   Keypad
   ===================== */
function createKeypad() {
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","✔"];
  let keypad = document.getElementById("keypad");
  keys.forEach(k => {
    let btn = document.createElement("button");
    btn.innerText = k;
    btn.addEventListener("click", () => handleKey(k));
    keypad.appendChild(btn);
  });
}
createKeypad();

function handleKey(k) {
  let input = document.getElementById("answerInput");
  if (k === "←") {
    input.value = input.value.slice(0,-1);
  } else if (k === "✔") {
    checkAnswer();
  } else {
    input.value += k;
  }
}

/* =====================
   Collections
   ===================== */
function updateTokens(amount) {
  tokens += amount;
  localStorage.setItem("mathGalaxyTokens", tokens);
  if (document.getElementById("tokenCount")) {
    document.getElementById("tokenCount").innerText = tokens;
  }
  if (document.getElementById("buyPackBtn")) {
    document.getElementById("buyPackBtn").disabled = tokens < 15;
  }
}

function openCollections() {
  hideAllPages();
  document.getElementById("collections").classList.remove("hidden");
  document.getElementById("tokenCount").innerText = tokens;
  document.getElementById("buyPackBtn").disabled = tokens < 15;
  renderCollection();
}

function renderCollection() {
  const grid = document.getElementById("animalGrid");
  grid.innerHTML = "";
  animals.forEach(a => {
    let div = document.createElement("div");
    div.classList.add("animal-card");
    if (!collection.includes(a)) {
      div.classList.add("locked");
      div.innerText = "❓";
    } else {
      div.innerText = a;
    }
    grid.appendChild(div);
  });
}

function buyPack() {
  if (tokens < 15) return;
  updateTokens(-15);

  let newAnimals = [];
  while (newAnimals.length < 3) {
    let animal = animals[Math.floor(Math.random()*animals.length)];
    if (!newAnimals.includes(animal)) newAnimals.push(animal);
  }

  newAnimals.forEach(a => {
    if (!collection.includes(a)) collection.push(a);
  });

  localStorage.setItem("mathGalaxyCollection", JSON.stringify(collection));
  renderCollection();
  alert("You got: " + newAnimals.join(", "));
}

/* =====================
   Settings Toggles
   ===================== */
function openSettings() {
  hideAllPages();
  document.getElementById("settings").classList.remove("hidden");
}
function toggleDarkMode(on) { document.body.classList.toggle("dark-mode", on); }
function toggleContrast(on) { document.body.classList.toggle("high-contrast", on); }
function toggleLargeFont(on) { document.body.classList.toggle("large-font", on); }
function toggleDyslexicFont(on) { document.body.classList.toggle("dyslexic-font", on); }
function toggleMotion(on) { motionEnabled = !on; }
