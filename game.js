// Audio elements
const runSound = new Audio("runing.wav");
const meowSound = new Audio("meow.mp3");
const nabrakSound = new Audio("nabrak.mp3");
const backsound = new Audio("backsound.mp3");
const youwinSound = new Audio("youwin.mp3");
const youloseSound = new Audio("youlose.mp3");

// Fungsi untuk memutar suara
function playSound(sound) {
    sound.currentTime = 0; // Mulai dari awal
    sound.play();
}

// Fungsi untuk menghentikan suara
function stopSound(sound) {
    sound.pause();
    sound.currentTime = 0;
}

// Inisialisasi elemen-elemen DOM
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const bg = document.getElementById("bg");
const platform = document.getElementById("platform");
const catRun = document.getElementById("catRun");
const catJump = document.getElementById("catJump");
const kopiImg = document.getElementById("kopi");
const bola3Img = document.getElementById("bola3");
const bola4Img = document.getElementById("bola4");
const titleImg = document.getElementById("title");
const subtitleImg = document.getElementById("subtitle");
const scoreLeftDisplay = document.getElementById("score-left");
const scoreRightDisplay = document.getElementById("score-right");
const gameOverScreen = document.getElementById("game-over");
const startButton = document.getElementById("start-button");

// Ukuran canvas
canvas.width = window.innerWidth;
canvas.height = 320;

// Variabel game
let player;
let gravity = 0.4;
let bgX = 0,
    alasX = 0,
    speed = 3;
let obstacles = [];
let kopis = [];
let score = 0;
let distance = 0;
let gameOver = false;
let nextButton = null; // Deklarasi global


// Class Player
class Player {
    constructor() {
        this.x = 50;
        this.y = canvas.height - 150;
        this.w = 64;
        this.h = 50;
        this.dy = 0;
        this.jumpForce = 8;
        this.grounded = false;
        this.currentSprite = catRun;
        this.frameX = 0;
        this.frameSpeed = 6;
        this.frameCount = 0;
        this.totalFrames = 5;
        this.jumpCount = 0;
        this.maxJumps = 2;
    }

    getHitbox() {
        return {
            x: this.x + 25,
            y: this.y + 20,
            w: 15,
            h: 15,
        };
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.dy = -this.jumpForce;
            this.jumpCount++;
            this.currentSprite = catJump;
            this.totalFrames = 3;
            this.frameX = 0;
            playSound(meowSound); // Suara melompat
        }
    }

    update() {
        this.y += this.dy;
        if (this.y + this.h < canvas.height - 92) {
            this.dy += gravity;
        } else {
            this.dy = 0;
            this.grounded = true;
            this.y = canvas.height - 92 - this.h;
            this.jumpCount = 0;
            this.currentSprite = catRun;
            this.totalFrames = 5;
        }
        this.frameCount++;
        if (this.frameCount % this.frameSpeed === 0) {
            this.frameX = (this.frameX + 1) % this.totalFrames;
        }
        this.draw();
    }

    draw() {
        ctx.drawImage(
            this.currentSprite,
            this.frameX * 221,
            0,
            221,
            154,
            this.x,
            this.y,
            this.w,
            this.h
        );
    }
}

// Class Kopi
class Kopi {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.w = 45;
        this.h = 45;
    }

    getHitbox() {
        return {
            x: this.x - 2.5,
            y: this.y - 2.5,
            w: this.w + 5,
            h: this.h + 5,
        };
    }

    update() {
        this.x -= speed;
        if (this.x + this.w < 0) kopis.shift();
        this.draw();
    }

    draw() {
        ctx.drawImage(kopiImg, this.x, this.y, this.w, this.h);
    }
}

// Class BolaAnim
class BolaAnim {
    constructor(x, sprite) {
        this.x = x;
        this.w = 30;
        this.h = 30;
        this.y = canvas.height - 93 - this.h + 4;
        this.sprite = sprite;
        this.frameX = 0;
        this.frameSpeed = 6;
        this.frameCount = 0;
        this.totalFrames = 10;
    }

    getHitbox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            w: this.w - 10,
            h: this.h - 10,
        };
    }

    update() {
        this.x -= speed;
        if (this.x + this.w < 0) obstacles.shift();
        this.draw();
    }

    draw() {
        ctx.drawImage(
            this.sprite,
            this.frameX * 50.6,
            0,
            50.6,
            50,
            this.x,
            this.y,
            this.w,
            this.h
        );
        this.frameCount++;
        if (this.frameCount % this.frameSpeed === 0) {
            this.frameX = (this.frameX + 1) % this.totalFrames;
        }
    }
}

// Fungsi spawn bola
function spawnBola() {
    if (obstacles.length < 2) {
        let lastBolaX = obstacles.length ? obstacles[obstacles.length - 1].x : 0;
        let newX = lastBolaX + 2 * canvas.width + Math.random() * 200;
        const randomSprite = Math.random() < 0.5 ? bola3Img : bola4Img;
        obstacles.push(new BolaAnim(newX, randomSprite));
    }
}

// Fungsi spawn kopi
function spawnKopi() {
    if (kopis.length < 2 && Math.random() < 0.02) {
        let y = Math.random() < 0.5 ? canvas.height - 142 : canvas.height - 200;
        kopis.push(new Kopi(canvas.width, y));
    }
}

// Fungsi cek tabrakan
function checkCollision(a, b) {
    const collision =
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y;
    if (collision) {
        playSound(nabrakSound); // Suara tabrakan
    }
    return collision;
}

