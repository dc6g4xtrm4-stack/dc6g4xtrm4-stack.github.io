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
        #region Constants
        private const int DANGER_DAMAGE = 20;
        private const int HARBOR_HEALING = 25;
        #endregion

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
                Material islandMaterial = new Material(GetSafeShader() ?? Shader.Find("Sprites/Default"));
                
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

        // Shader helper fallback for builds that may not include the "Standard" shader
        private Shader GetSafeShader()
        {
            Shader s = Shader.Find("Standard");
            if (s != null) return s;
            s = Shader.Find("Universal Render Pipeline/Lit");
            if (s != null) return s;
            s = Shader.Find("Sprites/Default");
            if (s != null) return s;
            return Shader.Find("Unlit/Color");
        }

        #region Capture Mechanics
        /// <summary>
        /// Captures the island and applies its effect.
        /// </summary>
        public void Capture()
        {
            Capture(null);
        }
        
        /// <summary>
        /// Captures the island and applies its effect to the specified player ship.
        /// </summary>
        public void Capture(PlayerShip player = null)
        {
            if (captured) return;
            
            captured = true;
            UpdateCapturedVisuals();
            ApplyIslandEffect(player);
        }

        /// <summary>
        /// Updates visuals to show island has been captured.
        /// Enables transparency rendering mode for visual feedback.
        /// </summary>
        private void UpdateCapturedVisuals()
        {
            if (islandRenderer != null)
            {
                Material material = islandRenderer.material;
                
                // Enable transparency rendering mode
                material.SetFloat("_Mode", 3);
                material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                material.SetInt("_ZWrite", 0);
                material.DisableKeyword("_ALPHATEST_ON");
                material.EnableKeyword("_ALPHABLEND_ON");
                material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                material.renderQueue = 3000;
                
                // Set alpha to show captured state
                Color color = material.color;
                color.a = 0.5f;
                material.color = color;
            }
        }

        /// <summary>
        /// Applies the island's special effect to the player.
        /// </summary>
        private void ApplyIslandEffect(PlayerShip player = null)
        {
            // Find player if not provided
            if (player == null)
            {
                player = FindObjectOfType<PlayerShip>();
            }
            
            if (player == null) return;

            switch (islandType)
            {
                case IslandType.Danger:
                    player.TakeDamage(DANGER_DAMAGE);
                    Debug.Log($"[Island Effect] Danger! Ship took {DANGER_DAMAGE} damage!");
                    break;
                    
                case IslandType.Treasure:
                    Debug.Log("[Island Effect] Treasure found! Loot Louder!");
                    break;
                    
                case IslandType.Harbor:
                    player.Heal(HARBOR_HEALING);
                    Debug.Log($"[Island Effect] Harbor reached! Healed {HARBOR_HEALING} HP!");
                    break;
                    
                case IslandType.Resource:
                    Debug.Log("[Island Effect] Resources gathered!");
                    break;
            }
        }
        #endregion
    }
}
