// First-Person Survival Game Template
// Basic survival mechanics with resource gathering and UI
// Tech tree: stone tools -> metal tools -> guns/cannons -> machine guns/vehicles

let survivalGame = null;

// Tech Tree Definition
const TECH_TREE = {
  stone_tools: {
    name: "Stone Tools",
    description: "Basic stone weapons",
    requires: { wood: 5, stone: 10 },
    prerequisites: [],
    unlocks: ["stone_axe", "stone_spear"],
    damage: 10,
    range: 30
  },
  metal_tools: {
    name: "Metal Tools",
    description: "Iron and steel weapons",
    requires: { wood: 10, stone: 20, metal: 15 },
    prerequisites: ["stone_tools"],
    unlocks: ["metal_sword", "metal_axe"],
    damage: 25,
    range: 40
  },
  guns: {
    name: "Guns",
    description: "Early firearms",
    requires: { wood: 15, metal: 30, gunpowder: 20 },
    prerequisites: ["metal_tools"],
    unlocks: ["pistol", "rifle"],
    damage: 50,
    range: 150
  },
  cannons: {
    name: "Cannons",
    description: "Artillery weapons",
    requires: { metal: 50, gunpowder: 40 },
    prerequisites: ["guns"],
    unlocks: ["cannon"],
    damage: 100,
    range: 200
  },
  machine_guns: {
    name: "Machine Guns",
    description: "Automatic weapons",
    requires: { metal: 60, gunpowder: 50, oil: 30 },
    prerequisites: ["cannons"],
    unlocks: ["machine_gun"],
    damage: 75,
    range: 180,
    fireRate: 5
  },
  vehicles: {
    name: "Vehicles",
    description: "Armored vehicles with mounted weapons",
    requires: { metal: 100, oil: 80, electronics: 40 },
    prerequisites: ["machine_guns"],
    unlocks: ["armored_car", "tank"],
    damage: 120,
    range: 250,
    speed: 2
  }
};

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
        food: 0,
        metal: 0,
        gunpowder: 0,
        oil: 0,
        electronics: 0,
        bullets: 0
      },
      currentWeapon: null,
      unlockedTech: [],
      weapons: []
    },
    environment: {
      temperature: 20,
      time: 0
    },
    world: [],
    enemies: [],
    projectiles: [],
    buildings: [],
    camera: {
      x: 0,
      y: 0
    },
    keys: {},
    mouseX: 0,
    mouseY: 0,
    lastShot: 0
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
  
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    survivalGame.mouseX = e.clientX - rect.left;
    survivalGame.mouseY = e.clientY - rect.top;
  });
  
  canvas.addEventListener("click", (e) => {
    if (survivalGame.player.currentWeapon) {
      fireWeapon();
    }
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
  
  // Add metal ore deposits
  for (let i = 0; i < 5; i++) {
    survivalGame.world.push({
      type: "metal_ore",
      x: Math.random() * 800,
      y: Math.random() * 600,
      health: 200
    });
  }
  
  // Add oil deposits
  for (let i = 0; i < 3; i++) {
    survivalGame.world.push({
      type: "oil",
      x: Math.random() * 800,
      y: Math.random() * 600,
      health: 100
    });
  }
  
  // Spawn some enemies
  for (let i = 0; i < 3; i++) {
    survivalGame.enemies.push({
      x: Math.random() * 800,
      y: Math.random() * 800 + 200, // Spawn farther away
      health: 50,
      speed: 0.5, // Slower enemies
      damage: 2, // Less damage
      lastAttack: 0
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
  
  // Handle resource gathering (E key)
  if (survivalGame.keys["e"]) {
    gatherResources();
  }
  
  // Handle crafting (1-6 keys)
  if (survivalGame.keys["1"]) craftTech("stone_tools");
  if (survivalGame.keys["2"]) craftTech("metal_tools");
  if (survivalGame.keys["3"]) craftTech("guns");
  if (survivalGame.keys["4"]) craftTech("cannons");
  if (survivalGame.keys["5"]) craftTech("machine_guns");
  if (survivalGame.keys["6"]) craftTech("vehicles");
  
  // Boundary check
  player.x = Math.max(0, Math.min(width, player.x));
  player.y = Math.max(0, Math.min(height, player.y));
  
  // Update enemy AI
  updateSurvivalEnemies();
  
  // Update projectiles
  updateSurvivalProjectiles();
  
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
  
  // Draw metal ore
  ctx.fillStyle = "#C0C0C0";
  world.forEach(obj => {
    if (obj.type === "metal_ore") {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#A0A0A0";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  
  // Draw oil deposits
  ctx.fillStyle = "#000000";
  world.forEach(obj => {
    if (obj.type === "oil") {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333333";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  
  // Draw enemies
  ctx.fillStyle = "#FF0000";
  survivalGame.enemies.forEach(enemy => {
    if (enemy.health > 0) {
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, 12, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw health bar
      ctx.fillStyle = "#00FF00";
      ctx.fillRect(enemy.x - 15, enemy.y - 20, (enemy.health / 50) * 30, 3);
    }
  });
  
  // Draw projectiles
  ctx.fillStyle = "#FFFF00";
  survivalGame.projectiles.forEach(proj => {
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
    ctx.fill();
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
  
  // Draw tech tree progress
  ctx.textAlign = "left";
  ctx.fillText(`Tech: ${player.unlockedTech.length}/6`, 10, 20);
  if (player.currentWeapon) {
    const weaponTech = TECH_TREE[player.currentWeapon];
    ctx.fillText(`Weapon: ${weaponTech.name} (Dmg: ${weaponTech.damage})`, 10, 40);
  }
  
  // Draw crafting hints
  ctx.font = "10px Arial";
  ctx.fillStyle = "#AAAAAA";
  ctx.fillText(`Press 1-6 to craft tech | Click to attack`, 10, height - 80);
  
  // Update status elements
  document.getElementById("healthBar").textContent = Math.round(player.health);
  document.getElementById("foodBar").textContent = Math.round(player.food);
  document.getElementById("energyBar").textContent = Math.round(player.energy);
  
  // Game over check
  if (player.health <= 0) {
    player.health = 0;
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "#FF6B6B";
    ctx.font = "32px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", width / 2, height / 2);
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Click Reset to try again", width / 2, height / 2 + 40);
  }
  
  requestAnimationFrame(survivalGameLoop);
}

// Resource gathering function
function gatherResources() {
  if (!survivalGame) return;
  
  const { player, world } = survivalGame;
  const gatherRange = 40;
  
  world.forEach((obj, index) => {
    const dist = Math.hypot(obj.x - player.x, obj.y - player.y);
    
    if (dist < gatherRange) {
      if (obj.type === "tree" && obj.health > 0) {
        obj.health -= 2;
        if (obj.health <= 0) {
          player.inventory.wood += 5;
        }
      } else if (obj.type === "rock" && obj.health > 0) {
        obj.health -= 1;
        if (obj.health <= 0) {
          player.inventory.stone += 8;
        }
      } else if (obj.type === "food") {
        player.inventory.food += obj.amount;
        player.food = Math.min(100, player.food + obj.amount);
        world.splice(index, 1);
      } else if (obj.type === "metal_ore" && obj.health > 0) {
        obj.health -= 1;
        if (obj.health <= 0) {
          player.inventory.metal += 10;
        }
      } else if (obj.type === "oil" && obj.health > 0) {
        obj.health -= 1;
        if (obj.health <= 0) {
          player.inventory.oil += 15;
        }
      }
    }
  });
}

// Crafting system
function craftTech(techId) {
  if (!survivalGame) return;
  
  const tech = TECH_TREE[techId];
  if (!tech) return;
  
  const { player } = survivalGame;
  
  // Check if already unlocked
  if (player.unlockedTech.includes(techId)) {
    player.currentWeapon = techId;
    return;
  }
  
  // Check prerequisites
  for (const prereq of tech.prerequisites) {
    if (!player.unlockedTech.includes(prereq)) {
      return; // Missing prerequisite
    }
  }
  
  // Check resources
  for (const [resource, amount] of Object.entries(tech.requires)) {
    if ((player.inventory[resource] || 0) < amount) {
      return; // Not enough resources
    }
  }
  
  // Deduct resources and unlock
  for (const [resource, amount] of Object.entries(tech.requires)) {
    player.inventory[resource] -= amount;
  }
  
  player.unlockedTech.push(techId);
  player.currentWeapon = techId;
  
  // Add special resources for advanced tech
  if (techId === "guns") {
    player.inventory.gunpowder = 50;
  }
  if (techId === "machine_guns") {
    player.inventory.electronics = 20;
  }
}

// Weapon firing system
function fireWeapon() {
  if (!survivalGame || !survivalGame.player.currentWeapon) return;
  
  const { player, mouseX, mouseY } = survivalGame;
  const tech = TECH_TREE[player.currentWeapon];
  const now = Date.now();
  
  // Rate limiting
  const fireRate = tech.fireRate || 1;
  const cooldown = 1000 / fireRate;
  
  if (now - survivalGame.lastShot < cooldown) return;
  
  survivalGame.lastShot = now;
  
  // Calculate direction
  const dx = mouseX - player.x;
  const dy = mouseY - player.y;
  const dist = Math.hypot(dx, dy);
  
  if (dist === 0) return;
  
  // Create projectile
  survivalGame.projectiles.push({
    x: player.x,
    y: player.y,
    vx: (dx / dist) * 8,
    vy: (dy / dist) * 8,
    damage: tech.damage,
    range: tech.range,
    traveled: 0
  });
}

// Update projectiles
function updateSurvivalProjectiles() {
  if (!survivalGame) return;
  
  const { projectiles, enemies } = survivalGame;
  
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const proj = projectiles[i];
    
    proj.x += proj.vx;
    proj.y += proj.vy;
    proj.traveled += Math.hypot(proj.vx, proj.vy);
    
    // Remove if out of range
    if (proj.traveled > proj.range || proj.x < 0 || proj.x > 800 || proj.y < 0 || proj.y > 600) {
      projectiles.splice(i, 1);
      continue;
    }
    
    // Check collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];
      const dist = Math.hypot(proj.x - enemy.x, proj.y - enemy.y);
      
      if (dist < 12 && enemy.health > 0) {
        enemy.health -= proj.damage;
        projectiles.splice(i, 1);
        
        if (enemy.health <= 0) {
          enemies.splice(j, 1);
          // Respawn enemy after delay
          setTimeout(() => {
            if (survivalGame) {
              survivalGame.enemies.push({
                x: Math.random() * 800,
                y: Math.random() * 800 + 200,
                health: 50,
                speed: 0.5,
                damage: 2,
                lastAttack: 0
              });
            }
          }, 5000);
        }
        break;
      }
    }
  }
}

// Update enemy AI
function updateSurvivalEnemies() {
  if (!survivalGame) return;
  
  const { player, enemies } = survivalGame;
  const now = Date.now();
  
  enemies.forEach(enemy => {
    if (enemy.health <= 0) return;
    
    // Move towards player
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    
    if (dist > 15) {
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;
    } else {
      // Attack player
      if (now - enemy.lastAttack > 1000) {
        player.health -= enemy.damage;
        enemy.lastAttack = now;
      }
    }
  });
}

function resetSurvival() {
  if (survivalGame) {
    survivalGame.player.health = 100;
    survivalGame.player.food = 100;
    survivalGame.player.energy = 100;
    survivalGame.player.inventory = { 
      wood: 0, 
      stone: 0, 
      food: 0,
      metal: 0,
      gunpowder: 0,
      oil: 0,
      electronics: 0,
      bullets: 0
    };
    survivalGame.player.x = survivalGame.width / 2;
    survivalGame.player.y = survivalGame.height / 2;
    survivalGame.player.currentWeapon = null;
    survivalGame.player.unlockedTech = [];
    survivalGame.enemies = [];
    survivalGame.projectiles = [];
    survivalGame.world = [];
    initializeWorld();
    survivalGameLoop();
  }
}