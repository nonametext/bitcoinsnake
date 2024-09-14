document.addEventListener('DOMContentLoaded', (event) => {
    // Firebase yapılandırması
    const firebaseConfig = {
        apiKey: "AIzaSyCVtKa76gME5yDSkpsqH3Q7biVQ09Rns4o",
        authDomain: "bitcoinsnake-e9261.firebaseapp.com",
        projectId: "bitcoinsnake-e9261",
        storageBucket: "bitcoinsnake-e9261.appspot.com",
        messagingSenderId: "430431644825",
        appId: "1:430431644825:web:ab3a6c5cda6b429d4c5c08",
        measurementId: "G-FPGMH5W43H"
    };

    // Firebase'i başlat
    firebase.initializeApp(firebaseConfig);

    // Veritabanı referansını al
    const database = firebase.database();

    // Lider tablosu için değişken
    let leaderboard = [];

    // Firebase'den lider tablosunu yükle
    function loadLeaderboard() {
        database.ref('leaderboard').orderByChild('score').limitToLast(5).once('value', (snapshot) => {
            leaderboard = [];
            snapshot.forEach((childSnapshot) => {
                leaderboard.unshift(childSnapshot.val());
            });
            draw(); // Lider tablosunu güncelledikten sonra ekranı yeniden çiz
        });
    }

    // Yeni skoru lider tablosuna ekle
    function addToLeaderboard(name, score) {
        database.ref('leaderboard').push({
            name: name,
            score: score
        }).then(() => {
            loadLeaderboard(); // Lider tablosunu yeniden yükle
        });
    }

    // Oyunu başlat
    function initGame() {
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
        gameState = 'playing';
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
        gameState = 'nameInput';
        clearInterval(gameLoop);
    }

    // İsim girişi al
    function getPlayerName() {
        const name = prompt("Tebrikler! Lider tablosuna girecek bir skor yaptınız. İsminizi girin:");
        if (name) {
            addToLeaderboard(name, score);
        }
        gameState = 'end';
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

        if (gameState === 'nameInput' || gameState === 'end') {
            // Oyun sonu ekranı
            ctx.fillStyle = WHITE;
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Oyun Bitti', WIDTH / 2, HEIGHT / 2 - 100);
            ctx.font = '20px Arial';
            ctx.fillText(`Skorunuz: ${score}`, WIDTH / 2, HEIGHT / 2 - 50);

            // Lider tablosunu göster
            ctx.fillText('Lider Tablosu', WIDTH / 2, HEIGHT / 2);
            leaderboard.forEach((entry, index) => {
                ctx.fillText(`${index + 1}. ${entry.name}: ${entry.score}`, WIDTH / 2, HEIGHT / 2 + 30 + index * 30);
            });

            ctx.fillText('Tekrar oynamak için ENTER tuşuna basın', WIDTH / 2, HEIGHT - 50);
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
        if (gameState === 'start' && e.key === 'Enter') {
            gameState = 'playing';
            initGame();
            startGameLoop();
            return;
        }

        if (gameState === 'nameInput' && e.key === 'Enter') {
            getPlayerName();
            return;
        }

        if (gameState === 'end' && e.key === 'Enter') {
            gameState = 'playing';
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
    loadLeaderboard();
    initGame();
    gameState = 'start';
    draw();
});