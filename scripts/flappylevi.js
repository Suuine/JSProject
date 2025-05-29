let boardW = 600;
let boardH = 500;

let canvas;
let ctx;
let scale = 1;

let playerW = 32;
let playerH = 40;
let playerX = boardW / 8;
let playerY = boardH / 2;
let playerImg;

let player = {
  x: playerX,
  y: playerY,
  w: playerW,
  h: playerH,
};

let pipes = [];
let pipeW = 64;
let pipeH = 512;

let topPipeImg;
let bottomPipeImg;

let baseSpeedX = -2;
let speedX = baseSpeedX;
let speedY = 0;
let gravity = 0.4;

let isGameOver = false;
let score = 0;
let gameTime = 0;

let hitSound = new Audio("resources/playervoice.mp3");
let bgm = new Audio("resources/bfx.mp3");
bgm.loop = true;

let gameOverMenu;
let finalScoreText;
let restartBtn;

let startMenu;
let startButton;

let animFrameId;
let spawnIntervalId;

function startGameButton() {
  document.body.style.scrollBehavior = "smooth";
  document.body.style.overflow = "hidden";

  const gameOverlay = document.createElement("div");
  gameOverlay.id = "gameOverlay";

  const closeButton = document.createElement("button");
  closeButton.id = "closeButton";
  closeButton.textContent = "Close";

  closeButton.addEventListener("click", () => {
    document.body.removeChild(gameOverlay);
    if (animFrameId) cancelAnimationFrame(animFrameId);
    if (spawnIntervalId) clearInterval(spawnIntervalId);
    bgm.pause();
    bgm.currentTime = 0;
    window.removeEventListener("resize", setCanvasSize);
    document.removeEventListener("keydown", controlPlayer);
    document.body.style.scrollBehavior = "";
    document.body.style.overflow = "";
  });

  const gameContent = document.createElement("div");
  gameContent.id = "flappyLeviGame";
  gameContent.innerHTML = `
        <div id="gameContainer">
            <canvas id="board"></canvas>
            <div id="scoreDisplay">0</div>
        </div>
        <div id="startMenu" class="active">
            <h3>🚀 Flappy Levi 🚀</h3>
            <button id="startButton">Почати гру</button>
        </div>
        <div id="gameOverMenu" class="hidden">
            <h3 id="gameOverText">👻Ви програли👻</h3>
            <p class="final-score-label">Ваші очки:</p>
            <p id="finalScore">0</p>
            <button id="restartButton">Почати знову</button>
        </div>
    `;

  gameOverlay.appendChild(closeButton);
  gameOverlay.appendChild(gameContent);
  document.body.appendChild(gameOverlay);

  StartGame();
}

const StartGame = () => {
  canvas = document.getElementById("board");
  ctx = canvas.getContext("2d");

  setCanvasSize();
  window.addEventListener("resize", setCanvasSize);

  gameOverMenu = document.getElementById("gameOverMenu");
  finalScoreText = document.getElementById("finalScore");
  restartBtn = document.getElementById("restartButton");

  startMenu = document.getElementById("startMenu");
  startButton = document.getElementById("startButton");

  restartBtn.addEventListener("click", restartGame);
  startButton.addEventListener("click", () => {
    startMenu.classList.remove("active");
    startMenu.style.display = "none";
    startGame();
  });

  playerImg = new Image();
  playerImg.src = "resources/player2.png";
  playerImg.onload = function () {
    ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
  };

  topPipeImg = new Image();
  topPipeImg.src = "resources/pillar.jpg";

  bottomPipeImg = new Image();
  bottomPipeImg.src = "resources/pillar.jpg";

  document.addEventListener("keydown", controlPlayer);
};

function setCanvasSize() {
  const aspectRatio = boardW / boardH;
  let newW = window.innerWidth;
  let newH = window.innerHeight;

  if (newW / newH > aspectRatio) {
    newW = newH * aspectRatio;
  } else {
    newH = newW / aspectRatio;
  }

  canvas.width = newW;
  canvas.height = newH;
  scale = canvas.height / boardH;
}

