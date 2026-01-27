// Modern Pirates - Board Game: Online Naval Conquest
// 80x40 grid, wind mechanics, tile-based islands, race to 25 points

let modernPiratesGame = null;
let gameRunning = false;
let gameLoop = null;
let currentGameId = null;
let currentPlayerId = null; // 1 or 2
let gameStorage = {}; // In-memory storage for game states

// Grid configuration
const GRID_WIDTH = 20;
const GRID_HEIGHT = 80;

// Wind direction in degrees (0=N, 90=E, 180=S, 270=W)
const WIND_DIRECTIONS = {
  N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315
};

const ISLAND_TYPES = {
  HARBOR: { 
    name: "Harbor", 
    symbol: "🏚️", 
    color: "#8B7355", 
    points: 2, 
    loot: [1, 2, 3],
    materials: { THATCH: 3, WOOD: 2 }
  },
  RESOURCE: { 
    name: "Resource", 
    symbol: "💎", 
    color: "#4CAF50", 
    points: 1, 
    loot: [1, 2],
    materials: { THATCH: 5, WOOD: 1 }
  },
  TREASURE: { 
    name: "Treasure", 
    symbol: "🏴", 
    color: "#FFD700", 
    points: 3, 
    loot: [3],
    materials: { WOOD: 3, STONE: 2, IRON: 1 }
  },
  DANGER: { 
    name: "Reef", 
    symbol: "⚠️", 
    color: "#FF6B6B", 
    points: 0, 
    damage: 20,
    materials: { STONE: 2 }
  }
};

const CARDS = {
  WIND_SHIFT: { name: "Wind Shift", cost: 0, effect: "Change wind" },
  SPEED_BOOST: { name: "Speed Boost", cost: 1, effect: "Move extra square" },
  TACK_ASSIST: { name: "Tack Assist", cost: 2, effect: "Tack easier" },
  TREASURE_MAP: { name: "Treasure Map", cost: 3, effect: "Reveal island" },
  RAMMING_SPEED: { name: "Ramming Speed", cost: 2, effect: "Attack bonus" }
};

// Material Hierarchy System
const MATERIALS = {
  THATCH: { 
    name: "Thatch", 
    tier: 1, 
    symbol: "🌾", 
    color: "#D4A574",
    description: "Basic woven reeds"
  },
  WOOD: { 
    name: "Wood", 
    tier: 2, 
    symbol: "🪵", 
    color: "#8B4513",
    description: "Sturdy timber planks"
  },
  STONE: { 
    name: "Stone", 
    tier: 3, 
    symbol: "🪨", 
    color: "#708090",
    description: "Solid stone blocks"
  },
  IRON: { 
    name: "Iron", 
    tier: 4, 
    symbol: "⚙️", 
    color: "#A9A9A9",
    description: "Forged iron fittings"
  },
  STEEL: { 
    name: "Steel", 
    tier: 5, 
    symbol: "⚔️", 
    color: "#C0C0C0",
    description: "Reinforced steel plating"
  },
  TITANIUM: { 
    name: "Titanium", 
    tier: 6, 
    symbol: "💎", 
    color: "#E0E0E0",
    description: "Advanced titanium alloy"
  }
};

