# Modern Pirates - Unity Game

A comprehensive pirate-themed game featuring three distinct game modes, built with Unity and designed for Steam distribution.

**✨ NEW: Fully Programmatic Setup - No Unity Editor Configuration Required! ✨**

This game is now completely programmatic. Simply open any scene or create an empty scene, add the appropriate manager script to a GameObject, and press Play. All visuals, camera, lighting, and game objects are created automatically via code.

## Game Modes

### 1. Board Game Mode (80x20 Grid)
- Strategic naval conquest on an 80x20 tile-based map
- Sail between islands to capture territory and earn points
- Race to 25 points to win
- Combat resolution via:
  - **Dice Combat**: 3 dice (player) vs 2 dice (enemy), ties go to defender
  - **Real-time Combat**: Launch into first/third-person combat mode

### 2. Combat Mode (First/Third Person)
- Real-time naval combat with first-person and third-person camera views
- Control your ship with WASD movement
- Fire cannons at enemy ships
- Press 'C' to toggle between camera modes
- Destroy enemy ships to win battles and return to board game

### 3. Open World Mode
- Free-roaming pirate adventure
- Sail across a vast ocean with procedurally placed islands
- Gather loot scattered across the world
- Build bases on islands
- First/third-person camera (toggle with 'C')
- Press 'B' near an island to build a base

## Controls

### Board Game Mode
- Click on grid tiles to move your ship
- Automatic combat when encountering enemies

### Combat Mode
- **W/A/S/D**: Move ship
- **Mouse/Arrow Keys**: Look around (first-person) / Turn ship
- **Space / Left Click**: Fire cannons
- **C**: Toggle first/third person camera

### Open World Mode
- **W/A/S/D**: Sail ship
- **Mouse**: Look around
- **C**: Toggle first/third person camera
- **B**: Build base (when near island)
- **Tab**: Show ship status

## Project Structure

```
ModernPiratesUnity/
├── Assets/
│   ├── Scripts/
│   │   ├── Managers/
│   │   │   ├── GameManager.cs          # Main game state management
│   │   │   └── SteamManager.cs         # Steam integration
│   │   ├── BoardGame/
│   │   │   ├── BoardGameManager.cs     # Board game mode logic
│   │   │   ├── Ship.cs                 # Ship and enemy ship classes
│   │   │   └── Island.cs               # Island management
│   │   ├── Combat/
│   │   │   ├── CombatManager.cs        # Combat mode management
│   │   │   └── CombatShip.cs           # Ship combat behavior
│   │   ├── OpenWorld/
│   │   │   ├── OpenWorldManager.cs     # Open world mode
│   │   │   └── OpenWorldShip.cs        # Player ship in open world
│   │   └── UI/
│   │       └── MainMenuUI.cs           # Main menu interface
│   ├── Scenes/                         # Unity scenes (to be created)
│   ├── Prefabs/                        # Game object prefabs
│   ├── Materials/                      # Visual materials
│   └── Textures/                       # Textures and sprites
├── ProjectSettings/
│   ├── ProjectSettings.asset           # Unity project configuration
│   └── ProjectVersion.txt              # Unity version info
└── Packages/                           # Package dependencies
```

## Features

### Game Mechanics
- **Point System**: Earn points by capturing islands and winning battles
- **Island Types**:
  - Harbor (2 points, heals ship)
  - Resource (1 point)
  - Treasure (3 points, bonus loot)
  - Danger (0 points, damages ship)
- **Ship Stats**: Health, attack power, defense, movement range
- **AI Enemies**: Basic pathfinding and combat AI
- **Persistent Save System**: Auto-save player progress

### Steam Integration (when enabled)
- Steam achievements
- Cloud saves
- Player statistics tracking
- Leaderboards support (framework ready)

## Setup Instructions

### Requirements
- Unity 2022.3.0f1 or later
- Steamworks.NET (optional, for Steam features)

### Quick Start (NEW Programmatic Approach)

The game is now **fully programmatic** and requires **no Unity Editor setup**!

#### Simplest Method - Single Step:

1. **Open in Unity**
   - Open Unity Hub
   - Add project by selecting the `ModernPiratesUnity` folder
   - Open with Unity 2022.3 or compatible version

2. **Create a Scene and Run**
   - Create a new empty scene (File > New Scene)
   - Create an empty GameObject
   - Add the manager script you want to test:
     - `BoardGameManager.cs` for board game mode
     - `CombatManager.cs` for combat mode  
     - `OpenWorldManager.cs` for open world mode
   - Press Play!

**That's it!** The manager will automatically:
- ✅ Create the camera if none exists
- ✅ Create lighting if none exists
- ✅ Generate all game objects (ships, islands, loot) programmatically
- ✅ Generate all materials and visual effects
- ✅ Set up physics and collision
- ✅ Initialize the game state

**No prefabs, no materials, no manual GameObject setup needed!**

### What Changed

Previously, this game required:
- ❌ Manual prefab creation and assignment
- ❌ Material assets created in Unity Editor
- ❌ Manual camera and lighting setup
- ❌ Inspector field configuration

Now, everything is automatic:
- ✅ All GameObjects created from Unity primitives (Cube, Sphere, Cylinder, Plane)
- ✅ Materials generated programmatically with color coding
- ✅ Camera and lighting created if missing
- ✅ Zero Inspector dependencies

