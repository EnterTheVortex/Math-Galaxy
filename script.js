let currentCategory = null, score=0, streak=0, highScore=0, timeLeft=60;
let timerInterval; let motionEnabled = true;
const categories={addition:"+",subtraction:"-",multiplication:"×",division:"÷"};

const startMenu=document.getElementById("startMenu");
const gameModes=document.getElementById("gameModes");
const modeMenu=document.getElementById("modeMenu");
const settings=document.getElementById("settings");
const game=document.getElementById("game");
const exitBtn=document.getElementById("exitBtn");

const questionEl=document.getElementById("question");
const answerInput=document.getElementById("answer");
const feedback=document.getElementById("feedback");
const scoreEl=document.getElementById("score");
const streakEl=document.getElementById("streak");
const highScoreEl=document.getElementById("highScore");
const highScoreContainer=document.getElementById("highScoreContainer");
const timerContainer=document.getElementById("timerContainer");
const timerEl=document.getElementById("timer");
const keypad=document.getElementById("keypad");

function isMobile(){ return window.innerWidth <=600; }

function hideAllPages(){ [startMenu,gameModes,modeMenu,settings,game].forEach(p=>p.classList.add("hidden")); }
function openGameModes(){ hideAllPages(); gameModes.classList.remove("hidden"); }
function backToStartMenu(){ hideAllPages(); startMenu.classList.remove("hidden"); }
function openSettings(){ hideAllPages(); settings.classList.remove("hidden"); }
function backToGameModes(){ hideAllPages(); gameModes.classList.remove("hidden"); }
function openModeMenu(cat){ currentCategory=cat; hideAllPages(); modeMenu.classList.remove("hidden"); document.getElementById("modeTitle").innerText=cat.charAt(0).toUpperCase()+cat.slice(1)+" Mode"; }
function goBackToMenu(){ clearInterval(timerInterval); hideAllPages(); startMenu.classList.remove("hidden"); }
exitBtn.addEventListener("click",goBackToMenu);

function startGame(cat,mode){
  hideAllPages(); game.classList.remove("hidden");
  document.getElementById("categoryTitle").innerText=cat.charAt(0).toUpperCase()+cat.slice(1);
  score=0; streak=0; scoreEl.innerText=score; streakEl.innerText=streak;

  if(mode==="highscore"){
    timeLeft=60; timerContainer.classList.remove("hidden"); highScoreContainer.classList.remove("hidden");
    let key=`mathGalaxyHighScore_${cat}`; highScore=localStorage.getItem(key)||0; highScoreEl.innerText=highScore;
    timerInterval=setInterval(()=>{ timeLeft--; timerEl.innerText=timeLeft; if(timeLeft<=0){ clearInterval(timerInterval); endGame(); } },1000);
  } else { timerContainer.classList.add("hidden"); highScoreContainer.classList.add("hidden"); }

  if(isMobile()) answerInput.setAttribute("readonly",true); else answerInput.removeAttribute("readonly");
  generateQuestion(); setupKeypad();
}

function endGame(){ clearInterval(timerInterval); hideAllPages(); startMenu.classList.remove("hidden"); }

function generateQuestion(){
  let a=Math.floor(Math.random()*12)+1, b=Math.floor(Math.random()*12)+1, symbol=categories[currentCategory], q, ans;
  switch(symbol){ case "+": ans=a+b;q=`${a}+${b}`;break; case "-": ans=a-b;q=`${a}-${b}`;break; case "×": ans=a*b;q=`${a}×${b}`;break; case "÷": ans=a;q=`${a*b}÷${b}`;break;}
  questionEl.innerText=q; questionEl.dataset.answer=ans; answerInput.value=""; if(!isMobile()) answerInput.focus();
}

function checkAnswer(){
  let userAns=parseInt(answerInput.value), correctAns=parseInt(questionEl.dataset.answer);
  if(userAns===correctAns){
    feedback.innerText="✅ Correct!"; feedback.style.color="#0f0"; score++; streak++; scoreEl.innerText=score; streakEl.innerText=streak;
    if(!highScoreContainer.classList.contains("hidden")){ let key=`mathGalaxyHighScore_${currentCategory}`; if(score>highScore){ highScore=score; localStorage.setItem(key,highScore); highScoreEl.innerText=highScore; } }
    setTimeout(generateQuestion,400);
  } else {
    streak=0; streakEl.innerText=streak; feedback.innerText="❌ Wrong!"; feedback.style.color="#f44";
    answerInput.classList.add("shake"); setTimeout(()=>{ answerInput.classList.remove("shake"); answerInput.value=""; },300);
  }
}

