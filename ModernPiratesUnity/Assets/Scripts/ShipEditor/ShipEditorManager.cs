using UnityEngine;
using UnityEngine.InputSystem;
using System.Collections.Generic;

namespace ModernPirates.ShipEditor
{
    /// <summary>
    /// Manages the ship editor mode where players can customize and design their ships.
    /// Fully programmatic - all UI, ship parts, camera, and lighting created via code.
    /// No Unity Editor setup or prefabs required.
    /// </summary>
    public class ShipEditorManager : MonoBehaviour
    {
        [Header("Editor Settings")]
        [SerializeField] private float gridSize = 1f;
        [SerializeField] private int maxShipSize = 20;
        
        [Header("Ship Parts")]
        private List<ShipPart> placedParts = new List<ShipPart>();
        
        [Header("Camera")]
        private Camera mainCamera;
        
        private GameObject shipBase;
        private GameObject previewPart;
        private PartType currentPartType = PartType.Hull;
        
        public enum PartType
        {
            Hull,
            Mast,
            Cannon,
            Sail,
            Decoration
        }

        private void Start()
        {
            // Ensure scene has required components
            EnsureSceneSetup();
            
            mainCamera = Camera.main;
            InitializeEditor();
        }

        /// <summary>
        /// Ensures the scene has all necessary components (camera, lighting, etc.)
        /// Creates them programmatically if missing - zero Unity Editor setup required!
        /// </summary>
        private void EnsureSceneSetup()
        {
            // Create main camera if missing
            if (Camera.main == null)
            {
                GameObject cameraObj = new GameObject("Main Camera");
                Camera camera = cameraObj.AddComponent<Camera>();
                cameraObj.tag = "MainCamera";
                
                // Position camera for editor view
                cameraObj.transform.position = new Vector3(0f, 10f, -15f);
                cameraObj.transform.rotation = Quaternion.Euler(30f, 0f, 0f);
                
                camera.backgroundColor = new Color(0.1f, 0.1f, 0.15f);
                camera.clearFlags = CameraClearFlags.SolidColor;
                
                Debug.Log("ShipEditor: Created main camera programmatically");
            }

            // Add directional light if missing
            Light[] lights = FindObjectsOfType<Light>();
            if (lights.Length == 0)
            {
                GameObject lightObj = new GameObject("Directional Light");
                Light light = lightObj.AddComponent<Light>();
                light.type = LightType.Directional;
                light.color = Color.white;
                light.intensity = 1f;
                lightObj.transform.rotation = Quaternion.Euler(50f, -30f, 0f);
                
                Debug.Log("ShipEditor: Created directional light programmatically");
            }
        }

        private void InitializeEditor()
        {
            Debug.Log("Initializing Ship Editor...");
            
            // Create grid floor
            CreateGridFloor();
            
            // Create initial ship base
            CreateShipBase();
            
            // Create part palette UI (programmatically)
            CreatePartPalette();
            
            Debug.Log("Ship Editor initialized successfully!");
        }

        private void CreateGridFloor()
        {
            // Create a grid plane to represent the build area
            GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
            floor.name = "EditorFloor";
            floor.transform.position = new Vector3(0, -0.1f, 0);
            floor.transform.localScale = new Vector3(5f, 1f, 5f);
            
            // Create and assign material
            Material floorMaterial = new Material(Shader.Find("Standard"));
            floorMaterial.color = new Color(0.2f, 0.2f, 0.25f);
            floor.GetComponent<Renderer>().material = floorMaterial;
            
            // Remove collider if not needed
            Destroy(floor.GetComponent<Collider>());
        }

