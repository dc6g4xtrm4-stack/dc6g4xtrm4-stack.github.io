using UnityEngine;
using UnityEngine.InputSystem;

namespace ModernPirates.Combat
{
    /// <summary>
    /// Controls ship behavior in combat mode.
    /// All projectiles and effects are created programmatically - no prefabs needed.
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
            rb.linearDamping = 2f;
            rb.angularDamping = 3f;
            rb.useGravity = false;
        }

        /// <summary>
        /// Initializes the combat ship with programmatically created materials.
        /// Player ships are blue, enemy ships are red.
        /// </summary>
        public void Initialize(bool player)
        {
            isPlayer = player;
            health = maxHealth;
            
            // Setup visual differences programmatically
            Renderer renderer = GetComponent<Renderer>();
            if (renderer != null)
            {
                Material shipMaterial = new Material(Shader.Find("Standard"));
                
                if (isPlayer)
                {
                    // Player ship is blue
                    shipMaterial.color = new Color(0.2f, 0.4f, 0.9f);
                }
                else
                {
                    // Enemy ship is red
                    shipMaterial.color = new Color(0.8f, 0.2f, 0.2f);
                }
                
                shipMaterial.SetFloat("_Metallic", 0.5f);
                shipMaterial.SetFloat("_Glossiness", 0.6f);
                
                renderer.material = shipMaterial;
            }
            
            Debug.Log($"{(isPlayer ? "Player" : "Enemy")} combat ship initialized");
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
            
            if (Keyboard.current != null)
            {
                if (Keyboard.current.wKey.isPressed)
                    forward = 1f;
                if (Keyboard.current.sKey.isPressed)
                    forward = -1f;
                if (Keyboard.current.aKey.isPressed)
                    turn = -1f;
                if (Keyboard.current.dKey.isPressed)
                    turn = 1f;
            }
            
            // Apply movement
            MoveShip(forward, turn);
            
            // Fire cannons (Space or Left Click)
            bool firePressed = false;
            if (Keyboard.current != null && Keyboard.current.spaceKey.wasPressedThisFrame)
                firePressed = true;
            if (Mouse.current != null && Mouse.current.leftButton.wasPressedThisFrame)
                firePressed = true;
                
            if (firePressed && Time.time >= nextFireTime)
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

        /// <summary>
        /// Fires cannons from the ship.
        /// Creates cannonball projectiles programmatically using Unity primitives.
        /// No prefabs or pre-created assets needed.
        /// </summary>
        private void FireCannons()
        {
            // Fire from left, right, and forward positions
            // Broadside left, broadside right, and forward cannon pattern
            Vector3 leftOffset = -transform.right * 1.5f + transform.forward * 2f;
            Vector3 rightOffset = transform.right * 1.5f + transform.forward * 2f;
            Vector3 forwardOffset = transform.forward * 3f;
            
            FireCannonball(transform.position + leftOffset, (-transform.right + transform.forward).normalized);
            FireCannonball(transform.position + rightOffset, (transform.right + transform.forward).normalized);
            FireCannonball(transform.position + forwardOffset, transform.forward);
        }

        /// <summary>
        /// Creates and launches a cannonball projectile programmatically.
        /// Uses a sphere primitive with physics-based motion.
        /// </summary>
        private void FireCannonball(Vector3 spawnPosition, Vector3 direction)
        {
            // Create cannonball sphere programmatically
            GameObject ball = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            ball.name = "Cannonball";
            ball.transform.position = spawnPosition;
            ball.transform.localScale = Vector3.one * 0.5f;
            
            // Create dark material for cannonball
            Material ballMaterial = new Material(Shader.Find("Standard"));
            ballMaterial.color = new Color(0.1f, 0.1f, 0.1f); // Dark gray/black
            ballMaterial.SetFloat("_Metallic", 0.8f);
            ballMaterial.SetFloat("_Glossiness", 0.4f);
            Renderer ballRenderer = ball.GetComponent<Renderer>();
            ballRenderer.material = ballMaterial;
            
            // Add physics
            Rigidbody ballRb = ball.AddComponent<Rigidbody>();
            ballRb.mass = 10f;
            ballRb.linearVelocity = direction.normalized * 30f;
            ballRb.useGravity = true;
            
            // Add cannonball component
            Cannonball cannonball = ball.AddComponent<Cannonball>();
            cannonball.damage = cannonDamage;
            cannonball.owner = this;
            
            // Destroy after 5 seconds
            Destroy(ball, 5f);
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
