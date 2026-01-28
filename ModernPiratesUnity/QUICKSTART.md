# Modern Pirates - Quick Start Guide

## 🚀 NEW: Instant Setup - No Configuration Required!

This guide will help you quickly run the Modern Pirates Unity project with **ZERO manual setup**.

### Prerequisites

1. **Install Unity Hub**
   - Download from: https://unity.com/download
   - Install Unity 2022.3.0f1 (LTS) or compatible version

2. **Clone/Download Project**
   - The Unity project is located in the `ModernPiratesUnity` folder

### ⚡ Quick Start (30 seconds)

#### The Fastest Way to Run the Game:

1. **Open Project in Unity**
   - Launch Unity Hub
   - Click "Add" or "Open"
   - Navigate to and select the `ModernPiratesUnity` folder
   - Unity will import the project (may take a few minutes first time)

2. **Create Empty Scene and Run**
   - File > New Scene (or use existing scene)
   - Create empty GameObject (Right-click in Hierarchy > Create Empty)
   - Add a manager script to it:
     - For Board Game: Add `BoardGameManager` component
     - For Combat: Add `CombatManager` component
     - For Open World: Add `OpenWorldManager` component
     - For Ship Editor: Add `ShipEditorManager` component
   - **Press Play ▶️**

**Done! 🎉** The game will automatically create everything:
- Camera positioned for the mode
- Lighting for the scene
- All ships, islands, and game objects
- All materials and colors
- Physics and gameplay systems

### What Makes This Work?

**Zero Manual Setup Required:**
- ❌ No prefabs to create
- ❌ No materials to assign
- ❌ No Inspector fields to fill
- ❌ No camera setup
- ❌ No lighting setup
- ❌ No scene configuration

**Everything Is Automatic:**
- ✅ Ships created from cubes with colored materials
- ✅ Islands created from cylinders with type-based colors
- ✅ Loot created from spheres with gold materials
- ✅ Camera created and positioned if missing
- ✅ Lighting added if not present
- ✅ Ocean/environment generated as needed

### Step-by-Step First Run

#### 1. Open Project in Unity

1. Launch Unity Hub
2. Click "Add" or "Open"
3. Navigate to and select the `ModernPiratesUnity` folder
4. Unity will import and configure the project (this may take a few minutes)

#### 2. Test Board Game Mode

1. Create new scene: File > New Scene
2. In Hierarchy, right-click > Create Empty
3. Rename it to "BoardGameManager"
4. In Inspector, click "Add Component"
5. Type "BoardGameManager" and select it
6. **Press Play ▶️**

**What you'll see:**
- 80x20 grid automatically created
- Blue ship (player) spawns in bottom-left
- Red ships (enemies) spawn on right side
- Colored cylinder islands scattered across grid
- Camera automatically positioned above the board
- Everything rendered with programmatic materials

#### 3. Test Combat Mode

1. Create new scene: File > New Scene
2. Create empty GameObject
3. Add `CombatManager` component
4. **Press Play ▶️**

**What you'll see:**
- Blue ocean plane
- Blue player ship on left side
- Red enemy ship on right side
- Camera positioned for combat view
- Use WASD to move, Space to fire

#### 4. Test Open World Mode

1. Create new scene: File > New Scene
2. Create empty GameObject
3. Add `OpenWorldManager` component
4. **Press Play ▶️**

**What you'll see:**
- Large blue ocean
- 20 random islands (green cylinders)
- Brown player ship in center
- Gold loot spheres scattered around
- Use WASD to sail, collect loot

#### 5. Test Ship Editor Mode

1. Create new scene: File > New Scene
2. Create empty GameObject
3. Add `ShipEditorManager` component
4. **Press Play ▶️**

**What you'll see:**
- Dark build area with grid floor
- Brown ship base (hull) in center
- Camera positioned at angle for building
- Use keys 1-5 to select part types
- Click to place parts on the ship
- Arrow keys to rotate camera view

### Traditional Multi-Scene Setup (Optional)

If you want proper scene organization:

1. **Create Scenes Directory**
   - In Project window: Assets > Create > Folder
   - Name it "Scenes"

2. **Create and Save Scenes**
   - Create scene for each mode
   - Add respective manager GameObject to each
   - Save in Assets/Scenes/ folder

3. **Configure Build Settings**
   - File > Build Settings
2. Click "Add Open Scenes" for each scene in order
3. Platform: PC, Mac & Linux Standalone
4. Architecture: x86_64

**Note:** Camera and lighting will still be created automatically even in saved scenes!

### Understanding the Code

#### How Programmatic Creation Works