        private void CreateShipBase()
        {
            // Create the base platform for ship building
            shipBase = GameObject.CreatePrimitive(PrimitiveType.Cube);
            shipBase.name = "ShipBase";
            shipBase.transform.position = new Vector3(0, 0, 0);
            shipBase.transform.localScale = new Vector3(3f, 0.5f, 6f);
            
            // Create material for ship base
            Material baseMaterial = new Material(Shader.Find("Standard"));
            baseMaterial.color = new Color(0.4f, 0.3f, 0.2f); // Brown wood color
            shipBase.GetComponent<Renderer>().material = baseMaterial;
            
            // Add to placed parts list
            ShipPart basePartComponent = shipBase.AddComponent<ShipPart>();
            basePartComponent.partType = PartType.Hull;
            placedParts.Add(basePartComponent);
        }

        private void CreatePartPalette()
        {
            // This would create UI buttons for different part types
            // For now, we'll use keyboard input to switch parts
            Debug.Log("Part Palette: Use keys 1-5 to select part types");
            Debug.Log("1: Hull, 2: Mast, 3: Cannon, 4: Sail, 5: Decoration");
        }

        private void Update()
        {
            HandleInput();
            UpdatePreviewPart();
        }

        private void HandleInput()
        {
            // Check if Input System is available
            if (Keyboard.current == null || Mouse.current == null)
            {
                return;
            }

            // Part type selection
            if (Keyboard.current.digit1Key.wasPressedThisFrame)
            {
                SetPartType(PartType.Hull);
            }
            else if (Keyboard.current.digit2Key.wasPressedThisFrame)
            {
                SetPartType(PartType.Mast);
            }
            else if (Keyboard.current.digit3Key.wasPressedThisFrame)
            {
                SetPartType(PartType.Cannon);
            }
            else if (Keyboard.current.digit4Key.wasPressedThisFrame)
            {
                SetPartType(PartType.Sail);
            }
            else if (Keyboard.current.digit5Key.wasPressedThisFrame)
            {
                SetPartType(PartType.Decoration);
            }

            // Place part on click
            if (Mouse.current.leftButton.wasPressedThisFrame)
            {
                PlaceCurrentPart();
            }

            // Return to main menu
            if (Keyboard.current.escapeKey.wasPressedThisFrame)
            {
                ReturnToMainMenu();
            }

            // Camera rotation with arrow keys
            if (Keyboard.current.leftArrowKey.isPressed)
            {
                mainCamera.transform.RotateAround(Vector3.zero, Vector3.up, 50f * Time.deltaTime);
            }
            if (Keyboard.current.rightArrowKey.isPressed)
            {
                mainCamera.transform.RotateAround(Vector3.zero, Vector3.up, -50f * Time.deltaTime);
            }
        }

        private void SetPartType(PartType newType)
        {
            if (currentPartType != newType)
            {
                currentPartType = newType;
                // Destroy old preview to create new one for the new type
                if (previewPart != null)
                {
                    Destroy(previewPart);
                    previewPart = null;
                }
                Debug.Log($"Selected: {currentPartType}");
            }
        }

        private void UpdatePreviewPart()
        {
            // Check if Input System is available
            if (Mouse.current == null || mainCamera == null)
            {
                return;
            }

            // Show preview of part at mouse position
            Ray ray = mainCamera.ScreenPointToRay(Mouse.current.position.ReadValue());
            RaycastHit hit;
            
            if (Physics.Raycast(ray, out hit))
            {
                // Update preview position
                if (previewPart == null)
                {
                    previewPart = CreatePartObject(currentPartType, true);
                }
                
                // Snap to grid
                Vector3 snappedPosition = new Vector3(
                    Mathf.Round(hit.point.x / gridSize) * gridSize,
                    Mathf.Round(hit.point.y / gridSize) * gridSize,
                    Mathf.Round(hit.point.z / gridSize) * gridSize
                );
                
                previewPart.transform.position = snappedPosition;
                previewPart.SetActive(true);
            }
            else
            {
                // Hide preview when not over valid surface
                if (previewPart != null)
                {
                    previewPart.SetActive(false);
                }
            }
        }

