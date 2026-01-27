using UnityEngine;

namespace Plunderpunk
{
    /// <summary>
    /// Represents an island objective in Plunderpunk.
    /// Islands provide loot, resources, and challenges.
    /// All visuals created programmatically based on island type.
    /// </summary>
    public class Island : MonoBehaviour
    {
        #region Public Fields
        public int gridX;
        public int gridY;
        public IslandType islandType;
        public int pointValue;
        public bool captured = false;
        #endregion

        #region Private Fields
        private Renderer islandRenderer;
        #endregion

        #region Initialization
        /// <summary>
        /// Initializes the island with position and type.
        /// Sets up color-coded visuals based on island type:
        /// - Harbor (Blue): Safe harbor, 2 points
        /// - Resource (Green): Basic resources, 1 point
        /// - Treasure (Gold): Valuable treasure, 3 points
        /// - Danger (Red): Hazardous, 0 points
        /// </summary>
        public void Initialize(int x, int y, IslandType type)
        {
            gridX = x;
            gridY = y;
            islandType = type;
            
            pointValue = GetPointValue(type);
            SetupVisuals();
        }

        /// <summary>
        /// Determines point value based on island type.
        /// </summary>
        private int GetPointValue(IslandType type)
        {
            switch (type)
            {
                case IslandType.Harbor:
                    return 2;
                case IslandType.Resource:
                    return 1;
                case IslandType.Treasure:
                    return 3;
                case IslandType.Danger:
                    return 0;
                default:
                    return 0;
            }
        }

        /// <summary>
        /// Sets up island visuals programmatically.
        /// Color codes based on island type for easy identification.
        /// </summary>
        private void SetupVisuals()
        {
            islandRenderer = GetComponent<Renderer>();
            
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
                
                islandMaterial.SetFloat("_Metallic", 0.1f);
                islandMaterial.SetFloat("_Glossiness", 0.3f);
                
                islandRenderer.material = islandMaterial;
            }
            
            // Set size based on importance
            float scale = GetIslandScale();
            transform.localScale = new Vector3(scale, 0.3f, scale);
        }

        /// <summary>
        /// Determines island scale based on type.
        /// </summary>
        private float GetIslandScale()
        {
            switch (islandType)
            {
                case IslandType.Treasure:
                    return 1.5f;
                case IslandType.Harbor:
                    return 1.2f;
                case IslandType.Danger:
                    return 0.8f;
                default:
                    return 1f;
            }
        }
        #endregion

        #region Capture Mechanics
        /// <summary>
        /// Captures the island and applies its effect.
        /// </summary>
        public void Capture()
        {
            if (captured) return;
            
            captured = true;
            UpdateCapturedVisuals();
            ApplyIslandEffect();
        }

        /// <summary>
        /// Updates visuals to show island has been captured.
        /// </summary>
        private void UpdateCapturedVisuals()
        {
            if (islandRenderer != null)
            {
                Color color = islandRenderer.material.color;
                color.a = 0.5f;
                islandRenderer.material.color = color;
            }
        }

        /// <summary>
        /// Applies the island's special effect to the player.
        /// </summary>
        private void ApplyIslandEffect()
        {
            PlayerShip player = FindObjectOfType<PlayerShip>();
            if (player == null) return;

            switch (islandType)
            {
                case IslandType.Danger:
                    player.TakeDamage(20);
                    Debug.Log("[Island Effect] Danger! Ship took 20 damage!");
                    break;
                    
                case IslandType.Treasure:
                    Debug.Log("[Island Effect] Treasure found! Loot Louder!");
                    break;
                    
                case IslandType.Harbor:
                    player.Heal(25);
                    Debug.Log("[Island Effect] Harbor reached! Healed 25 HP!");
                    break;
                    
                case IslandType.Resource:
                    Debug.Log("[Island Effect] Resources gathered!");
                    break;
            }
        }
        #endregion
    }
}
