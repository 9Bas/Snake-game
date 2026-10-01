const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    tileCount = Math.floor(canvas.width / 30); // คำนวณจำนวน tile โดยใช้ width
    tileSize = (canvas.width / tileCount) - 0; // คำนวณขนาด tile โดยใช้ width
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
class SnakePart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let speed = 7;

let headX = 10;
let headY = 10;
const snakeParts = [];
let tailLength = 2;

let appleX = Math.floor(Math.random() * tileCount);
let appleY = Math.floor(Math.random() * tileCount);

let inputsXVelocity = 0;
let inputsYVelocity = 0;

let xVelocity = 0;
let yVelocity = 0;

let score = 0;

const gulpSound = new Audio("gulp.mp3");

// Game loop
function drawGame() {
    xVelocity = inputsXVelocity;
    yVelocity = inputsYVelocity;

    changeSnakePosition();
    let result = isGameOver();
    if (result) {
        return;
    }

    clearScreen();

    checkAppleCollision();
    drawApple();
    drawSnake();

    drawScore();

    if (score > 10) {
        speed = 9;
    }
    if (score > 20) {
        speed = 11;
    }

    setTimeout(drawGame, 1000 / speed);
}

function isGameOver() {
    let gameOver = false;

    if (yVelocity === 0 && xVelocity === 0) {
        return false;
    }

    // walls (Game over if snake hits the wall)
    if (headX < 0 || headX >= tileCount || headY < 0 || headY >= tileCount) {
        gameOver = true;
    }

    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];
        if (part.x === headX && part.y === headY) {
            gameOver = true;
            break;
        }
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "70px 'Press Start 2P'";

        // Set the gradient
        var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(1.0, "black");
        ctx.fillStyle = gradient;

        // Calculate the text width and height for centering
        const text = "Game Over";
        const textWidth = ctx.measureText(text).width;
        const textHeight = 30;

        // Draw the text in the center of the canvas
        ctx.fillText(text, (canvas.width - textWidth) / 2, (canvas.height + textHeight / 2) / 2);

        // Draw the score text below the Game Over text
        ctx.font = "35px 'Press Start 2P'"; // Font size for score
        const scoreText = "Your Score:" + score;
        const scoreWidth = ctx.measureText(scoreText).width;

        // Draw the score text
        ctx.fillText(scoreText, (canvas.width - scoreWidth) / 2, (canvas.height + textHeight / 2) / 2 + 45);
    }

    return gameOver;
}

// เพิ่มโค้ดนี้เพื่อฟังการกดปุ่ม Spacebar
window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && isGameOver()) {
        // รีเฟรชหน้าเบราเซอร์เมื่อกด Spacebar
        location.reload();
    }
});

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillText("Score: " + score, canvas.width - 1520, 30);
}

function clearScreen() {
    ctx.fillStyle = "#DAF7A6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// อาร์เรย์สำหรับเก็บสีของงู
const snakeColors = ["white", "gray", "green", "blue", "purple", "yellow", "pink", "red"];
let currentColorIndex = 0; // ดัชนีของสีปัจจุบัน

function drawSnake() {
    // วาดลำตัวงู
    for (let i = 0; i < snakeParts.length; i++) {
        let part = snakeParts[i];

        // กำหนดสีลายของบล็อก
        ctx.fillStyle = snakeColors[(currentColorIndex + i) % snakeColors.length]; // สลับสีตามตำแหน่งของบล็อก

        ctx.fillRect(part.x * tileSize, part.y * tileSize, tileSize, tileSize);
    }

    // วาดหัวงู
    ctx.fillStyle = "white"; // สีของหัวงู
    ctx.fillRect(headX * tileSize, headY * tileSize, tileSize, tileSize);

    // วาดลูกตาข้างเดียวที่หัวงู
    ctx.fillStyle = "black"; // สีของลูกตา
    const eyeRadius = tileSize * 0.2; // ขนาดของลูกตา (20% ของขนาดบล็อก)
    let eyeX = headX * tileSize + tileSize * 0.7; // ตำแหน่งลูกตาแนวนอน
    let eyeY = headY * tileSize + tileSize * 0.3; // ตำแหน่งลูกตาแนวตั้ง

    // วาดวงกลมสำหรับลูกตา
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, eyeRadius, 0, Math.PI * 2); // วาดลูกตาข้างเดียวที่หัวงู
    ctx.fill();

    // เพิ่มส่วนของงู
    snakeParts.push(new SnakePart(headX, headY));

    // เปลี่ยนสีปัจจุบันหลังจากงูกินแอปเปิ้ล
    currentColorIndex = (currentColorIndex + 1) % snakeColors.length;

    // ลบส่วนท้ายของงูเมื่อมีความยาวเกิน
    while (snakeParts.length > tailLength) {
        snakeParts.shift(); 
    }
}

