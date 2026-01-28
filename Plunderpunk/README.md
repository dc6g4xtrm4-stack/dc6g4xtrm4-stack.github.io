# Plunderpunk

**Tagline:** "Loot Louder. Sail Faster."

## Overview

Plunderpunk is a board game implementation built in Unity, based on the Modern Pirates game logic. It features a simple board game loop with clear code structure designed for future expansion.

## Game Features

- **80x20 Grid-based Board**: Navigate a large procedurally generated game board
- **Island Types**:
  - **Harbor** (Blue): Safe harbors that heal your ship (2 points)
  - **Resource** (Green): Basic resource islands (1 point)
  - **Treasure** (Gold): Valuable treasure islands (3 points)
  - **Danger** (Red): Hazardous locations that damage your ship (0 points)
- **Ship Combat**: Dice-based combat system with enemy AI
- **Victory Condition**: Reach 25 points to win

## Architecture

The implementation follows a modular architecture with clear separation of concerns:

### Core Scripts

1. **PlunderpunkGameManager.cs**
   - Main game loop and state management
   - Board initialization and scene setup
   - Game state tracking (Initializing, Playing, Paused, Victory, Defeat)
   - Victory condition checking

2. **Ship.cs**
   - Base Ship class with health, combat stats, and movement
   - PlayerShip: Blue colored player-controlled ship
   - EnemyShip: Red colored AI-controlled ships with simple pathfinding

3. **Island.cs**
   - Island objectives with different types and effects
   - Color-coded visual representation
   - Capture mechanics and special effects

4. **PlunderpunkInput.cs**
   - Mouse click-based grid movement
   - Keyboard controls (Arrow keys and WASD)

## Design Principles

- **Programmatic Setup**: All game objects are created via code - no Unity Editor setup required
- **No Prefabs**: Uses Unity primitives (cubes, cylinders) with programmatic materials
- **Modular Architecture**: Clear class separation for easy expansion
- **Well-Documented**: Comprehensive XML documentation on all public APIs
- **Modern Pirates Reference**: Based on proven board game logic from Modern Pirates

## Future Expansion Points

The code structure is designed to support:
- Additional island types
- More complex AI behaviors
- Multiplayer support
- Power-ups and upgrades
- Save/load system integration
- Different board sizes and configurations
- Custom combat modes

## Controls

- **Mouse**: Click on grid cells to move your ship
- **Keyboard**: 
  - Arrow Keys or WASD to move one cell at a time
  - Movement range: Up to 3 cells per move

## Technical Notes

- Namespace: `Plunderpunk`
- Unity Version: Compatible with Unity 2020.3+
- Input System: Unity's new Input System (InputSystem package)
- Rendering: Standard shader with programmatic materials
- Camera: Automatically follows player ship