/* ---------- Canvas Background ---------- */
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [], planets = [], shootingStars = [];

function initBackground() {
  stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2,
    alpha: Math.random()
  }));

  planets = Array.from({ length: 5 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 30 + Math.random() * 30,
    color: `hsl(${Math.random() * 360},70%,50%)`,
    dx: (Math.random() - 0.5) * 0.3,
    dy: (Math.random() - 0.5) * 0.3
  }));

  shootingStars = Array.from({ length: 3 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    length: 20 + Math.random() * 30,
    speed: 4 + Math.random() * 3,
    active: Math.random() < 0.5
  }));
}

function drawBackground() {
  ctx.fillStyle = "#0b0c20";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stars
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
    ctx.fill();
    s.alpha += (Math.random() - 0.5) * 0.05;
    if (s.alpha < 0.1) s.alpha = 0.1;
    if (s.alpha > 1) s.alpha = 1;
  });

  // Planets
  planets.forEach(p => {
    let grad = ctx.createRadialGradient(p.x - p.r / 3, p.y - p.r / 3, p.r / 5, p.x, p.y, p.r);
    grad.addColorStop(0, "#fff");
    grad.addColorStop(1, p.color);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;
    if (p.x < -p.r) p.x = canvas.width + p.r;
    if (p.x > canvas.width + p.r) p.x = -p.r;
    if (p.y < -p.r) p.y = canvas.height + p.r;
    if (p.y > canvas.height + p.r) p.y = -p.r;
  });

  // Shooting Stars
  shootingStars.forEach(s => {
    if (s.active) {
      ctx.strokeStyle = "white";
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.length, s.y + s.length);
      ctx.stroke();
      s.x += s.speed;
      s.y += s.speed;
      if (s.x > canvas.width || s.y > canvas.height) {
        s.x = Math.random() * canvas.width / 2;
        s.y = Math.random() * canvas.height / 2;
        s.active = Math.random() < 0.5;
      }
    } else if (Math.random() < 0.01) s.active = true;
  });
}

function animate() {
  drawBackground();
  requestAnimationFrame(animate);
}

initBackground();
animate();