// Ship Upgrade System - Nautical Themed
const SHIP_UPGRADES = {
  // Tier 1 - Thatch
  RAFT: {
    name: "Raft",
    tier: 1,
    material: "THATCH",
    requires: { THATCH: 10 },
    stats: { speed: 1, hull: 20, cargo: 5 },
    description: "⛵ Basic thatch raft - slow but seaworthy",
    nautical: "Makeshift Raft"
  },
  
  // Tier 2 - Wood
  DINGHY: {
    name: "Dinghy",
    tier: 2,
    material: "WOOD",
    requires: { THATCH: 5, WOOD: 15 },
    stats: { speed: 2, hull: 40, cargo: 10 },
    description: "⛵ Small wooden boat - nimble explorer",
    nautical: "Coastal Dinghy"
  },
  SLOOP: {
    name: "Sloop",
    tier: 2,
    material: "WOOD",
    requires: { WOOD: 25 },
    stats: { speed: 3, hull: 50, cargo: 15 },
    description: "⛵ Single-masted sloop - fast and agile",
    nautical: "Swift Sloop"
  },
  
  // Tier 3 - Stone
  SCHOONER: {
    name: "Schooner",
    tier: 3,
    material: "STONE",
    requires: { WOOD: 15, STONE: 20 },
    stats: { speed: 3, hull: 80, cargo: 25 },
    description: "⛵ Two-masted schooner - balanced trader",
    nautical: "Merchant Schooner"
  },
  
  // Tier 4 - Iron
  BRIGANTINE: {
    name: "Brigantine",
    tier: 4,
    material: "IRON",
    requires: { WOOD: 10, STONE: 15, IRON: 20 },
    stats: { speed: 4, hull: 120, cargo: 30 },
    description: "⛵ Iron-reinforced brig - formidable raider",
    nautical: "War Brigantine"
  },
  FRIGATE: {
    name: "Frigate",
    tier: 4,
    material: "IRON",
    requires: { STONE: 10, IRON: 30 },
    stats: { speed: 4, hull: 150, cargo: 35 },
    description: "⛵ Naval frigate - armed warship",
    nautical: "Battle Frigate"
  },
  
  // Tier 5 - Steel
  GALLEON: {
    name: "Galleon",
    tier: 5,
    material: "STEEL",
    requires: { IRON: 20, STEEL: 25 },
    stats: { speed: 3, hull: 200, cargo: 50 },
    description: "⛵ Steel-hulled galleon - treasure hauler",
    nautical: "Treasure Galleon"
  },
  MAN_O_WAR: {
    name: "Man o' War",
    tier: 5,
    material: "STEEL",
    requires: { IRON: 15, STEEL: 35 },
    stats: { speed: 4, hull: 250, cargo: 40 },
    description: "⛵ Ship of the line - floating fortress",
    nautical: "Imperial Man o' War"
  },
  
  // Tier 6 - Titanium
  IRONCLAD: {
    name: "Ironclad",
    tier: 6,
    material: "TITANIUM",
    requires: { STEEL: 25, TITANIUM: 30 },
    stats: { speed: 5, hull: 350, cargo: 60 },
    description: "⛵ Titanium ironclad - ultimate warship",
    nautical: "Legendary Ironclad"
  }
};

// Island Base Structures - Nautical Themed
const BASE_STRUCTURES = {
  // Tier 1 - Thatch
  LEAN_TO: {
    name: "Lean-To",
    tier: 1,
    material: "THATCH",
    requires: { THATCH: 8 },
    benefits: { storage: 10 },
    description: "🏚️ Simple thatch shelter - basic storage",
    nautical: "Beach Shanty"
  },
  
  // Tier 2 - Wood
  DOCK: {
    name: "Dock",
    tier: 2,
    material: "WOOD",
    requires: { THATCH: 5, WOOD: 12 },
    benefits: { storage: 20, repair: 5 },
    description: "⚓ Wooden dock - ship repairs",
    nautical: "Harbor Dock"
  },
  WAREHOUSE: {
    name: "Warehouse",
    tier: 2,
    material: "WOOD",
    requires: { WOOD: 20 },
    benefits: { storage: 40 },
    description: "📦 Storage warehouse - large capacity",
    nautical: "Cargo Warehouse"
  },
  
  // Tier 3 - Stone
  FORT: {
    name: "Fort",
    tier: 3,
    material: "STONE",
    requires: { WOOD: 10, STONE: 25 },
    benefits: { defense: 50, storage: 30 },
    description: "🏰 Stone fort - defensive structure",
    nautical: "Coastal Fort"
  },
  LIGHTHOUSE: {
    name: "Lighthouse",
    tier: 3,
    material: "STONE",
    requires: { WOOD: 8, STONE: 18 },
    benefits: { vision: 3 },
    description: "🗼 Lighthouse - extended vision range",
    nautical: "Navigation Beacon"
  },
  
  // Tier 4 - Iron
  SHIPYARD: {
    name: "Shipyard",
    tier: 4,
    material: "IRON",
    requires: { STONE: 15, IRON: 25 },
    benefits: { buildSpeed: 2, repair: 15 },
    description: "🏗️ Iron shipyard - faster construction",
    nautical: "Naval Shipyard"
  },
  ARMORY: {
    name: "Armory",
    tier: 4,
    material: "IRON",
    requires: { STONE: 10, IRON: 20 },
    benefits: { attack: 10, defense: 30 },
    description: "⚔️ Weapons armory - combat bonus",
    nautical: "Naval Armory"
  },
  
  // Tier 5 - Steel
  CITADEL: {
    name: "Citadel",
    tier: 5,
    material: "STEEL",
    requires: { IRON: 20, STEEL: 30 },
    benefits: { defense: 100, storage: 60 },
    description: "🏛️ Steel citadel - impenetrable base",
    nautical: "Admiral's Citadel"
  },
  TRADE_PORT: {
    name: "Trade Port",
    tier: 5,
    material: "STEEL",
    requires: { IRON: 15, STEEL: 25 },
    benefits: { income: 5, storage: 80 },
    description: "🏪 Trade port - passive income",
    nautical: "International Port"
  },
  
  // Tier 6 - Titanium
  NAVAL_HQ: {
    name: "Naval Headquarters",
    tier: 6,
    material: "TITANIUM",
    requires: { STEEL: 30, TITANIUM: 40 },
    benefits: { all: 20, storage: 100 },
    description: "🏢 Naval HQ - supreme command center",
    nautical: "Fleet Command"
  }
};

