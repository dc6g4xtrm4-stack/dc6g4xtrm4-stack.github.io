// First-Person Survival Game Template
// Basic survival mechanics with resource gathering and UI

let survivalGame = null;

function initSurvival() {
  const canvas = document.getElementById("survivalCanvas");
  if (!canvas || survivalGame) return;
  
  const ctx = canvas.getContext("2d");
  
  survivalGame = {
    canvas: canvas,
    ctx: ctx,
    width: canvas.width,
    height: canvas.height,
    player: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      health: 100,
      food: 100,
      energy: 100,
      inventory: {
        wood: 0,
        stone: 0,
        food: 0
      }
    },
    environment: {
      temperature: 20,
      time: 0
    },
    world: [],
    camera: {
      x: 0,
      y: 0
    },
    keys: {}
  };
  
  // Initialize world objects (trees, rocks, etc.)
  initializeWorld();
  
  // Setup event listeners
  document.addEventListener("keydown", (e) => {
    survivalGame.keys[e.key.toLowerCase()] = true;
  });
  
  document.addEventListener("keyup", (e) => {
    survivalGame.keys[e.key.toLowerCase()] = false;
  });
  
  document.getElementById("survivalResetBtn").addEventListener("click", resetSurvival);
  
  // Start game loop
  survivalGameLoop();
}

function initializeWorld() {
  if (!survivalGame) return;
  
  // Create some resource nodes
  for (let i = 0; i < 10; i++) {
    survivalGame.world.push({
      type: "tree",
      x: Math.random() * 800,
      y: Math.random() * 600,
      health: 100
    });
  }
  
  for (let i = 0; i < 8; i++) {
    survivalGame.world.push({
      type: "rock",
      x: Math.random() * 800,
      y: Math.random() * 600,
      health: 150
    });
  }
  
  for (let i = 0; i < 5; i++) {
    survivalGame.world.push({
      type: "food",
      x: Math.random() * 800,
      y: Math.random() * 600,
      amount: 20
    });
  }
}

function survivalGameLoop() {
  if (!survivalGame) return;
  
  const { ctx, width, height, player, environment, world } = survivalGame;
  
  // Clear canvas
  ctx.fillStyle = "#1a3a1a";
  ctx.fillRect(0, 0, width, height);
  
  // Handle player movement
  const moveSpeed = 3;
  if (survivalGame.keys["w"]) player.y -= moveSpeed;
  if (survivalGame.keys["a"]) player.x -= moveSpeed;
  if (survivalGame.keys["s"]) player.y += moveSpeed;
  if (survivalGame.keys["d"]) player.x += moveSpeed;
  
  // Boundary check
  player.x = Math.max(0, Math.min(width, player.x));
  player.y = Math.max(0, Math.min(height, player.y));
  
  // Update stats
  player.energy -= 0.1;
  player.food -= 0.05;
  if (player.energy < 0) player.energy = 0;
  if (player.food < 0) {
    player.food = 0;
    player.health -= 0.1;
  }
  
  // Draw world objects
  ctx.fillStyle = "#228B22";
  world.forEach(obj => {
    if (obj.type === "tree") {
      ctx.fillRect(obj.x - 15, obj.y - 15, 30, 30);
      ctx.strokeStyle = "#1a5a1a";
      ctx.lineWidth = 2;
      ctx.strokeRect(obj.x - 15, obj.y - 15, 30, 30);
    }
  });
  
  ctx.fillStyle = "#8B4513";
  world.forEach(obj => {
    if (obj.type === "rock") {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#654321";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  
  ctx.fillStyle = "#FF6B6B";
  world.forEach(obj => {
    if (obj.type === "food") {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  
  // Draw player (first-person view representation)
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.arc(player.x, player.y, 10, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw direction indicator
  ctx.strokeStyle = "#3b82f6";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x, player.y - 15);
  ctx.stroke();
  
  // Draw HUD
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "12px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Health: ${Math.round(player.health)}%`, 10, height - 60);
  ctx.fillText(`Food: ${Math.round(player.food)}%`, 10, height - 40);
  ctx.fillText(`Energy: ${Math.round(player.energy)}%`, 10, height - 20);
  
  ctx.fillText(`Wood: ${player.inventory.wood}`, width - 120, height - 60);
  ctx.fillText(`Stone: ${player.inventory.stone}`, width - 120, height - 40);
  ctx.fillText(`Food: ${player.inventory.food}`, width - 120, height - 20);
  
  // Update status elements
  document.getElementById("healthBar").textContent = Math.round(player.health);
  document.getElementById("foodBar").textContent = Math.round(player.food);
  document.getElementById("energyBar").textContent = Math.round(player.energy);
  
  // Game over check
  if (player.health <= 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", width / 2, height / 2);
    return;
  }
  
  requestAnimationFrame(survivalGameLoop);
}

function resetSurvival() {
  if (survivalGame) {
    survivalGame.player.health = 100;
    survivalGame.player.food = 100;
    survivalGame.player.energy = 100;
    survivalGame.player.inventory = { wood: 0, stone: 0, food: 0 };
    survivalGame.player.x = survivalGame.width / 2;
    survivalGame.player.y = survivalGame.height / 2;
    survivalGameLoop();
  }
}