const menu = document.getElementById('menu');
const gameScreen = document.getElementById('game');
const answerInput = document.getElementById('answerInput');
const keypad = document.getElementById('keypad');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');

let currentCategory = '';
let score = 0;
let streak = 0;
let highScore = localStorage.getItem('mathGalaxyHighScore') || 0;
document.getElementById('highScore').innerText = highScore;
let currentAnswer = 0;

// ----------------- Keypad setup -----------------
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

// ----------------- Keyboard input -----------------
document.addEventListener('keydown', e => {
  if(gameScreen.classList.contains('hidden')) return; // ignore on menu
  if(e.key >= '0' && e.key <= '9') answerInput.value += e.key;
  else if(e.key === 'Backspace') answerInput.value = answerInput.value.slice(0,-1);
  else if(e.key === 'Enter') checkAnswer();
});

function startGame(category){
    currentCategory = category;
    score = 0;
    streak = 0;
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;

    menu.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    // show keypad only on game screen
    keypad.style.display = 'inline-block';

    document.getElementById('categoryTitle').innerText =
        category.charAt(0).toUpperCase() + category.slice(1);
    generateQuestion();
}

function backToMenu(){
    gameScreen.classList.add('hidden');
    menu.classList.remove('hidden');
    keypad.style.display = 'none';
}

function generateQuestion(){
    let a = Math.floor(Math.random()*10)+1;
    let b = Math.floor(Math.random()*10)+1;
    let questionText = '';

    switch(currentCategory){
        case 'addition':
            currentAnswer = a+b;
            questionText = `${a} + ${b} = ?`;
            break;
        case 'subtraction':
            if(b>a)[a,b]=[b,a];
            currentAnswer = a-b;
            questionText = `${a} - ${b} = ?`;
            break;
        case 'multiplication':
            currentAnswer = a*b;
            questionText = `${a} × ${b} = ?`;
            break;
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

function checkAnswer(){
  if(Number(answerInput.value) === currentAnswer){
    score += 10+streak*2;
    streak++;
    feedback.innerText = '✅ Correct!';
    feedback.style.color = '#00FF00';
    scoreDisplay.innerText = score;
    streakDisplay.innerText = streak;

    if(score>highScore){
      highScore = score;
      localStorage.setItem('mathGalaxyHighScore', highScore);
      document.getElementById('highScore').innerText = highScore;
    }
    setTimeout(generateQuestion,500);
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
