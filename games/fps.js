// First Person Shooter Game - Wolfenstein/Doom style
// Uses raycasting for pseudo-3D rendering (no external dependencies)

let fpsGame = null;

async function initFPS() {
  const canvas = document.getElementById("fpsCanvas");
  if (!canvas) return;
  
  // Clean up existing game
  if (fpsGame) {
    if (fpsGame.animationId) {
      cancelAnimationFrame(fpsGame.animationId);
    }
    fpsGame = null;
  }
  
  // Initialize game state
  fpsGame = {
    canvas: canvas,
    ctx: canvas.getContext('2d'),
    width: canvas.width,
    height: canvas.height,
    player: {
      x: 5,
      y: 5,
      angle: 0,
      health: 100,
      maxHealth: 100,
      weapon: {
        ammo: 30,
        maxAmmo: 30,
        damage: 20,
        fireRate: 0.15,
        lastShot: 0,
        reloadTime: 2.0,
        isReloading: false,
        reloadStart: 0
      },
      speed: 3,
      rotSpeed: 0.05
    },
    enemies: [],
    map: [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,2,0,0,0,0,1],
      [1,0,0,0,0,2,2,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,2,2,2,0,0,0,0,1],
      [1,0,2,0,0,0,0,0,0,0,0,0,0,2,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,2,0,0,0,0,0,2,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,2,0,0,0,2,2,0,0,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,0,0,0,0,2,0,0,0,0,2,0,0,0,0,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    keys: {},
    mouse: {
      x: 0,
      locked: false
    },
    score: 0,
    kills: 0,
    time: 0,
    gameOver: false,
    animationId: null,
    lastTime: Date.now()
  };
  
  setupEnemies();
  setupEventListeners();
  
  // Hide start overlay on first click
  const startOverlay = document.querySelector('.fps-start-overlay');
  if (startOverlay) {
    canvas.addEventListener('click', function hideOverlay() {
      startOverlay.style.opacity = '0';
      setTimeout(() => startOverlay.style.display = 'none', 300);
      canvas.removeEventListener('click', hideOverlay);
    }, { once: true });
  }
  
  // Start game loop
  fpsGameLoop();
}

function setupEnemies() {
  const game = fpsGame;
  const positions = [
    {x: 12, y: 3},
    {x: 3, y: 12},
    {x: 13, y: 13},
    {x: 2, y: 8},
    {x: 8, y: 2}
  ];
  
  positions.forEach(pos => {
    const currentTime = Date.now() / 1000;
    game.enemies.push({
      x: pos.x,
      y: pos.y,
      health: 100,
      maxHealth: 100,
      speed: 1.0,  // Reduced speed
      detectionRange: 6,  // Reduced detection range
      attackRange: 1.2,  // Reduced attack range
      attackDamage: 8,  // Reduced damage
      attackCooldown: 1.5,  // Increased cooldown
      lastAttack: currentTime,  // Initialize to current time
      state: 'patrol',
      patrolAngle: Math.random() * Math.PI * 2,
      alive: true
    });
  });
}

function setupEventListeners() {
  const game = fpsGame;
  
  // Keyboard
  document.addEventListener('keydown', (e) => {
    game.keys[e.key.toLowerCase()] = true;
    if (e.key.toLowerCase() === 'r') {
      reloadWeapon();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
  });
  
  // Mouse look
  game.canvas.addEventListener('click', () => {
    if (!game.mouse.locked) {
      game.canvas.requestPointerLock();
    }
  });
  
  document.addEventListener('pointerlockchange', () => {
    game.mouse.locked = document.pointerLockElement === game.canvas;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!game.mouse.locked) return;
    game.player.angle += e.movementX * 0.002;
  });
  
  // Shooting
  game.canvas.addEventListener('mousedown', (e) => {
    if (!game.mouse.locked || game.gameOver) return;
    if (e.button === 0) {
      shoot();
    }
  });
  
  // Reset
  const resetBtn = document.getElementById('fpsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFPS);
  }
}

function updatePlayer(deltaTime) {
  const game = fpsGame;
  const player = game.player;
  
  if (game.gameOver) return;
  
  // Rotation with A/D or mouse
  if (game.keys['a']) player.angle -= player.rotSpeed;
  if (game.keys['d']) player.angle += player.rotSpeed;
  
  // Movement with W/S
  let moveX = 0, moveY = 0;
  if (game.keys['w']) {
    moveX = Math.cos(player.angle) * player.speed * deltaTime;
    moveY = Math.sin(player.angle) * player.speed * deltaTime;
  }
  if (game.keys['s']) {
    moveX = -Math.cos(player.angle) * player.speed * deltaTime;
    moveY = -Math.sin(player.angle) * player.speed * deltaTime;
  }
  
  // Collision detection
  const newX = player.x + moveX;
  const newY = player.y + moveY;
  const margin = 0.2;
  
  if (game.map[Math.floor(newY)][Math.floor(newX + Math.sign(moveX) * margin)] === 0) {
    player.x = newX;
  }
  if (game.map[Math.floor(newY + Math.sign(moveY) * margin)][Math.floor(newX)] === 0) {
    player.y = newY;
  }
  
  // Weapon reload
  if (player.weapon.isReloading) {
    const reloadProgress = (Date.now() / 1000 - player.weapon.reloadStart) / player.weapon.reloadTime;
    if (reloadProgress >= 1) {
      player.weapon.ammo = player.weapon.maxAmmo;
      player.weapon.isReloading = false;
    }
  }
}

function updateEnemies(deltaTime) {
  const game = fpsGame;
  const player = game.player;
  
  game.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    // AI
    if (dist < enemy.detectionRange) {
      if (dist < enemy.attackRange) {
        enemy.state = 'attack';
        const currentTime = Date.now() / 1000;
        if (currentTime - enemy.lastAttack > enemy.attackCooldown) {
          game.player.health -= enemy.attackDamage;
          enemy.lastAttack = currentTime;
          if (game.player.health <= 0) {
            game.gameOver = true;
          }
        }
      } else {
        enemy.state = 'chase';
        const angle = Math.atan2(dy, dx);
        const moveX = Math.cos(angle) * enemy.speed * deltaTime;
        const moveY = Math.sin(angle) * enemy.speed * deltaTime;
        
        const newX = enemy.x + moveX;
        const newY = enemy.y + moveY;
        
        if (game.map[Math.floor(newY)][Math.floor(newX)] === 0) {
          enemy.x = newX;
          enemy.y = newY;
        }
      }
    } else {
      enemy.state = 'patrol';
      enemy.patrolAngle += (Math.random() - 0.5) * 0.1;
      const moveX = Math.cos(enemy.patrolAngle) * enemy.speed * deltaTime * 0.5;
      const moveY = Math.sin(enemy.patrolAngle) * enemy.speed * deltaTime * 0.5;
      
      const newX = enemy.x + moveX;
      const newY = enemy.y + moveY;
      
      if (game.map[Math.floor(newY)][Math.floor(newX)] === 0) {
        enemy.x = newX;
        enemy.y = newY;
      } else {
        enemy.patrolAngle += Math.PI / 2;
      }
    }
  });
}

