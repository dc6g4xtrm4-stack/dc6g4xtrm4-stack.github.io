using UnityEngine;
using UnityEngine.InputSystem;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Handles player input for board game mode.
    /// Automatically finds required components - no Unity Editor setup needed.
    /// </summary>
    public class BoardGameInput : MonoBehaviour
    {
        private BoardGameManager gameManager;
        private Camera mainCamera;
        
        private Ship playerShip;

        private void Start()
        {
            // Find camera programmatically
            mainCamera = Camera.main;
            if (mainCamera == null)
            {
                Debug.LogWarning("BoardGameInput: No main camera found!");
            }
            
            // Find game manager programmatically
            gameManager = FindObjectOfType<BoardGameManager>();
            if (gameManager == null)
            {
                Debug.LogWarning("BoardGameInput: No BoardGameManager found in scene!");
            }
        }

        private void Update()
        {
            HandleMouseInput();
            HandleKeyboardInput();
        }

        private void HandleMouseInput()
        {
            if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
            {
                Vector2 mousePosition = Mouse.current.position.ReadValue();
                Ray ray = mainCamera.ScreenPointToRay(mousePosition);
                RaycastHit hit;
                
                if (Physics.Raycast(ray, out hit, 1000f))
                {
                    // Convert world position to grid coordinates
                    Vector3 worldPos = hit.point;
                    int gridX = Mathf.RoundToInt(worldPos.x);
                    int gridY = Mathf.RoundToInt(worldPos.z);
                    
                    // Move player ship to clicked position
                    if (gameManager != null)
                    {
                        gameManager.MovePlayerShip(gridX, gridY);
                    }
                }
            }
        }

        private void HandleKeyboardInput()
        {
            if (playerShip == null)
            {
                // Find player ship
                Ship[] ships = FindObjectsOfType<Ship>();
                foreach (var ship in ships)
                {
                    if (ship.isPlayer)
                    {
                        playerShip = ship;
                        break;
                    }
                }
                return;
            }
            
            // WASD and Arrow key movement (alternative to mouse)
            int deltaX = 0;
            int deltaY = 0;
            
            var keyboard = Keyboard.current;
            if (keyboard != null)
            {
                // Arrow keys
                if (keyboard.upArrowKey.wasPressedThisFrame)
                    deltaY = 1;
                if (keyboard.downArrowKey.wasPressedThisFrame)
                    deltaY = -1;
                if (keyboard.leftArrowKey.wasPressedThisFrame)
                    deltaX = -1;
                if (keyboard.rightArrowKey.wasPressedThisFrame)
                    deltaX = 1;
                
                // WASD keys
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
    }
}
