const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun sabitleri
const GRID_WIDTH = 15;
const GRID_HEIGHT = 10;
const BLOCK_SIZE = 50;
const WIDTH = (GRID_WIDTH + 2) * BLOCK_SIZE;
const HEIGHT = (GRID_HEIGHT + 2) * BLOCK_SIZE;

// Oyun değişkenleri
let snake, food, score, direction, bomb, bombSpawnTime;

// Renkler
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const ORANGE = '#FFA500';
const GOLD = '#FFD700';

// Oyunu başlat
function initGame() {
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    snake = [{x: BLOCK_SIZE * (Math.floor(GRID_WIDTH / 2) + 1), y: BLOCK_SIZE * (Math.floor(GRID_HEIGHT / 2) + 1)}];
    direction = {x: BLOCK_SIZE, y: 0};
    score = 0;
    food = newFood();
    bomb = null;
    bombSpawnTime = 0;
}

// Yeni yem oluştur
function newFood() {
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_WIDTH) + 1;
        y = Math.floor(Math.random() * GRID_HEIGHT) + 1;
    } while (snake.some(segment => segment.x === x * BLOCK_SIZE && segment.y === y * BLOCK_SIZE));
    return {x: x * BLOCK_SIZE, y: y * BLOCK_SIZE};
}

// Bomba oluştur
function spawnBomb() {
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_WIDTH) + 1;
        y = Math.floor(Math.random() * GRID_HEIGHT) + 1;
    } while (snake.some(segment => segment.x === x * BLOCK_SIZE && segment.y === y * BLOCK_SIZE) || 
             (food.x === x * BLOCK_SIZE && food.y === y * BLOCK_SIZE));
    bomb = {x: x * BLOCK_SIZE, y: y * BLOCK_SIZE};
    bombSpawnTime = Date.now();
}

// Oyun döngüsü
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Güncelleme
function update() {
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Çarpışma kontrolü
    if (head.x < BLOCK_SIZE || head.x >= WIDTH - BLOCK_SIZE || 
        head.y < BLOCK_SIZE || head.y >= HEIGHT - BLOCK_SIZE ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        initGame();
        return;
    }

    snake.unshift(head);

    // Yem yeme kontrolü
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = newFood();
        if (Math.random() < 0.3) {
            spawnBomb();
        }
    } else {
        snake.pop();
    }

    // Bomba kontrolü
    if (bomb) {
        if (head.x === bomb.x && head.y === bomb.y) {
            initGame();
            return;
        }
        if (Date.now() - bombSpawnTime > 3000) {
            bomb = null;
        }
    }
}

// Çizim
function draw() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Oyun alanını çiz
    ctx.fillStyle = '#323232';
    ctx.fillRect(BLOCK_SIZE, BLOCK_SIZE, WIDTH - 2 * BLOCK_SIZE, HEIGHT - 2 * BLOCK_SIZE);

    // Izgarayı çiz
    ctx.strokeStyle = '#1E1E1E';
    for (let x = BLOCK_SIZE; x <= WIDTH - BLOCK_SIZE; x += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, BLOCK_SIZE);
        ctx.lineTo(x, HEIGHT - BLOCK_SIZE);
        ctx.stroke();
    }
    for (let y = BLOCK_SIZE; y <= HEIGHT - BLOCK_SIZE; y += BLOCK_SIZE) {
        ctx.beginPath();
        ctx.moveTo(BLOCK_SIZE, y);
        ctx.lineTo(WIDTH - BLOCK_SIZE, y);
        ctx.stroke();
    }

    // Yılanı çiz
    ctx.fillStyle = ORANGE;
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
    });

    // Yemi çiz
    ctx.fillStyle = WHITE;
    ctx.fillRect(food.x, food.y, BLOCK_SIZE, BLOCK_SIZE);

    // Bombayı çiz
    if (bomb) {
        ctx.fillStyle = 'red';
        ctx.fillRect(bomb.x, bomb.y, BLOCK_SIZE, BLOCK_SIZE);
    }

    // Skoru çiz
    ctx.fillStyle = WHITE;
    ctx.font = '20px Arial';
    ctx.fillText(`Skor: ${score}`, 10, 30);
}

// Klavye kontrolü
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowUp':
            if (direction.y === 0) direction = {x: 0, y: -BLOCK_SIZE};
            break;
        case 'ArrowDown':
            if (direction.y === 0) direction = {x: 0, y: BLOCK_SIZE};
            break;
        case 'ArrowLeft':
            if (direction.x === 0) direction = {x: -BLOCK_SIZE, y: 0};
            break;
        case 'ArrowRight':
            if (direction.x === 0) direction = {x: BLOCK_SIZE, y: 0};
            break;
    }
});

// Oyunu başlat
initGame();
gameLoop();