**Example from BoardGameManager.cs:**
```csharp
// Camera creation if missing
if (Camera.main == null)
{
    GameObject cameraObj = new GameObject("Main Camera");
    Camera camera = cameraObj.AddComponent<Camera>();
    cameraObj.tag = "MainCamera";
    cameraObj.transform.position = new Vector3(40f, 30f, -20f);
    // ... auto-configured
}
```

**Example ship creation:**
```csharp
// No prefab needed!
GameObject ship = GameObject.CreatePrimitive(PrimitiveType.Cube);
ship.transform.localScale = new Vector3(0.8f, 0.5f, 1.2f);

// Material created dynamically
Material material = new Material(Shader.Find("Standard"));
material.color = isPlayer ? Color.blue : Color.red;
ship.GetComponent<Renderer>().material = material;
```

#### Color Coding System

All objects are color-coded for easy identification:

**Ships:**
- 🔵 Blue: Player
- 🔴 Red: Enemy  
- 🟤 Brown: Open world player

**Islands:**
- 🔵 Blue: Harbor (heals, 2 points)
- 🟢 Green: Resource (1 point)
- 🟡 Gold: Treasure (3 points)
- 🔴 Red: Danger (damages ship)

**Loot:**
- 🟡 Gold/Yellow: Collectible treasure

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

### Ship Editor Mode
- **1-5**: Select part type (Hull, Mast, Cannon, Sail, Decoration)
- **Left Click**: Place selected part
- **Arrow Keys**: Rotate camera around ship
- **ESC**: Return to main menu
- Build and customize your ship with various parts

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

**"No camera found" warnings**
- This is normal! The warning appears briefly before the camera is created
- The manager will create a camera automatically
- If persistent, check that Camera.main is accessible

**Objects not appearing**
- Check Console for any errors
- Verify the manager script is attached to a GameObject
- Make sure you pressed Play ▶️

**Game running but nothing visible**
- Camera might be poorly positioned (rare)
- Check Scene view - objects are likely there
- Try adjusting camera position in code if needed

**Performance issues**
- Disable visual grid in BoardGameManager (enableVisualGrid = false)
- Reduce number of islands/loot in respective managers
- This is expected with primitive shapes - use models for production

**InvalidOperationException: Input System errors**
- Error: "You are trying to read Input using the UnityEngine.Input class, but you have switched active Input handling to Input System package"
- Solution: The project uses Unity's new Input System package, but the UI EventSystem requires legacy input support
- Fix: In `ProjectSettings/ProjectSettings.asset`, ensure `activeInputHandler: 2` (Both mode)
- This allows both the new Input System and legacy Input API to work together
- Already configured in the project, but may need to be reset if you change input settings

### Benefits of Programmatic Approach

**For Developers:**
- ✅ No asset dependencies
- ✅ Works in any Unity project immediately
- ✅ Easy to version control (just code)
- ✅ No broken prefab references
- ✅ Consistent across all machines
- ✅ Can run from command line builds
- ✅ Easy to test and debug

**For Teams:**
- ✅ No "prefab missing" errors
- ✅ No merge conflicts in scene files
- ✅ Anyone can run without setup instructions
- ✅ Automated testing possible
- ✅ CI/CD friendly

### Advanced: Command Line Build

Because everything is programmatic, you can build from command line:

```bash
# Build without opening Unity Editor
/path/to/Unity -quit -batchmode -projectPath . -executeMethod BuildScript.Build
```

The game will work perfectly with zero manual setup!

### Getting Help

- Check the main README.md for detailed documentation
- Review script comments for implementation details  
- All manager scripts have detailed inline documentation
- Unity Forums: https://forum.unity.com/
- Unity Documentation: https://docs.unity3d.com/

## Next Steps

Now that you have the game running with zero setup:

1. **Customize Visuals**
   - Modify colors in manager scripts
   - Adjust scale values for objects
   - Change primitive types (Cube → Sphere, etc.)

2. **Enhance Graphics (Optional)**
   - Replace primitives with imported 3D models
   - Add custom materials/textures
   - Create particle effects
   - The programmatic setup makes swapping easy!

3. **Add Features**
   - Extend manager classes
   - Add new island types with new colors
   - Implement new game modes
   - All without needing prefabs!

4. **Polish Gameplay**
   - Tweak movement speeds
   - Balance combat
   - Add more enemy AI behaviors
   - All values are in code, easy to adjust

## Key Takeaway

**This project demonstrates best practices for Unity development:**
- Programmatic initialization over manual setup
- Zero dependency on Unity Editor configuration
- Code-first approach for team collaboration
- Instant reproducibility across environments
- Easy testing and automation

Simply add a manager script and press Play. That's it! 🎮⛵🏴‍☠️
