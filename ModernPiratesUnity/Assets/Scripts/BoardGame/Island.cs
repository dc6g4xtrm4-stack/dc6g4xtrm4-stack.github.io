using UnityEngine;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Represents an island on the board game grid
    /// </summary>
    public class Island : MonoBehaviour
    {
        public int gridX;
        public int gridY;
        public IslandType islandType;
        public int pointValue;
        public bool captured = false;
        
        [Header("Visual")]
        public Material harborMaterial;
        public Material resourceMaterial;
        public Material treasureMaterial;
        public Material dangerMaterial;
        
        private Renderer islandRenderer;

        public void Initialize(int x, int y, IslandType type)
        {
            gridX = x;
            gridY = y;
            islandType = type;
            
            // Set point value based on type
            switch (type)
            {
                case IslandType.Harbor:
                    pointValue = 2;
                    break;
                case IslandType.Resource:
                    pointValue = 1;
                    break;
                case IslandType.Treasure:
                    pointValue = 3;
                    break;
                case IslandType.Danger:
                    pointValue = 0;
                    break;
            }
            
            SetupVisuals();
        }

        private void SetupVisuals()
        {
            islandRenderer = GetComponent<Renderer>();
            
            // Set material based on type
            if (islandRenderer != null)
            {
                switch (islandType)
                {
                    case IslandType.Harbor:
                        if (harborMaterial != null) islandRenderer.material = harborMaterial;
                        break;
                    case IslandType.Resource:
                        if (resourceMaterial != null) islandRenderer.material = resourceMaterial;
                        break;
                    case IslandType.Treasure:
                        if (treasureMaterial != null) islandRenderer.material = treasureMaterial;
                        break;
                    case IslandType.Danger:
                        if (dangerMaterial != null) islandRenderer.material = dangerMaterial;
                        break;
                }
            }
            
            // Set size based on importance
            float scale = 1f;
            switch (islandType)
            {
                case IslandType.Treasure:
                    scale = 1.5f;
                    break;
                case IslandType.Harbor:
                    scale = 1.2f;
                    break;
                case IslandType.Danger:
                    scale = 0.8f;
                    break;
            }
            
            transform.localScale = new Vector3(scale, 0.3f, scale);
        }

        public void Capture()
        {
            if (captured) return;
            
            captured = true;
            
            // Visual feedback
            if (islandRenderer != null)
            {
                Color color = islandRenderer.material.color;
                color.a = 0.5f;
                islandRenderer.material.color = color;
            }
            
            // Apply island effect
            ApplyIslandEffect();
        }

        private void ApplyIslandEffect()
        {
            switch (islandType)
            {
                case IslandType.Danger:
                    // Damage the player ship
                    Ship playerShip = FindObjectOfType<Ship>();
                    if (playerShip != null && playerShip.isPlayer)
                    {
                        playerShip.TakeDamage(20);
                        Debug.Log("Danger island! Ship took 20 damage!");
                    }
                    break;
                    
                case IslandType.Treasure:
                    // Give bonus loot
                    Debug.Log("Treasure island! Found valuable loot!");
                    break;
                    
                case IslandType.Harbor:
                    // Heal the ship
                    Ship ship = FindObjectOfType<Ship>();
                    if (ship != null && ship.isPlayer)
                    {
                        ship.Heal(25);
                        Debug.Log("Harbor island! Ship healed 25 HP!");
                    }
                    break;
            }
        }
    }
}