### How It Works

Each manager script includes an `EnsureSceneSetup()` method that:
1. Checks if a main camera exists, creates one if not
2. Checks if directional lighting exists, creates it if not
3. Creates any additional environmental objects (ocean planes, etc.)

All game entities (ships, islands, loot) are created using:
- Unity primitives (`GameObject.CreatePrimitive()`)
- Programmatically generated materials (`new Material()`)
- Dynamic color coding based on object type
- Automatic component setup (Rigidbody, Collider, custom scripts)

### Traditional Setup (Optional)

If you prefer the traditional approach with scenes:

1. **Open in Unity**
   - Open Unity Hub
   - Add project by selecting the `ModernPiratesUnity` folder
   - Open with Unity 2022.3 or compatible version

2. **Create Scenes (Optional)**
   - Create 4 scenes: `MainMenu`, `BoardGame`, `Combat`, `OpenWorld`
   - For each scene, create an empty GameObject and add the respective manager script
   - The managers will handle all setup automatically

3. **Configure Build Settings (Optional)**
   - File > Build Settings
   - Add scenes in order if created
   - No other configuration needed!

### Color Coding Reference

The game uses color coding to distinguish different objects:

**Ships:**
- 🔵 Blue: Player ships
- 🔴 Red: Enemy ships
- 🟤 Brown: Open world player ship

**Islands (Board Game):**
- 🔵 Blue: Harbor (heals ship, 2 points)
- 🟢 Green: Resource (basic, 1 point)
- 🟡 Gold: Treasure (valuable, 3 points)
- 🔴 Red: Danger (damages ship, 0 points)

**Open World:**
- 🟢 Green/Brown: Islands
- 🟡 Gold: Loot items
- 🔵 Blue: Ocean

**Grid (if enabled):**
- 💙 Semi-transparent blue: Grid cells

4. **Enable Steam** (optional)
   - Install Steamworks.NET from Unity Asset Store or GitHub
   - Add `STEAM_ENABLED` to Scripting Define Symbols in Project Settings
   - Configure Steam App ID

### Building for Steam

1. **Build Settings**
   - File > Build Settings
   - Add all scenes in order: MainMenu, BoardGame, Combat, OpenWorld
   - Select PC, Mac & Linux Standalone
   - Architecture: x86_64

2. **Player Settings**
   - Company Name: ModernPiratesStudio
   - Product Name: Modern Pirates
   - Version: 1.0.0

3. **Steam Integration**
   - Place `steam_appid.txt` in build folder
   - Include Steam DLLs in build
   - Test with Steam running

## Development Roadmap

### Completed ✓
- [x] Core game manager and mode switching
- [x] Board game grid system (80x20)
- [x] Ship movement and AI
- [x] Island generation and interaction
- [x] Dice-based combat
- [x] First/third-person combat mode
- [x] Open world free-roaming
- [x] Loot collection system
- [x] Base building mechanics
- [x] Save/load system
- [x] Steam integration framework

### Future Enhancements
- [ ] Enhanced ship models and animations
- [ ] Weather and wind mechanics
- [ ] Multiplayer support
- [ ] More island types and events
- [ ] Ship upgrades and customization
- [ ] Quest system
- [ ] Trading mechanics
- [ ] Crew management
- [ ] Sound effects and music
- [ ] Enhanced UI/UX

## Technical Details

### Game Architecture
- **Singleton Managers**: GameManager and SteamManager persist across scenes
- **Mode-based Scenes**: Each game mode has its own scene and manager
- **Data Persistence**: PlayerData serialized to JSON
- **Modular Design**: Each mode is self-contained and independent
- **Programmatic Initialization**: All game objects, materials, and scene setup created via code
- **Zero Prefab Dependencies**: Everything built from Unity primitives
- **Automatic Scene Setup**: Camera, lighting, and environment created if missing

### Code Architecture Highlights

**EnsureSceneSetup() Pattern:**
Each manager implements this method to guarantee required scene components exist:
```csharp
private void EnsureSceneSetup()
{
    // Create camera if missing
    if (Camera.main == null) { /* create camera */ }
    
    // Create lighting if missing
    if (no directional light) { /* create light */ }
    
    // Create environment (ocean, etc.)
}
```

**Programmatic Object Creation:**
All game objects created from primitives:
```csharp
// Example: Creating a ship
GameObject ship = GameObject.CreatePrimitive(PrimitiveType.Cube);
ship.transform.localScale = new Vector3(2f, 1f, 4f);

// Create material programmatically
Material material = new Material(Shader.Find("Standard"));
material.color = new Color(0.2f, 0.4f, 0.9f); // Blue
ship.GetComponent<Renderer>().material = material;
```

**Material Generation:**
Color-coded materials created dynamically based on object type:
- Island types → Different colors (Blue/Green/Gold/Red)
- Ship teams → Blue for player, Red for enemy
- Loot → Gold with emission for visibility

### Performance Considerations
- Grid-based rendering can be disabled for performance
- Object pooling recommended for projectiles and loot
- LOD (Level of Detail) can be added for distant islands
- Occlusion culling for large open world

## Credits

Developed for Steam distribution using Unity Engine.

## License

All rights reserved. Modern Pirates © 2024
