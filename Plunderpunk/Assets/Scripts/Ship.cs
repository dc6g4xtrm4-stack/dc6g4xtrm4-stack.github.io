using UnityEngine;

namespace Plunderpunk
{
    /// <summary>
    /// Base class for all ships in Plunderpunk.
    /// Handles position, movement, and stats.
    /// All visuals created programmatically - no prefabs needed.
    /// </summary>
    public abstract class Ship : MonoBehaviour
    {
        #region Public Fields
        public int gridX;
        public int gridY;
        #endregion

        #region Ship Stats
        [Header("Ship Stats")]
        public int health = 100;
        public int maxHealth = 100;
        public int attackPower = 10;
        public int defense = 5;
        public int movementRange = 3;
        #endregion

        #region Protected Fields
        protected Renderer shipRenderer;
        #endregion

        #region Initialization
        /// <summary>
        /// Initializes the ship at a grid position.
        /// </summary>
        public virtual void Initialize(int x, int y)
        {
            gridX = x;
            gridY = y;
            SetupVisuals();
        }

        /// <summary>
        /// Sets up visual representation of the ship.
        /// Override in derived classes for custom appearance.
        /// </summary>
        protected virtual void SetupVisuals()
        {
            shipRenderer = GetComponent<Renderer>();
            if (shipRenderer != null)
            {
                Material shipMaterial = new Material(Shader.Find("Standard"));
                shipMaterial.SetFloat("_Metallic", 0.3f);
                shipMaterial.SetFloat("_Glossiness", 0.5f);
                shipRenderer.material = shipMaterial;
            }
            
            transform.localScale = new Vector3(0.8f, 0.5f, 1.2f);
        }
        #endregion

        #region Movement
        /// <summary>
        /// Moves the ship to a new grid position.
        /// </summary>
        public void MoveTo(int x, int y)
        {
            gridX = x;
            gridY = y;
            
            Vector3 targetPos = new Vector3(x, 0.3f, y);
            StartCoroutine(SmoothMove(targetPos));
        }

        /// <summary>
        /// Smoothly animates movement to target position.
        /// </summary>
        private System.Collections.IEnumerator SmoothMove(Vector3 target)
        {
            float duration = 0.5f;
            float elapsed = 0f;
            Vector3 startPos = transform.position;
            
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                transform.position = Vector3.Lerp(startPos, target, t);
                yield return null;
            }
            
            transform.position = target;
        }
        #endregion

        #region Combat
        /// <summary>
        /// Applies damage to the ship.
        /// </summary>
        public void TakeDamage(int damage)
        {
            health -= damage;
            health = Mathf.Max(0, health);
            
            if (health <= 0)
            {
                Die();
            }
        }

        /// <summary>
        /// Heals the ship.
        /// </summary>
        public void Heal(int amount)
        {
            health += amount;
            health = Mathf.Min(health, maxHealth);
        }

        /// <summary>
        /// Handles ship destruction.
        /// </summary>
        protected virtual void Die()
        {
            Debug.Log($"{gameObject.name} destroyed!");
            Destroy(gameObject, 0.5f);
        }
        #endregion
    }

    /// <summary>
    /// Player-controlled ship.
    /// Blue colored for player identification.
    /// </summary>
    public class PlayerShip : Ship
    {
        protected override void SetupVisuals()
        {
            base.SetupVisuals();
            
            if (shipRenderer != null)
            {
                shipRenderer.material.color = new Color(0.2f, 0.4f, 0.9f); // Bright blue
            }
            
            Debug.Log("Player ship initialized");
        }
    }

    /// <summary>
    /// Enemy AI-controlled ship.
    /// Red colored for enemy identification.
    /// Features simple AI for movement and combat.
    /// </summary>
    public class EnemyShip : Ship
    {
        #region AI Settings
        [Header("AI Settings")]
        public float moveInterval = 2f;
        private float moveTimer = 0f;
        #endregion

        protected override void SetupVisuals()
        {
            base.SetupVisuals();
            
            if (shipRenderer != null)
            {
                shipRenderer.material.color = new Color(0.9f, 0.2f, 0.2f); // Bright red
            }
            
            Debug.Log("Enemy ship initialized");
        }

        private void Update()
        {
            moveTimer += Time.deltaTime;
            
            if (moveTimer >= moveInterval)
            {
                moveTimer = 0f;
                MakeAIMove();
            }
        }

        /// <summary>
        /// AI decision making for movement.
        /// 50% chance to move towards player, 50% random movement.
        /// </summary>
        private void MakeAIMove()
        {
            PlunderpunkGameManager manager = FindObjectOfType<PlunderpunkGameManager>();
            if (manager == null) return;

            if (Random.value > 0.5f)
            {
                MoveTowardsPlayer();
            }
            else
            {
                MoveRandomly();
            }
        }

        /// <summary>
        /// Moves the enemy ship towards the player.
        /// </summary>
        private void MoveTowardsPlayer()
        {
            PlayerShip player = FindObjectOfType<PlayerShip>();
            if (player != null)
            {
                int deltaX = Mathf.Clamp(player.gridX - gridX, -1, 1);
                int deltaY = Mathf.Clamp(player.gridY - gridY, -1, 1);
                
                MoveTo(gridX + deltaX, gridY + deltaY);
            }
        }

        /// <summary>
        /// Moves the enemy ship in a random direction.
        /// </summary>
        private void MoveRandomly()
        {
            int deltaX = Random.Range(-1, 2);
            int deltaY = Random.Range(-1, 2);
            MoveTo(gridX + deltaX, gridY + deltaY);
        }
    }
}
