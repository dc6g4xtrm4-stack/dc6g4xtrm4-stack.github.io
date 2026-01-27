using UnityEngine;

namespace ModernPirates.Combat
{
    /// <summary>
    /// Manages the first/third person combat mode
    /// </summary>
    public class CombatManager : MonoBehaviour
    {
        [Header("Camera Settings")]
        [SerializeField] private CameraMode currentCameraMode = CameraMode.ThirdPerson;
        [SerializeField] private Transform firstPersonCameraPosition;
        [SerializeField] private Transform thirdPersonCameraPosition;
        
        [Header("Player Ship")]
        [SerializeField] private GameObject playerShipPrefab;
        private CombatShip playerShip;
        
        [Header("Enemy Ship")]
        [SerializeField] private GameObject enemyShipPrefab;
        private CombatShip enemyShip;
        
        [Header("Combat Settings")]
        [SerializeField] private float combatArenaSize = 200f;
        [SerializeField] private float waterLevel = 0f;
        
        private Camera mainCamera;
        private bool combatActive = false;
        
        public enum CameraMode
        {
            FirstPerson,
            ThirdPerson
        }

        private void Start()
        {
            mainCamera = Camera.main;
            InitializeCombat();
        }

        private void InitializeCombat()
        {
            // Spawn player ship
            Vector3 playerSpawnPos = new Vector3(-50f, waterLevel, 0f);
            GameObject playerObj = Instantiate(playerShipPrefab, playerSpawnPos, Quaternion.Euler(0, 90, 0));
            playerShip = playerObj.GetComponent<CombatShip>();
            if (playerShip == null)
            {
                playerShip = playerObj.AddComponent<CombatShip>();
            }
            playerShip.Initialize(true);
            
            // Spawn enemy ship
            Vector3 enemySpawnPos = new Vector3(50f, waterLevel, 0f);
            GameObject enemyObj = Instantiate(enemyShipPrefab, enemySpawnPos, Quaternion.Euler(0, -90, 0));
            enemyShip = enemyObj.GetComponent<CombatShip>();
            if (enemyShip == null)
            {
                enemyShip = enemyObj.AddComponent<CombatShip>();
            }
            enemyShip.Initialize(false);
            
            // Setup camera
            SetCameraMode(currentCameraMode);
            
            combatActive = true;
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
