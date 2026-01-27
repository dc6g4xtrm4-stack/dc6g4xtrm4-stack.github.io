using UnityEngine;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Handles player input for board game mode
    /// </summary>
    public class BoardGameInput : MonoBehaviour
    {
        [SerializeField] private BoardGameManager gameManager;
        [SerializeField] private Camera mainCamera;
        [SerializeField] private LayerMask gridLayerMask;
        
        private Ship playerShip;

        private void Start()
        {
            if (mainCamera == null)
            {
                mainCamera = Camera.main;
            }
            
            if (gameManager == null)
            {
                gameManager = FindObjectOfType<BoardGameManager>();
            }
        }

        private void Update()
        {
            HandleMouseInput();
            HandleKeyboardInput();
        }

        private void HandleMouseInput()
        {
            if (Input.GetMouseButtonDown(0))
            {
                Ray ray = mainCamera.ScreenPointToRay(Input.mousePosition);
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
            
            // Arrow key movement (alternative to mouse)
            int deltaX = 0;
            int deltaY = 0;
            
            if (Input.GetKeyDown(KeyCode.UpArrow))
                deltaY = 1;
            if (Input.GetKeyDown(KeyCode.DownArrow))
                deltaY = -1;
            if (Input.GetKeyDown(KeyCode.LeftArrow))
                deltaX = -1;
            if (Input.GetKeyDown(KeyCode.RightArrow))
                deltaX = 1;
            
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
