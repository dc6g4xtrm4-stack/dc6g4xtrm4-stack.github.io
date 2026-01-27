// Persistent Drawing Board
// Canvas-based drawing application with local storage

let drawingGame = null;

function initDrawing() {
  const canvas = document.getElementById("drawingCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  drawingGame = {
    canvas: canvas,
    ctx: ctx,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    color: "#ffffff",
    brushSize: 5
  };
  
  // Load canvas from localStorage
  loadDrawingFromStorage();
  
  // Setup event listeners
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseout", stopDrawing);
  
  document.getElementById("drawClearBtn").addEventListener("click", clearDrawing);
  document.getElementById("drawColorPicker").addEventListener("change", (e) => {
    drawingGame.color = e.target.value;
  });
  document.getElementById("drawBrushSize").addEventListener("change", (e) => {
    drawingGame.brushSize = e.target.value;
  });
}

function startDrawing(e) {
  if (!drawingGame) return;
  
  drawingGame.isDrawing = true;
  const rect = drawingGame.canvas.getBoundingClientRect();
  drawingGame.lastX = e.clientX - rect.left;
  drawingGame.lastY = e.clientY - rect.top;
}

function draw(e) {
  if (!drawingGame || !drawingGame.isDrawing) return;
  
  const rect = drawingGame.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const { ctx, color, brushSize } = drawingGame;
  
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  
  ctx.beginPath();
  ctx.moveTo(drawingGame.lastX, drawingGame.lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  drawingGame.lastX = x;
  drawingGame.lastY = y;
  
  // Save to storage
  saveDrawingToStorage();
}

function stopDrawing() {
  if (drawingGame) {
    drawingGame.isDrawing = false;
  }
}

function clearDrawing() {
  if (!drawingGame) return;
  
  drawingGame.ctx.fillStyle = "#1a1a1a";
  drawingGame.ctx.fillRect(0, 0, drawingGame.canvas.width, drawingGame.canvas.height);
  
  localStorage.removeItem("drawingCanvas");
}

function saveDrawingToStorage() {
  if (!drawingGame) return;
  
  try {
    const imageData = drawingGame.canvas.toDataURL("image/png");
    localStorage.setItem("drawingCanvas", imageData);
  } catch (e) {
    console.error("Failed to save drawing:", e);
  }
}

function loadDrawingFromStorage() {
  if (!drawingGame) return;
  
  try {
    const imageData = localStorage.getItem("drawingCanvas");
    if (imageData) {
      const img = new Image();
      img.onload = () => {
        // Clear and draw saved image
        drawingGame.ctx.fillStyle = "#1a1a1a";
        drawingGame.ctx.fillRect(0, 0, drawingGame.canvas.width, drawingGame.canvas.height);
        drawingGame.ctx.drawImage(img, 0, 0);
      };
      img.src = imageData;
    } else {
      // Initialize blank canvas
      drawingGame.ctx.fillStyle = "#1a1a1a";
      drawingGame.ctx.fillRect(0, 0, drawingGame.canvas.width, drawingGame.canvas.height);
    }
  } catch (e) {
    console.error("Failed to load drawing:", e);
    drawingGame.ctx.fillStyle = "#1a1a1a";
    drawingGame.ctx.fillRect(0, 0, drawingGame.canvas.width, drawingGame.canvas.height);
  }
}