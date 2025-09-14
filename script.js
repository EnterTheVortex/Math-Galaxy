/* ---------- Global Variables ---------- */
let currentCategory = "";
let mode = "";
let score = 0, streak = 0, answered = 0, timer = 60, timerInterval = null;
let tokens = parseInt(localStorage.getItem("tokens") || "0");
let collection = JSON.parse(localStorage.getItem("collection") || "[]");

// Screens
const screens = document.querySelectorAll(".screen");

// Elements
const answerInput = document.getElementById("answerInput");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const streakDisplay = document.getElementById("streak");
const timerDisplay = document.getElementById("timer");
const timerBox = document.getElementById("timerBox");
const tokenCount = document.getElementById("tokenCount");
const keypad = document.getElementById("keypad");
const animalGrid = document.getElementById("animalGrid");
const revealGrid = document.getElementById("revealGrid");

/* ---------- Utility Functions ---------- */
function showScreen(id) {
  screens.forEach(s => s.classList.add("hidden"));
  const screen = document.getElementById(id);
  screen.classList.remove("hidden");
  screen.classList.add("active");
  // Mobile full screen game view
  if (id === "game") document.body.classList.add("mobile-game");
  else document.body.classList.remove("mobile-game");
}

/* ---------- Navigation ---------- */
function chooseCategory(cat) {
  currentCategory = cat;
  document.getElementById("modeTitle").innerText = cat.toUpperCase();
  showScreen("modeMenu");
}

function startGame(selectedMode) {
  mode = selectedMode;
  score = 0; streak = 0; answered = 0;
  scoreDisplay.innerText = 0;
  streakDisplay.innerText = 0;
  document.getElementById("gameTitle").innerText = `${currentCategory} - ${mode}`;
  showScreen("game");

  // Timer for highscore mode
  if (mode === "highscore") {
    timer = 60;
    timerDisplay.innerText = timer;
    timerBox.classList.remove("hidden");
    timerInterval = setInterval(() => {
      timer--;
      timerDisplay.innerText = timer;
      if (timer <= 0) endGame();
    }, 1000);
  } else {
    timerBox.classList.add("hidden");
  }

  generateQuestion();
  buildKeypad();
}

function exitGame() {
  if (timerInterval) clearInterval(timerInterval);
  showScreen("menu");
}

function endGame() {
  if (timerInterval) clearInterval(timerInterval);
  alert(`Time's up! Your score: ${score}`);
  exitGame();
}

/* ---------- Question / Answer Logic ---------- */
function generateQuestion() {
  let a = Math.floor(Math.random() * 12) + 1;
  let b = Math.floor(Math.random() * 12) + 1;
  let q = "", ans = 0;
  switch (currentCategory) {
    case "addition": q = `${a} + ${b}`; ans = a + b; break;
    case "subtraction": q = `${a} - ${b}`; ans = a - b; break;
    case "multiplication": q = `${a} × ${b}`; ans = a * b; break;
    case "division": a = a * b; q = `${a} ÷ ${b}`; ans = a / b; break;
  }
  document.getElementById("question").innerText = q;
  answerInput.value = "";
  answerInput.dataset.answer = ans;
}

function checkAnswer(userInput = parseInt(answerInput.value)) {
  let correct = parseInt(answerInput.dataset.answer);
  if (userInput === correct) {
    score++; streak++; answered++;
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;
    feedback.innerText = "✅ Correct!";
    feedback.style.color = "lightgreen";

    if (answered % 15 === 0) {
      tokens += 5;
      saveProgress();
    }

    setTimeout(generateQuestion, 500);
  } else {
    streak = 0;
    streakDisplay.innerText = streak;
    feedback.innerText = "❌ Wrong!";
    feedback.style.color = "red";

    answerInput.classList.add("shake");
    setTimeout(() => {
      answerInput.classList.remove("shake");
      answerInput.value = "";
    }, 400);
  }
}

/* ---------- Keypad ---------- */
function buildKeypad() {
  keypad.innerHTML = "";
  ["1","2","3","4","5","6","7","8","9","0","←","✔"].forEach(key => {
    let btn = document.createElement("button");
    btn.innerText = key;
    btn.addEventListener("click", e => {
      e.preventDefault(); // prevent double-tap
      handleKey(key);
    });
    keypad.appendChild(btn);
  });
}

function handleKey(k) {
  if (k === "←") { answerInput.value = answerInput.value.slice(0, -1); return; }
  if (k === "✔") { checkAnswer(parseInt(answerInput.value)); return; }
  answerInput.value += k;
}

// Desktop keyboard support
document.addEventListener("keydown", e => {
  const activeScreen = document.querySelector(".screen.active");
  if (!activeScreen || activeScreen.id !== "game") return;

  if (e.key >= "0" && e.key <= "9") answerInput.value += e.key;
  if (e.key === "Backspace") answerInput.value = answerInput.value.slice(0, -1);
  if (e.key === "Enter") checkAnswer(parseInt(answerInput.value));
});

