"use strict";

const gameEl = document.getElementById("game");
const scoreEl = document.getElementById("score");
const missEl = document.getElementById("miss");
const targetsCurrentValueEl = document.getElementById("targets--value");
const numberOfTargetsEl = document.getElementById("targets--number");
const respawnValueEl = document.getElementById("respawn--value");

const respawnCurrentValueEl = document.getElementById("respawn--current-value");

const targetSizeEl = document.getElementById("size--value");

const scoreStatusEl = document.getElementById("score--status");

const targets = [];
let score = 0;
let missCounter = 0;
let respawnTargetInterval;
let targetRespawnTime = 1000; // milliseconds

let targetWidth = 40; // px

let numberOfTargetsLimit = 8;

targetsCurrentValueEl.min = 1;
targetsCurrentValueEl.max = 20;
targetsCurrentValueEl.value = numberOfTargetsLimit;
numberOfTargetsEl.innerText = numberOfTargetsLimit;

const randomNumberBetweenMinMax = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const randomCoordinate = (max) => {
  // to not get a random number above the limit of the board width/height
  const top = max - targetWidth;
  return Math.floor(Math.random() * top + 1);
};

const randomId = () => Math.random().toString();

const updateScore = (points) => {
  if (points === 0) {
    score = 0;

    scoreEl.innerText = score;

    updateScoreStatus();
    return;
  }

  score += points;

  scoreEl.innerText = score;

  updateScoreStatus("add", points);
};

function updateScoreStatus(className, score) {
  if (className === undefined) {
    scoreStatusEl.classList.remove("substract");
    scoreStatusEl.classList.remove("add");
    scoreStatusEl.innerText = "";
    return;
  }

  if (className === "add") {
    scoreStatusEl.classList.remove("substract");
    scoreStatusEl.classList.add("add");
    scoreStatusEl.innerText = "+ " + score;
  } else if (className === "substract") {
    scoreStatusEl.classList.remove("add");
    scoreStatusEl.classList.add("substract");
    scoreStatusEl.innerText = "- " + score;
  }
}

function targetLogic(target) {
  updateScore(target.value);

  gameEl.removeChild(target);
}

function createTarget(x, y) {
  const target = document.createElement("div");

  // generate a number between 1 and 9
  let targetLifeSpan = randomNumberBetweenMinMax(1000, 9000);

  let currentPoints = Math.round(targetLifeSpan / 1000);

  const losePoints = currentPoints;

  target.className = "target";
  console.log(gameEl.offsetWidth);

  target.style.left = x + "px";
  target.style.top = y + "px";

  target.id = "target-" + randomId();

  target.innerHTML = innerTargetHTML(currentPoints, losePoints);

  changeTargetWidth(target);

  target.value = currentPoints;

  gameEl.appendChild(target);

  setTimeout(() => {
    if (gameEl.contains(target)) {
      gameEl.removeChild(target);

      // if not clicked in time you lose points
      countMisses(losePoints);
    }
  }, targetLifeSpan);

  setInterval(() => {
    target.value = --currentPoints;

    target.innerHTML = innerTargetHTML(currentPoints, losePoints);
  }, 1000);

  // Click and right click for targets

  target.addEventListener("click", (event) => {
    event.stopPropagation();

    targetLogic(target);
  });

  // Right click support
  target.addEventListener("contextmenu", (event) => {
    event.preventDefault();

    targetLogic(event, target);
  });
}

function innerTargetHTML(currentPoints, losePoints) {
  return `
    <span class="target--current-points">
      +${currentPoints}
    </span>
    <span class="target--lose-points">
      -${losePoints}
    </span> 
    `;
}

// Click and right click support for Missed targets

gameEl.addEventListener("click", (e) => missedTargetLogic(e));
gameEl.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  missedTargetLogic(e);
});

function missedTargetLogic(e) {
  createMissedTarget(e.offsetX, e.offsetY);
  countMisses();
}

function createMissedTarget(x, y) {
  const missEl = document.createElement("div");

  missEl.style.left = x + "px";
  missEl.style.top = y + "px";

  missEl.className = "miss";
  missEl.id = randomId();

  gameEl.appendChild(missEl);

  setTimeout(() => {
    gameEl.removeChild(missEl);
  }, 10000);
}

function countMisses(points) {
  missEl.innerText = ++missCounter;

  if (score - points > 0) {
    updateScore(-points);

    updateScoreStatus("substract", points);
  } else if (score - points <= 0) {
    updateScore(0);
  }
}

// Updates every n millisecons

respawnTargetInterval = setInterval(checkNumberOfTargets, targetRespawnTime);

function checkNumberOfTargets() {
  const numberOfTargets = gameEl.querySelectorAll(".target").length;

  if (numberOfTargets < numberOfTargetsLimit)
    createTarget(
      randomCoordinate(gameEl.offsetWidth),
      randomCoordinate(gameEl.offsetHeight)
    );

  const targetsArray = gameEl.querySelectorAll(".target");
  for (let i = 0; i < targetsArray.length; i++) {
    changeTargetWidth(targetsArray[i]);
    moveTargetOnTheBoard(targetsArray[i]);
  }
}

function changeTargetWidth(target) {
  target.style.width = targetWidth + "px";
  target.style.height = targetWidth + "px";

  target.style.fontSize = targetWidth / 2 + "px";
}

function moveTargetOnTheBoard(target) {
  if (target.offsetWidth + target.offsetLeft > gameEl.offsetWidth) {
    target.style.left = gameEl.offsetWidth - target.offsetWidth + "px";
  }
  if (target.offsetHeight + target.offsetTop > gameEl.offsetHeight) {
    target.style.top = gameEl.offsetHeight - target.offsetHeight + "px";
  }
}

// Increment/Decrement feature

targetsCurrentValueEl.addEventListener("input", changeTargetsNumber);

function changeTargetsNumber() {
  numberOfTargetsLimit = targetsCurrentValueEl.value;
  numberOfTargetsEl.innerText = numberOfTargetsLimit;
}

// Respawn target feature

respawnValueEl.min = 1;
respawnValueEl.max = 2000;
respawnValueEl.value = targetRespawnTime;
respawnCurrentValueEl.innerText = targetRespawnTime;

respawnValueEl.addEventListener("input", changeRespawnTime);

function changeRespawnTime() {
  targetRespawnTime = respawnValueEl.value;

  respawnCurrentValueEl.innerText = targetRespawnTime;

  clearInterval(respawnTargetInterval);

  respawnTargetInterval = setInterval(checkNumberOfTargets, targetRespawnTime);
}

// target size

targetSizeEl.min = 10;
targetSizeEl.max = 120;
targetSizeEl.step = 1;
targetSizeEl.value = targetWidth;

targetSizeEl.addEventListener("input", setTargetWidth);

const currentSizeValueEl = document.getElementById("size--current-value");
currentSizeValueEl.innerText = targetWidth + " px";

function setTargetWidth() {
  targetWidth = targetSizeEl.value;
  currentSizeValueEl.innerText = targetWidth + " px";
}

// toggle menu
const navbarEl = document.querySelector(".navbar");
const btnToggleMenu = document.querySelector(".btn-toggle-menu");

btnToggleMenu.addEventListener("click", () => {
  navbarEl.classList.toggle("open-menu");
});
