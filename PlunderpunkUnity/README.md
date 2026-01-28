# PlunderpunkUnity

**Tagline:** "Loot Louder. Sail Faster."

## Overview

PlunderpunkUnity is a standalone Unity implementation of the Plunderpunk board game, based on the proven game logic from Modern Pirates. This project provides an independent workspace for developing, testing, and refining the Plunderpunk board game experience.

## Project Structure

```
PlunderpunkUnity/
├── Assets/
│   ├── Scenes/
│   │   └── BoardGame.unity         # Main game scene with board layout
│   └── Scripts/
│       ├── PlunderpunkGameManager.cs  # Core game loop and state management
│       ├── Ship.cs                    # Player and Enemy ship classes
│       ├── Island.cs                  # Island objectives and effects
│       └── PlunderpunkInput.cs        # Player input handling
├── Packages/                        # Unity package dependencies
├── ProjectSettings/                 # Unity project configuration
└── README.md                        # This file
```

## Features

### Board Game Mechanics
- **80x20 Grid-based Board**: Large procedurally generated game board
- **Island Types**:
  - **Harbor** (Blue): Safe harbors that heal your ship (+2 points, +25 HP)
  - **Resource** (Green): Basic resource islands (+1 point)
  - **Treasure** (Gold): Valuable treasure islands (+3 points)
  - **Danger** (Red): Hazardous locations that damage your ship (0 points, -20 HP)
- **Ship Combat**: Dice-based combat system with enemy AI
- **Victory Condition**: Reach 25 points to win

### Game Components

#### 1. PlunderpunkGameManager
The core game manager handles:
- Game state machine (Initializing, Playing, Paused, Victory, Defeat)
- Programmatic scene setup (camera, lighting, board)
- Grid-based board generation (80x20 cells)
- Island generation with weighted probabilities
- Ship spawning (player and enemies)
- Movement validation and combat resolution
- Victory/defeat condition checking
- Camera following system

#### 2. Ship Classes
- **Ship** (Base Class): Common functionality for all ships
  - Health system (100 HP default)
  - Movement with smooth animation
  - Combat stats (attack, defense)
  - Damage and healing mechanics
  
- **PlayerShip**: Player-controlled ship
  - Blue colored for identification
  - Manual control via PlunderpunkInput
  
- **EnemyShip**: AI-controlled ships
  - Red colored for identification
  - Simple AI (50% move towards player, 50% random)
  - Configurable move interval

#### 3. Island
Island objectives with different types and effects:
- Color-coded visual representation
- Size varies by importance
- Capture mechanics with special effects
- Visual feedback when captured

#### 4. PlunderpunkInput
Player input handler supporting:
- **Mouse**: Click on grid cells to move
- **Keyboard**: Arrow keys or WASD for movement
- Raycast-based grid cell detection
- Movement range: Up to 3 cells per move

## Getting Started

### Prerequisites

- **Unity Version**: 6000.3.5f2 (or compatible version)
- **Operating System**: Windows, macOS, or Linux
- **Git**: For version control

