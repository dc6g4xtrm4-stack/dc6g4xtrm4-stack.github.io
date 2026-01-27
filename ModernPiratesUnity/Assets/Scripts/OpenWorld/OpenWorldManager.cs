using UnityEngine;
using System.Collections.Generic;

namespace ModernPirates.OpenWorld
{
    /// <summary>
    /// Manages the open world mode where players can sail, gather loot, and build bases.
    /// Fully programmatic - all islands, loot, ships, camera, and lighting created via code.
    /// No Unity Editor setup or prefabs required.
    /// </summary>
    public class OpenWorldManager : MonoBehaviour
    {
        [Header("World Settings")]
        [SerializeField] private float worldSize = 1000f;
        [SerializeField] private float waterLevel = 0f;
        
        [Header("Island Settings")]
        [SerializeField] private int numberOfIslands = 20;
        private List<GameObject> islands = new List<GameObject>();
        
        [Header("Loot Settings")]
        [SerializeField] private int initialLootCount = 30;
        private List<LootItem> activeLoot = new List<LootItem>();
        
        [Header("Bases")]
        private List<PlayerBase> playerBases = new List<PlayerBase>();
        
        [Header("Camera")]
        [SerializeField] private CameraMode cameraMode = CameraMode.ThirdPerson;
        private Camera mainCamera;
        
        private OpenWorldShip playerShip;
        
        public enum CameraMode
        {
            FirstPerson,
            ThirdPerson
        }

        private void Start()
        {
            // Ensure scene has required components
            EnsureSceneSetup();
            
            mainCamera = Camera.main;
            InitializeWorld();
        }

        /// <summary>
        /// Ensures the scene has all required components (camera, lighting, ocean).
        /// Creates them programmatically if they don't exist.
        /// This eliminates the need for any manual Unity Editor setup.
        /// </summary>
        private void EnsureSceneSetup()
        {
            // Check for camera - create one if none exists
            if (Camera.main == null)
            {
                GameObject cameraObj = new GameObject("Main Camera");
                mainCamera = cameraObj.AddComponent<Camera>();
                cameraObj.tag = "MainCamera";
                
                // Position camera for open world view
                cameraObj.transform.position = new Vector3(0f, 30f, -30f);
                cameraObj.transform.rotation = Quaternion.Euler(30f, 0f, 0f);
                
                // Add audio listener
                cameraObj.AddComponent<AudioListener>();
                
                Debug.Log("Created main camera programmatically for open world mode");
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
                light.color = new Color(1f, 0.95f, 0.8f); // Slightly warm sunlight
                light.intensity = 1f;
                lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
                
                Debug.Log("Created directional light programmatically for open world mode");
            }
            
            // Create ocean plane for visual reference
            GameObject ocean = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ocean.name = "Ocean";
            ocean.transform.position = new Vector3(0, waterLevel, 0);
            ocean.transform.localScale = new Vector3(worldSize / 10f, 1f, worldSize / 10f);
            
            // Create ocean material
            Material oceanMaterial = new Material(Shader.Find("Standard"));
            oceanMaterial.color = new Color(0.1f, 0.4f, 0.6f); // Ocean blue
            oceanMaterial.SetFloat("_Metallic", 0.7f);
            oceanMaterial.SetFloat("_Glossiness", 0.85f);
            Renderer oceanRenderer = ocean.GetComponent<Renderer>();
            oceanRenderer.material = oceanMaterial;
            
            // Keep collider for physics - ships float on ocean surface
            // No need to remove collider as it provides the water "surface"
        }

        /// <summary>
        /// Initializes the open world by generating islands, spawning player ship, and creating loot.
        /// All objects are created programmatically using Unity primitives.
        /// </summary>
        private void InitializeWorld()
        {
            // Generate islands
            GenerateIslands();
            
            // Spawn player ship
            SpawnPlayerShip();
            
            // Generate initial loot
            GenerateLoot(initialLootCount);
            
            Debug.Log("Open world initialized - all objects created programmatically");
        }

