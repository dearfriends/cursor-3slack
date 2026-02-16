// Game configuration
const config = {
    canvasWidth: 800,
    canvasHeight: 600,
    playerSpeed: 5,
    bulletSpeed: 7,
    enemySpeed: 2,
    enemySpawnRate: 1000,
    powerUpSpawnRate: 15000
};

// Game state
const game = {
    canvas: null,
    ctx: null,
    running: false,
    score: 0,
    lives: 3,
    level: 1,
    keys: {},
    player: null,
    bullets: [],
    enemies: [],
    particles: [],
    powerUps: [],
    enemySpawnTimer: 0,
    powerUpSpawnTimer: 0,
    lastTime: 0
};

// Player class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = config.playerSpeed;
        this.shootCooldown = 0;
        this.powerUpActive = false;
        this.powerUpTimer = 0;
    }

    update() {
        // Movement
        if (game.keys['ArrowLeft'] && this.x > 0) {
            this.x -= this.speed;
        }
        if (game.keys['ArrowRight'] && this.x < config.canvasWidth - this.width) {
            this.x += this.speed;
        }

        // Shooting
        if (game.keys[' '] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = this.powerUpActive ? 10 : 20;
        }

        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }

        // Power-up timer
        if (this.powerUpActive) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                this.powerUpActive = false;
            }
        }
    }

    shoot() {
        if (this.powerUpActive) {
            // Triple shot
            game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 0));
            game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, -2));
            game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 2));
        } else {
            // Single shot
            game.bullets.push(new Bullet(this.x + this.width / 2 - 2, this.y, 0));
        }
    }

    draw(ctx) {
        // Draw spaceship
        ctx.save();
        
        // Ship body
        ctx.fillStyle = this.powerUpActive ? '#FFD700' : '#00FFFF';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        // Ship outline
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Cockpit
        ctx.fillStyle = '#FF00FF';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 15, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Bullet class
class Bullet {
    constructor(x, y, offsetX = 0) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 12;
        this.speed = config.bulletSpeed;
        this.offsetX = offsetX;
    }

    update() {
        this.y -= this.speed;
        this.x += this.offsetX;
    }

    draw(ctx) {
        ctx.fillStyle = '#FFFF00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFFF00';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.y < -this.height;
    }
}

// Enemy class
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.speed = config.enemySpeed + (game.level - 1) * 0.5;
        this.health = 1;
        this.type = Math.random() > 0.8 ? 'strong' : 'normal';
        
        if (this.type === 'strong') {
            this.health = 3;
            this.width = 45;
            this.height = 45;
        }
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        
        // Enemy body
        ctx.fillStyle = this.type === 'strong' ? '#FF0000' : '#00FF00';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.width / 2, this.y + 10);
        ctx.lineTo(this.x + this.width, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Enemy outline
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Enemy eyes
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 3, this.y + 10, 3, 0, Math.PI * 2);
        ctx.arc(this.x + (this.width * 2) / 3, this.y + 10, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isOffScreen() {
        return this.y > config.canvasHeight;
    }
}

// Particle class for explosions
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        this.size = Math.random() * 4 + 2;
        this.color = color;
        this.life = 30;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.size *= 0.95;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life / 30;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    isDead() {
        return this.life <= 0;
    }
}

// PowerUp class
class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25;
        this.height = 25;
        this.speed = 2;
    }

    update() {
        this.y += this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = '#FFD700';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#FFD700';
        
        // Star shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = this.x + this.width / 2 + Math.cos(angle) * this.width / 2;
            const y = this.y + this.height / 2 + Math.sin(angle) * this.height / 2;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    isOffScreen() {
        return this.y > config.canvasHeight;
    }
}

// Initialize game
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.canvas.width = config.canvasWidth;
    game.canvas.height = config.canvasHeight;

    // Event listeners
    document.addEventListener('keydown', (e) => {
        game.keys[e.key] = true;
        if (e.key === ' ') {
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        game.keys[e.key] = false;
    });

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
}

// Start game
function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    game.running = true;
    game.player = new Player(config.canvasWidth / 2 - 20, config.canvasHeight - 60);
    game.lastTime = Date.now();
    gameLoop();
}

// Restart game
function restartGame() {
    game.score = 0;
    game.lives = 3;
    game.level = 1;
    game.bullets = [];
    game.enemies = [];
    game.particles = [];
    game.powerUps = [];
    game.enemySpawnTimer = 0;
    game.powerUpSpawnTimer = 0;
    
    updateUI();
    document.getElementById('gameOverScreen').classList.add('hidden');
    startGame();
}

