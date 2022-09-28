"use strict";

const boardEl = document.getElementById("board");
const scoreEl = document.getElementById("score");
const missEl = document.getElementById("miss");
const targetsCurrentValueEl = document.getElementById("targets--value");
const numberOfTargetsEl = document.getElementById("targets--number");
const respawnValueEl = document.getElementById("respawn--value");

// -- Toggle menu elements
const navbarEl = document.querySelector(".navbar");
const btnToggleMenu = document.querySelector(".btn-toggle-menu");

const respawnCurrentValueEl = document.getElementById("respawn--current-value");

const targetSizeEl = document.getElementById("size--value");

const scoreStatusEl = document.getElementById("score--status");

const targets = [];
let score = 0;
let hittedTargetsCounter = 0;
let missedTargetsCounter = 0;
let respawnTargetInterval;
let targetRespawnTime = 1000; // milliseconds

let targetWidth = 40; // px

let numberOfTargetsLimit = 8;

targetsCurrentValueEl.min = 1;
targetsCurrentValueEl.max = 20;
targetsCurrentValueEl.value = numberOfTargetsLimit;
numberOfTargetsEl.innerText = numberOfTargetsLimit;

// -- Target Size
targetSizeEl.min = 20;
targetSizeEl.max = 120;
targetSizeEl.step = 1;
targetSizeEl.value = targetWidth;

const currentSizeValueEl = document.getElementById("size--current-value");
currentSizeValueEl.innerText = targetWidth;

// -- Respawn target
respawnValueEl.min = 1;
respawnValueEl.max = 2000;
respawnValueEl.value = targetRespawnTime;
respawnCurrentValueEl.innerText = targetRespawnTime;

// *******************
// -- Event Listeners
// *******************

// -- Increment/Decrement
targetsCurrentValueEl.addEventListener("input", changeTargetsNumber);

// -- Change Respawn time
respawnValueEl.addEventListener("input", changeRespawnTime);

// -- Change Target size
targetSizeEl.addEventListener("input", setTargetWidth);

// -- Change Toggle menu
btnToggleMenu.addEventListener("click", () => {
  navbarEl.classList.toggle("open-menu");
});

// ********************
// -- Timer feature
// ********************

// ********************
// -- TODO:
// ********************
// [+] Create 'new game' button
//  [+] show it when game loads
//  [] when pressed start the game
// [] When timer out of time the game will:
//  [] stop
//  [] show a modal window
//  [] with accuracy, target hits, and missed
//  [] below will show the 'new game button'

// ********************
// -- New game button
// ********************

let startGame = false;
let timer = 10;

const timerEl = document.getElementById("timer");

const newGameBtnEl = document.createElement("button");

newGameBtnEl.innerText = "New Game";
newGameBtnEl.classList.add("btn--new-game");
newGameBtnEl.id = "new-game";

boardEl.appendChild(newGameBtnEl);

newGameBtnEl.addEventListener("click", () => {
  startGame = true;

  boardEl.innerHTML = "";

  // boardEl.removeChild(newGameBtnEl);

  const timerInterval = setInterval(() => {
    timerEl.innerHTML = --timer;
  }, 1000);

  setTimeout(() => {
    clearInterval(timerInterval);
    clearInterval(respawnTargetInterval);

    boardEl.removeEventListener("mousedown", missedTargetLogic);
    boardEl.removeEventListener("contextmenu", missedTargetLogic);

    // remove all from board
    boardEl.innerHTML = ``;

    const resultEl = document.createElement("div");

    resultEl.innerHTML = `
      <div class="result-container">
        <div>
          <span>Score:</span><span>${score}</span>
        </div>
        <div>
          <span>Hit:</span><span id="hit" class="result--hit">${hittedTargetsCounter}</span>
        </div>
        <div>
          <span>Missed:</span>
          <span id="missed" class="result--missed">${missedTargetsCounter}</span>
        </div>
        <div>
          <span>Accurracy:</span>
          <span id="accuracy" class="result--accuracy">50%</span>
        </div>
      </div>
    `;

    boardEl.appendChild(resultEl);

    boardEl.appendChild(newGameBtnEl);

    startGame = false;
    timerEl.innerText = timer = 10;
    missEl.innerText = missedTargetsCounter = 0;
    scoreEl.innerText = score = 0;
    updateScoreStatus();
  }, 10000); // 10s

  // -- Updates every "n" millisecons
  respawnTargetInterval = setInterval(checkTargets, targetRespawnTime);

  // -- Missed target left click
  boardEl.addEventListener("mousedown", missedTargetLogic);

  // -- Missed target right click
  boardEl.addEventListener("contextmenu", missedTargetLogic);
});

// *******************
// -- Functions
// *******************
const randomId = () => Math.random().toString();

const randomNumberBetweenMinMax = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function randomCoordinate(max) {
  // to not get a random number above the limit of the board width/height
  const top = max - targetWidth;
  return Math.floor(Math.random() * top + 1);
}