### Opening the Project

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/dc6g4xtrm4-stack/dc6g4xtrm4-stack.github.io.git
   cd dc6g4xtrm4-stack.github.io
   ```

2. **Open Unity Hub**

3. **Add the PlunderpunkUnity project**:
   - Click "Add" in Unity Hub
   - Navigate to the `PlunderpunkUnity` folder
   - Select the folder and click "Select Folder"

4. **Open the project**:
   - The project will appear in Unity Hub
   - Click on it to open in Unity Editor

### First Launch

When you first open the project:

1. **Wait for Unity to import assets** (this may take a few minutes)

2. **Open the BoardGame scene**:
   - In the Project window, navigate to `Assets/Scenes/`
   - Double-click `BoardGame.unity`

3. **Press Play** to start the game

### Building the Game

#### Standalone Build (Windows/Mac/Linux)

1. Open Unity Editor with the PlunderpunkUnity project
2. Go to **File > Build Settings**
3. Ensure `Scenes/BoardGame` is in the "Scenes In Build" list
4. Select your target platform (PC, Mac & Linux Standalone)
5. Click "Build" and choose an output folder
6. Run the generated executable

#### WebGL Build (Browser)

1. Go to **File > Build Settings**
2. Select "WebGL" platform
3. Click "Switch Platform" if not already selected
4. Click "Build" and choose an output folder
5. Host the build folder on a web server

## Controls

### Keyboard
- **Arrow Keys** or **WASD**: Move your ship one cell at a time
- **ESC**: Pause game (functionality can be extended)

### Mouse
- **Left Click**: Click on any grid cell within movement range (3 cells) to move your ship

## Gameplay

1. **Start**: Game begins with your blue ship spawned on the board
2. **Move**: Use keyboard or mouse to navigate to islands
3. **Capture Islands**: Land on islands to capture them and gain points
4. **Avoid Danger**: Red islands damage your ship
5. **Heal**: Visit blue Harbor islands to restore health
6. **Combat**: Encounter red enemy ships and engage in dice-based combat
7. **Win**: Reach 25 points before being defeated

## Extending the Game

The project is designed for easy expansion:

### Adding New Island Types

1. Open `Island.cs`
2. Add a new value to the `IslandType` enum
3. Update the `GetIslandColor()` method
4. Add handling in `CaptureIsland()` method
5. Update island generation probabilities in `PlunderpunkGameManager.cs`

### Modifying AI Behavior

1. Open `Ship.cs`
2. Locate the `EnemyShip.MakeAIMove()` method
3. Implement your custom AI logic
4. Adjust `aiMoveInterval` for different difficulty levels

### Adding UI Elements

1. Create UI GameObjects in the `BoardGame.unity` scene
2. Add UI scripts to handle display and interaction
3. Reference `PlunderpunkGameManager` to access game state

### Implementing Save/Load

1. Create a new `SaveSystem.cs` script
2. Serialize game state (player position, points, island states)
3. Add save/load buttons in UI
4. Call save/load methods from `PlunderpunkGameManager`

## Architecture Principles

### Programmatic Setup
- **No Unity Editor Configuration Required**: All game objects are created via code
- **No Prefabs**: Uses Unity primitives (cubes, cylinders, spheres) with programmatic materials
- **Clean Scene**: The BoardGame.unity scene only contains the GameManager, Camera, and Light

### Modular Design
- **Clear Class Separation**: Each script has a single, well-defined responsibility
- **Easy to Test**: Components can be tested independently
- **Extensible**: New features can be added without modifying existing code

### Namespace Isolation
- **Namespace**: All classes use the `Plunderpunk` namespace
- **No Conflicts**: Isolated from ModernPirates and other projects
- **Standalone**: Can be extracted and used independently

## Technical Specifications

- **Unity Version**: 6000.3.5f2
- **Scripting Backend**: Mono
- **API Compatibility Level**: .NET Standard 2.1
- **Grid Size**: 80x20 cells (configurable)
- **Cell Size**: 1 unit (configurable)
- **Victory Points**: 25 (configurable)
- **Player Movement Range**: 3 cells
- **Default Islands**: 15
- **Default Enemy Ships**: 3

## Troubleshooting

### Scene is Empty
- Make sure you've opened the `BoardGame.unity` scene from `Assets/Scenes/`
- Press Play - the board is generated programmatically at runtime

### Scripts Not Compiling
- Check Unity version compatibility (6000.3.5f2 recommended)
- Ensure all script files are present in `Assets/Scripts/`
- Check the Console window for compilation errors

### Game Doesn't Start
- Verify `PlunderpunkGameManager` component is attached to the GameObject in the scene
- Verify `PlunderpunkInput` component is attached to the GameObject in the scene
- Check Console window for runtime errors

### Input Not Working
- Ensure the `PlunderpunkInput` component is enabled in the scene
- Check that Unity's Input System package is installed
- Try clicking in the Game view to ensure it has focus

## Development Workflow

### Making Changes

1. **Edit Scripts**: Modify scripts in your preferred code editor
2. **Return to Unity**: Unity will automatically recompile
3. **Test**: Press Play to test your changes
4. **Iterate**: Make adjustments and repeat

### Version Control

This project uses Git for version control:

```bash
# Check status
git status

# Add changes
git add PlunderpunkUnity/

# Commit changes
git commit -m "Descriptive message about changes"

# Push changes
git push origin main
```

### Best Practices

- **Keep the scene clean**: Add new objects programmatically in scripts
- **Use meaningful names**: Name GameObjects and variables descriptively
- **Document your code**: Add XML comments to public methods
- **Test frequently**: Press Play often to catch issues early
- **Commit often**: Make small, focused commits

## Performance Considerations

- **Board Size**: Larger boards (e.g., 100x30) may impact performance
- **Island Count**: More islands increase initial generation time
- **Enemy Count**: More enemies increase AI processing time

For optimal performance:
- Keep grid size reasonable (default 80x20 is well-tested)
- Limit enemy ships to 5-10
- Consider object pooling for large numbers of islands/ships

## Related Projects

### Modern Pirates Unity
The original inspiration for Plunderpunk, featuring:
- Board game mode (similar mechanics)
- Combat mode (ship-to-ship battles)
- Open world mode (exploration)
- Steam integration

Location: `../ModernPiratesUnity/`

### Plunderpunk (Original)
The lightweight implementation with scripts only.

Location: `../Plunderpunk/`

## Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs**: Open an issue describing the problem
2. **Suggest Features**: Open an issue with your idea
3. **Submit Pull Requests**: Fork the repo, make changes, and submit a PR
4. **Improve Documentation**: Help make this README better

## License

This project is open source and available for educational purposes.

## Credits

**Created by**: Jack Koehler

**Based on**: Modern Pirates board game logic

**Tagline**: "Loot Louder. Sail Faster."

## Links

- **Repository**: https://github.com/dc6g4xtrm4-stack/dc6g4xtrm4-stack.github.io
- **Portfolio**: https://dc6g4xtrm4-stack.github.io
- **Unity Documentation**: https://docs.unity3d.com/

## Support

For questions or issues:
- Check the Troubleshooting section above
- Review the code comments in the scripts
- Open an issue on GitHub
- Consult the Modern Pirates documentation for similar implementations

---

**Happy Plundering! ⚓️🏴‍☠️**
