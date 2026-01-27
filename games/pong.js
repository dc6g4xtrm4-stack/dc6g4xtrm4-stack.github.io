// Pong Game Template
// Basic implementation with two paddles and a ball

let pongGame = null;

function initPong() {
  const canvas = document.getElementById("pongCanvas");
  if (!canvas || pongGame) return; // Only initialize once
  
  const ctx = canvas.getContext("2d");
  
  pongGame = {
    canvas: canvas,
    ctx: ctx,
    width: canvas.width,
    height: canvas.height,
    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 8,
      speedX: 5,
      speedY: 5
    },
    paddle1: {
      x: 10,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      speed: 7,
      dy: 0
    },
    paddle2: {
      x: canvas.width - 20,
      y: canvas.height / 2 - 50,
      width: 10,
      height: 100,
      speed: 7,
      dy: 0
    },
    score1: 0,
    score2: 0,
    gameRunning: false,
    keys: {}
  };
  
  // Setup event listeners
  document.addEventListener("keydown", (e) => {
    pongGame.keys[e.key] = true;
    if (e.key === " ") {
      e.preventDefault();
      pongGame.gameRunning = !pongGame.gameRunning;
    }
  });
  
  document.addEventListener("keyup", (e) => {
    pongGame.keys[e.key] = false;
  });
  
  document.getElementById("pongResetBtn").addEventListener("click", resetPong);
  
  // Start game loop
  pongGameLoop();
}

function pongGameLoop() {
  if (!pongGame) return;
  
  const { ctx, width, height, ball, paddle1, paddle2, gameRunning } = pongGame;
  
  // Clear canvas
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);
  
  // Draw center line
  ctx.strokeStyle = "#3b82f6";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(width / 2, 0);
  ctx.lineTo(width / 2, height);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Update game if running
  if (gameRunning) {
    // Handle paddle movement
    if (pongGame.keys["w"] || pongGame.keys["W"] || pongGame.keys["ArrowUp"]) {
      paddle1.y = Math.max(0, paddle1.y - paddle1.speed);
    }
    if (pongGame.keys["s"] || pongGame.keys["S"] || pongGame.keys["ArrowDown"]) {
      paddle1.y = Math.min(height - paddle1.height, paddle1.y + paddle1.speed);
    }
    
    // AI for paddle 2
    const paddle2Center = paddle2.y + paddle2.height / 2;
    if (paddle2Center < ball.y - 20) {
      paddle2.y = Math.min(height - paddle2.height, paddle2.y + paddle2.speed);
    } else if (paddle2Center > ball.y + 20) {
      paddle2.y = Math.max(0, paddle2.y - paddle2.speed);
    }
    
    // Update ball
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with top/bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
      ball.speedY *= -1;
    }
    
    // Ball collision with paddles
    if (ball.x - ball.radius < paddle1.x + paddle1.width &&
        ball.y > paddle1.y && ball.y < paddle1.y + paddle1.height) {
      ball.speedX *= -1;
      ball.x = paddle1.x + paddle1.width + ball.radius;
    }
    
    if (ball.x + ball.radius > paddle2.x &&
        ball.y > paddle2.y && ball.y < paddle2.y + paddle2.height) {
      ball.speedX *= -1;
      ball.x = paddle2.x - ball.radius;
    }
    
    // Scoring
    if (ball.x < 0) {
      pongGame.score2++;
      resetBall();
    }
    if (ball.x > width) {
      pongGame.score1++;
      resetBall();
    }
  }
  
  // Draw paddles
  ctx.fillStyle = "#4ECDC4";
  ctx.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
  
  // Draw ball
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw score
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "24px Arial";
  ctx.textAlign = "center";
  ctx.fillText(pongGame.score1, width / 4, 30);
  ctx.fillText(pongGame.score2, (width * 3) / 4, 30);
  
  // Draw status
  ctx.fillStyle = "#a0a0a0";
  ctx.font = "14px Arial";
  ctx.fillText(gameRunning ? "Playing (Press SPACE to pause)" : "Paused (Press SPACE to play)", width / 2, height - 10);
  
  requestAnimationFrame(pongGameLoop);
}

function resetBall() {
  if (!pongGame) return;
  pongGame.ball.x = pongGame.width / 2;
  pongGame.ball.y = pongGame.height / 2;
  pongGame.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
  pongGame.ball.speedY = (Math.random() - 0.5) * 5;
}

function resetPong() {
  if (pongGame) {
    pongGame.score1 = 0;
    pongGame.score2 = 0;
    pongGame.gameRunning = false;
    resetBall();
  }
}