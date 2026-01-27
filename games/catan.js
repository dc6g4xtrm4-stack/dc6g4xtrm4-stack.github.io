// Catan-like Board Game Template
// This is a basic template structure for a Catan-style board game
// Expand this with resource tiles, settlements, roads, and trading logic

let catanGame = null;

function initCatan() {
  const canvas = document.getElementById("catanCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Initialize game state
  catanGame = {
    canvas: canvas,
    ctx: ctx,
    width: canvas.width,
    height: canvas.height,
    tiles: [],
    players: [
      { id: 1, color: "#FF6B6B", resources: { wood: 0, brick: 0, wheat: 0, sheep: 0, ore: 0 } },
      { id: 2, color: "#4ECDC4", resources: { wood: 0, brick: 0, wheat: 0, sheep: 0, ore: 0 } }
    ],
    currentPlayer: 0
  };
  
  // Setup event listeners
  document.getElementById("catanResetBtn").addEventListener("click", resetCatan);
  canvas.addEventListener("click", handleCatanClick);
  
  // Draw initial board
  drawCatanBoard();
}

function drawCatanBoard() {
  if (!catanGame) return;
  
  const { ctx, width, height } = catanGame;
  
  // Clear canvas
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, width, height);
  
  // Draw title
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Catan Board - Template", width / 2, 30);
  
  // Draw hexagonal grid template
  const hexSize = 40;
  const cols = 4;
  const rows = 3;
  
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * hexSize * 1.5 + 60;
      const y = row * hexSize * 1.75 + 80;
      drawHexagon(ctx, x, y, hexSize);
    }
  }
  
  // Draw game info
  ctx.fillStyle = "#a0a0a0";
  ctx.font = "14px Arial";
  ctx.textAlign = "left";
  ctx.fillText("Click to place settlements and roads", 20, height - 20);
  ctx.fillText("Build roads, settlements, and cities", 20, height - 40);
}

function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

function handleCatanClick(e) {
  if (!catanGame) return;
  
  const rect = catanGame.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // TODO: Implement click logic for placing settlements and roads
  console.log("Catan click at:", x, y);
}

function resetCatan() {
  if (catanGame) {
    catanGame.players.forEach(p => {
      p.resources = { wood: 0, brick: 0, wheat: 0, sheep: 0, ore: 0 };
    });
    drawCatanBoard();
  }
}