        /// <summary>
        /// Generates islands programmatically using cylinder primitives.
        /// Islands are randomly sized and colored to look like land masses.
        /// </summary>
        private void GenerateIslands()
        {
            for (int i = 0; i < numberOfIslands; i++)
            {
                // Random position in world
                float x = Random.Range(-worldSize / 2, worldSize / 2);
                float z = Random.Range(-worldSize / 2, worldSize / 2);
                Vector3 position = new Vector3(x, waterLevel, z);
                
                // Create island programmatically
                GameObject island = CreateIsland(position);
                islands.Add(island);
            }
            
            Debug.Log($"Generated {numberOfIslands} islands programmatically");
        }

        /// <summary>
        /// Creates an island GameObject programmatically using a cylinder primitive.
        /// Applies a green/brown material to simulate land.
        /// </summary>
        private GameObject CreateIsland(Vector3 position)
        {
            // Create island using cylinder primitive
            GameObject island = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            island.name = "Island";
            island.transform.position = position;
            
            // Randomize green component for color variation
            float scaleX = Random.Range(10f, 30f);
            float scaleY = Random.Range(5f, 15f);
            float scaleZ = Random.Range(10f, 30f);
            island.transform.localScale = new Vector3(scaleX, scaleY, scaleZ);
            
            // Create land material
            Renderer renderer = island.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material landMaterial = new Material(Shader.Find("Standard"));
                // Randomize green component for color variation (greenish-brown islands)
                float greenIntensity = Random.Range(0.5f, 0.7f);
                landMaterial.color = new Color(0.4f, greenIntensity, 0.2f); // Greenish-brown
                landMaterial.SetFloat("_Metallic", 0.0f);
                landMaterial.SetFloat("_Glossiness", 0.2f);
                renderer.material = landMaterial;
            }
            
            island.transform.parent = transform;
            return island;
        }

        /// <summary>
        /// Spawns the player ship programmatically using a cube primitive.
        /// Creates all necessary components (Rigidbody, Collider, OpenWorldShip script).
        /// </summary>
        private void SpawnPlayerShip()
        {
            Vector3 spawnPos = new Vector3(0, waterLevel + 0.5f, 0);
            
            // Create ship GameObject programmatically
            GameObject shipObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            shipObj.name = "PlayerShip";
            shipObj.transform.position = spawnPos;
            shipObj.transform.localScale = new Vector3(2f, 1f, 4f); // Ship-like proportions
            
            // Create ship material
            Renderer renderer = shipObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material shipMaterial = new Material(Shader.Find("Standard"));
                shipMaterial.color = new Color(0.6f, 0.4f, 0.2f); // Brown wood
                shipMaterial.SetFloat("_Metallic", 0.1f);
                shipMaterial.SetFloat("_Glossiness", 0.3f);
                renderer.material = shipMaterial;
            }
            
            // Add ship component
            playerShip = shipObj.AddComponent<OpenWorldShip>();
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
            
            Debug.Log("Player ship spawned programmatically");
        }

        /// <summary>
        /// Generates loot items programmatically scattered across the world.
        /// Uses sphere primitives with yellow materials to represent collectible treasure.
        /// </summary>
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
            
            Debug.Log($"Generated {count} loot items programmatically");
        }

        /// <summary>
        /// Creates a loot item programmatically using a sphere primitive.
        /// Applies a yellow/gold material and adds collision detection.
        /// </summary>
        private void CreateLoot(Vector3 position)
        {
            // Create loot sphere programmatically
            GameObject lootObj = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            lootObj.name = "Loot";
            lootObj.transform.position = position;
            lootObj.transform.localScale = Vector3.one * 0.5f;
            
            // Create gold material
            Renderer renderer = lootObj.GetComponent<Renderer>();
            if (renderer != null)
            {
                Material lootMaterial = new Material(Shader.Find("Standard"));
                lootMaterial.color = new Color(1f, 0.85f, 0.1f); // Gold color
                lootMaterial.SetFloat("_Metallic", 0.8f);
                lootMaterial.SetFloat("_Glossiness", 0.9f);
                
                // Make it emit light for visibility
                lootMaterial.EnableKeyword("_EMISSION");
                lootMaterial.SetColor("_EmissionColor", new Color(0.8f, 0.7f, 0.1f) * 0.3f);
                
                renderer.material = lootMaterial;
            }
            
            // Make collider a trigger
            SphereCollider collider = lootObj.GetComponent<SphereCollider>();
            if (collider != null)
            {
                collider.isTrigger = true;
            }
            
            // Add loot component
            LootItem loot = lootObj.AddComponent<LootItem>();
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
