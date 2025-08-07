const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const OBJECT_SIZE = canvas.width / 10;
const PADDLE_SIZE = canvas.width / 9;
// enum for objects
const objectType = {
    TAMAGO: 0,
    CAT: 1,
    ONION: 2,
    JOB: 3,
}

//images
const tamagoImg = new Image();
const catImg = new Image();
const onionImg = new Image();
const jobImg = new Image();
const paddleImg = new Image();
const paddleHappyImg = new Image();
const paddleSadImg = new Image();
tamagoImg.src = "pics/tamago.png";
catImg.src = "pics/cat.png";
onionImg.src = "pics/onion.png";
jobImg.src = "pics/job.png";
paddleImg.src = "pics/tenor.png";
paddleHappyImg.src = "pics/aqua_happy.png";
paddleSadImg.src = "pics/aqua_sad.png";


let paddleX = canvas.width / 2 - PADDLE_SIZE / 2;
const paddleY = canvas.height - PADDLE_SIZE;
const paddleSpeed = 5;
let moveLeft = false;
let moveRight = false;
let isHappy = false;
let isSad = false;
let happyTimeout = null;
let sadTimeout = null;
let goodCount = 0;
let badCount = 0;
let score = 0;
let popupVisible = false;
let popupColor;
let popupText;

let timeLeft = 60;
let gameOver = false;

let objectLifeCycle;
let gameLifeCycle;
let timerInterval;

let tamagoCoordinates = []; // store all tamago objects

const pogAudio = new Audio('audio/pog.ogg');
const faqAudio = new Audio('audio/faq.ogg');
pogAudio.volume = 0.5;
pogAudio.loop = false;
faqAudio.loop = false;
faqAudio.volume = 0.5;



const speed = {
    slow: OBJECT_SIZE / 15,
    normal: OBJECT_SIZE / 20,
    fast: OBJECT_SIZE / 25,
    veryfast: OBJECT_SIZE / 30,
}

function createObject(type) {
    const maxX = canvas.width - OBJECT_SIZE;
    const x = Math.floor(Math.random() * maxX);
    let fallSpeed = Math.floor(Math.random() * 3);

    switch (fallSpeed) {
        case 0:
            fallSpeed = speed.slow;
            break;
        case 1:
            fallSpeed = speed.normal;
            break;
        case 2:
            fallSpeed = speed.fast;
            break;
        case 3:
            fallSpeed = speed.veryfast;
            break;
    }
    tamagoCoordinates.push({x, y: 0, dy: fallSpeed, type});
}

function create() {
    const type = Math.floor(Math.random() * 4);
    switch (type) {
        case 0:
            createObject(objectType.TAMAGO);
            break;
        case 1:
            createObject(objectType.CAT);
            break;
        case 2:
            createObject(objectType.ONION);
            break;
        case 3:
            createObject(objectType.JOB);
            break;
    }
}

// Draw a single tamago
function drawObject(t) {
    switch (t.type) {
        case objectType.TAMAGO:
            ctx.drawImage(tamagoImg, t.x, t.y, OBJECT_SIZE, OBJECT_SIZE);
            break;
        case objectType.CAT:
            ctx.drawImage(catImg, t.x, t.y, OBJECT_SIZE, OBJECT_SIZE);
            break;
        case objectType.ONION:
            ctx.drawImage(onionImg, t.x, t.y, OBJECT_SIZE, OBJECT_SIZE);
            break;
        case objectType.JOB:
            ctx.drawImage(jobImg, t.x, t.y, OBJECT_SIZE, OBJECT_SIZE);
            break;
    }
}

function drawPaddle() {
    if (isHappy) {
        ctx.drawImage(paddleHappyImg, paddleX, paddleY, PADDLE_SIZE, PADDLE_SIZE);
    } else if (isSad) {
        ctx.drawImage(paddleSadImg, paddleX, paddleY, PADDLE_SIZE, PADDLE_SIZE)
    } else {
        ctx.drawImage(paddleImg, paddleX, paddleY, PADDLE_SIZE, PADDLE_SIZE);
    }
}

function makeAquaHappy() {
    if (isHappy) return; // ignore if already happy
    isHappy = true;
    popupVisible = true;
    pogAudio.currentTime = 0;
    pogAudio.play();

    // revert back after 300 ms
    clearTimeout(happyTimeout);
    happyTimeout = setTimeout(() => {
        isHappy = false;
        popupVisible = false;
    }, 300);
}