// Fungsi update game
function update() {
    if (gameOver) return;

    // Mainkan suara lari jika pemain di tanah
    if (player.grounded) {
        if (runSound.paused) playSound(runSound);
    } else {
        stopSound(runSound);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar background dan platform
    bgX -= speed;
    alasX -= speed;
    if (bgX <= -bg.width) bgX = 0;
    if (alasX <= -platform.width) alasX = 0;
    ctx.drawImage(bg, bgX, 0, bg.width, 320);
    ctx.drawImage(bg, bgX + bg.width, 0, bg.width, 320);
    ctx.drawImage(platform, alasX, canvas.height - 92, platform.width, 92);
    ctx.drawImage(platform, alasX + platform.width, canvas.height - 92, platform.width, 92);

    // Update pemain
    player.update();

    // Spawn bola dan kopi
    spawnBola();
    spawnKopi();

    // Update bola
    obstacles.forEach((bola) => {
        bola.update();
        if (checkCollision(player.getHitbox(), bola.getHitbox())) {
            gameOver = true;
            gameOverScreenDisplay();
        }
    });

    // Update kopi
    kopis.forEach((kopi, index) => {
        if (checkCollision(player.getHitbox(), kopi.getHitbox())) {
            kopis.splice(index, 1);
            score++;
            scoreRightDisplay.innerText = `☕ ${score}`;
        }
        kopi.update();
    });

    // Update jarak
    distance += speed / 10;
    scoreLeftDisplay.innerText = `Distance: ${Math.floor(distance)}`;

    requestAnimationFrame(update);
}

// Fungsi tampilan layar Game Over

function gameOverScreenDisplay() {
    stopSound(runSound);
    stopSound(backsound);
    const isWin = score >= 10;
    gameOverScreen.classList.remove("hidden");
  
    // Gambar background hitam transparan SEBAGAI LAPISAN PALING BAWAH
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Bersihkan canvas agar tidak ada elemen lain
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Judul You Win / You Lose (DI ATAS MASK)
    ctx.font = "48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "You Win!" : "You Lose!", canvas.width / 2, canvas.height / 2 - 100);
  
    // Informasi skor dan jarak (DI ATAS MASK)
    ctx.font = "24px Arial";
    ctx.fillText(`Score: ☕ ${score}`, canvas.width / 2, canvas.height / 2 - 50);
    ctx.fillText(`Distance: ${Math.floor(distance)}`, canvas.width / 2, canvas.height / 2 - 20);
  
    // Pesan motivasi (DI ATAS MASK)
    ctx.font = "18px Arial";
    if (isWin) {
      ctx.fillText("Yeay kamu menang 🏆✨✨", canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText("jangan lupa screenshoot kirim ke aku yaa", canvas.width / 2, canvas.height / 2 + 40);
      ctx.fillText("Nanti aku beliin 1 kopi spesial buat kamu (˵ •̀ ᴗ - ˵ ) ✧", canvas.width / 2, canvas.height / 2 + 70);
    } else {
      ctx.fillText("Yahh kamu belum beruntung coba lagi yaa,", canvas.width / 2, canvas.height / 2 + 20);
      ctx.fillText("semangat cantikk 💪💖", canvas.width / 2, canvas.height / 2 + 50);
    }
  
    // Tombol Try Again (DI HTML, BUKAN DI CANVAS)
    const tryAgainButton = document.createElement("button");
    tryAgainButton.innerText = "Try Again";
    tryAgainButton.classList.add("game-over-button");
    tryAgainButton.onclick = () => {
        document.body.removeChild(tryAgainButton); // Hapus tombol Try Again
        if (nextButton) { // Hapus tombol Next jika ada
            document.body.removeChild(nextButton);
            nextButton = null; // Reset variabel global
        }
        startGame(); // Mulai ulang permainan
    };
    document.body.appendChild(tryAgainButton);
  
    // Tombol Next (hanya muncul jika menang, DI HTML, BUKAN DI CANVAS)
    if (isWin) {
        nextButton = document.createElement("button"); // Gunakan variabel global
        nextButton.innerText = "Next";
        nextButton.classList.add("game-over-button");
        nextButton.onclick = () => {
            window.location.href = "hati.html"; // Arahkan ke halaman ending
        };
        document.body.appendChild(nextButton);
    }
  
    // Putar suara sesuai hasil
    playSound(isWin ? youwinSound : youloseSound);
  }

// Fungsi mulai game
function startGame() {
  // Hentikan suara sebelumnya
  stopSound(youwinSound);
  stopSound(youloseSound);
  playSound(backsound);

    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOverScreen.classList.add("hidden");
  // Reset variabel game
  gameOver = false;
  score = 0;
  distance = 0;
  obstacles = [];
  kopis = [];
  player = new Player();

  // Bersihkan canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Mulai countdown
  let countdown = 3;
  const countdownInterval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "48px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);
      countdown--;

      if (countdown < 0) {
          clearInterval(countdownInterval);
          update(); // Mulai game loop
      }
  }, 1000);
}

// Event listener untuk tombol start
startButton.addEventListener("click", () => {
    startButton.style.display = "none";
    startGame();
});

// Event listener untuk lompat
document.addEventListener("keydown", (e) => {
    if ((e.code === "Space" || e.code === "ArrowUp") && !gameOver) {
        player.jump();
    }
});

document.addEventListener("touchstart", () => {
    if (!gameOver) {
        player.jump();
    }
});