// Crafting recipes for materials (how to get higher tier materials)
const CRAFTING_RECIPES = {
  THATCH: {
    // Thatch is gathered from islands
    source: "Gather from islands with vegetation"
  },
  WOOD: {
    requires: { THATCH: 3 },
    output: 1,
    description: "Process thatch into timber"
  },
  STONE: {
    requires: { WOOD: 2 },
    output: 1,
    description: "Quarry stone with wood tools"
  },
  IRON: {
    requires: { WOOD: 2, STONE: 3 },
    output: 1,
    description: "Smelt iron from stone"
  },
  STEEL: {
    requires: { IRON: 3 },
    output: 1,
    description: "Forge steel from iron"
  },
  TITANIUM: {
    requires: { STEEL: 4 },
    output: 1,
    description: "Refine titanium from steel"
  }
};

// Storage & persistence
function saveGameToStorage(gameId, gameData) {
  try {
    // Save the full game state
    localStorage.setItem(`piratesGame_${gameId}`, JSON.stringify(gameData));
    
    // Update recent games list
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
    
    return true;
  } catch (e) {
    console.error("Failed to save game to storage:", e);
    return false;
  }
}

function loadGameFromStorage(gameId) {
  try {
    const gameDataStr = localStorage.getItem(`piratesGame_${gameId}`);
    if (!gameDataStr) {
      return null;
    }
    return JSON.parse(gameDataStr);
  } catch (e) {
    console.error("Failed to load game from storage:", e);
    return null;
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
  
  try {
    currentGameId = gameId;
    currentPlayerId = 1; // You're Player 1 if you created
    const gameData = {
      id: gameId,
      created: new Date().toISOString(),
      players: 1,
      playerIds: [1],
      status: "waiting",
      lastUpdate: new Date().toISOString()
    };
    
    // Save to both in-memory and localStorage
    gameStorage[gameId] = gameData;
    if (!saveGameToStorage(gameId, gameData)) {
      console.error("Failed to save game to localStorage");
      alert("Warning: Game may not persist across browser windows");
    }
    
    const lobbyEl = document.getElementById("piratesLobby");
    const gameEl = document.getElementById("piratesGame");
    const gameIdDisplay = document.getElementById("gameIdDisplay");
    
    if (lobbyEl) lobbyEl.style.display = "none";
    if (gameEl) gameEl.style.display = "flex";
    if (gameIdDisplay) gameIdDisplay.textContent = gameId;
    
    startGameInitialization();
  } catch (e) {
    console.error("Error creating game:", e);
    alert("Failed to create game. Please try again.");
  }
}

function joinGame(gameId) {
  try {
    // First check localStorage for the game
    let gameData = loadGameFromStorage(gameId);
    
    // Fallback to in-memory storage
    if (!gameData && gameStorage[gameId]) {
      gameData = gameStorage[gameId];
    }
    
    if (!gameData) {
      alert("Game ID not found. Please check the ID and try again.");
      return;
    }
    
    // Check if game is already full
    if (gameData.players >= 2) {
      alert("This game is already full. Please create a new game or join a different one.");
      return;
    }
    
    currentGameId = gameId;
    currentPlayerId = 2; // You're Player 2 if you joined
    gameData.players = 2;
    gameData.playerIds = [1, 2];
    gameData.status = "active";
    gameData.lastUpdate = new Date().toISOString();
    
    // Save to both storages
    gameStorage[gameId] = gameData;
    if (!saveGameToStorage(gameId, gameData)) {
      console.error("Failed to save game to localStorage");
      alert("Warning: Game may not persist across browser windows");
    }
    
    const gameIdDisplay = document.getElementById("gameIdDisplay");
    if (gameIdDisplay) gameIdDisplay.textContent = gameId;
    
    showPiratesGame();
    startGameInitialization();
  } catch (e) {
    console.error("Error joining game:", e);
    alert("Failed to join game. Please try again.");
  }
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
  const canvas = document.getElementById("modernPiratesCanvas");
  if (!canvas) return;
  
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
    
    // Zoom and camera system
    zoomLevel: 1.0,
    minZoom: 0.5,
    maxZoom: 3.0,
    cameraX: 0,
    cameraY: 0,
    
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
        gridX: 5,
        gridY: 40,
        points: 0,
        pointsBreakdown: { islands: 0, battles: 0, upgrades: 0 },
        ships: 1,
        upgrades: 0,
        maxUpgrades: 3,
        hand: generateHand(),
        usedCards: [],
        islandsClaimed: [],
        activeCard: null,
        // Building mechanics additions
        materials: {
          THATCH: 15,
          WOOD: 5,
          STONE: 0,
          IRON: 0,
          STEEL: 0,
          TITANIUM: 0
        },
        currentShip: "RAFT",
        structures: [],
        unlockedShips: ["RAFT"],
        unlockedStructures: ["LEAN_TO"]
      },
      {
        id: 2,
        name: "Player 2",
        color: "#4ECDC4",
        gridX: 15,
        gridY: 40,
        points: 0,
        pointsBreakdown: { islands: 0, battles: 0, upgrades: 0 },
        ships: 1,
        upgrades: 0,
        maxUpgrades: 3,
        hand: generateHand(),
        usedCards: [],
        islandsClaimed: [],
        activeCard: null,
        // Building mechanics additions
        materials: {
          THATCH: 15,
          WOOD: 5,
          STONE: 0,
          IRON: 0,
          STEEL: 0,
          TITANIUM: 0
        },
        currentShip: "RAFT",
        structures: [],
        unlockedShips: ["RAFT"],
        unlockedStructures: ["LEAN_TO"]
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
  canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });
  const resetBtn = document.getElementById("piratesResetBtn");
  const helpBtn = document.getElementById("piratesHelpBtn");
  const zoomInBtn = document.getElementById("piratesZoomInBtn");
  const zoomOutBtn = document.getElementById("piratesZoomOutBtn");
  if (resetBtn) resetBtn.addEventListener("click", resetModernPirates);
  if (helpBtn) helpBtn.addEventListener("click", showGameHelp);
  if (zoomInBtn) zoomInBtn.addEventListener("click", () => adjustZoom(0.2));
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", () => adjustZoom(-0.2));
  
  // Listen for storage events to sync game state across browser windows
  window.addEventListener("storage", handleStorageChange);
  
  gameRunning = true;
  startGameLoop();
}

