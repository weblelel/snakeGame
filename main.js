const boardSize = 20, cellSize = 24;
const board = document.getElementById('game-board');
const scoreSpan = document.getElementById('score');
const finalScoreSpan = document.getElementById('final-score');
const mainMenu = document.getElementById('main-menu');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const menuBtn = document.getElementById('menu-btn');
const gameUI = document.getElementById('game-ui');
const gameOverOverlay = document.getElementById('game-over');
const musicToggleBtn = document.getElementById('music-toggle-btn');

const collectSF = new Audio('/collect.wav');
const deathSF = new Audio('/death.mp3');
const buttonSF = new Audio('/buttonSound.mp3');
const musicSF = new Audio('/music.mp3');
musicSF.loop = true;

let snake, direction, nextDirection, food, gameInterval, score, isAlive, canChangeDirection, musicOn = false;
let lastToggleTime = 0;

function setMusicState(on) {
  musicOn = on;
  if (musicOn) {
    if (musicSF.paused || musicSF.ended) {
      musicSF.currentTime = 0;
    }
    musicSF.play().catch(()=>{});
    musicToggleBtn.classList.add('on');
    musicToggleBtn.classList.remove('off');
    musicToggleBtn.textContent = '🔊 Music: On';
  } else {
    musicSF.pause();
    musicToggleBtn.classList.add('off');
    musicToggleBtn.classList.remove('on');
    musicToggleBtn.textContent = '🔈 Music: Off';
  }
}

musicToggleBtn.addEventListener('click', () => {
  const now = Date.now();
  if (now - lastToggleTime > 200) {
    playButtonSound();
    setMusicState(!musicOn);
    lastToggleTime = now;
  }
});

function show(el) {
  el.classList.remove('hidden');
  el.classList.add('active');
}

function hide(el) {
  el.classList.remove('active');
  el.classList.add('hidden');
}

function playButtonSound() {
  buttonSF.currentTime = 0;
  buttonSF.play();
}

function setupMenu() {
  show(mainMenu);
  hide(gameUI);
  hide(gameOverOverlay);
  setMusicState(musicOn);
}

function setupBoardGrid() {
  board.innerHTML = '';
  board.style.position = 'relative';
  board.style.width = (boardSize * cellSize) + 'px';
  board.style.height = (boardSize * cellSize) + 'px';
}

function setupGame() {
  const mid = Math.floor(boardSize / 2);
  snake = [{ x: mid, y: mid }, { x: mid, y: mid + 1 }];
  direction = { x: 0, y: -1 };
  nextDirection = { ...direction };
  score = 0;
  isAlive = true;
  canChangeDirection = true;
  updateScore();
  generateFood();
  setupBoardGrid();
  show(gameUI);
  hide(mainMenu);
  hide(gameOverOverlay);
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, 90);
  setMusicState(musicOn);
}

function gameLoop() {
  updateDirection();
  const head = snake[0];
  const newHead = { x: head.x + direction.x, y: head.y + direction.y };
  if (
    newHead.x < 0 || newHead.y < 0 ||
    newHead.x >= boardSize || newHead.y >= boardSize ||
    snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)
  ) {
    doGameOver();
    return;
  }
  snake.unshift(newHead);
  if (newHead.x === food.x && newHead.y === food.y) {
    score++;
    updateScore();
    showPlusOne();
    generateFood();
    collectSF.currentTime = 0;
    collectSF.play();
  } else {
    snake.pop();
  }
  requestAnimationFrame(draw);
  canChangeDirection = true;
}

function updateScore() {
  scoreSpan.textContent = score;
  scoreSpan.classList.remove('score-anim');
  // Force reflow
  void scoreSpan.offsetWidth;
  scoreSpan.classList.add('score-anim');
}

function draw() {
  // Use DocumentFragment to minimize DOM ops
  while (board.firstChild) board.removeChild(board.firstChild);
  const frag = document.createDocumentFragment();
  for (let i = 0; i < snake.length; i++) {
    const seg = snake[i], div = document.createElement('div');
    div.className = 'snake-shape' + (i === 0 ? ' snake-head' : '');
    div.style.left = (seg.x * cellSize) + 'px';
    div.style.top = (seg.y * cellSize) + 'px';
    div.style.width = cellSize + 'px';
    div.style.height = cellSize + 'px';
    frag.appendChild(div);
  }
  const foodDiv = document.createElement('div');
  foodDiv.className = 'food-shape';
  foodDiv.style.left = (food.x * cellSize) + 'px';
  foodDiv.style.top = (food.y * cellSize) + 'px';
  foodDiv.style.width = cellSize + 'px';
  foodDiv.style.height = cellSize + 'px';
  frag.appendChild(foodDiv);

  board.appendChild(frag);
}

function generateFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize)
    };
  } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
  food = pos;
}

function doGameOver() {
  clearInterval(gameInterval);
  isAlive = false;
  show(gameOverOverlay);
  hide(gameUI);
  finalScoreSpan.textContent = score;
  deathSF.currentTime = 0;
  deathSF.play();
}

function updateDirection() {
  // Prevent the snake from reversing
  if (nextDirection.x !== -direction.x || nextDirection.y !== -direction.y) {
    direction = nextDirection;
  }
}

function handleKey(e) {
  if (!isAlive || !canChangeDirection) return;
  let nd = nextDirection;
  switch (e.key) {
    case "ArrowUp": case "w": case "W": if (direction.y !== 1) nd = { x: 0, y: -1 }; break;
    case "ArrowDown": case "s": case "S": if (direction.y !== -1) nd = { x: 0, y: 1 }; break;
    case "ArrowLeft": case "a": case "A": if (direction.x !== 1) nd = { x: -1, y: 0 }; break;
    case "ArrowRight": case "d": case "D": if (direction.x !== -1) nd = { x: 1, y: 0 }; break;
    default: return;
  }
  if (nd !== nextDirection) {
    nextDirection = nd;
    canChangeDirection = false;
  }
}

[startBtn, restartBtn, menuBtn].forEach(btn => btn.addEventListener('click', playButtonSound));
startBtn.addEventListener('click', setupGame);
restartBtn.addEventListener('click', setupGame);
menuBtn.addEventListener('click', setupMenu);
window.addEventListener('keydown', handleKey);

setMusicState(false);
setupMenu();
function showPlusOne() {
  const plus = document.createElement('div');
  plus.className = 'plus-one';
  plus.innerText = '+1';

  // Calculate food's position relative to the board on screen
  const boardRect = board.getBoundingClientRect();
  const left = boardRect.left + (food.x + 0.5) * cellSize;
  const top = boardRect.top + (food.y + 0.5) * cellSize;

  plus.style.left = left + 'px';
  plus.style.top = top + 'px';
  plus.style.transform = 'translate(-50%, -50%)';

  document.body.appendChild(plus);

  plus.addEventListener('animationend', () => {
    plus.remove();
  });
}
