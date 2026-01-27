using UnityEngine;

namespace ModernPirates.OpenWorld
{
    /// <summary>
    /// Controls the player ship in open world mode.
    /// Programmatically creates all required components (Rigidbody, Collider).
    /// No prefabs or Unity Editor setup needed.
    /// </summary>
    public class OpenWorldShip : MonoBehaviour
    {
        [Header("Movement")]
        public float moveSpeed = 15f;
        public float turnSpeed = 40f;
        public float maxSpeed = 25f;
        
        [Header("Stats")]
        public int health = 100;
        public int maxHealth = 100;
        public int cargoCapacity = 100;
        public int currentCargo = 0;
        
        private Rigidbody rb;
        private bool initialized = false;

        /// <summary>
        /// Initializes the ship by programmatically adding required components.
        /// Creates Rigidbody and Collider if they don't exist.
        /// Configures physics properties for ship-like movement.
        /// </summary>
        public void Initialize()
        {
            initialized = true;
            
            rb = GetComponent<Rigidbody>();
            if (rb == null)
            {
                rb = gameObject.AddComponent<Rigidbody>();
            }
            
            // Configure rigidbody for ship physics on water
            rb.mass = 1000f;
            rb.linearDamping = 1f;
            rb.angularDamping = 2f;
            rb.useGravity = false;
            
            // Add collider if not present (should exist from CreatePrimitive, but make trigger)
            Collider collider = GetComponent<Collider>();
            if (collider == null)
            {
                BoxCollider box = gameObject.AddComponent<BoxCollider>();
                box.isTrigger = true;
            }
            else
            {
                collider.isTrigger = true;
            }
            
            Debug.Log("OpenWorldShip initialized with all components created programmatically");
        }

        private void Update()
        {
            if (!initialized) return;
            
            HandleInput();
            DisplayInfo();
        }

        private void HandleInput()
        {
            // Movement controls
            float forward = 0f;
            float turn = 0f;
            
            if (Input.GetKey(KeyCode.W))
                forward = 1f;
            if (Input.GetKey(KeyCode.S))
                forward = -0.5f; // Slower reverse
            if (Input.GetKey(KeyCode.A))
                turn = -1f;
            if (Input.GetKey(KeyCode.D))
                turn = 1f;
            
            MoveShip(forward, turn);
        }

        private void MoveShip(float forward, float turn)
        {
            // Forward/backward movement
            Vector3 movement = transform.forward * forward * moveSpeed * Time.deltaTime;
            rb.MovePosition(rb.position + movement);
            
            // Limit max speed
            if (rb.linearVelocity.magnitude > maxSpeed)
            {
                rb.linearVelocity = rb.linearVelocity.normalized * maxSpeed;
            }
            
            // Rotation
            float rotation = turn * turnSpeed * Time.deltaTime;
            Quaternion turnRotation = Quaternion.Euler(0f, rotation, 0f);
            rb.MoveRotation(rb.rotation * turnRotation);
        }

        private void DisplayInfo()
        {
            // Display ship info on screen (would be better with UI)
            if (Input.GetKey(KeyCode.Tab))
            {
                Debug.Log($"Ship Status - Health: {health}/{maxHealth}, Cargo: {currentCargo}/{cargoCapacity}");
            }
        }

        public void AddCargo(int amount)
        {
            currentCargo += amount;
            currentCargo = Mathf.Min(currentCargo, cargoCapacity);
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
            Debug.Log("Ship destroyed! Respawning...");
            // Respawn logic
            health = maxHealth;
            transform.position = Vector3.zero;
            currentCargo = 0;
        }
    }
}
