using UnityEngine;

#if STEAM_ENABLED
using Steamworks;
#endif

namespace ModernPirates
{
    /// <summary>
    /// Manages Steam integration for achievements, cloud saves, etc.
    /// Requires Steamworks.NET package
    /// </summary>
    public class SteamManager : MonoBehaviour
    {
        public static SteamManager Instance { get; private set; }
        
        private bool steamInitialized = false;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                
#if STEAM_ENABLED
                InitializeSteam();
#else
                Debug.Log("Steam is not enabled. Define STEAM_ENABLED in Project Settings to enable Steam features.");
#endif
            }
            else
            {
                Destroy(gameObject);
            }
        }

#if STEAM_ENABLED
        private void InitializeSteam()
        {
            try
            {
                steamInitialized = SteamAPI.Init();
                
                if (steamInitialized)
                {
                    Debug.Log("Steam initialized successfully");
                    string playerName = SteamFriends.GetPersonaName();
                    Debug.Log($"Steam user: {playerName}");
                }
                else
                {
                    Debug.LogError("Steam initialization failed. Make sure Steam is running.");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Steam initialization exception: {e.Message}");
                steamInitialized = false;
            }
        }

        private void Update()
        {
            if (steamInitialized)
            {
                SteamAPI.RunCallbacks();
            }
        }

        private void OnApplicationQuit()
        {
            if (steamInitialized)
            {
                SteamAPI.Shutdown();
            }
        }

        // Achievement methods
        public void UnlockAchievement(string achievementId)
        {
            if (!steamInitialized) return;
            
            bool success = SteamUserStats.SetAchievement(achievementId);
            if (success)
            {
                SteamUserStats.StoreStats();
                Debug.Log($"Achievement unlocked: {achievementId}");
            }
        }

        public bool IsAchievementUnlocked(string achievementId)
        {
            if (!steamInitialized) return false;
            
            bool unlocked;
            SteamUserStats.GetAchievement(achievementId, out unlocked);
            return unlocked;
        }

        // Cloud save methods
        public void SaveToCloud(string data)
        {
            if (!steamInitialized) return;
            
            try
            {
                byte[] bytes = System.Text.Encoding.UTF8.GetBytes(data);
                SteamRemoteStorage.FileWrite("savegame.json", bytes, bytes.Length);
                Debug.Log("Game saved to Steam Cloud");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to save to Steam Cloud: {e.Message}");
            }
        }

        public string LoadFromCloud()
        {
            if (!steamInitialized) return null;
            
            try
            {
                if (SteamRemoteStorage.FileExists("savegame.json"))
                {
                    int fileSize = SteamRemoteStorage.GetFileSize("savegame.json");
                    byte[] bytes = new byte[fileSize];
                    SteamRemoteStorage.FileRead("savegame.json", bytes, fileSize);
                    string data = System.Text.Encoding.UTF8.GetString(bytes);
                    Debug.Log("Game loaded from Steam Cloud");
                    return data;
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Failed to load from Steam Cloud: {e.Message}");
            }
            
            return null;
        }

        // Stat tracking
        public void SetStat(string statName, int value)
        {
            if (!steamInitialized) return;
            
            SteamUserStats.SetStat(statName, value);
            SteamUserStats.StoreStats();
        }

        public int GetStat(string statName)
        {
            if (!steamInitialized) return 0;
            
            int value;
            SteamUserStats.GetStat(statName, out value);
            return value;
        }
#else
        // Stub methods when Steam is not enabled
        public void UnlockAchievement(string achievementId)
        {
            Debug.Log($"[Steam Disabled] Would unlock achievement: {achievementId}");
        }

        public bool IsAchievementUnlocked(string achievementId)
        {
            return false;
        }

        public void SaveToCloud(string data)
        {
            Debug.Log("[Steam Disabled] Would save to cloud");
        }

        public string LoadFromCloud()
        {
            return null;
        }

        public void SetStat(string statName, int value)
        {
            Debug.Log($"[Steam Disabled] Would set stat {statName} to {value}");
        }

        public int GetStat(string statName)
        {
            return 0;
        }
#endif
    }
}