        private void PlaceCurrentPart()
        {
            if (previewPart != null && placedParts.Count < maxShipSize)
            {
                // Create permanent part at preview position
                GameObject newPart = CreatePartObject(currentPartType, false);
                newPart.transform.position = previewPart.transform.position;
                newPart.transform.rotation = previewPart.transform.rotation;
                
                ShipPart partComponent = newPart.AddComponent<ShipPart>();
                partComponent.partType = currentPartType;
                placedParts.Add(partComponent);
                
                Debug.Log($"Placed {currentPartType} part at {newPart.transform.position}");
            }
            else if (placedParts.Count >= maxShipSize)
            {
                Debug.LogWarning("Maximum ship size reached!");
            }
        }

        private GameObject CreatePartObject(PartType type, bool isPreview)
        {
            GameObject part = null;
            Material material = new Material(Shader.Find("Standard"));
            
            switch (type)
            {
                case PartType.Hull:
                    part = GameObject.CreatePrimitive(PrimitiveType.Cube);
                    part.transform.localScale = new Vector3(2f, 1f, 3f);
                    material.color = isPreview ? new Color(0.4f, 0.3f, 0.2f, 0.5f) : new Color(0.4f, 0.3f, 0.2f);
                    break;
                    
                case PartType.Mast:
                    part = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                    part.transform.localScale = new Vector3(0.3f, 4f, 0.3f);
                    material.color = isPreview ? new Color(0.3f, 0.2f, 0.1f, 0.5f) : new Color(0.3f, 0.2f, 0.1f);
                    break;
                    
                case PartType.Cannon:
                    part = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                    part.transform.localScale = new Vector3(0.3f, 0.8f, 0.3f);
                    part.transform.rotation = Quaternion.Euler(0, 0, 90);
                    material.color = isPreview ? new Color(0.3f, 0.3f, 0.3f, 0.5f) : new Color(0.3f, 0.3f, 0.3f);
                    break;
                    
                case PartType.Sail:
                    part = GameObject.CreatePrimitive(PrimitiveType.Quad);
                    part.transform.localScale = new Vector3(3f, 4f, 1f);
                    material.color = isPreview ? new Color(0.9f, 0.9f, 0.9f, 0.5f) : new Color(0.9f, 0.9f, 0.9f);
                    break;
                    
                case PartType.Decoration:
                    part = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                    part.transform.localScale = new Vector3(0.5f, 0.5f, 0.5f);
                    material.color = isPreview ? new Color(0.8f, 0.6f, 0.2f, 0.5f) : new Color(0.8f, 0.6f, 0.2f);
                    break;
            }
            
            if (part != null)
            {
                part.name = isPreview ? "Preview" : type.ToString();
                
                // Configure material for transparency if preview
                if (isPreview)
                {
                    // Set rendering mode to transparent
                    material.SetFloat("_Mode", 3);
                    material.SetInt("_SrcBlend", (int)UnityEngine.Rendering.BlendMode.SrcAlpha);
                    material.SetInt("_DstBlend", (int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
                    material.SetInt("_ZWrite", 0);
                    material.DisableKeyword("_ALPHATEST_ON");
                    material.EnableKeyword("_ALPHABLEND_ON");
                    material.DisableKeyword("_ALPHAPREMULTIPLY_ON");
                    material.renderQueue = 3000;
                    
                    // Remove collider from preview to prevent interference
                    Destroy(part.GetComponent<Collider>());
                }
                
                part.GetComponent<Renderer>().material = material;
            }
            
            return part;
        }

        private void ReturnToMainMenu()
        {
            Debug.Log("Returning to Main Menu...");
            GameManager.Instance?.SwitchGameMode(GameManager.GameMode.MainMenu);
        }

        private void OnDestroy()
        {
            // Cleanup preview part
            if (previewPart != null)
            {
                Destroy(previewPart);
            }
        }
    }

    /// <summary>
    /// Component attached to each ship part
    /// </summary>
    public class ShipPart : MonoBehaviour
    {
        public ShipEditorManager.PartType partType;
    }
}
