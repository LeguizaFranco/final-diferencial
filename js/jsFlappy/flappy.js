// --- CONFIGURACIÓN DEL JUEGO ---
const config = {
    gravity: 0.25,
    jumpStrength: -6.5,
    speed: 3,
    spawnRate: 180,
    gapSize: 160
};

// --- ESTADO DEL JUEGO ---
let state = {
    isPlaying: false,
    isGameOver: false,
    score: 0,
    lives: 3,
    frames: 0,
    gameSpeed: config.speed,
    // Efectos activos
    effects: {
        invincible: 0, // contador de frames
        tiny: 0
    }
};

// --- ENTIDADES ---
const bird = {
    el: document.getElementById('bird'),
    y: 200,
    x: 50, // Posición fija X en pantalla
    velocity: 0,
    width: 34,
    height: 24,
    rotation: 0,
    scale: 1 // Escala visual/física
};

// Arrays para objetos
let obstacles = []; // Tuberías
let items = []; // Monedas, Corazones, Powerups
let clouds = []; // Nubes decorativas
let bgOffsets = [0, 0, 0, 0];

// Elementos DOM
const container = document.getElementById('game-container');
const objectsContainer = document.getElementById('objects-container');
const cloudLayer = document.getElementById('bg-layer-1');
const scoreEl = document.getElementById('score-display');
const livesEl = document.getElementById('lives-display');
const statusEl = document.getElementById('status-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');

// Referencias a capas de fondo para parallax
const layers = [
    document.getElementById('bg-layer-1'),
    document.getElementById('bg-layer-2'),
    document.getElementById('bg-layer-3'),
    document.getElementById('bg-layer-4')
];

// --- BUCLE DE JUEGO (GAME LOOP) ---
function loop() {
    if (state.isPlaying && !state.isGameOver) {
        update();
        draw();
        requestAnimationFrame(loop);
    }
}

// --- INPUT ---
function jump() {
    if (!state.isPlaying && !state.isGameOver) return;

    bird.velocity = config.jumpStrength;

    // Animación de aleteo
    bird.el.classList.remove('flapping');
    void bird.el.offsetWidth;
    bird.el.classList.add('flapping');
}

// Event Listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
});

container.addEventListener('pointerdown', (e) => {
    if (e.target.tagName !== 'BUTTON') {
        jump();
    }
});

// --- LÓGICA DE ACTUALIZACIÓN ---
function update() {
    state.frames++;

    // Actualizar efectos temporales
    updateEffects();

    // 1. Física del Pájaro
    bird.velocity += config.gravity;
    bird.y += bird.velocity;

    bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (bird.velocity * 0.1)));

    // Límites suelo/techo
    const groundLevel = container.clientHeight * 0.85;

    // Colisión suelo (hitbox ajustado por escala)
    const currentHeight = bird.height * bird.scale;

    if (bird.y + currentHeight >= groundLevel) {
        hitObstacle(true);
    }
    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    // 2. Parallax Scrolling
    // Capa 1: Nubes (Manejada por objetos DOM)
    updateClouds();

    // Capa 2: Montañas (Medio)
    bgOffsets[1] -= state.gameSpeed * 0.3;
    // Capa 4: Suelo (Igual que objetos)
    bgOffsets[3] -= state.gameSpeed;

    layers[1].style.backgroundPositionX = bgOffsets[1] + 'px';
    layers[3].style.backgroundPositionX = bgOffsets[3] + 'px';

    // 3. Generación de Obstáculos
    if (state.frames % config.spawnRate === 0) {
        spawnPipe();
    }

    // 4. Generación de Items
    if (state.frames % (Math.floor(config.spawnRate / 1.5)) === 0) {
        spawnItem();
    }

    // 5. Mover Entidades
    moveEntities();

    // 6. Colisiones
    checkCollisions();
}

function updateClouds() {
    clouds.forEach(cloud => {
        // Se mueven muy lento
        cloud.x -= state.gameSpeed * 0.1;

        // Si salen de pantalla, reaparecen a la derecha
        if (cloud.x + cloud.width < -100) {
            cloud.x = container.clientWidth + Math.random() * 100;
            cloud.y = Math.random() * (container.clientHeight / 2); // Altura aleatoria
        }

        cloud.el.style.left = cloud.x + 'px';
    });
}

