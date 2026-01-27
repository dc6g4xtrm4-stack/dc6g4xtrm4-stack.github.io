using UnityEngine;
using System.Collections.Generic;

namespace ModernPirates.OpenWorld
{
    /// <summary>
    /// Manages the open world mode where players can sail, gather loot, and build bases
    /// </summary>
    public class OpenWorldManager : MonoBehaviour
    {
        [Header("World Settings")]
        [SerializeField] private float worldSize = 1000f;
        [SerializeField] private float waterLevel = 0f;
        
        [Header("Player")]
        [SerializeField] private GameObject playerShipPrefab;
        private OpenWorldShip playerShip;
        
        [Header("Islands")]
        [SerializeField] private GameObject islandPrefab;
        [SerializeField] private int numberOfIslands = 20;
        private List<GameObject> islands = new List<GameObject>();
        
        [Header("Loot")]
        [SerializeField] private GameObject lootPrefab;
        private List<LootItem> activeLoot = new List<LootItem>();
        
        [Header("Bases")]
        private List<PlayerBase> playerBases = new List<PlayerBase>();
        
        [Header("Camera")]
        [SerializeField] private CameraMode cameraMode = CameraMode.ThirdPerson;
        private Camera mainCamera;
        
        public enum CameraMode
        {
            FirstPerson,
            ThirdPerson
        }

        private void Start()
        {
            mainCamera = Camera.main;
            InitializeWorld();
        }

        private void InitializeWorld()
        {
            // Generate islands
            GenerateIslands();
            
            // Spawn player ship
            SpawnPlayerShip();
            
            // Generate initial loot
            GenerateLoot(30);
        }

        private void GenerateIslands()
        {
            for (int i = 0; i < numberOfIslands; i++)
            {
                // Random position in world
                float x = Random.Range(-worldSize / 2, worldSize / 2);
                float z = Random.Range(-worldSize / 2, worldSize / 2);
                Vector3 position = new Vector3(x, waterLevel, z);
                
                // Create island
                GameObject island = CreateIsland(position);
                islands.Add(island);
            }
        }

        private GameObject CreateIsland(Vector3 position)
        {
            GameObject island;
            
            if (islandPrefab != null)
            {
                island = Instantiate(islandPrefab, position, Quaternion.identity);
            }
            else
            {
                // Create simple island if no prefab
                island = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                island.transform.position = position;
                island.transform.localScale = new Vector3(
                    Random.Range(10f, 30f), 
                    Random.Range(5f, 15f), 
                    Random.Range(10f, 30f)
                );
                
                // Set material to look like land
                Renderer renderer = island.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = new Color(0.4f, 0.6f, 0.2f);
                }
            }
            
            island.transform.parent = transform;
            return island;
        }

        private void SpawnPlayerShip()
        {
            Vector3 spawnPos = new Vector3(0, waterLevel, 0);
            
            if (playerShipPrefab != null)
            {
                GameObject shipObj = Instantiate(playerShipPrefab, spawnPos, Quaternion.identity);
                playerShip = shipObj.GetComponent<OpenWorldShip>();
                if (playerShip == null)
                {
                    playerShip = shipObj.AddComponent<OpenWorldShip>();
                }
            }
            else
            {
                // Create simple ship
                GameObject shipObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
                shipObj.transform.position = spawnPos;
                shipObj.transform.localScale = new Vector3(2f, 1f, 4f);
                playerShip = shipObj.AddComponent<OpenWorldShip>();
            }
            
            playerShip.Initialize();
            
            // Load saved position if exists
            if (GameManager.Instance != null)
            {
                Vector3 savedPos = GameManager.Instance.playerData.openWorldPosition;
                if (savedPos != Vector3.zero)
                {
                    playerShip.transform.position = savedPos;
                }
            }
        }

        private void GenerateLoot(int count)
        {
            for (int i = 0; i < count; i++)
            {
                // Random position in world, near water surface
                float x = Random.Range(-worldSize / 2, worldSize / 2);
                float z = Random.Range(-worldSize / 2, worldSize / 2);
                Vector3 position = new Vector3(x, waterLevel + 0.5f, z);
                
                CreateLoot(position);
            }
        }

        private void CreateLoot(Vector3 position)
        {
            GameObject lootObj;
            
            if (lootPrefab != null)
            {
                lootObj = Instantiate(lootPrefab, position, Quaternion.identity);
            }
            else
            {
                // Create simple loot sphere
                lootObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                lootObj.transform.position = position;
                lootObj.transform.localScale = Vector3.one * 0.5f;
                
                Renderer renderer = lootObj.GetComponent<Renderer>();
                if (renderer != null)
                {
                    renderer.material.color = Color.yellow;
                }
            }
            
            LootItem loot = lootObj.GetComponent<LootItem>();
            if (loot == null)
            {
                loot = lootObj.AddComponent<LootItem>();
            }
            
            loot.value = Random.Range(10, 100);
            activeLoot.Add(loot);
            
            lootObj.transform.parent = transform;
        }