function startGame() {
  isGameOver = false;
  score = 0;
  gameTime = 0;
  speedX = baseSpeedX;
  speedY = 0;
  player.y = playerY;
  pipes = [];

  if (bgm.paused) {
    bgm.currentTime = 1.5;
    bgm.play();
  }

  animFrameId = requestAnimationFrame(update);

  if (spawnIntervalId) clearInterval(spawnIntervalId);
  spawnIntervalId = setInterval(spawnPipes, 1500);

  gameOverMenu.classList.remove("active");
  gameOverMenu.style.display = "none";
}

function update() {
  animFrameId = requestAnimationFrame(update);

  if (isGameOver) {
    cancelAnimationFrame(animFrameId);

    if (!bgm.paused) {
      bgm.pause();
      bgm.currentTime = 0;
    }

    if (!gameOverMenu.classList.contains("active")) {
      gameOverMenu.classList.add("active");
      gameOverMenu.style.display = "block";
      finalScoreText.textContent = Math.floor(score);
    }

    if (spawnIntervalId) {
      clearInterval(spawnIntervalId);
      spawnIntervalId = null;
    }

    return;
  }

  gameTime++;
  speedX = baseSpeedX - Math.floor(gameTime / 600) * 0.2;
  speedX = Math.max(speedX, -8);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(scale, scale);

  speedY += gravity;
  player.y = Math.max(player.y + speedY, 0);
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);

  if (player.y > boardH) {
    isGameOver = true;
  }

  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    pipe.x += speedX;
    ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.w, pipe.h);

    if (!pipe.passed && player.x > pipe.x + pipe.w) {
      score += 0.5;
      pipe.passed = true;
    }

    if (detectCollision(player, pipe)) {
      hitSound.currentTime = 0;
      hitSound.play();
      isGameOver = true;
    }
  }

  while (pipes.length > 0 && pipes[0].x < -pipeW) {
    pipes.shift();
  }

  document.getElementById("scoreDisplay").textContent = Math.floor(score);

  ctx.restore();
}

function spawnPipes() {
  if (isGameOver) return;
  let gap = boardH / 4;
  const padTop = 70;
  const padBottom = 70;
  let minY = padTop + gap / 2;
  let maxY = boardH - padBottom - gap / 2;

  if (minY >= maxY) {
    maxY = minY + 1;
    if (maxY > boardH - padBottom) {
      maxY = boardH - padBottom - gap / 2;
      if (minY >= maxY) {
        minY = boardH / 2 - gap / 2;
        maxY = boardH / 2 + gap / 2;
      }
    }
  }

  let centerY = Math.random() * (maxY - minY) + minY;
  let topY = centerY - gap / 2 - pipeH;
  let bottomY = centerY + gap / 2;

  pipes.push({
    img: topPipeImg,
    x: boardW,
    y: topY,
    w: pipeW,
    h: pipeH,
    passed: false,
  });

  pipes.push({
    img: bottomPipeImg,
    x: boardW,
    y: bottomY,
    w: pipeW,
    h: pipeH,
    passed: false,
  });
}

function controlPlayer(e) {
  if (
    !isGameOver &&
    (e.code === "Space" || e.code === "KeyX" || e.code === "ArrowUp")
  ) {
    speedY = -6;

    if (bgm.paused) {
      bgm.currentTime = 1.5;
      bgm.play();
    }
  }
}

function restartGame() {
  gameOverMenu.classList.remove("active");
  gameOverMenu.style.display = "none";

  hitSound.pause();
  hitSound.currentTime = 0;

  player.y = playerY;
  speedY = 0;
  pipes = [];
  score = 0;
  gameTime = 0;
  speedX = baseSpeedX;
  isGameOver = false;

  if (bgm.paused) {
    bgm.currentTime = 1.5;
    bgm.play();
  }

  animFrameId = requestAnimationFrame(update);

  if (spawnIntervalId) clearInterval(spawnIntervalId);
  spawnIntervalId = setInterval(spawnPipes, 1500);
}

function detectCollision(a, b) {
  let paddingX = a.w * 0.05;
  let paddingY = a.h * 0.01;

  let ax = a.x + paddingX;
  let ay = a.y + paddingY;
  let aw = a.w - paddingX * 2;
  let ah = a.h - paddingY * 2;

  return ax < b.x + b.w && ax + aw > b.x && ay < b.y + b.h && ay + ah > b.y;
}