function updateEffects() {
    let statusText = [];

    // Efecto Invencible
    if (state.effects.invincible > 0) {
        state.effects.invincible--;
        if (state.effects.invincible === 0) {
            bird.el.classList.remove('invincible');
        }
        statusText.push("⭐ INVENCIBLE");
    }

    // Efecto Miniatura
    if (state.effects.tiny > 0) {
        state.effects.tiny--;
        if (state.effects.tiny === 0) {
            bird.scale = 1;
            bird.el.classList.remove('tiny');
        }
        statusText.push("🍄 MINI");
    }

    // Actualizar UI
    if (statusText.length > 0) {
        statusEl.innerText = statusText.join(' | ');
        statusEl.style.display = 'block';
    } else {
        statusEl.style.display = 'none';
    }
}

function moveEntities() {
    // Tuberías
    obstacles.forEach((obs, index) => {
        obs.x -= state.gameSpeed;
        if (obs.x + obs.width < -100) {
            obs.el.remove();
            obstacles.splice(index, 1);
        }
    });

    // Items
    items.forEach((item, index) => {
        item.x -= state.gameSpeed;
        if (item.x + item.width < -50) {
            item.el.remove();
            items.splice(index, 1);
        }
    });
}

// --- DIBUJADO ---
function draw() {
    // Aplicar transformaciones combinadas (Posición + Rotación + Escala)
    bird.el.style.transform = `translate(${bird.x}px, ${bird.y}px) rotate(${bird.rotation}rad) scale(${bird.scale})`;

    obstacles.forEach(obs => {
        obs.el.style.left = obs.x + 'px';
        obs.el.style.top = obs.y + 'px';
        obs.el.style.height = obs.height + 'px';
    });

    items.forEach(item => {
        item.el.style.left = item.x + 'px';
        item.el.style.top = item.y + 'px';
    });

    scoreEl.innerText = `Puntos: ${state.score}`;
    livesEl.innerText = `Vidas: ${state.lives}`;
}

// --- GENERADORES ---
function initClouds() {
    cloudLayer.innerHTML = '';
    clouds = [];
    // Crear 4 nubes iniciales
    for (let i = 0; i < 4; i++) {
        const width = 80 + Math.random() * 60;
        const height = 40 + Math.random() * 20;
        const x = Math.random() * container.clientWidth;
        const y = Math.random() * (container.clientHeight / 2); // Solo parte superior

        const el = document.createElement('div');
        el.className = 'cloud-shape';
        el.style.width = width + 'px';
        el.style.height = height + 'px';
        el.style.left = x + 'px';
        el.style.top = y + 'px';

        cloudLayer.appendChild(el);
        clouds.push({ el, x, y, width, height });
    }
}

function spawnPipe() {
    const gameHeight = container.clientHeight;
    const groundHeight = gameHeight * 0.15;
    const playableHeight = gameHeight - groundHeight;

    const minPipeHeight = 50;
    const maxPos = playableHeight - minPipeHeight - config.gapSize;
    const gapY = Math.floor(Math.random() * (maxPos - minPipeHeight)) + minPipeHeight;

    const topPipe = createEntity('obstacle pipe-top', container.clientWidth, 0, 60, gapY);
    const bottomHeight = playableHeight - gapY - config.gapSize;
    const bottomPipe = createEntity('obstacle pipe-bottom', container.clientWidth, gapY + config.gapSize, 60, bottomHeight);

    obstacles.push(topPipe, bottomPipe);
    objectsContainer.appendChild(topPipe.el);
    objectsContainer.appendChild(bottomPipe.el);
}

function spawnItem() {
    // Probabilidades: 60% Moneda, 10% Vida, 15% Estrella, 15% Hongo
    const typeRoll = Math.random();
    let type = 'coin';
    let className = 'coin';

    if (typeRoll > 0.90) { type = 'heart'; className = 'heart'; }
    else if (typeRoll > 0.75) { type = 'star'; className = 'star'; }
    else if (typeRoll > 0.60) { type = 'mushroom'; className = 'mushroom'; }

    const w = 30, h = 30;
    const gameHeight = container.clientHeight * 0.85;
    const groundLevel = gameHeight;

    // --- Lógica de Anti-Superposición ---
    let validPosition = false;
    let attempts = 0;
    let finalY = 0;
    let spawnX = container.clientWidth;

    while (!validPosition && attempts < 10) {
        let testY = Math.floor(Math.random() * (groundLevel - 100)) + 50;

        let collides = false;
        for (let obs of obstacles) {
            if (obs.x > spawnX - 100) {
                if (rectIntersect(spawnX, testY, w, h, obs.x, obs.y, obs.width, obs.height)) {
                    collides = true;
                    break;
                }
            }
        }

        if (!collides) {
            finalY = testY;
            validPosition = true;
        }
        attempts++;
    }

    if (!validPosition) return;

    const item = createEntity(className, spawnX, finalY, w, h);
    item.type = type;

    items.push(item);
    objectsContainer.appendChild(item.el);
}