// Game loop
function gameLoop() {
    if (!game.running) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - game.lastTime;
    game.lastTime = currentTime;

    update(deltaTime);
    draw();

    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Update player
    game.player.update();

    // Update bullets
    game.bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.isOffScreen()) {
            game.bullets.splice(index, 1);
        }
    });

    // Spawn enemies
    game.enemySpawnTimer += deltaTime;
    const spawnRate = Math.max(500, config.enemySpawnRate - (game.level - 1) * 100);
    if (game.enemySpawnTimer > spawnRate) {
        spawnEnemy();
        game.enemySpawnTimer = 0;
    }

    // Update enemies
    game.enemies.forEach((enemy, index) => {
        enemy.update();
        
        // Check collision with player
        if (checkCollision(game.player, enemy)) {
            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#FF0000');
            game.enemies.splice(index, 1);
            game.lives--;
            updateUI();
            
            if (game.lives <= 0) {
                gameOver();
            }
        }
        
        if (enemy.isOffScreen()) {
            game.enemies.splice(index, 1);
        }
    });

    // Check bullet-enemy collisions
    game.bullets.forEach((bullet, bulletIndex) => {
        game.enemies.forEach((enemy, enemyIndex) => {
            if (checkCollision(bullet, enemy)) {
                enemy.health--;
                game.bullets.splice(bulletIndex, 1);
                
                if (enemy.health <= 0) {
                    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#00FF00');
                    game.enemies.splice(enemyIndex, 1);
                    game.score += enemy.type === 'strong' ? 30 : 10;
                    updateUI();
                    
                    // Level up every 200 points
                    if (game.score % 200 === 0 && game.score > 0) {
                        game.level++;
                        updateUI();
                    }
                }
            }
        });
    });

    // Spawn power-ups
    game.powerUpSpawnTimer += deltaTime;
    if (game.powerUpSpawnTimer > config.powerUpSpawnRate) {
        spawnPowerUp();
        game.powerUpSpawnTimer = 0;
    }

    // Update power-ups
    game.powerUps.forEach((powerUp, index) => {
        powerUp.update();
        
        if (checkCollision(game.player, powerUp)) {
            game.player.powerUpActive = true;
            game.player.powerUpTimer = 300; // 5 seconds at 60 FPS
            game.powerUps.splice(index, 1);
        }
        
        if (powerUp.isOffScreen()) {
            game.powerUps.splice(index, 1);
        }
    });

    // Update particles
    game.particles.forEach((particle, index) => {
        particle.update();
        if (particle.isDead()) {
            game.particles.splice(index, 1);
        }
    });
}

// Draw game
function draw() {
    const ctx = game.ctx;
    
    // Clear canvas with space background
    ctx.fillStyle = '#000033';
    ctx.fillRect(0, 0, config.canvasWidth, config.canvasHeight);
    
    // Draw stars
    drawStars(ctx);
    
    // Draw game objects
    game.player.draw(ctx);
    game.bullets.forEach(bullet => bullet.draw(ctx));
    game.enemies.forEach(enemy => enemy.draw(ctx));
    game.powerUps.forEach(powerUp => powerUp.draw(ctx));
    game.particles.forEach(particle => particle.draw(ctx));
}

// Draw star field background
function drawStars(ctx) {
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < 100; i++) {
        const x = (i * 137.5) % config.canvasWidth;
        const y = (i * 197.3) % config.canvasHeight;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.fillRect(x, y, size, size);
    }
}

// Spawn enemy
function spawnEnemy() {
    const x = Math.random() * (config.canvasWidth - 40);
    game.enemies.push(new Enemy(x, -40));
}

// Spawn power-up
function spawnPowerUp() {
    const x = Math.random() * (config.canvasWidth - 25);
    game.powerUps.push(new PowerUp(x, -25));
}

// Create explosion effect
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        game.particles.push(new Particle(x, y, color));
    }
}

// Check collision between two objects
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Update UI
function updateUI() {
    document.getElementById('score').textContent = game.score;
    document.getElementById('lives').textContent = game.lives;
    document.getElementById('level').textContent = game.level;
}

// Game over
function gameOver() {
    game.running = false;
    document.getElementById('finalScore').textContent = game.score;
    document.getElementById('finalLevel').textContent = game.level;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// Start the game when page loads
window.addEventListener('load', init);
