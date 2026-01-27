using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace ModernPirates.UI
{
    /// <summary>
    /// In-game HUD for all game modes
    /// </summary>
    public class GameHUD : MonoBehaviour
    {
        [Header("Common UI")]
        [SerializeField] private TextMeshProUGUI pointsText;
        [SerializeField] private TextMeshProUGUI healthText;
        [SerializeField] private Image healthBar;
        
        [Header("Board Game UI")]
        [SerializeField] private GameObject boardGamePanel;
        [SerializeField] private TextMeshProUGUI targetPointsText;
        [SerializeField] private TextMeshProUGUI islandsCapturedText;
        
        [Header("Combat UI")]
        [SerializeField] private GameObject combatPanel;
        [SerializeField] private TextMeshProUGUI cameraModeText;
        [SerializeField] private TextMeshProUGUI ammoText;
        
        [Header("Open World UI")]
        [SerializeField] private GameObject openWorldPanel;
        [SerializeField] private TextMeshProUGUI cargoText;
        [SerializeField] private TextMeshProUGUI lootCollectedText;
        
        // Cached references for performance
        private Combat.CombatManager cachedCombatManager;
        private OpenWorld.OpenWorldShip cachedPlayerShip;

        private void Start()
        {
            // Cache managers at start
            cachedCombatManager = FindObjectOfType<Combat.CombatManager>();
            cachedPlayerShip = FindObjectOfType<OpenWorld.OpenWorldShip>();
        }
        
        private void Update()
        {
            UpdateHUD();
        }

        private void UpdateHUD()
        {
            // Update based on current game mode
            if (GameManager.Instance != null)
            {
                PlayerData data = GameManager.Instance.playerData;
                
                // Common UI
                if (pointsText != null)
                {
                    pointsText.text = $"Points: {data.totalPoints}";
                }
                
                // Mode-specific UI
                switch (GameManager.Instance.currentGameMode)
                {
                    case GameManager.GameMode.BoardGame:
                        UpdateBoardGameUI(data);
                        break;
                    case GameManager.GameMode.Combat:
                        UpdateCombatUI();
                        break;
                    case GameManager.GameMode.OpenWorld:
                        UpdateOpenWorldUI(data);
                        break;
                }
            }
        }

        private void UpdateBoardGameUI(PlayerData data)
        {
            if (boardGamePanel != null)
            {
                boardGamePanel.SetActive(true);
            }
            if (combatPanel != null)
            {
                combatPanel.SetActive(false);
            }
            if (openWorldPanel != null)
            {
                openWorldPanel.SetActive(false);
            }
            
            if (targetPointsText != null)
            {
                targetPointsText.text = "Target: 25 points";
            }
            
            if (islandsCapturedText != null)
            {
                islandsCapturedText.text = $"Islands: {data.islandsCaptured}";
            }
        }

        private void UpdateCombatUI()
        {
            if (boardGamePanel != null)
            {
                boardGamePanel.SetActive(false);
            }
            if (combatPanel != null)
            {
                combatPanel.SetActive(true);
            }
            if (openWorldPanel != null)
            {
                openWorldPanel.SetActive(false);
            }
            
            // Use cached reference
            if (cachedCombatManager == null)
            {
                cachedCombatManager = FindObjectOfType<Combat.CombatManager>();
            }
            
            if (cachedCombatManager != null && cameraModeText != null)
            {
                cameraModeText.text = "Press C to toggle camera";
            }
        }

        private void UpdateOpenWorldUI(PlayerData data)
        {
            if (boardGamePanel != null)
            {
                boardGamePanel.SetActive(false);
            }
            if (combatPanel != null)
            {
                combatPanel.SetActive(false);
            }
            if (openWorldPanel != null)
            {
                openWorldPanel.SetActive(true);
            }
            
            if (lootCollectedText != null)
            {
                lootCollectedText.text = $"Loot: {data.lootCollected}";
            }
            
            // Use cached reference
            if (cachedPlayerShip == null)
            {
                cachedPlayerShip = FindObjectOfType<OpenWorld.OpenWorldShip>();
            }
            
            if (cachedPlayerShip != null && cargoText != null)
            {
                cargoText.text = $"Cargo: {cachedPlayerShip.currentCargo}/{cachedPlayerShip.cargoCapacity}";
            }
        }

        public void UpdateHealthBar(int current, int max)
        {
            if (healthText != null)
            {
                healthText.text = $"Health: {current}/{max}";
            }
            
            if (healthBar != null)
            {
                healthBar.fillAmount = (float)current / max;
            }
        }
    }
}
