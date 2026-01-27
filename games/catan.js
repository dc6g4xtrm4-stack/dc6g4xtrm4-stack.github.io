// Catan-like Board Game
// A game similar to Settlers of Catan with resource trading and settlement building

function initCatan() {
  const canvas = document.getElementById("catanCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Clear canvas
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw placeholder
  ctx.fillStyle = "#f5f5f5";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Catan Game - Board Setup", canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = "14px Arial";
  ctx.fillText("Click to place settlements and roads", canvas.width / 2, canvas.height / 2 + 20);
  
  // Reset button
  const resetBtn = document.getElementById("catanResetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", initCatan);
  }
}
