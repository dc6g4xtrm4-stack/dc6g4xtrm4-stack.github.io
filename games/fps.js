// First Person Shooter Game - Quake/Halo 2 style
// Uses Three.js for 3D rendering

let fpsGame = null;
let THREE = null;

// Load Three.js dynamically
function loadThreeJS() {
  return new Promise((resolve, reject) => {
    if (window.THREE) {
      THREE = window.THREE;
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.min.js';
    script.onload = () => {
      THREE = window.THREE;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initFPS() {
  const canvas = document.getElementById("fpsCanvas");
  if (!canvas) return;
  
  // Clean up existing game
  if (fpsGame) {
    if (fpsGame.animationId) {
      cancelAnimationFrame(fpsGame.animationId);
    }
    if (fpsGame.renderer) {
      fpsGame.renderer.dispose();
    }
    fpsGame = null;
  }
  
  // Load Three.js
  try {
    await loadThreeJS();
  } catch (error) {
    console.error('Failed to load Three.js:', error);
    return;
  }
  
  // Initialize game state
  fpsGame = {
    canvas: canvas,
    width: canvas.width,
    height: canvas.height,
    scene: null,
    camera: null,
    renderer: null,
    player: {
      position: new THREE.Vector3(0, 1.6, 5),
      velocity: new THREE.Vector3(0, 0, 0),
      health: 100,
      maxHealth: 100,
      weapon: {
        ammo: 30,
        maxAmmo: 30,
        damage: 20,
        fireRate: 0.15, // seconds
        lastShot: 0,
        reloadTime: 2.0,
        isReloading: false,
        reloadStart: 0
      },
      speed: 5,
      jumpForce: 8,
      onGround: true
    },
    enemies: [],
    bullets: [],
    obstacles: [],
    particles: [],
    mouse: {
      x: 0,
      y: 0,
      sensitivity: 0.002,
      locked: false
    },
    keys: {},
    score: 0,
    kills: 0,
    time: 0,
    gameOver: false,
    paused: false,
    raycaster: new THREE.Raycaster(),
    clock: new THREE.Clock(),
    gravity: -20,
    animationId: null
  };
  
  setupScene();
  setupLights();
  setupArena();
  spawnEnemies(5);
  setupEventListeners();
  
  // Start game loop
  fpsGameLoop();
}

function setupScene() {
  const game = fpsGame;
  
  // Create scene
  game.scene = new THREE.Scene();
  game.scene.background = new THREE.Color(0x1a1a2e);
  game.scene.fog = new THREE.Fog(0x1a1a2e, 10, 50);
  
  // Create camera
  game.camera = new THREE.PerspectiveCamera(
    75,
    game.width / game.height,
    0.1,
    100
  );
  game.camera.position.copy(game.player.position);
  
  // Create renderer
  game.renderer = new THREE.WebGLRenderer({
    canvas: game.canvas,
    antialias: true
  });
  game.renderer.setSize(game.width, game.height);
  game.renderer.shadowMap.enabled = true;
  game.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function setupLights() {
  const game = fpsGame;
  
  // Ambient light
  const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
  game.scene.add(ambientLight);
  
  // Directional light (sun)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(5, 10, 5);
  dirLight.castShadow = true;
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  game.scene.add(dirLight);
  
  // Point lights for atmosphere
  const pointLight1 = new THREE.PointLight(0x3b82f6, 1, 15);
  pointLight1.position.set(-8, 3, -8);
  game.scene.add(pointLight1);
  
  const pointLight2 = new THREE.PointLight(0xf43f5e, 1, 15);
  pointLight2.position.set(8, 3, 8);
  game.scene.add(pointLight2);
}

function setupArena() {
  const game = fpsGame;
  
  // Ground
  const groundGeometry = new THREE.PlaneGeometry(40, 40);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x2a2a3e,
    roughness: 0.8,
    metalness: 0.2
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  game.scene.add(ground);
  
  // Walls
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a3a4e,
    roughness: 0.7,
    metalness: 0.3
  });
  
  // Create perimeter walls
  const wallHeight = 4;
  const arenaSize = 20;
  
  // North wall
  const northWall = new THREE.Mesh(
    new THREE.BoxGeometry(arenaSize * 2, wallHeight, 1),
    wallMaterial
  );
  northWall.position.set(0, wallHeight / 2, -arenaSize);
  northWall.castShadow = true;
  northWall.receiveShadow = true;
  game.scene.add(northWall);
  game.obstacles.push(northWall);
  
  // South wall
  const southWall = new THREE.Mesh(
    new THREE.BoxGeometry(arenaSize * 2, wallHeight, 1),
    wallMaterial
  );
  southWall.position.set(0, wallHeight / 2, arenaSize);
  southWall.castShadow = true;
  southWall.receiveShadow = true;
  game.scene.add(southWall);
  game.obstacles.push(southWall);
  
  // East wall
  const eastWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, wallHeight, arenaSize * 2),
    wallMaterial
  );
  eastWall.position.set(arenaSize, wallHeight / 2, 0);
  eastWall.castShadow = true;
  eastWall.receiveShadow = true;
  game.scene.add(eastWall);
  game.obstacles.push(eastWall);
  
  // West wall
  const westWall = new THREE.Mesh(
    new THREE.BoxGeometry(1, wallHeight, arenaSize * 2),
    wallMaterial
  );
  westWall.position.set(-arenaSize, wallHeight / 2, 0);
  westWall.castShadow = true;
  westWall.receiveShadow = true;
  game.scene.add(westWall);
  game.obstacles.push(westWall);
  
  // Add some obstacles in the arena
  const obstacleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a4a5e,
    roughness: 0.6,
    metalness: 0.4
  });
  
  // Central pillar
  const centerPillar = new THREE.Mesh(
    new THREE.BoxGeometry(2, wallHeight, 2),
    obstacleMaterial
  );
  centerPillar.position.set(0, wallHeight / 2, 0);
  centerPillar.castShadow = true;
  centerPillar.receiveShadow = true;
  game.scene.add(centerPillar);
  game.obstacles.push(centerPillar);
  
  // Corner boxes
  const positions = [
    [-10, 1, -10],
    [10, 1, -10],
    [-10, 1, 10],
    [10, 1, 10]
  ];
  
  positions.forEach(pos => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      obstacleMaterial
    );
    box.position.set(pos[0], pos[1], pos[2]);
    box.castShadow = true;
    box.receiveShadow = true;
    game.scene.add(box);
    game.obstacles.push(box);
  });
}

