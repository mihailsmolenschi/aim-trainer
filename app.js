"use strict";

const gameEl = document.getElementById("game");
const scoreEl = document.getElementById("score");
const missEl = document.getElementById("miss");

const decrementTargetsEl = document.getElementById("targets-decrement");
const incrementTargetsEl = document.getElementById("targets-increment");
const numberOfTargets = document.getElementById("targets-number");
const respawnValueEl = document.getElementById("respawn--value");

const respawnCurrentValueEl = document.getElementById("respawn--current-value");

const scoreStatusEl = document.getElementById("score--status");

const targets = [];
let score = 0;
let missCounter = 0;
let numberOfTargetsLimit = 8;
let respawnTargetInterval;
let targetRespawnTime = 1000; // milliseconds

numberOfTargets.innerText = numberOfTargetsLimit;

const randN = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const randomCoordinate = () => Math.floor(Math.random() * 90);

const randomId = () => Math.random().toString();

const updateScore = (currentScore) => {
  if (currentScore > 0) {
    score += currentScore;

    scoreEl.innerText = score;

    updateScoreStatus("add", currentScore);
  } else if (currentScore === 0) {
    score = 0;

    scoreEl.innerText = score;

    updateScoreStatus();
  }
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

const targetLogic = (event, target) => {
  event.stopPropagation();
  updateScore(Number(target.innerText));
  // scoreStatusEl.classList.add("add");
  gameEl.removeChild(target);
};

function createTarget(x, y) {
  const target = document.createElement("div");

  // generate a number between 1 and 10
  let targetLifeSpan = randN(1000, 10000);

  let internalScore = Math.round(targetLifeSpan / 1000);

  const targetPoints = internalScore;

  target.className = "target";
  target.style.left = x + "%";
  target.style.top = y + "%";
  target.id = "target-" + randomId();
  target.innerText = internalScore;

  gameEl.appendChild(target);

  setTimeout(() => {
    if (gameEl.contains(target)) {
      gameEl.removeChild(target);

      // if not clicked in time you loose points
      countMisses(targetPoints);
    }
  }, targetLifeSpan);

  setInterval(() => {
    target.innerText = --internalScore;
  }, 1000);

  target.addEventListener("click", (event) => targetLogic(event, target));
  // Right click support
  target.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    targetLogic(event, target);
  });
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
    createTarget(randomCoordinate(), randomCoordinate());
}

// Increment/Decrement feature

decrementTargetsEl.addEventListener("click", decrementTargets);
incrementTargetsEl.addEventListener("click", incrementTargets);

function decrementTargets() {
  if (numberOfTargetsLimit === 1) return;

  numberOfTargets.innerText = --numberOfTargetsLimit;
}

function incrementTargets() {
  if (numberOfTargetsLimit >= 20) return;

  numberOfTargets.innerText = ++numberOfTargetsLimit;
}

// Respawn target feature

respawnValueEl.min = 1;
respawnValueEl.max = 2000;
respawnValueEl.value = targetRespawnTime;
respawnCurrentValueEl.innerText = targetRespawnTime;

respawnValueEl.addEventListener("click", changeRespawnTime);

function changeRespawnTime() {
  targetRespawnTime = respawnValueEl.value;

  respawnCurrentValueEl.innerText = targetRespawnTime;

  clearInterval(respawnTargetInterval);

  respawnTargetInterval = setInterval(checkNumberOfTargets, targetRespawnTime);
}
