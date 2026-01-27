using UnityEngine;
using System.Collections.Generic;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Manages the 80x20 board game mode with islands and ship movement.
    /// This manager is fully programmatic and requires no Unity Editor setup.
    /// All GameObjects (grid, islands, ships, camera, lighting) are created via code.
    /// </summary>
    public class BoardGameManager : MonoBehaviour
    {
        [Header("Grid Settings")]
        [SerializeField] private int gridWidth = 80;
        [SerializeField] private int gridHeight = 20;
        [SerializeField] private float cellSize = 1f;
        [SerializeField] private bool enableVisualGrid = false; // Toggle for grid visualization

        [Header("Island Settings")]
        [SerializeField] private int numberOfIslands = 15;
        
        [Header("Game State")]
        public int playerPoints = 0;
        public int targetPoints = 25;

        private GridCell[,] grid;
        private Ship playerShip;
        private List<Island> islands = new List<Island>();
        private List<EnemyShip> enemyShips = new List<EnemyShip>();
        
        private Camera mainCamera;

        private void Start()
        {
            // Ensure scene has required components (camera, lighting)
            EnsureSceneSetup();
            
            mainCamera = Camera.main;
            InitializeGrid();
            GenerateIslands();
            SpawnPlayerShip();
            SpawnEnemyShips(3);
        }

        /// <summary>
        /// Ensures the scene has all required components (camera, lighting).
        /// Creates them programmatically if they don't exist.
        /// This eliminates the need for any manual Unity Editor setup.
        /// </summary>
        private void EnsureSceneSetup()
        {
            // Check for camera - create one if none exists or main camera is null
            if (Camera.main == null)
            {
                GameObject cameraObj = new GameObject("Main Camera");
                mainCamera = cameraObj.AddComponent<Camera>();
                cameraObj.tag = "MainCamera";
                
                // Position camera for good overview of the board
                cameraObj.transform.position = new Vector3(gridWidth * cellSize / 2f, 30f, -20f);
                cameraObj.transform.rotation = Quaternion.Euler(60f, 0f, 0f);
                
                // Add audio listener (required for Unity)
                cameraObj.AddComponent<AudioListener>();
                
                Debug.Log("Created main camera programmatically");
            }
            
            // Check for directional light - create one if none exists
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
                
                // Angle the light for good visibility
                lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
                
                Debug.Log("Created directional light programmatically");
            }
        }

        /// <summary>
        /// Initializes the game grid programmatically.
        /// Creates visual grid cells if enabled using Unity primitives (no prefabs needed).
        /// </summary>
        private void InitializeGrid()
        {
            grid = new GridCell[gridWidth, gridHeight];
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    Vector3 worldPos = new Vector3(x * cellSize, 0, y * cellSize);
                    
                    // Create visual grid cell if enabled (programmatically using primitives)
                    if (enableVisualGrid)
                    {
                        // Create a thin flat cube to represent the grid cell
                        GameObject cell = GameObject.CreatePrimitive(PrimitiveType.Cube);
                        cell.name = $"GridCell_{x}_{y}";
                        cell.transform.position = worldPos;
                        cell.transform.localScale = new Vector3(cellSize * 0.95f, 0.05f, cellSize * 0.95f);
                        cell.transform.parent = transform;
                        
                        // Create and assign a semi-transparent material
                        Material cellMaterial = new Material(Shader.Find("Standard"));
                        cellMaterial.color = new Color(0.3f, 0.5f, 0.7f, 0.3f); // Semi-transparent blue
                        
                        // Enable transparency (3 = Transparent rendering mode)
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
                        
                        // Keep collider for raycasting/interaction but make it a trigger
                        // This allows mouse clicks to detect grid cells for movement
                        Collider cellCollider = cell.GetComponent<Collider>();
                        if (cellCollider != null)
                        {
                            cellCollider.isTrigger = true;
                        }
                    }
                    
                    grid[x, y] = new GridCell(x, y, worldPos);
                }
            }
            
            Debug.Log($"Grid initialized: {gridWidth}x{gridHeight} cells");
        }

        /// <summary>
        /// Generates islands programmatically using Unity primitives.
        /// No prefabs required - creates cylinders with color-coded materials based on island type.
        /// </summary>
        private void GenerateIslands()
        {
            for (int i = 0; i < numberOfIslands; i++)
            {
                // Random position that's not too close to edges
                int x = Random.Range(5, gridWidth - 5);
                int y = Random.Range(5, gridHeight - 5);
                
                // Check if position is already occupied
                if (grid[x, y].occupied)
                {
                    i--;
                    continue;
                }
                
                Vector3 worldPos = grid[x, y].worldPosition;
                IslandType islandType = GetRandomIslandType();
                
                // Create island GameObject programmatically using a primitive
                GameObject islandObj = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                islandObj.name = $"Island_{islandType}_{x}_{y}";
                islandObj.transform.position = worldPos;
                islandObj.transform.parent = transform;
                
                // Add Island component
                Island island = islandObj.AddComponent<Island>();
                island.Initialize(x, y, islandType);
                islands.Add(island);
                
                grid[x, y].occupied = true;
                grid[x, y].island = island;
            }
            
            Debug.Log($"Generated {numberOfIslands} islands programmatically");
        }

        private IslandType GetRandomIslandType()
        {
            float rand = Random.value;
            
            if (rand < 0.4f) return IslandType.Resource;
            if (rand < 0.7f) return IslandType.Harbor;
            if (rand < 0.85f) return IslandType.Treasure;
            return IslandType.Danger;
        }

        /// <summary>
        /// Spawns the player ship programmatically using Unity primitives.
        /// No prefab required - creates a cube with blue material to represent the player ship.
        /// </summary>
        private void SpawnPlayerShip()
        {
            // Spawn at bottom left area
            int startX = Random.Range(2, 8);
            int startY = Random.Range(2, 5);
            
            Vector3 worldPos = grid[startX, startY].worldPosition;
            
            // Create ship GameObject programmatically using a primitive
            GameObject shipObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            shipObj.name = "PlayerShip";
            shipObj.transform.position = worldPos + Vector3.up * 0.3f; // Slightly above grid
            
            // Add Ship component
            playerShip = shipObj.AddComponent<Ship>();
            playerShip.Initialize(startX, startY, true);
            
            grid[startX, startY].occupied = true;
            
            Debug.Log($"Player ship spawned at ({startX}, {startY})");
        }

        /// <summary>
        /// Spawns enemy ships programmatically using Unity primitives.
        /// No prefab required - creates cubes with red material to represent enemy ships.
        /// </summary>
        private void SpawnEnemyShips(int count)
        {
            for (int i = 0; i < count; i++)
            {
                // Spawn enemies in different areas
                int x = Random.Range(gridWidth / 2, gridWidth - 5);
                int y = Random.Range(5, gridHeight - 5);
                
                if (grid[x, y].occupied)
                {
                    i--;
                    continue;
                }
                
                Vector3 worldPos = grid[x, y].worldPosition;
                
                // Create enemy ship GameObject programmatically using a primitive
                GameObject enemyObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
                enemyObj.name = $"EnemyShip_{i}";
                enemyObj.transform.position = worldPos + Vector3.up * 0.3f; // Slightly above grid
                
                // Add EnemyShip component
                EnemyShip enemy = enemyObj.AddComponent<EnemyShip>();
                enemy.Initialize(x, y, false);
                enemyShips.Add(enemy);
                
                grid[x, y].occupied = true;
            }
            
            Debug.Log($"Spawned {count} enemy ships programmatically");
        }

        public void MovePlayerShip(int targetX, int targetY)
        {
            if (!IsValidMove(playerShip.gridX, playerShip.gridY, targetX, targetY))
            {
                Debug.Log("Invalid move!");
                return;
            }
            
            // Clear old position
            grid[playerShip.gridX, playerShip.gridY].occupied = false;
            
            // Update ship position
            playerShip.MoveTo(targetX, targetY);
            
            // Set new position
            grid[targetX, targetY].occupied = true;
            
            // Check for interactions
            CheckIslandInteraction(targetX, targetY);
            CheckEnemyCollision(targetX, targetY);
        }

        private bool IsValidMove(int fromX, int fromY, int toX, int toY)
        {
            // Check bounds
            if (toX < 0 || toX >= gridWidth || toY < 0 || toY >= gridHeight)
                return false;
            
            // Check distance (max 3 squares per move)
            int distance = Mathf.Abs(toX - fromX) + Mathf.Abs(toY - fromY);
            if (distance > 3)
                return false;
            
            // Check if occupied (unless it's an island or enemy)
            if (grid[toX, toY].occupied && grid[toX, toY].island == null)
                return false;
            
            return true;
        }

        private void CheckIslandInteraction(int x, int y)
        {
            Island island = grid[x, y].island;
            if (island != null && !island.captured)
            {
                // Player landed on island
                island.Capture();
                AddPoints(island.pointValue);
                
                Debug.Log($"Captured {island.islandType} island! +{island.pointValue} points");
                
                CheckWinCondition();
            }
        }

        private void CheckEnemyCollision(int x, int y)
        {
            foreach (var enemy in enemyShips)
            {
                if (enemy.gridX == x && enemy.gridY == y)
                {
                    // Trigger combat
                    StartCombat(enemy);
                    break;
                }
            }
        }

        private void StartCombat(EnemyShip enemy)
        {
            // Option 1: Resolve with dice
            bool useDiceCombat = Random.value > 0.5f; // 50% chance to use dice
            
            if (useDiceCombat)
            {
                ResolveDiceCombat(enemy);
            }
            else
            {
                // Option 2: Launch into 1st/3rd person combat
                LaunchCombatMode(enemy);
            }
        }

        private void ResolveDiceCombat(EnemyShip enemy)
        {
            // Player rolls 3 dice, enemy rolls 2 dice
            int playerRoll = RollDice(3);
            int enemyRoll = RollDice(2);
            
            Debug.Log($"Combat! Player: {playerRoll} vs Enemy: {enemyRoll}");
            
            if (playerRoll > enemyRoll)
            {
                // Player wins
                enemyShips.Remove(enemy);
                Destroy(enemy.gameObject);
                AddPoints(5);
                GameManager.Instance.playerData.battlesWon++;
                Debug.Log("Victory! +5 points");
            }
            else
            {
                // Tie or loss goes to defender (enemy)
                Debug.Log("Defeat! Enemy wins.");
                // Player loses some points or takes damage
                AddPoints(-2);
            }
        }

        private int RollDice(int count)
        {
            int total = 0;
            for (int i = 0; i < count; i++)
            {
                total += Random.Range(1, 7); // 1-6
            }
            return total;
        }

        private void LaunchCombatMode(EnemyShip enemy)
        {
            // Save combat state
            PlayerPrefs.SetInt("CombatEnemyX", enemy.gridX);
            PlayerPrefs.SetInt("CombatEnemyY", enemy.gridY);
            PlayerPrefs.Save();
            
            // Switch to combat scene
            Debug.Log("Launching combat mode!");
            GameManager.Instance.SwitchGameMode(GameManager.GameMode.Combat);
        }

        public void AddPoints(int points)
        {
            playerPoints += points;
            playerPoints = Mathf.Max(0, playerPoints); // Can't go below 0
            GameManager.Instance.playerData.totalPoints = playerPoints;
        }

        private void CheckWinCondition()
        {
            if (playerPoints >= targetPoints)
            {
                Debug.Log("Victory! You reached 25 points!");
                // Show victory screen
            }
        }

        private void Update()
        {
            // Camera follow player ship
            if (playerShip != null && mainCamera != null)
            {
                Vector3 targetPos = playerShip.transform.position + new Vector3(0, 10, -10);
                mainCamera.transform.position = Vector3.Lerp(mainCamera.transform.position, targetPos, Time.deltaTime * 2f);
                mainCamera.transform.LookAt(playerShip.transform);
            }
        }
    }

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

    public enum IslandType
    {
        Harbor,      // 2 points
        Resource,    // 1 point
        Treasure,    // 3 points
        Danger       // 0 points, damages ship
    }
}