// Handle storage changes from other windows
function handleStorageChange(e) {
  if (!currentGameId || !e.key || !e.key.startsWith("piratesGame_")) {
    return;
  }
  
  const gameId = e.key.replace("piratesGame_", "");
  if (gameId !== currentGameId) {
    return;
  }
  
  try {
    console.log("Game state updated from another window");
    const updatedGameData = JSON.parse(e.newValue);
    if (updatedGameData) {
      gameStorage[gameId] = updatedGameData;
      // You could trigger a UI update here if needed
    }
  } catch (err) {
    console.error("Error syncing game state:", err);
  }
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
      id: Date.now() + Math.random() + i
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
    } while (placed.has(key) || 
             (x < 3 && y > GRID_HEIGHT - 5) || 
             (x > GRID_WIDTH - 3 && y > GRID_HEIGHT - 5));
    
    placed.add(key);
    
    // Determine island type based on position (tougher islands near top = lower y values)
    let type;
    const topThird = GRID_HEIGHT / 3;
    const middleThird = (GRID_HEIGHT * 2) / 3;
    
    if (y < topThird) {
      // Top third: mostly TREASURE and DANGER
      const toughTypes = ["TREASURE", "TREASURE", "DANGER", "HARBOR"];
      type = toughTypes[Math.floor(Math.random() * toughTypes.length)];
    } else if (y < middleThird) {
      // Middle third: mix of all types
      const types = Object.keys(ISLAND_TYPES);
      type = types[Math.floor(Math.random() * types.length)];
    } else {
      // Bottom third: mostly RESOURCE and HARBOR
      const easyTypes = ["RESOURCE", "RESOURCE", "HARBOR", "TREASURE"];
      type = easyTypes[Math.floor(Math.random() * easyTypes.length)];
    }
    
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
  
  // Convert pixel coords to grid coords (accounting for zoom and camera)
  const worldX = (mouseX / modernPiratesGame.zoomLevel) + modernPiratesGame.cameraX;
  const worldY = (mouseY / modernPiratesGame.zoomLevel) + modernPiratesGame.cameraY;
  const gridX = Math.floor(worldX / modernPiratesGame.cellWidth);
  const gridY = Math.floor(worldY / modernPiratesGame.cellHeight);
  
  const currentPlayer = modernPiratesGame.players[modernPiratesGame.currentPlayerIndex];
  
  // Try to move player ship
  moveShip(currentPlayer, gridX, gridY);
}