function makeAquaSad() {
    if (isSad) return;
    isSad = true;
    popupVisible = true;
    faqAudio.currentTime = 0;
    faqAudio.play();

    clearTimeout(sadTimeout);
    sadTimeout = setTimeout(() => {
        isSad = false;
        popupVisible = false;
    }, 300);
}

// Update & draw all tamagos
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    tamagoCoordinates.forEach(t => {
        t.y += t.dy;
        drawObject(t);
    });
    drawPaddle();

    // Move paddle
    if (moveLeft && paddleX > 0) paddleX -= paddleSpeed;
    if (moveRight && paddleX < canvas.width - PADDLE_SIZE) paddleX += paddleSpeed;

    // Optional: remove tamags that fall out of view
    let hitPaddle;
    let hitObject;

    // Find first colliding object (do not overwrite later)
    let hitObjectData = tamagoCoordinates.find(t => {
        return (
            t.y + OBJECT_SIZE >= paddleY && // bottom passes paddle top
            t.y <= paddleY + PADDLE_SIZE && // top above paddle bottom
            t.x < paddleX + PADDLE_SIZE &&  // left overlaps
            t.x + OBJECT_SIZE > paddleX &&   // right overlaps
            t.y < canvas.height - OBJECT_SIZE / 2 // not out of screen
        );
    });


    let hitObjectType = hitObjectData ? hitObjectData.type : null;

    // Remove collided or out-of-screen objects
    tamagoCoordinates = tamagoCoordinates.filter(t => {
        let isCollision =
            t.y + OBJECT_SIZE >= paddleY &&
            t.y <= paddleY + PADDLE_SIZE &&
            t.x < paddleX + PADDLE_SIZE &&
            t.x + OBJECT_SIZE > paddleX;

        return !isCollision && t.y < canvas.height - OBJECT_SIZE / 2;
    });

    // Trigger events based on hit type
    if (hitObjectType === objectType.TAMAGO || hitObjectType === objectType.CAT) {
        makeAquaHappy();
        goodCount++;
        popupColor = 'green';

        if (hitObjectType === objectType.CAT) {
            score += 5;
            popupText = `+5pt`;
        } else {
            score += 2;
            popupText = `+2pt`;
        }

    } else if (hitObjectType === objectType.ONION || hitObjectType === objectType.JOB) {
        makeAquaSad();
        badCount++;
        popupColor = 'red';

        if (hitObjectType === objectType.JOB) {
            score -= 5;
            popupText = `-5pt`;
        } else {
            score -= 2;
            popupText = `-2pt`;
        }
    }

    // check first is the game is over
    if (score < 0) {
        gameOver = true;
        clearAllIntervals();
        endGame(score, goodCount, badCount);

    } else {

        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(`Time: ${timeLeft}s`, 10, 80);
        ctx.fillText(`Score: ${score}pt`, 10, 60);

        if (popupVisible) {
            ctx.font = "16px Arial";
            ctx.fillStyle = popupColor;
            ctx.fillText(
                popupText,
                paddleX + PADDLE_SIZE,
                paddleY
            );
        }
    }
}

function initGame() {
    // reset game variables
    goodCount = 0;
    badCount = 0;
    score = 0;
    timeLeft = 60;
    gameOver = false;
    tamagoCoordinates = [];
    paddleX = canvas.width / 2 - PADDLE_SIZE / 2;

    // start object spawn + update loop
    objectLifeCycle = setInterval(create, 600);
    gameLifeCycle = setInterval(update, 10);
    timerInterval = setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            if (timeLeft <= 0) {
                gameOver = true;
                clearAllIntervals();
                endGame(score, goodCount, badCount);
            }
        }
    }, 1000);
}

function restartGame() {
    // start object spawn + update loop
    objectLifeCycle = setInterval(create, 600);
    gameLifeCycle = setInterval(update, 10);
    timerInterval = setInterval(() => {
        if (!gameOver) {
            timeLeft--;
            if (timeLeft <= 0) {
                gameOver = true;
                clearAllIntervals();
                endGame(score, goodCount, badCount);
            }
        }
    }, 1000);
}

function clearAllIntervals() {
    clearInterval(objectLifeCycle);
    clearInterval(gameLifeCycle);
    clearInterval(timerInterval);
}

// Paddle controls
document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") moveLeft = true;
    if (e.key === "ArrowRight") moveRight = true;
});
document.addEventListener("keyup", e => {
    if (e.key === "ArrowLeft") moveLeft = false;
    if (e.key === "ArrowRight") moveRight = false;
});
document.getElementById("pauseBtn").addEventListener("click", e => {
    clearAllIntervals();
    pauseGame();
})
// start the game.
showStartScreen();