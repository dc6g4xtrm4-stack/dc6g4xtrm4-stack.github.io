// Pong Game - Player vs AI with progressive difficulty
// Ball speeds up progressively over time

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
      speedY: 5,
      baseSpeed: 5,
      maxSpeed: 14
    },
    playerPaddle: {
      x: canvas.width - 30,
      y: canvas.height / 2 - 60,
      width: 15,
      height: 120,
      speed: 9
    },
    aiPaddle: {
      x: 15,
      y: canvas.height / 2 - 60,
      width: 15,
      height: 120,
      speed: 6,
      difficulty: 1
    },
    mouseY: canvas.height / 2,
    playerScore: 0,
    aiScore: 0,
    gameRunning: false,
    gameTime: 0,
    bounceCount: 0,
    difficulty: 1
  };
  
  // Setup event listeners
  document.addEventListener("mousemove", (e) => {
    if (!pongGame) return;
    const rect = pongGame.canvas.getBoundingClientRect();
    pongGame.mouseY = e.clientY - rect.top;
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === " ") {
      e.preventDefault();
      if (pongGame) pongGame.gameRunning = !pongGame.gameRunning;
    }
  });
  
  const resetBtn = document.getElementById("pongResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", resetPong);
  }
  
  // Start game loop
  pongGameLoop();
}

