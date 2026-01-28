# Modern Pirates - Ready to Play!

## 🚀 Quick Start (Pull and Test)

This Unity project is **fully configured** and ready to run with **ZERO manual setup**!

### What You Get

This project includes 5 fully functional scenes:

1. **MainMenu** - Central hub to navigate between game modes
2. **BoardGame** - Turn-based strategic board game
3. **Combat** - Real-time ship-to-ship combat
4. **OpenWorld** - Free sailing exploration and resource collection
5. **ShipEditor** - Build and customize your own ships

### How to Run (3 Steps)

1. **Open in Unity Hub**
   - Add project: Select the `ModernPiratesUnity` folder
   - Unity 6000.3.5f2 or compatible version
   - Wait for import (first time only)

2. **Open MainMenu Scene**
   - In Unity Editor: `Assets/Scenes/MainMenu.unity`
   - Double-click to open

3. **Press Play ▶️**
   - Main menu loads automatically
   - Click any game mode button to play
   - All scenes are pre-configured in build settings

**That's it!** No Inspector configuration, no prefab setup, no manual scene setup required.

## 🎮 Game Modes

### Main Menu
- **Board Game**: Click to start turn-based strategy mode
- **Combat**: Click to start ship combat mode
- **Open World**: Click to explore the open seas
- **Ship Editor**: Click to design custom ships
- **Settings**: Adjust game settings (placeholder)
- **Quit**: Exit application

### Board Game Mode
- Turn-based strategy on 80x20 grid
- Capture islands for points
- First to 25 points wins
- **Controls**: Click tiles to move

### Combat Mode
- Real-time ship battles
- Destroy enemy ships
- **Controls**: WASD to move, Space to fire, C to toggle camera

### Open World Mode
- Free exploration of vast ocean
- 20 procedurally placed islands
- Collect loot and build bases
- **Controls**: WASD to sail, B to build base, C for camera

### Ship Editor Mode
- Design custom ships from parts
- Grid-based building system
- 5 part types: Hull, Mast, Cannon, Sail, Decoration
- **Controls**: 
  - 1-5 to select part type
  - Left Click to place part
  - Arrow Keys to rotate camera
  - ESC to return to main menu

## 📋 Build Settings

Already configured for PC/Mac/Linux Standalone:

```
Build Settings (File > Build Settings):
✅ MainMenu.unity (Index 0 - Startup Scene)
✅ BoardGame.unity (Index 1)
✅ Combat.unity (Index 2)
✅ OpenWorld.unity (Index 3)
✅ ShipEditor.unity (Index 4)
```

To build the game:
1. File > Build Settings
2. Click "Build" or "Build and Run"
3. Select output folder
4. Done!

## 🎯 Project Features

### Zero Configuration Design
- **No prefabs required** - All objects created programmatically
- **No manual Inspector setup** - Scripts handle all initialization
- **Automatic scene setup** - Cameras and lighting created at runtime
- **Version control friendly** - No scene merge conflicts
- **Instant reproducibility** - Works on any machine immediately

### Built-in Systems
- ✅ Scene management via GameManager singleton
- ✅ Steam integration ready (with STEAM_ENABLED define)
- ✅ Player data persistence (PlayerPrefs + Steam Cloud)
- ✅ Input System package configured
- ✅ All game modes fully playable

### Technical Stack
- **Unity Version**: 6000.3.5f2 (Unity 6)
- **Input System**: New Input System package
- **Rendering**: Built-in Render Pipeline
- **Platform**: PC, Mac & Linux Standalone
- **Architecture**: x86_64

## 🔧 Advanced: Project Settings

All critical settings are pre-configured:

### EditorBuildSettings.asset
- All 5 scenes enabled and ordered correctly
- MainMenu set as first scene (auto-loads on start)

### ProjectSettings.asset
- Product Name: "Modern Pirates"
- Company Name: "ModernPiratesStudio"
- Default Resolution: 1920x1080
- Input Handler: Both (supports new Input System + legacy for UI)

### EditorSettings.asset
- Enter Play Mode Options: Enabled (faster iteration)
- Async Shader Compilation: Enabled
- Asset Pipeline Mode: Version 2

## 🐛 Troubleshooting

### "Script missing" warnings
- Check Unity version compatibility (6000.3.5f2 recommended)
- Reimport all assets: Assets > Reimport All

### Scenes not loading
- Verify scenes are in `Assets/Scenes/` folder
- Check File > Build Settings for scene list
- Ensure MainMenu is at index 0

### Input not working
- Input System package should auto-install
- Verify in Package Manager
- Project Settings > Player > Active Input Handling = "Both"

### Build fails
- Check Console for errors
- Ensure target platform is selected in Build Settings
- Verify all scenes compile without errors

## 📚 Documentation

Additional guides in the `ModernPiratesUnity` folder:

- `QUICKSTART.md` - Detailed setup and gameplay guide
- `MAINMENU_SETUP_GUIDE.md` - Manual scene setup instructions
- `STEAM_INTEGRATION.md` - Steam integration details
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation notes

## 🎨 Customization

All game modes use programmatic object creation, making it easy to customize:

### Change Colors
Edit material colors in respective Manager scripts:
- `BoardGameManager.cs` - Board game colors
- `CombatManager.cs` - Combat mode colors
- `OpenWorldManager.cs` - Open world colors
- `ShipEditorManager.cs` - Editor part colors

### Adjust Gameplay
Modify serialized fields in Manager scripts:
- Grid size, ship counts, island numbers
- Movement speeds, combat parameters
- Camera positions and angles

### Add Features
Extend Manager classes with new functionality:
- All initialization happens in `Start()` or `InitializeX()` methods
- Follow existing pattern for programmatic creation
- No prefabs needed - just instantiate primitives!

## 🚢 Next Steps

Ready to build? Here's what to do:

1. **Test All Modes**
   - Run MainMenu scene
   - Click each button and test gameplay
   - Verify all modes work correctly

2. **Build the Game**
   - File > Build Settings > Build
   - Test standalone executable
   - Verify scene transitions work

3. **Customize**
   - Adjust colors, speeds, counts in Manager scripts
   - Add your own game mechanics
   - Replace primitive shapes with 3D models (optional)

4. **Deploy**
   - Share the built executable
   - Works out-of-the-box on any compatible system
   - No additional setup needed by end users

## ⚓ Project Philosophy

This project demonstrates **code-first Unity development**:

- **Reproducibility**: Clone, open, play - no setup
- **Collaboration**: No scene conflicts, pure code changes
- **Testing**: Easy to unit test, no prefab dependencies
- **CI/CD**: Build from command line without Editor
- **Learning**: Clear code shows exactly what's created

Perfect for teams, game jams, and rapid prototyping!

---

**Modern Pirates** - Sail the seas of code! 🏴‍☠️⛵

*Ready to test? Open MainMenu.unity and press Play!*
