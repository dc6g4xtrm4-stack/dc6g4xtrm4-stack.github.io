// Modern Pirates - Board Game: Online Naval Conquest
// 80x40 grid, wind mechanics, tile-based islands, race to 25 points

let modernPiratesGame = null;
let gameRunning = false;
let gameLoop = null;
let currentGameId = null;
let currentPlayerId = null; // 1 or 2
let gameStorage = {}; // In-memory storage for game states

// Grid configuration
const GRID_WIDTH = 80;
const GRID_HEIGHT = 40;

// Wind direction in degrees (0=N, 90=E, 180=S, 270=W)
const WIND_DIRECTIONS = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
};

const ISLAND_TYPES = {
  HARBOR: { name: "Harbor", symbol: "🏚️", color: "#8B7355", points: 2, loot: [1, 2, 3] },
  RESOURCE: { name: "Resource", symbol: "💎", color: "#4CAF50", points: 1, loot: [1, 2] },
  TREASURE: { name: "Treasure", symbol: "🏴", color: "#FFD700", points: 3, loot: [3] },
  DANGER: { name: "Reef", symbol: "⚠️", color: "#FF6B6B", points: 0, damage: 20 }
};

const CARDS = {
  WIND_SHIFT: { name: "Wind Shift", cost: 0, effect: "Change wind" },
  SPEED_BOOST: { name: "Speed Boost", cost: 1, effect: "Move extra square" },
  TACK_ASSIST: { name: "Tack Assist", cost: 2, effect: "Tack easier" },
  TREASURE_MAP: { name: "Treasure Map", cost: 3, effect: "Reveal island" },
  RAMMING_SPEED: { name: "Ramming Speed", cost: 2, effect: "Attack bonus" }
};

// Storage & persistence
function saveGameToStorage(gameId, gameData) {
  try {
    const recentGames = JSON.parse(localStorage.getItem("piratesRecentGames") || "[]");
    const existingIndex = recentGames.findIndex(g => g.id === gameId);
    
    const gameEntry = {
      id: gameId,
      created: gameData.created,
      players: gameData.players,
      status: gameData.status,
      lastAccessed: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      recentGames[existingIndex] = gameEntry;
    } else {
      recentGames.unshift(gameEntry);
    }
    
    // Keep only last 5 games
    localStorage.setItem("piratesRecentGames", JSON.stringify(recentGames.slice(0, 5)));
  } catch (e) {
    console.log("Storage not available");
  }
}

function loadRecentGames() {
  try {
    const recentGames = JSON.parse(localStorage.getItem("piratesRecentGames") || "[]");
    const section = document.getElementById("recentGamesSection");
    const list = document.getElementById("recentGamesList");
    
    if (recentGames.length > 0 && section && list) {
      section.style.display = "block";
      list.innerHTML = recentGames.map(game => {
        const date = new Date(game.lastAccessed).toLocaleDateString();
        return `<div style="padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; margin-bottom: 6px; font-size: 12px; cursor: pointer;" class="recent-game-item" data-game-id="${game.id}">
          <strong>${game.id}</strong> - ${game.players} player${game.players > 1 ? 's' : ''} - ${date}
        </div>`;
      }).join("");
      
      // Add click handlers
      document.querySelectorAll(".recent-game-item").forEach(item => {
        item.addEventListener("click", function() {
          const gameId = this.getAttribute("data-game-id");
          document.getElementById("gameIdInput").value = gameId;
          document.getElementById("joinGameForm").style.display = "flex";
          document.getElementById("gameIdInput").focus();
        });
      });
    }
  } catch (e) {
    console.log("Could not load recent games:", e);
  }
}