function castRay(x, y, angle) {
  const game = fpsGame;
  const maxDist = 20;
  const step = 0.05;
  
  for (let dist = 0; dist < maxDist; dist += step) {
    const testX = x + Math.cos(angle) * dist;
    const testY = y + Math.sin(angle) * dist;
    const mapX = Math.floor(testX);
    const mapY = Math.floor(testY);
    
    if (mapY < 0 || mapY >= game.map.length || mapX < 0 || mapX >= game.map[0].length) {
      return { dist: dist, wall: 1, x: testX, y: testY };
    }
    
    const cell = game.map[mapY][mapX];
    if (cell > 0) {
      return { dist: dist, wall: cell, x: testX, y: testY };
    }
  }
  
  return { dist: maxDist, wall: 0, x: x, y: y };
}

function render() {
  const game = fpsGame;
  const ctx = game.ctx;
  const width = game.width;
  const height = game.height;
  const player = game.player;
  
  // Clear canvas
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(0, 0, width, height);
  
  // Draw ceiling and floor
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width, height / 2);
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(0, height / 2, width, height / 2);
  
  // Raycasting
  const fov = Math.PI / 3;
  const numRays = 120;
  const rayAngleStep = fov / numRays;
  const stripWidth = width / numRays;
  
  for (let i = 0; i < numRays; i++) {
    const rayAngle = player.angle - fov / 2 + i * rayAngleStep;
    const ray = castRay(player.x, player.y, rayAngle);
    
    // Fix fish-eye effect
    const correctedDist = ray.dist * Math.cos(rayAngle - player.angle);
    const wallHeight = Math.min(height, height / correctedDist * 0.5);
    
    // Wall shading based on distance and type
    const brightness = Math.max(20, 255 - correctedDist * 25);
    let wallColor;
    if (ray.wall === 1) {
      wallColor = `rgb(${brightness * 0.4}, ${brightness * 0.4}, ${brightness * 0.6})`;
    } else if (ray.wall === 2) {
      wallColor = `rgb(${brightness * 0.6}, ${brightness * 0.3}, ${brightness * 0.3})`;
    }
    
    ctx.fillStyle = wallColor;
    ctx.fillRect(
      i * stripWidth,
      (height - wallHeight) / 2,
      stripWidth + 1,
      wallHeight
    );
  }
  
  // Draw enemies (sprites)
  game.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - player.angle;
    
    // Check if enemy is in view
    if (Math.abs(angle) < fov / 2 && dist < 15) {
      const enemyHeight = height / dist * 0.8;
      const enemyWidth = enemyHeight * 0.6;
      const screenX = width / 2 + Math.tan(angle) * width;
      
      // Simple sprite rendering
      const healthPercent = enemy.health / enemy.maxHealth;
      ctx.fillStyle = enemy.state === 'attack' ? '#ff3333' : '#ff6666';
      ctx.fillRect(
        screenX - enemyWidth / 2,
        (height - enemyHeight) / 2,
        enemyWidth,
        enemyHeight
      );
      
      // Health bar
      ctx.fillStyle = '#333';
      ctx.fillRect(screenX - enemyWidth / 2, (height - enemyHeight) / 2 - 10, enemyWidth, 5);
      ctx.fillStyle = healthPercent > 0.3 ? '#4ade80' : '#ff4444';
      ctx.fillRect(screenX - enemyWidth / 2, (height - enemyHeight) / 2 - 10, enemyWidth * healthPercent, 5);
    }
  });
  
  // Draw weapon (simple rectangle at bottom)
  const weaponWidth = 200;
  const weaponHeight = 150;
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(width / 2 - weaponWidth / 2, height - weaponHeight, weaponWidth, weaponHeight);
  ctx.fillStyle = '#4a4a5e';
  ctx.fillRect(width / 2 - weaponWidth / 2 + 20, height - weaponHeight + 20, weaponWidth - 40, weaponHeight - 40);
}

