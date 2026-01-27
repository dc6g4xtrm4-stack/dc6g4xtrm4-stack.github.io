# Modern Pirates - Unity Game

A comprehensive pirate-themed game featuring three distinct game modes, built with Unity and designed for Steam distribution.

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

### Installation

1. **Open in Unity**
   - Open Unity Hub
   - Add project by selecting the `ModernPiratesUnity` folder
   - Open with Unity 2022.3 or compatible version

2. **Create Scenes**
   - Create 4 scenes: `MainMenu`, `BoardGame`, `Combat`, `OpenWorld`
   - Add respective manager scripts to each scene
   - Configure scene order in Build Settings

3. **Setup Prefabs** (optional but recommended)
   - Create ship prefabs with MeshRenderer and materials
   - Create island prefabs with varied sizes
   - Create loot item prefabs
   - Assign prefabs to manager scripts

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

### Performance Considerations
- Grid-based rendering can be disabled for performance
- Object pooling recommended for projectiles and loot
- LOD (Level of Detail) can be added for distant islands
- Occlusion culling for large open world

## Credits

Developed for Steam distribution using Unity Engine.

## License

All rights reserved. Modern Pirates © 2024