function createEntity(className, x, y, w, h) {
    const el = document.createElement('div');
    el.className = className;
    return { el, x, y, width: w, height: h };
}

// --- COLISIONES ---
function checkCollisions() {
    // Hitbox del pájaro ajustado por escala
    const scale = bird.scale;
    const currentW = bird.width * scale;
    const currentH = bird.height * scale;

    // Centrar hitbox visualmente
    const offsetX = (bird.width - currentW) / 2;
    const offsetY = (bird.height - currentH) / 2;

    const bx = bird.x + offsetX + 4;
    const by = bird.y + offsetY + 4;
    const bw = currentW - 8;
    const bh = currentH - 8;

    // Tuberías
    for (let i = 0; i < obstacles.length; i++) {
        const obs = obstacles[i];
        if (rectIntersect(bx, by, bw, bh, obs.x, obs.y, obs.width, obs.height)) {
            // Si es invencible, ignorar colisión con tuberías
            if (state.effects.invincible > 0) {
                
            } else {
                hitObstacle();
                obs.el.remove();
                obstacles.splice(i, 1);
                return;
            }
        }
    }

    // Items
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        // Hitbox item estandar
        if (rectIntersect(bx, by, bw, bh, item.x, item.y, item.width, item.height)) {
            collectItem(item);
            item.el.remove();
            items.splice(i, 1);
            i--;
        }
    }
}

function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
}

// --- EVENTOS DEL JUEGO ---
function hitObstacle(isGround = false) {
    if (isGround) {
        state.lives = 0;
    } else {
        state.lives--;
        container.classList.add('shake');
        setTimeout(() => container.classList.remove('shake'), 500);
        createFloatingText("-1 Vida", bird.x, bird.y, "red");
    }

    if (state.lives <= 0) {
        triggerGameOver();
    }
}

function collectItem(item) {
    if (item.type === 'coin') {
        state.score += 10;
        createFloatingText("+10", item.x, item.y, "gold");
    } else if (item.type === 'heart') {
        state.lives++;
        createFloatingText("+1 Vida", item.x, item.y, "pink");
    } else if (item.type === 'star') {
        activateInvincibility();
        createFloatingText("¡INVENCIBLE!", item.x, item.y, "#f1c40f");
    } else if (item.type === 'mushroom') {
        activateTiny();
        createFloatingText("¡MINI!", item.x, item.y, "#8e44ad");
    }
}

function activateInvincibility() {
    state.effects.invincible = 300; // 5 segundos aprox a 60fps
    bird.el.classList.add('invincible');
}

function activateTiny() {
    state.effects.tiny = 600; // 10 segundos
    bird.scale = 0.5;
    bird.el.classList.add('tiny');
}

function createFloatingText(text, x, y, color) {
    const el = document.createElement('div');
    el.className = 'float-text';
    el.innerText = text;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = color;
    container.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function triggerGameOver() {
    state.isGameOver = true;
    bird.el.classList.add('explosion');
    finalScoreEl.innerText = "Puntaje Final: " + state.score;
    gameOverScreen.classList.remove('hidden');
}

// --- CONTROL DE FLUJO ---
function startGame() {
    resetState();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    state.isPlaying = true;
    state.isGameOver = false;
    loop();
}

function resetGame() {
    startGame();
}

function resetState() {
    state.score = 0;
    state.lives = 3;
    state.frames = 0;
    state.gameSpeed = config.speed;
    state.effects.invincible = 0;
    state.effects.tiny = 0;

    bird.y = 200;
    bird.velocity = 0;
    bird.rotation = 0;
    bird.scale = 1;

    bird.el.classList.remove('explosion');
    bird.el.classList.remove('flapping');
    bird.el.classList.remove('invincible');
    bird.el.classList.remove('tiny');

    statusEl.style.display = 'none';

    // Limpiar DOM
    objectsContainer.innerHTML = '';
    obstacles = [];
    items = [];

    // Reset parallax
    bgOffsets = [0, 0, 0, 0];

    // Iniciar nubes
    initClouds();

    update();
    draw();
}

// Renderizado inicial
draw();
// Inicializar nubes para fondo estético al cargar
initClouds();