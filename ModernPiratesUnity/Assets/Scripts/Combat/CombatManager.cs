using UnityEngine;

namespace ModernPirates.Combat
{
    /// <summary>
    /// Manages the first/third person combat mode.
    /// Fully programmatic - creates all ships, camera, and lighting via code.
    /// No Unity Editor setup or prefabs required.
    /// </summary>
    public class CombatManager : MonoBehaviour
    {
        [Header("Camera Settings")]
        [SerializeField] private CameraMode currentCameraMode = CameraMode.ThirdPerson;
        
        [Header("Combat Settings")]
        [SerializeField] private float combatArenaSize = 200f;
        [SerializeField] private float waterLevel = 0f;
        
        private CombatShip playerShip;
        private CombatShip enemyShip;
        private Camera mainCamera;
        private bool combatActive = false;
        
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
            InitializeCombat();
        }

        /// <summary>
        /// Ensures the scene has all required components (camera, lighting).
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
                
                // Position camera for combat view
                cameraObj.transform.position = new Vector3(0f, 20f, -30f);
                cameraObj.transform.rotation = Quaternion.Euler(30f, 0f, 0f);
                
                // Add audio listener
                cameraObj.AddComponent<AudioListener>();
                
                Debug.Log("Created main camera programmatically for combat mode");
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
                lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
                
                Debug.Log("Created directional light programmatically for combat mode");
            }
            
            // Create ocean floor for visual reference
            GameObject ocean = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ocean.name = "Ocean";
            ocean.transform.position = new Vector3(0, waterLevel, 0);
            ocean.transform.localScale = new Vector3(combatArenaSize / 10f, 1f, combatArenaSize / 10f);
            
            // Create ocean material
            Material oceanMaterial = new Material(Shader.Find("Standard"));
            oceanMaterial.color = new Color(0.1f, 0.3f, 0.5f); // Dark blue water
            oceanMaterial.SetFloat("_Metallic", 0.8f);
            oceanMaterial.SetFloat("_Glossiness", 0.9f);
            Renderer oceanRenderer = ocean.GetComponent<Renderer>();
            oceanRenderer.material = oceanMaterial;
            
            // Keep collider for physics - objects rest on ocean surface
            // No need to remove collider as it provides the ocean "floor"
        }

        /// <summary>
        /// Initializes combat by spawning player and enemy ships programmatically.
        /// Ships are created from Unity primitives with appropriate materials.
        /// </summary>
        private void InitializeCombat()
        {
            // Spawn player ship programmatically
            Vector3 playerSpawnPos = new Vector3(-50f, waterLevel + 0.5f, 0f);
            GameObject playerObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            playerObj.name = "PlayerCombatShip";
            playerObj.transform.position = playerSpawnPos;
            playerObj.transform.rotation = Quaternion.Euler(0, 90, 0);
            playerObj.transform.localScale = new Vector3(3f, 2f, 6f); // Ship-like proportions
            
            playerShip = playerObj.AddComponent<CombatShip>();
            playerShip.Initialize(true);
            
            // Spawn enemy ship programmatically
            Vector3 enemySpawnPos = new Vector3(50f, waterLevel + 0.5f, 0f);
            GameObject enemyObj = GameObject.CreatePrimitive(PrimitiveType.Cube);
            enemyObj.name = "EnemyCombatShip";
            enemyObj.transform.position = enemySpawnPos;
            enemyObj.transform.rotation = Quaternion.Euler(0, -90, 0);
            enemyObj.transform.localScale = new Vector3(3f, 2f, 6f);
            
            enemyShip = enemyObj.AddComponent<CombatShip>();
            enemyShip.Initialize(false);
            
            // Setup camera
            SetCameraMode(currentCameraMode);
            
            combatActive = true;
            
            Debug.Log("Combat initialized - all ships created programmatically");
        }

        private void Update()
        {
            if (!combatActive) return;
            
            // Toggle camera mode with C key
            if (Input.GetKeyDown(KeyCode.C))
            {
                ToggleCameraMode();
            }
            
            // Update camera position
            UpdateCamera();
            
            // Check combat end conditions
            CheckCombatEnd();
        }

        private void UpdateCamera()
        {
            if (playerShip == null || mainCamera == null) return;
            
            if (currentCameraMode == CameraMode.FirstPerson)
            {
                // First person - camera attached to ship's front
                Vector3 offset = playerShip.transform.forward * 5f + Vector3.up * 3f;
                mainCamera.transform.position = playerShip.transform.position + offset;
                mainCamera.transform.LookAt(playerShip.transform.position + playerShip.transform.forward * 20f);
            }
            else
            {
                // Third person - camera behind and above ship
                Vector3 offset = -playerShip.transform.forward * 15f + Vector3.up * 8f;
                mainCamera.transform.position = playerShip.transform.position + offset;
                mainCamera.transform.LookAt(playerShip.transform.position + Vector3.up * 2f);
            }
        }

        private void ToggleCameraMode()
        {
            currentCameraMode = currentCameraMode == CameraMode.FirstPerson 
                ? CameraMode.ThirdPerson 
                : CameraMode.FirstPerson;
            
            Debug.Log($"Camera mode: {currentCameraMode}");
        }

        private void SetCameraMode(CameraMode mode)
        {
            currentCameraMode = mode;
        }

        private void CheckCombatEnd()
        {
            if (playerShip != null && playerShip.health <= 0)
            {
                EndCombat(false);
            }
            else if (enemyShip != null && enemyShip.health <= 0)
            {
                EndCombat(true);
            }
        }

        private void EndCombat(bool playerWon)
        {
            combatActive = false;
            
            if (playerWon)
            {
                Debug.Log("Victory! Returning to board game...");
                GameManager.Instance.playerData.battlesWon++;
                GameManager.Instance.playerData.totalPoints += 5;
            }
            else
            {
                Debug.Log("Defeat! Returning to board game...");
            }
            
            // Return to board game after delay
            Invoke("ReturnToBoardGame", 3f);
        }

        private void ReturnToBoardGame()
        {
            GameManager.Instance.SwitchGameMode(GameManager.GameMode.BoardGame);
        }
    }
}
