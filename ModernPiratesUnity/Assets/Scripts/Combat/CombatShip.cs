using UnityEngine;

namespace ModernPirates.Combat
{
    /// <summary>
    /// Controls ship behavior in combat mode
    /// </summary>
    public class CombatShip : MonoBehaviour
    {
        [Header("Ship Stats")]
        public int health = 100;
        public int maxHealth = 100;
        public float moveSpeed = 10f;
        public float turnSpeed = 30f;
        
        [Header("Weapons")]
        public int cannonDamage = 15;
        public float fireRate = 1f;
        public float cannonRange = 50f;
        
        [Header("Prefabs")]
        public GameObject cannonballPrefab;
        public Transform leftCannonPosition;
        public Transform rightCannonPosition;
        
        public bool isPlayer;
        private float nextFireTime = 0f;
        private Rigidbody rb;
        
        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            if (rb == null)
            {
                rb = gameObject.AddComponent<Rigidbody>();
            }
            
            // Configure rigidbody for ship physics
            rb.mass = 1000f;
            rb.drag = 2f;
            rb.angularDrag = 3f;
            rb.useGravity = false;
        }

        public void Initialize(bool player)
        {
            isPlayer = player;
            health = maxHealth;
            
            // Setup visual differences
            if (!isPlayer)
            {
                // Enemy ships are slightly different color
                Renderer[] renderers = GetComponentsInChildren<Renderer>();
                foreach (var renderer in renderers)
                {
                    renderer.material.color = new Color(0.8f, 0.2f, 0.2f);
                }
            }
        }

        private void Update()
        {
            if (isPlayer)
            {
                HandlePlayerInput();
            }
            else
            {
                HandleAI();
            }
        }

        private void HandlePlayerInput()
        {
            // Movement controls (WASD)
            float forward = 0f;
            float turn = 0f;
            
            if (Input.GetKey(KeyCode.W))
                forward = 1f;
            if (Input.GetKey(KeyCode.S))
                forward = -1f;
            if (Input.GetKey(KeyCode.A))
                turn = -1f;
            if (Input.GetKey(KeyCode.D))
                turn = 1f;
            
            // Apply movement
            MoveShip(forward, turn);
            
            // Fire cannons (Space or Left Click)
            if ((Input.GetKeyDown(KeyCode.Space) || Input.GetMouseButtonDown(0)) && Time.time >= nextFireTime)
            {
                FireCannons();
                nextFireTime = Time.time + fireRate;
            }
        }

        private void HandleAI()
        {
            // Simple AI: face player and fire
            CombatShip playerShip = FindPlayerShip();
            if (playerShip == null) return;
            
            Vector3 directionToPlayer = (playerShip.transform.position - transform.position).normalized;
            float distanceToPlayer = Vector3.Distance(transform.position, playerShip.transform.position);
            
            // Rotate towards player
            Quaternion targetRotation = Quaternion.LookRotation(directionToPlayer);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.deltaTime * turnSpeed * 0.5f);
            
            // Move towards player if too far
            if (distanceToPlayer > cannonRange * 0.7f)
            {
                MoveShip(1f, 0f);
            }
            else if (distanceToPlayer < cannonRange * 0.3f)
            {
                // Back away if too close
                MoveShip(-0.5f, 0f);
            }
            
            // Fire at player
            if (Time.time >= nextFireTime && distanceToPlayer <= cannonRange)
            {
                FireCannons();
                nextFireTime = Time.time + fireRate * Random.Range(0.8f, 1.5f);
            }
        }

        private void MoveShip(float forward, float turn)
        {
            // Forward/backward movement
            Vector3 movement = transform.forward * forward * moveSpeed * Time.deltaTime;
            rb.MovePosition(rb.position + movement);
            
            // Rotation
            float rotation = turn * turnSpeed * Time.deltaTime;
            Quaternion turnRotation = Quaternion.Euler(0f, rotation, 0f);
            rb.MoveRotation(rb.rotation * turnRotation);
        }

        private void FireCannons()
        {
            // Fire from both sides
            if (leftCannonPosition != null)
            {
                FireCannonball(leftCannonPosition, -transform.right);
            }
            if (rightCannonPosition != null)
            {
                FireCannonball(rightCannonPosition, transform.right);
            }
            
            // Fire forward cannons
            FireCannonball(transform, transform.forward);
        }

        private void FireCannonball(Transform spawnPoint, Vector3 direction)
        {
            if (cannonballPrefab == null)
            {
                // Create a simple sphere as cannonball if prefab not assigned
                GameObject ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                ball.transform.position = spawnPoint.position;
                ball.transform.localScale = Vector3.one * 0.5f;
                
                Rigidbody ballRb = ball.AddComponent<Rigidbody>();
                ballRb.velocity = direction * 30f;
                
                Cannonball cannonball = ball.AddComponent<Cannonball>();
                cannonball.damage = cannonDamage;
                cannonball.owner = this;
                
                Destroy(ball, 5f);
            }
            else
            {
                GameObject ball = Instantiate(cannonballPrefab, spawnPoint.position, Quaternion.identity);
                Rigidbody ballRb = ball.GetComponent<Rigidbody>();
                if (ballRb != null)
                {
                    ballRb.velocity = direction * 30f;
                }
                
                Cannonball cannonball = ball.GetComponent<Cannonball>();
                if (cannonball != null)
                {
                    cannonball.damage = cannonDamage;
                    cannonball.owner = this;
                }
                
                Destroy(ball, 5f);
            }
        }

        public void TakeDamage(int damage)
        {
            health -= damage;
            health = Mathf.Max(0, health);
            
            Debug.Log($"{(isPlayer ? "Player" : "Enemy")} ship took {damage} damage! Health: {health}/{maxHealth}");
            
            if (health <= 0)
            {
                Die();
            }
        }

        private void Die()
        {
            Debug.Log($"{(isPlayer ? "Player" : "Enemy")} ship destroyed!");
            // Play explosion effect
            // Disable ship
            enabled = false;
        }

        private CombatShip FindPlayerShip()
        {
            CombatShip[] ships = FindObjectsOfType<CombatShip>();
            foreach (var ship in ships)
            {
                if (ship.isPlayer)
                    return ship;
            }
            return null;
        }
    }

    /// <summary>
    /// Cannonball projectile
    /// </summary>
    public class Cannonball : MonoBehaviour
    {
        public int damage = 15;
        public CombatShip owner;
        
        private void OnCollisionEnter(Collision collision)
        {
            CombatShip ship = collision.gameObject.GetComponent<CombatShip>();
            
            // Don't hit the ship that fired it
            if (ship != null && ship != owner)
            {
                ship.TakeDamage(damage);
                Destroy(gameObject);
            }
        }
    }
}