// Game ID functions
function generateGameId() {
  return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

function showPiratesLobby() {
  const lobby = document.getElementById("piratesLobby");
  const game = document.getElementById("piratesGame");
  if (lobby) lobby.style.display = "flex";
  if (game) game.style.display = "none";
}

function showPiratesGame() {
  const lobby = document.getElementById("piratesLobby");
  const game = document.getElementById("piratesGame");
  if (lobby) lobby.style.display = "none";
  if (game) game.style.display = "flex";
}

function initPiratesLobby() {
  const createBtn = document.getElementById("createGameBtn");
  const joinBtn = document.getElementById("joinGameBtn");
  const joinForm = document.getElementById("joinGameForm");
  const joinConfirmBtn = document.getElementById("joinConfirmBtn");
  const joinCancelBtn = document.getElementById("joinCancelBtn");
  const gameIdInput = document.getElementById("gameIdInput");
  const lobbyGameId = document.getElementById("lobbyGameId");
  
  // Generate initial game ID
  const newGameId = generateGameId();
  if (lobbyGameId) lobbyGameId.textContent = newGameId;
  
  // Load recent games from localStorage
  loadRecentGames();
  
  if (createBtn) {
    createBtn.addEventListener("click", () => {
      const gameId = lobbyGameId?.textContent || generateGameId();
      createNewGame(gameId);
    });
  }
  
  if (joinBtn) {
    joinBtn.addEventListener("click", () => {
      if (joinForm) joinForm.style.display = "flex";
      if (gameIdInput) gameIdInput.focus();
    });
  }
  
  if (joinCancelBtn) {
    joinCancelBtn.addEventListener("click", () => {
      if (joinForm) joinForm.style.display = "none";
      if (gameIdInput) gameIdInput.value = "";
    });
  }
  
  if (joinConfirmBtn) {
    joinConfirmBtn.addEventListener("click", () => {
      const gameId = gameIdInput?.value.trim();
      if (gameId && gameId.length === 4) {
        joinGame(gameId);
      } else {
        alert("Please enter a valid 4-digit game ID");
      }
    });
  }
  
  if (gameIdInput) {
    gameIdInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        joinConfirmBtn?.click();
      }
    });
  }
}

function createNewGame(gameId) {
  console.log("Creating game with ID:", gameId);
  currentGameId = gameId;
  currentPlayerId = 1; // You're Player 1 if you created
  const gameData = {
    id: gameId,
    created: new Date().toISOString(),
    players: 1,
    playerIds: [1],
    status: "waiting"
  };
  gameStorage[gameId] = gameData;
  saveGameToStorage(gameId, gameData);
  
  const lobbyEl = document.getElementById("piratesLobby");
  const gameEl = document.getElementById("piratesGame");
  const gameIdDisplay = document.getElementById("gameIdDisplay");
  
  if (lobbyEl) lobbyEl.style.display = "none";
  if (gameEl) gameEl.style.display = "flex";
  if (gameIdDisplay) gameIdDisplay.textContent = gameId;
  
  startGameInitialization();
}

function joinGame(gameId) {
  if (!gameStorage[gameId]) {
    alert("Game ID not found");
    return;
  }
  currentGameId = gameId;
  currentPlayerId = 2; // You're Player 2 if you joined
  gameStorage[gameId].players += 1;
  gameStorage[gameId].playerIds = [1, 2];
  gameStorage[gameId].status = "active";
  saveGameToStorage(gameId, gameStorage[gameId]);
  document.getElementById("gameIdDisplay").textContent = gameId;
  showPiratesGame();
  startGameInitialization();
}

function startGameInitialization() {
  const canvas = document.getElementById("modernPiratesCanvas");
  if (!canvas) {
    console.error("Canvas not found");
    return;
  }
  
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    setupGameCanvas();
  }, 100);
}