function shoot() {
  const game = fpsGame;
  const weapon = game.player.weapon;
  
  if (weapon.isReloading || weapon.ammo <= 0) return;
  
  const currentTime = Date.now() / 1000;
  if (currentTime - weapon.lastShot < weapon.fireRate) return;
  
  weapon.lastShot = currentTime;
  weapon.ammo--;
  
  if (weapon.ammo <= 0) {
    reloadWeapon();
  }
  
  // Check for enemy hits
  const ray = castRay(game.player.x, game.player.y, game.player.angle);
  
  game.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    
    const dx = enemy.x - game.player.x;
    const dy = enemy.y - game.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    const angleDiff = Math.abs(angle - game.player.angle);
    
    if (angleDiff < 0.2 && dist < ray.dist + 0.5) {
      enemy.health -= weapon.damage;
      
      if (enemy.health <= 0 && enemy.alive) {
        enemy.alive = false;
        game.kills++;
        game.score += 100;
        
        // Respawn after delay
        setTimeout(() => {
          const currentTime = Date.now() / 1000;
          enemy.health = enemy.maxHealth;
          enemy.alive = true;
          enemy.x = 5 + Math.random() * 6;
          enemy.y = 5 + Math.random() * 6;
          enemy.lastAttack = currentTime;  // Reset attack cooldown
        }, 5000);
      }
    }
  });
  
  // Muzzle flash effect
  const ctx = game.ctx;
  ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
  ctx.fillRect(0, 0, game.width, game.height);
}

function reloadWeapon() {
  const weapon = fpsGame.player.weapon;
  
  if (weapon.isReloading || weapon.ammo === weapon.maxAmmo) return;
  
  weapon.isReloading = true;
  weapon.reloadStart = Date.now() / 1000;
}

function updateHUD() {
  const game = fpsGame;
  
  document.getElementById('fpsHealth').textContent = Math.max(0, Math.round(game.player.health));
  document.getElementById('fpsAmmo').textContent = `${game.player.weapon.ammo}/${game.player.weapon.maxAmmo}`;
  document.getElementById('fpsScore').textContent = game.score;
  document.getElementById('fpsKills').textContent = game.kills;
  
  const reloadEl = document.getElementById('fpsReload');
  if (game.player.weapon.isReloading) {
    const progress = Math.min(100, ((Date.now() / 1000 - game.player.weapon.reloadStart) / game.player.weapon.reloadTime) * 100);
    reloadEl.textContent = `Reloading... ${Math.round(progress)}%`;
    reloadEl.style.display = 'block';
  } else {
    reloadEl.style.display = 'none';
  }
}

function fpsGameLoop() {
  const game = fpsGame;
  if (!game) return;
  
  const currentTime = Date.now();
  const deltaTime = (currentTime - game.lastTime) / 1000;
  game.lastTime = currentTime;
  
  if (!game.gameOver) {
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    game.time += deltaTime;
  }
  
  render();
  updateHUD();
  
  if (game.gameOver) {
    const gameOverEl = document.getElementById('fpsGameOver');
    if (gameOverEl) {
      gameOverEl.style.display = 'flex';
      document.getElementById('fpsFinalScore').textContent = game.score;
      document.getElementById('fpsFinalKills').textContent = game.kills;
    }
  }
  
  game.animationId = requestAnimationFrame(fpsGameLoop);
}

function resetFPS() {
  if (fpsGame && fpsGame.animationId) {
    cancelAnimationFrame(fpsGame.animationId);
  }
  
  const gameOverEl = document.getElementById('fpsGameOver');
  if (gameOverEl) {
    gameOverEl.style.display = 'none';
  }
  
  fpsGame = null;
  initFPS();
}
