# Setting Up the Main Menu Scene in Unity

This guide provides step-by-step instructions for setting up a simple main menu scene in Unity for the Modern Pirates game project.

## About This Guide

This guide shows you how to manually create and configure the MainMenu scene in Unity. A template scene file (`Assets/Scenes/MainMenu.unity`) is provided as a starting point with the basic GameObjects already created, but **you will need to attach the scripts yourself** by following the instructions below.

Alternatively, you can create a new scene from scratch and follow all the steps to set it up manually.

## Prerequisites

Before starting, ensure you have:
- Unity 2022.3.0f1 or later installed
- The Modern Pirates Unity project opened in Unity
- All required scripts available in the `Assets/Scripts/` folder:
  - `GameManager.cs` (in `Scripts/Managers/`)
  - `SteamManager.cs` (in `Scripts/Managers/`)
  - `MainMenuUI.cs` (in `Scripts/UI/`)

## Step-by-Step Setup Guide

You have two options for setting up the MainMenu scene:

**Option A: Use the Template Scene (Recommended)**
1. Open the existing `Assets/Scenes/MainMenu.unity` scene in Unity
2. Skip to step 2 below to attach the required scripts to the existing GameObjects

**Option B: Create a New Scene from Scratch**
1. Follow all steps below starting from step 1

### 1. Create a New Scene

1. **Open Unity**
   - Launch Unity and open the Modern Pirates project

2. **Create the Scene**
   - Go to the top menu and select **File > New Scene** to start creating a new scene
   - Save the scene by selecting **File > Save As** or pressing `Ctrl + Shift + S` (Windows) or `Cmd + Shift + S` (macOS)
   - Navigate to the `Assets/Scenes` folder
     - If the folder doesn't exist, create it first by right-clicking in the Project window and selecting **Create > Folder**
   - Save the file as `MainMenu.unity`

### 2. Add "GameManager" GameObject

1. **Create Empty GameObject**
   - In the **Hierarchy** window, right-click and select **Create Empty** to create an empty GameObject
   
2. **Rename the GameObject**
   - With the new GameObject selected, rename it to `GameManager` (press F2 or right-click > Rename)
   
3. **Attach the Script**
   - Locate the `GameManager.cs` script file in the **Project** window
     - Navigate to `Assets/Scripts/Managers/GameManager.cs`
   - Drag the `GameManager.cs` script and drop it onto the `GameManager` GameObject in the Hierarchy window
   - This attaches the script as a component to the GameObject

### 3. Add "SteamManager" GameObject

1. **Create Empty GameObject**
   - Create another empty GameObject by right-clicking in the **Hierarchy** window, then selecting **Create Empty**
   
2. **Rename the GameObject**
   - Rename this GameObject to `SteamManager`
   
3. **Attach the Script**
   - Locate the `SteamManager.cs` script in the **Project** window
     - Navigate to `Assets/Scripts/Managers/SteamManager.cs`
   - Drag the `SteamManager.cs` script from the Project window and drop it onto the `SteamManager` GameObject

### 4. Add "Canvas" GameObject for UI

1. **Create Canvas**
   - In the **Hierarchy** window, right-click or press the **+** button
   - Select **UI > Canvas** from the menu
   
2. **Verify EventSystem**
   - A new `Canvas` GameObject is automatically created
   - Unity will also automatically add an `EventSystem` GameObject if one doesn't already exist in the scene
   - This is normal and required for UI interactions
   
3. **Rename (Optional)**
   - You can rename the `Canvas` GameObject if needed, or keep it as the default name
   
4. **Attach the UI Script**
   - Locate the `MainMenuUI.cs` script in the **Project** window
     - Navigate to `Assets/Scripts/UI/MainMenuUI.cs`
   - Drag the `MainMenuUI.cs` script from the Project window and drop it onto the `Canvas` GameObject to attach the script

### 5. Save the Scene

1. **Save Your Work**
   - Once all the GameObjects are added and scripts are attached, save the scene again
   - Use **File > Save Scene** or press `Ctrl + S` (Windows) / `Cmd + S` (macOS)

## Verify Your Setup

After completing the steps above, your Hierarchy window should contain:
- Main Camera (created automatically with new scene)
- GameManager (with GameManager.cs script attached) ✓
- SteamManager (with SteamManager.cs script attached) ✓
- Canvas (with MainMenuUI.cs script attached) ✓
- EventSystem (created automatically with Canvas)

**Important**: If you opened the template scene, make sure you have completed steps 2-4 above to attach the scripts to the GameObjects. The template scene provides the GameObject structure but does **not** include the script attachments - you must add them manually.

To verify scripts are attached:
1. Select each GameObject in the Hierarchy
2. Look at the Inspector panel
3. You should see the corresponding script component listed
4. If a script is missing, drag and drop it from the Project window as described in steps 2-4

## Additional Notes

### Script Organization
- Ensure your project has the `Scripts` folder containing the required scripts:
  - `Assets/Scripts/Managers/GameManager.cs`
  - `Assets/Scripts/Managers/SteamManager.cs`
  - `Assets/Scripts/UI/MainMenuUI.cs`
- Proper organization of folders makes it easier to find scripts and assets

### Testing Your Scene
- Press **Play** (`Ctrl + P` or `Cmd + P`) to test your scene
- Check the **Console** window (Window > General > Console) to ensure no errors are present
- The GameManager and SteamManager should initialize properly
- Look for log messages indicating successful initialization

### Build Settings
After creating the MainMenu scene, you should add it to your Build Settings:
1. Go to **File > Build Settings**
2. Click **Add Open Scenes** to add the MainMenu scene
3. Ensure MainMenu is at index 0 (first scene) for it to load on game startup

## Common Issues and Solutions

### Script Not Found
If Unity shows "Script missing" warnings:
- Verify the script files are in the correct folders
- Check that the script filenames match exactly (case-sensitive)
- Reimport the scripts by right-clicking and selecting **Reimport**

### Canvas Not Displaying
If the Canvas doesn't appear correctly:
- Check that the Canvas Render Mode is set appropriately (usually Screen Space - Overlay for menus)
- Verify the EventSystem GameObject exists in the scene
- Ensure the Canvas Scaler component is attached to the Canvas

### Scripts Not Attaching
If you can't drag scripts to GameObjects:
- Ensure there are no compilation errors (check the Console window)
- Verify the script inherits from MonoBehaviour
- Try selecting the GameObject and using the **Add Component** button in the Inspector

## Next Steps

After setting up the MainMenu scene:
1. Create UI elements (buttons, text, panels) as children of the Canvas
2. Configure the MainMenuUI script references in the Inspector
3. Create additional scenes (BoardGame, Combat, OpenWorld)
4. Test scene transitions between different game modes

For more detailed information about the game modes and additional setup, refer to:
- `README.md` - Complete project documentation
- `QUICKSTART.md` - Quick start guide for the entire project
- `STEAM_INTEGRATION.md` - Steam integration details

---

**Modern Pirates © 2024**