function spawnEnemies(count) {
  const game = fpsGame;
  
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const radius = 10;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    const enemy = createEnemy(x, 1, z);
    game.enemies.push(enemy);
  }
}

function createEnemy(x, y, z) {
  const game = fpsGame;
  
  // Enemy body
  const geometry = new THREE.BoxGeometry(0.8, 1.8, 0.8);
  const material = new THREE.MeshStandardMaterial({ 
    color: 0xff4444,
    emissive: 0x440000,
    roughness: 0.5,
    metalness: 0.3
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  game.scene.add(mesh);
  
  // Enemy head
  const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
  const head = new THREE.Mesh(headGeometry, material);
  head.position.set(x, y + 1.2, z);
  head.castShadow = true;
  game.scene.add(head);
  
  return {
    mesh: mesh,
    head: head,
    position: new THREE.Vector3(x, y, z),
    velocity: new THREE.Vector3(0, 0, 0),
    health: 100,
    maxHealth: 100,
    speed: 2,
    detectionRange: 15,
    attackRange: 2,
    attackDamage: 10,
    attackCooldown: 1.0,
    lastAttack: 0,
    state: 'patrol', // patrol, chase, attack
    patrolTarget: new THREE.Vector3(
      x + (Math.random() - 0.5) * 10,
      y,
      z + (Math.random() - 0.5) * 10
    ),
    alive: true
  };
}

function setupEventListeners() {
  const game = fpsGame;
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (!game.mouse.locked) return;
    game.keys[e.key.toLowerCase()] = true;
    
    // Reload
    if (e.key.toLowerCase() === 'r') {
      reloadWeapon();
    }
  });
  
  document.addEventListener('keyup', (e) => {
    game.keys[e.key.toLowerCase()] = false;
  });
  
  // Mouse controls
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
    
    game.mouse.x = e.movementX;
    game.mouse.y = e.movementY;
  });
  
  // Shooting
  game.canvas.addEventListener('mousedown', (e) => {
    if (!game.mouse.locked || game.gameOver) return;
    if (e.button === 0) { // Left click
      shoot();
    }
  });
  
  // Reset button
  const resetBtn = document.getElementById('fpsResetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetFPS);
  }
}

