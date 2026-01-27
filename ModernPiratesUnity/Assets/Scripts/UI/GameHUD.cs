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
            
            // Find combat manager to get camera mode
            Combat.CombatManager combatManager = FindObjectOfType<Combat.CombatManager>();
            if (combatManager != null && cameraModeText != null)
            {
                // This would require making currentCameraMode public in CombatManager
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
            
            // Find player ship to get cargo info
            OpenWorld.OpenWorldShip ship = FindObjectOfType<OpenWorld.OpenWorldShip>();
            if (ship != null && cargoText != null)
            {
                cargoText.text = $"Cargo: {ship.currentCargo}/{ship.cargoCapacity}";
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