function setupGameCanvas() {
  
  const ctx = canvas.getContext("2d");
  const gameArea = canvas.parentElement;
  
  // Set canvas to fill the game area
  function resizeCanvas() {
    canvas.width = gameArea.clientWidth;
    canvas.height = gameArea.clientHeight;
    // Recalculate cell dimensions on resize
    if (modernPiratesGame) {
      modernPiratesGame.cellWidth = canvas.width / GRID_WIDTH;
      modernPiratesGame.cellHeight = canvas.height / GRID_HEIGHT;
    }
  }
  
  // Ensure canvas has dimensions (with fallback)
  setTimeout(() => {
    resizeCanvas();
    if (canvas.width === 0 || canvas.height === 0) {
      canvas.width = 1200;
      canvas.height = 700;
    }
  }, 100);
  
  window.addEventListener("resize", resizeCanvas);
  
  // Initialize game state
  modernPiratesGame = {
    canvas: canvas,
    ctx: ctx,
    gameArea: gameArea,
    
    // Grid system
    gridWidth: GRID_WIDTH,
    gridHeight: GRID_HEIGHT,
    cellWidth: canvas.width / GRID_WIDTH,
    cellHeight: canvas.height / GRID_HEIGHT,
    
    // Wind system
    windDirection: WIND_DIRECTIONS.NW, // degrees
    windSpeed: 3, // 0-5 knots
    windChangeTimer: 0,
    windChangeInterval: 300, // frames
    
    // Game state
    turn: 1,
    gameTime: 0,
    winThreshold: 25,
    gameWon: false,
    
    // Players
    players: [
      {
        id: 1,
        name: "Player 1",
        color: "#FF6B6B",
        gridX: 10,
        gridY: 20,
        points: 0,
        pointsBreakdown: { islands: 0, battles: 0, upgrades: 0 },
        ships: 1,
        upgrades: 0,
        maxUpgrades: 3,
        hand: generateHand(),
        usedCards: [],
        islandsClaimed: [],
        activeCard: null
      },
      {
        id: 2,
        name: "Player 2",
        color: "#4ECDC4",
        gridX: 70,
        gridY: 20,
        points: 0,
        pointsBreakdown: { islands: 0, battles: 0, upgrades: 0 },
        ships: 1,
        upgrades: 0,
        maxUpgrades: 3,
        hand: generateHand(),
        usedCards: [],
        islandsClaimed: [],
        activeCard: null
      }
    ],
    
    currentPlayerIndex: 0,
    islands: [],
    messages: [],
    messageTimer: 0
  };
  
  // Generate islands
  generateIslandTiles(20);
  
  // Event listeners
  canvas.addEventListener("click", handleCanvasClick);
  const resetBtn = document.getElementById("piratesResetBtn");
  const helpBtn = document.getElementById("piratesHelpBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetModernPirates);
  if (helpBtn) helpBtn.addEventListener("click", showGameHelp);
  
  gameRunning = true;
  startGameLoop();
}

function initModernPirates() {
  // Show lobby if no game is in progress
  if (!currentGameId) {
    showPiratesLobby();
    initPiratesLobby();
    return;
  }
  
  // Otherwise start the game
  startGameInitialization();
}

function generateHand(count = 3) {
  const hand = [];
  const cardNames = Object.keys(CARDS);
  
  for (let i = 0; i < count; i++) {
    const cardName = cardNames[Math.floor(Math.random() * cardNames.length)];
    hand.push({
      type: cardName,
      ...CARDS[cardName],
      id: Math.random()
    });
  }
  
  return hand;
}

function generateIslandTiles(count) {
  modernPiratesGame.islands = [];
  const placed = new Set();
  
  for (let i = 0; i < count; i++) {
    let x, y, key;
    do {
      x = Math.floor(Math.random() * GRID_WIDTH);
      y = Math.floor(Math.random() * GRID_HEIGHT);
      key = `${x},${y}`;
    } while (placed.has(key) || (x < 5 && y < 5) || (x > GRID_WIDTH - 5 && y > GRID_HEIGHT - 5));
    
    placed.add(key);
    
    const types = Object.keys(ISLAND_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    const islandInfo = ISLAND_TYPES[type];
    
    modernPiratesGame.islands.push({
      id: i,
      type: type,
      gridX: x,
      gridY: y,
      ...islandInfo,
      claimedBy: null,
      lootsRemaining: islandInfo.loot ? [...islandInfo.loot] : []
    });
  }
}

function handleCanvasClick(e) {
  if (!modernPiratesGame || modernPiratesGame.gameWon) return;
  
  const rect = modernPiratesGame.canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;
  
  // Convert pixel coords to grid coords
  const gridX = Math.floor(mouseX / modernPiratesGame.cellWidth);
  const gridY = Math.floor(mouseY / modernPiratesGame.cellHeight);
  
  const currentPlayer = modernPiratesGame.players[modernPiratesGame.currentPlayerIndex];
  
  // Try to move player ship
  moveShip(currentPlayer, gridX, gridY);
}

function moveShip(player, targetX, targetY) {
  // Clamp to grid
  targetX = Math.max(0, Math.min(GRID_WIDTH - 1, targetX));
  targetY = Math.max(0, Math.min(GRID_HEIGHT - 1, targetY));
  
  // Check if movement is valid (within wind constraints)
  const dx = targetX - player.gridX;
  const dy = targetY - player.gridY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Can move at most 2 squares per turn
  if (distance > 2.5) {
    addMessage("Too far! Can only move 1-2 squares per turn.");
    return;
  }
  
  // Check wind sailing rules
  const moveAngle = Math.atan2(dy, dx) * 180 / Math.PI;
  const normalizedWindDir = normalizeAngle(modernPiratesGame.windDirection);
  const normalizedMoveDir = normalizeAngle(moveAngle);
  
  // Can't sail directly into the wind (within 45 degrees)
  const angleDiff = Math.abs(normalizedMoveDir - normalizedWindDir);
  const adjustedAngleDiff = angleDiff > 180 ? 360 - angleDiff : angleDiff;
  
  if (adjustedAngleDiff < 45) {
    addMessage("Can't sail INTO the wind! Use tacking.");
    return;
  }
  
  // Valid move - update position
  player.gridX = targetX;
  player.gridY = targetY;
  
  // Check for island collision/looting
  checkIslandInteraction(player);
  
  // Check for ship collision (battle)
  checkBattleCollision(player);
  
  // Next turn
  nextTurn();
}

function checkIslandInteraction(player) {
  const island = modernPiratesGame.islands.find(
    i => i.gridX === player.gridX && i.gridY === player.gridY
  );
  
  if (!island) return;
  
  if (island.type === "DANGER") {
    player.points = Math.max(0, player.points - 5);
    addMessage(`⚠️ Hit a reef! Lost 5 points.`);
    return;
  }
  
  // Can only loot each island once
  if (island.claimedBy === player.id) {
    addMessage(`Already looted this island.`);
    return;
  }
  
  // Loot the island
  if (island.lootsRemaining.length > 0) {
    const loot = island.lootsRemaining.shift();
    const pointsEarned = loot;
    
    player.points += pointsEarned;
    player.pointsBreakdown.islands += pointsEarned;
    island.claimedBy = player.id;
    
    addMessage(`Looted ${island.name} for ${pointsEarned} points!`);
    
    // Check win condition
    if (player.points >= modernPiratesGame.winThreshold) {
      modernPiratesGame.gameWon = true;
      addMessage(`🎉 ${player.name} WINS with ${player.points} points!`);
    }
  }
}

function checkBattleCollision(player) {
  const otherPlayer = modernPiratesGame.players.find(
    p => p.id !== player.id && 
    p.gridX === player.gridX && 
    p.gridY === player.gridY
  );
  
  if (otherPlayer) {
    // Battle! Attacker wins (player who moved)
    const battleResult = Math.floor(Math.random() * 3) + 1; // 1-3 points
    player.points += battleResult;
    player.pointsBreakdown.battles += battleResult;
    otherPlayer.points = Math.max(0, otherPlayer.points - battleResult);
    
    addMessage(`⚔️ Battle! ${player.name} defeats ${otherPlayer.name} for ${battleResult} points!`);
    
    // Check win condition
    if (player.points >= modernPiratesGame.winThreshold) {
      modernPiratesGame.gameWon = true;
      addMessage(`🎉 ${player.name} WINS with ${player.points} points!`);
    }
  }
}

function normalizeAngle(angle) {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return normalized;
}

function nextTurn() {
  // Update wind
  modernPiratesGame.windChangeTimer++;
  if (modernPiratesGame.windChangeTimer >= modernPiratesGame.windChangeInterval) {
    changeWind();
    modernPiratesGame.windChangeTimer = 0;
  }
  
  // Next player
  modernPiratesGame.currentPlayerIndex = (modernPiratesGame.currentPlayerIndex + 1) % modernPiratesGame.players.length;
  
  // Increment turn when both players have moved
  if (modernPiratesGame.currentPlayerIndex === 0) {
    modernPiratesGame.turn++;
  }
  
  // Check max turns
  if (modernPiratesGame.turn > 100) {
    endGame("Game ended - max turns reached");
  }
}

function changeWind() {
  const directions = Object.values(WIND_DIRECTIONS);
  const randomDir = directions[Math.floor(Math.random() * directions.length)];
  const speedChange = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
  
  modernPiratesGame.windDirection = randomDir;
  modernPiratesGame.windSpeed = Math.max(1, Math.min(5, modernPiratesGame.windSpeed + speedChange));
  
  addMessage(`🌬️ Wind shifted to ${directionToText(randomDir)} at ${modernPiratesGame.windSpeed} knots.`);
}

function directionToText(angle) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(angle / 22.5) % 16;
  return directions[index];
}

function addMessage(text) {
  modernPiratesGame.messages.push({
    text: text,
    timer: 180 // 3 seconds at 60fps
  });
  
  // Keep only last 5 messages
  if (modernPiratesGame.messages.length > 5) {
    modernPiratesGame.messages.shift();
  }
}

function showGameHelp() {
  alert(`MODERN PIRATES - HOW TO PLAY

OBJECTIVE: Reach 25 points first!

POINTS:
• Loot Islands: 1-3 points each
• Win Battles: 1-3 points per victory
• Upgrade Ships: 1 point per upgrade (max 3)

SAILING:
• Click a grid square to move there (1-2 squares max)
• Can't sail directly INTO the wind
• You must tack or gybe around wind
• Wind changes every ~5 turns

COMBAT:
• Move onto opponent's square to battle
• Attacker wins and gains 1-3 points
• Defender loses points

ISLAND TYPES:
🏚️ Harbor - 2 points (stable loot)
💎 Resource - 1 point (quick grab)
🏴 Treasure - 3 points (high reward!)
⚠️ Reef - Damages you (-5 points)

TIPS:
• Plan your route around wind direction
• Check the wind compass (left sidebar)
• Treasure islands are worth the risk
• Block opponents from islands
• First to 25 points wins!`);
}

function endGame(reason) {
  gameRunning = false;
  if (gameLoop) clearInterval(gameLoop);
  addMessage(reason);
}

function updateGameState() {
  // Update message timers
  modernPiratesGame.messages.forEach(msg => msg.timer--);
  modernPiratesGame.messages = modernPiratesGame.messages.filter(m => m.timer > 0);
  
  modernPiratesGame.gameTime++;
}

function startGameLoop() {
  gameLoop = setInterval(() => {
    updateGameState();
    drawGame();
    updateUI();
  }, 1000 / 60); // 60 FPS
}

function drawGame() {
  if (!modernPiratesGame) return;
  
  const { ctx, canvas } = modernPiratesGame;
  
  // Clear canvas
  ctx.fillStyle = "#0a1520";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grid
  drawGrid();
  
  // Draw islands
  drawIslands();
  
  // Draw ships
  drawShips();
  
  // Draw wind direction overlay
  drawWindIndicator();
  
  // Draw messages
  drawMessages();
  
  // Draw game info overlay
  drawGameOverlay();
}

function drawGrid() {
  const { ctx, canvas, cellWidth, cellHeight, gridWidth, gridHeight } = modernPiratesGame;
  
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 0.5;
  
  // Vertical lines
  for (let x = 0; x <= gridWidth; x++) {
    const px = x * cellWidth;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, canvas.height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = 0; y <= gridHeight; y++) {
    const py = y * cellHeight;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(canvas.width, py);
    ctx.stroke();
  }
}

function drawIslands() {
  const { ctx, cellWidth, cellHeight } = modernPiratesGame;
  
  modernPiratesGame.islands.forEach(island => {
    const x = island.gridX * cellWidth + cellWidth / 2;
    const y = island.gridY * cellHeight + cellHeight / 2;
    
    // Island tile
    ctx.fillStyle = island.color;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(island.gridX * cellWidth + 1, island.gridY * cellHeight + 1, cellWidth - 2, cellHeight - 2);
    ctx.globalAlpha = 1.0;
    
    // Island symbol
    ctx.font = `bold ${Math.floor(cellHeight * 0.7)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(island.symbol, x, y);
    
    // Show claimed indicator
    if (island.claimedBy) {
      const player = modernPiratesGame.players.find(p => p.id === island.claimedBy);
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(island.gridX * cellWidth, island.gridY * cellHeight, cellWidth, cellHeight);
    }
  });
}

function drawShips() {
  const { ctx, cellWidth, cellHeight } = modernPiratesGame;
  
  modernPiratesGame.players.forEach(player => {
    const x = player.gridX * cellWidth + cellWidth / 2;
    const y = player.gridY * cellHeight + cellHeight / 2;
    
    // Ship circle
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x, y, cellWidth / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Ship outline
    const isCurrentPlayer = player.id === modernPiratesGame.players[modernPiratesGame.currentPlayerIndex].id;
    ctx.strokeStyle = isCurrentPlayer ? "#FFD700" : "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = isCurrentPlayer ? 3 : 1;
    ctx.stroke();
    
    // Player label
    ctx.font = `bold ${Math.floor(cellWidth * 0.6)}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(player.name.charAt(0), x, y);
  });
}

function drawWindIndicator() {
  const { ctx, canvas } = modernPiratesGame;
  
  // Wind arrow in top-right corner
  const arrowX = canvas.width - 80;
  const arrowY = 60;
  const arrowSize = 30;
  
  // Background
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(arrowX - 40, arrowY - 40, 80, 80);
  
  ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
  ctx.lineWidth = 2;
  ctx.strokeRect(arrowX - 40, arrowY - 40, 80, 80);
  
  // Wind direction text
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("WIND", arrowX, arrowY - 25);
  ctx.fillText(directionToText(modernPiratesGame.windDirection), arrowX, arrowY - 8);
  ctx.font = "12px Arial";
  ctx.fillText(modernPiratesGame.windSpeed + " knots", arrowX, arrowY + 10);
  
  // Wind direction arrow
  ctx.save();
  ctx.translate(arrowX, arrowY + 25);
  ctx.rotate(modernPiratesGame.windDirection * Math.PI / 180);
  
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -arrowSize);
  ctx.lineTo(-5, 0);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = "#FFD700";
  ctx.fill();
  
  ctx.restore();
}