function setupKeypad() {
  keypad.innerHTML = "";
  const keys = ["1","2","3","4","5","6","7","8","9","0","←","✔"];
  
  // Detect event type
  const eventType = isMobile() ? "touchstart" : "click";

  keys.forEach(k => {
    let keyEl = document.createElement("div");
    keyEl.classList.add("key");
    keyEl.innerText = k;

    keyEl.addEventListener(eventType, () => {
      if (k === "←") {
        answerInput.value = answerInput.value.slice(0, -1);
      } else if (k === "✔") {
        checkAnswer();
      } else {
        answerInput.value += k;
      }
    });

    keypad.appendChild(keyEl);
  });

  keypad.classList.remove("hidden");
}

// Accessibility Toggles
function toggleClass(cls){ document.body.classList.toggle(cls); saveSettings(); }
function saveSettings(){
  const s={ dark:document.body.classList.contains("dark"), highContrast:document.body.classList.contains("highContrast"), largeFont:document.body.classList.contains("largeFont"), lexieFont:document.body.classList.contains("lexieFont"), reduceMotion:document.body.classList.contains("reduce-motion")};
  localStorage.setItem("mathGalaxySettings",JSON.stringify(s)); motionEnabled=!s.reduceMotion;
}
document.addEventListener("DOMContentLoaded",()=>{
  const saved=JSON.parse(localStorage.getItem("mathGalaxySettings")||"{}");
  Object.keys(saved).forEach(cls=>{ if(saved[cls]) document.body.classList.add(cls); });
  motionEnabled=!saved.reduceMotion;

  // Connect toggles
  document.getElementById("darkToggle").checked=document.body.classList.contains("dark");
  document.getElementById("contrastToggle").checked=document.body.classList.contains("highContrast");
  document.getElementById("largeFontToggle").checked=document.body.classList.contains("largeFont");
  document.getElementById("lexieToggle").checked=document.body.classList.contains("lexieFont");
  document.getElementById("motionToggle").checked=document.body.classList.contains("reduce-motion");

  document.getElementById("darkToggle").addEventListener("change",()=>toggleClass("dark"));
  document.getElementById("contrastToggle").addEventListener("change",()=>toggleClass("highContrast"));
  document.getElementById("largeFontToggle").addEventListener("change",()=>toggleClass("largeFont"));
  document.getElementById("lexieToggle").addEventListener("change",()=>toggleClass("lexieFont"));
  document.getElementById("motionToggle").addEventListener("change",()=>toggleClass("reduce-motion"));
});

// Background Planets/Stars/Shooting Stars
const spaceBg=document.getElementById("space-bg");
const planets=[], planetTypes=["rocky","gas","icy","ringed"];
for(let i=0;i<100;i++){ let star=document.createElement("div"); star.classList.add("star"); star.style.top=Math.random()*window.innerHeight+"px"; star.style.left=Math.random()*window.innerWidth+"px"; spaceBg.appendChild(star);}
for(let i=0;i<6;i++){ let planet=document.createElement("div"); planet.classList.add("planet",planetTypes[i%planetTypes.length]); let size=60+Math.random()*100; planet.style.width=size+"px"; planet.style.height=size+"px"; let x=Math.random()*window.innerWidth, y=Math.random()*window.innerHeight; planet.style.left=x+"px"; planet.style.top=y+"px"; spaceBg.appendChild(planet); planets.push({el:planet,x,y,dx:(Math.random()-0.5)*0.2,dy:(Math.random()-0.5)*0.2}); }
for(let i=0;i<3;i++){ let s=document.createElement("div"); s.classList.add("shooting-star"); s.style.top=Math.random()*window.innerHeight/2+"px"; s.style.left=(50+Math.random()*50)+"%"; s.style.animationDelay=(i*5)+"s"; spaceBg.appendChild(s); }

function animatePlanets(){ if(motionEnabled){ planets.forEach(p=>{ p.x+=p.dx; p.y+=p.dy; if(p.x>window.innerWidth)p.x=-150; if(p.y>window.innerHeight)p.y=-150; if(p.x<-150)p.x=window.innerWidth; if(p.y<-150)p.y=window.innerHeight; p.el.style.left=p.x+"px"; p.el.style.top=p.y+"px";}); } requestAnimationFrame(animatePlanets); }
animatePlanets();