function updatePlayer(deltaTime) {
  const game = fpsGame;
  const player = game.player;
  
  if (game.gameOver || game.paused) return;
  
  // Mouse look
  if (game.mouse.locked) {
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    euler.setFromQuaternion(game.camera.quaternion);
    
    euler.y -= game.mouse.x * game.mouse.sensitivity;
    euler.x -= game.mouse.y * game.mouse.sensitivity;
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    
    game.camera.quaternion.setFromEuler(euler);
    game.mouse.x = 0;
    game.mouse.y = 0;
  }
  
  // Movement
  const direction = new THREE.Vector3();
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  
  game.camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
  
  if (game.keys['w']) direction.add(forward);
  if (game.keys['s']) direction.sub(forward);
  if (game.keys['a']) direction.sub(right);
  if (game.keys['d']) direction.add(right);
  
  direction.normalize();
  
  // Apply movement
  player.velocity.x = direction.x * player.speed;
  player.velocity.z = direction.z * player.speed;
  
  // Jump
  if (game.keys[' '] && player.onGround) {
    player.velocity.y = player.jumpForce;
    player.onGround = false;
  }
  
  // Apply gravity
  player.velocity.y += game.gravity * deltaTime;
  
  // Update position
  player.position.x += player.velocity.x * deltaTime;
  player.position.y += player.velocity.y * deltaTime;
  player.position.z += player.velocity.z * deltaTime;
  
  // Ground collision
  if (player.position.y <= 1.6) {
    player.position.y = 1.6;
    player.velocity.y = 0;
    player.onGround = true;
  }
  
  // Wall collision (simple boundary check)
  const arenaSize = 19;
  player.position.x = Math.max(-arenaSize, Math.min(arenaSize, player.position.x));
  player.position.z = Math.max(-arenaSize, Math.min(arenaSize, player.position.z));
  
  // Update camera
  game.camera.position.copy(player.position);
  
  // Update weapon reload
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
  const playerPos = game.player.position;
  
  game.enemies.forEach(enemy => {
    if (!enemy.alive) return;
    
    const enemyPos = enemy.position;
    const distToPlayer = enemyPos.distanceTo(playerPos);
    
    // AI State machine
    if (distToPlayer < enemy.detectionRange) {
      if (distToPlayer < enemy.attackRange) {
        enemy.state = 'attack';
      } else {
        enemy.state = 'chase';
      }
    } else {
      enemy.state = 'patrol';
    }
    
    // AI behavior
    if (enemy.state === 'patrol') {
      // Move toward patrol target
      const direction = new THREE.Vector3()
        .subVectors(enemy.patrolTarget, enemyPos)
        .normalize();
      
      enemy.velocity.x = direction.x * enemy.speed * 0.5;
      enemy.velocity.z = direction.z * enemy.speed * 0.5;
      
      // Check if reached patrol target
      if (enemyPos.distanceTo(enemy.patrolTarget) < 1) {
        enemy.patrolTarget.set(
          (Math.random() - 0.5) * 30,
          enemyPos.y,
          (Math.random() - 0.5) * 30
        );
      }
    } else if (enemy.state === 'chase') {
      // Chase player
      const direction = new THREE.Vector3()
        .subVectors(playerPos, enemyPos)
        .normalize();
      
      enemy.velocity.x = direction.x * enemy.speed;
      enemy.velocity.z = direction.z * enemy.speed;
    } else if (enemy.state === 'attack') {
      // Attack player
      enemy.velocity.x = 0;
      enemy.velocity.z = 0;
      
      const currentTime = Date.now() / 1000;
      if (currentTime - enemy.lastAttack > enemy.attackCooldown) {
        // Deal damage to player
        game.player.health -= enemy.attackDamage;
        enemy.lastAttack = currentTime;
        
        if (game.player.health <= 0) {
          game.gameOver = true;
        }
      }
    }
    
    // Update position
    enemy.position.x += enemy.velocity.x * deltaTime;
    enemy.position.z += enemy.velocity.z * deltaTime;
    
    // Boundary check
    const arenaSize = 18;
    enemy.position.x = Math.max(-arenaSize, Math.min(arenaSize, enemy.position.x));
    enemy.position.z = Math.max(-arenaSize, Math.min(arenaSize, enemy.position.z));
    
    // Update mesh positions
    enemy.mesh.position.copy(enemy.position);
    enemy.head.position.set(enemy.position.x, enemy.position.y + 1.2, enemy.position.z);
    
    // Make enemy look at player when chasing/attacking
    if (enemy.state !== 'patrol') {
      enemy.mesh.lookAt(playerPos.x, enemy.position.y, playerPos.z);
      enemy.head.lookAt(playerPos.x, enemy.position.y + 1.2, playerPos.z);
    }
  });
}