function handleCanvasWheel(e) {
  if (!modernPiratesGame) return;
  e.preventDefault();
  
  // Zoom in or out based on wheel direction
  const zoomDelta = e.deltaY > 0 ? -0.1 : 0.1;
  adjustZoom(zoomDelta);
}

function adjustZoom(delta) {
  if (!modernPiratesGame) return;
  
  const oldZoom = modernPiratesGame.zoomLevel;
  modernPiratesGame.zoomLevel = Math.max(
    modernPiratesGame.minZoom,
    Math.min(modernPiratesGame.maxZoom, modernPiratesGame.zoomLevel + delta)
  );
  
  // Adjust camera to keep view centered
  const zoomRatio = modernPiratesGame.zoomLevel / oldZoom;
  const centerX = modernPiratesGame.cameraX + (modernPiratesGame.canvas.width / oldZoom) / 2;
  const centerY = modernPiratesGame.cameraY + (modernPiratesGame.canvas.height / oldZoom) / 2;
  
  modernPiratesGame.cameraX = centerX - (modernPiratesGame.canvas.width / modernPiratesGame.zoomLevel) / 2;
  modernPiratesGame.cameraY = centerY - (modernPiratesGame.canvas.height / modernPiratesGame.zoomLevel) / 2;
  
  // Clamp camera position
  clampCamera();
}

