const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Oyun sabitleri
const GRID_WIDTH = 15;
const GRID_HEIGHT = 10;
const BLOCK_SIZE = 50;
const WIDTH = (GRID_WIDTH + 2) * BLOCK_SIZE;
const HEIGHT = (GRID_HEIGHT + 2) * BLOCK_SIZE;
const GAME_SPEED = 200; // Milisaniye cinsinden oyun hızı (daha yüksek değer = daha yavaş oyun)

// Oyun değişkenleri
let snake, food, score, direction, bomb, bombSpawnTime, gameState;
let gameLoop;

// Renkler
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const ORANGE = '#FFA500';
const GOLD = '#FFD700';

// Bitcoin resmi
const bitcoinImage = new Image();
bitcoinImage.src = 'bitcoin.png';

// Bomba resmi
const bombImage = new Image();
bombImage.src = 'bomb.png';

// Resimlerin yüklenmesini bekle
let bitcoinImageLoaded = false;
let bombImageLoaded = false;

bitcoinImage.onload = function() {
    bitcoinImageLoaded = true;
    console.log('Bitcoin resmi yüklendi');
};

bombImage.onload = function() {
    bombImageLoaded = true;
    console.log('Bomba resmi yüklendi');
};

// Oyunu başlat
function initGame() {
    console.log('initGame çağrıldı');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    const startX = Math.floor(GRID_WIDTH / 2) + 1;
    const startY = Math.floor(GRID_HEIGHT / 2) + 1;
    snake = [{x: startX * BLOCK_SIZE, y: startY * BLOCK_SIZE}];
    
    direction = {x: BLOCK_SIZE, y: 0};  // Başlangıçta sağa hareket et
    score = 0;
    food = newFood();
    bomb = null;
    bombSpawnTime = 0;
    gameState = 'playing';  // Burayı 'playing' olarak değiştirdik
    console.log('Oyun durumu:', gameState);
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
function startGameLoop() {
    console.log('startGameLoop çağrıldı');
    clearInterval(gameLoop);  // Önceki döngüyü temizle
    gameLoop = setInterval(() => {
        if (gameState === 'playing') {
            update();
        }
        draw();
    }, GAME_SPEED);
}

// Güncelleme
function update() {
    console.log('update çağrıldı');
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Çarpışma kontrolü
    if (head.x < BLOCK_SIZE || head.x >= WIDTH - BLOCK_SIZE || 
        head.y < BLOCK_SIZE || head.y >= HEIGHT - BLOCK_SIZE ||
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
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
            gameOver();
            return;
        }
        if (Date.now() - bombSpawnTime > 3000) {
            bomb = null;
        }
    }
}

// Oyun Sonu
function gameOver() {
    console.log('gameOver çağrıldı');
    gameState = 'end';
    clearInterval(gameLoop);
}

// Çizim
function draw() {
    ctx.fillStyle = BLACK;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameState === 'start') {
        // Başlangıç ekranı
        ctx.fillStyle = WHITE;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Bitcoin Yılanı', WIDTH / 2, HEIGHT / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText('Oyuna başlamak için ENTER tuşuna basın', WIDTH / 2, HEIGHT / 2 + 50);
        return;
    }

    if (gameState === 'end') {
        // Oyun sonu ekranı
        ctx.fillStyle = WHITE;
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Oyun Bitti', WIDTH / 2, HEIGHT / 2 - 50);
        ctx.font = '20px Arial';
        ctx.fillText(`Skorunuz: ${score}`, WIDTH / 2, HEIGHT / 2);
        ctx.fillText('Tekrar oynamak için ENTER tuşuna basın', WIDTH / 2, HEIGHT / 2 + 50);
        return;
    }

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
    snake.forEach((segment, index) => {
        if (index === 0 && bitcoinImageLoaded) {
            // Yılanın başına Bitcoin resmi çiz
            ctx.drawImage(bitcoinImage, segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
        } else {
            ctx.fillRect(segment.x, segment.y, BLOCK_SIZE, BLOCK_SIZE);
        }
    });

    // Yemi çiz
    ctx.fillStyle = WHITE;
    ctx.fillRect(food.x, food.y, BLOCK_SIZE, BLOCK_SIZE);

    // Bombayı çiz
    if (bomb && bombImageLoaded) {
        ctx.drawImage(bombImage, bomb.x, bomb.y, BLOCK_SIZE, BLOCK_SIZE);
    }

    // Skoru çiz
    ctx.fillStyle = WHITE;
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Skor: ${score}`, 10, 30);
}

// Klavye kontrolü
document.addEventListener('keydown', (e) => {
    console.log('Tuşa basıldı:', e.key);
    console.log('Mevcut oyun durumu:', gameState);

    if ((gameState === 'start' || gameState === 'end') && e.key === 'Enter') {
        console.log('ENTER tuşuna basıldı, oyun başlatılıyor');
        initGame();
        startGameLoop();
        return;
    }

    if (gameState !== 'playing') return;

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
console.log('Oyun başlatılıyor');
initGame();
gameState = 'start';  // Başlangıç ekranını göstermek için
draw();  // İlk ekranı çiz
