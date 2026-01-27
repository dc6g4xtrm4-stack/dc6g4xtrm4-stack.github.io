using UnityEngine;
using UnityEngine.SceneManagement;

namespace ModernPirates
{
    /// <summary>
    /// Main game manager that handles game mode switching and persistence
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Game Settings")]
        public GameMode currentGameMode = GameMode.MainMenu;
        
        [Header("Player Data")]
        public PlayerData playerData;

        public enum GameMode
        {
            MainMenu,
            BoardGame,
            Combat,
            OpenWorld
        }

        private void Awake()
        {
            // Singleton pattern
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
                InitializeGame();
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void InitializeGame()
        {
            // Initialize player data
            playerData = new PlayerData();
            
            // Load saved data if exists
            LoadGameData();

#if STEAM_ENABLED
            // Initialize Steam
            InitializeSteam();
#endif
        }

        public void SwitchGameMode(GameMode mode)
        {
            currentGameMode = mode;
            
            switch (mode)
            {
                case GameMode.MainMenu:
                    SceneManager.LoadScene("MainMenu");
                    break;
                case GameMode.BoardGame:
                    SceneManager.LoadScene("BoardGame");
                    break;
                case GameMode.Combat:
                    SceneManager.LoadScene("Combat");
                    break;
                case GameMode.OpenWorld:
                    SceneManager.LoadScene("OpenWorld");
                    break;
            }
        }

        public void SaveGameData()
        {
            string json = JsonUtility.ToJson(playerData);
            PlayerPrefs.SetString("PlayerData", json);
            PlayerPrefs.Save();

#if STEAM_ENABLED
            // Save to Steam Cloud
            SteamManager.Instance?.SaveToCloud(json);
#endif
        }

        public void LoadGameData()
        {
            if (PlayerPrefs.HasKey("PlayerData"))
            {
                string json = PlayerPrefs.GetString("PlayerData");
                playerData = JsonUtility.FromJson<PlayerData>(json);
            }
            
#if STEAM_ENABLED
            // Try to load from Steam Cloud
            string cloudData = SteamManager.Instance?.LoadFromCloud();
            if (!string.IsNullOrEmpty(cloudData))
            {
                playerData = JsonUtility.FromJson<PlayerData>(cloudData);
            }
#endif
        }

#if STEAM_ENABLED
        private void InitializeSteam()
        {
            try
            {
                if (Steamworks.SteamAPI.Init())
                {
                    Debug.Log("Steam initialized successfully");
                }
                else
                {
                    Debug.LogError("Steam initialization failed");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"Steam initialization exception: {e.Message}");
            }
        }

        private void OnApplicationQuit()
        {
            Steamworks.SteamAPI.Shutdown();
        }
#endif
    }

    [System.Serializable]
    public class PlayerData
    {
        public string playerName = "Captain";
        public int totalPoints = 0;
        public int battlesWon = 0;
        public int islandsCaptured = 0;
        public int upgradesPurchased = 0;
        public float playtime = 0f;
        
        // Board game data
        public int boardGameScore = 0;
        
        // Open world data
        public Vector3 openWorldPosition = Vector3.zero;
        public int lootCollected = 0;
        public int basesBuilt = 0;
    }
}
