document.addEventListener('DOMContentLoaded', () => {

    // --- ELEMENTOS DEL DOM ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const playBtn = document.getElementById('play-btn');
    const menuScreen = document.getElementById('menu-screen');
    const themeModal = document.getElementById('theme-modal');
    const instructionsModal = document.getElementById('instructions-modal');
    const startGameBtn = document.getElementById('start-game-btn');
    const statusBar = document.getElementById('status-bar');
    const canvasContainer = document.getElementById('canvas-container');
    const hintContainer = document.getElementById('hint-container');
    const hintBtn = document.getElementById('hint-btn');
    const menuBtn = document.getElementById('menu-btn');
    const levelDisplay = document.getElementById('level-display');
    const timeDisplay = document.getElementById('time-display');
    const resultModal = document.getElementById('result-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalButtons = document.getElementById('modal-buttons');
    const previewModal = document.getElementById('preview-modal');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    const previewMessage = document.getElementById('preview-message');
    const previewLevel = document.getElementById('preview-level');

    // --- VARIABLES DE ESTADO ---
    let currentLevel = 0;
    let totalTime = 0;
    let startTime = 0;
    let timerInterval = null;
    let pieces = [];
    let imageToLoad = new Image();
    imageToLoad.crossOrigin = 'Anonymous';
    let selectedImageIndex = -1;
    let selectedTheme = 'animals'; // Temática seleccionada

    // --- SISTEMA DE SONIDOS ---
    const SOUNDS = {
        rotate: new Audio('../sounds/rotate.mp3'),
        correct: new Audio('../sounds/correct.mp3'),
        levelComplete: new Audio('../sounds/level-complete.mp3'),
        hint: new Audio('../sounds/hint.mp3'),
        click: new Audio('../sounds/click.mp3')
    };

    // Configurar volúmenes
    SOUNDS.rotate.volume = 0.2;
    SOUNDS.correct.volume = 0.5;
    SOUNDS.levelComplete.volume = 0.7;
    SOUNDS.hint.volume = 0.5;
    SOUNDS.click.volume = 0.4;

    // Función helper para reproducir sonidos
    function playSound(soundName) {
        if (SOUNDS[soundName]) {
            SOUNDS[soundName].currentTime = 0;
            SOUNDS[soundName].play().catch(e => console.log('Audio play prevented:', e));
        }
    }

    // --- CONFIGURACIÓN DE NIVELES ---
    const LEVELS = [
        { id: 1, filter: 'none' },
        { id: 2, filter: 'none' },
        { id: 3, filter: 'none' },
        { id: 4, filter: 'grayscale' },
        { id: 5, filter: 'brightness' },
        { id: 6, filter: 'negative' }
    ];

    // Banco de imágenes por temática
    const THEMES = {
        animals: [
            '../img/ciervos.jpg',
            '../img/elefante.jpg',
            '../img/zuricata.jpg',
            '../img/tigre.jpg',
            '../img/monkey.jpg',
            '../img/monkey2.jpg',
            '../img/abeja.jpg',
            '../img/horses.jpg',
            '../img/iguana.jpg'
        ],
        cars: [
            'https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/337909/pexels-photo-337909.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1149137/pexels-photo-1149137.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/193999/pexels-photo-193999.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/707046/pexels-photo-707046.jpeg?auto=compress&cs=tinysrgb&w=800',
            'https://images.pexels.com/photos/1035108/pexels-photo-1035108.jpeg?auto=compress&cs=tinysrgb&w=800'
        ],
        games: [
            '../img/blocka/mario.jpg',
            '../img/blocka/creed.jpg',
            '../img/blocka/duty.jpg',
            '../img/blocka/kratos.jpg',
            '../img/blocka/sonic.jpg',
            '../img/blocka/spiderman.jpg',
            '../img/blocka/wicher.jpg',
            '../img/blocka/hitman.jpg',
            '../img/blocka/riader.jpg',
        ]
    };

    // --- FUNCIONES DE UTILIDAD ---
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function updateTimer() {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        timeDisplay.textContent = formatTime(elapsed);
    }

    function startTimer() {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 1000);
        updateTimer();
    }

    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            const levelTime = Math.floor((Date.now() - startTime) / 1000);
            totalTime += levelTime;
        }
    }

    // --- FILTROS DE IMAGEN ---
    function applyFilter(imageData, filterType) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            switch (filterType) {
                case 'grayscale':
                    const avg = (r + g + b) / 3;
                    data[i] = data[i + 1] = data[i + 2] = avg;
                    break;
                case 'brightness':
                    const factor = 0.3;
                    data[i] = r * factor;
                    data[i + 1] = g * factor;
                    data[i + 2] = b * factor;
                    break;
                case 'negative':
                    data[i] = 255 - r;
                    data[i + 1] = 255 - g;
                    data[i + 2] = 255 - b;
                    break;
            }
        }
        return imageData;
    }

    // --- LÓGICA DEL JUEGO ---
    function initPieces(filter) {
        pieces = [];
        const pieceWidth = imageToLoad.width / 2;
        const pieceHeight = imageToLoad.height / 2;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageToLoad.width;
        tempCanvas.height = imageToLoad.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(imageToLoad, 0, 0);

        if (filter !== 'none') {
            let imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            imageData = applyFilter(imageData, filter);
            tempCtx.putImageData(imageData, 0, 0);
        }

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const x = col * pieceWidth;
                const y = row * pieceHeight;

                const pieceCanvas = document.createElement('canvas');
                pieceCanvas.width = pieceWidth;
                pieceCanvas.height = pieceHeight;
                const pieceCtx = pieceCanvas.getContext('2d');
                pieceCtx.drawImage(tempCanvas, x, y, pieceWidth, pieceHeight, 0, 0, pieceWidth, pieceHeight);

                let rotation = Math.floor(Math.random() * 4);

                pieces.push({
                    col: col,
                    row: row,
                    rotation: rotation,
                    isFixed: false,
                    image: pieceCanvas
                });
            }
        }

        let rotatedCount = pieces.filter(p => p.rotation !== 0).length;
        if (rotatedCount < 2) {
            const zeroRotPieces = pieces.filter(p => p.rotation === 0);

            for (let i = zeroRotPieces.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [zeroRotPieces[i], zeroRotPieces[j]] = [zeroRotPieces[j], zeroRotPieces[i]];
            }

            for (let i = 0; i < 2 - rotatedCount; i++) {
                zeroRotPieces[i].rotation = Math.floor(Math.random() * 3) + 1;
            }
        }
    }

    function drawPieces() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const pieceWidth = canvas.width / 2;
        const pieceHeight = canvas.height / 2;

        pieces.forEach(piece => {
            const x = piece.col * pieceWidth;
            const y = piece.row * pieceHeight;

            ctx.save();
            ctx.translate(x + pieceWidth / 2, y + pieceHeight / 2);
            ctx.rotate(piece.rotation * Math.PI / 2);
            ctx.drawImage(piece.image, -pieceWidth / 2, -pieceHeight / 2, pieceWidth, pieceHeight);
            ctx.restore();

            ctx.strokeStyle = piece.isFixed ? '#10b981' : 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, pieceWidth, pieceHeight);
        });
    }

    function drawSolved() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(imageToLoad, 0, 0, canvas.width, canvas.height);
    }

    function checkWin() {
        return pieces.every(p => p.rotation === 0);
    }

    function handleCanvasClick(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const col = Math.floor(mouseX / (canvas.width / 2));
        const row = Math.floor(mouseY / (canvas.height / 2));

        const piece = pieces.find(p => p.col === col && p.row === row);

        if (piece && !piece.isFixed) {
            // Sonido de rotación
            playSound('rotate');

            if (e.button === 0) {
                piece.rotation = (piece.rotation + 3) % 4;
            } else if (e.button === 2) {
                piece.rotation = (piece.rotation + 1) % 4;
            }

            // Verificar si la pieza quedó en posición correcta
            if (piece.rotation === 0) {
                playSound('correct');
                piece.isFixed = true;
            }
            // Eliminado el sonido 'incorrect'

            drawPieces();

            if (checkWin()) {
                stopTimer();
                drawSolved();
                playSound('levelComplete');

                if (currentLevel < 6) {
                    showLevelComplete();
                } else {
                    showGameComplete();
                }
            }
        }
    }

    function applyHint() {
        const incorrectPiece = pieces.find(p => p.rotation !== 0 && !p.isFixed);

        if (incorrectPiece) {
            playSound('hint'); // Sonido de ayuda

            incorrectPiece.rotation = 0;
            incorrectPiece.isFixed = true;
            startTime -= 5000;
            updateTimer();
            hintBtn.disabled = true;

            playSound('correct'); // Sonido de pieza correcta
            drawPieces();

            if (checkWin()) {
                stopTimer();
                drawSolved();
                playSound('levelComplete');

                if (currentLevel < 6) {
                    showLevelComplete();
                } else {
                    showGameComplete();
                }
            }
        }
    }

    function showImagePreview(level) {
        previewLevel.textContent = level;
        previewMessage.textContent = 'Buscando imagen...';
        thumbnailsContainer.innerHTML = '';

        // Obtener imágenes de la temática seleccionada
        const currentImages = THEMES[selectedTheme];

        // Crear thumbnails
        currentImages.forEach((imgSrc, index) => {
            const img = document.createElement('img');
            img.src = imgSrc;
            img.classList.add('thumbnail');
            img.alt = `Imagen ${index + 1}`;
            thumbnailsContainer.appendChild(img);
        });

        previewModal.style.display = 'flex';

        animateSelection();
    }

    function animateSelection() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        let counter = 0;
        const maxIterations = 15;
        const interval = 100;

        const levelToPlay = parseInt(previewLevel.textContent);

        const animationInterval = setInterval(() => {
            thumbnails.forEach(thumb => thumb.classList.remove('selected'));

            const currentImages = THEMES[selectedTheme];
            const randomIndex = Math.floor(Math.random() * currentImages.length);
            thumbnails[randomIndex].classList.add('selected');

            counter++;

            if (counter >= maxIterations) {
                clearInterval(animationInterval);
                selectedImageIndex = randomIndex;
                previewMessage.textContent = '¡Esta será tu imagen!';

                setTimeout(() => {
                    previewModal.style.display = 'none';
                    statusBar.style.display = 'flex';
                    canvasContainer.style.display = 'block';
                    startLevel(levelToPlay);
                }, 1500);
            }
        }, interval);
    }

    function startLevel(level) {
        currentLevel = level;
        levelDisplay.textContent = currentLevel;

        if (level >= 4) {
            hintContainer.style.display = 'block';
            hintBtn.disabled = false;
        } else {
            hintContainer.style.display = 'none';
        }

        const currentImages = THEMES[selectedTheme];
        imageToLoad.src = currentImages[selectedImageIndex];

        imageToLoad.onload = () => {
            const levelConfig = LEVELS[level - 1];
            initPieces(levelConfig.filter);
            drawPieces();
            startTimer();
        };
    }

    function showLevelComplete() {
        setTimeout(() => {
            modalTitle.textContent = '¡Nivel Completado! 🎉';
            modalMessage.innerHTML = `<p>Tiempo del nivel: ${formatTime(Math.floor((Date.now() - startTime) / 1000))}</p>`;
            modalButtons.innerHTML = `
            <button id="next-level-btn" class="btn btn-primary btn-large">Siguiente Nivel ➜</button>
            <button id="back-menu-btn" class="btn btn-secondary">Menú Principal</button>
        `;

            resultModal.style.display = 'flex';

            document.getElementById('next-level-btn').onclick = () => {
                resultModal.style.display = 'none';
                showImagePreview(currentLevel + 1);
            };

            document.getElementById('back-menu-btn').onclick = () => {
                backToMenu();
            };
        }, 1000);
    }

    function showGameComplete() {
        setTimeout(() => {
            modalTitle.textContent = '🏆 ¡Felicidades! 🏆';
            modalMessage.innerHTML = `
        <p style="font-size: 1.2rem; margin: 20px 0;">
            <strong>¡Completaste todos los niveles!</strong>
        </p>
        <p style="font-size: 2rem; color: #10b981; font-weight: bold;">
            ${formatTime(totalTime)}
        </p>
        <p style="color: #6b7280;">Tiempo total</p>
    `;
            modalButtons.innerHTML = `
        <button id="play-again-btn" class="btn btn-primary btn-large">🔄 Volver a Jugar</button>
        <button id="back-menu-btn" class="btn btn-secondary">Menú Principal</button>
    `;

            resultModal.style.display = 'flex';

            document.getElementById('play-again-btn').onclick = () => {
                totalTime = 0;
                resultModal.style.display = 'none';
                showImagePreview(1);
            };

            document.getElementById('back-menu-btn').onclick = () => {
                backToMenu();
            };
        }, 1000);
    }

    function backToMenu() {
        resultModal.style.display = 'none';
        statusBar.style.display = 'none';
        canvasContainer.style.display = 'none';
        hintContainer.style.display = 'none';
        menuScreen.style.display = 'flex';

        stopTimer();
        currentLevel = 0;
        totalTime = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // --- EVENT LISTENERS ---
    playBtn.addEventListener('click', () => {
        playSound('click');
        menuScreen.style.display = 'none';
        instructionsModal.style.display = 'flex';
    });

    const continueToThemeBtn = document.getElementById('continue-to-theme-btn');
    continueToThemeBtn.addEventListener('click', () => {
        playSound('click');
        instructionsModal.style.display = 'none';
        themeModal.style.display = 'flex';
    });

    // Selección de temática
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            playSound('click');
            document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            selectedTheme = option.dataset.theme;
        });
    });

    startGameBtn.addEventListener('click', () => {
        playSound('click');
        themeModal.style.display = 'none';
        showImagePreview(1);
    });

    menuBtn.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres volver al menú? Perderás el progreso.')) {
            playSound('click');
            backToMenu();
        }
    });

    hintBtn.addEventListener('click', applyHint);
    canvas.addEventListener('mousedown', handleCanvasClick);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    window.addEventListener('resize', () => {
        if (currentLevel > 0) {
            drawPieces();
        }
    });

    canvas.width = 600;
    canvas.height = 600;
});

// Resto del código (galería, scroll, etc.)
const backToTopButton = document.getElementById('back-to-top');
if (backToTopButton) {
    backToTopButton.classList.add('hidden');
}

function changeGalleryImage(thumbnail) {
    const mainImage = document.getElementById('main-gallery-image');
    mainImage.style.opacity = '0';

    setTimeout(() => {
        mainImage.src = thumbnail.src;
        mainImage.style.opacity = '1';
    }, 150);

    const thumbnails = document.querySelectorAll('.gallery-thumb');
    thumbnails.forEach(thumb => {
        thumb.classList.remove('gallery-thumb-active');
    });

    thumbnail.classList.add('gallery-thumb-active');
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.addEventListener('scroll', function () {
    const backToTopButton = document.getElementById('back-to-top');

    if (window.scrollY > 300) {
        backToTopButton.classList.remove('hidden');
    } else {
        backToTopButton.classList.add('hidden');
    }
});