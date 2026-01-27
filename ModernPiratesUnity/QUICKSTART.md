# Modern Pirates - Quick Start Guide

## Getting Started with Unity Project

This guide will help you quickly set up and run the Modern Pirates Unity project.

### Prerequisites

1. **Install Unity Hub**
   - Download from: https://unity.com/download
   - Install Unity 2022.3.0f1 (LTS) or compatible version

2. **Clone/Download Project**
   - The Unity project is located in the `ModernPiratesUnity` folder

### Step-by-Step Setup

#### 1. Open Project in Unity

1. Launch Unity Hub
2. Click "Add" or "Open"
3. Navigate to and select the `ModernPiratesUnity` folder
4. Unity will import and configure the project (this may take a few minutes)

#### 2. Create Required Scenes

Unity projects require scenes to be created manually:

1. **Create Main Menu Scene**
   - File > New Scene
   - Save as `Assets/Scenes/MainMenu.unity`
   - Add GameObject "GameManager" with `GameManager.cs` script
   - Add GameObject "SteamManager" with `SteamManager.cs` script
   - Add GameObject "Canvas" for UI with `MainMenuUI.cs` script

2. **Create Board Game Scene**
   - File > New Scene
   - Save as `Assets/Scenes/BoardGame.unity`
   - Add GameObject "BoardGameManager" with `BoardGameManager.cs` script
   - Add Directional Light
   - Add Main Camera

3. **Create Combat Scene**
   - File > New Scene
   - Save as `Assets/Scenes/Combat.unity`
   - Add GameObject "CombatManager" with `CombatManager.cs` script
   - Add Directional Light
   - Add Main Camera

4. **Create Open World Scene**
   - File > New Scene
   - Save as `Assets/Scenes/OpenWorld.unity`
   - Add GameObject "OpenWorldManager" with `OpenWorldManager.cs` script
   - Add Directional Light
   - Add Main Camera

#### 3. Configure Build Settings

1. File > Build Settings
2. Click "Add Open Scenes" for each scene in this order:
   - MainMenu
   - BoardGame
   - Combat
   - OpenWorld
3. Platform: PC, Mac & Linux Standalone
4. Architecture: x86_64

#### 4. Create Basic Prefabs (Optional but Recommended)

**Ship Prefab:**
1. GameObject > 3D Object > Cube
2. Scale to (2, 1, 4) for ship shape
3. Add Material with blue/brown color
4. Drag to `Assets/Prefabs/` to create prefab
5. Assign to managers' `shipPrefab` field

**Island Prefab:**
1. GameObject > 3D Object > Cylinder
2. Scale to (10, 5, 10)
3. Add Material with green/brown color
4. Drag to `Assets/Prefabs/`
5. Assign to managers' `islandPrefab` field

**Loot Prefab:**
1. GameObject > 3D Object > Sphere
2. Scale to (0.5, 0.5, 0.5)
3. Add Material with yellow/gold color
4. Add SphereCollider, set to Trigger
5. Drag to `Assets/Prefabs/`
6. Assign to OpenWorldManager's `lootPrefab` field

#### 5. Run the Game

1. Open MainMenu scene
2. Click Play button in Unity Editor
3. Use UI buttons to navigate between game modes

## Gameplay Quick Reference

### Board Game Mode
- Click tiles to move
- Land on islands to capture them
- Reach 25 points to win
- Battles trigger automatically

### Combat Mode
- **WASD**: Move ship
- **Space**: Fire cannons
- **C**: Toggle camera view
- Destroy enemy ship to win

### Open World Mode
- **WASD**: Sail around
- **C**: Toggle camera
- **B**: Build base (near islands)
- Collect yellow loot spheres

## Steam Integration (Advanced)

### Enable Steam Features

1. **Install Steamworks.NET**
   - Download from: https://github.com/rlabrecque/Steamworks.NET
   - Import into Unity project
   - Or use Unity Package Manager

2. **Configure Steam**
   - Edit > Project Settings > Player > Scripting Define Symbols
   - Add: `STEAM_ENABLED`
   - Apply to all platforms

3. **Get Steam App ID**
   - Register game on Steamworks
   - Create `steam_appid.txt` in project root with your App ID

4. **Test Steam Features**
   - Run Steam client
   - Build and run game
   - Check console for Steam initialization messages

## Troubleshooting

### Common Issues

**"Script missing" warnings**
- Make sure all .cs files are in correct folders under Assets/Scripts/

**Scenes not loading**
- Verify all scenes are added to Build Settings
- Check scene names match exactly in code

**Objects not spawning**
- Assign prefabs to manager inspector fields
- Check console for errors

**Camera not following ship**
- Ensure Main Camera exists in scene
- Check manager scripts are on active GameObjects

### Getting Help

- Check the main README.md for detailed documentation
- Review script comments for implementation details
- Unity Forums: https://forum.unity.com/
- Unity Documentation: https://docs.unity3d.com/

## Next Steps

1. **Enhance Visuals**
   - Import 3D ship models
   - Add water shader
   - Create particle effects for combat

2. **Add Audio**
   - Import sound effects
   - Add background music
   - Create AudioSource components

3. **Improve UI**
   - Design custom UI elements
   - Add HUD for all modes
   - Create pause menu

4. **Polish Gameplay**
   - Balance combat difficulty
   - Add more island types
   - Implement ship upgrades

5. **Build for Distribution**
   - Optimize performance
   - Create installer
   - Submit to Steam

## Quick Testing

To quickly test each mode without full setup:

1. Open any scene
2. Add the respective manager script to an empty GameObject
3. Press Play
4. Basic functionality should work with procedurally generated objects

Happy sailing! ⛵🏴‍☠️