function drawMessages() {
  const { ctx, canvas } = modernPiratesGame;
  
  let messageY = canvas.height - 30;
  
  for (let i = modernPiratesGame.messages.length - 1; i >= 0; i--) {
    const msg = modernPiratesGame.messages[i];
    const alpha = Math.min(1, msg.timer / 60);
    
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.9})`;
    ctx.font = "13px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(msg.text, 30, messageY);
    
    messageY -= 22;
  }
}

function drawGameOverlay() {
  const { ctx, canvas } = modernPiratesGame;
  const currentPlayer = modernPiratesGame.players[modernPiratesGame.currentPlayerIndex];
  
  // Top-left info
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(10, 10, 220, 110);
  ctx.strokeStyle = "rgba(255, 215, 0, 0.4)";
  ctx.lineWidth = 1;
  ctx.strokeRect(10, 10, 220, 110);
  
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 16px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`Turn: ${modernPiratesGame.turn}`, 20, 20);
  
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 14px Arial";
  ctx.fillText(`${currentPlayer.name}'s Turn`, 20, 45);
  
  ctx.font = "12px Arial";
  ctx.fillStyle = "#4ECDC4";
  ctx.fillText(`Position: (${currentPlayer.gridX}, ${currentPlayer.gridY})`, 20, 65);
  ctx.fillText(`Points: ${currentPlayer.points} / ${modernPiratesGame.winThreshold}`, 20, 85);
  ctx.fillStyle = "#a0a0a0";
  ctx.font = "11px Arial";
  ctx.fillText(`Click to move ship`, 20, 105);
  
  // Win condition
  if (modernPiratesGame.gameWon) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.95)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎉 VICTORY! 🎉", canvas.width / 2, canvas.height / 2 - 50);
    
    ctx.fillStyle = "#4ECDC4";
    ctx.font = "28px Arial";
    ctx.fillText(`${currentPlayer.name} wins!`, canvas.width / 2, canvas.height / 2 + 20);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "16px Arial";
    ctx.fillText(`Final Score: ${currentPlayer.points} points`, canvas.width / 2, canvas.height / 2 + 55);
    
    ctx.font = "14px Arial";
    ctx.fillStyle = "#a0a0a0";
    ctx.fillText(`Islands: ${currentPlayer.pointsBreakdown.islands} | Battles: ${currentPlayer.pointsBreakdown.battles}`, canvas.width / 2, canvas.height / 2 + 80);
    
    ctx.font = "13px Arial";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("Click 'New Game' to play again", canvas.width / 2, canvas.height / 2 + 120);
  }
}

