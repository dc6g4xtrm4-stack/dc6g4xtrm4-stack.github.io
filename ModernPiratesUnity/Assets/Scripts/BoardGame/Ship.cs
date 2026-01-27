using UnityEngine;

namespace ModernPirates.BoardGame
{
    /// <summary>
    /// Represents a ship on the board game grid
    /// </summary>
    public class Ship : MonoBehaviour
    {
        public int gridX;
        public int gridY;
        public bool isPlayer;
        
        [Header("Ship Stats")]
        public int health = 100;
        public int maxHealth = 100;
        public int attackPower = 10;
        public int defense = 5;
        public int movementRange = 3;
        
        [Header("Visual")]
        public Material playerMaterial;
        public Material enemyMaterial;
        
        private Renderer shipRenderer;

        public void Initialize(int x, int y, bool player)
        {
            gridX = x;
            gridY = y;
            isPlayer = player;
            
            shipRenderer = GetComponent<Renderer>();
            if (shipRenderer != null)
            {
                shipRenderer.material = isPlayer ? playerMaterial : enemyMaterial;
            }
            
            // Set visual appearance
            transform.localScale = new Vector3(0.8f, 0.5f, 1.2f);
        }

        public void MoveTo(int x, int y)
        {
            gridX = x;
            gridY = y;
            
            // Smooth movement animation
            Vector3 targetPos = new Vector3(x, 0, y);
            StartCoroutine(SmoothMove(targetPos));
        }

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

        public void TakeDamage(int damage)
        {
            health -= damage;
            health = Mathf.Max(0, health);
            
            if (health <= 0)
            {
                Die();
            }
        }

        public void Heal(int amount)
        {
            health += amount;
            health = Mathf.Min(health, maxHealth);
        }

        private void Die()
        {
            Debug.Log($"{(isPlayer ? "Player" : "Enemy")} ship destroyed!");
            // Play death animation/effects
            Destroy(gameObject, 0.5f);
        }
    }

    /// <summary>
    /// Enemy ship with AI behavior
    /// </summary>
    public class EnemyShip : Ship
    {
        [Header("AI Settings")]
        public float moveInterval = 2f;
        private float moveTimer = 0f;

        private void Update()
        {
            moveTimer += Time.deltaTime;
            
            if (moveTimer >= moveInterval)
            {
                moveTimer = 0f;
                MakeAIMove();
            }
        }

        private void MakeAIMove()
        {
            // Simple AI: move randomly or towards player
            BoardGameManager manager = FindObjectOfType<BoardGameManager>();
            if (manager == null) return;

            // 50% chance to move towards player
            if (Random.value > 0.5f)
            {
                Ship playerShip = FindObjectOfType<Ship>();
                if (playerShip != null && playerShip.isPlayer)
                {
                    MoveTowardsTarget(playerShip.gridX, playerShip.gridY);
                }
            }
            else
            {
                // Random move
                int deltaX = Random.Range(-1, 2);
                int deltaY = Random.Range(-1, 2);
                MoveTo(gridX + deltaX, gridY + deltaY);
            }
        }

        private void MoveTowardsTarget(int targetX, int targetY)
        {
            int deltaX = Mathf.Clamp(targetX - gridX, -1, 1);
            int deltaY = Mathf.Clamp(targetY - gridY, -1, 1);
            
            MoveTo(gridX + deltaX, gridY + deltaY);
        }
    }
}
