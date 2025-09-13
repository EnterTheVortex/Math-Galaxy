// ----------------- Animated Space Background -----------------
const spaceBg = document.getElementById('space-bg');

// Stars
for (let i = 0; i < 100; i++) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.style.top = Math.random() * 100 + '%';
  star.style.left = Math.random() * 100 + '%';
  star.style.width = star.style.height = Math.random() * 2 + 1 + 'px';
  star.style.animationDuration = 2 + Math.random() * 3 + 's';
  spaceBg.appendChild(star);
}

// Planets
const planetColors = [
  'radial-gradient(circle at 30% 30%, #ff6b6b, #880000)',
  'radial-gradient(circle at 30% 30%, #6bafff, #004488)',
  'radial-gradient(circle at 30% 30%, #ffdd6b, #aa8800)',
  'radial-gradient(circle at 30% 30%, #b36bff, #6600aa)'
];
for (let i = 0; i < 5; i++) {
  const planet = document.createElement('div');
  planet.classList.add('planet');
  planet.style.width = planet.style.height = 40 + Math.random() * 50 + 'px';
  planet.style.background = planetColors[Math.floor(Math.random() * planetColors.length)];
  planet.style.top = Math.random() * 80 + '%';
  planet.style.left = Math.random() * 90 + '%';
  planet.style.animationDuration = 20 + Math.random() * 20 + 's';
  spaceBg.appendChild(planet);
}

// Comets occasionally
function createComet() {
  const comet = document.createElement('div');
  comet.classList.add('comet');
  comet.style.top = Math.random() * 50 + '%';
  comet.style.left = '100%';
  comet.style.animationDuration = 2 + Math.random() * 1 + 's';
  spaceBg.appendChild(comet);
  setTimeout(() => comet.remove(), 4000);
}
setInterval(() => { if(Math.random() < 0.3) createComet(); }, 1000);


// ----------------- Math Galaxy Game Logic -----------------
let currentCategory = '';
let score = 0;
let streak = 0;
let highScore = localStorage.getItem('mathGalaxyHighScore') || 0;

document.getElementById('highScore').innerText = highScore;

const answerInput = document.getElementById('answerInput');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');

function startGame(category) {
    currentCategory = category;
    score = 0;
    streak = 0;
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;
    document.getElementById('categoryTitle').innerText = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    generateQuestion();
}

function backToMenu() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

let currentAnswer = 0;

function generateQuestion() {
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    let questionText = '';

    switch(currentCategory) {
        case 'addition':
            currentAnswer = a + b;
            questionText = `${a} + ${b} = ?`;
            break;
        case 'subtraction':
            if (b > a) [a, b] = [b, a];
            currentAnswer = a - b;
            questionText = `${a} - ${b} = ?`;
            break;
        case 'multiplication':
            currentAnswer = a * b;
            questionText = `${a} × ${b} = ?`;
            break;
        case 'division':
            currentAnswer = a;
            let product = a * b;
            questionText = `${product} ÷ ${b} = ?`;
            break;
    }

    document.getElementById('question').innerText = questionText;
    answerInput.value = '';
    feedback.innerText = '';
}

// ----------------- Keypad Logic -----------------
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

function checkAnswer() {
  if (Number(answerInput.value) === currentAnswer) {
    score += 10 + streak * 2;
    streak++;
    feedback.innerText = '✅ Correct!';
    feedback.style.color = '#00FF00';
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;
    if(score > highScore) {
      highScore = score;
      localStorage.setItem('mathGalaxyHighScore', highScore);
      document.getElementById('highScore').innerText = highScore;
    }
    setTimeout(generateQuestion, 500);
  } else {
    streak = 0;
    feedback.innerText = '❌ Wrong!';
    feedback.style.color = '#FF4444';
    streakDisplay.innerText = streak;
    answerInput.classList.add('shake');
    setTimeout(() => {
      answerInput.classList.remove('shake');
      answerInput.value = '';
    }, 500);
  }
}
