// gameState.js

let gameState = "start"; // "start", "playing", "gameover", "pause"
const overlay = document.createElement("div");

function showStartScreen() {
    overlay.id = "gameOverlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "white";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.color = "black";
    overlay.style.fontFamily = "Arial";

    overlay.innerHTML = `
        <h1 style="margin-bottom:20px;">Aqua Tamago Game</h1>
        <p>Collect egg rolls and cats, avoid oinons and jobs in one Minute.</p>
        <p>The game is over if the game time is over or the point reaches negative.</p>
        <button id="startBtn" style="padding:10px 20px;font-size:18px;">Start Game</button>
    `;

    document.body.appendChild(overlay);

    document.getElementById("startBtn").onclick = () => {
        startGame();
    };
}

function showGameOverScreen(finalScore, goodCount, badCount) {
    overlay.id = "gameOverlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.fontFamily = "Arial";

    if (finalScore < 0) {
        overlay.style.color = "white";
        overlay.innerHTML = `
        <h1 style="margin-bottom:20px; color: red">Game Over</h1>
        <p style="margin:5px;">Good: ${goodCount}</p>
        <p style="margin:5px;">Bad: ${badCount}</p>
        <button id="restartBtn" style="padding:10px 20px;font-size:18px;margin-top:15px;">Play Again</button>
    `;

    } else {
        overlay.style.color = "white";
        overlay.innerHTML = `
        <h1 style="margin-bottom:20px; color: aqua">Game Set</h1>
        <p style="margin:5px;">Score: ${finalScore} pt</p>
        <p style="margin:5px;">Good: ${goodCount}</p>
        <p style="margin:5px;">Bad: ${badCount}</p>
        <button id="restartBtn" style="padding:10px 20px;font-size:18px;margin-top:15px;">Play Again</button>
    `;
    }

    document.body.appendChild(overlay);

    document.getElementById("restartBtn").onclick = () => {
        startGame();
    };
}

function showPauseScreen() {
    overlay.id = "pauseOverlay";
    overlay.style.position = "absolute";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "column";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.fontFamily = "Arial";

    overlay.innerHTML = `
    <h1 style="margin-bottom:20px; color: aqua">Pause</h1>
    <button id="restartBtn" style="padding:10px 20px;font-size:18px;margin-top:15px;">Continue</button>
    <button id="restartBtn" style="padding:10px 20px;font-size:18px;margin-top:15px;">Back to Home</button>`


}

function removeOverlay() {
    const overlay = document.getElementById("gameOverlay");
    if (overlay) overlay.remove();
}

function startGame() {
    removeOverlay();
    gameState = "playing";

    // Call your game init function (reset all variables, start loops, etc.)
    initGame();
}

function endGame(finalScore, goodCount, badCount) {
    gameState = "gameover";
    showGameOverScreen(finalScore, goodCount, badCount);
}
