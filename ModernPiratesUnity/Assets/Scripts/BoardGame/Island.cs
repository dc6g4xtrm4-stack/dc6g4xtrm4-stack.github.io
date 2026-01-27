using UnityEngine;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Represents an island on the board game grid.
    /// All visuals and materials are created programmatically based on island type.
    /// No Unity Editor setup or material assets required.
    /// </summary>
    public class Island : MonoBehaviour
    {
        public int gridX;
        public int gridY;
        public IslandType islandType;
        public int pointValue;
        public bool captured = false;
        
        private Renderer islandRenderer;

        /// <summary>
        /// Initializes the island with position and type.
        /// Creates color-coded materials programmatically based on island type:
        /// - Harbor: Blue (heals ships)
        /// - Resource: Green (basic resources)
        /// - Treasure: Gold/Yellow (valuable)
        /// - Danger: Red (damages ships)
        /// </summary>
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

        /// <summary>
        /// Sets up island visuals programmatically.
        /// Creates materials with color coding and appropriate sizes.
        /// </summary>
        private void SetupVisuals()
        {
            islandRenderer = GetComponent<Renderer>();
            
            // Create and assign material based on island type
            if (islandRenderer != null)
            {
                Material islandMaterial = new Material(Shader.Find("Standard"));
                
                // Color code by island type
                switch (islandType)
                {
                    case IslandType.Harbor:
                        islandMaterial.color = new Color(0.3f, 0.5f, 0.8f); // Blue
                        break;
                    case IslandType.Resource:
                        islandMaterial.color = new Color(0.4f, 0.7f, 0.3f); // Green
                        break;
                    case IslandType.Treasure:
                        islandMaterial.color = new Color(0.9f, 0.8f, 0.2f); // Gold
                        break;
                    case IslandType.Danger:
                        islandMaterial.color = new Color(0.7f, 0.2f, 0.2f); // Red
                        break;
                }
                
                // Add some material properties for visual interest
                islandMaterial.SetFloat("_Metallic", 0.1f);
                islandMaterial.SetFloat("_Glossiness", 0.3f);
                
                islandRenderer.material = islandMaterial;
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