function clampCamera() {
  if (!modernPiratesGame) return;
  
  const worldWidth = GRID_WIDTH * modernPiratesGame.cellWidth;
  const worldHeight = GRID_HEIGHT * modernPiratesGame.cellHeight;
  const viewWidth = modernPiratesGame.canvas.width / modernPiratesGame.zoomLevel;
  const viewHeight = modernPiratesGame.canvas.height / modernPiratesGame.zoomLevel;
  
  modernPiratesGame.cameraX = Math.max(0, Math.min(worldWidth - viewWidth, modernPiratesGame.cameraX));
  modernPiratesGame.cameraY = Math.max(0, Math.min(worldHeight - viewHeight, modernPiratesGame.cameraY));
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
    
    // Collect materials from island
    const islandType = ISLAND_TYPES[island.type];
    if (islandType.materials) {
      let materialsCollected = [];
      for (const [material, amount] of Object.entries(islandType.materials)) {
        player.materials[material] = (player.materials[material] || 0) + amount;
        materialsCollected.push(`${MATERIALS[material].symbol}${amount}`);
      }
      addMessage(`Looted ${island.name} for ${pointsEarned} pts + ${materialsCollected.join(', ')}!`);
    } else {
      addMessage(`Looted ${island.name} for ${pointsEarned} points!`);
    }
    
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

BOARD:
• 20 x 80 grid (wider than tall)
• Tougher islands near the top
• Use zoom controls to navigate

CONTROLS:
• Click to move ship (1-2 squares max)
• Mouse wheel to zoom in/out
• Zoom +/- buttons in sidebar
• Click crafting/building options in sidebar

POINTS:
• Loot Islands: 1-3 points each
• Win Battles: 1-3 points per victory
• Build Ships & Bases: 1 point each

SAILING:
• Can't sail directly INTO the wind
• You must tack or gybe around wind
• Wind changes every ~5 turns

COMBAT:
• Move onto opponent's square to battle
• Attacker wins and gains 1-3 points
• Defender loses points

ISLAND TYPES & MATERIALS:
🏚️ Harbor - 2 pts + Thatch & Wood
💎 Resource - 1 pt + Thatch & Wood
🏴 Treasure - 3 pts + Wood, Stone & Iron
⚠️ Reef - Damages you (-5 pts) + Stone

BUILDING MECHANICS:
Material Hierarchy:
🌾 Thatch → 🪵 Wood → 🪨 Stone → ⚙️ Iron → ⚔️ Steel → 💎 Titanium

CRAFTING:
• Convert lower tier materials to higher tiers
• Example: 3 Thatch → 1 Wood
• Click on crafting options to craft

SHIP UPGRADES (Nautical Fleet):
Tier 1: Makeshift Raft (Thatch)
Tier 2: Coastal Dinghy, Swift Sloop (Wood)
Tier 3: Merchant Schooner (Stone)
Tier 4: War Brigantine, Battle Frigate (Iron)
Tier 5: Treasure Galleon, Man o' War (Steel)
Tier 6: Legendary Ironclad (Titanium)

ISLAND BASES (Naval Infrastructure):
Tier 1: Beach Shanty (Thatch)
Tier 2: Harbor Dock, Cargo Warehouse (Wood)
Tier 3: Coastal Fort, Navigation Beacon (Stone)
Tier 4: Naval Shipyard, Naval Armory (Iron)
Tier 5: Admiral's Citadel, Int'l Port (Steel)
Tier 6: Fleet Command (Titanium)

TIPS:
• Gather materials by looting islands
• Build up your fleet for better stats
• Construct bases for bonuses
• Plan your route around wind direction
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
  
  // Save context and apply zoom/camera transforms
  ctx.save();
  ctx.scale(modernPiratesGame.zoomLevel, modernPiratesGame.zoomLevel);
  ctx.translate(-modernPiratesGame.cameraX, -modernPiratesGame.cameraY);
  
  // Draw grid
  drawGrid();
  
  // Draw islands
  drawIslands();
  
  // Draw ships
  drawShips();
  
  // Restore context for UI overlays
  ctx.restore();
  
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
  const isYourTurn = currentPlayer.id === currentPlayerId;
  const turnText = isYourTurn 
    ? "✓ Your Turn" 
    : `Opponent's Turn (Player ${currentPlayer.id})`;
  const turnIndicator = document.getElementById("turnIndicator");
  if (turnIndicator) {
    turnIndicator.textContent = turnText;
    turnIndicator.style.color = isYourTurn ? "#4ECDC4" : "#a0a0a0";
    turnIndicator.style.fontWeight = isYourTurn ? "bold" : "normal";
  }
  
  // Update sidebar stats
  const shipInfo = SHIP_UPGRADES[currentPlayer.currentShip];
  document.getElementById("shipClass").textContent = shipInfo ? shipInfo.nautical : `Ship (${currentPlayer.ships})`;
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
  
  // Update materials display
  updateMaterialsDisplay(currentPlayer);
  
  // Update building options
  updateBuildingOptions(currentPlayer);
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

function updateMaterialsDisplay(player) {
  const materialsDiv = document.getElementById("materialsInventory");
  if (!materialsDiv) return;
  
  let html = "";
  for (const [matKey, matInfo] of Object.entries(MATERIALS)) {
    const amount = player.materials[matKey] || 0;
    if (amount > 0) {
      html += `<div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <span>${matInfo.symbol} ${matInfo.name}</span>
        <strong>${amount}</strong>
      </div>`;
    }
  }
  
  materialsDiv.innerHTML = html || "<p style='color: #888; font-size: 12px;'>No materials</p>";
}

function updateBuildingOptions(player) {
  // Update ships
  const shipsDiv = document.getElementById("availableShips");
  if (shipsDiv) {
    const availableShips = getAvailableShips(player);
    let html = "";
    
    availableShips.slice(0, 5).forEach(({ key, ship, canBuild }) => {
      const reqText = Object.entries(ship.requires)
        .map(([mat, amt]) => `${MATERIALS[mat].symbol}${amt}`)
        .join(' ');
      
      html += `<div class="building-option ${canBuild ? 'can-build' : 'cannot-build'}" 
                    data-type="ship" data-key="${key}"
                    style="padding: 8px; margin: 4px 0; background: rgba(255,255,255,0.05); border-radius: 4px; cursor: ${canBuild ? 'pointer' : 'default'}; border-left: 3px solid ${canBuild ? '#4CAF50' : '#666'};">
        <div style="font-weight: bold; font-size: 12px;">${ship.nautical}</div>
        <div style="font-size: 10px; color: #aaa;">Tier ${ship.tier} - ${reqText}</div>
      </div>`;
    });
    
    shipsDiv.innerHTML = html || "<p style='color: #888; font-size: 11px;'>All ships built!</p>";
    
    // Add click handlers
    shipsDiv.querySelectorAll('.building-option[data-type="ship"]').forEach(el => {
      el.addEventListener('click', function() {
        const shipKey = this.getAttribute('data-key');
        if (this.classList.contains('can-build')) {
          buildShip(player, shipKey);
        }
      });
    });
  }
  
  // Update structures
  const structuresDiv = document.getElementById("availableStructures");
  if (structuresDiv) {
    const availableStructures = getAvailableStructures(player);
    let html = "";
    
    availableStructures.slice(0, 5).forEach(({ key, structure, canBuild }) => {
      const reqText = Object.entries(structure.requires)
        .map(([mat, amt]) => `${MATERIALS[mat].symbol}${amt}`)
        .join(' ');
      
      html += `<div class="building-option ${canBuild ? 'can-build' : 'cannot-build'}" 
                    data-type="structure" data-key="${key}"
                    style="padding: 8px; margin: 4px 0; background: rgba(255,255,255,0.05); border-radius: 4px; cursor: ${canBuild ? 'pointer' : 'default'}; border-left: 3px solid ${canBuild ? '#4CAF50' : '#666'};">
        <div style="font-weight: bold; font-size: 12px;">${structure.nautical}</div>
        <div style="font-size: 10px; color: #aaa;">Tier ${structure.tier} - ${reqText}</div>
      </div>`;
    });
    
    structuresDiv.innerHTML = html || "<p style='color: #888; font-size: 11px;'>All structures built!</p>";
    
    // Add click handlers
    structuresDiv.querySelectorAll('.building-option[data-type="structure"]').forEach(el => {
      el.addEventListener('click', function() {
        const structureKey = this.getAttribute('data-key');
        if (this.classList.contains('can-build')) {
          buildStructure(player, structureKey);
        }
      });
    });
  }
  
  // Update crafting options
  const craftingDiv = document.getElementById("craftingOptions");
  if (craftingDiv) {
    let html = "";
    
    for (const [matKey, matInfo] of Object.entries(MATERIALS)) {
      const recipe = CRAFTING_RECIPES[matKey];
      if (recipe && recipe.requires) {
        const canCraft = canCraftMaterial(player, matKey);
        const reqText = Object.entries(recipe.requires)
          .map(([mat, amt]) => `${MATERIALS[mat].symbol}${amt}`)
          .join(' ');
        
        html += `<div class="crafting-option ${canCraft ? 'can-craft' : 'cannot-craft'}" 
                      data-material="${matKey}"
                      style="padding: 6px; margin: 3px 0; background: rgba(255,255,255,0.05); border-radius: 3px; cursor: ${canCraft ? 'pointer' : 'default'}; border-left: 2px solid ${canCraft ? '#2196F3' : '#666'};">
          <div style="font-size: 11px;">${matInfo.symbol} ${matInfo.name}: ${reqText}</div>
        </div>`;
      }
    }
    
    craftingDiv.innerHTML = html || "<p style='color: #888; font-size: 11px;'>Gather materials first</p>";
    
    // Add click handlers
    craftingDiv.querySelectorAll('.crafting-option').forEach(el => {
      el.addEventListener('click', function() {
        const matKey = this.getAttribute('data-material');
        if (this.classList.contains('can-craft')) {
          craftMaterial(player, matKey);
        }
      });
    });
  }
}

// Building Mechanics Functions

function canCraftMaterial(player, materialType) {
  const recipe = CRAFTING_RECIPES[materialType];
  if (!recipe || !recipe.requires) return false;
  
  for (const [mat, amount] of Object.entries(recipe.requires)) {
    if ((player.materials[mat] || 0) < amount) {
      return false;
    }
  }
  return true;
}

function craftMaterial(player, materialType) {
  const recipe = CRAFTING_RECIPES[materialType];
  if (!recipe || !recipe.requires) {
    addMessage(`❌ Cannot craft ${MATERIALS[materialType].name}`);
    return false;
  }
  
  if (!canCraftMaterial(player, materialType)) {
    addMessage(`❌ Not enough materials to craft ${MATERIALS[materialType].name}`);
    return false;
  }
  
  // Consume materials
  for (const [mat, amount] of Object.entries(recipe.requires)) {
    player.materials[mat] -= amount;
  }
  
  // Add crafted material
  const output = recipe.output || 1;
  player.materials[materialType] = (player.materials[materialType] || 0) + output;
  
  addMessage(`✅ Crafted ${output}x ${MATERIALS[materialType].symbol} ${MATERIALS[materialType].name}`);
  return true;
}

function canBuildShip(player, shipKey) {
  const ship = SHIP_UPGRADES[shipKey];
  if (!ship) return false;
  
  // Check if already built
  if (player.unlockedShips.includes(shipKey)) return false;
  
  // Check material requirements
  for (const [mat, amount] of Object.entries(ship.requires)) {
    if ((player.materials[mat] || 0) < amount) {
      return false;
    }
  }
  return true;
}

function buildShip(player, shipKey) {
  const ship = SHIP_UPGRADES[shipKey];
  if (!ship) {
    addMessage(`❌ Invalid ship type`);
    return false;
  }
  
  if (player.unlockedShips.includes(shipKey)) {
    addMessage(`❌ Already built ${ship.name}`);
    return false;
  }
  
  if (!canBuildShip(player, shipKey)) {
    addMessage(`❌ Not enough materials for ${ship.name}`);
    return false;
  }
  
  // Consume materials
  for (const [mat, amount] of Object.entries(ship.requires)) {
    player.materials[mat] -= amount;
  }
  
  // Unlock ship
  player.unlockedShips.push(shipKey);
  player.currentShip = shipKey;
  player.upgrades++;
  player.points++;
  player.pointsBreakdown.upgrades++;
  
  addMessage(`⛵ Built ${ship.nautical}!`);
  return true;
}

function canBuildStructure(player, structureKey) {
  const structure = BASE_STRUCTURES[structureKey];
  if (!structure) return false;
  
  // Check if already built
  if (player.structures.includes(structureKey)) return false;
  
  // Check material requirements
  for (const [mat, amount] of Object.entries(structure.requires)) {
    if ((player.materials[mat] || 0) < amount) {
      return false;
    }
  }
  return true;
}

function buildStructure(player, structureKey) {
  const structure = BASE_STRUCTURES[structureKey];
  if (!structure) {
    addMessage(`❌ Invalid structure type`);
    return false;
  }
  
  if (player.structures.includes(structureKey)) {
    addMessage(`❌ Already built ${structure.name}`);
    return false;
  }
  
  if (!canBuildStructure(player, structureKey)) {
    addMessage(`❌ Not enough materials for ${structure.name}`);
    return false;
  }
  
  // Consume materials
  for (const [mat, amount] of Object.entries(structure.requires)) {
    player.materials[mat] -= amount;
  }
  
  // Build structure
  player.structures.push(structureKey);
  player.points++;
  player.pointsBreakdown.upgrades++;
  
  addMessage(`🏗️ Built ${structure.nautical}!`);
  return true;
}

function getAvailableShips(player) {
  const available = [];
  for (const [key, ship] of Object.entries(SHIP_UPGRADES)) {
    if (!player.unlockedShips.includes(key)) {
      const canBuild = canBuildShip(player, key);
      available.push({ key, ship, canBuild });
    }
  }
  return available.sort((a, b) => a.ship.tier - b.ship.tier);
}

function getAvailableStructures(player) {
  const available = [];
  for (const [key, structure] of Object.entries(BASE_STRUCTURES)) {
    if (!player.structures.includes(key)) {
      const canBuild = canBuildStructure(player, key);
      available.push({ key, structure, canBuild });
    }
  }
  return available.sort((a, b) => a.structure.tier - b.structure.tier);
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
