using UnityEngine;
using System.Collections.Generic;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Manages the 80x20 board game mode with islands and ship movement
    /// </summary>
    public class BoardGameManager : MonoBehaviour
    {
        [Header("Grid Settings")]
        [SerializeField] private int gridWidth = 80;
        [SerializeField] private int gridHeight = 20;
        [SerializeField] private float cellSize = 1f;
        [SerializeField] private bool enableVisualGrid = false; // Toggle for grid visualization

        [Header("Prefabs")]
        [SerializeField] private GameObject cellPrefab;
        [SerializeField] private GameObject shipPrefab;
        [SerializeField] private GameObject islandPrefab;

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
            mainCamera = Camera.main;
            InitializeGrid();
            GenerateIslands();
            SpawnPlayerShip();
            SpawnEnemyShips(3);
        }

        private void InitializeGrid()
        {
            grid = new GridCell[gridWidth, gridHeight];
            
            for (int x = 0; x < gridWidth; x++)
            {
                for (int y = 0; y < gridHeight; y++)
                {
                    Vector3 worldPos = new Vector3(x * cellSize, 0, y * cellSize);
                    
                    // Create visual grid cell if enabled
                    if (enableVisualGrid && cellPrefab != null)
                    {
                        GameObject cell = Instantiate(cellPrefab, worldPos, Quaternion.identity);
                        cell.transform.parent = transform;
                    }
                    
                    grid[x, y] = new GridCell(x, y, worldPos);
                }
            }
        }

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
                GameObject islandObj = Instantiate(islandPrefab, worldPos, Quaternion.identity);
                islandObj.transform.parent = transform;
                
                Island island = islandObj.GetComponent<Island>();
                if (island == null)
                {
                    island = islandObj.AddComponent<Island>();
                }
                
                island.Initialize(x, y, GetRandomIslandType());
                islands.Add(island);
                
                grid[x, y].occupied = true;
                grid[x, y].island = island;
            }
        }

        private IslandType GetRandomIslandType()
        {
            float rand = Random.value;
            
            if (rand < 0.4f) return IslandType.Resource;
            if (rand < 0.7f) return IslandType.Harbor;
            if (rand < 0.85f) return IslandType.Treasure;
            return IslandType.Danger;
        }

        private void SpawnPlayerShip()
        {
            // Spawn at bottom left area
            int startX = Random.Range(2, 8);
            int startY = Random.Range(2, 5);
            
            Vector3 worldPos = grid[startX, startY].worldPosition;
            GameObject shipObj = Instantiate(shipPrefab, worldPos, Quaternion.identity);
            
            playerShip = shipObj.GetComponent<Ship>();
            if (playerShip == null)
            {
                playerShip = shipObj.AddComponent<Ship>();
            }
            
            playerShip.Initialize(startX, startY, true);
            grid[startX, startY].occupied = true;
        }

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
                GameObject enemyObj = Instantiate(shipPrefab, worldPos, Quaternion.identity);
                
                EnemyShip enemy = enemyObj.GetComponent<EnemyShip>();
                if (enemy == null)
                {
                    enemy = enemyObj.AddComponent<EnemyShip>();
                }
                
                enemy.Initialize(x, y, false);
                enemyShips.Add(enemy);
                
                grid[x, y].occupied = true;
            }
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