function pongGameLoop() {
  if (!pongGame) return;
  
  const { ctx, width, height, ball, playerPaddle, aiPaddle, gameRunning } = pongGame;
  
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
    pongGame.gameTime += 1;
    
    // Increase difficulty: 1.2x speed after each bounce
    pongGame.difficulty = Math.pow(1.2, pongGame.bounceCount);
    
    // Update AI difficulty
    aiPaddle.difficulty = Math.min(pongGame.difficulty * 0.8, 2);
    
    // Move player paddle to follow mouse
    const playerCenter = playerPaddle.y + playerPaddle.height / 2;
    const playerTarget = pongGame.mouseY - playerPaddle.height / 2;
    const playerDiff = playerTarget - playerPaddle.y;
    playerPaddle.y += playerDiff * 0.15; // Smooth movement
    playerPaddle.y = Math.max(0, Math.min(height - playerPaddle.height, playerPaddle.y));
    
    // Move AI paddle with imperfect tracking
    const aiCenter = aiPaddle.y + aiPaddle.height / 2;
    const aiTarget = ball.y - aiPaddle.height / 2;
    const distance = Math.abs(aiCenter - ball.y);
    
    // AI makes mistakes based on ball distance and difficulty
    let aiSpeed = aiPaddle.speed * (0.7 + aiPaddle.difficulty * 0.3);
    const predictedY = aiTarget + (Math.random() - 0.5) * (100 / aiPaddle.difficulty);
    
    if (aiCenter < predictedY - 10) {
      aiPaddle.y = Math.min(height - aiPaddle.height, aiPaddle.y + aiSpeed);
    } else if (aiCenter > predictedY + 10) {
      aiPaddle.y = Math.max(0, aiPaddle.y - aiSpeed);
    }
    
    // Update ball with progressive speed
    const currentBaseSpeed = ball.baseSpeed * pongGame.difficulty;
    const speedMagnitude = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
    
    // Normalize and apply new speed
    if (speedMagnitude > 0) {
      ball.speedX = (ball.speedX / speedMagnitude) * Math.min(currentBaseSpeed, ball.maxSpeed);
      ball.speedY = (ball.speedY / speedMagnitude) * Math.min(currentBaseSpeed, ball.maxSpeed);
    }
    
    ball.x += ball.speedX;
    ball.y += ball.speedY;
    
    // Ball collision with top/bottom
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
      ball.speedY *= -1;
      ball.y = Math.max(ball.radius, Math.min(height - ball.radius, ball.y));
    }
    
    // Ball collision with player paddle (right)
    if (ball.x + ball.radius > playerPaddle.x &&
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y && ball.y < playerPaddle.y + playerPaddle.height) {
      ball.speedX *= -1;
      ball.x = playerPaddle.x - ball.radius;
      
      // Add angle based on where ball hits paddle
      const hitPos = (ball.y - playerPaddle.y) / playerPaddle.height;
      const angle = (hitPos - 0.5) * 0.6;
      const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
      ball.speedY = Math.sin(angle) * speed * 0.8;
      
      pongGame.bounceCount++;
    }
    
    // Ball collision with AI paddle (left)
    if (ball.x - ball.radius < aiPaddle.x + aiPaddle.width &&
        ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y && ball.y < aiPaddle.y + aiPaddle.height) {
      ball.speedX *= -1;
      ball.x = aiPaddle.x + aiPaddle.width + ball.radius;
      
      // Add angle based on where ball hits paddle
      const hitPos = (ball.y - aiPaddle.y) / aiPaddle.height;
      const angle = (hitPos - 0.5) * 0.6;
      const speed = Math.sqrt(ball.speedX ** 2 + ball.speedY ** 2);
      ball.speedY = Math.sin(angle) * speed * 0.8;
      
      pongGame.bounceCount++;
    }
    
    // Scoring - miss on left or right
    if (ball.x < 0) {
      pongGame.playerScore++;
      resetBall();
    }
    if (ball.x > width) {
      pongGame.aiScore++;
      resetBall();
    }
  }
  
  // Draw AI paddle
  ctx.fillStyle = "#4ECDC4";
  ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
  
  // Draw player paddle
  ctx.fillStyle = "#FF6B6B";
  ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
  
  // Draw ball
  ctx.fillStyle = "#f5f5f5";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw scores
  ctx.fillStyle = "#4ECDC4";
  ctx.font = "28px Arial";
  ctx.textAlign = "left";
  ctx.fillText(pongGame.aiScore, width / 4 - 30, 40);
  
  ctx.fillStyle = "#FF6B6B";
  ctx.textAlign = "right";
  ctx.fillText(pongGame.playerScore, width - width / 4 + 30, 40);
  
  // Draw difficulty
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Difficulty: " + pongGame.difficulty.toFixed(2) + "x", width / 2, 40);
  
  // Draw status
  ctx.fillStyle = gameRunning ? "#90EE90" : "#FFB6C1";
  ctx.font = "13px Arial";
  ctx.fillText(gameRunning ? "PLAYING (SPACE to pause) | Move mouse to control paddle" : "PAUSED (SPACE to play)", width / 2, height - 15);
  
  // Update sidebar stats
  const playerScoreEl = document.getElementById("playerPongScore");
  const aiScoreEl = document.getElementById("aiPongScore");
  const diffLevelEl = document.getElementById("diffLevel");
  const maxSpeedEl = document.getElementById("maxSpeed");
  
  if (playerScoreEl) playerScoreEl.textContent = pongGame.playerScore;
  if (aiScoreEl) aiScoreEl.textContent = pongGame.aiScore;
  if (diffLevelEl) diffLevelEl.textContent = pongGame.difficulty.toFixed(2) + "x";
  if (maxSpeedEl) {
    const currentSpeed = Math.min(pongGame.ball.baseSpeed * pongGame.difficulty, pongGame.ball.maxSpeed);
    maxSpeedEl.textContent = currentSpeed.toFixed(1) + " px/f";
  }
  
  requestAnimationFrame(pongGameLoop);
}

function resetBall() {
  if (!pongGame) return;
  pongGame.ball.x = pongGame.width / 2;
  pongGame.ball.y = pongGame.height / 2;
  pongGame.ball.speedX = (Math.random() > 0.5 ? 1 : -1) * pongGame.ball.baseSpeed;
  pongGame.ball.speedY = (Math.random() - 0.5) * pongGame.ball.baseSpeed;
  pongGame.bounceCount = 0;
}

function resetPong() {
  pongGame = null;
  initPong();
}