let currentCategory = '';
let score = 0;
let streak = 0;
let highScore = localStorage.getItem('mathGalaxyHighScore') || 0;

document.getElementById('highScore').innerText = highScore;

function startGame(category) {
    currentCategory = category;
    score = 0;
    streak = 0;
    document.getElementById('score').innerText = score;
    document.getElementById('streak').innerText = streak;
    document.getElementById('categoryTitle').innerText = category.charAt(0).toUpperCase() + category.slice(1);
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    generateQuestion();
}

function backToMenu() {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
}

function generateQuestion() {
    let a = Math.floor(Math.random() * 10) + 1;
    let b = Math.floor(Math.random() * 10) + 1;
    let questionText = '';
    let correctAnswer = 0;

    switch(currentCategory) {
        case 'addition':
            correctAnswer = a + b;
            questionText = `${a} + ${b} = ?`;
            break;
        case 'subtraction':
            if (b > a) [a, b] = [b, a]; // ensure positive
            correctAnswer = a - b;
            questionText = `${a} - ${b} = ?`;
            break;
        case 'multiplication':
            correctAnswer = a * b;
            questionText = `${a} × ${b} = ?`;
            break;
        case 'division':
            correctAnswer = a;
            let product = a * b;
            questionText = `${product} ÷ ${b} = ?`;
            break;
    }

    document.getElementById('question').innerText = questionText;
    document.getElementById('submitAnswer').onclick = function() {
        checkAnswer(correctAnswer);
    }
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
}

function checkAnswer(correctAnswer) {
    let userAnswer = Number(document.getElementById('answerInput').value);
    let feedback = document.getElementById('feedback');
    if (userAnswer === correctAnswer) {
        score += 10 + streak * 2; // streak bonus
        streak++;
        feedback.innerText = '✅ Correct!';
        feedback.style.color = '#00FF00';
    } else {
        streak = 0;
        feedback.innerText = `❌ Wrong! Answer: ${correctAnswer}`;
        feedback.style.color = '#FF4444';
    }
    document.getElementById('score').innerText = score;
    document.getElementById('streak').innerText = streak;

    // update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('mathGalaxyHighScore', highScore);
        document.getElementById('highScore').innerText = highScore;
    }

    setTimeout(generateQuestion, 1000); // next question after 1s
}