/* ---------- Collections / Cards ---------- */
const animals = ["Lion","Tiger","Elephant","Giraffe","Monkey","Panda","Kangaroo","Penguin","Zebra","Hippo",
                 "Rhino","Crocodile","Owl","Eagle","Shark","Dolphin","Whale","Bear","Wolf","Fox"];
const animalCards = {
  "Lion":{img:"🦁",color:"linear-gradient(135deg,#f9d423,#ff4e50)"},
  "Tiger":{img:"🐯",color:"linear-gradient(135deg,#ff6a00,#ee0979)"},
  "Elephant":{img:"🐘",color:"linear-gradient(135deg,#a8c0ff,#3f2b96)"},
  "Giraffe":{img:"🦒",color:"linear-gradient(135deg,#f7971e,#ffd200)"},
  "Monkey":{img:"🐵",color:"linear-gradient(135deg,#654321,#d9a760)"},
  "Panda":{img:"🐼",color:"linear-gradient(135deg,#000,#fff)"},
  "Kangaroo":{img:"🦘",color:"linear-gradient(135deg,#e96443,#904e95)"},
  "Penguin":{img:"🐧",color:"linear-gradient(135deg,#83a4d4,#b6fbff)"},
  "Zebra":{img:"🦓",color:"linear-gradient(135deg,#000,#fff)"},
  "Hippo":{img:"🦛",color:"linear-gradient(135deg,#a1c4fd,#c2e9fb)"},
  "Rhino":{img:"🦏",color:"linear-gradient(135deg,#757f9a,#d7dde8)"},
  "Crocodile":{img:"🐊",color:"linear-gradient(135deg,#11998e,#38ef7d)"},
  "Owl":{img:"🦉",color:"linear-gradient(135deg,#373b44,#4286f4)"},
  "Eagle":{img:"🦅",color:"linear-gradient(135deg,#ff512f,#dd2476)"},
  "Shark":{img:"🦈",color:"linear-gradient(135deg,#2c3e50,#3498db)"},
  "Dolphin":{img:"🐬",color:"linear-gradient(135deg,#56ccf2,#2f80ed)"},
  "Whale":{img:"🐋",color:"linear-gradient(135deg,#83a4d4,#b6fbff)"},
  "Bear":{img:"🐻",color:"linear-gradient(135deg,#5d4157,#a8caba)"},
  "Wolf":{img:"🐺",color:"linear-gradient(135deg,#232526,#414345)"},
  "Fox":{img:"🦊",color:"linear-gradient(135deg,#f12711,#f5af19)"}
};

function saveProgress() {
  localStorage.setItem("collection", JSON.stringify(collection));
  localStorage.setItem("tokens", tokens);
  tokenCount.innerText = tokens;
}

function renderCollection() {
  animalGrid.innerHTML = "";
  animals.forEach(a => {
    const div = document.createElement("div");
    div.classList.add("animal-card");
    if (!collection.includes(a)) {
      div.classList.add("locked");
      div.innerText = "❓";
    } else {
      div.style.background = animalCards[a].color;
      div.innerHTML = `<div style="font-size:2rem">${animalCards[a].img}</div><span>${a}</span>`;
    }
    animalGrid.appendChild(div);
  });
  tokenCount.innerText = tokens;
}

function buyPack() {
  if (tokens < 15) { alert("Not enough tokens!"); return; }
  tokens -= 15;
  const newCards = [];
  for (let i = 0; i < 3; i++) {
    const available = animals.filter(a => !collection.includes(a));
    if (available.length === 0) break;
    const rand = available[Math.floor(Math.random() * available.length)];
    collection.push(rand);
    newCards.push(rand);
  }
  saveProgress();
  renderCollection();
  showPackReveal(newCards);
}

function showPackReveal(cards) {
  showScreen("packReveal");
  revealGrid.innerHTML = "";
  cards.forEach((c,i) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("reveal-card");
    const inner = document.createElement("div");
    inner.classList.add("reveal-inner");
    const front = document.createElement("div");
    front.classList.add("reveal-front");
    front.innerText = "❓";
    const back = document.createElement("div");
    back.classList.add("reveal-back");
    back.style.background = animalCards[c].color;
    back.innerHTML = `<div>${animalCards[c].img}</div><span>${c}</span>`;
    inner.appendChild(front);
    inner.appendChild(back);
    cardDiv.appendChild(inner);
    revealGrid.appendChild(cardDiv);
    setTimeout(()=>{ cardDiv.classList.add("flip"); }, i*800);
  });
}

function finishReveal() { showScreen("collection"); }

/* ---------- Accessibility ---------- */
document.getElementById("darkMode").onchange = e => document.body.classList.toggle("dark-mode", e.target.checked);
document.getElementById("contrastMode").onchange = e => document.body.classList.toggle("high-contrast", e.target.checked);
document.getElementById("largeFont").onchange = e => document.body.classList.toggle("large-font", e.target.checked);
document.getElementById("lexieFont").onchange = e => document.body.classList.toggle("lexie-font", e.target.checked);
document.getElementById("reduceMotion").onchange = e => document.body.classList.toggle("reduce-motion", e.target.checked);