/* ---------- Screen Navigation ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const screens = document.querySelectorAll(".screen");

  function showScreen(id) {
    screens.forEach(s => s.classList.add("hidden"));
    screens.forEach(s => s.classList.remove("active"));
    const screen = document.getElementById(id);
    if (screen) {
      screen.classList.remove("hidden");
      screen.classList.add("active");
    }
    if (id === "game") document.body.classList.add("mobile-game");
    else document.body.classList.remove("mobile-game");
  }

  // Attach event listeners for buttons
  document.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("click", () => {
      const fn = btn.getAttribute("onclick");
      if (fn) eval(fn);
    });
  });

  /* ---------- Game Logic ---------- */
  let currentCategory = "", mode = "", score = 0, streak = 0, timer = 60, timerInterval;
  let tokens = parseInt(localStorage.getItem("tokens") || "0"), answered = 0;

  const answerInput = document.getElementById("answerInput");
  const feedback = document.getElementById("feedback");
  const scoreDisplay = document.getElementById("score");
  const streakDisplay = document.getElementById("streak");
  const timerDisplay = document.getElementById("timer");
  const timerBox = document.getElementById("timerBox");

  const categories = { addition: "+", subtraction: "-", multiplication: "×", division: "÷" };

  window.chooseCategory = (cat) => {
    currentCategory = cat;
    document.getElementById("modeTitle").innerText = cat.charAt(0).toUpperCase() + cat.slice(1);
    showScreen("modeMenu");
  };

  window.startGame = (selectedMode) => {
    mode = selectedMode;
    score = 0; streak = 0; answered = 0;
    scoreDisplay.innerText = 0;
    streakDisplay.innerText = 0;
    document.getElementById("gameTitle").innerText = `${currentCategory} - ${mode}`;
    showScreen("game");

    if (mode === "highscore") {
      timer = 60;
      timerDisplay.innerText = timer;
      timerBox.classList.remove("hidden");
      timerInterval = setInterval(() => {
        timer--;
        timerDisplay.innerText = timer;
        if (timer <= 0) {
          clearInterval(timerInterval);
          endGame();
        }
      }, 1000);
    } else {
      timerBox.classList.add("hidden");
    }

    generateQuestion();
  };

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
    feedback.innerText = "";
  }

  window.checkAnswer = (userVal) => {
    let correct = parseInt(answerInput.dataset.answer);
    if (userVal === correct) {
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
      setTimeout(() => { answerInput.classList.remove("shake"); answerInput.value = ""; }, 400);
    }
  };

  window.exitGame = () => {
    if (mode === "highscore") clearInterval(timerInterval);
    showScreen("menu");
  };

  function endGame() {
    if (mode === "highscore") clearInterval(timerInterval);
    alert(`Time’s up! Score: ${score}`);
    exitGame();
  }

  /* ---------- Keypad ---------- */
  function buildKeypad() {
    const keypad = document.getElementById("keypad");
    keypad.innerHTML = "";
    ["1","2","3","4","5","6","7","8","9","0","←","✔"].forEach(k => {
      let btn = document.createElement("button");
      btn.innerText = k;
      btn.addEventListener("click", () => handleKey(k));
      keypad.appendChild(btn);
    });
  }
  function handleKey(k) {
    if (k === "←") { answerInput.value = answerInput.value.slice(0,-1); return; }
    if (k === "✔") { checkAnswer(parseInt(answerInput.value)); return; }
    answerInput.value += k;
  }
  buildKeypad();

  // Desktop keyboard support
  document.addEventListener("keydown", e => {
    if(document.getElementById("game").classList.contains("hidden")) return;
    if(e.key >= "0" && e.key <= "9") answerInput.value += e.key;
    if(e.key === "Backspace") answerInput.value = answerInput.value.slice(0,-1);
    if(e.key === "Enter") checkAnswer(parseInt(answerInput.value));
  });

  /* ---------- Collections ---------- */
  const animals = ["Lion","Tiger","Elephant","Giraffe","Monkey","Panda","Kangaroo","Penguin","Zebra","Hippo","Rhino","Crocodile","Owl","Eagle","Shark","Dolphin","Whale","Bear","Wolf","Fox"];
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

  let collection = JSON.parse(localStorage.getItem("collection") || "[]");

  function saveProgress() {
    localStorage.setItem("collection", JSON.stringify(collection));
    localStorage.setItem("tokens", tokens);
    document.getElementById("tokenCount").innerText = tokens;
  }

  function renderCollection() {
    const grid = document.getElementById("animalGrid");
    grid.innerHTML = "";
    animals.forEach(a => {
      let div = document.createElement("div");
      div.classList.add("animal-card");
      if (!collection.includes(a)) {
        div.classList.add("locked"); div.innerText = "❓";
      } else {
        div.style.background = animalCards[a].color;
        div.innerHTML = `<div style="font-size:2rem">${animalCards[a].img}</div><span>${a}</span>`;
      }
      grid.appendChild(div);
    });
    document.getElementById("tokenCount").innerText = tokens;
  }

  window.buyPack = () => {
    if(tokens < 15){ alert("Not enough tokens!"); return; }
    tokens -= 15;
    let newCards = [];
    for(let i=0;i<3;i++){
      let available = animals.filter(a => !collection.includes(a));
      if(available.length === 0) break;
      let rand = available[Math.floor(Math.random()*available.length)];
      collection.push(rand);
      newCards.push(rand);
    }
    saveProgress();
    renderCollection();
    showPackReveal(newCards);
  }

  function showPackReveal(cards){
    showScreen("packReveal");
    const grid = document.getElementById("revealGrid");
    grid.innerHTML = "";
    cards.forEach((c,i)=>{
      let cardDiv = document.createElement("div");
      cardDiv.classList.add("reveal-card");
      let inner = document.createElement("div");
      inner.classList.add("reveal-inner");

      let front = document.createElement("div");
      front.classList.add("reveal-front");
      front.innerText="❓";

      let back = document.createElement("div");
      back.classList.add("reveal-back");
      back.style.background = animalCards[c].color;
      back.innerHTML = `<div>${animalCards[c].img}</div><span>${c}</span>`;

      inner.appendChild(front);
      inner.appendChild(back);
      cardDiv.appendChild(inner);
      grid.appendChild(cardDiv);
      setTimeout(()=>{ cardDiv.classList.add("flip"); }, i*800);
    });
  }

  window.finishReveal = () => showScreen("collection");

  /* ---------- Accessibility ---------- */
  document.getElementById("darkMode").onchange = e => document.body.classList.toggle("dark-mode", e.target.checked);
  document.getElementById("contrastMode").onchange = e => document.body.classList.toggle("high-contrast", e.target.checked);
  document.getElementById("largeFont").onchange = e => document.body.classList.toggle("large-font", e.target.checked);
  document.getElementById("lexieFont").onchange = e => document.body.classList.toggle("lexie-font", e.target.checked);
  document.getElementById("reduceMotion").onchange = e => document.body.classList.toggle("reduce-motion", e.target.checked);

  renderCollection();
  saveProgress();
});