        private void Update()
        {
            // Toggle camera mode
            if (Input.GetKeyDown(KeyCode.C))
            {
                ToggleCameraMode();
            }
            
            // Update camera
            UpdateCamera();
            
            // Check for base building
            if (Input.GetKeyDown(KeyCode.B))
            {
                TryBuildBase();
            }
            
            // Save position periodically
            if (Time.frameCount % 300 == 0 && playerShip != null)
            {
                SavePlayerPosition();
            }
        }

        private void UpdateCamera()
        {
            if (playerShip == null || mainCamera == null) return;
            
            if (cameraMode == CameraMode.FirstPerson)
            {
                // First person view
                Vector3 offset = playerShip.transform.forward * 3f + Vector3.up * 2f;
                mainCamera.transform.position = playerShip.transform.position + offset;
                mainCamera.transform.LookAt(playerShip.transform.position + playerShip.transform.forward * 20f);
            }
            else
            {
                // Third person view
                Vector3 offset = -playerShip.transform.forward * 20f + Vector3.up * 10f;
                mainCamera.transform.position = playerShip.transform.position + offset;
                mainCamera.transform.LookAt(playerShip.transform.position + Vector3.up * 2f);
            }
        }

        private void ToggleCameraMode()
        {
            cameraMode = cameraMode == CameraMode.FirstPerson 
                ? CameraMode.ThirdPerson 
                : CameraMode.FirstPerson;
            
            Debug.Log($"Camera mode: {cameraMode}");
        }

        private void TryBuildBase()
        {
            if (playerShip == null) return;
            
            // Check if near an island
            GameObject nearestIsland = FindNearestIsland(playerShip.transform.position, 30f);
            
            if (nearestIsland != null)
            {
                // Build base on island
                BuildBase(nearestIsland.transform.position);
            }
            else
            {
                Debug.Log("Must be near an island to build a base!");
            }
        }

        private GameObject FindNearestIsland(Vector3 position, float maxDistance)
        {
            GameObject nearest = null;
            float nearestDist = maxDistance;
            
            foreach (var island in islands)
            {
                float dist = Vector3.Distance(position, island.transform.position);
                if (dist < nearestDist)
                {
                    nearestDist = dist;
                    nearest = island;
                }
            }
            
            return nearest;
        }

        private void BuildBase(Vector3 position)
        {
            // Create base structure
            GameObject baseObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            baseObj.transform.position = position + Vector3.up * 5f;
            baseObj.transform.localScale = new Vector3(5f, 3f, 5f);
            
            Renderer renderer = baseObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = new Color(0.6f, 0.4f, 0.2f);
            }
            
            PlayerBase playerBase = baseObj.AddComponent<PlayerBase>();
            playerBase.Initialize(position);
            playerBases.Add(playerBase);
            
            if (GameManager.Instance != null)
            {
                GameManager.Instance.playerData.basesBuilt++;
            }
            
            Debug.Log($"Base built! Total bases: {playerBases.Count}");
        }

        private void SavePlayerPosition()
        {
            if (GameManager.Instance != null && playerShip != null)
            {
                GameManager.Instance.playerData.openWorldPosition = playerShip.transform.position;
                GameManager.Instance.SaveGameData();
            }
        }

        public void CollectLoot(LootItem loot)
        {
            if (activeLoot.Contains(loot))
            {
                activeLoot.Remove(loot);
                
                if (GameManager.Instance != null)
                {
                    GameManager.Instance.playerData.lootCollected += loot.value;
                    GameManager.Instance.playerData.totalPoints += loot.value / 10;
                }
                
                Debug.Log($"Collected loot worth {loot.value}!");
                Destroy(loot.gameObject);
            }
        }
    }

    /// <summary>
    /// Loot item that can be collected
    /// </summary>
    public class LootItem : MonoBehaviour
    {
        public int value = 10;
        
        private void Update()
        {
            // Rotate for visibility
            transform.Rotate(Vector3.up, 90f * Time.deltaTime);
        }

        private void OnTriggerEnter(Collider other)
        {
            OpenWorldShip ship = other.GetComponent<OpenWorldShip>();
            if (ship != null)
            {
                OpenWorldManager manager = FindObjectOfType<OpenWorldManager>();
                if (manager != null)
                {
                    manager.CollectLoot(this);
                }
            }
        }
    }

    /// <summary>
    /// Player base structure
    /// </summary>
    public class PlayerBase : MonoBehaviour
    {
        public Vector3 position;
        
        public void Initialize(Vector3 pos)
        {
            position = pos;
        }
    }
}