function shoot() {
  const game = fpsGame;
  const weapon = game.player.weapon;
  
  if (weapon.isReloading || weapon.ammo <= 0) return;
  
  const currentTime = Date.now() / 1000;
  if (currentTime - weapon.lastShot < weapon.fireRate) return;
  
  weapon.lastShot = currentTime;
  weapon.ammo--;
  
  // Auto reload when empty
  if (weapon.ammo <= 0) {
    reloadWeapon();
  }
  
  // Raycast to detect hit
  game.raycaster.setFromCamera(new THREE.Vector2(0, 0), game.camera);
  
  // Check enemy hits
  const enemyMeshes = game.enemies
    .filter(e => e.alive)
    .flatMap(e => [e.mesh, e.head]);
  
  const intersects = game.raycaster.intersectObjects(enemyMeshes);
  
  if (intersects.length > 0) {
    const hitObject = intersects[0].object;
    const enemy = game.enemies.find(e => e.mesh === hitObject || e.head === hitObject);
    
    if (enemy && enemy.alive) {
      // Headshot bonus
      const damage = hitObject === enemy.head ? weapon.damage * 2 : weapon.damage;
      enemy.health -= damage;
      
      // Create hit particle
      createHitParticle(intersects[0].point);
      
      if (enemy.health <= 0) {
        enemy.alive = false;
        game.scene.remove(enemy.mesh);
        game.scene.remove(enemy.head);
        game.kills++;
        game.score += 100;
        
        // Respawn enemy after delay
        setTimeout(() => {
          const angle = Math.random() * Math.PI * 2;
          const radius = 15;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const newEnemy = createEnemy(x, 1, z);
          game.enemies.push(newEnemy);
        }, 3000);
      }
    }
  }
  
  // Muzzle flash
  createMuzzleFlash();
}

function reloadWeapon() {
  const game = fpsGame;
  const weapon = game.player.weapon;
  
  if (weapon.isReloading || weapon.ammo === weapon.maxAmmo) return;
  
  weapon.isReloading = true;
  weapon.reloadStart = Date.now() / 1000;
}

