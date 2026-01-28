using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace ModernPirates.UI
{
    /// <summary>
    /// Main menu UI controller
    /// </summary>
    public class MainMenuUI : MonoBehaviour
    {
        [Header("Menu Panels")]
        [SerializeField] private GameObject mainPanel;
        [SerializeField] private GameObject settingsPanel;
        
        [Header("Buttons")]
        [SerializeField] private Button boardGameButton;
        [SerializeField] private Button combatButton;
        [SerializeField] private Button openWorldButton;
        [SerializeField] private Button shipEditorButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button quitButton;
        
        [Header("Text")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI versionText;

        private void Start()
        {
            SetupButtons();
            ShowMainPanel();
            
            if (versionText != null)
            {
                versionText.text = "v1.0.0";
            }
            
            if (titleText != null)
            {
                titleText.text = "MODERN PIRATES";
            }
        }

        private void SetupButtons()
        {
            if (boardGameButton != null)
            {
                boardGameButton.onClick.AddListener(OnBoardGameClicked);
            }
            
            if (combatButton != null)
            {
                combatButton.onClick.AddListener(OnCombatClicked);
            }
            
            if (openWorldButton != null)
            {
                openWorldButton.onClick.AddListener(OnOpenWorldClicked);
            }
            
            if (shipEditorButton != null)
            {
                shipEditorButton.onClick.AddListener(OnShipEditorClicked);
            }
            
            if (settingsButton != null)
            {
                settingsButton.onClick.AddListener(OnSettingsClicked);
            }
            
            if (quitButton != null)
            {
                quitButton.onClick.AddListener(OnQuitClicked);
            }
        }

        private void OnBoardGameClicked()
        {
            Debug.Log("Starting Board Game Mode");
            GameManager.Instance?.SwitchGameMode(GameManager.GameMode.BoardGame);
        }

        private void OnCombatClicked()
        {
            Debug.Log("Starting Combat Mode");
            GameManager.Instance?.SwitchGameMode(GameManager.GameMode.Combat);
        }

        private void OnOpenWorldClicked()
        {
            Debug.Log("Starting Open World Mode");
            GameManager.Instance?.SwitchGameMode(GameManager.GameMode.OpenWorld);
        }

        private void OnShipEditorClicked()
        {
            Debug.Log("Starting Ship Editor Mode");
            GameManager.Instance?.SwitchGameMode(GameManager.GameMode.ShipEditor);
        }

        private void OnSettingsClicked()
        {
            ShowSettingsPanel();
        }

        private void OnQuitClicked()
        {
            Debug.Log("Quitting game");
            Application.Quit();
            
            #if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
            #endif
        }

        private void ShowMainPanel()
        {
            if (mainPanel != null) mainPanel.SetActive(true);
            if (settingsPanel != null) settingsPanel.SetActive(false);
        }

        private void ShowSettingsPanel()
        {
            if (mainPanel != null) mainPanel.SetActive(false);
            if (settingsPanel != null) settingsPanel.SetActive(true);
        }

        public void OnBackToMain()
        {
            ShowMainPanel();
        }
    }
}
