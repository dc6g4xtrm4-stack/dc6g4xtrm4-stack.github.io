using UnityEngine;
using UnityEngine.InputSystem;

namespace Plunderpunk
{
    /// <summary>
    /// Handles player input for Plunderpunk board game.
    /// Supports both mouse clicking and keyboard arrow keys.
    /// Automatically finds required components - no Editor setup needed.
    /// </summary>
    public class PlunderpunkInput : MonoBehaviour
    {
        #region Constants
        private const float RAYCAST_DISTANCE = 1000f;
        private const float PLAYER_SEARCH_INTERVAL = 1f;
        #endregion

        #region Private Fields
        private PlunderpunkGameManager gameManager;
        private Camera mainCamera;
        private PlayerShip playerShip;
        private float playerSearchTimer = 0f;
        #endregion

        #region Unity Lifecycle
        private void Start()
        {
            FindRequiredComponents();
        }

        private void Update()
        {
            if (gameManager == null || gameManager.currentState != PlunderpunkGameManager.GameState.Playing)
                return;

            HandleMouseInput();
            HandleKeyboardInput();
        }
        #endregion

        #region Initialization
        /// <summary>
        /// Finds all required components programmatically.
        /// </summary>
        private void FindRequiredComponents()
        {
            mainCamera = Camera.main;
            if (mainCamera == null)
            {
                Debug.LogWarning("[Input] No main camera found!");
            }
            
            gameManager = FindObjectOfType<PlunderpunkGameManager>();
            if (gameManager == null)
            {
                Debug.LogWarning("[Input] No PlunderpunkGameManager found!");
            }
        }
        #endregion

        #region Input Handling
        /// <summary>
        /// Handles mouse click input for grid-based movement.
        /// Player clicks on grid cells to move their ship.
        /// </summary>
        private void HandleMouseInput()
        {
            if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
            {
                Vector2 mousePosition = Mouse.current.position.ReadValue();
                Ray ray = mainCamera.ScreenPointToRay(mousePosition);
                RaycastHit hit;
                
                if (Physics.Raycast(ray, out hit, RAYCAST_DISTANCE))
                {
                    Vector3 worldPos = hit.point;
                    int gridX = Mathf.RoundToInt(worldPos.x);
                    int gridY = Mathf.RoundToInt(worldPos.z);
                    
                    if (gameManager != null)
                    {
                        gameManager.MovePlayerShip(gridX, gridY);
                    }
                }
            }
        }

        /// <summary>
        /// Handles keyboard arrow key input for movement.
        /// Alternative control scheme to mouse clicking.
        /// Note: Diagonal movement is intentionally allowed and costs 2 movement units.
        /// </summary>
        private void HandleKeyboardInput()
        {
            // Only search for player ship periodically, not every frame
            if (playerShip == null)
            {
                playerSearchTimer += Time.deltaTime;
                if (playerSearchTimer >= PLAYER_SEARCH_INTERVAL)
                {
                    playerSearchTimer = 0f;
                    playerShip = FindObjectOfType<PlayerShip>();
                }
                return;
            }
            
            int deltaX = 0;
            int deltaY = 0;
            
            var keyboard = Keyboard.current;
            if (keyboard != null)
            {
                if (keyboard.upArrowKey.wasPressedThisFrame)
                    deltaY = 1;
                if (keyboard.downArrowKey.wasPressedThisFrame)
                    deltaY = -1;
                if (keyboard.leftArrowKey.wasPressedThisFrame)
                    deltaX = -1;
                if (keyboard.rightArrowKey.wasPressedThisFrame)
                    deltaX = 1;
                
                // WASD alternative
                if (keyboard.wKey.wasPressedThisFrame)
                    deltaY = 1;
                if (keyboard.sKey.wasPressedThisFrame)
                    deltaY = -1;
                if (keyboard.aKey.wasPressedThisFrame)
                    deltaX = -1;
                if (keyboard.dKey.wasPressedThisFrame)
                    deltaX = 1;
            }
            
            if (deltaX != 0 || deltaY != 0)
            {
                int targetX = playerShip.gridX + deltaX;
                int targetY = playerShip.gridY + deltaY;
                
                if (gameManager != null)
                {
                    gameManager.MovePlayerShip(targetX, targetY);
                }
            }
        }
        #endregion
    }
}