function createHitParticle(position) {
  const game = fpsGame;
  
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const particle = new THREE.Mesh(geometry, material);
  particle.position.copy(position);
  game.scene.add(particle);
  
  game.particles.push({
    mesh: particle,
    velocity: new THREE.Vector3(
      (Math.random() - 0.5) * 2,
      Math.random() * 2,
      (Math.random() - 0.5) * 2
    ),
    life: 0.5,
    maxLife: 0.5
  });
}

function createMuzzleFlash() {
  const game = fpsGame;
  
  const flashLight = new THREE.PointLight(0xffaa00, 2, 5);
  const forward = new THREE.Vector3();
  game.camera.getWorldDirection(forward);
  flashLight.position.copy(game.camera.position).add(forward.multiplyScalar(0.5));
  game.scene.add(flashLight);
  
  setTimeout(() => {
    game.scene.remove(flashLight);
  }, 50);
}

function updateParticles(deltaTime) {
  const game = fpsGame;
  
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const particle = game.particles[i];
    
    particle.life -= deltaTime;
    if (particle.life <= 0) {
      game.scene.remove(particle.mesh);
      game.particles.splice(i, 1);
      continue;
    }
    
    particle.mesh.position.add(particle.velocity.clone().multiplyScalar(deltaTime));
    particle.velocity.y -= 10 * deltaTime; // Gravity
    
    const opacity = particle.life / particle.maxLife;
    particle.mesh.material.opacity = opacity;
    particle.mesh.material.transparent = true;
  }
}

function updateHUD() {
  const game = fpsGame;
  
  // Update stats
  document.getElementById('fpsHealth').textContent = Math.max(0, Math.round(game.player.health));
  document.getElementById('fpsAmmo').textContent = `${game.player.weapon.ammo}/${game.player.weapon.maxAmmo}`;
  document.getElementById('fpsScore').textContent = game.score;
  document.getElementById('fpsKills').textContent = game.kills;
  
  // Reload indicator
  const reloadEl = document.getElementById('fpsReload');
  if (game.player.weapon.isReloading) {
    const progress = Math.min(100, ((Date.now() / 1000 - game.player.weapon.reloadStart) / game.player.weapon.reloadTime) * 100);
    reloadEl.textContent = `Reloading... ${Math.round(progress)}%`;
    reloadEl.style.display = 'block';
  } else {
    reloadEl.style.display = 'none';
  }
  
  // Crosshair color based on aim
  const crosshair = document.getElementById('fpsCrosshair');
  if (crosshair) {
    game.raycaster.setFromCamera(new THREE.Vector2(0, 0), game.camera);
    const enemyMeshes = game.enemies
      .filter(e => e.alive)
      .flatMap(e => [e.mesh, e.head]);
    const intersects = game.raycaster.intersectObjects(enemyMeshes);
    
    crosshair.style.borderColor = intersects.length > 0 ? '#ff4444' : '#ffffff';
  }
}

function fpsGameLoop() {
  const game = fpsGame;
  if (!game) return;
  
  const deltaTime = game.clock.getDelta();
  
  if (!game.gameOver && !game.paused) {
    updatePlayer(deltaTime);
    updateEnemies(deltaTime);
    updateParticles(deltaTime);
    game.time += deltaTime;
  }
  
  // Render
  game.renderer.render(game.scene, game.camera);
  
  // Update HUD
  updateHUD();
  
  // Game over screen
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
  if (fpsGame) {
    // Clean up
    if (fpsGame.animationId) {
      cancelAnimationFrame(fpsGame.animationId);
    }
    
    // Clear enemies
    fpsGame.enemies.forEach(enemy => {
      fpsGame.scene.remove(enemy.mesh);
      fpsGame.scene.remove(enemy.head);
    });
    
    // Clear particles
    fpsGame.particles.forEach(particle => {
      fpsGame.scene.remove(particle.mesh);
    });
    
    fpsGame = null;
  }
  
  // Hide game over screen
  const gameOverEl = document.getElementById('fpsGameOver');
  if (gameOverEl) {
    gameOverEl.style.display = 'none';
  }
  
  // Reinitialize
  initFPS();
}