function updateUI() {
  const currentPlayer = modernPiratesGame.players[modernPiratesGame.currentPlayerIndex];
  
  // Update player info
  document.getElementById("playerRole").textContent = currentPlayerId === 1 ? "🔴 Player 1 (You)" : "🔵 Player 2 (You)";
  document.getElementById("playerId").textContent = currentPlayerId;
  
  // Update turn indicator
  const isYourTurn = modernPiratesGame.currentPlayer === currentPlayerId;
  const turnText = isYourTurn 
    ? "✓ Your Turn" 
    : `Opponent's Turn (Player ${modernPiratesGame.currentPlayer})`;
  const turnIndicator = document.getElementById("turnIndicator");
  if (turnIndicator) {
    turnIndicator.textContent = turnText;
    turnIndicator.style.color = isYourTurn ? "#4ECDC4" : "#a0a0a0";
    turnIndicator.style.fontWeight = isYourTurn ? "bold" : "normal";
  }
  
  // Update sidebar stats
  document.getElementById("shipClass").textContent = `Ship (${currentPlayer.ships} ship${currentPlayer.ships > 1 ? 's' : ''})`;
  document.getElementById("shipPos").textContent = `(${currentPlayer.gridX}, ${currentPlayer.gridY})`;
  document.getElementById("shipUpgrades").textContent = currentPlayer.upgrades;
  
  document.getElementById("playerPoints").textContent = currentPlayer.points;
  document.getElementById("islandPoints").textContent = currentPlayer.pointsBreakdown.islands;
  document.getElementById("battlePoints").textContent = currentPlayer.pointsBreakdown.battles;
  document.getElementById("upgradePoints").textContent = currentPlayer.pointsBreakdown.upgrades;
  
  // Update wind info
  document.getElementById("windDir").textContent = directionToText(modernPiratesGame.windDirection);
  document.getElementById("windSpeed").textContent = modernPiratesGame.windSpeed;
  
  // Draw wind compass
  drawWindCompass();
  
  // Update enemies list
  updateEnemiesList();
  
  // Update card hand
  updateCardHand(currentPlayer);
}