function checkTargets() {
  const numberOfTargets = boardEl.querySelectorAll(".target").length;

  if (numberOfTargets < numberOfTargetsLimit) {
    createTarget(
      randomCoordinate(boardEl.offsetWidth),
      randomCoordinate(boardEl.offsetHeight)
    );
  }

  const targetsArray = boardEl.querySelectorAll(".target");
  for (let i = 0; i < targetsArray.length; i++) {
    changeTargetWidth(targetsArray[i]);
    moveTargetOnTheBoard(targetsArray[i]);
  }
}

function updateScore(points) {
  if (points > 0) {
    score += points;
    updateScoreStatus("add", points);
  }
  if (points < 0) {
    score -= -points;
    updateScoreStatus("substract", points);
  }

  scoreEl.innerText = score;
}

function updateScoreStatus(className, points) {
  // if no class then remove and set score status to ''
  if (className === undefined) {
    scoreStatusEl.classList.remove("substract");
    scoreStatusEl.classList.remove("add");
    scoreStatusEl.innerText = "";
    return;
  }

  if (className === "add") {
    scoreStatusEl.classList.remove("substract");
    scoreStatusEl.classList.add("add");
    scoreStatusEl.innerText = "+" + points;
  }
  if (className === "substract") {
    scoreStatusEl.classList.remove("add");
    scoreStatusEl.classList.add("substract");
    scoreStatusEl.innerText = points;
  }
}

function targetLogic(target) {
  updateScore(target.value);

  boardEl.removeChild(target);

  hittedTargetsCounter++;
}

function createTarget(x, y) {
  const target = document.createElement("div");

  // generate a number between 1 and 9
  let targetLifeSpan = randomNumberBetweenMinMax(1000, 9000);

  let currentPoints = Math.round(targetLifeSpan / 1000);

  const lostPoints = currentPoints;

  target.className = "target";

  target.style.left = x + "px";
  target.style.top = y + "px";

  target.id = "target-" + randomId();

  target.innerHTML = innerTargetHTML(currentPoints, lostPoints);

  changeTargetWidth(target);

  target.value = currentPoints;

  boardEl.appendChild(target);

  setTimeout(() => {
    if (boardEl.contains(target)) {
      boardEl.removeChild(target);

      // if not clicked in time you lose points
      updateScore(-lostPoints);

      missedTargetsCounter++;

      missEl.innerText = missedTargetsCounter;
    }
  }, targetLifeSpan);

  setInterval(() => {
    target.value = --currentPoints;

    target.innerHTML = innerTargetHTML(currentPoints, lostPoints);
  }, 1000);

  // Left click target
  target.addEventListener("click", (event) => {
    event.stopPropagation();

    targetLogic(target);
  });

  // Right click target
  target.addEventListener("contextmenu", (event) => {
    event.stopPropagation();

    event.preventDefault();

    targetLogic(target);
  });

  // target.addEventListener("mousedown", targetLogic);
  // target.addEventListener("contextmenu", targetLogic);
}

function innerTargetHTML(currentPoints, lostPoints) {
  return `
    <span class="target--current-points">
      +${currentPoints}
    </span>
    <span class="target--lose-points">
      -${lostPoints}
    </span> 
    `;
}

function missedTargetLogic(e) {
  e.preventDefault();

  console.log(`🗑️🗑️🗑️🗑️🗑️`);

  missedTargetsCounter++;
  missEl.innerText = missedTargetsCounter;

  createMissedTarget(e.offsetX, e.offsetY);
}

function createMissedTarget(x, y) {
  const missEl = document.createElement("div");

  missEl.style.left = x + "px";
  missEl.style.top = y + "px";

  missEl.className = "miss";
  missEl.id = randomId();

  boardEl.appendChild(missEl);

  // -- Auto-remove after 10s
  setTimeout(() => {
    boardEl.removeChild(missEl);
  }, 10000);
}

function changeTargetWidth(target) {
  target.style.width = targetWidth + "px";
  target.style.height = targetWidth + "px";

  target.style.fontSize = targetWidth / 2 + "px";
}

function moveTargetOnTheBoard(target) {
  if (target.offsetWidth + target.offsetLeft > boardEl.offsetWidth) {
    target.style.left = boardEl.offsetWidth - target.offsetWidth + "px";
  }
  if (target.offsetHeight + target.offsetTop > boardEl.offsetHeight) {
    target.style.top = boardEl.offsetHeight - target.offsetHeight + "px";
  }
}

function changeTargetsNumber() {
  numberOfTargetsLimit = targetsCurrentValueEl.value;
  numberOfTargetsEl.innerText = numberOfTargetsLimit;
}

function changeRespawnTime() {
  targetRespawnTime = respawnValueEl.value;

  respawnCurrentValueEl.innerText = targetRespawnTime;

  clearInterval(respawnTargetInterval);

  if (startGame) {
    respawnTargetInterval = setInterval(checkTargets, targetRespawnTime);
  }
}

function setTargetWidth() {
  targetWidth = targetSizeEl.value;
  currentSizeValueEl.innerText = targetWidth;
}
