const scenes = [
    { image: "", text: "Di suatu hari, di sebuah kediaman yang sangat tenang..." },
    { image: "kopitumpah.png", text: "<b>PLAKK!!</b> Tanpa sengaja... secangkir kopi yang lezat tumpah ke meja." },
    { image: "kucingsedih.png", text: "Meow... (Kopi-ku... habis...)" },
    { image: "plis.png", text: "Tapi tunggu... masih ada harapan!<br>Ayo bantu Pawpi mengumpulkan kopi lagi!<br>kumpulkan minimal 10 ☕️ dan aku akan mentraktir kamu kopi 🤗<br>tap layar untuk melompat, double tap untuk lompat 2 kali" }
];

let currentScene = 0;
const sceneImage = document.getElementById("sceneImage");
const sceneText = document.getElementById("sceneText");
const btnBack = document.getElementById("btnBack");

// Fungsi update scene
function updateScene() {
    const scene = scenes[currentScene];
    sceneImage.style.display = scene.image ? "block" : "none"; // Sembunyikan gambar kalau gak ada
    sceneImage.src = scene.image;
    sceneText.innerHTML = scene.text;

    // Cek tombol back
    btnBack.style.display = currentScene === 0 ? "none" : "inline-block";
}

// Fungsi tombol Next
function nextScene() {
    if (currentScene < scenes.length - 1) {
        currentScene++;
        updateScene();
    } else {
        // Masuk loading dulu sebelum main.html
        document.body.innerHTML = '<img src="cat.gif" alt="Loading..." style="width: 100px; margin: auto;">';
        setTimeout(() => {
            window.location.href = "main.html";
        }, 2000);
    }
}

// Fungsi tombol Back
function prevScene() {
    if (currentScene > 0) {
        currentScene--;
        updateScene();
    }
}

// Fungsi tombol Skip All
function skipAll() {
    window.location.href = "main.html";
}

// Load scene pertama
updateScene();