function checkAppleCollision() {
    if (appleX === headX && appleY === headY) {
        appleX = Math.floor(Math.random() * 10);
        appleY = Math.floor(Math.random() * 20);
        tailLength++;
        score++;
        gulpSound.play();

        // เปลี่ยนสีลำตัวงูเมื่อกินแอปเปิ้ล
        currentColorIndex = (currentColorIndex + 1) % snakeColors.length; // สลับสีไปเรื่อยๆ
    }
}



function changeSnakePosition() {
    headX += xVelocity;
    headY += yVelocity;

    // Keep Snake within canvas bounds (tunneling effect)
   /* if (headX < 0) {
        headX = tileCount - 1; // Wrap around to the right
    } else if (headX >= tileCount) {
        headX = 0; // Wrap around to the left
    }

    if (headY < 0) {
        headY = tileCount - 1; // Wrap around to the bottom
    } else if (headY >= tileCount) {
        headY = 0; // Wrap around to the top
    }*/
}

let appleCount = 5; // จำนวนแอปเปิ้ลทั้งหมด (รวมถึงแอปเปิ้ลเดิม 1 ลูก)
let apples = []; // อาร์เรย์สำหรับเก็บตำแหน่งของแอปเปิ้ล

// สุ่มตำแหน่งของแอปเปิ้ลทั้งหมดเมื่อเริ่มเกม
function spawnApples() {
    for (let i = 0; i < appleCount; i++) {
        let appleX = Math.floor(Math.random() * 40);
        let appleY = Math.floor(Math.random() * 20);
        apples.push({ x: appleX, y: appleY });
    }
}

// เรียกฟังก์ชันนี้เพื่อสุ่มแอปเปิ้ลเมื่อเริ่มเกม
spawnApples();

function checkAppleCollision() {
    for (let i = 0; i < apples.length; i++) {
        if (apples[i].x === headX && apples[i].y === headY) {
            // เมื่อเกิดการชนกับแอปเปิ้ล ให้สุ่มตำแหน่งใหม่
            apples[i].x = Math.floor(Math.random() * tileCount);
            apples[i].y = Math.floor(Math.random() * 10);
            tailLength++; // เพิ่มความยาวงู
            score++; // เพิ่มคะแนน
            gulpSound.play();

            // เปลี่ยนสีลำตัวงูเมื่อกินแอปเปิ้ล
            currentColorIndex = (currentColorIndex + 1) % snakeColors.length;
        }
    }
}

function drawApple() {
    for (let i = 0; i < apples.length; i++) {
        const appleXPos = apples[i].x * tileSize; // คำนวณตำแหน่ง X ของแอปเปิ้ล
        const appleYPos = apples[i].y * tileSize; // คำนวณตำแหน่ง Y ของแอปเปิ้ล
        const appleRadius = tileSize / 2; // ขนาดของแอปเปิ้ล (รัศมี)

        // วาดแอปเปิ้ล (วงกลม)
        ctx.fillStyle = "red"; // สีของแอปเปิ้ล
        ctx.beginPath();
        ctx.arc(appleXPos + appleRadius, appleYPos + appleRadius, appleRadius, 0, Math.PI * 2, false);
        ctx.fill();

        // วาดเงาของแอปเปิ้ล
        ctx.fillStyle = "darkred"; // สีเงาของแอปเปิ้ล
        ctx.beginPath();
        ctx.arc(appleXPos + appleRadius, appleYPos + appleRadius, appleRadius * 0.75, 0, Math.PI * 2, false);
        ctx.fill();

        // วาดก้านของแอปเปิ้ล
        ctx.fillStyle = "green"; // สีของก้าน
        ctx.fillRect(appleXPos + appleRadius - 5, appleYPos, 10, 10); // ขนาดและตำแหน่งของก้าน
    }
}


// Start the game
drawGame();