using UnityEngine;
using System.Collections.Generic;

namespace Plunderpunk
{
    /// <summary>
    /// Core game manager for Plunderpunk board game.
    /// Tagline: "Loot Louder. Sail Faster."
    /// 
    /// Manages the game loop, board state, and player progression.
    /// Designed for future expansion with modular architecture.
    /// Based on Modern Pirates board game logic.
    /// </summary>
    public class PlunderpunkGameManager : MonoBehaviour
    {
        #region Constants
        private const string GAME_TAGLINE = "Loot Louder. Sail Faster.";
        private const int COMBAT_VICTORY_POINTS = 5;
        private const int COMBAT_DEFEAT_PENALTY = -2;
        #endregion

        #region Inspector Fields
        [Header("Game Identity")]
        [Tooltip("Plunderpunk: Loot Louder. Sail Faster.")]
        [SerializeField] private string gameTagline = GAME_TAGLINE;

        [Header("Board Settings")]
        [SerializeField] private int gridWidth = 80;
        [SerializeField] private int gridHeight = 20;
        [SerializeField] private float cellSize = 1f;
        [SerializeField] private bool enableVisualGrid = false;

        [Header("Gameplay Settings")]
        [SerializeField] private int numberOfIslands = 15;
        [SerializeField] private int numberOfEnemies = 3;
        [SerializeField] private int targetPoints = 25;

        [Header("Game State")]
        public int playerPoints = 0;
        public GameState currentState = GameState.Initializing;
        #endregion

        #region Public Properties
        /// <summary>
        /// Gets the grid width for external access (e.g., by enemy ships)
        /// </summary>
        public int GridWidth => gridWidth;
        
        /// <summary>
        /// Gets the grid height for external access (e.g., by enemy ships)
        /// </summary>
        public int GridHeight => gridHeight;
        #endregion

        #region Private Fields
        private GridCell[,] grid;
        private PlayerShip playerShip;
        private List<Island> islands = new List<Island>();
        private List<EnemyShip> enemyShips = new List<EnemyShip>();
        private Camera mainCamera;
        #endregion

        #region Game States
        public enum GameState
        {
            Initializing,
            Playing,
            Paused,
            Victory,
            Defeat
        }
        #endregion

        #region Unity Lifecycle
        private void Start()
        {
            Debug.Log($"=== {GAME_TAGLINE} ===");
            InitializeGame();
        }

        private void Update()
        {
            if (currentState == GameState.Playing)
            {
                UpdateCamera();
            }
        }
        #endregion

        #region Initialization
        /// <summary>
        /// Initializes the complete game environment.
        /// Sets up scene, grid, islands, and ships.
        /// </summary>
        private void InitializeGame()
        {
            currentState = GameState.Initializing;
            
            EnsureSceneSetup();
            InitializeGrid();
            GenerateIslands();
            SpawnPlayerShip();
            SpawnEnemyShips(numberOfEnemies);
            
            currentState = GameState.Playing;
            Debug.Log("Game initialized. Ready to plunder!");
        }

        /// <summary>
        /// Ensures the scene has all required components (camera, lighting).
        /// Creates them programmatically if they don't exist.
        /// No manual Unity Editor setup required.
        /// </summary>
        private void EnsureSceneSetup()
        {
            // Setup camera
            if (Camera.main == null)
            {
                GameObject cameraObj = new GameObject("Main Camera");
                mainCamera = cameraObj.AddComponent<Camera>();
                cameraObj.tag = "MainCamera";
                
                cameraObj.transform.position = new Vector3(gridWidth * cellSize / 2f, 30f, -20f);
                cameraObj.transform.rotation = Quaternion.Euler(60f, 0f, 0f);
                
                cameraObj.AddComponent<AudioListener>();
                Debug.Log("[Setup] Camera created");
            }
            else
            {
                mainCamera = Camera.main;
            }
            
            // Setup lighting
            Light[] lights = FindObjectsOfType<Light>();
            bool hasDirectionalLight = false;
            foreach (var light in lights)
            {
                if (light.type == LightType.Directional)
                {
                    hasDirectionalLight = true;
                    break;
                }
            }
            
            if (!hasDirectionalLight)
            {
                GameObject lightObj = new GameObject("Directional Light");
                Light light = lightObj.AddComponent<Light>();
                light.type = LightType.Directional;
                light.color = Color.white;
                light.intensity = 1f;
                lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
                Debug.Log("[Setup] Lighting created");
            }
        }

