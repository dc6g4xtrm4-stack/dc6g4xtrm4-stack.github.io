# Steam Integration Guide for Modern Pirates

## Overview

This guide explains how to integrate Modern Pirates with Steam using Steamworks.NET.

## Prerequisites

1. Unity 2022.3.0f1 or later
2. Steam account and Steamworks partner account
3. Steamworks.NET package

## Step 1: Register Your Game on Steam

1. Go to https://partner.steamgames.com/
2. Log in with your Steamworks account
3. Create new app:
   - Name: Modern Pirates
   - Type: Game
   - Release state: Coming Soon
4. Note your App ID (you'll need this later)

## Step 2: Install Steamworks.NET

### Option A: From GitHub
1. Download latest release from: https://github.com/rlabrecque/Steamworks.NET/releases
2. Extract to your Unity project
3. Import all files into `Assets/Plugins/Steamworks.NET/`

### Option B: From Unity Package Manager (if available)
1. Window > Package Manager
2. Click "+" > Add package from git URL
3. Enter: https://github.com/rlabrecque/Steamworks.NET.git

## Step 3: Configure Unity Project

1. **Add Scripting Define Symbol**
   - Edit > Project Settings > Player
   - Expand "Other Settings"
   - Find "Scripting Define Symbols"
   - Add: `STEAM_ENABLED`
   - Click Apply

2. **Create steam_appid.txt**
   - Create a text file in your Unity project root
   - Name it `steam_appid.txt`
   - Add your Steam App ID (just the number, no other text)
   - Example: `480` (Spacewar test app)

3. **Configure Build Settings**
   - File > Build Settings
   - Platform: PC, Mac & Linux Standalone
   - Architecture: x86_64
   - Development Build: Unchecked (for release)

## Step 4: Verify Integration

1. **Run in Editor**
   - Make sure Steam client is running
   - Press Play in Unity
   - Check Console for: "Steam initialized successfully"
   - You should see your Steam username logged

2. **Test Build**
   - Build the game
   - Copy `steam_appid.txt` to build folder
   - Copy Steam DLLs to build folder:
     - Windows: `steam_api64.dll`
     - Mac: `libsteam_api.dylib`
     - Linux: `libsteam_api.so`
   - Run the executable
   - Verify Steam overlay works (Shift+Tab)

## Step 5: Configure Steam Features

### Achievements

1. **Define Achievements in Steamworks**
   - Go to your app's Steamworks page
   - Navigate to: Steamworks Admin > Stats & Achievements
   - Click "Create a new stat" or "Create a new achievement"
   - Example achievements for Modern Pirates:
     ```
     FIRST_ISLAND - Captured your first island
     BOARD_GAME_WIN - Won a board game match
     COMBAT_MASTER - Won 10 combat battles
     EXPLORER - Discovered 20 islands in open world
     BASE_BUILDER - Built 5 bases
     TREASURE_HUNTER - Collected 1000 loot
     ```

2. **Implement in Code**
   ```csharp
   // Unlock achievement when player captures first island
   if (GameManager.Instance.playerData.islandsCaptured == 1)
   {
       SteamManager.Instance?.UnlockAchievement("FIRST_ISLAND");
   }
   ```

### Cloud Saves

Cloud saves are already implemented in `SteamManager.cs`:
- Saves automatically trigger on important events
- Data is stored in Steam Cloud as `savegame.json`
- Loads automatically when game starts

To configure:
1. Steamworks Admin > Cloud
2. Enable Steam Cloud
3. Set quota (default 100MB is plenty)

### Statistics

1. **Define Stats in Steamworks**
   - Steamworks Admin > Stats & Achievements
   - Create stats:
     ```
     total_battles - Total battles fought
     total_points - Total points earned
     playtime - Total playtime in seconds
     islands_captured - Total islands captured
     ```

2. **Track in Game**
   ```csharp
   SteamManager.Instance?.SetStat("total_battles", 
       GameManager.Instance.playerData.battlesWon);
   ```

### Leaderboards (Optional)

1. **Create Leaderboard**
   - Steamworks Admin > Stats & Achievements > Leaderboards
   - Name: "High Scores"
   - Sort: Descending
   - Display: Numeric

2. **Implementation** (add to SteamManager.cs):
   ```csharp
   #if STEAM_ENABLED
   public void SubmitScore(int score)
   {
       SteamUserStats.UploadLeaderboardScore(
           leaderboardHandle, 
           ELeaderboardUploadScoreMethod.k_ELeaderboardUploadScoreMethodKeepBest,
           score, null, 0);
   }
   #endif
   ```

## Step 6: Build for Distribution

### Windows Build

1. **Build Settings**
   - Target Platform: Windows
   - Architecture: x86_64

2. **Required Files**
   ```
   ModernPirates/
   ├── ModernPirates.exe
   ├── ModernPirates_Data/
   ├── MonoBleedingEdge/
   ├── UnityCrashHandler64.exe
   ├── UnityPlayer.dll
   ├── steam_api64.dll
   └── steam_appid.txt
   ```

3. **Create Depot**
   - Steamworks Admin > SteamPipe > Depots
   - Create Windows depot
   - Upload build using ContentBuilder

### macOS Build

1. **Build Settings**
   - Target Platform: Mac OS X
   - Architecture: x86_64 or Universal

2. **Required Files**
   - Include `libsteam_api.dylib` in app bundle
   - Include `steam_appid.txt`

### Linux Build

1. **Build Settings**
   - Target Platform: Linux
   - Architecture: x86_64

2. **Required Files**
   - Include `libsteam_api.so`
   - Include `steam_appid.txt`

## Step 7: Testing

### Test with Spacewar (App ID 480)

1. Use App ID `480` in `steam_appid.txt`
2. This is Steam's test app
3. Test all Steam features work
4. No need for actual Steam app approval

### Test Your App

1. Set your actual App ID in `steam_appid.txt`
2. Build and upload to Steam
3. Mark depot as "default"
4. Set branch to "default"
5. Download through Steam client
6. Test achievements, cloud saves, etc.

## Achievement Examples for Modern Pirates

```csharp
// In BoardGameManager.cs
public void AddPoints(int points)
{
    playerPoints += points;
    GameManager.Instance.playerData.totalPoints = playerPoints;
    
    // Check for achievements
    if (playerPoints >= 25)
    {
        SteamManager.Instance?.UnlockAchievement("BOARD_GAME_WIN");
    }
}

// In CombatManager.cs
private void EndCombat(bool playerWon)
{
    if (playerWon)
    {
        GameManager.Instance.playerData.battlesWon++;
        
        if (GameManager.Instance.playerData.battlesWon >= 10)
        {
            SteamManager.Instance?.UnlockAchievement("COMBAT_MASTER");
        }
    }
}

// In OpenWorldManager.cs
private void BuildBase(Vector3 position)
{
    // ... existing code ...
    
    GameManager.Instance.playerData.basesBuilt++;
    
    if (GameManager.Instance.playerData.basesBuilt >= 5)
    {
        SteamManager.Instance?.UnlockAchievement("BASE_BUILDER");
    }
}
```

## Troubleshooting

### Steam not initializing
- Check Steam client is running
- Verify `steam_appid.txt` exists and has correct App ID
- Ensure Steam DLLs are in build folder
- Check Unity Console for error messages

### Achievements not unlocking
- Verify achievements are published in Steamworks
- Check achievement IDs match exactly
- Look for error messages in Console
- Test with Spacewar App ID first

### Cloud saves not working
- Enable Steam Cloud in Steamworks Admin
- Check file size limits
- Verify Steam user has cloud saves enabled
- Test with small save files first

## Production Checklist

Before release:

- [ ] Replace `steam_appid.txt` with production App ID
- [ ] Remove `STEAM_ENABLED` from non-Steam builds
- [ ] Test all achievements unlock correctly
- [ ] Verify cloud saves work across devices
- [ ] Test Steam overlay appears
- [ ] Submit build through ContentBuilder
- [ ] Set default depot and branch
- [ ] Request review from Steam
- [ ] Test final build through Steam client
- [ ] Configure store page
- [ ] Set release date

## Additional Resources

- Steamworks.NET Documentation: https://steamworks.github.io/
- Steamworks API Reference: https://partner.steamgames.com/doc/api
- Unity Steam Integration: https://partner.steamgames.com/doc/sdk/api/unity

## Support

For issues with:
- **Steamworks.NET**: https://github.com/rlabrecque/Steamworks.NET/issues
- **Steam Integration**: https://partner.steamgames.com/support
- **Unity Build Issues**: https://forum.unity.com/

---

Happy shipping! 🚢