function drawWindCompass() {
  const canvas = document.getElementById("windCompass");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 50;
  
  // Clear
  ctx.fillStyle = "#1a3a52";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Compass circle
  ctx.strokeStyle = "#4ECDC4";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 5, 0, Math.PI * 2);
  ctx.stroke();
  
  // Cardinal directions
  const directions = ["N", "E", "S", "W"];
  const angles = [0, 90, 180, 270];
  
  ctx.fillStyle = "#FFD700";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  
  angles.forEach((angle, i) => {
    const rad = angle * Math.PI / 180;
    const x = cx + Math.cos(rad) * (radius - 10);
    const y = cy + Math.sin(rad) * (radius - 10);
    ctx.fillText(directions[i], x, y);
  });
  
  // Wind arrow
  const windRad = modernPiratesGame.windDirection * Math.PI / 180;
  const windX = cx + Math.cos(windRad) * (radius - 20);
  const windY = cy + Math.sin(windRad) * (radius - 20);
  
  ctx.strokeStyle = "#FF6B6B";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(windX, windY);
  ctx.stroke();
  
  ctx.fillStyle = "#FF6B6B";
  ctx.beginPath();
  ctx.arc(windX, windY, 4, 0, Math.PI * 2);
  ctx.fill();
}

function updateEnemiesList() {
  const enemiesDiv = document.getElementById("enemiesList");
  const currentPlayer = modernPiratesGame.players[modernPiratesGame.currentPlayerIndex];
  
  let html = "";
  modernPiratesGame.players.forEach(player => {
    if (player.id !== currentPlayer.id) {
      const distance = Math.sqrt(
        Math.pow(player.gridX - currentPlayer.gridX, 2) + 
        Math.pow(player.gridY - currentPlayer.gridY, 2)
      ).toFixed(1);
      
      html += `<div class="enemy-item">
        <strong>${player.name}</strong><br>
        Points: ${player.points} | Distance: ${distance}
      </div>`;
    }
  });
  
  enemiesDiv.innerHTML = html || "<p>No enemies</p>";
}

function updateCardHand(player) {
  const cardDiv = document.getElementById("cardHand");
  let html = "";
  
  player.hand.forEach((card, idx) => {
    const isUsed = player.usedCards.includes(idx);
    html += `<div class="card ${isUsed ? 'used' : ''}" title="${card.effect}">
      ${card.name}
    </div>`;
  });
  
  cardDiv.innerHTML = html || "<p>No cards</p>";
}

function resetModernPirates() {
  if (gameLoop) clearInterval(gameLoop);
  gameRunning = false;
  currentGameId = null;
  
  document.getElementById("piratesPlayerStats").innerHTML = "";
  document.getElementById("piratesGameStatus").innerHTML = "";
  
  showPiratesLobby();
  initModernPirates();
}