        /// <summary>
        /// Initializes the game grid.
        /// Creates visual representation if enabled.
        /// </summary>
        private void InitializeGrid()
        {
            grid = new GridCell[gridWidth, gridHeight];
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    Vector3 worldPos = new Vector3(x * cellSize, 0, y * cellSize);
                    
                    if (enableVisualGrid)
                    {
                        CreateVisualGridCell(x, y, worldPos);
                    }
                    
                    grid[x, y] = new GridCell(x, y, worldPos);
                }
            }
            
            Debug.Log($"[Grid] Initialized: {gridWidth}x{gridHeight}");
        }

        /// <summary>
        /// Creates a visual representation of a grid cell.
        /// </summary>
        private void CreateVisualGridCell(int x, int y, Vector3 worldPos)
        {
            GameObject cell = GameObject.CreatePrimitive(PrimitiveType.Cube);
            cell.name = $"GridCell_{x}_{y}";
            cell.transform.position = worldPos;
            cell.transform.localScale = new Vector3(cellSize * 0.95f, 0.05f, cellSize * 0.95f);
            cell.transform.parent = transform;
            
            Material cellMaterial = new Material(Shader.Find("Standard"));
            cellMaterial.color = new Color(0.3f, 0.5f, 0.7f, 0.3f);
            
            // Enable transparency
            cellMaterial.SetFloat("_Mode", 3);
            cellMaterial.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
            cellMaterial.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
            cellMaterial.SetInt("_ZWrite", 0);
            cellMaterial.DisableKeyword("_ALPHATEST_ON");
            cellMaterial.EnableKeyword("_ALPHABLEND_ON");
            cellMaterial.DisableKeyword("_ALPHAPREMULTIPLY_ON");
            cellMaterial.renderQueue = 3000;
            
            Renderer renderer = cell.GetComponent<Renderer>();
            renderer.material = cellMaterial;
            
            Collider cellCollider = cell.GetComponent<Collider>();
            if (cellCollider != null)
            {
                cellCollider.isTrigger = true;
            }
        }

        /// <summary>
        /// Generates islands on the game board.
        /// Each island provides different resources and challenges.
        /// </summary>
        private void GenerateIslands()
        {
            for (int i = 0; i < numberOfIslands; i++)
            {
                int x = Random.Range(5, gridWidth - 5);
                int y = Random.Range(5, gridHeight - 5);
                
                if (grid[x, y].occupied)
                {
                    i--;
                    continue;
                }
                
                Vector3 worldPos = grid[x, y].worldPosition;
                IslandType islandType = DetermineIslandType();
                
                GameObject islandObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                islandObj.name = $"Island_{islandType}_{x}_{y}";
                islandObj.transform.position = worldPos;
                islandObj.transform.parent = transform;
                
                Island island = islandObj.AddComponent<Island>();
                island.Initialize(x, y, islandType);
                islands.Add(island);
                
                grid[x, y].occupied = true;
                grid[x, y].island = island;
            }
            
            Debug.Log($"[Islands] Generated: {numberOfIslands}");
        }

        /// <summary>
        /// Determines island type based on weighted probabilities.
        /// </summary>
        private IslandType DetermineIslandType()
        {
            float rand = Random.value;
            
            if (rand < 0.4f) return IslandType.Resource;
            if (rand < 0.7f) return IslandType.Harbor;
            if (rand < 0.85f) return IslandType.Treasure;
            return IslandType.Danger;
        }

        /// <summary>
        /// Spawns the player ship at a starting position.
        /// </summary>
        private void SpawnPlayerShip()
        {
            int startX = Random.Range(2, 8);
            int startY = Random.Range(2, 5);
            
            Vector3 worldPos = grid[startX, startY].worldPosition;
            
            GameObject shipObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            shipObj.name = "PlayerShip";
            shipObj.transform.position = worldPos + Vector3.up * 0.3f;
            
            playerShip = shipObj.AddComponent<PlayerShip>();
            playerShip.Initialize(startX, startY);
            
            grid[startX, startY].occupied = true;
            Debug.Log($"[Player] Spawned at ({startX}, {startY})");
        }

        /// <summary>
        /// Spawns enemy ships on the board.
        /// </summary>
        private void SpawnEnemyShips(int count)
        {
            for (int i = 0; i < count; i++)
            {
                int x = Random.Range(gridWidth / 2, gridWidth - 5);
                int y = Random.Range(5, gridHeight - 5);
                
                if (grid[x, y].occupied)
                {
                    i--;
                    continue;
                }
                
                Vector3 worldPos = grid[x, y].worldPosition;
                
                GameObject enemyObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
                enemyObj.name = $"EnemyShip_{i}";
                enemyObj.transform.position = worldPos + Vector3.up * 0.3f;
                
                EnemyShip enemy = enemyObj.AddComponent<EnemyShip>();
                enemy.Initialize(x, y);
                enemyShips.Add(enemy);
                
                grid[x, y].occupied = true;
            }
            
            Debug.Log($"[Enemies] Spawned: {count}");
        }
        #endregion

        #region Game Loop
        /// <summary>
        /// Moves the player ship to a target position.
        /// Validates move and checks for interactions.
        /// </summary>
        public void MovePlayerShip(int targetX, int targetY)
        {
            if (currentState != GameState.Playing) return;
            
            // Null check for player ship
            if (playerShip == null)
            {
                Debug.LogWarning("[Move] Player ship not found!");
                return;
            }
            
            if (!IsValidMove(playerShip.gridX, playerShip.gridY, targetX, targetY))
            {
                Debug.Log("[Move] Invalid move!");
                return;
            }
            
            grid[playerShip.gridX, playerShip.gridY].occupied = false;
            playerShip.MoveTo(targetX, targetY);
            grid[targetX, targetY].occupied = true;
            
            CheckIslandInteraction(targetX, targetY);
            CheckEnemyCollision(targetX, targetY);
        }

        /// <summary>
        /// Validates if a move is legal.
        /// </summary>
        private bool IsValidMove(int fromX, int fromY, int toX, int toY)
        {
            if (toX < 0 || toX >= gridWidth || toY < 0 || toY >= gridHeight)
                return false;
            
            int distance = Mathf.Abs(toX - fromX) + Mathf.Abs(toY - fromY);
            if (distance > 3) return false;
            
            if (grid[toX, toY].occupied && grid[toX, toY].island == null)
                return false;
            
            return true;
        }

        /// <summary>
        /// Checks for island interaction when player lands on a cell.
        /// </summary>
        private void CheckIslandInteraction(int x, int y)
        {
            Island island = grid[x, y].island;
            if (island != null && !island.captured)
            {
                island.Capture(playerShip);
                AddPoints(island.pointValue);
                
                Debug.Log($"[Loot] Captured {island.islandType}! +{island.pointValue} points");
                CheckVictoryCondition();
            }
        }

        /// <summary>
        /// Checks for collision with enemy ships.
        /// </summary>
        private void CheckEnemyCollision(int x, int y)
        {
            // Create a copy of the list to avoid modification during iteration
            List<EnemyShip> enemiesAtPosition = new List<EnemyShip>();
            
            foreach (var enemy in enemyShips)
            {
                if (enemy != null && enemy.gridX == x && enemy.gridY == y)
                {
                    enemiesAtPosition.Add(enemy);
                }
            }
            
            // Initiate combat with the first enemy found at this position
            if (enemiesAtPosition.Count > 0)
            {
                InitiateCombat(enemiesAtPosition[0]);
            }
        }

        /// <summary>
        /// Initiates combat with an enemy ship.
        /// Uses dice-based combat resolution.
        /// </summary>
        private void InitiateCombat(EnemyShip enemy)
        {
            if (enemy == null) return;
            
            int playerRoll = RollDice(3);
            int enemyRoll = RollDice(2);
            
            Debug.Log($"[Combat] Player: {playerRoll} vs Enemy: {enemyRoll}");
            
            if (playerRoll > enemyRoll)
            {
                // Clear grid cell before removing enemy
                grid[enemy.gridX, enemy.gridY].occupied = false;
                
                enemyShips.Remove(enemy);
                Destroy(enemy.gameObject);
                AddPoints(COMBAT_VICTORY_POINTS);
                Debug.Log($"[Combat] Victory! +{COMBAT_VICTORY_POINTS} points");
            }
            else
            {
                AddPoints(COMBAT_DEFEAT_PENALTY);
                Debug.Log($"[Combat] Defeat! {COMBAT_DEFEAT_PENALTY} points");
            }
        }

        /// <summary>
        /// Rolls multiple dice and returns the total.
        /// </summary>
        private int RollDice(int count)
        {
            int total = 0;
            for (int i = 0; i < count; i++)
            {
                total += Random.Range(1, 7);
            }
            return total;
        }

        /// <summary>
        /// Adds points to the player's score.
        /// </summary>
        public void AddPoints(int points)
        {
            playerPoints += points;
            playerPoints = Mathf.Max(0, playerPoints);
        }

        /// <summary>
        /// Checks if the player has won the game.
        /// </summary>
        private void CheckVictoryCondition()
        {
            if (playerPoints >= targetPoints)
            {
                currentState = GameState.Victory;
                Debug.Log($"=== VICTORY! {GAME_TAGLINE} ===");
            }
        }

        /// <summary>
        /// Updates camera to follow the player ship.
        /// </summary>
        private void UpdateCamera()
        {
            if (playerShip != null && mainCamera != null)
            {
                Vector3 targetPos = playerShip.transform.position + new Vector3(0, 10, -10);
                mainCamera.transform.position = Vector3.Lerp(
                    mainCamera.transform.position, 
                    targetPos, 
                    Time.deltaTime * 2f
                );
                mainCamera.transform.LookAt(playerShip.transform);
            }
        }
        #endregion

        #region Public API
        /// <summary>
        /// Gets the game tagline.
        /// </summary>
        public string GetTagline()
        {
            return GAME_TAGLINE;
        }

        /// <summary>
        /// Pauses the game.
        /// </summary>
        public void PauseGame()
        {
            if (currentState == GameState.Playing)
            {
                currentState = GameState.Paused;
            }
        }

        /// <summary>
        /// Resumes the game.
        /// </summary>
        public void ResumeGame()
        {
            if (currentState == GameState.Paused)
            {
                currentState = GameState.Playing;
            }
        }

        /// <summary>
        /// Restarts the game.
        /// </summary>
        public void RestartGame()
        {
            // Clear existing game objects
            foreach (var island in islands)
            {
                if (island != null) Destroy(island.gameObject);
            }
            foreach (var enemy in enemyShips)
            {
                if (enemy != null) Destroy(enemy.gameObject);
            }
            if (playerShip != null) Destroy(playerShip.gameObject);
            
            islands.Clear();
            enemyShips.Clear();
            playerPoints = 0;
            
            // Reset grid state
            grid = null;
            
            InitializeGame();
        }
        #endregion
    }

    #region Grid System
    /// <summary>
    /// Represents a single cell in the game grid.
    /// </summary>
    public class GridCell
    {
        public int x;
        public int y;
        public Vector3 worldPosition;
        public bool occupied;
        public Island island;

        public GridCell(int x, int y, Vector3 worldPos)
        {
            this.x = x;
            this.y = y;
            this.worldPosition = worldPos;
            this.occupied = false;
            this.island = null;
        }
    }
    #endregion

    #region Island Types
    /// <summary>
    /// Defines the types of islands available in the game.
    /// </summary>
    public enum IslandType
    {
        Harbor,      // 2 points, safe harbor
        Resource,    // 1 point, basic resources
        Treasure,    // 3 points, valuable treasure
        Danger       // 0 points, hazardous location
    }
    #endregion
}
